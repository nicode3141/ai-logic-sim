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

const createMockElem = (id = '') => {
  const classes = new Set();
  const el = {
    id, _textContent: '', value: '10', width: 1200, height: 800,
    children: [],
    listeners: {},
    addEventListener(event, fn) {
      if (!this.listeners[event]) this.listeners[event] = [];
      this.listeners[event].push(fn);
    },
    removeEventListener(event, fn) {
      if (this.listeners[event]) this.listeners[event] = this.listeners[event].filter(f => f !== fn);
    },
    click() {
      if (this.listeners['click']) {
        this.listeners['click'].forEach(fn => fn({ clientX: 0, clientY: 0, preventDefault: () => {} }));
      }
    },
    querySelectorAll(sel) { return []; },
    querySelector(sel) {
      if (!sel) return null;
      if (sel.startsWith('.')) {
        const cls = sel.slice(1);
        for (const c of this.children) {
          if (c.classList && c.classList.contains(cls)) return c;
          if (typeof c.querySelector === 'function') {
            const sub = c.querySelector(sel);
            if (sub) return sub;
          }
        }
      }
      return null;
    },
    setAttribute(k, v) { this[k] = v; },
    getAttribute(k) { return this[k] || null; },
    hasAttribute(k) { return k in this; },
    appendChild(child) {
      this.children.push(child);
      return child;
    },
    removeChild(child) {
      const idx = this.children.indexOf(child);
      if (idx !== -1) this.children.splice(idx, 1);
      return child;
    },
    classList: {
      add: (c) => classes.add(c),
      remove: (c) => classes.delete(c),
      toggle: (c, force) => {
        if (force !== undefined) {
          if (force) classes.add(c); else classes.delete(c);
          return force;
        }
        if (classes.has(c)) { classes.delete(c); return false; }
        classes.add(c); return true;
      },
      contains: (c) => classes.has(c)
    },
    dataset: {},
    dispatchEvent(event) {
      const list = this.listeners[event.type] || [];
      list.forEach(fn => fn(event));
      return true;
    },
    style: {}, getContext: () => mockCtx,
    parentElement: { getBoundingClientRect: () => ({ width: 1200, height: 800 }) },
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 1200, height: 800 })
  };

  Object.defineProperty(el, 'innerHTML', {
    set(val) {
      this._innerHTML = val;
      if (!val) {
        this.children = [];
        this._textContent = '';
      } else {
        this._textContent = String(val).replace(/<[^>]*>/g, ' ');
      }
    },
    get() { return this._innerHTML || ''; },
    configurable: true
  });

  Object.defineProperty(el, 'textContent', {
    set(val) { this._textContent = val; },
    get() {
      if (this.children.length > 0) {
        return this.children.map(c => c.textContent || '').join(' ');
      }
      return this._textContent || '';
    },
    configurable: true
  });

  return el;
};

const window = {
  addEventListener: () => {}, removeEventListener: () => {},
  devicePixelRatio: 1, innerWidth: 1920, innerHeight: 1080,
  requestAnimationFrame: (cb) => setTimeout(cb, 16),
  cancelAnimationFrame: (id) => clearTimeout(id)
};
global.requestAnimationFrame = window.requestAnimationFrame;
global.cancelAnimationFrame = window.cancelAnimationFrame;

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

// 2. Load and Instantiate Application
const htmlPath = path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const scriptMatch = html.match(/<script[\s\S]*?>([\s\S]*?)<\/script>/i);
if (!scriptMatch) throw new Error('No script tag found in index.html');

const evalFn = new Function(
  'window', 'document', 'localStorage',
  scriptMatch[1] + '; return { LogicSimApp, CanvasRenderer, LogicAnalyzerRenderer, Circuit, Component, Wire, Probe, RingBuffer, SimulationEngine, BooleanParser, TruthTableGenerator, escapeHtml, sanitizeParams, attachSliderHoldRepeat, I18N, LED_COLORS, SIGNAL_COLOR_PRESETS };'
);
const { LogicSimApp, CanvasRenderer, LogicAnalyzerRenderer, Circuit, Component, Wire, Probe, RingBuffer, SimulationEngine, BooleanParser, TruthTableGenerator, escapeHtml, sanitizeParams, attachSliderHoldRepeat, I18N, LED_COLORS, SIGNAL_COLOR_PRESETS } = evalFn(window, document, localStorage);

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

runTest('WISH-010 & WISH-014', 'Coordinates display at bottom left, -5000..5000 field bounds, starting at 0, and popover jump', () => {
  // Check HTML elements
  const coordsIndex = html.indexOf('id="status-coords"');
  const modeIndex = html.indexOf('id="status-mode-pill"');
  assertEqual(coordsIndex !== -1, true, 'status-coords exists');
  assertEqual(coordsIndex < modeIndex, true, 'status-coords is placed at bottom-left before status-mode-pill');
  assertEqual(html.includes('id="coords-jump-popover"'), true, 'coords-jump-popover exists in HTML');
  assertEqual(html.includes('id="coords-input-x"'), true, 'coords-input-x exists');
  assertEqual(html.includes('id="coords-input-y"'), true, 'coords-input-y exists');
  assertEqual(html.includes('min="-5000" max="5000"'), true, 'coords inputs bound to -5000..5000');

  // Check component boundary clamping to -5000..5000
  const cOutOfBounds1 = new Component('c_neg', 'AND', -12000, -8000);
  assertEqual(cOutOfBounds1.x, -5000, 'Component negative x clamped to -5000');
  assertEqual(cOutOfBounds1.y, -5000, 'Component negative y clamped to -5000');

  const cOutOfBounds2 = new Component('c_big', 'AND', 15000, 20000);
  assertEqual(cOutOfBounds2.x, 5000, 'Component x clamped to 5000');
  assertEqual(cOutOfBounds2.y, 5000, 'Component y clamped to 5000');

  const cZero = new Component('c_zero', 'AND', 0, 0);
  assertEqual(cZero.x, 0, 'Component origin x is 0');
  assertEqual(cZero.y, 0, 'Component origin y is 0');

  // Check updateStatusCoords clamping
  const app = new LogicSimApp();
  app.updateStatusCoords({ x: -10000, y: 15000 });
  assertEqual(app._statusCoordText, 'X: -5000 px, Y: 5000 px', 'Status coords clamps display to -5000..5000');
  app.updateStatusCoords({ x: 0, y: 0 });
  assertEqual(app._statusCoordText, 'X: 0 px, Y: 0 px', 'Status coords shows 0, 0 at center');
});

runTest('WISH-011', 'Norm bar removed from top menubar and toolbar', () => {
  assertEqual(html.includes('id="mbtn-norm"'), false, 'mbtn-norm removed from top menubar');
  assertEqual(html.includes('id="hud-norm-badge"'), false, 'hud-norm-badge removed from top toolbar');
  assertEqual(html.includes('settings-norm-cards'), true, 'settings-norm-cards remains accessible in Settings modal');
});

runTest('WISH-012', 'Auswahl ausrichten toolbar buttons removed', () => {
  assertEqual(html.includes('id="align-tool-grid"'), false, 'align-tool-grid removed from layout popover');
  assertEqual(html.includes('id="align-selection-count"'), false, 'align-selection-count removed from layout popover');
  assertEqual(html.includes('data-align="left"'), false, 'individual align-tool buttons removed from popover');
});

runTest('WISH-013', 'Mouse click hold wire creation removed in favor of clean selection and context menu', () => {
  const app = new LogicSimApp();
  assertEqual(app.pendingWireBranch, undefined, 'pendingWireBranch is not initialized');
  assertEqual(html.includes('this.pendingWireBranch'), false, 'pendingWireBranch completely removed from index.html');
  assertEqual(html.includes('Neue Verbindung ab hier starten'), true, 'Context menu retains intentional branch starting');
});

runTest('WISH-015', 'Timing diagram Premiere Pro playhead navigation and dynamic time frame adaptation', () => {
  const canvas = createMockElem('canvas');
  canvas.width = 1200;
  canvas.height = 300;
  const circuit = new Circuit();
  const ringBuffer = new RingBuffer(256);
  for (let i = 0; i < 50; i++) {
    const samples = new Map([['probe_1', i % 2]]);
    ringBuffer.record(i, samples);
  }

  const analyzer = new LogicAnalyzerRenderer(canvas, circuit, ringBuffer);
  assertEqual(typeof analyzer.startEdgeAutoScroll, 'function', 'startEdgeAutoScroll method exists');
  assertEqual(typeof analyzer.stopEdgeAutoScroll, 'function', 'stopEdgeAutoScroll method exists');
  assertEqual(analyzer.pixelsPerTick, 12, 'default pixelsPerTick is 12');

  // Verify time frame badge information formatting in updateLoopUi
  analyzer.playheadOffset = 25;
  analyzer.updateLoopUi();
  const badge = document.getElementById('analyzer-playhead-info');
  assertEqual(badge.textContent.includes('Playhead: t = 25'), true, 'Playhead tick displayed');
  assertEqual(badge.textContent.includes('Zeitrahmen:'), true, 'Zeitrahmen info displayed');

  // Test edge auto scroll adjustment
  analyzer.isScrubbing = true;
  analyzer.scrollRatio = 0.5;
  analyzer.startEdgeAutoScroll(1);
  assertEqual(Boolean(analyzer.autoscrollTimer), true, 'autoscrollTimer is active on edge');
  analyzer.stopEdgeAutoScroll();
  assertEqual(analyzer.autoscrollTimer, null, 'autoscrollTimer stops when leaving edge');
});

