// Unified CI Test Runner for AI Logic Simulator
// Usage: node tests/run_all_tests.js

const { execSync } = require('child_process');
const path = require('path');

const testSuites = [
  { name: 'Comprehensive & Logic Hardening Suite', script: 'comprehensive_test_suite.js' },
  { name: 'Security & Penetration Audit Suite', script: 'security_audit.js' },
  { name: 'Stress & Feedback Loop Resilience Suite', script: 'stress_test.js' },
  { name: 'Simulation Engine Performance Benchmark', script: 'benchmark_sim.js' },
  { name: 'Orthogonal Layout & Beauty Evaluation Suite', script: 'layout_eval.js' }
];

console.log('================================================================');
console.log('             AI LOGIC SIMULATOR - ALL TEST SUITES               ');
console.log('================================================================\n');

let allPassed = true;

for (const suite of testSuites) {
  console.log(`\n>>> EXECUTING: ${suite.name} (${suite.script})`);
  try {
    const fullPath = path.join(__dirname, suite.script);
    const output = execSync(`node "${fullPath}"`, { encoding: 'utf8' });
    console.log(output);
  } catch (err) {
    allPassed = false;
    console.error(`FAILED: ${suite.name}`);
    if (err.stdout) console.error(err.stdout);
    if (err.stderr) console.error(err.stderr);
  }
}

console.log('================================================================');
if (allPassed) {
  console.log('   ALL TEST SUITES PASSED SUCCESSFULLY (SYSTEM FULLY HARDENED)  ');
} else {
  console.log('   ONE OR MORE TEST SUITES FAILED                              ');
  process.exit(1);
}
console.log('================================================================\n');
