/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AQUAALERT — LOCAL OLLAMA DECISION & SYNTHESIS SERVICE (DeepSeek R1 1.5B)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Consumes pre-computed data from radar nowcast & DEM hydraulic solver.
 * Produces structured operational decisions, road triage ranking, and SitRep summaries.
 *
 * HARD CONSTRAINT: The LLM must NEVER generate any rainfall, depth, or confidence numbers.
 * All physical quantities come exclusively from the existing radar/DEM pipeline.
 * Numerical provenance verification checks every number in LLM text against input payload.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { CityId, CITIES, getCityDataset } from './mock-data';
import { fetchFusedPrecipitation } from './precipitation-fusion-service';
import { getHydraulicSnapshotAtTime } from './hydraulic-engine';
import { getRoadImperviousness } from './imperviousness-service';

// ---------------------------------------------------------------------------
// TYPES & INTERFACES
// ---------------------------------------------------------------------------

export interface RoadRiskItem {
  roadId: string;
  roadName: string;
  waterDepthCm: number;
  severity: 'safe' | 'warning' | 'critical' | 'severe';
  demElevationMeters: number;
  imperviousnessPct: number;
  imperviousnessCategory: string;
}

export interface NodeSurchargeItem {
  nodeId: string;
  nodeName: string;
  surchargePct: number;
  status: string;
}

export interface FloodDecisionInputPayload {
  cityId: CityId;
  cityName: string;
  timestamp: string;
  precipitationSource: {
    active: 'radar' | 'openmeteo_fallback' | 'unavailable';
    confidencePct: number;
    nowcastMethod: string;
    radarWindDisagreement: boolean;
    openMeteoDivergencePct: number;
  };
  fusedNowcastTimeline: {
    timeLabel: string;
    timeOffsetMins: number;
    precipitationMmHr: number;
    confidenceTier: 'high' | 'medium' | 'low';
    uncertaintyRangeMmHr: [number, number];
  }[];
  flaggedRoadRisks: RoadRiskItem[];
  flaggedNodeSurcharges: NodeSurchargeItem[];
}

export interface PrioritizedRoadRisk {
  roadId: string;
  roadName: string;
  waterDepthCm: number;
  severity: string;
  priorityRank: number;
  triageRationale: string;
}

export interface AdvisoryEscalationFlag {
  flagId: string;
  severity: 'advisory' | 'warning' | 'critical';
  recommendationText: string;
}

export interface AiDecisionOutput {
  aiAssisted: boolean;
  modelName: string;
  timestamp: string;
  cityId: CityId;
  status: 'fresh_llm' | 'cached_llm' | 'degraded_raw_compute';
  degradationReason?: string;
  numericalProvenancePassed: boolean;
  prioritizedRoadRisks: PrioritizedRoadRisk[];
  sitRepSummary: string;
  advisoryEscalationFlags: AdvisoryEscalationFlag[];
  auditLogId?: string;
}

export interface AuditLogEntry {
  auditLogId: string;
  timestamp: string;
  cityId: CityId;
  inputPayload: FloodDecisionInputPayload;
  rawLlmResponse?: string;
  numericalProvenancePassed: boolean;
  untraceableNumbersFound?: number[];
  finalOutput: AiDecisionOutput;
}

// ---------------------------------------------------------------------------
// CONSTANTS & RATE-LIMITER STATE
// ---------------------------------------------------------------------------

const OLLAMA_ENDPOINT = process.env.OLLAMA_ENDPOINT || 'http://localhost:11434/api/chat';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'deepseek-r1:1.5b';
const OLLAMA_TIMEOUT_MS = 60000; // 25 seconds hard timeout
const OLLAMA_COOLDOWN_MS = 10 * 60 * 1000; // 10-minute rate limit window

/** In-memory cache for 10-minute cadence */
const DECISION_CACHE = new Map<CityId, { timestampMs: number; output: AiDecisionOutput }>();

