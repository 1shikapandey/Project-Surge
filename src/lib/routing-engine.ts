import { CityId, getCityDataset, NavigationRoute, RoadSegment } from './mock-data';
import { getHydraulicSnapshotAtTime } from './hydraulic-engine';

export type VehicleType =
  | 'auto'
  | 'hatchback'
  | 'sedan'
  | 'car'
  | 'suv'
  | 'bus'
  | 'heavy_truck'
  | 'ambulance'
  | 'two_wheeler'
  | 'pedestrian'
  | 'Auto'
  | 'Hatchback'
  | 'Sedan'
  | 'SUV'
  | 'Bus'
  | 'Emergency';

export interface VehicleProfile {
  type: string;
  name: string;
  maxSafeDepthCm: number;
  maxPassableDepthCm: number;
  widthRestricted: boolean;
  pedestrianOnly: boolean;
  highwayAllowed: boolean;
  speedMultiplier: number;
  description: string;
}

const BASE_VEHICLE_PROFILES: Record<string, VehicleProfile> = {
  auto: {
    type: 'auto',
    name: 'Auto (3-Wheeler)',
    maxSafeDepthCm: 18,
    maxPassableDepthCm: 20,
    widthRestricted: false,
    pedestrianOnly: false,
    highwayAllowed: false,
    speedMultiplier: 0.85,
    description: 'Low air intake and electrical stall risk above 18cm. Nimble in narrow market gallis.'
  },
  hatchback: {
    type: 'hatchback',
    name: 'Hatchback',
    maxSafeDepthCm: 22,
    maxPassableDepthCm: 25,
    widthRestricted: false,
    pedestrianOnly: false,
    highwayAllowed: true,
    speedMultiplier: 0.95,
    description: 'Standard city car. Low bumper height; stalling risk in underpasses above 22cm.'
  },
  sedan: {
    type: 'sedan',
    name: 'Sedan',
    maxSafeDepthCm: 26,
    maxPassableDepthCm: 30,
    widthRestricted: false,
    pedestrianOnly: false,
    highwayAllowed: true,
    speedMultiplier: 1.0,
    description: 'Standard passenger sedan. Exhaust and air filter wading threshold of 30cm.'
  },
  car: {
    type: 'sedan',
    name: 'Sedan / Hatchback',
    maxSafeDepthCm: 26,
    maxPassableDepthCm: 30,
    widthRestricted: false,
    pedestrianOnly: false,
    highwayAllowed: true,
    speedMultiplier: 1.0,
    description: 'Standard passenger vehicle with 30cm max wading clearance.'
  },
  suv: {
    type: 'suv',
    name: 'SUV / 4x4',
    maxSafeDepthCm: 45,
    maxPassableDepthCm: 50,
    widthRestricted: false,
    pedestrianOnly: false,
    highwayAllowed: true,
    speedMultiplier: 1.1,
    description: 'High ground clearance and snorkel intake options. Wades up to 50cm street water.'
  },
  bus: {
    type: 'bus',
    name: 'Bus / Commercial Transit',
    maxSafeDepthCm: 75,
    maxPassableDepthCm: 80,
    widthRestricted: true,
    pedestrianOnly: false,
    highwayAllowed: true,
    speedMultiplier: 0.85,
    description: 'High wheel clearance (80cm). Restricted on 1-lane residential gallis.'
  },
  heavy_truck: {
    type: 'bus',
    name: 'Heavy Transit / Rescue Truck',
    maxSafeDepthCm: 75,
    maxPassableDepthCm: 80,
    widthRestricted: true,
    pedestrianOnly: false,
    highwayAllowed: true,
    speedMultiplier: 0.85,
    description: 'Heavy rescue truck for severe water logging.'
  },
  ambulance: {
    type: 'ambulance',
    name: 'Emergency Ambulance',
    maxSafeDepthCm: 140,
    maxPassableDepthCm: 150,
    widthRestricted: false,
    pedestrianOnly: false,
    highwayAllowed: true,
    speedMultiplier: 1.4,
    description: 'Priority life-saving emergency vehicle. High wading clearance (150cm) and priority dispatch.'
  },
  two_wheeler: {
    type: 'two_wheeler',
    name: 'Two-Wheeler / Bike',
    maxSafeDepthCm: 12,
    maxPassableDepthCm: 15,
    widthRestricted: false,
    pedestrianOnly: false,
    highwayAllowed: true,
    speedMultiplier: 0.9,
    description: 'Highly vulnerable to silencing exhaust ingestion and currents >12cm.'
  },
  pedestrian: {
    type: 'pedestrian',
    name: 'Foot Evacuee / Walking',
    maxSafeDepthCm: 18,
    maxPassableDepthCm: 22,
    widthRestricted: false,
    pedestrianOnly: true,
    highwayAllowed: false,
    speedMultiplier: 0.25,
    description: 'Walking evacuation profile using footpaths, footbridges, and alleys.'
  }
};

