export type CityId = 'mumbai' | 'delhi' | 'chennai';

export interface CityConfig {
  id: CityId;
  name: string;
  state: string;
  center: [number, number];
  zoom: number;
  description: string;
  highRiskZones: string[];
  annualRainfallAvg: string;
}

import { ExtendedRoadSegment, MUMBAI_REAL_ROADS, DELHI_REAL_ROADS, CHENNAI_REAL_ROADS } from './real-roads-dataset';

export interface RoadSegment {
  id: string;
  name: string;
  borough: string;
  highwayCategory?: 'National Highway' | 'Arterial Expressway' | 'Subway Corridor' | 'Municipal Thoroughfare' | 'Galli / Local Lane';
  coordinates: [number, number][]; // Lat, Lng
  demElevationMeters: number; // Digital Elevation Model height
  drainNodeId: string;
  baseInfiltrationRate: number; // mm/hr
  // Forecast water depth (cm) at t = [0, 15, 30, 45, 60, 90, 120, 150, 180] mins
  depthsTimelineCm: number[];
  riskSeverity: 'safe' | 'warning' | 'critical' | 'severe';
  speedLimitKmh: number;
  laneCount?: number;
}

export interface DrainageNode {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'manhole' | 'inlet' | 'pumping_station' | 'outfall';
  invertDepthMeters: number;
  capacityLps: number; // Liters per second
  // Surcharge level % at t = [0, 15, 30, 45, 60, 90, 120, 150, 180] mins
  surchargeTimelinePct: number[];
  status: 'normal' | 'capacity_warning' | 'surcharging_backflow' | 'blocked';
  pumpActive?: boolean;
}

export interface DrainagePipe {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  diameterMm: number;
  lengthMeters: number;
  slopePct: number;
  flowDirection: 'forward' | 'reverse_backflow';
}

export interface CitizenReport {
  id: string;
  timestamp: string;
  cityId: CityId;
  lat: number;
  lng: number;
  locationName: string;
  waterDepthCm: number;
  userNote: string;
  verified: boolean;
  upvotes: number;
  coordinates?: [number, number];
  timestampMinsAgo?: number;
  status?: string;
  photoUrl?: string;
  reporterName?: string;
  reporterMobile?: string;
}

export interface NavigationRoute {
  id: string;
  name: string;
  distanceKm: number;
  durationMins: number;
  maxWaterDepthCm: number;
  isSafe: boolean;
  coordinates: [number, number][];
  warnings: string[];
}

export const CITIES: Record<CityId, CityConfig> = {
  mumbai: {
    id: 'mumbai',
    name: 'Mumbai',
    state: 'Maharashtra',
    center: [19.0176, 72.8479],
    zoom: 13,
    description: 'Hyper-local coastal nowcasting for Dadar, Hindmata, Kurla, and Andheri subways.',
    highRiskZones: ['Hindmata Underpass', 'King\'s Circle', 'Andheri Subway', 'Kurla LBS Marg'],
    annualRainfallAvg: '2,400 mm'
  },
  delhi: {
    id: 'delhi',
    name: 'Delhi NCR',
    state: 'Delhi',
    center: [28.6289, 77.2255],
    zoom: 13,
    description: 'Urban depression flash flood nowcasts for Minto Bridge, ITO, and Yamuna basin Drains.',
    highRiskZones: ['Minto Bridge Underpass', 'ITO Ring Road', 'Pul Prahladpur', 'Lajpat Nagar'],
    annualRainfallAvg: '800 mm'
  },
  chennai: {
    id: 'chennai',
    name: 'Chennai',
    state: 'Tamil Nadu',
    center: [13.0400, 80.2300],
    zoom: 13,
    description: 'Coastal tidal & storm surge nowcasts for Velachery, T. Nagar, and Adyar River outflow.',
    highRiskZones: ['Velachery Main Road', 'T. Nagar Usman Subway', 'Vyasarpadi Subway', 'Saidapet'],
    annualRainfallAvg: '1,400 mm'
  }
};

// MUMBAI DATASET (Authentic OpenStreetMap Vectors)
export const MUMBAI_ROADS: RoadSegment[] = MUMBAI_REAL_ROADS;