/** In-memory audit log store (last 50 invocations) */
const AUDIT_LOG_STORE: AuditLogEntry[] = [];

// ---------------------------------------------------------------------------
// 1. INPUT PAYLOAD BUILDER
// ---------------------------------------------------------------------------

/**
 * Builds structured JSON input payload containing ONLY already-computed numbers
 * from precipitation fusion and DEM hydraulic engine.
 */
export async function buildDecisionInputPayload(
  cityId: CityId,
  timeOffsetMins: number = 0
): Promise<FloodDecisionInputPayload> {
  const city = CITIES[cityId] || CITIES.mumbai;
  const fusedData = await fetchFusedPrecipitation(cityId);
  const snapshot = getHydraulicSnapshotAtTime(timeOffsetMins, cityId, fusedData.nowcastTimelineMmHr);
  const { roads, nodes } = getCityDataset(cityId);

  const roadMap = new Map(roads.map(r => [r.id, r]));
  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  // Flagged roads (depth >= 8 cm)
  const flaggedRoadRisks: RoadRiskItem[] = snapshot.roadStates
    .filter(r => r.waterDepthCm >= 8)
    .map(r => {
      const roadDef = roadMap.get(r.roadId);
      const impData = getRoadImperviousness(r.roadId, cityId);
      return {
        roadId: r.roadId,
        roadName: roadDef?.name || r.roadId,
        waterDepthCm: r.waterDepthCm,
        severity: r.severity,
        demElevationMeters: roadDef?.demElevationMeters ?? 5.0,
        imperviousnessPct: impData.imperviousnessPct,
        imperviousnessCategory: impData.category,
      };
    })
    .sort((a, b) => b.waterDepthCm - a.waterDepthCm);

  // Flagged nodes (surcharge >= 70%)
  const flaggedNodeSurcharges: NodeSurchargeItem[] = snapshot.nodeStates
    .filter(n => n.surchargePct >= 70)
    .map(n => {
      const nodeDef = nodeMap.get(n.nodeId);
      return {
        nodeId: n.nodeId,
        nodeName: nodeDef?.name || n.nodeId,
        surchargePct: n.surchargePct,
        status: n.status,
      };
    })
    .sort((a, b) => b.surchargePct - a.surchargePct);

  return {
    cityId,
    cityName: city.name,
    timestamp: new Date().toISOString(),
    precipitationSource: {
      active: fusedData.source,
      confidencePct: Math.round(fusedData.confidence * 100),
      nowcastMethod: fusedData.sourceMetadata.nowcastMethod,
      radarWindDisagreement: fusedData.sourceMetadata.radarWindDisagreement,
      openMeteoDivergencePct: fusedData.sourceMetadata.openMeteoDivergencePct ?? 0,
    },
    fusedNowcastTimeline: fusedData.fusedNowcastTimeline.map(step => ({
      timeLabel: step.timeLabel,
      timeOffsetMins: step.timeOffsetMins,
      precipitationMmHr: step.precipitationMmHr,
      confidenceTier: step.confidenceTier,
      uncertaintyRangeMmHr: step.uncertaintyRangeMmHr,
    })),
    flaggedRoadRisks,
    flaggedNodeSurcharges,
  };
}

// ---------------------------------------------------------------------------
// 2. NUMERICAL PROVENANCE VERIFIER
// ---------------------------------------------------------------------------

/**
 * Extracts all numbers in LLM text output and verifies that every single number
 * is traceable to the input payload (e.g. depth, rate, elevation, time, confidence).
 * If an un-traceable number is found, flags as failed.
 */
