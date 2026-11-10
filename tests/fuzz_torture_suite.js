/**
 * AI Logic Simulator - Extreme Fuzzing, Pen-Testing & Torture Suite
 * Tests the system up to and beyond failure boundaries ("Bis zum Brechen").
 * Usage: node tests/fuzz_torture_suite.js
 */

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

const elementRegistry = new Map();
const document = {
  getElementById: (id) => {
    if (!elementRegistry.has(id)) elementRegistry.set(id, createMockElem(id));
    return elementRegistry.get(id);
  },
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

const evalFn = new Function(
  'window', 'document', 'localStorage',
  scriptMatch[1] + '; return { LogicSimApp, Circuit, Component, Wire, RingBuffer, SimulationEngine, BooleanParser, TruthTableGenerator, CanvasRenderer, LogicAnalyzerRenderer, AutoLayoutEngine, WireRouter };'
);
const {
  LogicSimApp, Circuit, Component, Wire, RingBuffer, SimulationEngine,
  BooleanParser, TruthTableGenerator, CanvasRenderer, LogicAnalyzerRenderer,
  AutoLayoutEngine, WireRouter
} = evalFn(window, document, localStorage);

console.log('================================================================');
console.log('       EXTREME FUZZING, PEN-TESTING & TORTURE SUITE             ');
console.log('================================================================\n');

let passed = 0;
let failed = 0;

function runTortureTest(name, fn) {
  process.stdout.write(`[TORTURE] ${name} ... `);
  const t0 = performance.now();
  try {
    fn();
    const dt = (performance.now() - t0).toFixed(2);
    console.log(`PASSED (${dt}ms)`);
    passed++;
  } catch (err) {
    const dt = (performance.now() - t0).toFixed(2);
    console.log(`FAILED (${dt}ms)`);
    console.error(`  Error: ${err.message}`);
    if (err.stack) {
      console.error(`  Stack: ${err.stack.split('\n').slice(1, 4).join('\n')}`);
    }
    failed++;
  }
}

function assert(condition, msg = 'Assertion failed') {
  if (!condition) throw new Error(msg);
}

function assertEqual(actual, expected, msg = '') {
  if (actual !== expected) {
    throw new Error(`${msg ? msg + ': ' : ''}Expected ${expected}, got ${actual}`);
  }
}

// -----------------------------------------------------------------------------
// 1. JSON & DESERIALIZATION ATTACKS & EXTREME BOUNDARIES
// -----------------------------------------------------------------------------

runTortureTest('Rejection of primitive, null, undefined, or circular JSON', () => {
  const c = new Circuit();
  let caughtNull = false;
  try { c.fromJSON(null); } catch (e) { caughtNull = true; }
  assert(caughtNull, 'null rejected with error');

  let caughtUndef = false;
  try { c.fromJSON(undefined); } catch (e) { caughtUndef = true; }
  assert(caughtUndef, 'undefined rejected with error');

  let caughtNum = false;
  try { c.fromJSON(12345); } catch (e) { caughtNum = true; }
  assert(caughtNum, 'number rejected with error');

  let caughtStr = false;
  try { c.fromJSON('string'); } catch (e) { caughtStr = true; }
  assert(caughtStr, 'string rejected with error');

  let caughtEmpty = false;
  try { c.fromJSON({}); } catch (e) { caughtEmpty = true; }
  assert(caughtEmpty, 'empty object rejected with error');
});

runTortureTest('DoS Protection: Circuit with > 5000 components is safely rejected', () => {
  const c = new Circuit();
  const oversized = { components: [], wires: [] };
  for (let i = 0; i < 5001; i++) {
    oversized.components.push({ id: `c_${i}`, type: 'AND', x: i * 10, y: i * 10 });
  }
  let rejected = false;
  try {
    c.fromJSON(oversized);
  } catch (err) {
    rejected = true;
    assert(err.message.includes('Sicherheitslimit') || err.message.includes('5000'), 'Error specifies limit');
  }
  assert(rejected, 'Oversized circuit (>5000 components) must be rejected');
});

runTortureTest('Prototype pollution in all nested JSON fields (__proto__, constructor.prototype)', () => {
  const c = new Circuit();
  const evilPayload = {
    components: [
      {
        id: 'evil_1',
        type: 'SWITCH',
        params: {
          __proto__: { pwnedParams: true },
          constructor: { prototype: { pwnedConstructor: true } }
        },
        invertedInputs: {
          __proto__: { pwnedInvert: true }
        }
      }
    ],
    wires: [
      {
        id: 'w1',
        fromCompId: 'evil_1',
        fromPin: 0,
        toCompId: 'evil_1',
        toPin: 0,
        waypoints: [
          { x: 10, y: 10, __proto__: { pwnedWaypoint: true } }
        ]
      }
    ]
  };

  c.fromJSON(evilPayload);
  const testObj = {};
  assertEqual(testObj.pwnedParams, undefined, 'Object.prototype.pwnedParams is undefined');
  assertEqual(testObj.pwnedConstructor, undefined, 'Object.prototype.pwnedConstructor is undefined');
  assertEqual(testObj.pwnedInvert, undefined, 'Object.prototype.pwnedInvert is undefined');
  assertEqual(testObj.pwnedWaypoint, undefined, 'Object.prototype.pwnedWaypoint is undefined');
});

runTortureTest('Coordinate poisoning: Extreme numbers, NaN, Infinity, -Infinity', () => {
  const c = new Circuit();
  const comp = c.addComponent('AND', NaN, Infinity);
  assert(Number.isFinite(comp.x), `comp.x must be finite, got ${comp.x}`);
  assert(Number.isFinite(comp.y), `comp.y must be finite, got ${comp.y}`);

  const comp2 = c.addComponent('OR', -Infinity, 1e25);
  assert(Number.isFinite(comp2.x), `comp2.x must be finite, got ${comp2.x}`);
  assert(Number.isFinite(comp2.y), `comp2.y must be finite, got ${comp2.y}`);

  // Waypoints with extreme coordinates
  const wire = c.addWire(comp.id, 0, comp2.id, 0, [
    { x: NaN, y: 100 },
    { x: Infinity, y: -Infinity },
    { x: 1e30, y: -1e30 }
  ]);
  assert(wire, 'Wire was created');
  for (const wp of wire.waypoints) {
    assert(Number.isFinite(wp.x), `Waypoint x must be finite, got ${wp.x}`);
    assert(Number.isFinite(wp.y), `Waypoint y must be finite, got ${wp.y}`);
  }
});

runTortureTest('Unknown component types fallback safely without crash', () => {
  const c = new Circuit();
  const unknownComp = c.addComponent('HACKED_GATE_TYPE_XYZ', 100, 100);
  assert(unknownComp, 'Unknown component instantiated with fallback');
  assertEqual(unknownComp.type, 'HACKED_GATE_TYPE_XYZ');
  // compute() and commit() should not throw
  unknownComp.compute();
  unknownComp.commit();
});

// -----------------------------------------------------------------------------
// 2. BOOLEAN PARSER & AST EVALUATOR FUZZING
// -----------------------------------------------------------------------------

runTortureTest('BooleanParser call stack overflow protection on 2,000 nested parens', () => {
  let deeplyNested = 'A';
  for (let i = 0; i < 2000; i++) {
    deeplyNested = '(' + deeplyNested + ')';
  }
  let caught = false;
  try {
    BooleanParser.parse(deeplyNested);
  } catch (err) {
    caught = true;
    assert(err.message.includes('Verschachtelung') || err.message.includes('Tiefe'), 'Caught nesting limit error');
  }
  assert(caught, 'Parser caught extreme nesting depth');
});

runTortureTest('BooleanParser string length DoS protection (>20,000 characters)', () => {
  const giant = 'A & '.repeat(6000) + 'B';
  let caught = false;
  try {
    BooleanParser.parse(giant);
  } catch (err) {
    caught = true;
    assert(err.message.includes('Ausdruck zu lang'), 'Caught length limit error');
  }
  assert(caught, 'Parser caught oversized input');
});

runTortureTest('BooleanParser syntax error resilience: consecutive operators, trailing symbols', () => {
  const malformed = [
    'A &&& B',
    'A ||| B',
    'A + + B',
    'A * * B',
    '! ! !',
    'A ->',
    '<-> B',
    '()',
    'A + (B * )',
    'A & &',
    '= Y'
  ];

  for (const expr of malformed) {
    try {
      BooleanParser.parse(expr);
    } catch (err) {
      assert(err.message.length > 0, `Descriptive error on malformed '${expr}': ${err.message}`);
    }
  }
});

runTortureTest('BooleanParser resilience against JS reserved keywords as variables', () => {
  const reservedExpr = 'toString & valueOf | constructor ^ hasOwnProperty';
  const astList = BooleanParser.parse(reservedExpr);
  assert(astList && astList.length > 0, 'Parsed expression with JS reserved words');

  const varMap = {
    toString: 1,
    valueOf: 0,
    constructor: 1,
    hasOwnProperty: 1
  };
  const val = BooleanParser.evaluateAST(astList[0].ast, varMap);
  assert(val === 0 || val === 1, `Evaluated result is binary 0 or 1, got ${val}`);
});

runTortureTest('BooleanParser AST evaluation recursion depth limit (150 levels)', () => {
  // Construct a manually linked deep AST to test evaluateAST boundary
  let root = { type: 'VAR', name: 'A' };
  for (let i = 0; i < 200; i++) {
    root = { type: 'NOT', child: root };
  }
  let caught = false;
  try {
    BooleanParser.evaluateAST(root, { A: 1 });
  } catch (err) {
    caught = true;
    assert(err.message.includes('Auswertungstiefe'), 'Caught AST evaluation depth limit');
  }
  assert(caught, 'evaluateAST enforced max depth');
});

// -----------------------------------------------------------------------------
// 3. RINGBUFFER BOUNDARY & 25,000 TICKS WRAP-AROUND TORTURE
// -----------------------------------------------------------------------------

runTortureTest('RingBuffer 25,000 ticks continuous wrap-around without memory leak', () => {
  const capacity = 10000;
  const rb = new RingBuffer(capacity);
  assertEqual(rb.capacity, capacity, 'RingBuffer capacity is 10000');

  const p1 = 'probe_1';
  const p2 = 'probe_2';
  const probeSamples = new Map();

  for (let t = 1; t <= 25000; t++) {
    probeSamples.clear();
    probeSamples.set(p1, (t % 2 === 0) ? 1 : 0);
    probeSamples.set(p2, (t % 4 === 0) ? 1 : 0);
    rb.record(t, probeSamples);
  }

  assertEqual(rb.count, 10000, 'Count capped at capacity');
  assertEqual(rb.getTickAtOffset(0), 15001, 'Oldest tick is 15001 after 25,000 steps');
  assertEqual(rb.getTickAtOffset(9999), 25000, 'Newest tick is 25000');

  // Verify monotonicity across all 10,000 samples
  let lastTick = rb.getTickAtOffset(0);
  for (let offset = 1; offset < 10000; offset++) {
    const curTick = rb.getTickAtOffset(offset);
    assert(curTick === lastTick + 1, `Tick offset ${offset} strictly incremental: ${curTick} === ${lastTick + 1}`);
    lastTick = curTick;
  }

  // Verify values at offsets
  assertEqual(rb.getValueAtOffset(p1, 0), (15001 % 2 === 0) ? 1 : 0, 'Value at oldest offset matches formula');
  assertEqual(rb.getValueAtOffset(p1, 9999), (25000 % 2 === 0) ? 1 : 0, 'Value at newest offset matches formula');
});

runTortureTest('RingBuffer dynamic channel additions and removals under stress', () => {
  const rb = new RingBuffer(100);
  const sampleMap = new Map();

  for (let i = 0; i < 50; i++) {
    sampleMap.set(`ch_${i}`, 1);
  }
  for (let t = 1; t <= 200; t++) {
    rb.record(t, sampleMap);
  }
  assertEqual(rb.channels.size, 50, 'Recorded 50 channels');

  // Remove 25 channels
  for (let i = 0; i < 25; i++) {
    rb.removeChannel(`ch_${i}`);
  }
  assertEqual(rb.channels.size, 25, '25 channels remained after deletion');

  // Clear and rewind
  rb.clear();
  assertEqual(rb.count, 0, 'Count reset to 0');
  rb.rewind();
  assertEqual(rb.count, 0, 'Rewind on empty buffer does not underflow');
});

// -----------------------------------------------------------------------------
// 4. SIMULATION ENGINE TORTURE: 2,000 GATES CASCADE & FEEDBACK RINGS
// -----------------------------------------------------------------------------

runTortureTest('2,000 Gates Cascade Simulation (500 steps continuous)', () => {
  const circuit = new Circuit();
  const rb = new RingBuffer(1000);
  const engine = new SimulationEngine(circuit, rb, () => {});
  engine.setMode('sim');

  const sw = circuit.addComponent('SWITCH', 0, 0, { initialValue: 1 });
  let prevComp = sw;

  for (let i = 0; i < 2000; i++) {
    const gateType = (i % 2 === 0) ? 'BUFFER' : 'NOT';
    const comp = circuit.addComponent(gateType, (i + 1) * 20, 0);
    circuit.addWire(prevComp.id, 0, comp.id, 0);
    prevComp = comp;
  }

  const led = circuit.addComponent('LED', 40020, 0);
  circuit.addWire(prevComp.id, 0, led.id, 0);

  // Run 500 steps
  for (let s = 0; s < 500; s++) {
    engine.stepTick();
  }

  assert(engine.tickCount === 500, '500 ticks executed successfully');
});

runTortureTest('101-NOT Ring Oscillator 2,000 ticks without stack overflow', () => {
  const circuit = new Circuit();
  const rb = new RingBuffer(1000);
  const engine = new SimulationEngine(circuit, rb, () => {});
  engine.setMode('sim');

  const count = 101;
  const gates = [];
  for (let i = 0; i < count; i++) {
    gates.push(circuit.addComponent('NOT', i * 20, 0));
  }
  for (let i = 0; i < count; i++) {
    const nextIdx = (i + 1) % count;
    circuit.addWire(gates[i].id, 0, gates[nextIdx].id, 0);
  }

  for (let t = 0; t < 2000; t++) {
    engine.stepTick();
  }
  assertEqual(engine.tickCount, 2000, '2,000 ticks completed without oscillation recursion');
});

runTortureTest('Rapid frequency modulation during live simulation (1 Hz to 60 Hz)', () => {
  const circuit = new Circuit();
  const rb = new RingBuffer(1000);
  const engine = new SimulationEngine(circuit, rb, () => {});
  engine.setMode('sim');
  engine.start();

  const freqs = [1, 5, 10, 20, 45, 60, -10, NaN, 1000, 0.5];
  for (const f of freqs) {
    engine.setFrequency(f);
    assert(engine.frequency >= 1 && engine.frequency <= 60, `Frequency clamped to 1..60, got ${engine.frequency}`);
    engine.stepTick();
  }
  engine.pause();
});

runTortureTest('Snapshot History Rollback: 100 steps rollback integrity', () => {
  const circuit = new Circuit();
  const rb = new RingBuffer(500);
  const engine = new SimulationEngine(circuit, rb, () => {});
  engine.setMode('sim');

  const clk = circuit.addComponent('CLOCK', 0, 0, { halfPeriod: 2 });
  const cnt = circuit.addComponent('COUNTER', 100, 0, { mode: 'bin' });
  circuit.addWire(clk.id, 0, cnt.id, 0);

  for (let t = 0; t < 50; t++) {
    engine.stepTick();
  }

  const snapAt50 = engine.createSnapshot();
  const tickAt50 = engine.tickCount;
  const countValAt50 = cnt.state.count;

  for (let t = 0; t < 50; t++) {
    engine.stepTick();
  }
  assert(engine.tickCount === 100, 'Advanced to 100 ticks');

  // Restore snapshot at 50
  engine.restoreSnapshot(snapAt50);
  assertEqual(engine.tickCount, tickAt50, 'Tick count rolled back to 50');
  assertEqual(cnt.state.count, countValAt50, 'Counter state rolled back to exact value at tick 50');
});

// -----------------------------------------------------------------------------
// 5. AUTO-ROUTING, ORTHOGONAL LAYOUT & MESH STRESS TESTING
// -----------------------------------------------------------------------------

runTortureTest('Auto-router deconflicts 30 parallel wire channels without collision', () => {
  const app = new LogicSimApp();
  const circuit = app.circuit;
  circuit.clear();
  const src = circuit.addComponent('SWITCH', 40, 100);

  for (let i = 0; i < 30; i++) {
    const dst = circuit.addComponent('AND', 300, 100 + (i + 1) * 40);
    circuit.addWire(src.id, 0, dst.id, 0);
  }

  app.deconflictWireChannels();
  assertEqual(circuit.wires.length, 30, 'All 30 wires exist');
  // Check that channel offsets are distributed
  const offsets = new Set(circuit.wires.map(w => w.channelOffset));
  assert(offsets.size > 1, `Wire channel offsets were distributed to avoid collision (got ${offsets.size} distinct offsets)`);
});

runTortureTest('Collinear bend simplification under degenerate zigzag topologies', () => {
  const app = new LogicSimApp();
  const circuit = app.circuit;
  circuit.clear();
  const c1 = circuit.addComponent('SWITCH', 0, 0);
  const c2 = circuit.addComponent('LED', 200, 0);

  // Add wire with redundant collinear points on horizontal line
  const wire = circuit.addWire(c1.id, 0, c2.id, 0, [
    { x: 50, y: 0 },
    { x: 80, y: 0 },
    { x: 100, y: 0 },
    { x: 150, y: 0 }
  ]);

  app.cleanWireWaypoints(wire);
  // Collinear intermediate points on line y=0 should be removed
  assert(wire.waypoints.length <= 1, `Collinear points simplified (length ${wire.waypoints.length})`);
});

runTortureTest('SnapOpenWiresToComponent on 50 floating wires in radius', () => {
  const circuit = new Circuit();
  const targetGate = circuit.addComponent('AND', 200, 200);

  // Create 50 open wires pointing into (200, 200)
  for (let i = 0; i < 50; i++) {
    const sw = circuit.addComponent('SWITCH', 0, i * 20);
    const w = circuit.addWire(sw.id, 0, null, null);
    w.toPoint = { x: 200, y: 200 };
  }

  const snapped = circuit.snapOpenWiresToComponent(targetGate, 24);
  assert(snapped > 0, `Snapped ${snapped} wires to target gate pins`);
});

// -----------------------------------------------------------------------------
// 6. TRUTH TABLE GENERATOR EDGE CASES & STRESS
// -----------------------------------------------------------------------------

runTortureTest('TruthTableGenerator 8 inputs (256 rows) analysis without freeze', () => {
  const circuit = new Circuit();
  const switches = [];
  for (let i = 0; i < 8; i++) {
    switches.push(circuit.addComponent('SWITCH', 0, i * 40));
  }
  const orGate = circuit.addComponent('OR', 300, 100);
  const led = circuit.addComponent('LED', 500, 100);
  circuit.addWire(switches[0].id, 0, orGate.id, 0);
  circuit.addWire(switches[1].id, 0, orGate.id, 1);
  circuit.addWire(orGate.id, 0, led.id, 0);

  const table = TruthTableGenerator.generate(circuit, null);
  assert(!table.error, 'Generated 8-input truth table without error');
  assertEqual(table.rows.length, 256, 'Truth table contains exactly 256 rows');
});

runTortureTest('TruthTableGenerator gracefully caps circuits with > 8 inputs', () => {
  const circuit = new Circuit();
  for (let i = 0; i < 12; i++) {
    circuit.addComponent('SWITCH', 0, i * 40);
  }
  const led = circuit.addComponent('LED', 300, 100);

  const table = TruthTableGenerator.generate(circuit, null);
  assert(table.warning && table.warning.includes('8 Eingänge'), 'Warns about capping at 8 inputs');
  assertEqual(table.rows.length, 256, 'Capped at 256 rows to prevent browser freeze');
});

// -----------------------------------------------------------------------------
// 7. HARDWARE VERIFICATION & EXTENDED TORTURE BENCHMARKS
// -----------------------------------------------------------------------------

runTortureTest('16-bit Ripple-Carry Adder hardware verification (0x5555 + 0xAAAA + 1 = 0x10000)', () => {
  const circuit = new Circuit();
  const rb = new RingBuffer(100);
  const engine = new SimulationEngine(circuit, rb, () => {});
  engine.setMode('sim');

  const adders = [];
  const inA = [];
  const inB = [];
  const outS = [];

  // 16 full adders
  for (let i = 0; i < 16; i++) {
    const fa = circuit.addComponent('FULL_ADDER', i * 100, 100);
    adders.push(fa);
    const swA = circuit.addComponent('SWITCH', i * 100, 0);
    const swB = circuit.addComponent('SWITCH', i * 100, 40);
    inA.push(swA);
    inB.push(swB);
    const ledS = circuit.addComponent('LED', i * 100, 200);
    outS.push(ledS);

    circuit.addWire(swA.id, 0, fa.id, 0); // A
    circuit.addWire(swB.id, 0, fa.id, 1); // B
    circuit.addWire(fa.id, 0, ledS.id, 0); // Sum S

    if (i > 0) {
      // Connect Cout of stage i-1 to Cin of stage i
      circuit.addWire(adders[i - 1].id, 1, fa.id, 2);
    }
  }

  const cinSw = circuit.addComponent('SWITCH', 0, 80);
  circuit.addWire(cinSw.id, 0, adders[0].id, 2); // Cin of stage 0
  const coutLed = circuit.addComponent('LED', 1600, 200);
  circuit.addWire(adders[15].id, 1, coutLed.id, 0); // Final Cout

  // Test vector: A = 0x5555 (0101...), B = 0xAAAA (1010...), Cin = 0
  for (let i = 0; i < 16; i++) {
    const bitA = (0x5555 >> i) & 1;
    const bitB = (0xAAAA >> i) & 1;
    inA[i].state.value = bitA;
    inA[i].outputs[0].value = bitA;
    inA[i].nextOutputs[0] = bitA;

    inB[i].state.value = bitB;
    inB[i].outputs[0].value = bitB;
    inB[i].nextOutputs[0] = bitB;
  }
  cinSw.state.value = 0;
  cinSw.outputs[0].value = 0;
  cinSw.nextOutputs[0] = 0;

  // Step 40 times to allow full ripple carry propagation across all 16 stages
  for (let s = 0; s < 40; s++) {
    engine.stepTick();
  }

  // Sum should be 0xFFFF (all 1s), Cout should be 0
  for (let i = 0; i < 16; i++) {
    assertEqual(outS[i].inputs[0].value, 1, `Bit ${i} of sum must be 1`);
  }
  assertEqual(coutLed.inputs[0].value, 0, 'Final Cout must be 0 for 0x5555 + 0xAAAA + 0');

  // Now set Cin = 1 -> Sum should ripple to 0x0000, Cout = 1 (0x10000)
  cinSw.state.value = 1;
  cinSw.outputs[0].value = 1;
  cinSw.nextOutputs[0] = 1;
  for (let s = 0; s < 40; s++) {
    engine.stepTick();
  }
  for (let i = 0; i < 16; i++) {
    assertEqual(outS[i].inputs[0].value, 0, `Bit ${i} of sum must ripple to 0`);
  }
  assertEqual(coutLed.inputs[0].value, 1, 'Final Cout must be 1 for 0x5555 + 0xAAAA + 1 = 0x10000');
});

runTortureTest('50,000 continuous simulation steps with heap memory stability check', () => {
  const circuit = new Circuit();
  const rb = new RingBuffer(1000);
  const engine = new SimulationEngine(circuit, rb, () => {});
  engine.setMode('sim');

  const clk = circuit.addComponent('CLOCK', 0, 0, { halfPeriod: 2 });
  const cnt = circuit.addComponent('COUNTER', 100, 0, { mode: 'bin' });
  const led = circuit.addComponent('LED', 200, 0);
  circuit.addWire(clk.id, 0, cnt.id, 0);
  circuit.addWire(cnt.id, 0, led.id, 0);

  if (typeof global.gc === 'function') global.gc();
  const initialHeap = process.memoryUsage().heapUsed;

  for (let i = 0; i < 50000; i++) {
    engine.stepTick();
  }

  assertEqual(engine.tickCount, 50000, '50,000 steps executed without fault');
  if (typeof global.gc === 'function') global.gc();
  const finalHeap = process.memoryUsage().heapUsed;
  const growthMB = (finalHeap - initialHeap) / (1024 * 1024);
  assert(growthMB < 60, `Heap growth was bounded (${growthMB.toFixed(2)} MB over 50k steps)`);
});

runTortureTest('64-deep branched wire tree immediate level propagation', () => {
  const circuit = new Circuit();
  const sw = circuit.addComponent('SWITCH', 0, 0, { initialValue: 1 });
  sw.outputs[0].value = 1;

  let parentWire = circuit.addWire(sw.id, 0, null, null);
  for (let i = 1; i <= 64; i++) {
    const childWire = circuit.addWire(null, null, null, null, null, [], { fromWireId: parentWire.id });
    parentWire = childWire;
  }

  circuit.updateWireLevelsFromDrivers();
  assertEqual(parentWire.level, 1, 'Signal propagates through 64 nested branch wires to leaf');
});

runTortureTest('CanvasRenderer extreme viewport zoom (0.001x to 500x) and pan limits', () => {
  const circuit = new Circuit();
  const canvas = createMockElem('grid-canvas');
  const engine = new SimulationEngine(circuit, new RingBuffer(10), () => {});
  const renderer = new CanvasRenderer(canvas, circuit, engine);

  const testZooms = [0.0001, 0.01, 0.5, 1.0, 5.0, 100.0, 1000.0, NaN, Infinity, -5];
  for (const z of testZooms) {
    renderer.zoom = z;
    renderer.panX = 1e8;
    renderer.panY = -1e8;
    renderer.render(); // should execute cleanly without throwing
  }
  assert(true, 'Render executed safely across extreme viewports');
});

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------

console.log('\n================================================================');
console.log(`TORTURE SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log('================================================================\n');

if (failed > 0) {
  process.exit(1);
}
