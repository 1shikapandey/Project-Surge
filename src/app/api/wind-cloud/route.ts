import { NextResponse } from 'next/server';
import { fetchLiveWindCloudData } from '@/lib/wind-cloud-service';
import { CityId } from '@/lib/mock-data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = (searchParams.get('city') as CityId) || 'mumbai';
  const timeOffset = parseInt(searchParams.get('time') || '0', 10);

  try {
    const windCloudData = await fetchLiveWindCloudData(city);

    // Find closest timeline forecast entry matching time offset
    const availableTimes = [0, 15, 30, 45, 60, 90, 120, 150, 180];
    let closestTime = availableTimes[0];
    let minDiff = Math.abs(timeOffset - closestTime);

    for (const t of availableTimes) {
      const diff = Math.abs(timeOffset - t);
      if (diff < minDiff) {
        minDiff = diff;
        closestTime = t;
      }
    }

    const timelineItem = windCloudData.timeline.find(t => t.timeOffsetMins === closestTime) || windCloudData.timeline[0];

    return NextResponse.json({
      success: true,
      city,
      timeOffsetMins: closestTime,
      timestamp: windCloudData.timestamp,
      dataSourceStatus: windCloudData.dataSourceStatus,
      statusMessage: windCloudData.statusMessage,
      current: {
        windSpeedKmh: timelineItem ? timelineItem.windSpeedKmh : windCloudData.windSpeedKmh,
        windDirectionDeg: timelineItem ? timelineItem.windDirectionDeg : windCloudData.windDirectionDeg,
        windDirectionCardinal: windCloudData.windDirectionCardinal,
        cloudCoverPct: timelineItem ? timelineItem.cloudCoverPct : windCloudData.cloudCoverPct,
        windBand: windCloudData.windBand,
        cloudBand: windCloudData.cloudBand
      },
      vectorGrid: windCloudData.vectorGrid,
      solverIntegrationHook: windCloudData.solverIntegrationHook
    });
  } catch (err) {
    console.error(`[API /api/wind-cloud] Error fetching wind/cloud data for ${city}:`, err);
    return NextResponse.json(
      {
        success: false,
        city,
        error: 'Failed to fetch wind and cloud cover telemetry',
        dataSourceStatus: 'unavailable'
      },
      { status: 500 }
    );
  }
}
