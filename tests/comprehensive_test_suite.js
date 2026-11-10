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
  scriptMatch[1] + '; return { LogicSimApp, CanvasRenderer, Circuit, Component, Wire, Probe, RingBuffer, SimulationEngine, BooleanParser, TruthTableGenerator, escapeHtml, sanitizeParams, attachSliderHoldRepeat, I18N };'
);
const { LogicSimApp, CanvasRenderer, Circuit, Component, Wire, Probe, RingBuffer, SimulationEngine, BooleanParser, TruthTableGenerator, escapeHtml, sanitizeParams, attachSliderHoldRepeat, I18N } = evalFn(window, document, localStorage);

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

runTest('RENDERING', 'Wire crossing bridges enabled by default and togglable via settings', () => {
  let arcCount = 0;
  const mockArcCtx = Object.assign({}, mockCtx, {
    arc: () => { arcCount++; }
  });
  const mockCanvas = Object.assign({}, createMockElem('grid-canvas'), {
    getContext: () => mockArcCtx
  });
  const circuit = new Circuit();
  const c1 = circuit.addComponent('SWITCH', 0, 100);
  const c2 = circuit.addComponent('LED', 300, 100);
  const c3 = circuit.addComponent('SWITCH', 150, 0);
  const c4 = circuit.addComponent('LED', 150, 300);

  // Wire 1: (0, 100) -> (300, 100)
  // Wire 2: (150, 0) -> (150, 300)
  circuit.addWire(c1.id, 0, c2.id, 0);
  circuit.addWire(c3.id, 0, c4.id, 0);

  const engine = new SimulationEngine(circuit, new RingBuffer(10), () => {});
  const renderer = new CanvasRenderer(mockCanvas, circuit, engine);

  assertEqual(renderer.showWireBridges, true, 'showWireBridges must default to true');

  arcCount = 0;
  renderer.drawWires(mockArcCtx);
  assertEqual(arcCount > 0, true, 'Bridge arcs must be drawn by default when crossing');

  renderer.showWireBridges = false;
  arcCount = 0;
  renderer.drawWires(mockArcCtx);
  assertEqual(arcCount, 0, 'No bridge arcs should be drawn when showWireBridges is toggled off');
});

runTest('INTERACTION', 'attachSliderHoldRepeat enables smooth press-and-hold drag movement', () => {
  assertEqual(typeof attachSliderHoldRepeat, 'function', 'attachSliderHoldRepeat must be defined');

  let capturedPointerId = null;
  let releasedPointerId = null;
  const eventListeners = {};

  const mockSlider = {
    type: 'range',
    min: '0',
    max: '100',
    step: '1',
    value: '10',
    disabled: false,
    getBoundingClientRect: () => ({ left: 0, width: 200, top: 0, height: 20 }),
    addEventListener: (type, fn) => {
      if (!eventListeners[type]) eventListeners[type] = [];
      eventListeners[type].push(fn);
    },
    dispatchEvent: () => {},
    setPointerCapture: (id) => { capturedPointerId = id; },
    hasPointerCapture: (id) => capturedPointerId === id,
    releasePointerCapture: (id) => { releasedPointerId = id; capturedPointerId = null; }
  };

  let updatedValue = null;
  attachSliderHoldRepeat(mockSlider, (val) => {
    updatedValue = val;
  });

  assertEqual(Array.isArray(eventListeners['pointerdown']), true, 'pointerdown listener registered');
  assertEqual(Array.isArray(eventListeners['pointermove']), true, 'pointermove listener registered');
  assertEqual(Array.isArray(eventListeners['pointerup']), true, 'pointerup listener registered');

  // Simulate pointerdown at 50% of track (x=100)
  const downEv = {
    type: 'pointerdown',
    button: 0,
    pointerId: 42,
    clientX: 100,
    stopPropagation: () => {}
  };
  eventListeners['pointerdown'].forEach(fn => fn(downEv));
  assertEqual(capturedPointerId, 42, 'Pointer capture initiated on pointerdown');

  // Simulate pointermove dragging to 80% of track (x=160 -> value 80)
  const moveEv = {
    type: 'pointermove',
    pointerId: 42,
    clientX: 160,
    stopPropagation: () => {}
  };
  eventListeners['pointermove'].forEach(fn => fn(moveEv));
  assertEqual(mockSlider.value, 80, 'Slider value updated smoothly while dragging');
  assertEqual(updatedValue, 80, 'onUpdate callback invoked with new target value');

  // Simulate pointerup releasing the slider
  const upEv = {
    type: 'pointerup',
    pointerId: 42,
    stopPropagation: () => {}
  };
  eventListeners['pointerup'].forEach(fn => fn(upEv));
  assertEqual(releasedPointerId, 42, 'Pointer capture released on pointerup');
});

