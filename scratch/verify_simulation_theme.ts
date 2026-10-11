import fs from 'fs';
import path from 'path';

console.log('═══════════════════════════════════════════════════════════════════════════');
console.log(' AQUAALERT — SIMULATION THEME & TOKEN SYSTEM AUDIT HARNESS');
console.log('═══════════════════════════════════════════════════════════════════════════\n');

// 1. Verify CSS Tokens in globals.css
console.log('[TEST 1] Verifying CSS tokens in src/app/globals.css...');
const cssPath = path.join(process.cwd(), 'src/app/globals.css');
const cssCode = fs.readFileSync(cssPath, 'utf8');

const expectedCssTokens = [
  '--color-simulation-mode',
  '--color-simulation-banner-bg',
  '--color-simulation-banner-border',
  '--color-historical-reference',
  '--color-historical-reference-bg',
  '--color-historical-reference-border',
  '--color-selection-active',
];

expectedCssTokens.forEach((token) => {
  if (cssCode.includes(token)) {
    console.log(`  ✅ Found token declaration: ${token}`);
  } else {
    console.error(`  ❌ Missing CSS token: ${token}`);
    process.exit(1);
  }
});

// 2. Verify SimulationPage Component Semantic Token Usages
console.log('\n[TEST 2] Verifying semantic token usages in src/app/simulation/page.tsx...');
const simPagePath = path.join(process.cwd(), 'src/app/simulation/page.tsx');
const simPageCode = fs.readFileSync(simPagePath, 'utf8');

const simPageChecks = [
  { term: 'var(--color-selection-active)', name: 'City tab --color-selection-active fill' },
  { term: 'var(--color-historical-reference)', name: 'Historical reference token' },
  { term: 'var(--color-simulation-banner-bg)', name: 'Simulation top banner token' },
  { term: 'var(--surface-base)', name: 'Semantic surface-base background' },
  { term: 'var(--surface-card)', name: 'Semantic surface-card container' },
  { term: 'ThemeToggle', name: 'ThemeToggle header binding' },
];

simPageChecks.forEach((chk) => {
  if (simPageCode.includes(chk.term)) {
    console.log(`  ✅ Found ${chk.name}: "${chk.term}"`);
  } else {
    console.error(`  ❌ Missing ${chk.name} in simulation/page.tsx`);
    process.exit(1);
  }
});

// 3. Verify SimulationTutorialOverlay Semantic Token Usages
console.log('\n[TEST 3] Verifying semantic token usages in SimulationTutorialOverlay.tsx...');
const tutPath = path.join(process.cwd(), 'src/components/SimulationTutorialOverlay.tsx');
const tutCode = fs.readFileSync(tutPath, 'utf8');

const tutChecks = [
  { term: 'var(--surface-elevated)', name: 'Tooltip card background token' },
  { term: 'var(--color-action-primary)', name: 'Next button primary action token' },
  { term: 'var(--color-simulation-mode)', name: 'Spotlight focus ring token' },
  { term: 'var(--text-secondary)', name: 'Text secondary scale token' },
];

tutChecks.forEach((chk) => {
  if (tutCode.includes(chk.term)) {
    console.log(`  ✅ Found ${chk.name}: "${chk.term}"`);
  } else {
    console.error(`  ❌ Missing ${chk.name} in SimulationTutorialOverlay.tsx`);
    process.exit(1);
  }
});

console.log('\n═══════════════════════════════════════════════════════════════════════════');
console.log(' ALL SIMULATION THEME REVAMP AUDIT TESTS PASSED! ✅');
console.log('═══════════════════════════════════════════════════════════════════════════');
