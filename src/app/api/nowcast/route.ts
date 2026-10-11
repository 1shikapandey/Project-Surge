import { NextResponse } from 'next/server';
import { fetchOpenMeteoLivePrecipitation, HISTORICAL_CLOUDBURST_EVENTS } from '@/lib/openmeteo-service';
import { fetchFusedPrecipitation } from '@/lib/precipitation-fusion-service';
import { CityId } from '@/lib/mock-data';
import { generateCityFloodDecision } from '@/lib/flood-decision-service';
import { fetchLiveImperviousnessData } from '@/lib/imperviousness-service';
import { getHistoricalEventById } from '@/lib/historical-events-service';
import { getHydraulicSnapshotAtTime } from '@/lib/hydraulic-engine';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const timeOffset = parseInt(searchParams.get('time') || '0', 10);
  const city = (searchParams.get('city') as CityId) || 'mumbai';
  const eventId = searchParams.get('eventId');

  // If historical cloudburst event selected for backtesting, use historical event dataset
  if (eventId) {
    const historicalEventDetail = getHistoricalEventById(eventId);
    const historicalEvent = HISTORICAL_CLOUDBURST_EVENTS.find(e => e.id === eventId);

    if (historicalEvent) {
      const openMeteoData = {
        cityId: city,
        latitude: 0,
        longitude: 0,
        timestamp: historicalEvent.dateStr,
        currentPrecipitationMmHr: historicalEvent.timelineMmHr[0],
        weatherCode: 95,
        weatherDescription: historicalEvent.title,
        isDrySpell: false,
        nowcastTimelineMmHr: historicalEvent.timelineMmHr,
        source: `IMD & Government Historical Archive [${historicalEvent.dateStr}]`
      };

      const snapshot = getHydraulicSnapshotAtTime(timeOffset, city, openMeteoData.nowcastTimelineMmHr);
      const aiDecision = await generateCityFloodDecision(city);

      return NextResponse.json({
        success: true,
        city,
        timestamp: openMeteoData.timestamp,
        forecastLeadTimeMins: snapshot.timeOffsetMins,
        timeLabel: snapshot.timeLabel,
        historicalEventDetail,
        openMeteoTelemetry: {
          source: openMeteoData.source,
          currentPrecipitationMmHr: openMeteoData.currentPrecipitationMmHr,
          weatherDescription: openMeteoData.weatherDescription,
          isDrySpell: openMeteoData.isDrySpell,
          nowcastTimelineMmHr: openMeteoData.nowcastTimelineMmHr
        },
        precipitationSource: {
          active: 'openmeteo_fallback' as const,
          lastUpdated: openMeteoData.timestamp,
          confidence: 0,
          radarFreshness: 'unavailable' as const,
          radarStationCode: null,
        },
        metrics: {
          maxWaterDepthCm: snapshot.maxWaterDepthCm,
          floodedRoadsCount: snapshot.totalFloodedRoadsCount,
          surchargingManholesCount: snapshot.criticalSurchargeNodesCount
        },
        windCloudTelemetry: snapshot.windCloudData,
        roadStates: snapshot.roadStates,
        aiDecision
      });
    }
  }

  // LIVE MODE: Use the multi-source precipitation fusion service
  const fusedData = await fetchFusedPrecipitation(city);
  const imperviousnessTelemetry = await fetchLiveImperviousnessData(city);
  const snapshot = getHydraulicSnapshotAtTime(timeOffset, city, fusedData.nowcastTimelineMmHr);
  const aiDecision = await generateCityFloodDecision(city);

  return NextResponse.json({
    success: true,
    city,
    timestamp: fusedData.lastUpdated,
    forecastLeadTimeMins: snapshot.timeOffsetMins,
    timeLabel: snapshot.timeLabel,
    fusedNowcastTimeline: fusedData.fusedNowcastTimeline,
    openMeteoTelemetry: {
      source: fusedData.source === 'radar'
        ? `Live Radar (${fusedData.sourceMetadata.nowcastMethod} — station: ${fusedData.sourceMetadata.radarStationCode})`
        : fusedData.source === 'openmeteo_fallback'
        ? 'Open-Meteo Live API (api.open-meteo.com)'
        : 'No Live Precipitation Data',
      currentPrecipitationMmHr: fusedData.currentPrecipitationMmHr,
      weatherDescription: fusedData.weatherDescription,
      isDrySpell: fusedData.isDrySpell,
      nowcastTimelineMmHr: fusedData.nowcastTimelineMmHr
    },
    precipitationSource: {
      active: fusedData.source,
      lastUpdated: fusedData.lastUpdated,
      confidence: fusedData.confidence,
      radarFreshness: fusedData.sourceMetadata.radarFreshness,
      radarStationCode: fusedData.sourceMetadata.radarStationCode,
      nowcastMethod: fusedData.sourceMetadata.nowcastMethod,
      motionVector: fusedData.sourceMetadata.motionVector,
      radarWindDisagreement: fusedData.sourceMetadata.radarWindDisagreement,
      openMeteoDivergencePct: fusedData.sourceMetadata.openMeteoDivergencePct,
    },
    imperviousnessTelemetry,
    metrics: {
      maxWaterDepthCm: snapshot.maxWaterDepthCm,
      floodedRoadsCount: snapshot.totalFloodedRoadsCount,
      surchargingManholesCount: snapshot.criticalSurchargeNodesCount
    },
    windCloudTelemetry: snapshot.windCloudData,
    roadStates: snapshot.roadStates,
    aiDecision
  });
}
