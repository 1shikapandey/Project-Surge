import { NextRequest, NextResponse } from 'next/server';
import { fetchFusedPrecipitation } from '@/lib/precipitation-fusion-service';
import { fetchLiveWindCloudData } from '@/lib/wind-cloud-service';
import { getHydraulicSnapshotAtTime } from '@/lib/hydraulic-engine';
import { getRadarPipelineStatus } from '@/lib/radar-imagery-service';
import { CityId } from '@/lib/mock-data';

// ─────────────────────────────────────────────────────────────────────────────
// Ollama config — calls local qwen2.5:3b for nowcast reasoning
// ─────────────────────────────────────────────────────────────────────────────
const OLLAMA_ENDPOINT = process.env.OLLAMA_ENDPOINT || 'http://localhost:11434/api/chat';
const OLLAMA_MODEL    = process.env.OLLAMA_MODEL     || 'qwen2.5:3b';
const OLLAMA_TIMEOUT  = 60_000; // 60s — 3b is heavier than 1.5b but more reliable

// ─────────────────────────────────────────────────────────────────────────────
// Strip <think>…</think> reasoning tokens from DeepSeek R1 output
// ─────────────────────────────────────────────────────────────────────────────
function stripThinking(text: string): string {
  // DeepSeek sometimes leaves unclosed <think> tags.
  // We'll just remove the standard block if it exists.
  let cleaned = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  // If there's still a <think> tag (unclosed), and the JSON is before or after it:
  // Actually, we'll just let the JSON parser extract it safely.
  return cleaned;
}

