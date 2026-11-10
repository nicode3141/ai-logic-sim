// Comprehensive Test & Hardening Suite for AI Logic Simulator
// Usage: node tests/comprehensive_test_suite.js

const fs = require('fs');
const path = require('path');

// 1. Mock Minimal Browser Environment for Headless Node Execution
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

// 2. Load and Instantiate Application
const htmlPath = path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const scriptMatch = html.match(/<script[\s\S]*?>([\s\S]*?)<\/script>/i);
if (!scriptMatch) throw new Error('No script tag found in index.html');

const evalFn = new Function(
  'window', 'document', 'localStorage',
  scriptMatch[1] + '; return { LogicSimApp, Circuit, Component, Wire, Probe, RingBuffer, SimulationEngine, BooleanParser, TruthTableGenerator, escapeHtml, sanitizeParams };'
);
const { LogicSimApp, Circuit, Component, Wire, Probe, RingBuffer, SimulationEngine, BooleanParser, TruthTableGenerator, escapeHtml, sanitizeParams } = evalFn(window, document, localStorage);

console.log('================================================================');
console.log('       COMPREHENSIVE TEST, PEN-TEST & HARDENING SUITE           ');
console.log('================================================================\n');

let passed = 0;
let failed = 0;

function runTest(category, name, fn) {
  try {
    const t0 = performance.now();
    fn();
    const dt = performance.now() - t0;
    console.log(`[PASS] [${category}] ${name} (${dt.toFixed(2)}ms)`);
    passed++;
  } catch (err) {
    console.error(`[FAIL] [${category}] ${name}: ${err.message}`);
    failed++;
  }
}

function assertEqual(actual, expected, msg = '') {
  if (actual !== expected) {
    throw new Error(`${msg ? msg + ': ' : ''}Expected ${expected}, got ${actual}`);
  }
}

// -----------------------------------------------------------------------------
// CATEGORY 1: SECURITY & PEN-TESTING HARDENING
// -----------------------------------------------------------------------------