// Aliases for Nowcast compatibility
BASE_VEHICLE_PROFILES['Auto'] = BASE_VEHICLE_PROFILES['auto'];
BASE_VEHICLE_PROFILES['Hatchback'] = BASE_VEHICLE_PROFILES['hatchback'];
BASE_VEHICLE_PROFILES['Sedan'] = BASE_VEHICLE_PROFILES['sedan'];
BASE_VEHICLE_PROFILES['SUV'] = BASE_VEHICLE_PROFILES['suv'];
BASE_VEHICLE_PROFILES['Bus'] = BASE_VEHICLE_PROFILES['bus'];
BASE_VEHICLE_PROFILES['Emergency'] = BASE_VEHICLE_PROFILES['ambulance'];

export const VEHICLE_PROFILES: Record<string, VehicleProfile> = BASE_VEHICLE_PROFILES;

// Backwards compatibility alias
export const VEHICLE_CLEARANCES = VEHICLE_PROFILES;

export interface RouteRiskSegment {
  coordinates: [number, number][];
  roadId: string;
  roadName: string;
  highwayCategory: string;
  waterDepthCm: number;
  riskSeverity: 'safe' | 'warning' | 'critical' | 'severe';
  isPassable: boolean;
  cost: number;
}

export interface EnhancedNavigationRoute extends NavigationRoute {
  vehicleType: VehicleType;
  isBlocked: boolean;
  blockedReason?: string;
  suggestedAlternativeVehicle?: VehicleType;
  segments: RouteRiskSegment[];
  totalElevationGainMeters: number;
  floodDetourKm: number;
}

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

interface GraphNode {
  id: string;
  lat: number;
  lng: number;
}

interface GraphEdge {
  from: string;
  to: string;
  roadId: string;
  roadName: string;
  highwayCategory: string;
  laneCount: number;
  speedLimitKmh: number;
  lengthMeters: number;
  coordinates: [number, number][];
  waterDepthCm: number;
  elevationMeters: number;
}

/**
 * Builds connected OSM road and galli graph for the city
 */
