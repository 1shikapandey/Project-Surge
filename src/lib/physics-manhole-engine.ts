import { CityId, CITIES, DrainageNode, getCityDataset } from './mock-data';
import { getElevationAtCoordinate } from './dem-service';
import { getCityTideData } from './tide-service';

export interface PhysicsManhole extends DrainageNode {
  cityId: CityId;
  roadId: string;
  roadName: string;
  highwayCategory?: string;
  isGalli?: boolean;
  rimElevationMeters: number;
  pipeDiameterMm: number;
  pipeSlopePct: number;
  manningsN: number;
  designCapacityLps: number;
  inflowRunoffLps: number;
  upstreamRunoffLps: number;
  surchargeHeadMeters: number;
  surfaceOverflowDepthCm: number;
  overflowRateLps: number;
  backpressureFactor: number;
  hydraulicCapacityPct: number;
  derivedLocationLabel: string;
}

/**
 * Calculates distance between two [lat, lng] coordinates in meters using Haversine formula
 */
function getDistanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // Radius of Earth in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculates Manning's full-pipe flow capacity Q_cap in Liters Per Second (L/s)
 * Q_cap = (1/n) * A * R^(2/3) * S^(1/2)
 * Where n = Manning's roughness, A = pi*D^2/4, R = D/4, S = slope
 */
export function calculateManningsCapacityLps(
  diameterMm: number,
  slopePct: number,
  manningsN: number = 0.013
): number {
  const D = diameterMm / 1000; // diameter in meters
  const A = (Math.PI * D * D) / 4; // Cross-sectional area (m^2)
  const R = D / 4; // Hydraulic radius for circular pipe running full (m)
  const S = Math.max(0.001, slopePct / 100); // Minimum hydraulic energy slope 0.1%

  // Flow capacity in m^3/s
  const Q_m3s = (1 / manningsN) * A * Math.pow(R, 2 / 3) * Math.sqrt(S);

  // Convert m^3/s to L/s (1 m^3/s = 1000 L/s)
  return Math.round(Q_m3s * 1000 * 10) / 10;
}

/**
 * Derives manhole spatial network strictly aligned with authentic road centerlines and gallis (lanes).
 * Eliminates random chord cuts across buildings and predicts hydraulic surcharge using Manning's equation,
 * rational runoff, chamber surcharge head, and surface overflow.
 */