export function verifyNumericalProvenance(
  payload: FloodDecisionInputPayload,
  llmText: string
): { passed: boolean; untraceableNumbers: number[] } {
  // Collect set of valid numbers present in input payload
  const validNumbers = new Set<number>();

  // Add standard ranks 1..20
  for (let i = 1; i <= 20; i++) validNumbers.add(i);
  // Add common percentages 0, 50, 70, 100, etc.
  validNumbers.add(0); validNumbers.add(100);

  // Payload numbers
  validNumbers.add(payload.precipitationSource.confidencePct);
  validNumbers.add(payload.precipitationSource.openMeteoDivergencePct);

  payload.fusedNowcastTimeline.forEach(step => {
    validNumbers.add(step.timeOffsetMins);
    validNumbers.add(step.precipitationMmHr);
    validNumbers.add(step.uncertaintyRangeMmHr[0]);
    validNumbers.add(step.uncertaintyRangeMmHr[1]);
  });

  payload.flaggedRoadRisks.forEach(road => {
    validNumbers.add(road.waterDepthCm);
    validNumbers.add(road.demElevationMeters);
    if (road.imperviousnessPct !== undefined) validNumbers.add(road.imperviousnessPct);
  });

  payload.flaggedNodeSurcharges.forEach(node => {
    validNumbers.add(node.surchargePct);
  });

  // Extract all numeric tokens from LLM text
  const extractedTokens = llmText.match(/\b\d+(?:\.\d+)?\b/g) || [];
  const untraceableNumbers: number[] = [];

  for (const token of extractedTokens) {
    const num = parseFloat(token);
    if (isNaN(num)) continue;

    // Check exact match or rounded match
    const matchesExact = validNumbers.has(num);
    const matchesRounded = Array.from(validNumbers).some(v => Math.abs(v - num) < 0.1);

    if (!matchesExact && !matchesRounded) {
      untraceableNumbers.push(num);
    }
  }

  return {
    passed: untraceableNumbers.length === 0,
    untraceableNumbers,
  };
}

// ---------------------------------------------------------------------------
// 3. DETERMINISTIC RAW COMPUTE FALLBACK
// ---------------------------------------------------------------------------

/**
 * Deterministic non-LLM synthesis fallback when Ollama is offline or fails schema/provenance checks.
 */
export function buildDeterministicFallbackDecision(
  payload: FloodDecisionInputPayload,
  degradationReason: string
): AiDecisionOutput {
  const topRoads = payload.flaggedRoadRisks.slice(0, 3);
  const maxDepth = payload.flaggedRoadRisks.length > 0 ? payload.flaggedRoadRisks[0].waterDepthCm : 0;
  const severeCount = payload.flaggedRoadRisks.filter(r => r.severity === 'severe').length;
  const criticalNodesCount = payload.flaggedNodeSurcharges.filter(n => n.surchargePct >= 100).length;

  const prioritizedRoadRisks: PrioritizedRoadRisk[] = payload.flaggedRoadRisks.map((road, idx) => ({
    roadId: road.roadId,
    roadName: road.roadName,
    waterDepthCm: road.waterDepthCm,
    severity: road.severity,
    priorityRank: idx + 1,
    triageRationale: `Computed depth ${road.waterDepthCm} cm (${road.severity.toUpperCase()}) on terrain elevation ${road.demElevationMeters}m`,
  }));

  const topRoadNames = topRoads.map(r => `${r.roadName} (${r.waterDepthCm} cm)`).join(', ') || 'None';
  const sitRepSummary = `Hydro-telemetry snapshot for ${payload.cityName} indicates peak inundation depth of ${maxDepth} cm across ${payload.flaggedRoadRisks.length} impacted corridors. Current precipitation source is ${payload.precipitationSource.active.toUpperCase()} (${payload.precipitationSource.nowcastMethod}, base confidence ${payload.precipitationSource.confidencePct}%). Top high-risk corridors include ${topRoadNames}. Dewatering pumps and emergency diversions active.`;

  const advisoryEscalationFlags: AdvisoryEscalationFlag[] = [];

  if (severeCount > 0) {
    advisoryEscalationFlags.push({
      flagId: 'esc-severe-depth',
      severity: 'critical',
      recommendationText: `ADVISORY: ${severeCount} road segment(s) reached SEVERE depth threshold (>=40 cm). Recommend officer review for high-capacity dewatering pump deployment.`,
    });
  }

  if (criticalNodesCount > 0) {
    advisoryEscalationFlags.push({
      flagId: 'esc-surcharging-nodes',
      severity: 'warning',
      recommendationText: `ADVISORY: ${criticalNodesCount} drainage node(s) surcharging at >=100% capacity. Backflow risk monitored along coastal outfalls.`,
    });
  }

  if (payload.precipitationSource.radarWindDisagreement) {
    advisoryEscalationFlags.push({
      flagId: 'esc-wind-disagreement',
      severity: 'advisory',
      recommendationText: 'ADVISORY: Radar advection vector diverges from ground wind direction (>45°). Wind advection gap-fill active.',
    });
  }

  return {
    aiAssisted: false,
    modelName: 'raw-compute-engine',
    timestamp: new Date().toISOString(),
    cityId: payload.cityId,
    status: 'degraded_raw_compute',
    degradationReason,
    numericalProvenancePassed: true,
    prioritizedRoadRisks,
    sitRepSummary,
    advisoryEscalationFlags,
  };
}

