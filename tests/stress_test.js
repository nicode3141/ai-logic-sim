// Automated Stress & Resilience (Pen-Test) Suite for AI Logic Simulator
// Usage: node tests/stress_test.js

const fs = require('fs');
const path = require('path');

// 1. Mock Browser Environment
const mockCtx = {
  fill: () => {}, stroke: () => {}, clearRect: () => {}, fillRect: () => {}, strokeRect: () => {},
  save: () => {}, restore: () => {}, setTransform: () => {}, scale: () => {}, translate: () => {},
  measureText: () => ({ width: 10 }), beginPath: () => {}, closePath: () => {}, moveTo: () => {},
  lineTo: () => {}, arc: () => {}, arcTo: () => {}, quadraticCurveTo: () => {}, bezierCurveTo: () => {},
  fillText: () => {}, strokeText: () => {}, rect: () => {}, roundRect: () => {},
  setLineDash: () => {}, getLineDash: () => []
};

const createMockElem = (id = '') => ({
  id, textContent: '', value: '10', width: 1200, height: 800,
  addEventListener: () => {}, removeEventListener: () => {},
  querySelectorAll: () => [], querySelector: () => null,
  appendChild: () => {}, removeChild: () => {},
  classList: { add: () => {}, remove: () => {}, toggle: () => {}, contains: () => false },
  style: {}, getContext: () => mockCtx,
  parentElement: { getBoundingClientRect: () => ({ width: 1200, height: 800 }) },
  getBoundingClientRect: () => ({ left: 0, top: 0, width: 1200, height: 800 })
});

const window = {
  addEventListener: () => {}, removeEventListener: () => {},
  devicePixelRatio: 1, innerWidth: 1920, innerHeight: 1080
};

const document = {
  getElementById: (id) => createMockElem(id),
  querySelectorAll: () => [],
  querySelector: () => null,
  createElement: (tag) => createMockElem(tag),
  body: createMockElem('body'),
  activeElement: null
};

const localStorage = { getItem: () => null, setItem: () => {} };

// 2. Load index.html logic
const htmlPath = path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const scriptMatch = html.match(/<script[\s\S]*?>([\s\S]*?)<\/script>/i);
if (!scriptMatch) throw new Error('No script tag found in index.html');

const evalFn = new Function('window', 'document', 'localStorage', scriptMatch[1] + '; return { LogicSimApp, Circuit, Component, Wire, BooleanParser };');
const { LogicSimApp, Circuit, Component, Wire, BooleanParser } = evalFn(window, document, localStorage);

console.log('======================================================');
console.log('       AI LOGIC SIMULATOR - STRESS & PEN TEST SUITE   ');
console.log('======================================================\n');

let passedTests = 0;
let totalTests = 0;

function assertTest(name, fn) {
  totalTests++;
  try {
    const t0 = Date.now();
    fn();
    const dt = Date.now() - t0;
    console.log(`[PASS] ${name} (${dt}ms)`);
    passedTests++;
  } catch (err) {
    console.error(`[FAIL] ${name}: ${err.message}`);
  }
}

// TEST 1: Ring Oscillator Stability (Cycles and Feedback)
assertTest('Resilience against tight circular inverter feedback loop', () => {
  const app = new LogicSimApp();
  const c = app.circuit;

  // 3-inverter ring oscillator
  const inv1 = c.addComponent('NOT', 100, 100);
  const inv2 = c.addComponent('NOT', 200, 100);
  const inv3 = c.addComponent('NOT', 300, 100);

  c.addWire(inv1.id, 0, inv2.id, 0);
  c.addWire(inv2.id, 0, inv3.id, 0);
  c.addWire(inv3.id, 0, inv1.id, 0);

  // Run 1,000 simulation steps
  for (let i = 0; i < 1000; i++) {
    c.step();
  }
});

// TEST 2: High Gate Count Stress Test (1,000 cascaded gates)
assertTest('Scalability under 1,000 cascaded gates', () => {
  const app = new LogicSimApp();
  const c = app.circuit;

  const count = 1000;
  let prevComp = c.addComponent('SWITCH', 0, 0);
  prevComp.outputs[0].value = 1;

  for (let i = 0; i < count; i++) {
    const nextComp = c.addComponent(i % 2 === 0 ? 'BUFFER' : 'NOT', (i + 1) * 20, 0);
    c.addWire(prevComp.id, 0, nextComp.id, 0);
    prevComp = nextComp;
  }

  const t0 = Date.now();
  for (let s = 0; s < 50; s++) {
    c.step();
  }
  const elapsed = Date.now() - t0;
  if (elapsed > 3000) {
    throw new Error(`Simulation took too long: ${elapsed}ms for 50 steps on 1000 gates`);
  }
});

// TEST 3: Malformed JSON Input Resilience (Fuzz/Pen-testing)
assertTest('Robustness against corrupted/fuzzed circuit JSON input', () => {
  const corruptedPresets = [
    { components: [{ id: null, type: 'UNKNOWN_TYPE_XYZ' }], wires: [] },
    { components: [{ id: 'c1', type: 'AND', x: NaN, y: Infinity }], wires: [{ fromCompId: 'c1', toCompId: 'ghost' }] },
    { components: [], wires: [{ fromCompId: 'a', fromPin: 9999, toCompId: 'b', toPin: -5 }] },
    { components: [{ id: 'self_loop', type: 'AND' }], wires: [{ fromCompId: 'self_loop', fromPin: 0, toCompId: 'self_loop', toPin: 0 }] }
  ];

  for (const corrupted of corruptedPresets) {
    const app = new LogicSimApp();
    try {
      app.circuit.fromJSON(corrupted);
      app.circuit.step();
      app.autoLayoutCircuit();
    } catch (e) {
      // Must fail safely without crashing process
    }
  }
});

// TEST 4: BooleanParser Expression Fuzzing
if (BooleanParser) {
  assertTest('BooleanParser AST stress and edge-case syntax parsing', () => {
    const testCases = [
      'A & B | C ^ D',
      '!(A & (B | !C))',
      '((((A))))',
      'A & !A',
      '1 & 0 | A'
    ];
    for (const expr of testCases) {
      const ast = BooleanParser.parse(expr);
      const val = BooleanParser.evaluateAST(ast, { A: 1, B: 0, C: 1, D: 0 });
      if (typeof val !== 'number') {
        throw new Error(`Invalid evaluateAST result for: ${expr}`);
      }
    }
  });
}

console.log('------------------------------------------------------');
console.log(`STRESS TEST SUMMARY: ${passedTests} / ${totalTests} PASSED`);
console.log('======================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