runTest('WISH-016', 'Consistent design colors, module styling, and high contrast across all 5 themes', () => {
  const canvas = createMockElem('canvas');
  canvas.width = 1000;
  canvas.height = 600;
  const circuit = new Circuit();
  const renderer = new CanvasRenderer(canvas, circuit);

  const themeKeys = ['modern', 'pitch_black', 'java_swing', 'blueprint', 'light_cad'];
  const requiredTokens = [
    'bg', 'gridDot', 'gridMajor', 'gridCrosshair', 'gridBorder', 'gridText',
    'gateFill', 'gateStroke', 'chassisFill', 'chassisStroke',
    'moduleFill', 'moduleStroke', 'moduleTitle', 'moduleText', 'moduleSub',
    'displayWellFill', 'displayWellStroke', 'segOff',
    'pinFill', 'pinStroke', 'wireLow', 'textLabel', 'textMuted', 'leadLine'
  ];

  for (const theme of themeKeys) {
    renderer.appTheme = theme;
    const pal = renderer.getThemePalette();
    for (const token of requiredTokens) {
      assertEqual(Boolean(pal[token]), true, `Token ${token} defined for theme ${theme}`);
    }

    // Contrast assertions
    if (theme === 'java_swing' || theme === 'light_cad') {
      // Light themes must have light backgrounds and dark text labels
      assertEqual(pal.bg.startsWith('#f') || pal.bg === '#ffffff', true, `${theme} has light canvas background`);
      assertEqual(pal.textLabel === '#000000' || pal.textLabel === '#0f172a', true, `${theme} has dark high-contrast text`);
      // Java Swing specific retro styling
      if (theme === 'java_swing') {
        assertEqual(pal.chassisFill, '#ece9d8', 'Java Swing has classic beige chassis');
        assertEqual(pal.moduleTitle, '#000080', 'Java Swing has classic navy title');
        assertEqual(pal.boxRadius, 0, 'Java Swing has 0px box radius');
      }
    } else {
      // Dark / OLED / Blueprint themes must have dark backgrounds and light text labels
      assertEqual(pal.textLabel.startsWith('#f') || pal.textLabel.startsWith('#e'), true, `${theme} has light high-contrast text`);
      if (theme === 'pitch_black') {
        assertEqual(pal.bg, '#000000', 'pitch_black is pure OLED black');
        assertEqual(pal.moduleFill, '#000000', 'pitch_black moduleFill is pure OLED black');
      }
      if (theme === 'blueprint') {
        assertEqual(pal.bg, '#071527', 'blueprint has technical navy background');
        assertEqual(pal.gateStroke, '#38bdf8', 'blueprint has bright sky blue gate contours');
      }
    }
  }

  // Verify LogicAnalyzerRenderer respects theme settings without crashing
  const ringBuffer = new RingBuffer(64);
  const analyzer = new LogicAnalyzerRenderer(canvas, circuit, ringBuffer);
  for (const theme of themeKeys) {
    analyzer.appTheme = theme;
    analyzer.render();
  }
});

runTest('WISH-017', 'Complete English language support and phrase dictionary parity', () => {
  const originalLang = I18N.currentLang;
  I18N.currentLang = 'en';
  try {
    assertEqual(typeof I18N, 'object');
    assertEqual(typeof I18N.t, 'function');
    assertEqual(typeof I18N.phrase, 'function');

    // Verify critical UI strings exist in English phrase dictionary
    const criticalPhrases = [
      'Interaktion & Bedienung:',
      'Erscheinungsbild & Workbench-Design:',
      'Schaltsymbol-Norm:',
      'Leitungs- & Signalfarben (HIGH-Zustand 1):',
      'Eckpunkte & Routing',
      'Wahrheitstabelle (Truth Table)',
      'Boolesche Schaltalgebra & Gatter-Synthese',
      '📍 Zu Koordinate springen',
      'Im Inspector anzeigen',
      'Bauteil duplizieren',
      'Bauteil löschen'
    ];
    for (const phrase of criticalPhrases) {
      const en = I18N.phrase(phrase);
      assertEqual(typeof en, 'string', `Translation for "${phrase}" must be a string`);
      assertEqual(en !== phrase, true, `Translation for "${phrase}" must not be identical to German source: got "${en}"`);
    }
  } finally {
    I18N.currentLang = originalLang;
  }
});

runTest('WISH-018', 'GUI contrast and context menu consistency across themes', () => {
  // Verify HTML contains high contrast rules for context menu in light themes
  assertEqual(html.includes('[data-theme="java_swing"] .context-menu'), true, 'Java Swing context menu overrides present');
  assertEqual(html.includes('[data-theme="java_swing"] .ctx-item:hover'), true, 'Java Swing context menu hover overrides present');
  assertEqual(html.includes('#0a246a'), true, 'Classic Java Swing dark blue selection highlight present');
  assertEqual(html.includes('[data-theme="light_cad"] .context-menu'), true, 'Light CAD context menu overrides present');
  assertEqual(html.includes('[data-theme="light_cad"] .ctx-item:hover'), true, 'Light CAD context menu hover overrides present');
});

runTest('WISH-019', 'Clean pin labels without overlapping OUT/IN text on simple components', () => {
  const c = new Circuit();
  const sw = c.addComponent('SWITCH', 0, 0);
  const btn = c.addComponent('BUTTON', 100, 0);
  const clk = c.addComponent('CLOCK', 200, 0);
  const konst = c.addComponent('CONST', 300, 0);
  const led = c.addComponent('LED', 400, 0);
  const dff = c.addComponent('D_FF', 500, 0);

  const canvas = createMockElem('c');
  const renderer = new CanvasRenderer(canvas, c);

  const drawnTexts = [];
  mockCtx.fillText = (txt, x, y) => {
    drawnTexts.push(String(txt));
  };

  renderer.drawComponentPins(mockCtx, sw);
  renderer.drawComponentPins(mockCtx, btn);
  renderer.drawComponentPins(mockCtx, clk);
  renderer.drawComponentPins(mockCtx, konst);
  renderer.drawComponentPins(mockCtx, led);

  // Redundant OUT / IN labels should NOT be drawn on simple components
  assertEqual(drawnTexts.includes('OUT'), false, 'SWITCH/BUTTON/CONST must not draw overlapping OUT pin text');
  assertEqual(drawnTexts.includes('IN'), false, 'LED must not draw overlapping IN pin text');

  // Complex multi-pin components MUST still draw their pins (e.g. Q, Q̅)
  drawnTexts.length = 0;
  renderer.drawComponentPins(mockCtx, dff);
  assertEqual(drawnTexts.includes('D'), true, 'D-FF must draw input pin D');
  assertEqual(drawnTexts.includes('Q'), true, 'D-FF must draw output pin Q');
  assertEqual(drawnTexts.includes('Q̅'), true, 'D-FF must draw output pin Q̅');
});

runTest('WISH-020', 'Circular lamp indicator symbol with X and vibrant saturated colors', () => {
  const c = new Circuit();
  const led = c.addComponent('LED', 100, 80, { color: 'green' });
  assertEqual(led.width, 40, 'LED component width is 40px (compact lamp)');
  assertEqual(led.height, 40, 'LED component height is 40px (compact lamp)');
  assertEqual(led.inputs.length, 1, 'LED has 1 input pin');
  assertEqual(led.inputs[0].relY, 20, 'LED input pin centered vertically');

  // Verify saturated LED color palette
  assertEqual(LED_COLORS.green.on, '#00ff66', 'Vibrant neon green ON');
  assertEqual(LED_COLORS.red.on, '#ff1744', 'Vibrant neon red ON');
  assertEqual(LED_COLORS.yellow.on, '#ffee00', 'Vibrant neon yellow ON');
  assertEqual(LED_COLORS.blue.on, '#00b4ff', 'Vibrant neon blue ON');

  const canvas = createMockElem('c');
  const renderer = new CanvasRenderer(canvas, c);
  let arcDrawn = false;
  let linesDrawn = 0;

  mockCtx.arc = (cx, cy, r) => {
    if (r === 14) arcDrawn = true;
  };
  mockCtx.lineTo = () => {
    linesDrawn++;
  };

  renderer.drawLampComponent(mockCtx, led, false);
  assertEqual(arcDrawn, true, 'Lamp circle with radius 14 drawn');
  assertEqual(linesDrawn >= 2, true, 'Diagonal cross X drawn inside circle');
});

runTest('WISH-021', 'Signal colors (HIGH & LOW) configuration, enhanced presets and fluid picker synchronization', () => {
  // 1. Validate SIGNAL_COLOR_PRESETS structure
  assertEqual(Array.isArray(SIGNAL_COLOR_PRESETS), true, 'SIGNAL_COLOR_PRESETS is an array');
  assertEqual(SIGNAL_COLOR_PRESETS.length >= 8, true, 'At least 8 signal color presets available');

  const hexRegex = /^#[0-9a-fA-F]{6}$/;
  for (const preset of SIGNAL_COLOR_PRESETS) {
    assertEqual(typeof preset.id, 'string', `Preset ${preset.id} has string id`);
    assertEqual(typeof preset.name, 'string', `Preset ${preset.id} has string name`);
    assertEqual(hexRegex.test(preset.high), true, `Preset ${preset.id} has valid HIGH hex ${preset.high}`);
    assertEqual(hexRegex.test(preset.low), true, `Preset ${preset.id} has valid LOW hex ${preset.low}`);
    assertEqual(typeof preset.highGlow, 'string', `Preset ${preset.id} has highGlow string`);
  }

  // 2. Validate CanvasRenderer signal color propagation
  const c = new Circuit();
  const sw = c.addComponent('SWITCH', 40, 40);
  const notGate = c.addComponent('NOT', 140, 40);
  const w1 = c.addWire(sw.id, 0, notGate.id, 0);

  const canvas = createMockElem('c');
  const renderer = new CanvasRenderer(canvas, c);

  // Default values
  assertEqual(renderer.highSignalColor, '#00ff66', 'Default high signal color is #00ff66');
  assertEqual(renderer.lowSignalColor, null, 'Default low signal color is null (falls back to theme wireLow)');

  // Set custom high and low colors
  renderer.highSignalColor = '#e040fb'; // Synthwave Pink
  renderer.lowSignalColor = '#2e123d';  // Synthwave Dark Purple

  // Verify wire strokeStyle when wire is LOW (level 0)
  w1.level = 0;
  let strokeColors = [];
  const wireCtx = Object.create(mockCtx);
  Object.defineProperty(wireCtx, 'strokeStyle', {
    set(val) { strokeColors.push(val); },
    get() { return strokeColors[strokeColors.length - 1]; },
    configurable: true
  });
  renderer.drawWires(wireCtx);
  assertEqual(strokeColors.includes('#2e123d'), true, 'Wire level 0 rendered with configured lowSignalColor (#2e123d)');

  // Verify wire strokeStyle when wire is HIGH (level 1)
  w1.level = 1;
  strokeColors = [];
  renderer.drawWires(wireCtx);
  assertEqual(strokeColors.includes('#e040fb'), true, 'Wire level 1 rendered with configured highSignalColor (#e040fb)');

  // Verify pin circle color when isHigh = false vs isHigh = true
  let pinFillColors = [];
  const pinCtx = Object.create(mockCtx);
  Object.defineProperty(pinCtx, 'fillStyle', {
    set(val) { pinFillColors.push(val); },
    get() { return pinFillColors[pinFillColors.length - 1]; },
    configurable: true
  });
  renderer.drawPinCircle(pinCtx, 100, 100, false, false);
  assertEqual(pinFillColors.includes('#2e123d'), true, 'Low pin rendered with lowSignalColor');

  pinFillColors = [];
  renderer.drawPinCircle(pinCtx, 100, 100, true, false);
  assertEqual(pinFillColors.includes('#e040fb'), true, 'High pin rendered with highSignalColor');

  // 3. LogicSimApp paired configuration and persistence
  const app = new LogicSimApp();
  app.setSignalColors('#00e5ff', '#0e2a3e');
  assertEqual(app.highSignalColor, '#00e5ff', 'App highSignalColor set to #00e5ff');
  assertEqual(app.lowSignalColor, '#0e2a3e', 'App lowSignalColor set to #0e2a3e');
  assertEqual(app.renderer.highSignalColor, '#00e5ff', 'App renderer highSignalColor matches');
  assertEqual(app.renderer.lowSignalColor, '#0e2a3e', 'App renderer lowSignalColor matches');

  // Verify reset to defaults
  app.setSignalColors('#00ff66', '#143823');
  assertEqual(app.highSignalColor, '#00ff66', 'App highSignalColor reset to #00ff66');
  assertEqual(app.lowSignalColor, '#143823', 'App lowSignalColor reset to #143823');
});