export function getPhysicsDerivedManholes(
  cityId: CityId,
  timeOffsetMins: number = 60,
  baseRainRateMmHr: number = 45.0
): PhysicsManhole[] {
  const dataset = getCityDataset(cityId);
  const derivedManholes: PhysicsManhole[] = [];

  // 1. Live tide / river stage backpressure state
  const tideInfo = getCityTideData(cityId, timeOffsetMins, baseRainRateMmHr);
  const globalBackpressure = tideInfo.outfallBackpressureCoeff; // 0.0 to 1.0

  // 2. Dynamic rainfall intensity curve across forecast scrubber [0..180 mins]
  const rainTimeFactor = Math.sin((Math.min(180, Math.max(0, timeOffsetMins)) / 180) * Math.PI);
  const dynamicRainRate = baseRainRateMmHr * (0.45 + 1.15 * rainTimeFactor);

  let globalMhCount = 1;

  dataset.roads.forEach((road) => {
    const coords = road.coordinates;
    if (coords.length < 2) return;

    const isGalli = road.highwayCategory === 'Galli / Local Lane' || road.id.startsWith('galli-');

    // Extract road-aligned placement points along authentic polyline vertices and verified intervals
    const roadAlignedPoints: { lat: number; lng: number; chainageMeters: number; pointType: string }[] = [];
    let cumulativeDistance = 0;

    for (let i = 0; i < coords.length; i++) {
      const current = coords[i];

      if (i === 0) {
        roadAlignedPoints.push({
          lat: current[0],
          lng: current[1],
          chainageMeters: 0,
          pointType: isGalli ? 'Galli Entrance Junction' : 'Road Junction Catchpit'
        });
        continue;
      }

      const prev = coords[i - 1];
      const segDist = getDistanceMeters(prev[0], prev[1], current[0], current[1]);

      // If segment between adjacent vertices is long, add strictly-collinear intermediate point
      // In gallis, spacing is tight (25-40m) to catch rapid surface runoff
      const maxSpacing = isGalli ? 45 : 85;
      if (segDist > maxSpacing) {
        const intermediateCount = Math.min(2, Math.floor(segDist / maxSpacing));
        for (let step = 1; step <= intermediateCount; step++) {
          const frac = step / (intermediateCount + 1);
          roadAlignedPoints.push({
            lat: prev[0] + (current[0] - prev[0]) * frac,
            lng: prev[1] + (current[1] - prev[1]) * frac,
            chainageMeters: Math.round(cumulativeDistance + segDist * frac),
            pointType: isGalli ? 'Mid-Galli Gully Trap' : 'Arterial Storm Inflow'
          });
        }
      }

      cumulativeDistance += segDist;
      roadAlignedPoints.push({
        lat: current[0],
        lng: current[1],
        chainageMeters: Math.round(cumulativeDistance),
        pointType:
          i === coords.length - 1
            ? isGalli
              ? 'Galli Outfall Confluence'
              : 'Trunk Culvert Chamber'
            : isGalli
            ? 'Galli Bend Inspection Pit'
            : 'Roadway Manhole Chamber'
      });
    }

    // Now instantiate physics manholes at every road-aligned point
    roadAlignedPoints.forEach((pt, pIdx) => {
      const lat = pt.lat;
      const lng = pt.lng;

      // 3. CartoDEM v3 Rim elevation lookup (Ground Elevation z_rim)
      const rimElevationMeters = getElevationAtCoordinate(lat, lng, cityId);

      // 4. Invert depth: Gallis have shallower chambers (1.6m - 2.5m); major trunk lines have deeper shafts (3.0m - 4.5m)
      const invertDepthMeters = isGalli
        ? Math.max(1.5, Math.min(2.5, 2.8 - rimElevationMeters * 0.15))
        : Math.max(2.0, Math.min(4.5, 4.2 - rimElevationMeters * 0.08));
      const z_invert = rimElevationMeters - invertDepthMeters;

      // 5. Pipe parameters:
      // Gallis have smaller feeder culverts (450mm - 600mm) with higher roughness n=0.015 (brick/masonry)
      // Main corridors have 900mm - 1200mm smooth concrete conduits (n=0.013)
      const pipeDiameterMm = isGalli ? (rimElevationMeters < 2.0 ? 600 : 450) : rimElevationMeters < 3.0 ? 1200 : 900;
      const manningsN = isGalli ? 0.015 : 0.013;
      const slopePct = Math.max(0.2, Math.min(1.8, 0.85 / Math.max(0.6, rimElevationMeters)));

      const designCapacityLps = calculateManningsCapacityLps(pipeDiameterMm, slopePct, manningsN);

      // 6. Tributary Catchment Footprint per Inlet:
      // Gallis have high roof & pavement runoff concentration per chamber ~ 6,000 - 12,000 m^2
      // Main roads have wide arterial footprint ~ 22,000 - 36,000 m^2
      const catchmentAreaM2 = isGalli
        ? 8500 + Math.sin(lat * 180 + lng * 180) * 2500
        : 26000 + Math.sin(lat * 120 + lng * 120) * 8000;
      const runoffCoeff = isGalli ? 0.90 : 0.85; // Gallis are virtually 100% paved/impervious
      const inflowRunoffLps =
        Math.round(((runoffCoeff * dynamicRainRate * catchmentAreaM2) / 3600) * 10) / 10;

      // Upstream cumulative runoff cascading along the slope
      const upstreamRunoffLps = pIdx > 0 ? Math.round(pIdx * 0.06 * inflowRunoffLps * 10) / 10 : 0;
      const totalInflowLps = inflowRunoffLps + upstreamRunoffLps;

      // 7. Localized Outfall Backpressure
      const elevationBackpressure =
        rimElevationMeters < 2.5
          ? Math.min(1.0, globalBackpressure * 1.4)
          : globalBackpressure * 0.55;
      const totalBackpressureFactor = Math.round(elevationBackpressure * 100) / 100;

      // 8. Hydraulic Capacity Percentage
      const rawCapacityRatio = (totalInflowLps / Math.max(1, designCapacityLps)) * (1 + totalBackpressureFactor);
      const hydraulicCapacityPct = Math.round(rawCapacityRatio * 100);

      // 9. Manhole Chamber Surcharge Head
      const surchargeHeadMeters = z_invert + rawCapacityRatio * (invertDepthMeters / 1.25);

      // 10. Surface Overflow Criterion
      let surfaceOverflowDepthCm = 0;
      let overflowRateLps = 0;
      if (surchargeHeadMeters > rimElevationMeters) {
        surfaceOverflowDepthCm = Math.round((surchargeHeadMeters - rimElevationMeters) * 100);
        overflowRateLps = Math.round(
          Math.max(0, totalInflowLps - designCapacityLps) * (1 + totalBackpressureFactor)
        );
      }

      // 11. Status Determination
      let status: DrainageNode['status'] = 'normal';
      if (surfaceOverflowDepthCm > 0 || hydraulicCapacityPct >= 120) {
        status = 'surcharging_backflow';
      } else if (hydraulicCapacityPct >= 100) {
        status = 'surcharging_backflow';
      } else if (hydraulicCapacityPct >= 70) {
        status = 'capacity_warning';
      }

      // 12. Surcharge timeline for UI charts
      const surchargeTimelinePct = [0, 15, 30, 45, 60, 90, 120, 150, 180].map((t) => {
        const tFactor = Math.sin((t / 180) * Math.PI);
        return Math.round(hydraulicCapacityPct * (0.35 + 0.85 * tFactor));
      });

      const cityPrefix = cityId.toUpperCase();
      const codeSuffix = isGalli ? `G${(pIdx + 1).toString().padStart(2, '0')}` : `${globalMhCount.toString().padStart(3, '0')}`;
      const mhId = `mh-${cityId}-${road.id}-${pIdx + 1}`;
      const mhName = isGalli
        ? `MH-${cityPrefix}-${road.id.replace('galli-', '').toUpperCase().slice(0, 4)}-${codeSuffix}`
        : `MH-${cityPrefix}-${codeSuffix}`;

      const derivedLocationLabel = `${road.name} • ${pt.pointType} (Ch. ${pt.chainageMeters}m)`;

      derivedManholes.push({
        id: mhId,
        name: mhName,
        lat,
        lng,
        type: 'manhole',
        invertDepthMeters: Math.round(invertDepthMeters * 10) / 10,
        capacityLps: designCapacityLps,
        surchargeTimelinePct,
        status,
        cityId,
        roadId: road.id,
        roadName: road.name,
        highwayCategory: road.highwayCategory,
        isGalli,
        rimElevationMeters: Math.round(rimElevationMeters * 10) / 10,
        pipeDiameterMm,
        pipeSlopePct: Math.round(slopePct * 100) / 100,
        manningsN,
        designCapacityLps,
        inflowRunoffLps,
        upstreamRunoffLps,
        surchargeHeadMeters: Math.round(surchargeHeadMeters * 100) / 100,
        surfaceOverflowDepthCm,
        overflowRateLps,
        backpressureFactor: totalBackpressureFactor,
        hydraulicCapacityPct,
        derivedLocationLabel
      });

      globalMhCount++;
    });
  });

  return derivedManholes;
}

/**
 * Compatibility alias
 */
export const getDerivedCityManholes = getPhysicsDerivedManholes;

/**
 * Returns top surcharging or overflowing manholes ordered by hydraulic stress
 */
export function getTopSurchargingManholes(
  cityId: CityId,
  limit: number = 8,
  timeOffsetMins: number = 60
): PhysicsManhole[] {
  const allManholes = getPhysicsDerivedManholes(cityId, timeOffsetMins);
  return allManholes
    .sort((a, b) => b.hydraulicCapacityPct - a.hydraulicCapacityPct)
    .slice(0, limit);
}