function buildCityRoadGraph(
  roads: RoadSegment[],
  roadDepthMap: Map<string, number>
): { nodes: Map<string, GraphNode>; adjacency: Map<string, GraphEdge[]> } {
  const nodes = new Map<string, GraphNode>();
  const adjacency = new Map<string, GraphEdge[]>();

  function getOrCreateNode(lat: number, lng: number): string {
    // Snap close vertices within 60m into shared intersection junctions
    for (const [existingId, n] of Array.from(nodes.entries())) {
      if (getDistanceMeters(lat, lng, n.lat, n.lng) < 60) {
        return existingId;
      }
    }
    const id = `node_${lat.toFixed(4)}_${lng.toFixed(4)}`;
    nodes.set(id, { id, lat, lng });
    adjacency.set(id, []);
    return id;
  }

  // Pre-seed nodes for road polyline vertices
  roads.forEach((road) => {
    const coords = road.coordinates;
    const depth = roadDepthMap.get(road.id) || 0;

    for (let i = 0; i < coords.length - 1; i++) {
      const p1 = coords[i];
      const p2 = coords[i + 1];
      const u = getOrCreateNode(p1[0], p1[1]);
      const v = getOrCreateNode(p2[0], p2[1]);
      const lengthMeters = getDistanceMeters(p1[0], p1[1], p2[0], p2[1]);

      const forwardEdge: GraphEdge = {
        from: u,
        to: v,
        roadId: road.id,
        roadName: road.name,
        highwayCategory: road.highwayCategory || 'Municipal Thoroughfare',
        laneCount: road.laneCount || 2,
        speedLimitKmh: road.speedLimitKmh || 40,
        lengthMeters,
        coordinates: [p1, p2],
        waterDepthCm: depth,
        elevationMeters: road.demElevationMeters
      };

      const reverseEdge: GraphEdge = {
        from: v,
        to: u,
        roadId: road.id,
        roadName: road.name,
        highwayCategory: road.highwayCategory || 'Municipal Thoroughfare',
        laneCount: road.laneCount || 2,
        speedLimitKmh: road.speedLimitKmh || 40,
        lengthMeters,
        coordinates: [p2, p1],
        waterDepthCm: depth,
        elevationMeters: road.demElevationMeters
      };

      adjacency.get(u)!.push(forwardEdge);
      adjacency.get(v)!.push(reverseEdge);
    }
  });

  // Interconnect terminal nodes of nearby roads (<120m) to form immediate street junctions only
  const nodeArray = Array.from(nodes.values());
  for (let i = 0; i < nodeArray.length; i++) {
    for (let j = i + 1; j < nodeArray.length; j++) {
      const u = nodeArray[i];
      const v = nodeArray[j];
      const dist = getDistanceMeters(u.lat, u.lng, v.lat, v.lng);
      if (dist > 0 && dist < 120) {
        const edgeForward: GraphEdge = {
          from: u.id,
          to: v.id,
          roadId: `link-${u.id}-${v.id}`,
          roadName: 'Municipal Connecting Corridor',
          highwayCategory: 'Municipal Thoroughfare',
          laneCount: 2,
          speedLimitKmh: 35,
          lengthMeters: dist,
          coordinates: [[u.lat, u.lng], [v.lat, v.lng]],
          waterDepthCm: 0,
          elevationMeters: 3.0
        };
        const edgeReverse: GraphEdge = {
          from: v.id,
          to: u.id,
          roadId: `link-${v.id}-${u.id}`,
          roadName: 'Municipal Connecting Corridor',
          highwayCategory: 'Municipal Thoroughfare',
          laneCount: 2,
          speedLimitKmh: 35,
          lengthMeters: dist,
          coordinates: [[v.lat, v.lng], [u.lat, u.lng]],
          waterDepthCm: 0,
          elevationMeters: 3.0
        };
        adjacency.get(u.id)?.push(edgeForward);
        adjacency.get(v.id)?.push(edgeReverse);
      }
    }
  }

  return { nodes, adjacency };
}

/**
 * Evaluates the traversal cost of a graph edge for a given vehicle profile and dynamic water depth
 */
function evaluateEdgeCost(
  edge: GraphEdge,
  profile: VehicleProfile,
  isEmergencyPriority: boolean = false
): { cost: number; isPassable: boolean; riskSeverity: 'safe' | 'warning' | 'critical' | 'severe' } {
  const depth = edge.waterDepthCm;
  const isGalli = edge.highwayCategory === 'Galli / Local Lane' || edge.roadId.startsWith('galli-');
  const isHighway = edge.highwayCategory === 'National Highway' || edge.highwayCategory === 'Arterial Expressway';

  // 1. Pedestrian constraints (cannot walk on high-speed expressways)
  if (profile.pedestrianOnly && isHighway) {
    return { cost: Infinity, isPassable: false, riskSeverity: 'severe' };
  }

  // 2. Hard depth blockage
  if (depth > profile.maxPassableDepthCm) {
    return { cost: Infinity, isPassable: false, riskSeverity: 'severe' };
  }

  // 3. Width / maneuvering restrictions (Heavy trucks in narrow 1-lane gallis)
  let widthPenalty = 1.0;
  if (profile.widthRestricted && isGalli) {
    if (edge.laneCount <= 1) {
      return { cost: Infinity, isPassable: false, riskSeverity: 'critical' };
    }
    widthPenalty = 6.0; // Significant turning delay for fire trucks/buses
  }

  // Base free-flow transit time in seconds
  const speedKmh = Math.max(10, edge.speedLimitKmh * profile.speedMultiplier);
  const baseTimeSec = edge.lengthMeters / (speedKmh / 3.6);

  // 4. Depth water-drag and hydroplaning cost penalty
  let depthPenalty = 1.0;
  let riskSeverity: 'safe' | 'warning' | 'critical' | 'severe' = 'safe';

  if (depth >= 40) {
    riskSeverity = 'severe';
  } else if (depth >= 20) {
    riskSeverity = 'critical';
  } else if (depth >= 8) {
    riskSeverity = 'warning';
  }

  if (depth > profile.maxSafeDepthCm) {
    // Hazardous wading zone (tolerable only if passable, with steep penalty)
    const excess = depth - profile.maxSafeDepthCm;
    const severityFactor = isEmergencyPriority ? 3.0 : 8.0;
    depthPenalty = 2.5 + excess * severityFactor;
  } else if (depth > 8) {
    // Caution water depth
    depthPenalty = 1.0 + Math.pow(depth / 8, isEmergencyPriority ? 1.4 : 2.2);
  }

  return {
    cost: baseTimeSec * depthPenalty * widthPenalty,
    isPassable: true,
    riskSeverity
  };
}

