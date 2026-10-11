import { getAllHistoricalEvents } from '../src/lib/historical-events-service';
import { getSimulationFrame } from '../src/lib/simulation-engine';

async function runSimulationUiVerification() {
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log(' AQUAALERT — HISTORICAL REPLAY SIMULATION UI (/simulation) VERIFICATION');
  console.log('═══════════════════════════════════════════════════════════════════════════\n');

  const events = getAllHistoricalEvents();
  console.log(`[TEST 1] Auditing ${events.length} Curated Historical Events for /simulation Replay...`);

  for (const ev of events) {
    const frame = await getSimulationFrame(ev.eventId, 0);

    if (!frame) {
      console.error(`❌ FAILED: getSimulationFrame returned null for ${ev.eventId}`);
      process.exit(1);
    }

    console.log(`  - Event: ${ev.eventId} (${ev.eventTitle})`);
    console.log(`    Date: ${ev.date} | 24h Rain: ${ev.totalRainfall24hMm}mm | Peak Rate: ${ev.peakIntensityMmHr}mm/h`);
    console.log(`    Citation: ${frame.primarySourceCitation.agency} — "${frame.primarySourceCitation.documentName}"`);
    console.log(`    Historical Impact Pins: ${frame.affectedAreas.length} hotspots mapped`);
    console.log(`    isSimulation Flag: ${frame.isSimulation ? 'TRUE ✅' : 'FALSE ❌'}`);
    console.log(`    Initial Step Confidence: ${frame.stepConfidence} (${frame.provenanceNote})\n`);

    if (!frame.isSimulation) {
      console.error(`❌ FAILED: Frame missing isSimulation: true tag!`);
      process.exit(1);
    }
  }

  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log(' ALL /simulation DASHBOARD & REPLAY TESTS PASSED SUCCESSFULLY! ✅');
  console.log('═══════════════════════════════════════════════════════════════════════════');
}

runSimulationUiVerification().catch(err => {
  console.error('Fatal harness error:', err);
  process.exit(1);
});