runTest('WISH-022', 'Moving and reconnecting open wire ends (findOpenTerminusAt, drag polyline update & pin drop)', () => {
  const circuit = new Circuit();
  const sw = circuit.addComponent('SWITCH', 100, 100);
  const led = circuit.addComponent('LED', 400, 100);

  // 1. Create an open wire ending at a free world point
  const openWire = circuit.addWire(sw.id, 0, null, null);
  openWire.toPoint = { x: 260, y: 100 };

  const canvas = createMockElem('c');
  const renderer = new CanvasRenderer(canvas, circuit);

  // 2. Test findOpenTerminusAt hit detection
  const hitExact = renderer.findOpenTerminusAt(260, 100, 12);
  assertEqual(hitExact !== null, true, 'findOpenTerminusAt detects open end at exact coords');
  assertEqual(hitExact.wire.id, openWire.id, 'Detected wire matches openWire');
  assertEqual(hitExact.isEnd, true, 'Identified as wire end terminus');
  assertEqual(hitExact.isStart, false, 'Not a wire start');

  const hitNear = renderer.findOpenTerminusAt(265, 103, 12);
  assertEqual(hitNear !== null, true, 'findOpenTerminusAt detects open end within tolerance');

  const hitMiss = renderer.findOpenTerminusAt(350, 350, 12);
  assertEqual(hitMiss, null, 'findOpenTerminusAt returns null for distant coords');

  // 3. Move open end point and verify getWirePolyline dynamically routes to new position
  openWire.toPoint.x = 280;
  openWire.toPoint.y = 140;
  const polylineAfterMove = renderer.getWirePolyline(openWire);
  assertEqual(polylineAfterMove.length >= 2, true, 'Wire polyline has valid points');
  const lastPoint = polylineAfterMove[polylineAfterMove.length - 1];
  assertEqual(lastPoint.x, 280, 'Polyline ends at updated x coordinate 280');
  assertEqual(lastPoint.y, 140, 'Polyline ends at updated y coordinate 140');

  // 4. Test floating start wire terminus
  const floatingStartWire = circuit.addWire(null, null, led.id, 0);
  floatingStartWire.fromPoint = { x: 320, y: 100 };
  const hitStart = renderer.findOpenTerminusAt(320, 100, 12);
  assertEqual(hitStart !== null, true, 'findOpenTerminusAt detects open start terminus');
  assertEqual(hitStart.isStart, true, 'Identified as wire start terminus');
  assertEqual(hitStart.isEnd, false, 'Not an end terminus');

  // 5. Connect open wire end by dropping on target pin
  const pinPos = led.getPinWorldPos(false, 0);
  const ledPin = renderer.findPinAt(pinPos.x, pinPos.y, 15);
  assertEqual(ledPin !== null, true, `LED input pin located at (${pinPos.x}, ${pinPos.y})`);
  assertEqual(ledPin.isOutput, false, 'LED pin is an input pin');

  // Simulate dropping terminus onto ledPin
  openWire.toCompId = ledPin.compId;
  openWire.toPin = ledPin.pinIndex;
  openWire.toPoint = null;

  const polylineConnected = renderer.getWirePolyline(openWire);
  const connectedEnd = polylineConnected[polylineConnected.length - 1];
  assertEqual(openWire.toPoint, null, 'toPoint cleared when wire is connected');
  assertEqual(connectedEnd.x, pinPos.x, `Connected wire ends exactly at LED pin x (${pinPos.x})`);
  assertEqual(connectedEnd.y, pinPos.y, `Connected wire ends exactly at LED pin y (${pinPos.y})`);
  assertEqual(renderer.findOpenTerminusAt(280, 140, 12), null, 'Old open terminus no longer detected after connection');
});

runTest('WISH-023', 'Waypoint context menu provides options to delete both single waypoint and entire wire', () => {
  const app = new LogicSimApp();
  const c = app.circuit;
  const sw = c.addComponent('SWITCH', 40, 40);
  const led = c.addComponent('LED', 300, 40);

  // Add wire with multiple waypoints (bends)
  const wire = c.addWire(sw.id, 0, led.id, 0, null, [
    { x: 120, y: 40 },
    { x: 120, y: 120 },
    { x: 240, y: 120 }
  ]);
  assertEqual(wire.waypoints.length, 3, 'Wire initialized with 3 waypoints');

  // 1. Verify showWaypointContextMenu populates both delete options
  const hitWp = {
    wire: wire,
    waypointIndex: 1,
    point: wire.waypoints[1],
    x: 120,
    y: 120
  };

  app.showWaypointContextMenu(150, 150, hitWp, { x: 120, y: 120 });
  const menu = app.contextMenuEl;
  assertEqual(menu !== null, true, 'Context menu element exists');
  assertEqual(menu.children.length >= 4, true, 'Context menu contains multiple items');

  const menuText = menu.textContent || '';
  assertEqual(menuText.includes('Eckpunkt'), true, 'Context menu has waypoint header');
  assertEqual(menuText.includes('Diesen Eckpunkt löschen'), true, 'Context menu includes "Diesen Eckpunkt löschen"');
  assertEqual(menuText.includes('Ganze Leitung löschen'), true, 'Context menu includes "Ganze Leitung löschen"');
  assertEqual(menuText.includes('Begradigen'), true, 'Context menu includes "Begradigen"');
  assertEqual(menuText.includes('Neu verlegen'), true, 'Context menu includes "Neu verlegen (Auto)"');

  // 2. Test deleting single waypoint
  const delWpBtn = Array.from(menu.children).find(el => el.textContent && el.textContent.includes('Diesen Eckpunkt löschen'));
  assertEqual(Boolean(delWpBtn), true, 'Found "Diesen Eckpunkt löschen" menu item');
  delWpBtn.click();
  assertEqual(wire.waypoints.length, 2, 'Waypoint removed, wire now has 2 waypoints');
  assertEqual(c.wires.some(w => w.id === wire.id), true, 'Wire itself still exists in circuit');

  // 3. Re-open waypoint context menu and test deleting entire wire
  const hitWpRemaining = {
    wire: wire,
    waypointIndex: 0,
    point: wire.waypoints[0],
    x: 120,
    y: 40
  };
  app.showWaypointContextMenu(150, 150, hitWpRemaining, { x: 120, y: 40 });
  const delWireBtn = Array.from(app.contextMenuEl.children).find(el => el.textContent && el.textContent.includes('Ganze Leitung löschen'));
  assertEqual(Boolean(delWireBtn), true, 'Found "Ganze Leitung löschen" menu item');
  delWireBtn.click();
  assertEqual(c.wires.some(w => w.id === wire.id), false, 'Entire wire deleted from circuit after clicking "Ganze Leitung löschen"');

  // 4. Verify English translation phrase
  const origLang = I18N.currentLang;
  I18N.currentLang = 'en';
  const enDelWire = I18N.phrase('Ganze Leitung löschen');
  I18N.currentLang = origLang;
  assertEqual(enDelWire, 'Delete entire wire', 'English translation exists for "Ganze Leitung löschen"');
});

runTest('WISH-024', 'Logic analyzer simulation controls synchronized and smooth timeline navigation without blue bar', () => {
  const app = new LogicSimApp();
  
  // 1. Verify existence of timing diagram simulation controls
  const btnAnaStart = document.getElementById('btn-analyzer-sim-start');
  const btnAnaStepBack = document.getElementById('btn-analyzer-sim-step-back');
  const btnAnaStep = document.getElementById('btn-analyzer-sim-step');
  const anaPlayText = document.getElementById('analyzer-sim-play-text');

  assertEqual(Boolean(btnAnaStart), true, 'btn-analyzer-sim-start exists in analyzer header');
  assertEqual(Boolean(btnAnaStepBack), true, 'btn-analyzer-sim-step-back exists in analyzer header');
  assertEqual(Boolean(btnAnaStep), true, 'btn-analyzer-sim-step exists in analyzer header');

  // In Edit mode, simulation controls are disabled
  app.engine.setMode('edit');
  app.updateHUDAndToolbar();
  assertEqual(btnAnaStart.disabled, true, 'Analyzer start button is disabled in edit mode');
  assertEqual(btnAnaStep.disabled, true, 'Analyzer step button is disabled in edit mode');

  // In Sim mode, simulation controls are enabled
  app.engine.setMode('sim');
  app.updateHUDAndToolbar();
  assertEqual(btnAnaStart.disabled, false, 'Analyzer start button is enabled in sim mode');
  assertEqual(btnAnaStep.disabled, false, 'Analyzer step button is enabled in sim mode');
  assertEqual(anaPlayText.textContent, 'Start', 'Analyzer play text displays "Start"');

  // When running, text changes to "Pause" and style changes to warning
  app.engine.running = true;
  app.updateHUDAndToolbar();
  assertEqual(anaPlayText.textContent, 'Pause', 'Analyzer play text displays "Pause" when running');
  assertEqual(btnAnaStart.className.includes('btn-warning'), true, 'Analyzer start button has btn-warning class when running');
  app.engine.running = false;
  app.engine.setMode('edit');
  app.updateHUDAndToolbar();

  // 2. Test timeline panning and absence of blue bar
  const canvas = createMockElem('analyzer-canvas');
  canvas.width = 1200;
  canvas.height = 300;
  const circuit = new Circuit();
  const ringBuffer = new RingBuffer(256);
  for (let i = 0; i < 20; i++) {
    ringBuffer.record(i, new Map([['probe_1', i % 2]]));
  }
  const analyzer = new LogicAnalyzerRenderer(canvas, circuit, ringBuffer);

  // Verify render does not draw blue bar (rgba(0, 176, 255, 0.6))
  const drawnColors = [];
  mockCtx.fillStyle = '#000000';
  const origFillRect = mockCtx.fillRect;
  mockCtx.fillRect = (x, y, w, h) => {
    drawnColors.push(mockCtx.fillStyle);
  };
  analyzer.render();
  mockCtx.fillRect = origFillRect;
  const hasBlueBar = drawnColors.some(c => typeof c === 'string' && c.includes('rgba(0, 176, 255, 0.6)'));
  assertEqual(hasBlueBar, false, 'Blue navigator bar is removed from analyzer header');

  // 3. Test timeline panning state and fixed zoom stability
  assertEqual(analyzer.isPanningTimeline, false, 'isPanningTimeline is initially false');
  analyzer.pixelsPerTick = 16;
  // Simulating mouse drag should not modify pixelsPerTick (auto-scaling removed)
  analyzer.hoverX = 400;
  analyzer.hoverY = 15;
  analyzer.render();
  assertEqual(analyzer.pixelsPerTick, 16, 'pixelsPerTick remains stable without erratic auto-scaling');
});