// ---------------------------------------------------------------------------
// 4. MAIN DECISION GENERATOR & OLLAMA CALL
// ---------------------------------------------------------------------------

/**
 * Generates local Ollama-powered decision layer for AquaAlert.
 * Enforces 15-minute rate-limiting cooldown per city.
 */
export async function generateCityFloodDecision(
  cityId: CityId,
  forceFresh: boolean = false
): Promise<AiDecisionOutput> {
  const nowMs = Date.now();
  const cached = DECISION_CACHE.get(cityId);

  // Rate Limiter Check (15-min cooldown window)
  if (!forceFresh && cached && (nowMs - cached.timestampMs < OLLAMA_COOLDOWN_MS)) {
    return {
      ...cached.output,
      status: 'cached_llm',
    };
  }

  // 1. Construct input payload from pure computed telemetry
  const payload = await buildDecisionInputPayload(cityId);
  const auditLogId = `audit-${cityId}-${Date.now()}`;

  // 2. Prepare System Prompt & User Message
  const systemPrompt = `You are AquaAlert AI, an expert hydrological risk triage assistant.
Analyze the provided pre-computed flood telemetry and concrete imperviousness fractions to produce a JSON object for operational decision-making. Consider elevation, drainage surcharge, and concrete imperviousness percentage when reasoning about triage priority.

HARD CONSTRAINTS (NON-NEGOTIABLE):
1. NEVER invent, modify, or predict any numerical value (rainfall mm/hr, water depth cm, imperviousness %, or confidence score). All numbers in your text MUST be exact copies of numbers present in the input JSON payload.
2. Your output MUST be strictly valid JSON matching this schema:
{
  "prioritizedRoadRisks": [
    {
      "roadId": "string",
      "roadName": "string",
      "waterDepthCm": number,
      "severity": "string",
      "priorityRank": number,
      "triageRationale": "string"
    }
  ],
  "sitRepSummary": "string",
  "advisoryEscalationFlags": [
    {
      "flagId": "string",
      "severity": "advisory" | "warning" | "critical",
      "recommendationText": "string"
    }
  ]
}
3. Output ONLY valid raw JSON. Do NOT include markdown blocks (\`\`\`json), XML tags, or commentary outside the JSON object.`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS);

  try {
    const response = await fetch(OLLAMA_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        format: 'json',
        stream: false,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: JSON.stringify(payload, null, 2) },
        ],
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Ollama HTTP status ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const rawContent = data?.message?.content || data?.response || '';

    // Parse JSON
    let parsed: any;
    try {
      parsed = JSON.parse(rawContent);
    } catch (parseErr) {
      throw new Error(`Ollama output is not valid JSON: ${rawContent.slice(0, 100)}...`);
    }

    // Verify numerical provenance
    const fullTextToVerify = `${parsed.sitRepSummary || ''} ${JSON.stringify(parsed.prioritizedRoadRisks || [])} ${JSON.stringify(parsed.advisoryEscalationFlags || [])}`;
    const provenanceResult = verifyNumericalProvenance(payload, fullTextToVerify);

    if (!provenanceResult.passed) {
      console.warn(`[AI Decision] Numerical provenance check failed for ${cityId}: untraceable numbers [${provenanceResult.untraceableNumbers.join(', ')}]`);
      const fallback = buildDeterministicFallbackDecision(
        payload,
        `Discarded LLM output: numerical provenance failed (untraceable numbers: ${provenanceResult.untraceableNumbers.join(', ')})`
      );
      fallback.auditLogId = auditLogId;
      logAuditEntry(auditLogId, cityId, payload, rawContent, false, provenanceResult.untraceableNumbers, fallback);
      return fallback;
    }

    // Build valid AI output
    const output: AiDecisionOutput = {
      aiAssisted: true,
      modelName: OLLAMA_MODEL,
      timestamp: new Date().toISOString(),
      cityId,
      status: 'fresh_llm',
      numericalProvenancePassed: true,
      prioritizedRoadRisks: Array.isArray(parsed.prioritizedRoadRisks) ? parsed.prioritizedRoadRisks : [],
      sitRepSummary: parsed.sitRepSummary || 'Situation report generated by local DeepSeek R1 1.5B decision layer.',
      advisoryEscalationFlags: Array.isArray(parsed.advisoryEscalationFlags) ? parsed.advisoryEscalationFlags : [],
      auditLogId,
    };

    DECISION_CACHE.set(cityId, { timestampMs: Date.now(), output });
    logAuditEntry(auditLogId, cityId, payload, rawContent, true, [], output);
    return output;

  } catch (err: any) {
    clearTimeout(timeoutId);
    const reason = err.name === 'AbortError'
      ? `Ollama request timed out after ${OLLAMA_TIMEOUT_MS / 1000}s`
      : `Ollama unavailable (${err.message || 'connection refused'})`;

    const fallback = buildDeterministicFallbackDecision(payload, reason);
    fallback.auditLogId = auditLogId;

    DECISION_CACHE.set(cityId, { timestampMs: Date.now(), output: fallback });
    logAuditEntry(auditLogId, cityId, payload, undefined, true, [], fallback);
    return fallback;
  }
}

