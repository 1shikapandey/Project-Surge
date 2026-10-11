import {
  getAllHistoricalEvents,
  getHistoricalEventsForCity,
  getHistoricalEventById,
  getEventTimelineForHydraulicSolver
} from '../src/lib/historical-events-service';
import { getHydraulicSnapshotAtTime } from '../src/lib/hydraulic-engine';
import { CityId } from '../src/lib/mock-data';

async function runHistoricalEventsVerification() {
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log(' AQUAALERT — AUTHENTIC HISTORICAL FLOOD EVENTS DATASET AUDIT HARNESS');
  console.log('═══════════════════════════════════════════════════════════════════════════\n');

  const events = getAllHistoricalEvents();
  console.log(`[TEST 1] Total Curated Historical Events: ${events.length}`);

  if (events.length < 9) {
    console.error(`❌ FAILED: Expected at least 9 curated events, found ${events.length}`);
    process.exit(1);
  }

  const cities: CityId[] = ['mumbai', 'delhi', 'chennai'];

  for (const cityId of cities) {
    const cityEvents = getHistoricalEventsForCity(cityId);
    console.log(`\n  City: ${cityId.toUpperCase()} (${cityEvents.length} events curated):`);

    for (const ev of cityEvents) {
      console.log(`  - Event ID: ${ev.eventId}`);
      console.log(`    Title: "${ev.eventTitle}"`);
      console.log(`    Date: ${ev.date} | 24h Total: ${ev.totalRainfall24hMm} mm | Peak Rate: ${ev.peakIntensityMmHr} mm/h`);
      console.log(`    Primary Citation: ${ev.primarySourceCitation.agency} — "${ev.primarySourceCitation.documentName}"`);
      console.log(`    Affected Corridors: ${ev.affectedAreas.length} hotspots registered`);
      
      const exactCount = ev.timeSeriesProfile.filter(p => p.confidence === 'exact_imd_record').length;
      const interpCount = ev.timeSeriesProfile.filter(p => p.confidence === 'interpolated').length;
      console.log(`    Time-Series Points: ${ev.timeSeriesProfile.length} steps (${exactCount} Exact IMD, ${interpCount} Interpolated)`);

      // Integrity Assertions
      if (!ev.primarySourceCitation.agency || !ev.primarySourceCitation.documentName) {
        console.error(`❌ FAILED: Event ${ev.eventId} is missing primary source citation!`);
        process.exit(1);
      }

      if (ev.affectedAreas.length === 0) {
        console.error(`❌ FAILED: Event ${ev.eventId} has no affected areas listed!`);
        process.exit(1);
      }

      if (exactCount === 0) {
        console.error(`❌ FAILED: Event ${ev.eventId} has zero exact IMD record points!`);
        process.exit(1);
      }
    }
  }

  // TEST 2: Hydraulic Engine Solver Integration Test
  console.log('\n[TEST 2] Testing Hydraulic Engine Solver Integration with Curated Events...');

  const testEvents = [
    { id: 'mumbai-2005-07-26', cityId: 'mumbai' as CityId },
    { id: 'chennai-2015-12-01', cityId: 'chennai' as CityId },
    { id: 'delhi-2024-06-28', cityId: 'delhi' as CityId }
  ];

  for (const testEv of testEvents) {
    const timeline = getEventTimelineForHydraulicSolver(testEv.id);
    const snapshot = getHydraulicSnapshotAtTime(60, testEv.cityId, timeline);

    console.log(`\n  Running Solver for Event [${testEv.id}]:`);
    console.log(`  - 9-Step Timeline: [${timeline.join(', ')}] mm/h`);
    console.log(`  - Max Inundation Depth at T+60m: ${snapshot.maxWaterDepthCm} cm`);
    console.log(`  - Flooded Roads Count: ${snapshot.totalFloodedRoadsCount}`);
    console.log(`  - Surcharging Manholes: ${snapshot.criticalSurchargeNodesCount}`);

    if (snapshot.maxWaterDepthCm <= 0) {
      console.error(`❌ FAILED: Solver produced 0 max water depth for historical event ${testEv.id}`);
      process.exit(1);
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════════════════════');
  console.log(' ALL HISTORICAL FLOOD DATASET & CITATION AUDIT TESTS PASSED! ✅');
  console.log('═══════════════════════════════════════════════════════════════════════════');
}

runHistoricalEventsVerification().catch(err => {
  console.error('Fatal harness error:', err);
  process.exit(1);
});