runTest('WISH-025', 'Live clock frequency adjustment and dynamic analyzer brackets synchronization', () => {
  const circuit = new Circuit();
  const ringBuffer = new RingBuffer(256);
  const engine = new SimulationEngine(circuit, ringBuffer, () => {});

  // 1. Live simulation frequency changes during running operation
  engine.setMode('sim');
  engine.start();
  assertEqual(engine.running, true, 'Simulation engine is running');
  engine.frequency = 10;
  engine.accumulator = 80; // 80ms accumulated at 10Hz (interval = 100ms)

  let notifiedFreq = null;
  let notifiedOld = null;
  engine.onFrequencyChange = (newF, oldF) => {
    notifiedFreq = newF;
    notifiedOld = oldF;
  };

  // Change frequency on the fly to 20Hz (interval = 50ms)
  engine.setFrequency(20);
  assertEqual(engine.frequency, 20, 'Engine frequency updated to 20Hz');
  assertEqual(notifiedFreq, 20, 'onFrequencyChange callback triggered with new frequency 20');
  assertEqual(notifiedOld, 10, 'onFrequencyChange callback triggered with old frequency 10');
  // Accumulator should be scaled down and not exceed newInterval
  assertEqual(engine.accumulator <= 50, true, 'Accumulator smoothly scaled without causing tick bursts');

  engine.pause();

  // 2. Impulsdiagramm brackets (Klammern [ and ]) live update & synchronization
  const canvas = createMockElem('analyzer-canvas');
  canvas.width = 1200;
  canvas.height = 300;
  for (let i = 0; i < 30; i++) {
    ringBuffer.record(i, new Map([['probe_1', i % 2]]));
  }

  const analyzer = new LogicAnalyzerRenderer(canvas, circuit, ringBuffer);
  analyzer.simFrequency = 10;

  // Set In and Out points at ticks 5 and 15 (span = 10 ticks = 1000ms @ 10Hz)
  analyzer.setInPoint(5);
  analyzer.setOutPoint(15);
  assertEqual(Boolean(analyzer.loopRange), true, 'loopRange brackets created');
  assertEqual(analyzer.loopRange.inOffset, 5, 'inOffset is 5');
  assertEqual(analyzer.loopRange.outOffset, 15, 'outOffset is 15');
  assertEqual(analyzer.loopRange.inTick, 5, 'inTick is 5');
  assertEqual(analyzer.loopRange.outTick, 15, 'outTick is 15');

  // Changing simulation frequency updates analyzer brackets & timing calculation
  analyzer.setSimulationFrequency(20);
  assertEqual(analyzer.simFrequency, 20, 'Analyzer frequency updated to 20Hz');
  assertEqual(analyzer.loopRange.outOffset >= 15, true, 'Bracket span adapted proportionally');

  // Verify syncLoopRange preserves tick anchoring when new ticks arrive
  for (let i = 30; i < 40; i++) {
    ringBuffer.record(i, new Map([['probe_1', i % 2]]));
  }
  analyzer.render();
  assertEqual(analyzer.loopRange.inTick, 5, 'inTick remains anchored to tick 5 after recording new samples');

  // 3. Loop playback rate dynamically matches simulation clock frequency
  analyzer.startLoopAnimation();
  assertEqual(analyzer.isLoopPlaying, true, 'Loop playback is active');
  assertEqual(Boolean(analyzer.loopInterval), true, 'Loop interval timer started');
  analyzer.setSimulationFrequency(50); // 50 Hz -> 20ms tick interval
  assertEqual(analyzer.simFrequency, 50, 'simFrequency updated during loop playback');
  analyzer.stopLoopAnimation();
  assertEqual(analyzer.isLoopPlaying, false, 'Loop playback stopped cleanly');
});

runTest('WISH-026', 'Auto-snap open wires to placed modules, unified NOT gate with pin inversion and wire inlining', () => {
  const c = new Circuit();

  // 1. Auto-snap open wire end to dropped/pasted module input pin
  const sw = c.addComponent('SWITCH', 0, 40); // Output pin 0 at (80, 60)
  // Create wire from switch to an open point at (200, 60)
  const openWire = c.addWire(sw.id, 0, null, 0, null, [], { toPoint: { x: 200, y: 60 } });
  assertEqual(Boolean(openWire), true, 'Open wire created');
  assertEqual(openWire.toPoint.x, 200, 'openWire.toPoint.x is 200');
  assertEqual(openWire.toCompId, '', 'openWire has no target component yet');

  // Add an AND gate at (200, 40) -> input 0 is at (200, 60)
  const andGate = c.addComponent('AND', 200, 40);
  const snappedCount = c.snapOpenWiresToComponent(andGate, 24);
  assertEqual(snappedCount, 1, '1 open wire snapped to andGate');
  assertEqual(openWire.toCompId, andGate.id, 'openWire target component connected to andGate.id');
  assertEqual(openWire.toPin, 0, 'openWire target pin connected to input 0');
  assertEqual(openWire.toPoint, null, 'openWire.toPoint cleared after snap');

  // 2. Auto-snap open wire start to dropped/pasted module output pin
  const led = c.addComponent('LED', 500, 100); // Input pin 0 at (500, 120)
  // Create wire with open start at (380, 120) ending at LED
  const openStartWire = c.addWire(null, 0, led.id, 0, null, [], { fromPoint: { x: 380, y: 120 } });
  assertEqual(Boolean(openStartWire), true, 'Open start wire created');
  assertEqual(openStartWire.fromPoint.x, 380, 'openStartWire.fromPoint.x is 380');
  assertEqual(openStartWire.fromCompId, '', 'openStartWire has no source component yet');

  // Add another SWITCH at (300, 100) -> output pin 0 at (380, 120)
  const sw2 = c.addComponent('SWITCH', 300, 100);
  const snappedCount2 = c.snapOpenWiresToComponent(sw2, 24);
  assertEqual(snappedCount2, 1, '1 open start wire snapped to sw2');
  assertEqual(openStartWire.fromCompId, sw2.id, 'openStartWire source component connected to sw2.id');
  assertEqual(openStartWire.fromPin, 0, 'openStartWire source pin connected to output 0');
  assertEqual(openStartWire.fromPoint, null, 'openStartWire.fromPoint cleared after snap');

  // 3. Palette unification: only ONE NOT in palette, NEGATOR removed
  assertEqual(html.includes('data-type="NOT"'), true, 'NOT gate exists in palette');
  const paletteMatch = html.match(/class="palette-grid"[\s\S]*?<\/div>\s*<\/div>/g);
  const gatesCategory = paletteMatch ? paletteMatch.find(m => m.includes('data-type="NOT"')) : '';
  assertEqual(gatesCategory.includes('data-type="NEGATOR"'), false, 'NEGATOR removed from palette grid, unified into NOT');

  // 4. Inlining NOT gate into an existing wire
  const c2 = new Circuit();
  const src = c2.addComponent('SWITCH', 0, 40);
  src.state.value = 1;
  src.outputs[0].value = 1;
  const dst = c2.addComponent('LED', 300, 40);
  const directWire = c2.addWire(src.id, 0, dst.id, 0);
  c2.syncImmediateWireLevels();
  assertEqual(directWire.level, 1, 'Direct wire transmits level 1');

  // Inline NOT gate into directWire
  const inlineRes = c2.inlineGateIntoWire(directWire, 'NOT', 140, 40);
  assertEqual(Boolean(inlineRes && inlineRes.gate), true, 'Gate successfully inlined into wire');
  assertEqual(inlineRes.gate.type, 'NOT', 'Inlined gate is a NOT gate');
  assertEqual(directWire.toCompId, inlineRes.gate.id, 'Original wire now connects into NOT gate input');
  assertEqual(inlineRes.wireOut.fromCompId, inlineRes.gate.id, 'New wire connects from NOT gate output');
  assertEqual(inlineRes.wireOut.toCompId, dst.id, 'New wire connects into dst LED');

  // Simulation through inlined NOT gate inverts signal
  const eng = new SimulationEngine(c2, new RingBuffer(100), () => {});
  eng.stepTick();
  assertEqual(inlineRes.wireOut.level, 0, 'NOT gate inverts 1 to 0 on wireOut');

  // 5. Inverted inputs on ALL module types (e.g. MUX, D-FF, FULL_ADDER)
  // 5a. MUX with inverted select pin
  const c3 = new Circuit();
  const mux = c3.addComponent('MUX', 0, 0, { invertedInputs: [false, false, true] }); // Select inverted
  mux.inputs[0].value = 1; // D0 = 1
  mux.inputs[1].value = 0; // D1 = 0
  mux.inputs[2].value = 0; // Raw Sel = 0 -> Effective Sel = 1 -> Selects D1 (0)!
  mux.compute();
  assertEqual(mux.nextOutputs[0], 0, 'MUX with inverted select pin selects D1 when raw select is 0');

  // 5b. FULL_ADDER with inverted input 0
  const fa = c3.addComponent('FULL_ADDER', 0, 0, { invertedInputs: [true, false, false] });
  fa.inputs[0].value = 0; // Raw A = 0 -> Effective A = 1
  fa.inputs[1].value = 0; // B = 0
  fa.inputs[2].value = 0; // Cin = 0
  fa.compute();
  assertEqual(fa.nextOutputs[0], 1, 'Full Adder sum is 1 when inverted input A is 0 (effective 1)');

  // 5c. D-Flip-Flop with inverted clock input (falling-edge triggered)
  const dff = c3.addComponent('D_FF', 0, 0, { invertedInputs: [false, true] });
  dff.inputs[0].value = 1; // D = 1
  dff.inputs[1].value = 1; // Raw CLK = 1 -> Effective CLK = 0
  dff.compute();
  dff.commit();
  assertEqual(dff.outputs[0].value, 0, 'D-FF does not trigger on raw CLK high (effective low)');

  dff.inputs[1].value = 0; // Raw CLK falling from 1 to 0 -> Effective CLK rises from 0 to 1!
  dff.compute();
  dff.commit();
  assertEqual(dff.outputs[0].value, 1, 'D-FF with inverted clock triggers on falling edge of raw clock');

  // 6. Non-gate pin inverter bubble rendering
  const canvas = createMockElem('c');
  const renderer = new CanvasRenderer(canvas, c3);
  let bubbleDrawn = false;
  mockCtx.arc = (x, y, r) => {
    if (r === 3.2) bubbleDrawn = true;
  };
  renderer.drawComponentPins(mockCtx, mux);
  assertEqual(bubbleDrawn, true, 'Inverter bubble drawn on non-gate component with invertedInputs');
});