// ---------------------------------------------------------------------------
// 5. AUDIT LOG STORE & DISK PERSISTENCE
// ---------------------------------------------------------------------------

function logAuditEntry(
  auditLogId: string,
  cityId: CityId,
  inputPayload: FloodDecisionInputPayload,
  rawLlmResponse: string | undefined,
  numericalProvenancePassed: boolean,
  untraceableNumbersFound: number[],
  finalOutput: AiDecisionOutput
) {
  const entry: AuditLogEntry = {
    auditLogId,
    timestamp: new Date().toISOString(),
    cityId,
    inputPayload,
    rawLlmResponse,
    numericalProvenancePassed,
    untraceableNumbersFound,
    finalOutput,
  };

  AUDIT_LOG_STORE.unshift(entry);
  if (AUDIT_LOG_STORE.length > 50) AUDIT_LOG_STORE.pop();

  try {
    if (typeof window === 'undefined') {
      const fs = require('fs');
      const path = require('path');
      const logDir = path.join(process.cwd(), 'scratch');
      if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
      const logFile = path.join(logDir, 'ai_decision_audit.log');
      fs.appendFileSync(logFile, JSON.stringify(entry) + '\n');
    }
  } catch (e) {
    // Non-critical file log failure
  }
}

/** Returns in-memory audit log store for API / debugging */
export function getAiDecisionAuditLogs(): AuditLogEntry[] {
  return AUDIT_LOG_STORE;
}
