import { runHistoricalEventSimulation, getSimulationFrame, getSimulationCacheStats } from '../src/lib/simulation-engine';
import { getAllHistoricalEvents } from '../src/lib/historical-events-service';

async function runSimulationEngineVerification() {
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log(' AQUAALERT — HISTORICAL FLOOD REPLAY SIMULATION ENGINE AUDIT HARNESS');
  console.log('═══════════════════════════════════════════════════════════════════════════\n');

  const events = getAllHistoricalEvents();
  console.log(`[TEST 1] Precomputing Full Up-Front Timelines for ${events.length} Historical Events...`);

  const benchmarkResults: { id: string; timeMs: number; frames: number; peakDepth: number }[] = [];

  for (const ev of events) {
    const t0 = Date.now();
    const run = await runHistoricalEventSimulation(ev.eventId, true);
    const elapsed = Date.now() - t0;

    const frame0 = run.frames[0];
    const peakFrame = run.frames.reduce((max, f) => f.hydraulicSnapshot.maxWaterDepthCm > max.hydraulicSnapshot.maxWaterDepthCm ? f : max, run.frames[0]);

    benchmarkResults.push({
      id: ev.eventId,
      timeMs: elapsed,
      frames: run.frames.length,
      peakDepth: peakFrame.hydraulicSnapshot.maxWaterDepthCm,
    });

    console.log(`  - Event: ${ev.eventId} (${ev.cityName})`);
    console.log(`    Precomputed ${run.frames.length} frames in ${elapsed}ms`);
    console.log(`    isSimulation Flag: ${run.isSimulation ? 'TRUE ✅' : 'FALSE ❌'}`);
    console.log(`    Peak Hydraulic Water Depth: ${peakFrame.hydraulicSnapshot.maxWaterDepthCm} cm`);
    console.log(`    Primary Citation: ${frame0.primarySourceCitation.agency}`);

    // Assertions
    if (!run.isSimulation) {
      console.error(`❌ FAILED: Event ${ev.eventId} run missing isSimulation: true flag!`);
      process.exit(1);
    }

    if (run.frames.length !== ev.timeSeriesProfile.length) {
      console.error(`❌ FAILED: Frame count mismatch for ${ev.eventId}`);
      process.exit(1);
    }
  }

  // TEST 2: Frame Retrieval & Confidence Tag Verification
  console.log('\n[TEST 2] Testing Frame Retrieval & Step Confidence Flags...');
  const testFrameExact = await getSimulationFrame('mumbai-2005-07-26', 4); // T+60m peak
  const testFrameInterp = await getSimulationFrame('mumbai-2005-07-26', 3); // T+45m interp

  if (!testFrameExact || !testFrameInterp) {
    console.error('❌ FAILED: getSimulationFrame returned null for test event.');
    process.exit(1);
  }

  console.log(`  Frame T+60m Confidence: ${testFrameExact.stepConfidence} | Note: "${testFrameExact.provenanceNote}"`);
  console.log(`  Frame T+45m Confidence: ${testFrameInterp.stepConfidence} | Note: "${testFrameInterp.provenanceNote}"`);

  if (testFrameExact.stepConfidence !== 'exact_imd_record') {
    console.error('❌ FAILED: T+60m frame should be exact_imd_record');
    process.exit(1);
  }

  if (testFrameInterp.stepConfidence !== 'interpolated') {
    console.error('❌ FAILED: T+45m frame should be interpolated');
    process.exit(1);
  }

  // TEST 3: Schema Identity Verification
  console.log('\n[TEST 3] Verifying Output Schema Identity with Live Hydraulic Snapshots...');
  const snapshot = testFrameExact.hydraulicSnapshot;
  console.log(`  Hydraulic Snapshot Properties:`);
  console.log(`  - rainfallRateMmHr: ${snapshot.rainfallRateMmHr} mm/h`);
  console.log(`  - maxWaterDepthCm: ${snapshot.maxWaterDepthCm} cm`);
  console.log(`  - totalFloodedRoadsCount: ${snapshot.totalFloodedRoadsCount}`);
  console.log(`  - roadStates count: ${snapshot.roadStates.length}`);
  console.log(`  - nodeStates count: ${snapshot.nodeStates.length}`);
  console.log(`  - physicsManholes count: ${snapshot.physicsManholes?.length || 0}`);

  if (!snapshot.roadStates || snapshot.roadStates.length === 0) {
    console.error('❌ FAILED: Hydraulic snapshot missing roadStates array!');
    process.exit(1);
  }

  const cacheStats = getSimulationCacheStats();
  console.log(`\n  Simulation Cache Stats: ${cacheStats.totalRuns} events precomputed in memory.`);

  console.log('\n═══════════════════════════════════════════════════════════════════════════');
  console.log(' ALL SIMULATION ENGINE AUDIT & BENCHMARK TESTS PASSED! ✅');
  console.log('═══════════════════════════════════════════════════════════════════════════');
}

runSimulationEngineVerification().catch(err => {
  console.error('Fatal harness error:', err);
  process.exit(1);
});
