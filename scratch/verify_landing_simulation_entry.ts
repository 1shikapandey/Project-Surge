import fs from 'fs';
import path from 'path';
import { SIMULATION_TUTORIAL_STORAGE_KEY } from '../src/components/SimulationTutorialOverlay';

console.log('═══════════════════════════════════════════════════════════════════════════');
console.log(' AQUAALERT — LANDING PAGE SIMULATION ENTRY POINT AUDIT HARNESS');
console.log('═══════════════════════════════════════════════════════════════════════════\n');

// 1. Verify LandingPage.tsx JSX content
console.log('[TEST 1] Verifying LandingPage.tsx simulation entry card...');
const landingPath = path.join(process.cwd(), 'src/components/LandingPage.tsx');
const landingCode = fs.readFileSync(landingPath, 'utf8');

const checks = [
  { term: 'href="/simulation"', name: 'Link to /simulation route' },
  { term: 'Experience a Real Flood Simulation', name: 'Card Title' },
  { term: 'July 2005 Mumbai benchmark', name: 'Honest description text' },
  { term: '⚠️ HISTORICAL REPLAY DEMO', name: 'Replay safety badge' },
  { term: 'Launch Simulation Sandbox', name: 'CTA button text' },
];

checks.forEach((chk) => {
  if (landingCode.includes(chk.term)) {
    console.log(`  ✅ Found ${chk.name}: "${chk.term}"`);
  } else {
    console.error(`  ❌ Missing ${chk.name} in LandingPage.tsx`);
    process.exit(1);
  }
});

// 2. Verify SimulationPage auto-launch tutorial effect
console.log('\n[TEST 2] Verifying SimulationPage auto-tutorial launch logic...');
const simPagePath = path.join(process.cwd(), 'src/app/simulation/page.tsx');
const simPageCode = fs.readFileSync(simPagePath, 'utf8');

if (
  simPageCode.includes('SIMULATION_TUTORIAL_STORAGE_KEY') &&
  simPageCode.includes('setIsTutorialOpen(true)') &&
  simPageCode.includes('localStorage.getItem')
) {
  console.log(`  ✅ SimulationPage correctly reads "${SIMULATION_TUTORIAL_STORAGE_KEY}" from localStorage to auto-launch tutorial overlay.`);
} else {
  console.error('  ❌ SimulationPage missing auto-launch tutorial logic.');
  process.exit(1);
}

console.log('\n═══════════════════════════════════════════════════════════════════════════');
console.log(' ALL LANDING PAGE SIMULATION ENTRY TESTS PASSED! ✅');
console.log('═══════════════════════════════════════════════════════════════════════════');
