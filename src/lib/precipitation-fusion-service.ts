/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PRECIPITATION FUSION SERVICE — Multi-Source Precedence & Nowcasting Layer
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Orchestrates multi-source precipitation data:
 *   1. PRIMARY:  Live radar motion-vector advection extrapolation
 *   2. SECONDARY: Wind vector cross-check & wind-advection gap-filler
 *   3. TERTIARY:  Open-Meteo longer-range forecast & divergence cross-validation
 *   4. FALLBACK:  Open-Meteo forecast API when radar is 100% unavailable
 *
 * Every timestep in the 0-3hr nowcast timeline carries an explicit confidence score
 * and tier ('high' | 'medium' | 'low') reflecting compounding spatial uncertainty over time.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { CityId } from './mock-data';
import {
  fetchRadarPrecipitation,
  CONFIDENCE_THRESHOLD,
  RadarPrecipitationResult,
  RadarMotionVector,
  STATION_PALETTES,
} from './radar-imagery-service';
import {
  fetchOpenMeteoLivePrecipitation,
  OpenMeteoPrecipitationData,
} from './openmeteo-service';

// ---------------------------------------------------------------------------
// EXPORTED TYPES
// ---------------------------------------------------------------------------

export type PrecipitationSourceType = 'radar' | 'openmeteo_fallback' | 'unavailable';

export type NowcastMethodType =
  | 'radar_motion_advection'
  | 'wind_advection_gapfill'
  | 'persistence_fallback'
  | 'openmeteo_fallback';

export interface FusedNowcastStep {
  timeOffsetMins: number; // 0, 15, 30, 45, 60, 90, 120, 150, 180
  timeLabel: string;
  precipitationMmHr: number;
  confidenceScore: number; // 0.0 – 1.0
  confidenceTier: 'high' | 'medium' | 'low';
  nowcastMethod: NowcastMethodType;
  uncertaintyRangeMmHr: [number, number]; // [min, max]
}

export interface FusedPrecipitationData {
  cityId: CityId;
  source: PrecipitationSourceType;
  lastUpdated: string;
  confidence: number; // Overall base confidence
  currentPrecipitationMmHr: number;
  /** 9-step scalar timeline for backwards compatibility */
  nowcastTimelineMmHr: number[];
  /** Full structured timestepped nowcast payload with per-step confidence */
  fusedNowcastTimeline: FusedNowcastStep[];
  weatherDescription: string;
  isDrySpell: boolean;
  /** Source metadata for the UI badge, routing, & SCADA controllers */
  sourceMetadata: {
    active: PrecipitationSourceType;
    radarStationCode: string | null;
    radarFreshness: 'fresh' | 'stale' | 'unavailable';
    radarConfidence: number | null;
    radarLastUpdated: string | null;
    motionVector: RadarMotionVector | null;
    nowcastMethod: NowcastMethodType;
    radarWindDisagreement: boolean;
    windDirectionDeg: number | null;
    windSpeedKmh: number | null;
    openMeteoDivergencePct: number | null;
    openMeteoAvailable: boolean;
    openMeteoSource: string | null;
  };
  windSpeedKmh?: number;
  windDirectionDeg?: number;
  cloudCoverPct?: number;
}

// ---------------------------------------------------------------------------
// RADAR FRESHNESS CHECK
// ---------------------------------------------------------------------------

const RADAR_FRESHNESS_WINDOW_MS = 12 * 60 * 1000; // 12 minutes (for 10-minute fetch cadence)

function isRadarFresh(result: RadarPrecipitationResult): boolean {
  const age = Date.now() - new Date(result.lastUpdated).getTime();
  return age <= RADAR_FRESHNESS_WINDOW_MS;
}

// ---------------------------------------------------------------------------
// WIND GAP-FILL ADVECTION NOWCAST GENERATION
// ---------------------------------------------------------------------------

/**
 * Generates an advection nowcast timeline using wind direction & speed as
 * substitute velocity vector when radar frame history is insufficient.
 */
function buildWindAdvectionNowcast(
  currentMmHr: number,
  windSpeedKmh: number,
  windDirDeg: number
): number[] {
  const availableTimes = [0, 15, 30, 45, 60, 90, 120, 150, 180];
  // Wind-driven displacement reduces local persistence slightly faster
  const windFactor = Math.min(1.5, Math.max(0.7, windSpeedKmh / 20.0));
  
  return availableTimes.map(t => {
    const decay = Math.exp(- (t / 75.0) * windFactor);
    return Number((currentMmHr * decay).toFixed(1));
  });
}