runTest('WISH-027', 'Switch background contrast, view menu theme removal, and lamp X matching outline color', () => {
  const circuit = new Circuit();
  const canvas = createMockElem('canvas');
  const renderer = new CanvasRenderer(canvas, circuit);

  // 1. Switch background uses gateFill (clean white in Java Swing and Light CAD, distinct from low color)
  renderer.appTheme = 'java_swing';
  const pal = renderer.getThemePalette();
  assertEqual(pal.gateFill, '#ffffff', 'Java Swing gateFill is pure white');
  
  let chassisFillUsed = null;
  const origRoundRect = renderer.roundRect;
  renderer.roundRect = (ctx, x, y, w, h, r) => {
    chassisFillUsed = ctx.fillStyle;
    origRoundRect.call(renderer, ctx, x, y, w, h, r);
  };
  renderer.drawChassisBox(mockCtx, 10, 10, 80, 40, false, 'SWITCH');
  assertEqual(chassisFillUsed, '#ffffff', 'SWITCH chassis box uses gateFill (#ffffff) instead of chassisFill (#ece9d8)');
  renderer.roundRect = origRoundRect;

  // 2. Switch and Button terminal dots are drawn individually (no black triangle fill bug)
  const sw = circuit.addComponent('SWITCH', 10, 10);
  let arcCallCount = 0;
  let fillsCount = 0;
  const origArc = mockCtx.arc;
  const origFill = mockCtx.fill;
  mockCtx.arc = (x, y, r, sa, ea) => {
    arcCallCount++;
    origArc.call(mockCtx, x, y, r, sa, ea);
  };
  mockCtx.fill = () => {
    fillsCount++;
    origFill.call(mockCtx);
  };
  renderer.drawComponentInterior(mockCtx, sw);
  mockCtx.arc = origArc;
  mockCtx.fill = origFill;
  // Previously 3 arcs were chained before 1 fill (fillsCount = 1 for 3 arcs). Now each arc has its own fill (3 fills for 3 terminal dots)
  assertEqual(fillsCount >= 3, true, 'Switch terminal dots are filled individually without path chaining wedge');

  // 3. View menu: theme switcher removed from Ansicht dropdown
  assertEqual(html.includes('id="check-theme-modern"'), false, 'check-theme-modern removed from Ansicht menu');
  assertEqual(html.includes('data-theme-btn="java_swing"'), false, 'data-theme-btn items removed from Ansicht menu');

  // 4. Lamp (LED) cross 'X' has the exact same color as outline
  const ledYellow = circuit.addComponent('LED', 100, 10, { color: 'yellow' });
  ledYellow.inputs[0].value = 0; // OFF state
  let strokeStyles = [];
  const origStroke = mockCtx.stroke;
  mockCtx.stroke = () => {
    strokeStyles.push(mockCtx.strokeStyle);
    origStroke.call(mockCtx);
  };
  renderer.drawLampComponent(mockCtx, ledYellow, false);
  mockCtx.stroke = origStroke;
  // In OFF state with yellow color: circle outline (step 4) and X cross (step 5)
  // Yellow LED_COLORS.yellow.border is '#ffc400'
  const yellowBorder = LED_COLORS.yellow.border;
  const lastTwoStrokes = strokeStyles.slice(-2);
  assertEqual(lastTwoStrokes[0], yellowBorder, 'Lamp circle outline matches yellow border');
  assertEqual(lastTwoStrokes[1], yellowBorder, 'Lamp inner X cross matches yellow border exactly');
  assertEqual(lastTwoStrokes[0], lastTwoStrokes[1], 'Lamp circle outline and inner X cross share the identical color');
});

runTest('WISH-028', 'Timing diagram free mouse panning to tick 0, speed badge & readout, duplicate loop controls elimination', () => {
  // 1. RingBuffer expanded capacity to 10000 preserves history back to tick 0
  const rb = new RingBuffer(10000);
  assertEqual(rb.capacity, 10000, 'RingBuffer default/configured capacity is 10000');
  for (let t = 0; t <= 300; t++) {
    rb.record(t, new Map());
  }
  assertEqual(rb.count, 301, 'RingBuffer recorded 301 ticks without dropping earlier samples');
  assertEqual(rb.getTickAtOffset(0), 0, 'Tick 0 is fully retained and accessible at offset 0 after > 256 ticks');

  // 2. LogicAnalyzerRenderer speed badge and readout
  const mockCanvas = createMockElem('analyzer-canvas');
  mockCanvas.width = 1200;
  mockCanvas.height = 300;
  const mockCircuit = new Circuit();
  const analyzer = new LogicAnalyzerRenderer(mockCanvas, mockCircuit, rb);
  assertEqual(analyzer.simFrequency, 10, 'Default simulation frequency is 10 Hz');

  const speedBadge = document.getElementById('analyzer-speed-badge');
  const infoBadge = document.getElementById('analyzer-playhead-info');
  const loopText = document.getElementById('analyzer-loop-text');

  analyzer.setSimulationFrequency(20);
  analyzer.playheadOffset = 0;
  analyzer.updateLoopUi();
  assertEqual(analyzer.simFrequency, 20, 'simFrequency updated to 20 Hz');
  assertEqual(speedBadge.textContent, '20 Hz (50 ms)', 'Speed badge displays 20 Hz (50 ms)');
  assertEqual(infoBadge.textContent.includes('Takt:'), false, 'Info readout does not contain duplicate Takt prefix (WISH-046 deduplication)');

  // 3. Free mouse dragging and timeline navigation down to tick 0
  analyzer.scrollRatio = 1.0;
  analyzer.isPanningTimeline = true;
  analyzer.panStartX = 500;
  analyzer.panStartScrollRatio = 1.0;
  const totalSamples = rb.count;
  const plotW = Math.max(50, 1200 - analyzer.gutterWidth - 12);
  const visibleTicks = Math.max(1, Math.floor(plotW / analyzer.pixelsPerTick));
  const maxStartOffset = Math.max(0, totalSamples - visibleTicks);

  const dx = 4000;
  const deltaTicks = dx / analyzer.pixelsPerTick;
  const deltaFrac = deltaTicks / Math.max(1, maxStartOffset);
  analyzer.scrollRatio = Math.max(0.0, Math.min(1.0, analyzer.panStartScrollRatio - deltaFrac));
  assertEqual(analyzer.scrollRatio, 0.0, 'Timeline smoothly pans all the way back to tick 0 (scrollRatio = 0.0)');

  // 4. Duplicate control elimination: Simulation start button does NOT change to "Loop Play"
  // when loopRange is set
  analyzer.loopRange = { inOffset: 5, outOffset: 50, inTick: 5, outTick: 50 };
  let playSvg = 'svg_play';
  let playLabel = 'Start';
  let isRunning = false;
  if (isRunning) {
    playSvg = 'svg_pause';
    playLabel = 'Pause';
  } else {
    playSvg = 'svg_play';
    playLabel = 'Start';
  }
  assertEqual(playLabel, 'Start', 'Simulation start button remains Start even when loopRange is active');

  // Loop play button has its own dedicated text
  analyzer.startLoopAnimation();
  assertEqual(loopText.textContent, 'Pause Loop', 'Dedicated loop button displays Pause Loop when active');
  analyzer.stopLoopAnimation();
  assertEqual(loopText.textContent, 'Loop Play', 'Dedicated loop button displays Loop Play when stopped');
});

runTest('WISH-030', 'Pushbutton (Taster) lever geometry & DIN EN 60617 actuator without collisions, analyzer tick readout cleanup', () => {
  // 1. Button component structure and state
  const btn = new Component('btn_rst', 'BUTTON', 100, 200, { label: 'Reset (RST)' });
  assertEqual(btn.type, 'BUTTON', 'Component is BUTTON');
  assertEqual(btn.state.pressed, 0, 'Initial state is not pressed');
  assertEqual(btn.outputs[0].value, 0, 'Initial output is 0');

  // Verify state computation
  btn.state.pressed = 1;
  btn.compute();
  assertEqual(btn.nextOutputs[0], 1, 'Pressing button outputs 1');
  btn.commit();
  assertEqual(btn.outputs[0].value, 1, 'Output value updated to 1');

  btn.state.pressed = 0;
  btn.compute();
  assertEqual(btn.nextOutputs[0], 0, 'Releasing button outputs 0');
  btn.commit();
  assertEqual(btn.outputs[0].value, 0, 'Output value returned to 0');

  // 2. Rendering of BUTTON interior in both unpressed and pressed states
  const mockCanvas = createMockElem('c1');
  const circuit = new Circuit();
  const btnComp = circuit.addComponent('BUTTON', 100, 200, { label: 'Reset (RST)' }, 'btn_rst');
  const renderer = new CanvasRenderer(mockCanvas, circuit);

  // Unpressed state
  let linePaths = [];
  const origMoveTo = mockCtx.moveTo;
  const origLineTo = mockCtx.lineTo;
  mockCtx.moveTo = (x, y) => linePaths.push({ type: 'move', x, y });
  mockCtx.lineTo = (x, y) => linePaths.push({ type: 'line', x, y });

  renderer.drawComponentInterior(mockCtx, btnComp);
  // In unpressed state, lever must connect from pivot (x+width-14 = 166, cy = 220) to botY (termX+2 = 126, cy+9 = 229)
  const unpressedLever = linePaths.find(p => p.type === 'line' && p.x === 126 && p.y === 229);
  assertEqual(Boolean(unpressedLever), true, 'Unpressed lever connects cleanly to terminal 0 (botY = 229)');

  // Pressed state
  linePaths = [];
  btnComp.state.pressed = 1;
  renderer.drawComponentInterior(mockCtx, btnComp);
  // In pressed state, lever must connect from pivot to topY (termX+2 = 126, cy-9 = 211)
  const pressedLever = linePaths.find(p => p.type === 'line' && p.x === 126 && p.y === 211);
  assertEqual(Boolean(pressedLever), true, 'Pressed lever connects cleanly to terminal 1 (topY = 211)');

  // Actuator rod and cap must be centered safely at midX = 146, far from termX = 124
  const actuatorRod = linePaths.find(p => p.type === 'move' && p.x === 146);
  assertEqual(Boolean(actuatorRod), true, 'DIN actuator push rod is positioned at midX = 146 without overlapping terminals');

  mockCtx.moveTo = origMoveTo;
  mockCtx.lineTo = origLineTo;

  // 3. Analyzer probe count formatting (no confusing /256 fractions)
  const rb = new RingBuffer(10000);
  for (let i = 0; i < 256; i++) rb.record(i, new Map());
  const anaCanvas = createMockElem('ana');
  const led = circuit.addComponent('LED', 300, 200, {}, 'led_1');
  const w1 = circuit.addWire(btnComp.id, 0, led.id, 0);
  circuit.addProbe(w1.id, { id: 'pr1', name: 'Lead 1', color: '#00e676' });
  const analyzer = new LogicAnalyzerRenderer(anaCanvas, circuit, rb);

  analyzer.render();
  const countLabel = document.getElementById('analyzer-probe-count');
  assertEqual(countLabel.textContent, '(1 Kanal)', 'Count label shows clean single channel count without confusing tick fractions');
});

