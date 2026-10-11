import { CityId } from './mock-data';
import { getHydraulicSnapshotAtTime } from './hydraulic-engine';
import { calculateFloodSafeRoutes, EnhancedNavigationRoute } from './routing-engine';

export interface EvacuationZone {
  id: string;
  cityId: CityId;
  name: string;
  borough: string;
  severity: 'severe' | 'critical';
  waterDepthCm: number;
  overflowingManholesCount: number;
  centroid: [number, number]; // Lat, Lng
  boundary: [number, number][]; // Polygon coordinates
  evacueePopulation: number;
  description: string;
  active: boolean;
}

export interface SafeAssemblyShelter {
  id: string;
  cityId: CityId;
  name: string;
  address: string;
  elevationMeters: number; // MSL height
  coordinates: [number, number]; // Lat, Lng
  capacityPersons: number;
  facilities: string[];
  contactEmergency: string;
}

export interface EvacuationPlan {
  zone: EvacuationZone;
  nearestShelter: SafeAssemblyShelter;
  footRoute: EnhancedNavigationRoute;
  vehicleRoute: EnhancedNavigationRoute;
  walkingTimeMins: number;
  distanceKm: number;
  elevationGainMeters: number;
  advisorySteps: string[];
}

/**
 * Verified High-Elevation Municipal Flood Assembly Points & Relief Centers
 */
export const SAFE_ASSEMBLY_SHELTERS: Record<CityId, SafeAssemblyShelter[]> = {
  mumbai: [
    {
      id: 'shelter-mum-dadar-portuguese',
      cityId: 'mumbai',
      name: 'Dadar Portuguese Church Upland Pavilion',
      address: 'Gokhale Road North, Dadar West',
      elevationMeters: 6.8,
      coordinates: [19.0285, 72.8360],
      capacityPersons: 2500,
      facilities: ['First Aid Clinic', 'Clean Potable Water', 'Emergency Diesel Power', 'Food Distribution'],
      contactEmergency: '1916 (MCGM Disaster Control)'
    },
    {
      id: 'shelter-mum-sion-fort',
      cityId: 'mumbai',
      name: 'Sion Hillock Relief Center (Sion Fort Grounds)',
      address: 'Sion Fort Road, Sion East',
      elevationMeters: 12.4,
      coordinates: [19.0465, 72.8635],
      capacityPersons: 4000,
      facilities: ['High-Ground Helipad', 'Disaster Relief Ops', 'Medical Triage Ward', 'Bedding & Sanitation'],
      contactEmergency: '022-22694725 (Sion Relief Desk)'
    },
    {
      id: 'shelter-mum-andheri-sports',
      cityId: 'mumbai',
      name: 'Andheri Sports Complex Relief Arena',
      address: 'Veera Desai Road, Andheri West',
      elevationMeters: 6.2,
      coordinates: [19.1280, 72.8320],
      capacityPersons: 3200,
      facilities: ['Covered Stadium', 'Emergency Power Supply', 'Community Kitchen', 'Ambulance Staging'],
      contactEmergency: '022-26840130'
    }
  ],
  delhi: [
    {
      id: 'shelter-del-cp-park',
      cityId: 'delhi',
      name: 'Connaught Place Central Park Pavilion',
      address: 'Inner Circle, Rajiv Chowk, New Delhi',
      elevationMeters: 8.5,
      coordinates: [28.6328, 77.2197],
      capacityPersons: 5000,
      facilities: ['NDMC Command Post', 'Metro Underground Sump Protection', 'Mobile Medical Vans', 'Food Supply'],
      contactEmergency: '1077 (Delhi Disaster Helpline)'
    },
    {
      id: 'shelter-del-pragati-hall',
      cityId: 'delhi',
      name: 'Pragati Maidan High Elevation Hall',
      address: 'Bhairon Marg, New Delhi',
      elevationMeters: 7.2,
      coordinates: [28.6180, 77.2420],
      capacityPersons: 6000,
      facilities: ['High-Capacity Indoor Hall', 'Full Power Backup', 'NDRF Response Unit', 'Drinking Water Sump'],
      contactEmergency: '011-23371800'
    },
    {
      id: 'shelter-del-tughlaq-ridge',
      cityId: 'delhi',
      name: 'Tughlaqabad Ridge High-Ground Shelter',
      address: 'Mehrauli-Badarpur Road, South Delhi',
      elevationMeters: 14.0,
      coordinates: [28.5140, 77.2620],
      capacityPersons: 3500,
      facilities: ['Elevated Hill Terrain', 'Water Tankers', 'Disaster Supply Warehouse'],
      contactEmergency: '1077'
    }
  ],
  chennai: [
    {
      id: 'shelter-che-guindy-rajbhavan',
      cityId: 'chennai',
      name: 'Guindy High Ridge Assembly Shelter',
      address: 'Sardar Patel Road, Guindy',
      elevationMeters: 8.5,
      coordinates: [13.0060, 80.2200],
      capacityPersons: 4500,
      facilities: ['Elevated Flood Immunity', 'Medical Team', 'Clean Drinking Water Reservoirs', 'Food Supply'],
      contactEmergency: '1913 (GCC Emergency Control)'
    },
    {
      id: 'shelter-che-saidapet-school',
      cityId: 'chennai',
      name: 'Saidapet High School Relief Center',
      address: 'Jones Road, Saidapet',
      elevationMeters: 5.8,
      coordinates: [13.0180, 80.2280],
      capacityPersons: 2800,
      facilities: ['Multi-Storey Classrooms', 'Sanitation Kits', 'Emergency Generator', 'Relief Staging'],
      contactEmergency: '044-25619206'
    },
    {
      id: 'shelter-che-velachery-mrts',
      cityId: 'chennai',
      name: 'Velachery MRTS Elevated Concourse Shelter',
      address: 'Velachery Bypass Road, Chennai',
      elevationMeters: 7.0,
      coordinates: [12.9800, 80.2130],
      capacityPersons: 3800,
      facilities: ['Elevated Concrete Station Deck', 'Flood Immunity', 'Drinking Water', 'Security Personnel'],
      contactEmergency: '1913'
    }
  ]
};

