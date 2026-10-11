import { NextResponse } from 'next/server';
import {
  getValidationMetrics,
  getValidationSummary,
  getHistoricalValidationMetricsFromBlob,
} from '@/lib/radar-validation-service';
import { CityId } from '@/lib/mock-data';

/**
 * GET /api/radar-validation?city=chennai&startDate=2026-09-01&endDate=2026-09-20
 *
 * Internal monitoring endpoint surfacing radar decode accuracy metrics.
 * NOT citizen-facing — intended for the authority dashboard / ops team.
 *
 * Supports querying historical Vercel Blob records when startDate/endDate or useBlob=true are provided.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city') as CityId | null;
  const startDate = searchParams.get('startDate') || undefined;
  const endDate = searchParams.get('endDate') || undefined;
  const useBlob = searchParams.get('useBlob') === 'true';

  try {
    if (city && (startDate || endDate || useBlob)) {
      const historicalMetrics = await getHistoricalValidationMetricsFromBlob(city, startDate, endDate);
      return NextResponse.json({ success: true, ...historicalMetrics });
    }

    if (city) {
      const metrics = getValidationMetrics(city);
      return NextResponse.json({ success: true, ...metrics });
    }

    // No city specified → return global summary
    const summary = getValidationSummary();
    return NextResponse.json({ success: true, ...summary });
  } catch (err) {
    console.error(`[API /api/radar-validation] Error:`, err);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve validation metrics' },
      { status: 500 }
    );
  }
}
