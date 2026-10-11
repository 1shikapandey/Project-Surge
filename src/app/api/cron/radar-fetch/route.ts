import { NextResponse } from 'next/server';
import { fetchRadarPrecipitation, RADAR_STATION_CODES, CityId } from '@/lib/radar-imagery-service';
import { getHydraulicSnapshotAtTime } from '@/lib/hydraulic-engine';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PLAN-AGNOSTIC RADAR FETCH PIPELINE ROUTE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Route: /api/cron/radar-fetch
 * Triggers the live radar fetch -> palette decode -> advection vector -> hydraulic solve
 * pipeline for all configured radar stations ('chennai', 'mumbai', 'delhi').
 *
 * Persists decoded grid JSON payloads into Vercel Blob:
 *   radar-history/{station}/{yyyy}/{mm}/{dd}/{HHmm}.json
 *
 * Security: Guarded by Authorization: Bearer <CRON_SECRET> header or ?key=<CRON_SECRET>.
 * Execution budget: ~1–3 seconds, well under Vercel Hobby's 10s function limit.
 * Rate Limiter: Delegated to radar-imagery-service.ts (10-minute cooldown).
 * ═══════════════════════════════════════════════════════════════════════════
 */

function isAuthorized(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET;

  // If CRON_SECRET is not configured in environment, allow local development triggers with warning
  if (!cronSecret) {
    console.warn('[Cron /api/cron/radar-fetch] ⚠️ CRON_SECRET is not set in environment. Allowing request in local dev mode.');
    return true;
  }

  // Check Bearer Token header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token === cronSecret) return true;
  }

  // Check URL query parameter fallback (?key=<CRON_SECRET>)
  const { searchParams } = new URL(request.url);
  const queryKey = searchParams.get('key');
  if (queryKey === cronSecret) return true;

  return false;
}

async function handleRadarFetchPipeline(request: Request) {
  if (!isAuthorized(request)) {
    console.warn('[Cron /api/cron/radar-fetch] ❌ Unauthorized request attempt rejected.');
    return NextResponse.json(
      { success: false, error: 'Unauthorized. Invalid or missing CRON_SECRET token.' },
      { status: 401 }
    );
  }

  const startTime = Date.now();
  const cities: CityId[] = ['chennai', 'mumbai', 'delhi'];
  const results: Record<string, any> = {};

  console.log(`[Cron /api/cron/radar-fetch] Starting scheduled 10-minute radar fetch cycle for ${cities.length} stations...`);

  for (const cityId of cities) {
    const stationCode = RADAR_STATION_CODES[cityId] || cityId;
    try {
      // 1. Fetch & decode GIF, calculate motion vector, and persist parsed JSON grid to Vercel Blob
      const radarResult = await fetchRadarPrecipitation(cityId);

      if (radarResult) {
        // 2. Run light hydraulic snapshot calculation (fast DEM solve)
        const hydraulicSnapshot = getHydraulicSnapshotAtTime(0, cityId, radarResult.nowcastTimelineMmHr);

        results[cityId] = {
          status: 'success',
          stationCode,
          confidence: radarResult.confidence,
          currentPrecipitationMmHr: radarResult.currentPrecipitationMmHr,
          nowcastMethod: radarResult.nowcastMethod,
          motionVector: radarResult.motionVector
            ? `${radarResult.motionVector.speedKmh} km/h @ ${radarResult.motionVector.directionDeg}°`
            : 'insufficient_history',
          gridCellCount: radarResult.rainfallGrid?.length || 0,
          maxWaterDepthCm: hydraulicSnapshot.maxWaterDepthCm,
          floodedRoadsCount: hydraulicSnapshot.totalFloodedRoadsCount,
        };
      } else {
        results[cityId] = {
          status: 'skipped_or_failed',
          stationCode,
          reason: 'Rate limit cooldown active, fetch window not met, or remote image unchanged.',
        };
      }
    } catch (err: any) {
      console.error(`[Cron /api/cron/radar-fetch] Error processing station ${cityId} (${stationCode}):`, err);
      results[cityId] = {
        status: 'error',
        stationCode,
        error: err.message || String(err),
      };
    }
  }

  const durationMs = Date.now() - startTime;
  console.log(`[Cron /api/cron/radar-fetch] Pipeline cycle finished in ${durationMs}ms.`);

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    executionDurationMs: durationMs,
    stationsProcessed: cities.length,
    results,
  });
}

export async function GET(request: Request) {
  return handleRadarFetchPipeline(request);
}

export async function POST(request: Request) {
  return handleRadarFetchPipeline(request);
}