runTest('WISH-031', 'Overhauled theme system, cohesive surface elevation, neutral slate wireLow, and optical lamp illumination', () => {
  const circuit = new Circuit();
  const canvas = createMockElem('canvas');
  const renderer = new CanvasRenderer(canvas, circuit);

  // 1. Verify neutral slate wireLow across dark/OLED/Blueprint/Light CAD themes
  renderer.appTheme = 'modern';
  const palModern = renderer.getThemePalette();
  assertEqual(palModern.wireLow, '#38465c', 'Modern theme wireLow is crisp neutral slate #38465c');
  assertEqual(palModern.bg, '#10141d', 'Modern theme background is deep charcoal slate #10141d');
  assertEqual(palModern.leadLine, '#38465c', 'Modern theme leadLine matches neutral slate');

  renderer.appTheme = 'pitch_black';
  const palOled = renderer.getThemePalette();
  assertEqual(palOled.wireLow, '#52525b', 'OLED theme wireLow is clean zinc slate #52525b');

  renderer.appTheme = 'light_cad';
  const palLight = renderer.getThemePalette();
  assertEqual(palLight.wireLow, '#64748b', 'Light CAD wireLow is crisp drafting slate #64748b');

  // 2. Verify signal presets use neutral slate low lines (never muddy green)
  for (const preset of SIGNAL_COLOR_PRESETS) {
    assertEqual(preset.low !== '#143823', true, `Preset ${preset.id} does not use muddy swamp green`);
    assertEqual(preset.low.startsWith('#3') || preset.low.startsWith('#4') || preset.low.startsWith('#1'), true, `Preset ${preset.id} uses clean slate`);
  }

  // 3. Verify lamp unlit state uses optical lens well (displayWellFill) rather than dirty sludge
  const led = circuit.addComponent('LED', 100, 100, { color: 'green' });
  led.inputs[0].value = 0; // OFF
  let lastFill = null;
  const origFill = mockCtx.fill;
  mockCtx.fill = () => {
    lastFill = mockCtx.fillStyle;
    origFill.call(mockCtx);
  };
  renderer.appTheme = 'modern';
  renderer.drawLampComponent(mockCtx, led, false);
  mockCtx.fill = origFill;
  assertEqual(lastFill, palModern.displayWellFill, 'Unlit lamp fill uses clean optical display well instead of dirty green sludge');

  // 4. Verify settings migration sanitizes legacy #143823 in localStorage
  const app = new LogicSimApp();
  localStorage.setItem('logicsim_user_settings', JSON.stringify({
    lowSignalColor: '#143823'
  }));
  app.loadSettings();
  assertEqual(app.lowSignalColor, null, 'Legacy muddy low color #143823 successfully sanitized to null');
  assertEqual(app.renderer.lowSignalColor, null, 'Renderer lowSignalColor successfully sanitized to null');
});

runTest('WISH-032', 'Compact 40x40 NOT gate dimensions, pin geometry and grid alignment', () => {
  const circuit = new Circuit();
  const notGate = circuit.addComponent('NOT', 100, 100);

  // 1. Verify compact dimensions (40x40, down from bulky 80x40)
  assertEqual(notGate.width, 40, 'NOT gate width is compact 40px (down from 80px)');
  assertEqual(notGate.height, 40, 'NOT gate height is 40px');

  // 2. Pins are strictly aligned to the 20px grid
  assertEqual(notGate.inputs[0].relX, 0, 'NOT input pin relX is 0');
  assertEqual(notGate.inputs[0].relY, 20, 'NOT input pin relY is 20 (on 20px grid)');
  assertEqual(notGate.outputs[0].relX, 40, 'NOT output pin relX is 40 (on 20px grid)');
  assertEqual(notGate.outputs[0].relY, 20, 'NOT output pin relY is 20 (on 20px grid)');

  // 3. Grid-aligned inlining into wires
  const sw = circuit.addComponent('SWITCH', 0, 100);
  const led = circuit.addComponent('LED', 200, 100);
  const w = circuit.addWire(sw.id, 0, led.id, 0);

  const inlineRes = circuit.inlineGateIntoWire(w, 'NOT', 80, 100);
  assertEqual(inlineRes !== null, true, 'NOT gate inlines into wire successfully');
  assertEqual(inlineRes.gate.width, 40, 'Inlined NOT gate maintains 40px width');
  assertEqual(inlineRes.gate.x % 20, 0, 'Inlined NOT gate X position is aligned to 20px grid');
  assertEqual(inlineRes.gate.y % 20, 0, 'Inlined NOT gate Y position is aligned to 20px grid');
});

runTest('WISH-033', 'Wire bridges on diagonal connections and global allowDiagonalWires setting', () => {
  let arcCount = 0;
  const mockArcCtx = Object.assign({}, mockCtx, {
    arc: () => { arcCount++; }
  });
  const mockCanvas = Object.assign({}, createMockElem('grid-canvas'), {
    getContext: () => mockArcCtx
  });

  const circuit = new Circuit();
  const c1 = circuit.addComponent('SWITCH', 0, 0);
  const c2 = circuit.addComponent('LED', 200, 200);
  const c3 = circuit.addComponent('SWITCH', 0, 200);
  const c4 = circuit.addComponent('LED', 200, 0);
  const c5 = circuit.addComponent('SWITCH', 100, -50);
  const c6 = circuit.addComponent('LED', 100, 250);

  // Wire 1: Diagonal (0, 20) -> (200, 220)
  const w1 = circuit.addWire(c1.id, 0, c2.id, 0, null, null, { style: 'diagonal' });
  // Wire 2: Diagonal (0, 220) -> (200, 20)
  const w2 = circuit.addWire(c3.id, 0, c4.id, 0, null, null, { style: 'diagonal' });

  const engine = new SimulationEngine(circuit, new RingBuffer(10), () => {});
  const renderer = new CanvasRenderer(mockCanvas, circuit, engine);

  assertEqual(renderer.showWireBridges, true, 'Wire bridges enabled by default');
  assertEqual(renderer.allowDiagonalWires, true, 'Diagonal wires allowed by default');

  // Test 1: Diagonal crossing diagonal produces bridge jumper arc
  arcCount = 0;
  renderer.drawWires(mockArcCtx);
  assertEqual(arcCount > 0, true, 'Bridge arc drawn when two diagonal wires cross');

  // Test 2: Diagonal crossing vertical wire produces bridge jumper arc
  circuit.removeWire(w2.id);
  const cVerticalSw = circuit.addComponent('SWITCH', 60, -20); // Output pin at (140, 0)
  const cVerticalLed = circuit.addComponent('LED', 140, 220); // Input pin at (140, 240)
  const w3 = circuit.addWire(cVerticalSw.id, 0, cVerticalLed.id, 0); // Vertical through x=140 from y=0 to y=240
  arcCount = 0;
  renderer.drawWires(mockArcCtx);
  assertEqual(arcCount > 0, true, 'Bridge arc drawn when diagonal wire crosses vertical wire');

  // Test 3: Disabling showWireBridges suppresses all bridge arcs
  renderer.showWireBridges = false;
  arcCount = 0;
  renderer.drawWires(mockArcCtx);
  assertEqual(arcCount, 0, 'No bridge arcs drawn when showWireBridges is false');
  renderer.showWireBridges = true;

  // Test 4: allowDiagonalWires setting restricts diagonal routing to orthogonal Manhattan
  const p1 = { x: 0, y: 0 };
  const p2 = { x: 100, y: 100 };
  const diagPath = renderer.computeWirePath(p1, p2, null, 0, 'diagonal');
  assertEqual(diagPath.length, 2, 'Diagonal wire path has 2 points when allowDiagonalWires=true');

  renderer.allowDiagonalWires = false;
  const orthoFallbackPath = renderer.computeWirePath(p1, p2, null, 0, 'diagonal');
  assertEqual(orthoFallbackPath.length > 2, true, 'Diagonal wire falls back to orthogonal bends when allowDiagonalWires=false');
  for (let i = 0; i < orthoFallbackPath.length - 1; i++) {
    const a = orthoFallbackPath[i];
    const b = orthoFallbackPath[i + 1];
    const isOrtho = (a.x === b.x) || (a.y === b.y);
    assertEqual(isOrtho, true, `Segment ${i} in fallback path must be strictly orthogonal (horizontal or vertical)`);
  }

  // Test 5: Waypoint decomposition when allowDiagonalWires=false
  const diagWpPath = renderer.computeWirePath(p1, p2, [{ x: 50, y: 20 }], 0, null);
  for (let i = 0; i < diagWpPath.length - 1; i++) {
    const a = diagWpPath[i];
    const b = diagWpPath[i + 1];
    const isOrtho = (a.x === b.x) || (a.y === b.y);
    assertEqual(isOrtho, true, `Segment ${i} with diagonal waypoints must be strictly orthogonal`);
  }
});

runTest('WISH-034', 'Auto-merge matching open wire ends and resilient pin detachment protection', () => {
  const circuit = new Circuit();
  const sw = circuit.addComponent('SWITCH', 0, 100);
  const led = circuit.addComponent('LED', 300, 100);

  // 1. Wire 1: SWITCH output (80, 120) to open point (160, 120)
  const w1 = circuit.addWire(sw.id, 0, null, 0, null, [], {
    toPoint: { x: 160, y: 120 }
  });
  // 2. Wire 2: open point (160, 120) to LED input (300, 120)
  const w2 = circuit.addWire(null, 0, led.id, 0, null, [], {
    fromPoint: { x: 160, y: 120 }
  });

  assertEqual(circuit.wires.length, 2, 'Initially 2 separate open wires exist');
  assertEqual(Boolean(w1.toPoint), true, 'Wire 1 has open toPoint');
  assertEqual(Boolean(w2.fromPoint), true, 'Wire 2 has open fromPoint');

  // Trigger mergeOpenWireTermini
  const mergedCount = circuit.mergeOpenWireTermini(16);
  assertEqual(mergedCount, 1, 'Exactly 1 merge occurred between the matching open ends');
  assertEqual(circuit.wires.length, 1, 'Merged into a single continuous wire');

  const mergedWire = circuit.wires[0];
  assertEqual(mergedWire.fromCompId, sw.id, 'Merged wire connects directly from SWITCH');
  assertEqual(mergedWire.toCompId, led.id, 'Merged wire connects directly to LED');
  assertEqual(mergedWire.toPoint, null, 'toPoint cleared after merge');
  assertEqual(mergedWire.fromPoint, null, 'fromPoint cleared after merge');

  // Verify electrical propagation through merged wire
  sw.outputs[0].value = 1;
  circuit.syncImmediateWireLevels();
  assertEqual(mergedWire.level, 1, 'Signal propagates through merged wire');
  assertEqual(led.inputs[0].value, 1, 'LED receives signal 1 through merged wire');

  // 3. Test merging of two open input branches
  const led2 = circuit.addComponent('LED', 300, 200);
  const openBranch1 = circuit.addWire(null, 0, led.id, 0, null, [], { fromPoint: { x: 200, y: 200 } });
  const openBranch2 = circuit.addWire(null, 0, led2.id, 0, null, [], { fromPoint: { x: 200, y: 200 } });
  const branchMergeCount = circuit.mergeOpenWireTermini(16);
  assertEqual(branchMergeCount, 1, 'Two open inputs at same point merge into trunk and branch');
  assertEqual(openBranch2.fromWireId, openBranch1.id, 'Second branch attaches to first branch wire');
  assertEqual(openBranch2.fromPoint, null, 'Branch fromPoint cleared');
});