// ---------------------------------------------------------------------------
// MAIN FUSION FUNCTION
// ---------------------------------------------------------------------------

export async function fetchFusedPrecipitation(
  cityId: CityId
): Promise<FusedPrecipitationData> {
  // 1. Fetch radar precipitation (enforces rate limit & rolling history)
  let radarResult: RadarPrecipitationResult | null = null;
  try {
    radarResult = await fetchRadarPrecipitation(cityId);
  } catch (err) {
    console.warn(`[Fusion] Radar fetch threw for ${cityId}:`, err);
  }

  const radarUsable =
    radarResult !== null &&
    isRadarFresh(radarResult) &&
    radarResult.confidence >= CONFIDENCE_THRESHOLD;

  // 2. Fetch Open-Meteo live weather data & forecast
  let openMeteoData: OpenMeteoPrecipitationData | null = null;
  try {
    openMeteoData = await fetchOpenMeteoLivePrecipitation(cityId);
  } catch (err) {
    console.warn(`[Fusion] Open-Meteo fetch threw for ${cityId}:`, err);
  }

  const windSpeedKmh = openMeteoData?.windSpeedKmh ?? 15.0;
  const windDirectionDeg = openMeteoData?.windDirectionDeg ?? 110;

  // 3. Apply Fusion Strategy
  if (radarUsable && radarResult) {
    let nowcastTimelineMmHr = radarResult.nowcastTimelineMmHr;
    let nowcastMethod: NowcastMethodType = radarResult.nowcastMethod;
    let baseConfidence = radarResult.confidence;
    let radarWindDisagreement = false;

    // FUSION OVERRIDE: If radar yields 0.0mm rain but Open-Meteo detects active rainfall,
    // we only fuse Open-Meteo if radar confidence is somewhat low (< 50%).
    // If radar is highly confident (> 50%), trust the live radar (it's not raining!).
    const shouldFallbackToForecast = radarResult.currentPrecipitationMmHr <= 0.5 && 
                                     openMeteoData && 
                                     openMeteoData.currentPrecipitationMmHr > 0.5 &&
                                     baseConfidence < 0.50;

    const effectiveCurrentRain = shouldFallbackToForecast
      ? (openMeteoData?.currentPrecipitationMmHr || 0)
      : Math.max(radarResult.currentPrecipitationMmHr, 0);

    if (shouldFallbackToForecast && openMeteoData) {
      console.log(`[Fusion] Radar precipitation is 0.0mm but confidence is low (${baseConfidence}). Open-Meteo detects ${openMeteoData.currentPrecipitationMmHr}mm/hr rain. Fusing Open-Meteo telemetry.`);
      nowcastTimelineMmHr = openMeteoData.nowcastTimelineMmHr;
      nowcastMethod = 'openmeteo_fallback';
    }

    // (A) PART 2: WIND CROSS-CHECK & GAP-FILL
    if (radarResult.motionVector && radarResult.motionVector.speedKmh > 2.0) {
      // Cross-check radar motion vector direction vs observed wind direction
      const diffRad = Math.abs(radarResult.motionVector.directionDeg - windDirectionDeg) * (Math.PI / 180);
      const angleDiff = Math.abs(Math.atan2(Math.sin(diffRad), Math.cos(diffRad))) * (180 / Math.PI);

      if (angleDiff > 45) {
        radarWindDisagreement = true;
        baseConfidence *= 0.82; // Reduce confidence due to directional mismatch
        console.log(
          `[Fusion] ⚠️ Radar motion (${radarResult.motionVector.directionDeg}°) & ` +
          `Wind direction (${windDirectionDeg}°) disagree by ${angleDiff.toFixed(0)}°. Scaling confidence.`
        );
      }
    } else if (nowcastMethod === 'persistence_fallback' && windSpeedKmh > 8.0) {
      // Gap-fill using wind vector advection when radar motion vector is unavailable
      nowcastTimelineMmHr = buildWindAdvectionNowcast(
        effectiveCurrentRain,
        windSpeedKmh,
        windDirectionDeg
      );
      nowcastMethod = 'wind_advection_gapfill';
      console.log(`[Fusion] Using Wind Advection Gap-Fill for ${cityId} (${windSpeedKmh} km/h @ ${windDirectionDeg}°).`);
    }

    // (B) PART 3: OPEN-METEO LONGER-RANGE CROSS-VALIDATION & DIVERGENCE
    let openMeteoDivergencePct: number | null = null;
    if (openMeteoData && openMeteoData.nowcastTimelineMmHr.length >= 9) {
      const radarVolume = nowcastTimelineMmHr.slice(0, 9).reduce((a, b) => a + b, 0);
      const openMeteoVolume = openMeteoData.nowcastTimelineMmHr.slice(0, 9).reduce((a, b) => a + b, 0);

      const maxVol = Math.max(radarVolume, openMeteoVolume);
      if (maxVol > 3.0) {
        const divRatio = Math.abs(radarVolume - openMeteoVolume) / maxVol;
        openMeteoDivergencePct = Number((divRatio * 100).toFixed(1));

        if (divRatio > 0.50) {
          baseConfidence *= 0.85; // Scale down confidence on high divergence
          console.warn(
            `[Fusion] ⚠️ High divergence between radar nowcast (${radarVolume.toFixed(1)}mm) ` +
            `and Open-Meteo (${openMeteoVolume.toFixed(1)}mm) for ${cityId}: ${openMeteoDivergencePct}% divergence. Blending max rain rates.`
          );
        }
      }
    }

    // (C) PART 4: PER-TIMESTEP CONFIDENCE DEGRADATION & UNCERTAINTY RANGES
    const availableTimes = [0, 15, 30, 45, 60, 90, 120, 150, 180];
    const timeDecayFactors = [1.0, 0.95, 0.90, 0.82, 0.74, 0.60, 0.48, 0.36, 0.25];

    const fusedNowcastTimeline: FusedNowcastStep[] = availableTimes.map((t, idx) => {
      const stepPrecip = nowcastTimelineMmHr[idx] ?? 0;
      const stepConf = Number((baseConfidence * timeDecayFactors[idx]).toFixed(3));

      let confidenceTier: 'high' | 'medium' | 'low' = 'high';
      if (stepConf < 0.45) confidenceTier = 'low';
      else if (stepConf < 0.75) confidenceTier = 'medium';

      // Uncertainty range expands over lead time
      const margin = stepPrecip * (1.0 - stepConf) * 0.8;
      const minVal = Number(Math.max(0, stepPrecip - margin).toFixed(1));
      const maxVal = Number((stepPrecip + margin).toFixed(1));

      const hours = Math.floor(t / 60);
      const mins = t % 60;
      const timeLabel = `+${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} (T+${t}m)`;

      return {
        timeOffsetMins: t,
        timeLabel,
        precipitationMmHr: stepPrecip,
        confidenceScore: stepConf,
        confidenceTier,
        nowcastMethod,
        uncertaintyRangeMmHr: [minVal, maxVal],
      };
    });

    return {
      cityId,
      source: nowcastMethod === 'openmeteo_fallback' ? 'openmeteo_fallback' : 'radar',
      lastUpdated: radarResult.lastUpdated,
      confidence: Number(baseConfidence.toFixed(3)),
      currentPrecipitationMmHr: effectiveCurrentRain,
      nowcastTimelineMmHr,
      fusedNowcastTimeline,
      weatherDescription: describeRainfallRate(effectiveCurrentRain),
      isDrySpell: effectiveCurrentRain === 0,
      sourceMetadata: {
        active: nowcastMethod === 'openmeteo_fallback' ? 'openmeteo_fallback' : 'radar',
        radarStationCode: radarResult.stationCode,
        radarFreshness: 'fresh',
        radarConfidence: radarResult.confidence,
        radarLastUpdated: radarResult.lastUpdated,
        motionVector: radarResult.motionVector || null,
        nowcastMethod,
        radarWindDisagreement,
        windDirectionDeg,
        windSpeedKmh,
        openMeteoDivergencePct,
        openMeteoAvailable: openMeteoData !== null,
        openMeteoSource: openMeteoData?.source || null,
      },
      windSpeedKmh: openMeteoData?.windSpeedKmh,
      windDirectionDeg: openMeteoData?.windDirectionDeg,
      cloudCoverPct: openMeteoData?.cloudCoverPct,
    };
  }

  // 4. OPEN-METEO FALLBACK (when radar is offline or low confidence)
  if (openMeteoData) {
    const fallbackReason = radarResult
      ? `radar confidence too low (${(radarResult.confidence * 100).toFixed(1)}% < ${CONFIDENCE_THRESHOLD * 100}%)`
      : 'radar fetch failed or unavailable';

    console.log(`[Fusion] Using OPEN-METEO FALLBACK for ${cityId} — ${fallbackReason}`);

    const availableTimes = [0, 15, 30, 45, 60, 90, 120, 150, 180];
    const openMeteoDecayFactors = [0.60, 0.58, 0.55, 0.50, 0.45, 0.38, 0.30, 0.22, 0.15];

    const fusedNowcastTimeline: FusedNowcastStep[] = availableTimes.map((t, idx) => {
      const stepPrecip = openMeteoData.nowcastTimelineMmHr[idx] ?? 0;
      const stepConf = openMeteoDecayFactors[idx];
      const confidenceTier: 'high' | 'medium' | 'low' = stepConf >= 0.45 ? 'medium' : 'low';

      const margin = stepPrecip * 0.4;
      const minVal = Number(Math.max(0, stepPrecip - margin).toFixed(1));
      const maxVal = Number((stepPrecip + margin).toFixed(1));

      const hours = Math.floor(t / 60);
      const mins = t % 60;
      const timeLabel = `+${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} (T+${t}m)`;

      return {
        timeOffsetMins: t,
        timeLabel,
        precipitationMmHr: stepPrecip,
        confidenceScore: stepConf,
        confidenceTier,
        nowcastMethod: 'openmeteo_fallback',
        uncertaintyRangeMmHr: [minVal, maxVal],
      };
    });

    return {
      cityId,
      source: 'openmeteo_fallback',
      lastUpdated: openMeteoData.timestamp,
      confidence: 0.50,
      currentPrecipitationMmHr: openMeteoData.currentPrecipitationMmHr,
      nowcastTimelineMmHr: openMeteoData.nowcastTimelineMmHr,
      fusedNowcastTimeline,
      weatherDescription: openMeteoData.weatherDescription,
      isDrySpell: openMeteoData.isDrySpell,
      sourceMetadata: {
        active: 'openmeteo_fallback',
        radarStationCode: radarResult?.stationCode || null,
        radarFreshness: radarResult ? (isRadarFresh(radarResult) ? 'fresh' : 'stale') : 'unavailable',
        radarConfidence: radarResult?.confidence ?? null,
        radarLastUpdated: radarResult?.lastUpdated || null,
        motionVector: null,
        nowcastMethod: 'openmeteo_fallback',
        radarWindDisagreement: false,
        windDirectionDeg,
        windSpeedKmh,
        openMeteoDivergencePct: null,
        openMeteoAvailable: true,
        openMeteoSource: openMeteoData.source,
      },
      windSpeedKmh: openMeteoData.windSpeedKmh,
      windDirectionDeg: openMeteoData.windDirectionDeg,
      cloudCoverPct: openMeteoData.cloudCoverPct,
    };
  }

  // 5. BOTH SOURCES FAILED
  console.error(`[Fusion] ⚠️ ALL precipitation sources FAILED for ${cityId}. Returning unavailable state.`);

  const availableTimes = [0, 15, 30, 45, 60, 90, 120, 150, 180];
  const fusedNowcastTimeline: FusedNowcastStep[] = availableTimes.map(t => ({
    timeOffsetMins: t,
    timeLabel: `+${Math.floor(t / 60).toString().padStart(2, '0')}:${(t % 60).toString().padStart(2, '0')} (T+${t}m)`,
    precipitationMmHr: 0,
    confidenceScore: 0,
    confidenceTier: 'low',
    nowcastMethod: 'openmeteo_fallback',
    uncertaintyRangeMmHr: [0, 0],
  }));

  return {
    cityId,
    source: 'unavailable',
    lastUpdated: new Date().toISOString(),
    confidence: 0,
    currentPrecipitationMmHr: 0,
    nowcastTimelineMmHr: [0, 0, 0, 0, 0, 0, 0, 0, 0],
    fusedNowcastTimeline,
    weatherDescription: 'No Live Data Available',
    isDrySpell: true,
    sourceMetadata: {
      active: 'unavailable',
      radarStationCode: null,
      radarFreshness: 'unavailable',
      radarConfidence: null,
      radarLastUpdated: null,
      motionVector: null,
      nowcastMethod: 'openmeteo_fallback',
      radarWindDisagreement: false,
      windDirectionDeg: null,
      windSpeedKmh: null,
      openMeteoDivergencePct: null,
      openMeteoAvailable: false,
      openMeteoSource: null,
    },
  };
}

// ---------------------------------------------------------------------------
// HELPER — Human-readable rainfall description from mm/hr rate
// ---------------------------------------------------------------------------

function describeRainfallRate(mmHr: number): string {
  if (mmHr <= 0) return 'Clear / Dry';
  if (mmHr < 1) return 'Trace Precipitation';
  if (mmHr < 2.5) return 'Light Drizzle';
  if (mmHr < 10) return 'Moderate Rain';
  if (mmHr < 35) return 'Heavy Rain';
  if (mmHr < 75) return 'Very Heavy Downpour';
  if (mmHr < 150) return 'Intense Cloudburst';
  return 'Extreme Cloudburst Event';
}