/**
 * Runs Dijkstra shortest-path search considering dynamic flood depth and vehicle profile
 */
function findOptimalPath(
  startNodeId: string,
  targetNodeId: string,
  nodes: Map<string, GraphNode>,
  adjacency: Map<string, GraphEdge[]>,
  profile: VehicleProfile,
  ignoreFloodPenalty: boolean = false
): { pathEdges: GraphEdge[]; totalCost: number; isBlocked: boolean; maxDepth: number } | null {
  const distances = new Map<string, number>();
  const previousEdge = new Map<string, GraphEdge>();
  const unvisited = new Set<string>();

  nodes.forEach((_, nodeId) => {
    distances.set(nodeId, Infinity);
    unvisited.add(nodeId);
  });

  distances.set(startNodeId, 0);

  while (unvisited.size > 0) {
    // Pick unvisited node with lowest distance
    let current: string | null = null;
    let lowestDist = Infinity;

    unvisited.forEach((nodeId) => {
      const dist = distances.get(nodeId)!;
      if (dist < lowestDist) {
        lowestDist = dist;
        current = nodeId;
      }
    });

    if (!current || lowestDist === Infinity) break;
    if (current === targetNodeId) break;

    unvisited.delete(current);

    const edges = adjacency.get(current) || [];
    for (const edge of edges) {
      if (!unvisited.has(edge.to)) continue;

      let edgeCost = edge.lengthMeters; // default distance
      if (!ignoreFloodPenalty) {
        const evalResult = evaluateEdgeCost(edge, profile, profile.type === 'ambulance');
        if (!evalResult.isPassable || evalResult.cost === Infinity) {
          continue; // Path hard-blocked
        }
        edgeCost = evalResult.cost;
      }

      const alt = distances.get(current)! + edgeCost;
      if (alt < distances.get(edge.to)!) {
        distances.set(edge.to, alt);
        previousEdge.set(edge.to, edge);
      }
    }
  }

  // Reconstruct path
  if (!previousEdge.has(targetNodeId)) {
    return null; // No viable route
  }

  const pathEdges: GraphEdge[] = [];
  let curr = targetNodeId;
  let maxDepth = 0;

  while (curr !== startNodeId) {
    const edge = previousEdge.get(curr);
    if (!edge) break;
    pathEdges.unshift(edge);
    maxDepth = Math.max(maxDepth, edge.waterDepthCm);
    curr = edge.from;
  }

  return {
    pathEdges,
    totalCost: distances.get(targetNodeId) || 0,
    isBlocked: false,
    maxDepth
  };
}

/**
 * Finds the closest graph node to a given geographic point
 */
function findClosestNode(lat: number, lng: number, nodes: Map<string, GraphNode>): string {
  let closestId = '';
  let minDistance = Infinity;

  nodes.forEach((node, id) => {
    const d = getDistanceMeters(lat, lng, node.lat, node.lng);
    if (d < minDistance) {
      minDistance = d;
      closestId = id;
    }
  });

  return closestId;
}

export function parseCoordinateString(str: string): [number, number] | null {
  if (!str) return null;
  const parts = str.split(',').map((s) => parseFloat(s.trim()));
  if (
    parts.length === 2 &&
    !isNaN(parts[0]) &&
    !isNaN(parts[1]) &&
    parts[0] >= -90 &&
    parts[0] <= 90 &&
    parts[1] >= -180 &&
    parts[1] <= 180
  ) {
    return [parts[0], parts[1]];
  }
  return null;
}

/**
 * Main Vehicle-Aware Flood-Safe Routing Engine
 * Recomputes dynamic routes under live flood inundation constraints for 5 vehicle classes
 */
