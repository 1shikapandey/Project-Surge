/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SIMULATION PLAYBACK ORCHESTRATOR
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Precomputes all simulation frames from historical event data using the
 * EXISTING hydraulic engine (getHydraulicSnapshotAtTime). Detects state
 * transitions between frames and emits typed playback events.
 *
 * ZERO modifications to any main system file. This module READS from
 * existing services via their public APIs only.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { getHydraulicSnapshotAtTime, type NowcastTimeStep } from '@/lib/hydraulic-engine';
import { buildDeterministicFallbackDecision, buildDecisionInputPayload, type AiDecisionOutput } from '@/lib/flood-decision-service';
import { getPumpingStationsForCity } from '@/lib/pumping-station-service';
import { getCityDataset } from '@/lib/mock-data';
import type { CityId } from '@/lib/mock-data';
import type { HistoricalImpactMarker } from '@/components/OpenLayersMapCanvas';
import type {
  HistoricalEventMeta,
  SimulationFrame,
  SimulationPlaybackEvent,
} from '@/context/SimulationContext';

// ---------------------------------------------------------------------------
// 1. FRAME PRECOMPUTATION
// ---------------------------------------------------------------------------

/**
 * Precomputes all hydraulic snapshots for every timestep in the historical event.
 * Called ONCE at simulation start. Uses the real hydraulic engine with the event's
 * precipitation timeline as input.
 */
export function precomputeAllFrames(
  event: HistoricalEventMeta,
  pumpStates?: Record<string, boolean>
): SimulationFrame[] {
  const cityId = event.cityId;
  const precipTimeline = event.timeSeriesProfile.map((s) => s.precipitationMmHr);

  return event.timeSeriesProfile.map((step, idx) => {
    const snapshot = getHydraulicSnapshotAtTime(
      step.timeOffsetMins,
      cityId,
      precipTimeline,
      pumpStates
    );

    // Build deterministic AI triage using existing pure-function fallback
    const aiDecision = buildSimulationAiDecision(snapshot, event, cityId, idx);

    return {
      stepIndex: idx,
      timeOffsetMins: step.timeOffsetMins,
      timeLabel: step.timeLabel,
      precipitationMmHr: step.precipitationMmHr,
      confidence: step.confidence,
      provenanceNote: step.provenanceNote,
      snapshot,
      aiDecision,
    };
  });
}

// ---------------------------------------------------------------------------
// 2. DETERMINISTIC AI DECISION BUILDER (for simulation frames)
// ---------------------------------------------------------------------------

function buildSimulationAiDecision(
  snapshot: NowcastTimeStep,
  event: HistoricalEventMeta,
  cityId: CityId,
  stepIndex: number
): AiDecisionOutput {
  const { roads, nodes } = getCityDataset(cityId);
  const roadMap = new Map(roads.map((r) => [r.id, r]));

  // Build a minimal payload structure from the snapshot
  const flaggedRoadRisks = snapshot.roadStates
    .filter((r) => r.waterDepthCm >= 8)
    .map((r) => {
      const roadDef = roadMap.get(r.roadId);
      return {
        roadId: r.roadId,
        roadName: roadDef?.name || r.roadId,
        waterDepthCm: r.waterDepthCm,
        severity: r.severity,
        demElevationMeters: roadDef?.demElevationMeters ?? 5.0,
        imperviousnessPct: 70,
        imperviousnessCategory: 'high',
      };
    })
    .sort((a, b) => b.waterDepthCm - a.waterDepthCm);

  const flaggedNodeSurcharges = snapshot.nodeStates
    .filter((n) => n.surchargePct >= 70)
    .map((n) => ({
      nodeId: n.nodeId,
      nodeName: n.nodeId,
      surchargePct: n.surchargePct,
      status: n.status,
    }))
    .sort((a, b) => b.surchargePct - a.surchargePct);

  const payload = {
    cityId,
    cityName: event.cityName,
    timestamp: new Date().toISOString(),
    precipitationSource: {
      active: 'openmeteo_fallback' as const,
      confidencePct: 85,
      nowcastMethod: 'Historical IMD Record Replay',
      radarWindDisagreement: false,
      openMeteoDivergencePct: 0,
    },
    fusedNowcastTimeline: event.timeSeriesProfile.map((s) => ({
      timeLabel: s.timeLabel,
      timeOffsetMins: s.timeOffsetMins,
      precipitationMmHr: s.precipitationMmHr,
      confidenceTier: 'high' as const,
      uncertaintyRangeMmHr: [s.precipitationMmHr * 0.9, s.precipitationMmHr * 1.1] as [number, number],
    })),
    flaggedRoadRisks,
    flaggedNodeSurcharges,
  };

  const decision = buildDeterministicFallbackDecision(
    payload,
    `Simulation replay — ${event.eventTitle} (Step ${stepIndex + 1}/${event.timeSeriesProfile.length})`
  );

  // Tag as simulation
  decision.modelName = 'simulation-replay-engine';
  decision.sitRepSummary = `[SIMULATION] ${decision.sitRepSummary}`;

  return decision;
}