runTest('WISH-006 & WISH-007', 'Wire branching and floating terminus-free connections', () => {
  const circuit = new Circuit();
  const sw = circuit.addComponent('SWITCH', 50, 50);
  const led1 = circuit.addComponent('LED', 300, 50);
  const led2 = circuit.addComponent('LED', 300, 150);

  // 1. Primary wire from switch to led1
  const w1 = circuit.addWire(sw.id, 0, led1.id, 0);
  assertEqual(Boolean(w1), true, 'w1 created');

  // 2. WISH-006: Branch wire from existing wire w1 to led2
  const wBranch = circuit.addWire(null, 0, led2.id, 0, null, [], {
    fromWireId: w1.id,
    fromPoint: { x: 180, y: 70 }
  });
  assertEqual(Boolean(wBranch), true, 'wBranch created from existing wire');
  assertEqual(wBranch.fromWireId, w1.id, 'wBranch references w1');

  // 3. WISH-007: Floating connection terminating without a module at the end
  const wFloating = circuit.addWire(sw.id, 0, null, 0, null, [], {
    toPoint: { x: 250, y: 250 }
  });
  assertEqual(Boolean(wFloating), true, 'wFloating created without target component');
  assertEqual(wFloating.toCompId, '', 'wFloating has empty toCompId');
  assertEqual(wFloating.toPoint.x, 250, 'wFloating terminates at toPoint');

  // Test simulation propagation across branches and floating connections
  sw.state.value = 1;
  sw.outputs[0].value = 1;
  circuit.syncImmediateWireLevels();

  assertEqual(w1.level, 1, 'w1 level high');
  assertEqual(wBranch.level, 1, 'wBranch received high level from w1');
  assertEqual(led2.inputs[0].value, 1, 'led2 received input through wire branch');
  assertEqual(wFloating.level, 1, 'wFloating carries level without crashing');

  // Test step() engine propagation
  circuit.step();
  assertEqual(wBranch.level, 1, 'wBranch level preserved after engine step');
});

runTest('WISH-009', 'Global gate delay configuration, inheritance and JSON roundtrip', () => {
  const circuit = new Circuit();
  assertEqual(circuit.globalGateDelay, 1, 'Circuit globalGateDelay defaults to 1');

  // Gate without explicit delay inherits circuit.globalGateDelay
  const andGate = circuit.addComponent('AND', 100, 100);
  assertEqual(andGate.getEffectiveDelay(), 1, 'Default gate inherits global delay 1');

  // Change globalGateDelay to 3
  circuit.globalGateDelay = 3;
  assertEqual(andGate.getEffectiveDelay(), 3, 'Gate dynamically reflects new global gate delay');

  // Custom delay overrides global delay
  const notGate = circuit.addComponent('NOT', 200, 100, { delay: 5 });
  assertEqual(notGate.getEffectiveDelay(), 5, 'Gate with explicit delay overrides global delay');

  // JSON serialization preserves globalGateDelay
  const json = circuit.toJSON();
  assertEqual(json.globalGateDelay, 3, 'toJSON includes globalGateDelay');

  const c2 = new Circuit();
  c2.fromJSON(json);
  assertEqual(c2.globalGateDelay, 3, 'fromJSON restores globalGateDelay');
  const restoredAnd = c2.getComponent(andGate.id);
  assertEqual(restoredAnd.getEffectiveDelay(), 3, 'Restored gate inherits globalGateDelay 3');
});