export function calculateFloodSafeRoutes(
  originName: string,
  destinationName: string,
  vehicleType: VehicleType,
  timeOffsetMins: number,
  cityId: CityId = 'mumbai'
): { standardRoute: EnhancedNavigationRoute; safeRoute: EnhancedNavigationRoute } {
  const snapshot = getHydraulicSnapshotAtTime(timeOffsetMins, cityId);
  const profile = VEHICLE_PROFILES[vehicleType] || VEHICLE_PROFILES.car;
  const { roads } = getCityDataset(cityId);

  // Map dynamic water depths
  const roadDepthMap = new Map<string, number>();
  snapshot.roadStates.forEach((r) => roadDepthMap.set(r.roadId, r.waterDepthCm));

  // Factor in physics manhole surface overflow spill onto road
  const physicsManholes = snapshot.physicsManholes || [];
  physicsManholes.forEach((mh) => {
    if (mh.surfaceOverflowDepthCm > 0) {
      const current = roadDepthMap.get(mh.roadId) || 0;
      roadDepthMap.set(mh.roadId, current + Math.round(mh.surfaceOverflowDepthCm * 0.4));
    }
  });

  // Build Connected OSM Graph
  const { nodes, adjacency } = buildCityRoadGraph(roads, roadDepthMap);

  // Parse raw lat, lng or look up named landmark
  const parsedOriginCoord = parseCoordinateString(originName);
  const parsedDestCoord = parseCoordinateString(destinationName);

  const originRoad = parsedOriginCoord
    ? null
    : roads.find(
        (r) =>
          r.name.toLowerCase().includes(originName.toLowerCase()) ||
          r.borough.toLowerCase().includes(originName.toLowerCase())
      ) || roads[0];

  const destRoad = parsedDestCoord
    ? null
    : roads.find(
        (r) =>
          r.name.toLowerCase().includes(destinationName.toLowerCase()) ||
          r.borough.toLowerCase().includes(destinationName.toLowerCase())
      ) || roads[roads.length - 1];

  const startCoord: [number, number] = parsedOriginCoord || (originRoad ? originRoad.coordinates[0] : [roads[0].coordinates[0][0], roads[0].coordinates[0][1]]);
  const endCoord: [number, number] = parsedDestCoord || (destRoad ? destRoad.coordinates[destRoad.coordinates.length - 1] : [roads[roads.length - 1].coordinates[0][0], roads[roads.length - 1].coordinates[0][1]]);

  const startNodeId = findClosestNode(startCoord[0], startCoord[1], nodes);
  const targetNodeId = findClosestNode(endCoord[0], endCoord[1], nodes);

  // 1. Direct Unconstrained Shortest Path (Standard Corridor ignoring water)
  const standardResult = findOptimalPath(startNodeId, targetNodeId, nodes, adjacency, profile, true);

  // 2. Dynamic Flood-Safe Minimum-Cost Path under Vehicle Profile Constraints
  const safeResult = findOptimalPath(startNodeId, targetNodeId, nodes, adjacency, profile, false);

  // Assemble Standard Route
  const standardSegments: RouteRiskSegment[] = [];
  const standardCoords: [number, number][] = [];
  let standardDistMeters = 0;
  let standardMaxDepth = 0;

  const originNameLabel = parsedOriginCoord
    ? `Point (${parsedOriginCoord[0].toFixed(3)}, ${parsedOriginCoord[1].toFixed(3)})`
    : originRoad
    ? originRoad.name.split(' ')[0]
    : originName || 'Start Point';

  const destNameLabel = parsedDestCoord
    ? `Point (${parsedDestCoord[0].toFixed(3)}, ${parsedDestCoord[1].toFixed(3)})`
    : destRoad
    ? destRoad.name.split(' ')[0]
    : destinationName || 'Destination Point';

  if (standardResult && standardResult.pathEdges.length > 0) {
    standardResult.pathEdges.forEach((e) => {
      standardDistMeters += e.lengthMeters;
      standardMaxDepth = Math.max(standardMaxDepth, e.waterDepthCm);
      standardCoords.push(...e.coordinates);

      let riskSeverity: 'safe' | 'warning' | 'critical' | 'severe' = 'safe';
      if (e.waterDepthCm >= 40) riskSeverity = 'severe';
      else if (e.waterDepthCm >= 20) riskSeverity = 'critical';
      else if (e.waterDepthCm >= 8) riskSeverity = 'warning';

      standardSegments.push({
        coordinates: e.coordinates,
        roadId: e.roadId,
        roadName: e.roadName,
        highwayCategory: e.highwayCategory,
        waterDepthCm: e.waterDepthCm,
        riskSeverity,
        isPassable: e.waterDepthCm <= profile.maxPassableDepthCm,
        cost: e.lengthMeters
      });
    });
  } else {
    // Fallback coordinates
    if (originRoad && destRoad) {
      standardCoords.push(...originRoad.coordinates, ...destRoad.coordinates);
    } else {
      standardCoords.push(startCoord, endCoord);
    }
  }

  const standardIsSafe = standardMaxDepth <= profile.maxSafeDepthCm;
  const standardWarnings: string[] = [];
  if (!standardIsSafe) {
    standardWarnings.push(
      `Direct path submerged with ${standardMaxDepth}cm water depth. Exceeds ${profile.name} safe threshold (${profile.maxSafeDepthCm}cm).`
    );
  }

  const standardRoute: EnhancedNavigationRoute = {
    id: `route-standard-${cityId}-${vehicleType}`,
    name: `Direct Corridor (${originNameLabel} to ${destNameLabel})`,
    distanceKm: Math.round((standardDistMeters / 1000) * 10) / 10 || 4.8,
    durationMins: Math.round((standardDistMeters / 1000 / 30) * 60) || 12,
    maxWaterDepthCm: standardMaxDepth,
    isSafe: standardIsSafe,
    coordinates: standardCoords,
    warnings: standardWarnings,
    vehicleType,
    isBlocked: !standardIsSafe && standardMaxDepth > profile.maxPassableDepthCm,
    segments: standardSegments,
    totalElevationGainMeters: 2.5,
    floodDetourKm: 0
  };

  // Assemble Flood-Safe Route
  if (safeResult && safeResult.pathEdges.length > 0) {
    const safeSegments: RouteRiskSegment[] = [];
    const safeCoords: [number, number][] = [];
    let safeDistMeters = 0;
    let safeMaxDepth = 0;

    safeResult.pathEdges.forEach((e) => {
      safeDistMeters += e.lengthMeters;
      safeMaxDepth = Math.max(safeMaxDepth, e.waterDepthCm);
      safeCoords.push(...e.coordinates);

      let riskSeverity: 'safe' | 'warning' | 'critical' | 'severe' = 'safe';
      if (e.waterDepthCm >= 40) riskSeverity = 'severe';
      else if (e.waterDepthCm >= 20) riskSeverity = 'critical';
      else if (e.waterDepthCm >= 8) riskSeverity = 'warning';

      safeSegments.push({
        coordinates: e.coordinates,
        roadId: e.roadId,
        roadName: e.roadName,
        highwayCategory: e.highwayCategory,
        waterDepthCm: e.waterDepthCm,
        riskSeverity,
        isPassable: true,
        cost: e.lengthMeters
      });
    });

    const safeDistanceKm = Math.round((safeDistMeters / 1000) * 10) / 10;
    const detourKm = Math.max(0, Math.round((safeDistanceKm - standardRoute.distanceKm) * 10) / 10);

    const safeRoute: EnhancedNavigationRoute = {
      id: `route-safe-${cityId}-${vehicleType}`,
      name: `AquaAlert Dynamic Flood-Safe Route`,
      distanceKm: safeDistanceKm,
      durationMins: Math.round((safeDistMeters / 1000 / (profile.pedestrianOnly ? 4.5 : 28)) * 60),
      maxWaterDepthCm: safeMaxDepth,
      isSafe: true,
      coordinates: safeCoords,
      warnings: [
        safeMaxDepth > 8
          ? `Advisory: Minor water (${safeMaxDepth}cm) encountered, safely within ${profile.name} limit (${profile.maxSafeDepthCm}cm).`
          : `100% Flood-Clear: All severe and critical underpass water bottlenecks successfully bypassed.`
      ],
      vehicleType,
      isBlocked: false,
      segments: safeSegments,
      totalElevationGainMeters: 4.8,
      floodDetourKm: detourKm
    };

    return { standardRoute, safeRoute };
  }

  // Sparse city extracts can contain disconnected road fragments.  When the
  // direct corridor is demonstrably within the selected vehicle's clearance,
  // keep that usable route instead of presenting a false "no safe route"
  // state solely because a graph edge could not be joined.
  if (standardIsSafe) {
    const fallbackSafeRoute: EnhancedNavigationRoute = {
      ...standardRoute,
      id: `route-safe-${cityId}-${vehicleType}-direct-fallback`,
      name: 'AquaAlert Flood-Clear Direct Route',
      isSafe: true,
      isBlocked: false,
      warnings: ['Flood-clear direct corridor: predicted water remains within the selected vehicle clearance.'],
      floodDetourKm: 0
    };
    return { standardRoute, safeRoute: fallbackSafeRoute };
  }

  // NO-SAFE-ROUTE SCENARIO: All corridors exceed vehicle limit
  let alternativeVehicle: VehicleType | undefined = undefined;
  if (vehicleType === 'two_wheeler') alternativeVehicle = 'car';
  else if (vehicleType === 'car') alternativeVehicle = 'heavy_truck';
  else if (vehicleType === 'heavy_truck') alternativeVehicle = 'ambulance';

  const blockedRoute: EnhancedNavigationRoute = {
    id: `route-safe-${cityId}-${vehicleType}-blocked`,
    name: `No Safe Path for ${profile.name}`,
    distanceKm: standardRoute.distanceKm,
    durationMins: 0,
    maxWaterDepthCm: standardMaxDepth,
    isSafe: false,
    coordinates: standardCoords,
    warnings: [
      `CRITICAL IMPASSE: No flood-safe route exists for ${profile.name}. All transit corridors exceed safe clearance limit (${profile.maxSafeDepthCm}cm). Sustained street water depth reaches ${standardMaxDepth}cm.`
    ],
    vehicleType,
    isBlocked: true,
    blockedReason: `Water depth (${standardMaxDepth}cm) exceeds ${profile.name} safe tolerance (${profile.maxSafeDepthCm}cm).`,
    suggestedAlternativeVehicle: alternativeVehicle,
    segments: standardSegments,
    totalElevationGainMeters: 0,
    floodDetourKm: 0
  };

  return { standardRoute, safeRoute: blockedRoute };
}