/**
 * Calculates distance between two coordinates in meters
 */
function getDistanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
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
 * Dynamic Detection of Extremely Flood-Prone Evacuation Zones
 * Identifies areas with sustained Severe (>40cm) road flood depth or active manhole surface overflows
 */
export function getEvacuationZonesForCity(cityId: CityId, timeOffsetMins: number = 60, hydraulicSnapshot?: import("./hydraulic-engine").NowcastTimeStep): EvacuationZone[] {
  const snapshot = hydraulicSnapshot || getHydraulicSnapshotAtTime(timeOffsetMins, cityId);
  const zones: EvacuationZone[] = [];

  if (cityId === 'mumbai') {
    // 1. Hindmata - Parel Low Basin
    const hindmataRoad = snapshot.roadStates.find(r => r.roadId === 'road-hindmata-ba-1');
    const hindGalli = snapshot.roadStates.find(r => r.roadId === 'galli-hindmata-cinema');
    const hindDepth = Math.max(hindmataRoad?.waterDepthCm || 0, hindGalli?.waterDepthCm || 0);
    const hindOverflows = (snapshot.physicsManholes || []).filter(
      m => (m.roadId === 'road-hindmata-ba-1' || m.roadId === 'galli-hindmata-cinema') && m.surfaceOverflowDepthCm > 0
    ).length;

    zones.push({
      id: 'zone-mum-hindmata',
      cityId: 'mumbai',
      name: 'Hindmata Underpass & Parel Chawl Basin',
      borough: 'F/South Ward (Dadar East / Parel)',
      severity: hindDepth >= 40 || hindOverflows > 0 ? 'severe' : 'critical',
      waterDepthCm: hindDepth,
      overflowingManholesCount: hindOverflows,
      centroid: [19.0176, 72.8442],
      boundary: [
        [19.0140, 72.8390],
        [19.0205, 72.8395],
        [19.0220, 72.8475],
        [19.0150, 72.8470],
        [19.0140, 72.8390]
      ],
      evacueePopulation: 14500,
      description: 'Low-lying depression between Parel TT and Dadar TT. Catchment of Dr. BA Road and Madhavbaug chawls prone to rapid backpressure overflow.',
      active: hindDepth >= 25 || hindOverflows > 0
    });

    // 2. King's Circle Railway Bridge Depression
    const kcRoad = snapshot.roadStates.find(r => r.roadId === 'road-kings-circle-1');
    const kcDepth = kcRoad?.waterDepthCm || 0;
    zones.push({
      id: 'zone-mum-kingscircle',
      cityId: 'mumbai',
      name: "King's Circle Railway Bridge & Matunga Basin",
      borough: 'F/North Ward (Matunga East)',
      severity: kcDepth >= 40 ? 'severe' : 'critical',
      waterDepthCm: kcDepth,
      overflowingManholesCount: (snapshot.physicsManholes || []).filter(m => m.roadId === 'road-kings-circle-1' && m.surfaceOverflowDepthCm > 0).length,
      centroid: [19.0305, 72.8550],
      boundary: [
        [19.0260, 72.8500],
        [19.0350, 72.8520],
        [19.0360, 72.8590],
        [19.0270, 72.8580],
        [19.0260, 72.8500]
      ],
      evacueePopulation: 9800,
      description: 'Harbour line railway underbridge bowl. Natural rainwater accumulation point from surrounding Matunga uplands.',
      active: kcDepth >= 25
    });

    // 3. Andheri Subway Corridor
    const andheriRoad = snapshot.roadStates.find(r => r.roadId === 'road-andheri-subway-1');
    const andheriDepth = andheriRoad?.waterDepthCm || 0;
    zones.push({
      id: 'zone-mum-andheri',
      cityId: 'mumbai',
      name: 'Andheri West Railway Subway Choke Point',
      borough: 'K/West Ward (Andheri SV Road)',
      severity: andheriDepth >= 40 ? 'severe' : 'critical',
      waterDepthCm: andheriDepth,
      overflowingManholesCount: (snapshot.physicsManholes || []).filter(m => m.roadId === 'road-andheri-subway-1' && m.surfaceOverflowDepthCm > 0).length,
      centroid: [19.1205, 72.8475],
      boundary: [
        [19.1160, 72.8430],
        [19.1250, 72.8450],
        [19.1260, 72.8530],
        [19.1170, 72.8510],
        [19.1160, 72.8430]
      ],
      evacueePopulation: 8200,
      description: 'Sub-surface road linking SV Road to WEH. Low clearance invert (1.8m MSL) causes complete vehicular submersion.',
      active: andheriDepth >= 30
    });
  } else if (cityId === 'delhi') {
    const mintoRoad = snapshot.roadStates.find(r => r.roadId === 'road-minto-1');
    const mintoDepth = mintoRoad?.waterDepthCm || 0;
    zones.push({
      id: 'zone-del-minto',
      cityId: 'delhi',
      name: 'Minto Bridge Railway Underpass Sump',
      borough: 'Central Delhi (DDU Marg / Connaught Place)',
      severity: mintoDepth >= 40 ? 'severe' : 'critical',
      waterDepthCm: mintoDepth,
      overflowingManholesCount: (snapshot.physicsManholes || []).filter(m => m.roadId === 'road-minto-1' && m.surfaceOverflowDepthCm > 0).length,
      centroid: [28.6330, 77.2245],
      boundary: [
        [28.6290, 77.2200],
        [28.6360, 77.2210],
        [28.6370, 77.2290],
        [28.6300, 77.2280],
        [28.6290, 77.2200]
      ],
      evacueePopulation: 6500,
      description: 'Historic depression beneath Delhi Railway yard. Drainage dependent on high-volume sump pumps.',
      active: mintoDepth >= 25
    });

    const itoRoad = snapshot.roadStates.find(r => r.roadId === 'road-ito-1');
    const itoDepth = itoRoad?.waterDepthCm || 0;
    zones.push({
      id: 'zone-del-ito',
      cityId: 'delhi',
      name: 'ITO Ring Road & Yamuna Floodplain Corridor',
      borough: 'ITO Central / Yamuna Bank',
      severity: itoDepth >= 40 ? 'severe' : 'critical',
      waterDepthCm: itoDepth,
      overflowingManholesCount: 1,
      centroid: [28.6285, 77.2430],
      boundary: [
        [28.6230, 77.2370],
        [28.6340, 77.2400],
        [28.6350, 77.2490],
        [28.6240, 77.2480],
        [28.6230, 77.2370]
      ],
      evacueePopulation: 11200,
      description: 'River floodplain embankment adjacent to Vikas Minar and Yamuna barrage sluice gates.',
      active: itoDepth >= 20
    });
  } else if (cityId === 'chennai') {
    const velaRoad = snapshot.roadStates.find(r => r.roadId === 'road-velachery-1');
    const velaDepth = velaRoad?.waterDepthCm || 0;
    zones.push({
      id: 'zone-che-velachery',
      cityId: 'chennai',
      name: 'Velachery Lake Lowland Basin',
      borough: 'Zone 13 (Velachery South)',
      severity: velaDepth >= 40 ? 'severe' : 'critical',
      waterDepthCm: velaDepth,
      overflowingManholesCount: 2,
      centroid: [12.9790, 80.2215],
      boundary: [
        [12.9710, 80.2140],
        [12.9850, 80.2170],
        [12.9870, 80.2280],
        [12.9730, 80.2270],
        [12.9710, 80.2140]
      ],
      evacueePopulation: 18000,
      description: 'Extensively urbanized former lake marshland with low gradient (1.4m MSL). Experiences storm surge backpressure.',
      active: velaDepth >= 25
    });

    const tnagarRoad = snapshot.roadStates.find(r => r.roadId === 'road-tnagar-1');
    const tnagarDepth = tnagarRoad?.waterDepthCm || 0;
    zones.push({
      id: 'zone-che-tnagar',
      cityId: 'chennai',
      name: 'T. Nagar Madley Subway & Ranganathan Gali',
      borough: 'Zone 10 (T. Nagar Commercial)',
      severity: tnagarDepth >= 40 ? 'severe' : 'critical',
      waterDepthCm: tnagarDepth,
      overflowingManholesCount: 1,
      centroid: [13.0420, 80.2335],
      boundary: [
        [13.0360, 80.2280],
        [13.0470, 80.2300],
        [13.0480, 80.2390],
        [13.0370, 80.2380],
        [13.0360, 80.2280]
      ],
      evacueePopulation: 14000,
      description: 'High-density commercial bazaar and railway subway corridor prone to culvert overload.',
      active: tnagarDepth >= 25
    });
  }

  return zones;
}