// ---------------------------------------------------------------------------
// 3. FRAME DELTA DETECTION — EVENT MAPPING TABLE
// ---------------------------------------------------------------------------

/**
 * Declarative mapping table for state transitions.
 *
 * | Delta Type                  | Threshold           | Event Type                    |
 * |-----------------------------|---------------------|-------------------------------|
 * | road severity band crossing | depth crosses 8/20/40| severity_band_crossing        |
 * | manhole surcharge crossing  | capacity >= 100%    | surcharge_threshold_crossing  |
 * | manhole surface overflow    | overflowCm > 0      | surcharge_threshold_crossing  |
 * | pump auto-activation needed | surcharge >= 100%   | pump_auto_activation          |
 * | historical hotspot match    | step time in range  | historical_hotspot_relevant   |
 */

function getSeverityBand(depthCm: number): 'safe' | 'warning' | 'critical' | 'severe' {
  if (depthCm >= 40) return 'severe';
  if (depthCm >= 20) return 'critical';
  if (depthCm >= 8) return 'warning';
  return 'safe';
}

const SEVERITY_RANK: Record<string, number> = { safe: 0, warning: 1, critical: 2, severe: 3 };

function mapSeverityToEventSeverity(sev: string): 'info' | 'warning' | 'critical' | 'severe' {
  if (sev === 'severe') return 'severe';
  if (sev === 'critical') return 'critical';
  if (sev === 'warning') return 'warning';
  return 'info';
}

/**
 * Compares two consecutive frames and emits events for state transitions.
 */
export function computeFrameDeltas(
  prevFrame: SimulationFrame | null,
  currentFrame: SimulationFrame,
  event: HistoricalEventMeta,
  cityId: CityId
): SimulationPlaybackEvent[] {
  const events: SimulationPlaybackEvent[] = [];
  const stepIdx = currentFrame.stepIndex;
  const { roads } = getCityDataset(cityId);
  const roadMap = new Map(roads.map((r) => [r.id, r]));

  const prevRoadMap = new Map(
    (prevFrame?.snapshot.roadStates || []).map((r) => [r.roadId, r])
  );
  const prevNodeMap = new Map(
    (prevFrame?.snapshot.nodeStates || []).map((n) => [n.nodeId, n])
  );

  // 1. Road severity band crossings
  for (const roadState of currentFrame.snapshot.roadStates) {
    const prevRoad = prevRoadMap.get(roadState.roadId);
    const prevBand = prevRoad ? getSeverityBand(prevRoad.waterDepthCm) : 'safe';
    const currBand = getSeverityBand(roadState.waterDepthCm);

    if (SEVERITY_RANK[currBand] > SEVERITY_RANK[prevBand]) {
      const roadDef = roadMap.get(roadState.roadId);
      events.push({
        id: `sbc-${stepIdx}-${roadState.roadId}`,
        stepIndex: stepIdx,
        type: 'severity_band_crossing',
        title: `${roadDef?.name || roadState.roadId} → ${currBand.toUpperCase()}`,
        description: `Water depth increased to ${roadState.waterDepthCm} cm (from ${prevRoad?.waterDepthCm || 0} cm). Severity escalated from ${prevBand} to ${currBand}.`,
        severity: mapSeverityToEventSeverity(currBand),
        relatedFeatureId: roadState.roadId,
        timestamp: currentFrame.timeLabel,
      });
    }
  }

  // 2. Manhole surcharge threshold crossings
  for (const nodeState of currentFrame.snapshot.nodeStates) {
    const prevNode = prevNodeMap.get(nodeState.nodeId);
    const prevPct = prevNode?.surchargePct || 0;
    const currPct = nodeState.surchargePct;

    // Crossed 100% threshold
    if (currPct >= 100 && prevPct < 100) {
      events.push({
        id: `stc-${stepIdx}-${nodeState.nodeId}`,
        stepIndex: stepIdx,
        type: 'surcharge_threshold_crossing',
        title: `Node ${nodeState.nodeId} SURCHARGING`,
        description: `Drainage node surcharge reached ${currPct}% (crossed 100% threshold). Backflow risk active.`,
        severity: 'critical',
        relatedFeatureId: nodeState.nodeId,
        timestamp: currentFrame.timeLabel,
      });

      // Auto-trigger pump activation
      events.push({
        id: `paa-${stepIdx}-${nodeState.nodeId}`,
        stepIndex: stepIdx,
        type: 'pump_auto_activation',
        title: `Pump auto-activated for ${nodeState.nodeId}`,
        description: `SCADA auto-trigger: dewatering pump activated in response to ${currPct}% surcharge. [SIMULATION AUTO-TRIGGER]`,
        severity: 'warning',
        relatedFeatureId: nodeState.nodeId,
        timestamp: currentFrame.timeLabel,
      });
    }
  }

  // 3. Historical hotspot relevance (check if any affected area's crossRef matches current state)
  for (const area of event.affectedAreas) {
    const roadState = currentFrame.snapshot.roadStates.find(
      (r) => r.roadId === area.crossRefRoadId
    );
    if (roadState && roadState.waterDepthCm >= 15 && stepIdx >= 2) {
      // Only emit once per area (check if already emitted)
      const alreadyEmitted = events.some(
        (e) => e.type === 'historical_hotspot_relevant' && e.relatedFeatureId === area.crossRefRoadId
      );
      if (!alreadyEmitted) {
        events.push({
          id: `hhr-${stepIdx}-${area.crossRefRoadId}`,
          stepIndex: stepIdx,
          type: 'historical_hotspot_relevant',
          title: `Historical Record: ${area.hotspotName}`,
          description: `${area.impactDescription} (Recorded: ${area.recordedDepthRangeCm[0]}–${area.recordedDepthRangeCm[1]} cm, ${area.boroughOrZone})`,
          severity: 'severe',
          relatedFeatureId: area.crossRefRoadId,
          timestamp: currentFrame.timeLabel,
        });
      }
    }
  }

  return events;
}

