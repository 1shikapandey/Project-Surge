import { NextResponse } from 'next/server';
import { getRadarPipelineStatus } from '@/lib/radar-imagery-service';
import { CityId } from '@/lib/mock-data';

/**
 * GET /api/radar-status?city=chennai
 *
 * Lightweight endpoint exposing the current state of the radar imagery
 * pipeline: fetch cadence, cooldown, image hash, confidence, etc.
 * Used by the UI badge and internal monitoring.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = (searchParams.get('city') as CityId) || 'chennai';

  try {
    const status = getRadarPipelineStatus(city);

    return NextResponse.json({
      success: true,
      ...status,
    });
  } catch (err) {
    console.error(`[API /api/radar-status] Error for ${city}:`, err);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve radar pipeline status' },
      { status: 500 }
    );
  }
}
