import { TUTORIAL_STEPS, SIMULATION_TUTORIAL_STORAGE_KEY } from '../src/components/SimulationTutorialOverlay';
import fs from 'fs';
import path from 'path';

console.log('═══════════════════════════════════════════════════════════════════════════');
console.log(' AQUAALERT — SIMULATION ENVIRONMENT TUTORIAL OVERLAY AUDIT HARNESS');
console.log('═══════════════════════════════════════════════════════════════════════════\n');

// 1. Verify Storage Key Scoping
console.log('[TEST 1] Verifying Storage Key Scoping...');
if (SIMULATION_TUTORIAL_STORAGE_KEY === 'aquaalert_sim_tutorial_seen') {
  console.log(`  ✅ Storage key correctly scoped: "${SIMULATION_TUTORIAL_STORAGE_KEY}"`);
} else {
  console.error(`  ❌ Invalid storage key: "${SIMULATION_TUTORIAL_STORAGE_KEY}"`);
  process.exit(1);
}

// 2. Verify Step Count & Order
console.log('\n[TEST 2] Verifying Tutorial Steps Sequence & Order...');
console.log(`  Total Tutorial Steps: ${TUTORIAL_STEPS.length}`);
if (TUTORIAL_STEPS.length !== 5) {
  console.error(`  ❌ Expected 5 tutorial steps, found ${TUTORIAL_STEPS.length}`);
  process.exit(1);
}

const expectedSteps = [
  { id: 1, attr: 'sim-banner', name: 'Simulation Mode Safety Banner' },
  { id: 2, attr: 'sim-event-selector', name: 'City & Historical Event Selector' },
  { id: 3, attr: 'sim-map-container', name: 'Interactive Hydraulic Map Canvas' },
  { id: 4, attr: 'sim-playback-controls', name: 'Timeline Playback Controls' },
  { id: 5, attr: 'sim-provenance-badge', name: 'Step Data Provenance Indicator' },
];

expectedSteps.forEach((exp, idx) => {
  const step = TUTORIAL_STEPS[idx];
  if (step.stepId === exp.id && step.dataTut === exp.attr) {
    console.log(`  Step ${step.stepId}: [data-tut="${step.dataTut}"] — "${step.title}" ✅`);
  } else {
    console.error(`  ❌ Mismatch at index ${idx}: expected ${exp.attr}, got ${step.dataTut}`);
    process.exit(1);
  }
});

// 3. Check for data-tut Attributes in SimulationPage
console.log('\n[TEST 3] Verifying data-tut target attributes in src/app/simulation/page.tsx...');
const pagePath = path.join(process.cwd(), 'src/app/simulation/page.tsx');
const pageCode = fs.readFileSync(pagePath, 'utf8');

expectedSteps.forEach((exp) => {
  const attrString = `data-tut="${exp.attr}"`;
  if (pageCode.includes(attrString)) {
    console.log(`  Target attribute found in JSX: ${attrString} ✅`);
  } else {
    console.error(`  ❌ Missing target attribute in page.tsx: ${attrString}`);
    process.exit(1);
  }
});

// 4. Verify Replay Tutorial button presence
console.log('\n[TEST 4] Verifying Replay Tutorial button in page.tsx...');
if (pageCode.includes('Replay Tutorial') && pageCode.includes('setIsTutorialOpen(true)')) {
  console.log('  Replay Tutorial manual trigger button present & bound ✅');
} else {
  console.error('  ❌ Replay Tutorial button missing or unbound');
  process.exit(1);
}

console.log('\n═══════════════════════════════════════════════════════════════════════════');
console.log(' ALL SIMULATION TUTORIAL OVERLAY AUDIT TESTS PASSED! ✅');
console.log('═══════════════════════════════════════════════════════════════════════════');