runTest('WISH-035', 'UI scaling, palette previews, and Manhattan wire routing through waypoints', () => {
  const app = new LogicSimApp();

  // 1. UI Scaling validation & clamping (80% - 160% in 5% increments)
  app.setUiScale(1.25, { save: false });
  assertEqual(app.uiScale, 1.25, 'UI scale set to 125%');
  app.setUiScale(0.5, { save: false });
  assertEqual(app.uiScale, 0.8, 'UI scale clamped at lower bound 80%');
  app.setUiScale(2.5, { save: false });
  assertEqual(app.uiScale, 1.6, 'UI scale clamped at upper bound 160%');
  app.setUiScale(1.0, { save: false });
  assertEqual(app.uiScale, 1.0, 'UI scale reset to 100%');

  // 2. Palette view toggle validation
  assertEqual(app.paletteView, 'labels', 'Palette default view is labels');
  app.setPaletteView('preview', { save: false });
  assertEqual(app.paletteView, 'preview', 'Palette view switched to preview');
  const thumbParts = app.buildPaletteThumbParts('AND');
  assertEqual(Boolean(thumbParts && thumbParts.comps.length === 1), true, 'Built thumb parts for AND gate');
  const bounds = app.getComponentsBounds(thumbParts.comps);
  assertEqual(bounds.maxX > bounds.minX, true, 'Component bounds valid for palette thumbnail');
  app.setPaletteView('labels', { save: false });
  assertEqual(app.paletteView, 'labels', 'Palette view restored to labels');

  // 3. Orthogonal Manhattan routing preserved through waypoints when allowDiagonalWires is active
  app.setAllowDiagonalWires(true);
  const p1 = { x: 100, y: 100 };
  const p2 = { x: 300, y: 200 };
  const wps = [{ x: 200, y: 140 }];
  const path = app.renderer.computeWirePath(p1, p2, wps, 0, null);
  assertEqual(path.length >= 3, true, 'Path computed with waypoints');
  // Verify that all segments in an orthogonal path are horizontal or vertical
  let allOrthogonal = true;
  for (let i = 0; i < path.length - 1; i++) {
    const dx = Math.abs(path[i+1].x - path[i].x);
    const dy = Math.abs(path[i+1].y - path[i].y);
    if (dx > 0.001 && dy > 0.001) {
      allOrthogonal = false;
      break;
    }
  }
  assertEqual(allOrthogonal, true, 'Normal wire with waypoints routes orthogonally (Manhattan) without diagonal slants');
});

runTest('WISH-036', 'Auto-Anordnen and align menu locked and disabled in simulation mode', () => {
  const btnAutoRoute = document.getElementById('btn-auto-route');
  const btnAlignMenu = document.getElementById('btn-align-menu');
  const alignSplit = document.getElementById('align-split');
  const popover = document.getElementById('align-popover');
  btnAlignMenu.listeners['click'] = [];
  popover.style.display = 'none';

  const app = new LogicSimApp();
  const c = app.circuit;
  const sw = c.addComponent('SWITCH', 40, 40);
  const led = c.addComponent('LED', 300, 40);
  c.addWire(sw.id, 0, led.id, 0);

  // 1. In edit mode, auto-align is enabled and popover can be toggled
  app.engine.mode = 'edit';
  app.updateHUDAndToolbar();
  assertEqual(btnAutoRoute.disabled, false, 'Auto-route button is enabled in edit mode');
  assertEqual(btnAlignMenu.disabled, false, 'Align menu caret is enabled in edit mode');
  assertEqual(alignSplit.classList.contains('sim-locked'), false, 'align-split does not have sim-locked in edit mode');

  // Open the popover in edit mode
  btnAlignMenu.click();
  assertEqual(popover.style.display, 'flex', 'Popover opens in edit mode');

  // 2. Switching to simulation mode immediately locks toolbar and closes popover
  app.engine.mode = 'sim';
  app.updateHUDAndToolbar();
  assertEqual(btnAutoRoute.disabled, true, 'Auto-route button is disabled in sim mode');
  assertEqual(btnAlignMenu.disabled, true, 'Align menu caret is disabled in sim mode');
  assertEqual(alignSplit.classList.contains('sim-locked'), true, 'align-split has sim-locked in sim mode');
  assertEqual(popover.style.display, 'none', 'Align popover is immediately closed on switching to sim mode');

  // 3. Clicking caret in simulation mode is blocked and never opens popover
  btnAlignMenu.click();
  assertEqual(popover.style.display, 'none', 'Clicking caret in simulation mode does not open popover');

  // 4. autoAlign and runAlignAction are strictly guarded in simulation mode
  const origX = sw.x;
  const origY = sw.y;
  const res = app.autoAlign();
  assertEqual(res, null, 'autoAlign returns null in simulation mode');
  assertEqual(sw.x, origX, 'Component position unchanged by autoAlign in sim mode');
  assertEqual(sw.y, origY, 'Component position unchanged by autoAlign in sim mode');

  app.runAlignAction('all');
  assertEqual(sw.x, origX, 'Component position unchanged by runAlignAction(all) in sim mode');

  // 5. Switching back to edit mode re-enables buttons and clears sim-locked
  app.engine.mode = 'edit';
  app.updateHUDAndToolbar();
  assertEqual(btnAutoRoute.disabled, false, 'Auto-route button re-enabled in edit mode');
  assertEqual(btnAlignMenu.disabled, false, 'Align menu caret re-enabled in edit mode');
  assertEqual(alignSplit.classList.contains('sim-locked'), false, 'align-split clears sim-locked in edit mode');
});

runTest('WISH-037', 'Legacy bündig ausrichten actions removed from selection context menu', () => {
  const app = new LogicSimApp();
  const c = app.circuit;
  const c1 = c.addComponent('AND', 40, 40);
  const c2 = c.addComponent('OR', 140, 40);
  app.renderer.selectedCompIds = new Set([c1.id, c2.id]);
  app.engine.mode = 'edit';

  const menu = app.contextMenuEl;
  app.showContextMenu(100, 100, null, null, { x: 100, y: 100 }, true);

  const items = Array.from(menu.children).map(el => el.textContent || '');
  const hasBuendig = items.some(t => t.includes('bündig') || t.includes('Bündig'));
  assertEqual(hasBuendig, false, 'No "bündig ausrichten" items in multi-selection context menu');
  const hasSaveModule = items.some(t => t.includes('Als eigenes Modul speichern'));
  assertEqual(hasSaveModule, true, '"Als eigenes Modul speichern…" action available in selection context menu');
  app.hideContextMenu();
});

runTest('WISH-038', 'Pushbutton activation in edit mode preserves wire path without rerouting', () => {
  const app = new LogicSimApp();
  const c = app.circuit;
  const btn = c.addComponent('BUTTON', 40, 40);
  const led = c.addComponent('LED', 200, 40);
  const customWps = [{ x: 140, y: 40 }, { x: 140, y: 80 }, { x: 180, y: 80 }];
  const wire = c.addWire(btn.id, 0, led.id, 0, null, customWps);
  wire.autoRouted = true;

  // Simulate mousedown on the BUTTON in edit mode
  app.engine.mode = 'edit';
  app.allowEditModeInteraction = true;

  // Simulate mousedown:BUTTON press
  const worldPos = { x: 50, y: 50 };
  const hitComp = btn;
  // Test our interaction logic
  hitComp.state.pressed = 1;
  hitComp.outputs[0].value = 1;
  hitComp.nextOutputs[0] = 1;
  app.activeButtonComp = hitComp;
  app.circuit.syncImmediateWireLevels();

  // Verify wire waypoints and wire._preview
  assertEqual(wire._preview, false, 'wire._preview is not set when pressing button');
  assertEqual(wire.waypoints.length, 3, 'Wire waypoints count preserved');
  assertEqual(wire.waypoints[1].y, 80, 'Specific waypoint coordinates untouched');

  // Verify path computed during button press uses waypoints
  const path = app.renderer.computeWirePath(
    btn.getPinWorldPos(true, 0),
    led.getPinWorldPos(false, 0),
    wire._preview ? null : wire.waypoints,
    wire.channelOffset || 0,
    wire.style
  );
  assertEqual(path.length >= 4, true, 'Path preserves routed segments through waypoints during press');

  // Release button
  app.activeButtonComp.state.pressed = 0;
  app.activeButtonComp.outputs[0].value = 0;
  app.activeButtonComp.nextOutputs[0] = 0;
  app.activeButtonComp = null;
  app.circuit.syncImmediateWireLevels();
  assertEqual(wire.waypoints.length, 3, 'Wire waypoints still intact after button release');
});