export const MUMBAI_NODES: DrainageNode[] = [

  { id: 'node-mh-bandra-1', name: 'MH-BND-01 (Linking Road)', lat: 19.0620, lng: 72.8360, type: 'manhole', invertDepthMeters: 2.5, capacityLps: 350, surchargeTimelinePct: [20, 50, 80, 95, 80, 50, 20], status: 'normal' },
  { id: 'node-mh-bandra-2', name: 'MH-BND-02 (SV Road)', lat: 19.0550, lng: 72.8350, type: 'manhole', invertDepthMeters: 3.0, capacityLps: 400, surchargeTimelinePct: [30, 60, 90, 110, 90, 60, 30], status: 'capacity_warning' },
  { id: 'node-mh-andheri-1', name: 'MH-AND-01 (WEH Station)', lat: 19.1150, lng: 72.8550, type: 'manhole', invertDepthMeters: 4.0, capacityLps: 500, surchargeTimelinePct: [40, 80, 120, 140, 120, 80, 40], status: 'surcharging_backflow' },
  { id: 'node-mh-andheri-2', name: 'MH-AND-02 (Lokhandwala)', lat: 19.1410, lng: 72.8250, type: 'manhole', invertDepthMeters: 2.2, capacityLps: 250, surchargeTimelinePct: [10, 30, 50, 60, 50, 30, 10], status: 'normal' },
  { id: 'node-mh-powai-1', name: 'MH-POW-01 (JVLR)', lat: 19.1170, lng: 72.9050, type: 'manhole', invertDepthMeters: 3.5, capacityLps: 450, surchargeTimelinePct: [25, 55, 85, 105, 85, 55, 25], status: 'capacity_warning' },
  { id: 'node-mh-powai-2', name: 'MH-POW-02 (Hiranandani)', lat: 19.1190, lng: 72.9100, type: 'manhole', invertDepthMeters: 3.2, capacityLps: 420, surchargeTimelinePct: [15, 35, 65, 80, 65, 35, 15], status: 'normal' },
  { id: 'node-mh-colaba-1', name: 'MH-COL-01 (Causeway)', lat: 18.9220, lng: 72.8280, type: 'manhole', invertDepthMeters: 2.0, capacityLps: 200, surchargeTimelinePct: [50, 90, 130, 150, 130, 90, 50], status: 'surcharging_backflow' },
  { id: 'node-mh-worli-1', name: 'MH-WOR-01 (Seaface)', lat: 19.0150, lng: 72.8150, type: 'manhole', invertDepthMeters: 4.5, capacityLps: 600, surchargeTimelinePct: [20, 40, 70, 90, 70, 40, 20], status: 'normal' },
  { id: 'node-mh-dadar-1', name: 'MH-DAD-01 (Shivaji Park)', lat: 19.0270, lng: 72.8380, type: 'manhole', invertDepthMeters: 3.0, capacityLps: 380, surchargeTimelinePct: [35, 75, 115, 135, 115, 75, 35], status: 'surcharging_backflow' },
  { id: 'node-mh-juhu-1', name: 'MH-JUH-01 (Juhu Tara)', lat: 19.0990, lng: 72.8260, type: 'manhole', invertDepthMeters: 2.5, capacityLps: 300, surchargeTimelinePct: [30, 60, 100, 120, 100, 60, 30], status: 'surcharging_backflow' },
  { id: 'node-mh-kurla-1', name: 'MH-KUR-01 (LBS Marg)', lat: 19.0680, lng: 72.8790, type: 'manhole', invertDepthMeters: 3.8, capacityLps: 480, surchargeTimelinePct: [45, 85, 125, 145, 125, 85, 45], status: 'surcharging_backflow' },
  { id: 'node-mh-santacruz-1', name: 'MH-SAN-01 (SV Road)', lat: 19.0840, lng: 72.8360, type: 'manhole', invertDepthMeters: 2.8, capacityLps: 320, surchargeTimelinePct: [25, 50, 80, 100, 80, 50, 25], status: 'capacity_warning' },

  {
    id: 'node-mh-hindmata-01',
    name: 'MH-104 (Hindmata Surcharging Manhole)',
    lat: 19.0176,
    lng: 72.8442,
    type: 'manhole',
    invertDepthMeters: 3.5,
    capacityLps: 450,
    surchargeTimelinePct: [40, 75, 110, 145, 160, 140, 105, 60, 20],
    status: 'surcharging_backflow'
  },
  {
    id: 'node-mh-hind-g01',
    name: 'MH-HIND-G01 (Hindmata Cinema Galli Catchpit)',
    lat: 19.0166,
    lng: 72.8420,
    type: 'manhole',
    invertDepthMeters: 2.1,
    capacityLps: 280,
    surchargeTimelinePct: [50, 85, 130, 165, 175, 150, 110, 65, 25],
    status: 'surcharging_backflow'
  },
  {
    id: 'node-mh-parel-g02',
    name: 'MH-PARL-G02 (Bhoiwada Chawl Galli Inflow)',
    lat: 19.0108,
    lng: 72.8438,
    type: 'manhole',
    invertDepthMeters: 2.2,
    capacityLps: 320,
    surchargeTimelinePct: [35, 70, 105, 140, 155, 130, 95, 50, 15],
    status: 'surcharging_backflow'
  },
  {
    id: 'node-mh-dadar-g03',
    name: 'MH-DADR-G03 (Ranade Road Flower Galli Gully Trap)',
    lat: 19.0228,
    lng: 72.8450,
    type: 'manhole',
    invertDepthMeters: 2.4,
    capacityLps: 350,
    surchargeTimelinePct: [30, 60, 95, 130, 145, 120, 80, 40, 12],
    status: 'surcharging_backflow'
  },
  {
    id: 'node-mh-kc-02',
    name: "MH-208 (King's Circle Main Trunk Inflow)",
    lat: 19.0305,
    lng: 72.8550,
    type: 'inlet',
    invertDepthMeters: 3.2,
    capacityLps: 600,
    surchargeTimelinePct: [20, 50, 85, 120, 135, 115, 80, 40, 15],
    status: 'surcharging_backflow'
  },
  {
    id: 'node-mh-andheri-03',
    name: 'MH-309 (Andheri Outfall Pump Station)',
    lat: 19.1205,
    lng: 72.8475,
    type: 'pumping_station',
    invertDepthMeters: 4.2,
    capacityLps: 1200,
    surchargeTimelinePct: [60, 90, 130, 175, 190, 160, 110, 70, 30],
    status: 'surcharging_backflow',
    pumpActive: true
  }
];

