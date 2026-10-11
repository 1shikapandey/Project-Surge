import { CityId, CITIES } from './mock-data';
import chennaiKmlData from './chennai-kml-data.json';
import delhiKmlData from './delhi-kml-data.json';
import mumbaiKmlData from './mumbai-kml-data.json';

export interface DrainageGraphNode {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'manhole' | 'inlet' | 'outfall' | 'pump_sump';
  invertDepthMeters: number;
  capacityLps: number;
  currentWaterLevelMeters: number;
  surchargePct: number;
}

export interface DrainageGraphEdge {
  id: string;
  name: string;
  fromNodeId: string;
  toNodeId: string;
  coordinates: [number, number][]; // [[lat, lng], ...]
  type: 'box_drain' | 'circular_pipe' | 'open_nallah';
  diameterMm: number;
  slopePct: number;
  lengthMeters: number;
  capacityLps: number;
  currentFlowLps: number;
  surchargePct: number;
}

export interface DrainageGraphDataset {
  cityId: CityId;
  source: string;
  nodes: DrainageGraphNode[];
  edges: DrainageGraphEdge[];
}

/**
 * Generates full-city Graph-Based Underground Drainage Network based on Open SWD datasets.
 * Driven strictly by real live precipitation rate.
 */
export function getDrainageGraphNetwork(
  cityId: CityId,
  timeOffsetMins = 0,
  livePrecipitationMmHr?: number
): DrainageGraphDataset {
  const validCityId: CityId = (cityId === 'mumbai' || cityId === 'delhi' || cityId === 'chennai') ? cityId : 'mumbai';
  
  // Real precipitation flow multiplier (reference: 35 mm/hr = design capacity)
  const precipRate = typeof livePrecipitationMmHr === 'number' ? Math.max(0, livePrecipitationMmHr) : 0;
  const flowMultiplier = Math.max(0.1, precipRate / 35.0);

  let kmlData: { attribution?: string; nodes?: any[]; edges?: any[] };
  if (validCityId === 'mumbai') {
    kmlData = mumbaiKmlData;
  } else if (validCityId === 'delhi') {
    kmlData = delhiKmlData;
  } else {
    kmlData = chennaiKmlData;
  }

  const nodes: DrainageGraphNode[] = (kmlData.nodes || []).map((node) => ({
    ...node,
    id: String(node.id || ''),
    name: String(node.name || ''),
    lat: Number(node.lat ?? 0),
    lng: Number(node.lng ?? 0),
    type: node.type || 'manhole',
    invertDepthMeters: Number(node.invertDepthMeters ?? 0),
    capacityLps: Number(node.capacityLps ?? 0),
    currentWaterLevelMeters: Number(((node.currentWaterLevelMeters ?? 0) * flowMultiplier).toFixed(1)),
    surchargePct: Math.min(150, Math.round((node.surchargePct ?? 0) * flowMultiplier))
  }));

  const edges: DrainageGraphEdge[] = (kmlData.edges || []).map((edge) => ({
    ...edge,
    id: String(edge.id || ''),
    name: String(edge.name || ''),
    fromNodeId: String(edge.fromNodeId || ''),
    toNodeId: String(edge.toNodeId || ''),
    coordinates: (edge.coordinates || []) as [number, number][],
    type: (edge.type || 'box_drain') as 'box_drain' | 'circular_pipe' | 'open_nallah',
    diameterMm: Number(edge.diameterMm ?? 0),
    slopePct: Number(edge.slopePct ?? 0),
    lengthMeters: Number(edge.lengthMeters ?? 0),
    capacityLps: Number(edge.capacityLps ?? 0),
    currentFlowLps: Math.round((edge.currentFlowLps ?? 0) * flowMultiplier),
    surchargePct: Math.min(150, Math.round((edge.surchargePct ?? 0) * flowMultiplier))
  }));

  return {
    cityId: validCityId,
    source: kmlData.attribution || `Parsed OpenSource ${CITIES[validCityId]?.name || validCityId} Drainage Network Dataset`,
    nodes,
    edges
  };
}