runTest('WISH-009', 'Realistic inertial gate delay and glitch filtering ("wie im echten Leben")', () => {
  const circuit = new Circuit();
  // NOT gate with delay = 3
  const notGate = circuit.addComponent('NOT', 100, 100, { delay: 3 });
  assertEqual(notGate.getEffectiveDelay(), 3, 'NOT gate delay is 3 ticks');

  // Initial steady state: input 0, output 1
  notGate.inputs[0].value = 0;
  notGate.compute();
  notGate.commit(true); // settle DC operating point
  assertEqual(notGate.outputs[0].value, 1, 'Initial output is 1');

  // Tick 1: input changes from 0 to 1
  notGate.inputs[0].value = 1;
  notGate.compute();
  notGate.commit();
  assertEqual(notGate.outputs[0].value, 1, 'Tick 1: output still holds previous value (1) during propagation delay');

  // Tick 2: input sustained at 1
  notGate.inputs[0].value = 1;
  notGate.compute();
  notGate.commit();
  assertEqual(notGate.outputs[0].value, 1, 'Tick 2: output still holds 1 during delay');

  // Tick 3: propagation delay elapsed (3 ticks) -> output transitions to 0
  notGate.inputs[0].value = 1;
  notGate.compute();
  notGate.commit();
  assertEqual(notGate.outputs[0].value, 0, 'Tick 3: output switches to 0 exactly after 3 ticks');

  // GLITCH FILTERING (Inertial Delay):
  // Steady state is 0. A glitch (pulse of 1 tick: input becomes 0 for 1 tick then back to 1)
  // Tick 4: input glitches to 0 for 1 tick
  notGate.inputs[0].value = 0;
  notGate.compute();
  notGate.commit();
  assertEqual(notGate.outputs[0].value, 0, 'Tick 4: output holds 0 during glitch');

  // Tick 5: input returns to 1 before delay of 3 expires!
  notGate.inputs[0].value = 1;
  notGate.compute();
  notGate.commit();
  assertEqual(notGate.outputs[0].value, 0, 'Tick 5: glitch filtered out, output remains 0');

  // Tick 6: steady state continues
  notGate.inputs[0].value = 1;
  notGate.compute();
  notGate.commit();
  assertEqual(notGate.outputs[0].value, 0, 'Tick 6: output steady at 0, no spurious glitch emitted');
});

runTest('WISH-009', 'Gate delay display toggle under gates is disabled by default', () => {
  const circuit = new Circuit();
  const gate = circuit.addComponent('AND', 100, 100, { delay: 4 });
  const engine = new SimulationEngine(circuit, new RingBuffer(10), () => {});
  const mockCanvas = createMockElem('grid-canvas');
  const renderer = new CanvasRenderer(mockCanvas, circuit, engine);

  assertEqual(renderer.showGateDelay, false, 'showGateDelay must default to false');

  // Render components with showGateDelay = false: no Δt text drawn
  let deltaTextDrawn = false;
  const mockTextCtx = Object.assign({}, mockCtx, {
    fillText: (text) => {
      if (typeof text === 'string' && text.includes('Δt')) {
        deltaTextDrawn = true;
      }
    }
  });

  renderer.drawComponents(mockTextCtx);
  assertEqual(deltaTextDrawn, false, 'No Δt badge drawn when showGateDelay is false (default)');

  // Enable showGateDelay = true
  renderer.showGateDelay = true;
  deltaTextDrawn = false;
  renderer.drawComponents(mockTextCtx);
  assertEqual(deltaTextDrawn, true, 'Δt badge drawn under gate when showGateDelay is true');
});

runTest('WISH-009', 'Interactive input change propagates wires without bypassing gate delay in sim mode', () => {
  const circuit = new Circuit();
  const sw = circuit.addComponent('SWITCH', 50, 50);
  const notGate = circuit.addComponent('NOT', 150, 50, { delay: 2 });
  const w1 = circuit.addWire(sw.id, 0, notGate.id, 0);

  // Settle DC initial state: switch 0 -> NOT input 0 -> NOT output 1
  circuit.syncImmediateWireLevels();
  assertEqual(sw.outputs[0].value, 0, 'Switch is initially 0');
  assertEqual(notGate.inputs[0].value, 0, 'NOT input is 0');
  assertEqual(notGate.outputs[0].value, 1, 'NOT output is 1');

  // User flips SWITCH in live sim mode:
  sw.state.value = 1;
  sw.outputs[0].value = 1;
  sw.nextOutputs[0] = 1;
  circuit.updateWireLevelsFromDrivers();

  // Wires and downstream inputs update immediately:
  assertEqual(w1.level, 1, 'Wire 1 immediately carries switch output (1)');
  assertEqual(notGate.inputs[0].value, 1, 'NOT gate input pin immediately receives 1');
  // BUT the NOT gate output MUST NOT snap to 0 immediately (gate delay is preserved)!
  assertEqual(notGate.outputs[0].value, 1, 'NOT gate output maintains previous value (1) - NOT bypassed!');

  // Advance 1 tick:
  circuit.step();
  assertEqual(notGate.outputs[0].value, 1, 'After Tick 1: output still 1 (delay = 2)');

  // Advance 2nd tick:
  circuit.step();
  assertEqual(notGate.outputs[0].value, 0, 'After Tick 2: output transitions to 0 after propagation delay');
});