// DELHI DATASET (Authentic OpenStreetMap Vectors)
export const DELHI_ROADS: RoadSegment[] = DELHI_REAL_ROADS;

export const DELHI_NODES: DrainageNode[] = [
  {
    id: 'node-mh-minto-01',
    name: 'MH-DEL-101 (Minto Bridge High-Vol Sump Pump)',
    lat: 28.6330,
    lng: 77.2245,
    type: 'pumping_station',
    invertDepthMeters: 4.5,
    capacityLps: 1500,
    surchargeTimelinePct: [50, 85, 125, 160, 180, 150, 100, 50, 20],
    status: 'surcharging_backflow',
    pumpActive: true
  },
  {
    id: 'node-mh-minto-g01',
    name: 'MH-DEL-MNT01 (Minto Railway Colony Galli Catchpit)',
    lat: 28.6325,
    lng: 77.2238,
    type: 'manhole',
    invertDepthMeters: 2.2,
    capacityLps: 310,
    surchargeTimelinePct: [55, 90, 135, 170, 185, 155, 110, 55, 20],
    status: 'surcharging_backflow'
  },
  {
    id: 'node-mh-delhi-cc01',
    name: 'MH-DEL-CC01 (Paranthe Wali Gali Culvert Inflow)',
    lat: 28.6548,
    lng: 77.2312,
    type: 'manhole',
    invertDepthMeters: 2.4,
    capacityLps: 290,
    surchargeTimelinePct: [45, 80, 120, 155, 170, 145, 100, 50, 15],
    status: 'surcharging_backflow'
  },
  {
    id: 'node-mh-delhi-g02',
    name: 'MH-DEL-NAI02 (Nai Sarak Galli Junction Drain)',
    lat: 28.6535,
    lng: 77.2280,
    type: 'manhole',
    invertDepthMeters: 2.3,
    capacityLps: 340,
    surchargeTimelinePct: [35, 65, 100, 135, 150, 125, 85, 45, 12],
    status: 'surcharging_backflow'
  },
  {
    id: 'node-mh-ito-02',
    name: 'MH-DEL-202 (Yamuna Outfall Floodgate)',
    lat: 28.6285,
    lng: 77.2430,
    type: 'outfall',
    invertDepthMeters: 3.0,
    capacityLps: 850,
    surchargeTimelinePct: [20, 45, 75, 110, 130, 110, 75, 35, 10],
    status: 'surcharging_backflow'
  }
];

// CHENNAI DATASET (Authentic OpenStreetMap Vectors)
export const CHENNAI_ROADS: RoadSegment[] = CHENNAI_REAL_ROADS;