// ─────────────────────────────────────────────────────────────────────────────
// Parse Ollama JSON — handles markdown fences, extra text, nested JSON
// ─────────────────────────────────────────────────────────────────────────────
function parseNowcastJSON(raw: string): Record<string, unknown> | null {
  if (!raw) return null;

  // Strip markdown code fences (```json ... ``` or ``` ... ```)
  let cleaned = raw.replace(/```(?:json)?[\s\S]*?```/g, (m) =>
    m.replace(/```(?:json)?/g, '').replace(/```/g, '')
  ).trim();

  // Strip inline backtick wrapping
  cleaned = cleaned.replace(/^`+|`+$/g, '').trim();

  // Find the first { and the last }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  
  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
    return null;
  }

  // Extract just the JSON block
  const jsonString = cleaned.substring(firstBrace, lastBrace + 1);

  try {
    const parsed = JSON.parse(jsonString);

    // Validate required fields exist — if model dropped any, fill defaults
    if (!parsed.riskLevel) parsed.riskLevel = 'LOW';
    if (!parsed.headline) parsed.headline = 'AI Nowcast Analysis Complete';
    if (!parsed.confidence) parsed.confidence = 60;
    if (!parsed.outlook) parsed.outlook = { now: 'Analyzing...', plus30min: '-', plus60min: '-', plus90min: '-' };
    if (!parsed.keyRisks || !Array.isArray(parsed.keyRisks)) parsed.keyRisks = ['Monitoring conditions'];
    if (!parsed.recommendation) parsed.recommendation = 'Monitor live updates from authorities.';
    if (!parsed.reasoning) parsed.reasoning = 'Analysis based on sensor data inputs.';

    // Normalize riskLevel to uppercase
    parsed.riskLevel = String(parsed.riskLevel).toUpperCase();
    if (!['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(parsed.riskLevel)) {
      parsed.riskLevel = 'LOW';
    }

    return parsed;
  } catch {
    // JSON was malformed — try regex extraction as last resort
    const fallback: Record<string, any> = {
      riskLevel: 'LOW',
      headline: 'AI Assessment (Partial)',
      outlook: { now: 'Analyzing...', plus30min: '-', plus60min: '-', plus90min: '-' },
      keyRisks: ['Sensor data being processed'],
      recommendation: 'Continue monitoring localized sensors.',
      confidence: 40,
      reasoning: 'Model response parsed partially. RAW: ' + raw.substring(0, 200),
    };

    const riskMatch = jsonString.match(/"riskLevel"\s*:\s*"([^"]+)"/i);
    if (riskMatch?.[1]) fallback.riskLevel = riskMatch[1].toUpperCase();

    const headMatch = jsonString.match(/"headline"\s*:\s*"([^"]+)"/i);
    if (headMatch?.[1]) fallback.headline = headMatch[1];

    const confMatch = jsonString.match(/"confidence"\s*:\s*(\d+)/i);
    if (confMatch?.[1]) fallback.confidence = parseInt(confMatch[1], 10);

    const reasMatch = jsonString.match(/"reasoning"\s*:\s*"([^"]+)"/i);
    if (reasMatch?.[1]) fallback.reasoning = reasMatch[1];

    return fallback;
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// Build the structured flood nowcast prompt — simplified for 1.5b model
// ─────────────────────────────────────────────────────────────────────────────
function buildNowcastPrompt(data: {
  city: string;
  rainfallNow: number;
  timeline: number[];
  windSpeedKmh: number;
  windDirectionCardinal: string;
  windBand: string;
  cloudCoverPct: number;
  radarSource: string;
  radarFreshness: string;
  radarConfidence: number;
  maxWaterDepthCm: number;
  floodedRoadsCount: number;
  surchargingManholes: number;
  domainAdvectionKmH: number;
}): string {
  const t = data.timeline;
  const tlStr = t.map((v, i) => `${i * 30}min:${v.toFixed(1)}`).join(' ');

  // Determine risk level from inputs to hint the model
  const depthCm = data.maxWaterDepthCm;
  const rain = data.rainfallNow;
  const hintRisk = depthCm >= 30 || rain >= 50 ? 'CRITICAL' : depthCm >= 20 || rain >= 30 ? 'HIGH' : depthCm >= 10 || rain >= 15 ? 'MEDIUM' : 'LOW';

  return `You are a flood risk AI for ${data.city}. Output ONLY a JSON object with these EXACT keys.

Sensor data:
Rain: ${data.rainfallNow.toFixed(1)} mm/h | Forecast: ${tlStr}
Wind: ${data.windSpeedKmh.toFixed(1)} km/h ${data.windDirectionCardinal}
Roads flooded: ${data.floodedRoadsCount} | Max depth: ${data.maxWaterDepthCm}cm | Manholes surcharging: ${data.surchargingManholes}
Hint: risk is likely ${hintRisk}

Return this JSON structure (fill in the values based on the data above):
{"riskLevel":"${hintRisk}","headline":"one sentence summary","outlook":{"now":"current situation","plus30min":"30 min forecast","plus60min":"60 min forecast","plus90min":"90 min forecast"},"keyRisks":["risk one","risk two","risk three"],"recommendation":"what citizens should do","confidence":75,"reasoning":"brief reasoning"}

riskLevel MUST be exactly one of: LOW, MEDIUM, HIGH, CRITICAL`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Call Ollama — with format:"json" to force structured JSON output
// ─────────────────────────────────────────────────────────────────────────────
async function callOllama(prompt: string): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT);

  try {
    const res = await fetch(OLLAMA_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        stream: false,
        format: 'json',          // ← Forces Ollama to output valid JSON at tokenizer level
        messages: [{ role: 'user', content: prompt }],
        options: { temperature: 0.15, num_predict: 600, top_k: 20, top_p: 0.9 },
      }),
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Ollama HTTP ${res.status}`);
    }

    const data = await res.json();
    const raw = data?.message?.content || data?.response || '';
    return stripThinking(raw);
  } catch (err: any) {
    clearTimeout(timeoutId);
    throw new Error(`Ollama failed: ${err.message}`);
  }
}




// ─────────────────────────────────────────────────────────────────────────────
// POST /api/nowcast-predict
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const body = await req.json().catch(() => ({}));
  const city = (body.city as CityId) || 'mumbai';
  const timeOffset = typeof body.timeOffset === 'number' ? body.timeOffset : 0;

  try {
    // 1. Fetch all live data in parallel
    const [fusedData, windData, radarStatus] = await Promise.all([
      fetchFusedPrecipitation(city),
      fetchLiveWindCloudData(city).catch(() => null),
      Promise.resolve(getRadarPipelineStatus(city)),
    ]);

    const snapshot = getHydraulicSnapshotAtTime(timeOffset, city, fusedData.nowcastTimelineMmHr);

    // 2. Build input payload
    const payload = {
      city: city.toUpperCase(),
      rainfallNow: fusedData.currentPrecipitationMmHr,
      timeline: fusedData.nowcastTimelineMmHr.slice(0, 7), // 0–3hr in 30-min steps
      windSpeedKmh: windData?.windSpeedKmh ?? 0,
      windDirectionCardinal: windData?.windDirectionCardinal ?? 'N/A',
      windBand: windData?.windBand ?? 'calm',
      cloudCoverPct: windData?.cloudCoverPct ?? 50,
      radarSource: fusedData.source,
      radarFreshness: fusedData.sourceMetadata.radarFreshness ?? 'unknown',
      radarConfidence: Math.round(fusedData.confidence * 100),
      maxWaterDepthCm: snapshot.maxWaterDepthCm,
      floodedRoadsCount: snapshot.totalFloodedRoadsCount,
      surchargingManholes: snapshot.criticalSurchargeNodesCount,
      domainAdvectionKmH: windData?.windSpeedKmh ?? 12,
    };

    // 3. Build prompt and call Ollama
    const prompt = buildNowcastPrompt(payload);
    const rawResponse = await callOllama(prompt);

    // 4. Parse JSON from model response
    const parsed = parseNowcastJSON(rawResponse);

    if (!parsed) {
      // Model responded but not valid JSON — return raw text
      return NextResponse.json({
        success: true,
        provider: 'ollama',
        model: OLLAMA_MODEL,
        city,
        latencyMs: Date.now() - startTime,
        rawResponse,
        prediction: null,
        sensorPayload: payload,
        error: 'Model response was not valid JSON. Raw response included.',
      });
    }

    return NextResponse.json({
      success: true,
      provider: 'ollama',
      model: OLLAMA_MODEL,
      city,
      latencyMs: Date.now() - startTime,
      prediction: parsed,
      sensorPayload: payload,
    });

  } catch (err: any) {
    console.error('[nowcast-predict] Error:', err.message);

    // Fallback deterministic prediction when Ollama is offline
    const snapshot = getHydraulicSnapshotAtTime(timeOffset, city, undefined);
    const risk = snapshot.maxWaterDepthCm >= 30 ? 'CRITICAL'
      : snapshot.maxWaterDepthCm >= 20 ? 'HIGH'
      : snapshot.maxWaterDepthCm >= 10 ? 'MEDIUM'
      : 'LOW';

    return NextResponse.json({
      success: false,
      provider: 'fallback',
      model: 'deterministic-engine',
      city,
      latencyMs: Date.now() - startTime,
      error: err.message,
      prediction: {
        riskLevel: risk,
        headline: `${risk} flood risk — hydraulic engine estimate`,
        outlook: {
          now: `${snapshot.maxWaterDepthCm} cm max inundation on ${snapshot.totalFloodedRoadsCount} road(s).`,
          plus30min: 'Conditions based on current precipitation trajectory.',
          plus60min: 'Monitor live radar for updates.',
          plus90min: 'Situation may evolve with changing rainfall intensity.',
        },
        keyRisks: [
          `${snapshot.criticalSurchargeNodesCount} manholes surcharging`,
          `${snapshot.totalFloodedRoadsCount} road(s) flooded`,
          'Ollama offline — AI prediction unavailable',
        ],
        recommendation: risk === 'LOW' ? 'No immediate action required. Monitor updates.' : 'Avoid low-lying roads. Follow authority advisories.',
        confidence: 55,
      },
      sensorPayload: null,
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/nowcast-predict — health check
// ─────────────────────────────────────────────────────────────────────────────
export async function GET() {
  // Quick ping to Ollama to check if it's running
  try {
    const res = await fetch('http://localhost:11434/api/tags', {
      method: 'GET',
      signal: AbortSignal.timeout(3000),
    });
    const data = await res.json().catch(() => ({}));
    const models: string[] = (data?.models || []).map((m: { name: string }) => m.name);

    return NextResponse.json({
      ollamaOnline: true,
      targetModel: OLLAMA_MODEL,
      modelAvailable: models.some(m => m.includes('deepseek-r1')),
      availableModels: models,
    });
  } catch {
    return NextResponse.json({
      ollamaOnline: false,
      targetModel: OLLAMA_MODEL,
      modelAvailable: false,
      availableModels: [],
    });
  }
}