/**
 * Generates an end-to-end Emergency Evacuation Plan from an evacuation zone to the nearest safe shelter
 */
export function generateEvacuationPlanForZone(
  zoneId: string,
  cityId: CityId,
  timeOffsetMins: number = 60
): EvacuationPlan | null {
  const zones = getEvacuationZonesForCity(cityId, timeOffsetMins);
  const zone = zones.find(z => z.id === zoneId) || zones.find(z => z.active) || zones[0];
  if (!zone) return null;

  const shelters = SAFE_ASSEMBLY_SHELTERS[cityId] || [];
  if (shelters.length === 0) return null;

  // Find nearest shelter
  let nearestShelter = shelters[0];
  let minDistance = Infinity;

  shelters.forEach(s => {
    const d = getDistanceMeters(zone.centroid[0], zone.centroid[1], s.coordinates[0], s.coordinates[1]);
    if (d < minDistance) {
      minDistance = d;
      nearestShelter = s;
    }
  });

  const zoneOriginStr = `${zone.centroid[0]}, ${zone.centroid[1]}`;
  const shelterDestStr = `${nearestShelter.coordinates[0]}, ${nearestShelter.coordinates[1]}`;

  // Calculate Foot Evacuation Route (primary)
  const { safeRoute: footRoute } = calculateFloodSafeRoutes(
    zoneOriginStr,
    shelterDestStr,
    'pedestrian',
    timeOffsetMins,
    cityId
  );
  footRoute.name = `Evacuation Path: ${zone.name} to ${nearestShelter.name}`;

  // Calculate Vehicle Evacuation Route (secondary emergency rescue van/truck)
  const { safeRoute: vehicleRoute } = calculateFloodSafeRoutes(
    zoneOriginStr,
    shelterDestStr,
    'heavy_truck',
    timeOffsetMins,
    cityId
  );
  vehicleRoute.name = `Rescue Truck Route: ${zone.name} to ${nearestShelter.name}`;

  const elevationGain = Math.max(1.0, Math.round((nearestShelter.elevationMeters - (zone.severity === 'severe' ? 1.8 : 2.5)) * 10) / 10);

  return {
    zone,
    nearestShelter,
    footRoute,
    vehicleRoute,
    walkingTimeMins: Math.round(footRoute.distanceKm * 14), // ~14 mins per km in flooded rain conditions
    distanceKm: footRoute.distanceKm,
    elevationGainMeters: elevationGain,
    advisorySteps: [
      `Proceed IMMEDIATELY on foot toward ${nearestShelter.name} (+${elevationGain}m elevation gain above flood level).`,
      `Avoid walking through water deeper than knee-level (20cm) due to displaced manhole cover suction hazards.`,
      `Follow designated green evacuation corridors through connecting residential gallis; avoid highway underpasses.`,
      `Report to the Municipal Relief Desk on arrival for dry rations, first-aid triage, and emergency charging.`
    ]
  };
}
