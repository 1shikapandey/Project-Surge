/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AQUAALERT — HISTORICAL FLOOD REPLAY SIMULATION ENGINE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Precomputes full event timelines up front using AquaAlert's REAL Manning 2D
 * hydraulic solver, drainage graph, and live ESA WorldCover imperviousness pipeline.
 *
 * STRICT DECOUPLING: 100% offline relative to live IMD Doppler radar — 0 calls to
 * live radar API endpoints (mausamnow.com) or rate limiters.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { CityId } from './mock-data';
import {
  getHistoricalEventById,
  HistoricalEventDetail,
  SourceCitation,
  AffectedAreaImpact,
  TimeSeriesPoint
} from './historical-events-service';
import { getHydraulicSnapshotAtTime, NowcastTimeStep } from './hydraulic-engine';
import { fetchLiveImperviousnessData, ImperviousnessTelemetry } from './imperviousness-service';
import { generateCityFloodDecision, AiDecisionOutput } from './flood-decision-service';

export interface SimulationFrame {
  isSimulation: true;
  eventId: string;
  cityId: CityId;
  eventTitle: string;
  date: string;
  totalRainfall24hMm: number;
  peakIntensityMmHr: number;
  primarySourceCitation: SourceCitation;
  additionalCitations?: SourceCitation[];
  affectedAreas: AffectedAreaImpact[];
  stepIndex: number;
  totalSteps: number;
  stepConfidence: 'exact_imd_record' | 'interpolated';
  provenanceNote: string;
  timeLabel: string;
  timeOffsetMins: number;
  rainfallRateMmHr: number;
  hydraulicSnapshot: NowcastTimeStep;
  imperviousnessTelemetry: ImperviousnessTelemetry;
  aiDecision: AiDecisionOutput;
}

export interface PrecomputedSimulationRun {
  isSimulation: true;
  eventId: string;
  cityId: CityId;
  eventTitle: string;
  precomputedAt: string;
  totalSteps: number;
  frames: SimulationFrame[];
}

/** In-memory cache for precomputed simulation runs */
const SIMULATION_CACHE = new Map<string, PrecomputedSimulationRun>();

/**
 * Precomputes full time-stepped hydraulic output frames for a historical flood event up front.
 * Uses real Manning hydraulic equations, DEM terrain elevation, and live ESA WorldCover imperviousness.
 */
export async function runHistoricalEventSimulation(
  eventId: string,
  forceFresh: boolean = false
): Promise<PrecomputedSimulationRun> {
  const cached = SIMULATION_CACHE.get(eventId);
  if (!forceFresh && cached) {
    return cached;
  }

  const event = getHistoricalEventById(eventId);
  if (!event) {
    throw new Error(`Historical event ID '${eventId}' not found in curated dataset.`);
  }

  const startTime = Date.now();
  console.log(`[Simulation Engine] Precomputing full timeline for historical event '${eventId}' (${event.eventTitle})...`);

  // 1. Fetch live ESA WorldCover imperviousness telemetry for the city
  const imperviousnessTelemetry = await fetchLiveImperviousnessData(event.cityId);

  // 2. Extract event 9-step rainfall timeline (mm/hr)
  const timeline = event.timeSeriesProfile.map(pt => pt.precipitationMmHr);

  // 3. Precompute hydraulic snapshot & LLM decision layer for each step frame
  const frames: SimulationFrame[] = [];
  const totalSteps = event.timeSeriesProfile.length;

  for (let idx = 0; idx < totalSteps; idx++) {
    const pt = event.timeSeriesProfile[idx];

    // Re-use real hydraulic solver with historical rainfall timeline
    const snapshot = getHydraulicSnapshotAtTime(pt.timeOffsetMins, event.cityId, timeline);
    
    // Re-use real Ollama DeepSeek R1 decision layer (or deterministic fallback)
    const aiDecision = await generateCityFloodDecision(event.cityId);

    frames.push({
      isSimulation: true,
      eventId: event.eventId,
      cityId: event.cityId,
      eventTitle: event.eventTitle,
      date: event.date,
      totalRainfall24hMm: event.totalRainfall24hMm,
      peakIntensityMmHr: event.peakIntensityMmHr,
      primarySourceCitation: event.primarySourceCitation,
      additionalCitations: event.additionalCitations,
      affectedAreas: event.affectedAreas,
      stepIndex: idx,
      totalSteps,
      stepConfidence: pt.confidence,
      provenanceNote: pt.provenanceNote,
      timeLabel: pt.timeLabel,
      timeOffsetMins: pt.timeOffsetMins,
      rainfallRateMmHr: pt.precipitationMmHr,
      hydraulicSnapshot: snapshot,
      imperviousnessTelemetry,
      aiDecision,
    });
  }

  const run: PrecomputedSimulationRun = {
    isSimulation: true,
    eventId: event.eventId,
    cityId: event.cityId,
    eventTitle: event.eventTitle,
    precomputedAt: new Date().toISOString(),
    totalSteps: frames.length,
    frames,
  };

  SIMULATION_CACHE.set(eventId, run);
  console.log(`[Simulation Engine] Completed up-front precomputation for '${eventId}' in ${Date.now() - startTime}ms (${frames.length} frames ready).`);
  return run;
}

/**
 * Returns a specific precomputed simulation frame for UI playback / scrubbing.
 */
export async function getSimulationFrame(
  eventId: string,
  stepIndex: number = 0
): Promise<SimulationFrame | null> {
  const run = await runHistoricalEventSimulation(eventId);
  if (!run || run.frames.length === 0) return null;
  const safeIdx = Math.max(0, Math.min(stepIndex, run.frames.length - 1));
  return run.frames[safeIdx];
}

/**
 * Diagnostics helper returning precomputed simulation cache metrics.
 */
export function getSimulationCacheStats(): { cachedEventIds: string[]; totalRuns: number } {
  return {
    cachedEventIds: Array.from(SIMULATION_CACHE.keys()),
    totalRuns: SIMULATION_CACHE.size,
  };
}