export const CHENNAI_NODES: DrainageNode[] = [
  {
    id: 'node-mh-velachery-01',
    name: 'MH-MAA-101 (Velachery Lake Canal Pump)',
    lat: 12.9790,
    lng: 80.2215,
    type: 'pumping_station',
    invertDepthMeters: 3.8,
    capacityLps: 1400,
    surchargeTimelinePct: [55, 90, 135, 170, 185, 160, 115, 65, 25],
    status: 'surcharging_backflow',
    pumpActive: true
  },
  {
    id: 'node-mh-velachery-g01',
    name: 'MH-MAA-VEL01 (Dhandeeswaram 1st Main Galli Inflow)',
    lat: 12.9795,
    lng: 80.2195,
    type: 'manhole',
    invertDepthMeters: 2.0,
    capacityLps: 300,
    surchargeTimelinePct: [50, 85, 130, 165, 180, 155, 110, 60, 20],
    status: 'surcharging_backflow'
  },
  {
    id: 'node-mh-tnagar-g03',
    name: 'MH-MAA-RNG03 (Ranganathan Street Bazaar Gully Trap)',
    lat: 13.0415,
    lng: 80.2300,
    type: 'manhole',
    invertDepthMeters: 2.2,
    capacityLps: 340,
    surchargeTimelinePct: [45, 80, 125, 160, 175, 150, 105, 55, 18],
    status: 'surcharging_backflow'
  },
  {
    id: 'node-mh-tnagar-02',
    name: 'MH-MAA-202 (Usman Storm Outfall Drain)',
    lat: 13.0420,
    lng: 80.2335,
    type: 'manhole',
    invertDepthMeters: 2.9,
    capacityLps: 520,
    surchargeTimelinePct: [30, 60, 95, 130, 145, 125, 85, 45, 15],
    status: 'surcharging_backflow'
  }
];

// Backwards compatibility exports
export const ROAD_SEGMENTS = MUMBAI_ROADS;
export const DRAINAGE_NODES = MUMBAI_NODES;

export const DRAINAGE_PIPES: DrainagePipe[] = [
  {
    id: 'pipe-1',
    sourceNodeId: 'node-mh-hindmata-01',
    targetNodeId: 'node-mh-kc-02',
    diameterMm: 1400,
    lengthMeters: 850,
    slopePct: 0.8,
    flowDirection: 'reverse_backflow'
  },
  {
    id: 'pipe-hind-galli-1',
    sourceNodeId: 'node-mh-hind-g01',
    targetNodeId: 'node-mh-hindmata-01',
    diameterMm: 600,
    lengthMeters: 220,
    slopePct: 1.1,
    flowDirection: 'reverse_backflow'
  },
  {
    id: 'pipe-parel-galli-2',
    sourceNodeId: 'node-mh-parel-g02',
    targetNodeId: 'node-mh-hindmata-01',
    diameterMm: 600,
    lengthMeters: 410,
    slopePct: 0.9,
    flowDirection: 'reverse_backflow'
  },
  {
    id: 'pipe-dadar-galli-3',
    sourceNodeId: 'node-mh-dadar-g03',
    targetNodeId: 'node-mh-kc-02',
    diameterMm: 700,
    lengthMeters: 380,
    slopePct: 0.7,
    flowDirection: 'reverse_backflow'
  }
];

export const INITIAL_CITIZEN_REPORTS: CitizenReport[] = [
  {
    id: 'rep-mumbai-01',
    cityId: 'mumbai',
    timestamp: '10 mins ago',
    lat: 19.0176,
    lng: 72.8442,
    locationName: 'Hindmata Flyover Approach',
    waterDepthCm: 35,
    userNote: 'Water accumulating near bus stop. Traffic diverting.',
    verified: true,
    upvotes: 42
  },
  {
    id: 'rep-delhi-01',
    cityId: 'delhi',
    timestamp: '5 mins ago',
    lat: 28.6330,
    lng: 77.2245,
    locationName: 'Minto Bridge Underpass',
    waterDepthCm: 70,
    userNote: 'Police barricades deployed. Bus stuck in deep water.',
    verified: true,
    upvotes: 68
  },
  {
    id: 'rep-chennai-01',
    cityId: 'chennai',
    timestamp: '15 mins ago',
    lat: 12.9790,
    lng: 80.2215,
    locationName: 'Velachery Bypass Road',
    waterDepthCm: 55,
    userNote: 'Canal water overflow onto main road.',
    verified: true,
    upvotes: 51
  }
];

export function getCityDataset(cityId: CityId): { roads: RoadSegment[]; nodes: DrainageNode[] } {
  if (cityId === 'delhi') {
    return { roads: DELHI_ROADS, nodes: DELHI_NODES };
  }
  if (cityId === 'chennai') {
    return { roads: CHENNAI_ROADS, nodes: CHENNAI_NODES };
  }
  return { roads: MUMBAI_ROADS, nodes: MUMBAI_NODES };
}