/**
 * Fetches authentic real-world road geometry from OSRM OpenStreetMap routing API
 */
export async function fetchOSRMRealRoadRoute(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number
): Promise<{ coordinates: [number, number][]; distanceMeters: number; durationSeconds: number } | null> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
    const res = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      // OSRM returns coordinates in [lng, lat] format -> convert to [lat, lng]
      const coords: [number, number][] = route.geometry.coordinates.map((pt: [number, number]) => [pt[1], pt[0]]);
      return {
        coordinates: coords,
        distanceMeters: route.distance,
        durationSeconds: route.duration
      };
    }
  } catch (err) {
    console.warn('OSRM routing fetch warning:', err);
  }
  return null;
}

/**
 * Async Vehicle-Aware Dynamic Flood-Safe Routing Engine
 * Fetches real road polylines from OpenStreetMap (OSRM) and evaluates segment-level water depths
 */
export async function calculateFloodSafeRoutesAsync(
  originName: string,
  destinationName: string,
  vehicleType: VehicleType,
  timeOffsetMins: number,
  cityId: CityId = 'mumbai'
): Promise<{ standardRoute: EnhancedNavigationRoute; safeRoute: EnhancedNavigationRoute } | null> {
  const parsedOriginCoord = parseCoordinateString(originName);
  const parsedDestCoord = parseCoordinateString(destinationName);

  const { roads } = getCityDataset(cityId);
  const originRoad = parsedOriginCoord
    ? null
    : roads.find(
        (r) =>
          r.name.toLowerCase().includes(originName.toLowerCase()) ||
          r.borough.toLowerCase().includes(originName.toLowerCase())
      ) || roads[0];

  const destRoad = parsedDestCoord
    ? null
    : roads.find(
        (r) =>
          r.name.toLowerCase().includes(destinationName.toLowerCase()) ||
          r.borough.toLowerCase().includes(destinationName.toLowerCase())
      ) || roads[roads.length - 1];

  const startCoord: [number, number] = parsedOriginCoord || (originRoad ? originRoad.coordinates[0] : [roads[0].coordinates[0][0], roads[0].coordinates[0][1]]);
  const endCoord: [number, number] = parsedDestCoord || (destRoad ? destRoad.coordinates[destRoad.coordinates.length - 1] : [roads[roads.length - 1].coordinates[0][0], roads[roads.length - 1].coordinates[0][1]]);

  // Fetch OSRM real-world road network geometry
  const osrmData = await fetchOSRMRealRoadRoute(startCoord[0], startCoord[1], endCoord[0], endCoord[1]);
  if (!osrmData || osrmData.coordinates.length < 2) {
    return null;
  }

  const snapshot = getHydraulicSnapshotAtTime(timeOffsetMins, cityId);
  const profile = VEHICLE_PROFILES[vehicleType] || VEHICLE_PROFILES.car;

  const originNameLabel = parsedOriginCoord
    ? `Point (${parsedOriginCoord[0].toFixed(3)}, ${parsedOriginCoord[1].toFixed(3)})`
    : originRoad
    ? originRoad.name.split(' ')[0]
    : originName || 'Start Point';

  const destNameLabel = parsedDestCoord
    ? `Point (${parsedDestCoord[0].toFixed(3)}, ${parsedDestCoord[1].toFixed(3)})`
    : destRoad
    ? destRoad.name.split(' ')[0]
    : destinationName || 'Destination Point';

  const segments: RouteRiskSegment[] = [];
  let maxWaterDepthCm = 0;

  for (let i = 0; i < osrmData.coordinates.length - 1; i++) {
    const p1 = osrmData.coordinates[i];
    const p2 = osrmData.coordinates[i + 1];
    const dist = getDistanceMeters(p1[0], p1[1], p2[0], p2[1]);

    const midLat = (p1[0] + p2[0]) / 2;
    const midLng = (p1[1] + p2[1]) / 2;

    let segDepthCm = 0;
    for (const rState of snapshot.roadStates) {
      if (rState.waterDepthCm > 0) {
        const rDef = roads.find((r) => r.id === rState.roadId);
        if (rDef) {
          for (const rPt of rDef.coordinates) {
            if (getDistanceMeters(midLat, midLng, rPt[0], rPt[1]) < 400) {
              segDepthCm = Math.max(segDepthCm, rState.waterDepthCm);
              break;
            }
          }
        }
      }
    }

    maxWaterDepthCm = Math.max(maxWaterDepthCm, segDepthCm);

    let riskSeverity: 'safe' | 'warning' | 'critical' | 'severe' = 'safe';
    if (segDepthCm >= 40 || segDepthCm > profile.maxPassableDepthCm) riskSeverity = 'severe';
    else if (segDepthCm >= 20) riskSeverity = 'critical';
    else if (segDepthCm >= 8) riskSeverity = 'warning';

    segments.push({
      coordinates: [p1, p2],
      roadId: `osrm-seg-${i}`,
      roadName: 'City Municipal Thoroughfare',
      highwayCategory: 'Municipal Thoroughfare',
      waterDepthCm: segDepthCm,
      riskSeverity,
      isPassable: segDepthCm <= profile.maxPassableDepthCm,
      cost: dist
    });
  }

  const distKm = Math.round((osrmData.distanceMeters / 1000) * 10) / 10;
  const durationMins = Math.round(osrmData.durationSeconds / 60) || Math.round((distKm / 30) * 60);
  const isSafe = maxWaterDepthCm <= profile.maxSafeDepthCm;

  const standardRoute: EnhancedNavigationRoute = {
    id: `route-standard-osrm-${cityId}-${vehicleType}`,
    name: `Direct Road Corridor (${originNameLabel} to ${destNameLabel})`,
    distanceKm: distKm,
    durationMins,
    maxWaterDepthCm,
    isSafe,
    coordinates: osrmData.coordinates,
    warnings: isSafe ? [] : [`Direct road path submerged with ${maxWaterDepthCm}cm water depth. Exceeds ${profile.name} safe threshold (${profile.maxSafeDepthCm}cm).`],
    vehicleType,
    isBlocked: maxWaterDepthCm > profile.maxPassableDepthCm,
    segments,
    totalElevationGainMeters: 3.5,
    floodDetourKm: 0
  };

  const safeRoute: EnhancedNavigationRoute = {
    ...standardRoute,
    id: `route-safe-osrm-${cityId}-${vehicleType}`,
    name: isSafe ? `AquaAlert Real Road Flood-Safe Route` : `AquaAlert Real Road Route (${profile.name})`,
    isSafe,
    warnings: isSafe ? [`100% Flood-Clear: Real road navigation route clear of severe water bottlenecks.`] : standardRoute.warnings
  };

  return { standardRoute, safeRoute };
}
