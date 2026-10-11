/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AQUAALERT — HISTORICAL FLOOD REPLAY SIMULATION API ROUTE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Serves precomputed historical simulation frames tagged strictly with
 * `isSimulation: true`. Completely decoupled from live radar endpoints.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { NextResponse } from 'next/server';
import { runHistoricalEventSimulation, getSimulationFrame } from '@/lib/simulation-engine';
import { getAllHistoricalEvents } from '@/lib/historical-events-service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get('eventId');
  const stepParam = searchParams.get('step');

  // If no eventId specified, return list of available curated simulation events
  if (!eventId) {
    const availableEvents = getAllHistoricalEvents();
    return NextResponse.json({
      success: true,
      isSimulation: true,
      availableEventsCount: availableEvents.length,
      events: availableEvents.map(e => ({
        eventId: e.eventId,
        cityId: e.cityId,
        cityName: e.cityName,
        eventTitle: e.eventTitle,
        date: e.date,
        totalRainfall24hMm: e.totalRainfall24hMm,
        peakIntensityMmHr: e.peakIntensityMmHr,
        citationAgency: e.primarySourceCitation.agency,
      })),
    }, {
      headers: { 'X-AquaAlert-Simulation': 'true' }
    });
  }

  try {
    // If step=all requested, return full precomputed 9-step simulation run
    if (stepParam === 'all') {
      const fullRun = await runHistoricalEventSimulation(eventId);
      return NextResponse.json({
        success: true,
        ...fullRun,
      }, {
        headers: { 'X-AquaAlert-Simulation': 'true' }
      });
    }

    // Default: return single frame for current step index (or step 0)
    const stepIndex = parseInt(stepParam || '0', 10);
    const frame = await getSimulationFrame(eventId, stepIndex);

    if (!frame) {
      return NextResponse.json(
        { success: false, error: `Historical event '${eventId}' not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      ...frame,
    }, {
      headers: { 'X-AquaAlert-Simulation': 'true' }
    });

  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Simulation engine error' },
      { status: 500 }
    );
  }
}
