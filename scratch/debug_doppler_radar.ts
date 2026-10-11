import { fetchRadarPrecipitation, getRadarPipelineStatus } from '../src/lib/radar-imagery-service';
import { fetchFusedPrecipitation } from '../src/lib/precipitation-fusion-service';

async function debugDoppler() {
  console.log('====================================================');
  console.log(' DOPPLER RADAR DIAGNOSTIC & STATUS AUDIT');
  console.log('====================================================\n');

  for (const city of ['chennai', 'mumbai', 'delhi'] as const) {
    console.log(`[TESTING CITY: ${city.toUpperCase()}]`);
    
    // Check status first
    const statusBefore = getRadarPipelineStatus(city);
    console.log(' Pipeline Status Before:', statusBefore);

    try {
      console.log(` Attempting live fetch for ${city}...`);
      const result = await fetchRadarPrecipitation(city);
      console.log(' Radar Direct Result:', result ? {
        source: result.source,
        confidence: result.confidence,
        stationCode: result.stationCode,
        gridLength: result.rainfallGrid?.length,
        currentPrecipitationMmHr: result.currentPrecipitationMmHr,
        matchedPixelCount: result.matchedPixelCount,
        totalPixelCount: result.totalPixelCount
      } : 'NULL (Fetch Failed)');
    } catch (err: any) {
      console.error(` Exception during radar fetch for ${city}:`, err?.message || err);
    }

    try {
      console.log(` Attempting fused fetch for ${city}...`);
      const fused = await fetchFusedPrecipitation(city);
      console.log(' Fused Result Source:', fused.source);
      console.log(' Fused Metadata:', fused.sourceMetadata);
    } catch (err: any) {
      console.error(` Exception during fused fetch for ${city}:`, err?.message || err);
    }
    console.log('----------------------------------------------------\n');
  }
}

debugDoppler();