// ---------------------------------------------------------------------------
// 4. BATCH DELTA COMPUTATION (for scrubbing consistency)
// ---------------------------------------------------------------------------

/**
 * Computes all accumulated events from step 0 to targetStep.
 * Ensures UI state is always consistent even when scrubbing rapidly.
 */
export function batchApplyDeltasUpToStep(
  frames: SimulationFrame[],
  targetStep: number,
  event: HistoricalEventMeta,
  cityId: CityId
): SimulationPlaybackEvent[] {
  const allEvents: SimulationPlaybackEvent[] = [];
  const seenHotspots = new Set<string>();

  for (let i = 0; i <= Math.min(targetStep, frames.length - 1); i++) {
    const prevFrame = i > 0 ? frames[i - 1] : null;
    const deltas = computeFrameDeltas(prevFrame, frames[i], event, cityId);

    for (const delta of deltas) {
      // Deduplicate historical hotspot events
      if (delta.type === 'historical_hotspot_relevant') {
        const key = delta.relatedFeatureId || delta.id;
        if (seenHotspots.has(key)) continue;
        seenHotspots.add(key);
      }
      allEvents.push(delta);
    }
  }

  return allEvents;
}

// ---------------------------------------------------------------------------
// 5. HISTORICAL IMPACT MARKER BUILDER
// ---------------------------------------------------------------------------

/**
 * Builds map overlay markers from the event's affected areas data.
 * Uses crossRefRoadId to resolve coordinates from the city dataset.
 */
export function buildHistoricalImpactMarkers(
  event: HistoricalEventMeta,
  cityId: CityId
): HistoricalImpactMarker[] {
  const { roads } = getCityDataset(cityId);
  const roadMap = new Map(roads.map((r) => [r.id, r]));

  return event.affectedAreas.map((area) => {
    const road = roadMap.get(area.crossRefRoadId);
    // Use road coordinates if available, otherwise use city center as fallback
    const coords = road?.coordinates?.[0] || [0, 0];

    return {
      hotspotName: area.hotspotName,
      boroughOrZone: area.boroughOrZone,
      recordedDepthRangeCm: area.recordedDepthRangeCm,
      impactDescription: area.impactDescription,
      lat: coords[0] || 19.02,
      lng: coords[1] || 72.85,
    };
  });
}

// ---------------------------------------------------------------------------
// 6. AUTO PUMP STATE COMPUTATION
// ---------------------------------------------------------------------------

/**
 * Determines which pumps should be auto-activated based on
 * surcharging nodes in the current snapshot.
 */
export function computeAutoPumpStates(
  snapshot: NowcastTimeStep,
  cityId: CityId
): Record<string, boolean> {
  const stations = getPumpingStationsForCity(cityId);
  const surchargingNodes = new Set(
    snapshot.nodeStates
      .filter((n) => n.surchargePct >= 100)
      .map((n) => n.nodeId)
  );

  const pumpStates: Record<string, boolean> = {};
  for (const station of stations) {
    // Activate pumps connected to surcharging drainage nodes
    if (surchargingNodes.has(station.connectedDrainId)) {
      pumpStates[station.id] = true;
    } else {
      pumpStates[station.id] = station.isOperational;
    }
  }

  return pumpStates;
}