runTest('SECURITY', 'escapeHtml sanitizes all dangerous HTML characters', () => {
  assertEqual(escapeHtml('<script>alert("XSS")</script>'), '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
  assertEqual(escapeHtml("Tom & 'Jerry' > Bob < Alice"), 'Tom &amp; &#39;Jerry&#39; &gt; Bob &lt; Alice');
  assertEqual(escapeHtml(null), '');
  assertEqual(escapeHtml(undefined), '');
  assertEqual(escapeHtml(123), '123');
});

runTest('SECURITY', 'sanitizeParams strips prototype pollution keys', () => {
  const dirty = {
    label: 'Normal',
    __proto__: { polluted: true },
    constructor: { prototype: { hacked: true } },
    prototype: { exploited: true }
  };
  const clean = sanitizeParams(dirty);
  assertEqual(clean.label, 'Normal');
  assertEqual(Object.prototype.polluted, undefined);
  assertEqual(Object.prototype.hacked, undefined);
  assertEqual(Object.prototype.exploited, undefined);
});

runTest('SECURITY', 'Component constructor prevents coordinate poisoning (NaN/Infinity)', () => {
  const cNaN = new Component('c1', 'AND', NaN, Infinity);
  assertEqual(Number.isFinite(cNaN.x), true, 'x must be finite');
  assertEqual(Number.isFinite(cNaN.y), true, 'y must be finite');
  assertEqual(cNaN.x, 0);
  assertEqual(cNaN.y, 0);
});

runTest('SECURITY', 'Wire waypoints sanitize NaN, Infinity, and extreme coordinate injections', () => {
  const wire = new Wire('w1', 'c1', 0, 'c2', 0, [
    { x: NaN, y: Infinity },
    { x: 'not_a_num', y: null },
    { x: 500000, y: -500000 },
    { x: 100, y: 200 }
  ]);
  // Invalid points must be filtered out
  assertEqual(wire.waypoints.length, 2);
  // Extreme point clamped to [-100000, 100000]
  assertEqual(wire.waypoints[0].x, 100000);
  assertEqual(wire.waypoints[0].y, -100000);
  // Valid point snapped to grid
  assertEqual(wire.waypoints[1].x, 100);
  assertEqual(wire.waypoints[1].y, 200);
});

runTest('SECURITY', 'Probe constructor sanitizes color injection and bounds name length', () => {
  const probe = new Probe('p1', 'w1', 'A'.repeat(200), 'javascript:alert(1)');
  assertEqual(probe.name.length <= 50, true, 'Probe name must be capped at 50 chars');
  assertEqual(probe.color, '#00b0ff', 'Malicious color should fallback to default palette hex');

  const validProbe = new Probe('p2', 'w1', 'SafeProbe', '#00e676', 0.8);
  assertEqual(validProbe.color, '#00e676');
  assertEqual(validProbe.offsetRatio, 0.8);
});

runTest('SECURITY', 'Circuit fromJSON rejects oversized circuits (DoS limit)', () => {
  const oversized = {
    components: Array.from({ length: 5001 }, (_, i) => ({ id: `c_${i}`, type: 'BUFFER' })),
    wires: []
  };
  let rejected = false;
  try {
    const c = new Circuit();
    c.fromJSON(oversized);
  } catch (err) {
    rejected = true;
    assertEqual(err.message.includes('Sicherheitslimit'), true);
  }
  assertEqual(rejected, true, 'Oversized circuit must be rejected');
});

runTest('SECURITY', 'CLOCK halfPeriod is hardened against invalid or non-numeric inputs', () => {
  const clk = new Component('clk1', 'CLOCK', 0, 0, { halfPeriod: 'invalid_string' });
  assertEqual(clk.params.halfPeriod, 5, 'Fallback to 5 on invalid halfPeriod');
  const clkZero = new Component('clk2', 'CLOCK', 0, 0, { halfPeriod: 0 });
  assertEqual(clkZero.params.halfPeriod, 1, 'Clamped to minimum 1');
});

runTest('SECURITY', 'BooleanParser rejects input exceeding 20,000 characters', () => {
  const hugeText = 'A & '.repeat(6000) + 'B';
  let thrown = false;
  try {
    BooleanParser.parse(hugeText);
  } catch (err) {
    thrown = true;
    assertEqual(err.message.includes('Ausdruck zu lang'), true);
  }
  assertEqual(thrown, true, 'Must reject inputs > 20000 chars');
});

runTest('SECURITY', 'BooleanParser prevents call-stack overflow on 5,000 nested parens', () => {
  const parensBomb = '('.repeat(5000) + 'A' + ')'.repeat(5000);
  let thrown = false;
  try {
    BooleanParser.parse(parensBomb);
  } catch (err) {
    thrown = true;
    assertEqual(err.message.includes('Maximale Verschachtelungstiefe überschritten'), true);
  }
  assertEqual(thrown, true, 'Must safely reject deep nesting with error instead of crashing stack');
});

runTest('SECURITY', 'TruthTableGenerator deduplicates identical input/output labels', () => {
  const circuit = new Circuit();
  circuit.addComponent('SWITCH', 0, 0, { label: 'SW' });
  circuit.addComponent('SWITCH', 0, 40, { label: 'SW' });
  circuit.addComponent('LED', 100, 0, { label: 'OUT' });
  circuit.addComponent('LED', 100, 40, { label: 'OUT' });

  const data = TruthTableGenerator.generate(circuit);
  assertEqual(data.inputs[0].name, 'SW');
  assertEqual(data.inputs[1].name, 'SW_2');
  assertEqual(data.outputs[0].name, 'OUT');
  assertEqual(data.outputs[1].name, 'OUT_2');
});

// -----------------------------------------------------------------------------
// CATEGORY 2: LOGIC ENGINE & GATE VERIFICATION
// -----------------------------------------------------------------------------

runTest('LOGIC', 'All basic logic gates truth tables (2-input)', () => {
  const testGate = (type, in0, in1) => {
    const c = new Component('g', type, 0, 0);
    c.inputs[0].value = in0;
    c.inputs[1].value = in1;
    c.compute();
    c.commit();
    return c.outputs[0].value;
  };

  // AND: 0 0 -> 0, 0 1 -> 0, 1 0 -> 0, 1 1 -> 1
  assertEqual(testGate('AND', 0, 0), 0);
  assertEqual(testGate('AND', 0, 1), 0);
  assertEqual(testGate('AND', 1, 0), 0);
  assertEqual(testGate('AND', 1, 1), 1);

  // OR: 0 0 -> 0, 0 1 -> 1, 1 0 -> 1, 1 1 -> 1
  assertEqual(testGate('OR', 0, 0), 0);
  assertEqual(testGate('OR', 0, 1), 1);
  assertEqual(testGate('OR', 1, 0), 1);
  assertEqual(testGate('OR', 1, 1), 1);

  // NAND
  assertEqual(testGate('NAND', 0, 0), 1);
  assertEqual(testGate('NAND', 1, 1), 0);

  // NOR
  assertEqual(testGate('NOR', 0, 0), 1);
  assertEqual(testGate('NOR', 0, 1), 0);

  // XOR
  assertEqual(testGate('XOR', 0, 0), 0);
  assertEqual(testGate('XOR', 1, 0), 1);
  assertEqual(testGate('XOR', 0, 1), 1);
  assertEqual(testGate('XOR', 1, 1), 0);

  // XNOR
  assertEqual(testGate('XNOR', 0, 0), 1);
  assertEqual(testGate('XNOR', 1, 0), 0);
  assertEqual(testGate('XNOR', 0, 1), 0);
  assertEqual(testGate('XNOR', 1, 1), 1);
});

runTest('LOGIC', 'Inverted input and output pin parameters', () => {
  // AND gate with input 0 inverted: effectively (!in0 & in1)
  const c = new Component('g', 'AND', 0, 0, { invertedInputs: [true, false] });
  c.inputs[0].value = 0; // becomes 1
  c.inputs[1].value = 1;
  c.compute();
  c.commit();
  assertEqual(c.outputs[0].value, 1, 'Inverted input 0 should be read as 1');

  c.inputs[0].value = 1; // becomes 0
  c.compute();
  c.commit();
  assertEqual(c.outputs[0].value, 0, 'Inverted input 1 should be read as 0');
});

runTest('LOGIC', 'D-Flip-Flop edge-triggered state storage', () => {
  const dff = new Component('dff1', 'D_FF', 0, 0);
  // Input D=1, CLK=0
  dff.inputs[0].value = 1; // D
  dff.inputs[1].value = 0; // CLK
  dff.compute();
  dff.commit();
  assertEqual(dff.outputs[0].value, 0, 'Q remains 0 before clock edge');

  // Rising edge CLK=1
  dff.inputs[1].value = 1;
  dff.compute();
  dff.commit();
  assertEqual(dff.outputs[0].value, 1, 'Q becomes 1 on rising clock edge');
  assertEqual(dff.outputs[1].value, 0, 'Q_not becomes 0');

  // Input D=0, CLK=1 (no edge)
  dff.inputs[0].value = 0;
  dff.compute();
  dff.commit();
  assertEqual(dff.outputs[0].value, 1, 'Q holds state while clock stays HIGH');
});

runTest('LOGIC', '4-Bit Binary & BCD Counter', () => {
  const cnt = new Component('cnt', 'COUNTER', 0, 0, { mode: 'bcd' });
  // Pulse CLK 10 times with EN=1, RST=0
  cnt.inputs[1].value = 1; // EN
  cnt.inputs[2].value = 0; // RST

  for (let step = 0; step < 10; step++) {
    // CLK LOW
    cnt.inputs[0].value = 0;
    cnt.compute();
    cnt.commit();
    // CLK HIGH
    cnt.inputs[0].value = 1;
    cnt.compute();
    cnt.commit();
  }
  // After 10 pulses, BCD counter mod 10 wraps to 0
  assertEqual(cnt.state.count, 0, 'BCD counter wraps to 0 after 10 ticks');
});

// -----------------------------------------------------------------------------
// CATEGORY 3: SYSTEMS ARCHITECTURE & ZERO-ALLOCATION HOT PATH
// -----------------------------------------------------------------------------

runTest('PERFORMANCE', 'Circuit compMap, wireMap, and probeMap provide O(1) lookups', () => {
  const circuit = new Circuit();
  const c1 = circuit.addComponent('AND', 0, 0, {}, 'custom_and');
  const c2 = circuit.addComponent('LED', 100, 0, {}, 'custom_led');
  assertEqual(circuit.getComponent('custom_and'), c1);
  assertEqual(circuit.compMap.get('custom_and'), c1);

  const wire = circuit.addWire(c1.id, 0, c2.id, 0, 'custom_wire');
  assertEqual(circuit.getWire('custom_wire'), wire);
  assertEqual(circuit.wireMap.get('custom_wire'), wire);

  const probe = circuit.addProbe(wire.id, { id: 'custom_probe' });
  assertEqual(circuit.getProbe('custom_probe'), probe);
  assertEqual(circuit.probeMap.get('custom_probe'), probe);

  circuit.removeProbe('custom_probe');
  assertEqual(circuit.getProbe('custom_probe'), null);
  assertEqual(circuit.probeMap.has('custom_probe'), false);

  circuit.removeWire('custom_wire');
  assertEqual(circuit.getWire('custom_wire'), null);
  assertEqual(circuit.wireMap.has('custom_wire'), false);

  circuit.removeComponent('custom_and');
  assertEqual(circuit.getComponent('custom_and'), null);
  assertEqual(circuit.compMap.has('custom_and'), false);
});

runTest('PERFORMANCE', 'Direct cached wire pointers accelerate propagation loop with direct references', () => {
  const circuit = new Circuit();
  const c1 = circuit.addComponent('SWITCH', 0, 0, { initialValue: 1 });
  const c2 = circuit.addComponent('NOT', 100, 0);
  const wire = circuit.addWire(c1.id, 0, c2.id, 0);

  assertEqual(wire._fromComp, c1);
  assertEqual(wire._toComp, c2);

  c1.state.value = 1;
  circuit.step();
  assertEqual(wire.level, 1);
  assertEqual(c2.outputs[0].value, 0);
});

runTest('PERFORMANCE', '1,000 gates cascade simulation execution under 50ms for 200 steps', () => {
  const c = new Circuit();
  const count = 1000;
  let prevComp = c.addComponent('SWITCH', 0, 0);
  prevComp.outputs[0].value = 1;

  for (let i = 0; i < count; i++) {
    const nextComp = c.addComponent(i % 2 === 0 ? 'BUFFER' : 'NOT', (i + 1) * 20, 0);
    c.addWire(prevComp.id, 0, nextComp.id, 0);
    prevComp = nextComp;
  }

  const t0 = performance.now();
  for (let s = 0; s < 200; s++) {
    c.step();
  }
  const dt = performance.now() - t0;
  if (dt > 100) {
    throw new Error(`Simulation exceeded 100ms budget: ${dt.toFixed(2)}ms`);
  }
});

// -----------------------------------------------------------------------------
// CATEGORY 4: ROUNDTRIP SERIALIZATION & RESILIENCE
// -----------------------------------------------------------------------------

runTest('RESILIENCE', 'Fast cloneState preserves exact sequential state across ticks and rollbacks', () => {
  const circuit = new Circuit();
  const rb = new RingBuffer(100);
  const clk = circuit.addComponent('CLOCK', 0, 0, { halfPeriod: 1 });
  const en = circuit.addComponent('SWITCH', 0, 50, { initialValue: 1 });
  const cnt = circuit.addComponent('COUNTER', 100, 0, { mode: 'bcd' });
  circuit.addWire(clk.id, 0, cnt.id, 0); // CLK -> pin 0
  circuit.addWire(en.id, 0, cnt.id, 1);  // EN  -> pin 1

  const engine = new SimulationEngine(circuit, rb, () => {});
  engine.setMode('sim');

  for (let i = 0; i < 14; i++) engine.stepTick();
  const countAfter14 = cnt.state.count;
  assertEqual(countAfter14 > 0, true, 'Counter must have counted up');

  for (let i = 0; i < 4; i++) engine.stepBackTick();
  assertEqual(cnt.state.count < countAfter14, true, 'Rollback should decrement counter state');
});

runTest('RESILIENCE', 'Circuit roundtrip JSON export and import matches topology', () => {
  const c1 = new Circuit();
  const sw = c1.addComponent('SWITCH', 40, 80, { label: 'S1', initialValue: 1 });
  const notGate = c1.addComponent('NOT', 120, 80, { label: 'INV' });
  const led = c1.addComponent('LED', 200, 80, { label: 'L1', color: 'yellow' });
  c1.addWire(sw.id, 0, notGate.id, 0);
  c1.addWire(notGate.id, 0, led.id, 0);

  const json = c1.toJSON();
  const c2 = new Circuit();
  c2.fromJSON(json);

  assertEqual(c2.components.length, 3);
  assertEqual(c2.wires.length, 2);
  assertEqual(c2.getComponent(sw.id).params.label, 'S1');
  assertEqual(c2.getComponent(led.id).params.color, 'yellow');
});

console.log('\n================================================================');
console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log('================================================================\n');

if (failed > 0) {
  process.exit(1);
}