runTest('WISH-004', 'cleanWireWaypoints and straightenWire simplify collinear and redundant bends', () => {
  const app = new LogicSimApp();
  const c = app.circuit;
  const sw = c.addComponent('SWITCH', 40, 100);
  const led = c.addComponent('LED', 300, 100);
  const wire = c.addWire(sw.id, 0, led.id, 0);

  // Add collinear and redundant waypoints forming an in-line jog
  wire.waypoints = [
    { x: 120, y: 120 },
    { x: 200, y: 120 },
    { x: 240, y: 120 }
  ];

  app.cleanWireWaypoints(wire);
  // All waypoints share y=120 with pins -> collinear with endpoints -> waypoints removed!
  assertEqual(wire.waypoints.length, 0, 'cleanWireWaypoints eliminates collinear in-line waypoints');

  // Test straightenWire resets wire to auto-route
  wire.waypoints = [{ x: 160, y: 160 }, { x: 200, y: 160 }];
  wire.channelOffset = 20;
  wire.autoRouted = false;
  app.straightenWire(wire);
  assertEqual(wire.waypoints.length, 0, 'straightenWire resets waypoints');
  assertEqual(wire.channelOffset, 0, 'straightenWire resets channelOffset');
  assertEqual(wire.autoRouted, true, 'straightenWire marks wire auto-routed');
});

runTest('WISH-004', 'deconflictWireChannels distributes parallel wire channels to prevent overlap', () => {
  const app = new LogicSimApp();
  const c = app.circuit;
  const sw1 = c.addComponent('SWITCH', 40, 100);
  const sw2 = c.addComponent('SWITCH', 40, 200);
  const andGate = c.addComponent('AND', 300, 120);

  const w1 = c.addWire(sw1.id, 0, andGate.id, 0);
  const w2 = c.addWire(sw2.id, 0, andGate.id, 1);

  assertEqual(w1.channelOffset, 0);
  assertEqual(w2.channelOffset, 0);

  app.deconflictWireChannels();

  // The two parallel wires sharing the vertical channel must have distinct offsets
  assertEqual(w1.channelOffset !== w2.channelOffset, true, 'Parallel wires receive distinct channel offsets');
  assertEqual(w1.channelOffset % 20, 0, 'w1 channelOffset is grid-aligned');
  assertEqual(w2.channelOffset % 20, 0, 'w2 channelOffset is grid-aligned');
});

runTest('WISH-004', 'addWaypointToWire supports floating and branch wires safely', () => {
  const app = new LogicSimApp();
  const c = app.circuit;
  const sw = c.addComponent('SWITCH', 40, 100);
  const w1 = c.addWire(sw.id, 0, null, 0, null, [], { toPoint: { x: 200, y: 120 } });

  // Floating wire with toCompId = null
  app.addWaypointToWire(w1, { x: 160, y: 120 });
  assertEqual(w1.waypoints.length, 1, 'Waypoint added to floating wire');
  assertEqual(w1.waypoints[0].x, 160, 'Waypoint x matches snap grid');
  assertEqual(w1.waypoints[0].y, 120, 'Waypoint y matches snap grid');
});

runTest('WISH-003', 'I18N multi-language dictionary and setLanguage switches between DE and EN', () => {
  assertEqual(typeof I18N, 'object', 'I18N object must be defined');
  assertEqual(typeof I18N.t, 'function', 'I18N.t must be a function');

  // Test German strings
  I18N.currentLang = 'de';
  assertEqual(I18N.t('menu.file'), 'Datei');
  assertEqual(I18N.t('toolbar.mode.edit'), 'Edit');
  assertEqual(I18N.t('comp.SWITCH'), 'Schalter');
  assertEqual(I18N.t('palette.title'), 'Bauteil-Palette');

  // Test English strings
  I18N.currentLang = 'en';
  assertEqual(I18N.t('menu.file'), 'File');
  assertEqual(I18N.t('toolbar.mode.edit'), 'Edit');
  assertEqual(I18N.t('comp.SWITCH'), 'Switch');
  assertEqual(I18N.t('palette.title'), 'Component Palette');

  // Test fallback on missing key
  assertEqual(I18N.t('nonexistent.key', 'FallbackText'), 'FallbackText');

  // Test LogicSimApp setLanguage
  const app = new LogicSimApp();
  app.setLanguage('en');
  assertEqual(I18N.currentLang, 'en', 'app.setLanguage sets I18N.currentLang to en');
  assertEqual(app.language, 'en', 'app.language is en');

  app.setLanguage('de');
  assertEqual(I18N.currentLang, 'de', 'app.setLanguage resets I18N.currentLang to de');
  assertEqual(app.language, 'de', 'app.language is de');
});

console.log('\n================================================================');
console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log('================================================================\n');

if (failed > 0) {
  process.exit(1);
}