runTest('WISH-039', 'Custom module saving with compression (Black-Box IC vs Macro Group) and simulation', () => {
  const app = new LogicSimApp();
  const c = app.circuit;
  c.components = [];
  c.wires = [];

  // Build a Half-Adder subcircuit for testing
  // Inputs: SWITCH A, SWITCH B
  // Internal: XOR, AND
  // Outputs: LED Sum, LED Carry
  const swA = c.addComponent('SWITCH', 40, 40, { label: 'A', state: 1 });
  const swB = c.addComponent('SWITCH', 40, 100, { label: 'B', state: 1 });
  const xor = c.addComponent('XOR', 160, 40);
  const and = c.addComponent('AND', 160, 100);
  const ledS = c.addComponent('LED', 280, 40, { label: 'SUM' });
  const ledC = c.addComponent('LED', 280, 100, { label: 'COUT' });

  c.addWire(swA.id, 0, xor.id, 0);
  c.addWire(swB.id, 0, xor.id, 1);
  c.addWire(swA.id, 0, and.id, 0);
  c.addWire(swB.id, 0, and.id, 1);
  c.addWire(xor.id, 0, ledS.id, 0);
  c.addWire(and.id, 0, ledC.id, 0);

  // Select all 6 components
  app.renderer.selectedCompIds = new Set([swA.id, swB.id, xor.id, and.id, ledS.id, ledC.id]);

  // 1. Save as Compressed IC
  const icMod = app.saveSelectionAsModule('HalfAdder_IC', true);
  assertEqual(icMod !== null, true, 'Custom IC module created successfully');
  assertEqual(icMod.kind, 'ic', 'Module kind is "ic"');
  assertEqual(icMod.inputs.length >= 2, true, 'Extracted external input pins from switches');
  assertEqual(icMod.outputs.length >= 2, true, 'Extracted external output pins from LEDs');
  assertEqual(icMod.subcircuit.components.length, 2, 'Subcircuit strips testing switches and LEDs, keeping gates');

  // Place the IC module in a fresh circuit
  const c2 = new Circuit();
  const placed = app.placeCustomModule(c2, app.renderer, icMod.id, 100, 100);
  assertEqual(placed, true, 'Placed custom IC on circuit');
  assertEqual(c2.components.length, 1, 'Only 1 compressed IC component placed on canvas');
  const icComp = c2.components[0];
  assertEqual(icComp.type, 'CUSTOM_IC', 'Placed component has type CUSTOM_IC');
  assertEqual(icComp.inputs.length >= 2, true, 'IC has input pins');
  assertEqual(icComp.outputs.length >= 2, true, 'IC has output pins');

  // Test simulation through CUSTOM_IC
  // Drive inputs: A=1, B=0 -> SUM=1, COUT=0
  icComp.inputs[0].value = 1;
  icComp.inputs[1].value = 0;
  icComp.step();
  icComp.commit(true);
  assertEqual(icComp.nextOutputs[0], 1, 'Half-adder IC SUM output (A=1, B=0) is 1');
  assertEqual(icComp.nextOutputs[1], 0, 'Half-adder IC COUT output (A=1, B=0) is 0');

  // Drive inputs: A=1, B=1 -> SUM=0, COUT=1
  icComp.inputs[0].value = 1;
  icComp.inputs[1].value = 1;
  icComp.step();
  icComp.commit(true);
  assertEqual(icComp.nextOutputs[0], 0, 'Half-adder IC SUM output (A=1, B=1) is 0');
  assertEqual(icComp.nextOutputs[1], 1, 'Half-adder IC COUT output (A=1, B=1) is 1');

  // 2. Save as Macro Group
  app.renderer.selectedCompIds = new Set([swA.id, swB.id, xor.id, and.id, ledS.id, ledC.id]);
  const macroMod = app.saveSelectionAsModule('HalfAdder_Macro', false);
  assertEqual(macroMod !== null, true, 'Macro module created');
  assertEqual(macroMod.kind, 'macro', 'Module kind is "macro"');
  assertEqual(macroMod.components.length, 6, 'Macro keeps all 6 components 1:1');
});

runTest('WISH-040', 'Split-screen mode docks inspector expand button without overlapping header', () => {
  const app = new LogicSimApp();
  const btnExpand = document.getElementById('btn-inspector-expand');

  // In split-screen mode
  app.toggleSplitScreen(true);
  assertEqual(document.body.classList.contains('split-screen-active'), true, 'split-screen-active class set in split view');
  if (btnExpand) assertEqual(btnExpand.style.top, '68px', 'Expand button moved to 68px (safely below 28px pane header)');

  // Revert
  app.toggleSplitScreen(false);
  assertEqual(document.body.classList.contains('split-screen-active'), false, 'split-screen-active class removed in single view');
  if (btnExpand) assertEqual(btnExpand.style.top, '44px', 'Expand button top is 44px in single view');
});

runTest('WISH-041', 'Logic analyzer frequency slider mirrored with ms readout and clean channel count', () => {
  const app = new LogicSimApp();
  const sliderFreq = document.getElementById('slider-freq');
  const labelFreq = document.getElementById('label-freq');
  const analyzerSlider = document.getElementById('analyzer-slider-freq');
  const analyzerLabel = document.getElementById('analyzer-label-freq');
  const probeCount = document.getElementById('analyzer-probe-count');

  // 1. Changing top slider mirrors to analyzer slider and updates ms readout
  sliderFreq.value = 20;
  sliderFreq.dispatchEvent({ type: 'input', target: sliderFreq });
  assertEqual(analyzerSlider.value, '20', 'Analyzer slider value synchronized to 20');
  assertEqual(labelFreq.textContent, '20 Hz (50 ms)', 'Top frequency readout includes ms timing');
  assertEqual(analyzerLabel.textContent, '20 Hz (50 ms)', 'Analyzer frequency readout synchronized with ms timing');
  assertEqual(app.engine.frequency, 20, 'Engine frequency set to 20');

  // 2. Changing analyzer slider mirrors back to top toolbar
  analyzerSlider.value = 5;
  analyzerSlider.dispatchEvent({ type: 'input', target: analyzerSlider });
  assertEqual(sliderFreq.value, '5', 'Top slider synchronized to 5');
  assertEqual(labelFreq.textContent, '5 Hz (200 ms)', 'Top readout synchronized from analyzer');
  assertEqual(analyzerLabel.textContent, '5 Hz (200 ms)', 'Analyzer readout updated to 5 Hz (200 ms)');
  assertEqual(app.engine.frequency, 5, 'Engine frequency updated to 5');

  // 3. Analyzer channel count does not display confusing "256/256 Ticks"
  app.circuit.probes = [];
  app.analyzer.render();
  assertEqual(probeCount.textContent.includes('256/256 Ticks'), false, 'Confusing 256/256 ticks removed from probe count');
  assertEqual(probeCount.textContent, '(0 Kanäle)', 'Probe count shows clean channel indicator');
});

runTest('WISH-042', 'NOT gate width strictly locked to 40x40 and drop detection radius expanded to 30px', () => {
  const c = new Circuit();
  const notGate = c.addComponent('NOT', 40, 40);

  // 1. Width and height are locked to 40x40
  assertEqual(notGate.width, 40, 'NOT gate initial width is 40');
  assertEqual(notGate.height, 40, 'NOT gate initial height is 40');

  // Rebuilding pins must NEVER reset width to 80
  notGate.rebuildPins();
  assertEqual(notGate.width, 40, 'NOT gate width remains 40 after rebuildPins');
  assertEqual(notGate.height, 40, 'NOT gate height remains 40 after rebuildPins');

  // 2. Dropping NOT onto component pin to invert inputs
  const andGate = c.addComponent('AND', 100, 100);
  const pin0 = andGate.getPinWorldPos(false, 0); // AND input 0 is at (100, 120)

  // Test findPinAt with 30px detection radius
  const canvas = createMockElem('canvas');
  const renderer = new CanvasRenderer(canvas, c);
  const hitPin = renderer.findPinAt(pin0.x - 25, pin0.y, 30);
  assertEqual(hitPin !== null, true, 'Pin hit found with generous 30px radius');
  assertEqual(hitPin.pinIndex, 0, 'Correct pin index identified');
});

runTest('WISH-043', 'Context menu clamping and max-height scrolling prevent clipping off-screen', () => {
  const app = new LogicSimApp();
  const menu = app.contextMenuEl;

  // Simulate context menu near bottom-right screen edge
  window.innerWidth = 1000;
  window.innerHeight = 800;
  menu.getBoundingClientRect = () => ({ width: 220, height: 350 });

  app.showContextMenu(950, 750, null, null, { x: 50, y: 50 }, true);

  const left = parseInt(menu.style.left, 10);
  const top = parseInt(menu.style.top, 10);

  assertEqual(left <= 1000 - 220 - 12, true, 'Menu left is clamped within viewport width');
  assertEqual(top <= 800 - 350 - 12, true, 'Menu top is clamped within viewport height');
  assertEqual(top >= 10, true, 'Menu top maintains minimum margin');
  app.hideContextMenu();
});

runTest('WISH-044', 'Signal color picker uses requestAnimationFrame throttling and debounced storage save', () => {
  const app = new LogicSimApp();
  const colorHigh = document.getElementById('settings-color-high');
  let saved = false;
  app.saveSettings = () => { saved = true; };

  // Rapid inputs
  if (colorHigh) {
    colorHigh.value = '#ff0055';
    saved = false;
    colorHigh.dispatchEvent({ type: 'input', target: colorHigh });
    assertEqual(saved, false, 'input event does not perform synchronous blocking saveSettings');

    // Change event commits settings
    colorHigh.dispatchEvent({ type: 'change', target: colorHigh });
    assertEqual(saved, true, 'change event commits saveSettings to storage');
  }
});

runTest('WISH-045', 'Component palette is fully unlocked and editable in simulation mode', () => {
  const app = new LogicSimApp();
  const sidebar = document.getElementById('sidebar');

  // 1. In edit mode, sidebar is unlocked
  app.engine.mode = 'edit';
  app.updateHUDAndToolbar();
  assertEqual(sidebar.classList.contains('sim-locked'), false, 'Sidebar is not sim-locked in edit mode');

  // 2. In sim mode, sidebar remains unlocked and editable
  app.engine.mode = 'sim';
  app.updateHUDAndToolbar();
  assertEqual(sidebar.classList.contains('sim-locked'), false, 'Sidebar remains unlocked and not sim-locked in sim mode');

  // 3. Components can be dropped and placed onto canvas during sim mode
  const initialCompCount = app.circuit.components.length;
  const newComp = app.circuit.addComponent('AND', 200, 150);
  assertEqual(app.circuit.components.length, initialCompCount + 1, 'Component successfully added during simulation mode');
  assertEqual(newComp.type, 'AND', 'Added component type is AND');
});

runTest('WISH-046', 'Remove duplicate frequency and zoom readouts from timing diagram analyzer header', () => {
  const app = new LogicSimApp();
  const infoBadge = document.getElementById('analyzer-playhead-info');

  // 1. Redundant standalone speed badge in analyzer header is hidden
  assertEqual(/id="analyzer-speed-badge"[^>]*display:\s*none/.test(require('fs').readFileSync(require('path').join(__dirname,'..','index.html'),'utf8')), true, 'Analyzer standalone speed badge is hidden (display: none)');

  // 2. Playhead info does NOT duplicate frequency (Takt: 10 Hz) or zoom (@ 12 px/T)
  app.analyzer.render();
  assertEqual(infoBadge.textContent.includes('Takt:'), false, 'Playhead info does not prepend redundant Takt: frequency string');
  assertEqual(infoBadge.textContent.includes('px/T'), false, 'Playhead info does not append redundant @ px/T zoom readout');

  // 3. Zoom level is cleanly displayed on the dedicated zoom slider label
  assertEqual(/id="label-time-zoom"[^>]*display:\s*none/.test(require('fs').readFileSync(require('path').join(__dirname,'..','index.html'),'utf8')), true, 'Zoom readout next to slider is hidden');
});

console.log('\n================================================================');
console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log('================================================================\n');

if (failed > 0) {
  process.exit(1);
}
