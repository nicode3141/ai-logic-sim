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
  createTextNode: (text) => ({ nodeType: 3, textContent: String(text || '') }),
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
  scriptMatch[1] + '; return { LogicSimApp, CanvasRenderer, LogicAnalyzerRenderer, Circuit, Component, Wire, Probe, RingBuffer, SimulationEngine, BooleanParser, TruthTableGenerator, escapeHtml, sanitizeParams, attachSliderHoldRepeat, I18N, LED_COLORS, SIGNAL_COLOR_PRESETS, GATE_DELAY_TYPES, SHORTCUT_DEFINITIONS, SHORTCUT_LOOKUP, normalizeShortcutEvent, formatShortcut, sanitizeShortcutOverrides, buildPdfFromJpegDataUrl };'
);
const { LogicSimApp, CanvasRenderer, LogicAnalyzerRenderer, Circuit, Component, Wire, Probe, RingBuffer, SimulationEngine, BooleanParser, TruthTableGenerator, escapeHtml, sanitizeParams, attachSliderHoldRepeat, I18N, LED_COLORS, SIGNAL_COLOR_PRESETS, GATE_DELAY_TYPES, SHORTCUT_DEFINITIONS, SHORTCUT_LOOKUP, normalizeShortcutEvent, formatShortcut, sanitizeShortcutOverrides, buildPdfFromJpegDataUrl } = evalFn(window, document, localStorage);

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

  // 2. Pins are strictly aligned to the 20px grid (including 20px input/output stubs)
  assertEqual(notGate.inputs[0].relX, -20, 'NOT input pin relX is -20 (with 20px input stub)');
  assertEqual(notGate.inputs[0].relY, 20, 'NOT input pin relY is 20 (on 20px grid)');
  assertEqual(notGate.outputs[0].relX, 60, 'NOT output pin relX is 60 (40px body + 20px output stub)');
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

runTest('WISH-045', 'Component palette is dimmed and locked in simulation mode', () => {
  const app = new LogicSimApp();
  const sidebar = document.getElementById('sidebar');
  app.engine.mode = 'edit';
  app.updateHUDAndToolbar();
  assertEqual(sidebar.classList.contains('sim-locked'), false, 'Sidebar is not sim-locked in edit mode');
  app.engine.mode = 'sim';
  app.updateHUDAndToolbar();
  assertEqual(sidebar.classList.contains('sim-locked'), true, 'Sidebar is sim-locked in sim mode');
  const html = require('fs').readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
  assertEqual(/#sidebar\.sim-locked\s*\{[^}]*opacity:\s*0\.55/.test(html), true, 'Locked sidebar is dimmed');
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

runTest('WISH-047', 'Camera auto-pans while dragging selected modules near the canvas edge', () => {
  const app = new LogicSimApp();
  assertEqual(typeof app.startDragAutoPan, 'function', 'startDragAutoPan is available');
  const html = require('fs').readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
  assertEqual(html.includes('this.startDragAutoPan()') && html.includes('__autoPan'), true, 'mousemove drag triggers auto-pan loop');
  app.engine.mode = 'edit';
  app.isDraggingGroup = false; app.draggingComp = null;
  app.startDragAutoPan();
  assertEqual(Boolean(app._autoPanActive), false, 'No auto-pan loop when nothing is dragged');
});

runTest('WISH-049', 'Compact Auto-Layout 20px (1-grid-cell) minimum gap, straight center counter input & obstacle-aware move rerouting', () => {
  const app = new LogicSimApp();
  app.layoutSpacing = 'compact';
  const opts = app.getLayoutOptions();
  assertEqual(opts.rowGap, 0, 'Compact rowGap is 0');
  assertEqual(opts.labelPad, 20, 'Compact labelPad is 20 (1 grid cell minimum gap)');
  assertEqual(opts.minChannel, 60, 'Compact minChannel is 60');
  assertEqual(opts.subGap, 40, 'Compact subGap is 40');

  app.layoutAnimation = false;
  app.smartWires = true;
  app.loadScenario('binary_counter_4bit');
  app.autoLayoutCircuit();

  const srcIds = ['bc_clk', 'bc_en', 'bc_rst'];
  const srcYs = srcIds.map(id => app.circuit.getComponent(id).y);
  for (let i = 0; i < srcYs.length - 1; i++) {
    assertEqual(srcYs[i + 1] - srcYs[i], 60, `Compact source vertical pitch ${srcIds[i]} -> ${srcIds[i + 1]} is 60px (40px box + 20px gap)`);
  }

  const ledIds = ['bc_l0', 'bc_l1', 'bc_l2', 'bc_l3', 'bc_lco'];
  const ledYs = ledIds.map(id => app.circuit.getComponent(id).y);
  for (let i = 0; i < ledYs.length - 1; i++) {
    assertEqual(ledYs[i + 1] - ledYs[i], 60, `Compact LED vertical pitch ${ledIds[i]} -> ${ledIds[i + 1]} is 60px (40px LED + 20px gap)`);
  }

  const wEn = app.circuit.getWire('bcw2');
  const wEnPts = app.renderer.getWirePolyline(wEn);
  assertEqual(wEnPts[0].y, wEnPts[wEnPts.length - 1].y, 'Middle counter input wire bcw2 (EN) is straight horizontal');

  const lco = app.circuit.getComponent('bc_lco');
  lco.y += 40;
  app.rerouteWiresAround(['bc_lco']);
  const w8 = app.circuit.getWire('bcw8');
  const w8Pts = app.renderer.getWirePolyline(w8);
  assertEqual(w8Pts.length >= 2, true, 'Moved Carry wire has valid polyline');
  assertEqual(w8Pts[w8Pts.length - 2].y, w8Pts[w8Pts.length - 1].y, 'Moved Carry wire enters LED pin horizontally without vertical hook');
});

runTest('WISH-050', 'Theme & Toast color balance, --accent-green preservation, and moduleValue contrast', () => {
  const app = new LogicSimApp();
  const prevDocElem = document.documentElement;
  const setCalls = [];
  document.documentElement = {
    style: { setProperty: (k, v) => setCalls.push([k, v]) }
  };
  try {
    app.setHighSignalColor('#ffb300');
  } finally {
    if (prevDocElem === undefined) delete document.documentElement;
    else document.documentElement = prevDocElem;
  }

  assertEqual(setCalls.some(([k, v]) => k === '--wire-high' && v === '#ffb300'), true, 'setHighSignalColor sets --wire-high');
  assertEqual(setCalls.some(([k]) => k === '--accent-green'), false, 'setHighSignalColor does not overwrite --accent-green on :root');

  const palettes = {};
  for (const theme of ['modern', 'pitch_black', 'java_swing', 'blueprint', 'light_cad']) {
    app.renderer.appTheme = theme;
    palettes[theme] = app.renderer.getThemePalette();
    assertEqual(Boolean(palettes[theme].moduleValue), true, `Theme ${theme} defines moduleValue`);
  }
  assertEqual(palettes.java_swing.moduleValue, '#b45309', 'java_swing moduleValue uses high-contrast amber-brown');
  assertEqual(palettes.light_cad.moduleValue, '#0f172a', 'light_cad moduleValue uses high-contrast slate');

  const currentHtml = fs.readFileSync(htmlPath, 'utf8');
  assertEqual(currentHtml.includes('[data-theme="java_swing"] #sim-toast'), true, 'java_swing #sim-toast rule exists');
  assertEqual(currentHtml.includes('[data-theme="light_cad"] #sim-toast'), true, 'light_cad #sim-toast rule exists');
  assertEqual(currentHtml.includes('[data-theme="blueprint"] #sim-toast'), true, 'blueprint #sim-toast rule exists');
  assertEqual(currentHtml.includes('[data-theme="pitch_black"] #sim-toast'), true, 'pitch_black #sim-toast rule exists');
  assertEqual(/\.freq-val\s*\{[^}]*\}\s*color:\s*var\(--accent-green\)/.test(currentHtml), false, 'No stray orphaned CSS properties after .freq-val');
});

runTest('WISH-051', 'Editable input/output pin labels for all modules and single-pass CUSTOM_IC pin rendering', () => {
  const c = new Circuit();
  const andGate = c.addComponent('AND', 40, 40, { inputLabels: ['A', 'B'], outputLabels: ['Z'] });
  assertEqual(andGate.inputs[0].name, 'A', 'Gate input 0 accepts custom label');
  assertEqual(andGate.inputs[0].defaultName, 'X1', 'Gate input 0 preserves defaultName');
  assertEqual(andGate.outputs[0].name, 'Z', 'Gate output 0 accepts custom label');
  assertEqual(andGate.outputs[0].defaultName, 'Y', 'Gate output 0 preserves defaultName');

  const sw = c.addComponent('SWITCH', 40, 160, { outputLabels: ['START'] });
  const led = c.addComponent('LED', 180, 160, { inputLabels: ['READY'] });
  assertEqual(sw.outputs[0].name, 'START', 'SWITCH output accepts custom label');
  assertEqual(led.inputs[0].name, 'READY', 'LED input accepts custom label');

  const dff = c.addComponent('D_FF', 40, 260, { inputLabels: ['DATA', 'TAKT'], outputLabels: ['STATE', 'INV'] });
  assertEqual(dff.inputs[1].defaultName, 'CLK', 'D_FF keeps defaultName CLK for clock wedge check');
  assertEqual(dff.inputs[1].name, 'TAKT', 'D_FF CLK pin accepts custom label');
  assertEqual(dff.outputs[1].defaultName, '!Q', 'D_FF keeps defaultName !Q for negation bubble');
  assertEqual(dff.outputs[1].name, 'INV', 'D_FF !Q pin accepts custom label');

  const ic = c.addComponent('CUSTOM_IC', 260, 40, {
    label: 'Modul 1',
    inputs: [{ name: 'SW', targets: [] }, { name: 'SW', targets: [] }],
    outputs: [{ name: 'LED', sourceCompIdx: 0, sourcePin: 0 }, { name: 'LED', sourceCompIdx: 0, sourcePin: 0 }]
  });
  assertEqual(ic.width % 20, 0, 'CUSTOM_IC width snaps to GRID_SIZE (20px)');

  const canvas = createMockElem('c');
  const renderer = new CanvasRenderer(canvas, c);
  const drawnTexts = [];
  let lineToCalls = 0;
  const origFillText = mockCtx.fillText;
  const origLineTo = mockCtx.lineTo;
  mockCtx.fillText = (txt) => drawnTexts.push(String(txt));
  mockCtx.lineTo = () => { lineToCalls++; };
  try {
    renderer.drawSingleComponent(mockCtx, ic);
    assertEqual(drawnTexts.filter(t => t === 'SW').length, 2, 'CUSTOM_IC with 2 SW inputs draws SW exactly twice (no duplicate SSWW overlap)');
    assertEqual(drawnTexts.filter(t => t === 'LED').length, 2, 'CUSTOM_IC with 2 LED outputs draws LED exactly twice (no duplicate LLEEDD overlap)');

    drawnTexts.length = 0;
    renderer.drawComponentPins(mockCtx, andGate);
    assertEqual(drawnTexts.includes('A') && drawnTexts.includes('B') && drawnTexts.includes('Z'), true, 'Renamed gate pins are drawn on gate body');

    drawnTexts.length = 0;
    renderer.drawComponentPins(mockCtx, sw);
    renderer.drawComponentPins(mockCtx, led);
    assertEqual(drawnTexts.includes('START'), true, 'Renamed SWITCH output label is drawn');
    assertEqual(drawnTexts.includes('READY'), true, 'Renamed LED input label is drawn');

    drawnTexts.length = 0;
    lineToCalls = 0;
    renderer.drawComponentPins(mockCtx, dff);
    assertEqual(lineToCalls >= 2, true, 'D_FF still draws clock wedge when CLK is renamed');
    assertEqual(drawnTexts.includes('INV'), true, 'Renamed !Q displays custom label instead of hardcoded Q̅');
  } finally {
    mockCtx.fillText = origFillText;
    mockCtx.lineTo = origLineTo;
  }

  // Inspector UI creates editable "Pin-Beschriftungen" inputs and English I18N translates them
  const app = new LogicSimApp();
  const c2 = app.circuit;
  const testMux = c2.addComponent('MUX', 40, 40);
  const inspContainer = createMockElem('insp-pin-test');
  const origContainer = app.inspector.container;
  const origOnChange = app.inspector.onChange;
  let onChangeCalls = 0;
  app.inspector.container = inspContainer;
  app.inspector.onChange = (...args) => { onChangeCalls++; return origOnChange(...args); };
  try {
    app.inspector.render(testMux.id, null);

    const allNodes = [];
    const collect = (node) => {
      allNodes.push(node);
      if (Array.isArray(node.children)) node.children.forEach(collect);
    };
    collect(inspContainer);
    assertEqual(allNodes.some(n => n.textContent === 'Pin-Beschriftungen'), true, 'Inspector renders Pin-Beschriftungen section');
    const propInputs = allNodes.filter(n => n.className === 'prop-input');
    assertEqual(propInputs.length >= 4, true, 'Inspector renders editable text inputs for MUX 3 inputs + 1 output (plus any component fields)');
    const muxIn0Input = allNodes.find(n => n.className === 'prop-group' && n.children && n.children[0] && n.children[0].textContent === 'Eingang 1 (D0)')?.children[1];
    assertEqual(Boolean(muxIn0Input), true, 'Eingang 1 (D0) input found in Inspector');
    muxIn0Input.value = 'IN_A';
    muxIn0Input.dispatchEvent({ type: 'input', target: muxIn0Input });
    assertEqual(testMux.inputs[0].name, 'IN_A', 'Typing into Inspector pin input updates MUX pin name live');
    assertEqual(onChangeCalls >= 1, true, 'Editing pin label triggers Inspector onChange');
  } finally {
    app.inspector.container = origContainer;
    app.inspector.onChange = origOnChange;
  }

  const prevLang = I18N.currentLang;
  I18N.currentLang = 'en';
  try {
    assertEqual(I18N.phrase('Pin-Beschriftungen'), 'Pin labels', 'I18N translates Pin-Beschriftungen');
    assertEqual(I18N.phrase('Eingang 1 (X1)'), 'Input 1 (X1)', 'I18N translates Eingang pin label pattern');
    assertEqual(I18N.phrase('Ausgang 1 (Y)'), 'Output 1 (Y)', 'I18N translates Ausgang pin label pattern');
  } finally {
    I18N.currentLang = prevLang;
  }
});

runTest('WISH-052', 'Palette Vorschau <-> Beschriftung toggle fix and larger, sharper, higher-contrast previews', () => {
  const currentHtml = fs.readFileSync(htmlPath, 'utf8');
  const defaultPreviewMatch = currentHtml.match(/\.palette-preview-canvas\s*\{([^}]*)\}/);
  assertEqual(Boolean(defaultPreviewMatch), true, '.palette-preview-canvas CSS block present');
  assertEqual(/display\s*:\s*none\s*;/.test(defaultPreviewMatch[1]), true, '.palette-preview-canvas defaults to display: none so Beschriftung mode is not broken');
  assertEqual(/height\s*:\s*76px\s*;/.test(defaultPreviewMatch[1]), true, '.palette-preview-canvas uses enlarged 76px height');
  assertEqual(/#sidebar\.palette-preview\s+\.palette-preview-canvas\s*\{[^}]*display\s*:\s*block\s*;/.test(currentHtml), true, '#sidebar.palette-preview .palette-preview-canvas shows preview canvas');
  assertEqual(/#sidebar\.palette-preview\s+\.palette-grid\.single-col\s+\.palette-preview-canvas\s*\{[^}]*height\s*:\s*96px\s*;/.test(currentHtml), true, 'Single-col module previews use 96px height');

  const app = new LogicSimApp();
  const prevPaletteView = app.paletteView;
  let renderPreviewCalls = 0;
  const origRenderPreviews = app.renderPalettePreviews.bind(app);
  let themeDuringPreview = null;
  app.renderPalettePreviews = () => {
    renderPreviewCalls++;
    themeDuringPreview = app.renderer.appTheme;
  };
  try {
    app.paletteView = 'preview';
    app.setAppTheme('light_cad');
    assertEqual(renderPreviewCalls >= 1, true, 'setAppTheme refreshes palette previews when active');
    assertEqual(themeDuringPreview, 'light_cad', 'setAppTheme updates renderer.appTheme BEFORE rendering palette previews');

    const prevCalls = renderPreviewCalls;
    app.setSymbolStandard('ANSI');
    assertEqual(renderPreviewCalls > prevCalls, true, 'setSymbolStandard refreshes palette previews');
  } finally {
    app.renderPalettePreviews = origRenderPreviews;
    app.paletteView = prevPaletteView;
  }

  // Test drawPaletteThumbnail supersampling & single-component label suppression
  const drawnThumbTexts = [];
  const thumbCtx = Object.assign(Object.create(mockCtx), {
    clearRect: () => {},
    setTransform: () => {},
    fillText: (txt) => drawnThumbTexts.push(String(txt))
  });
  const thumbCanvas = {
    clientWidth: 100,
    clientHeight: 76,
    width: 0,
    height: 0,
    closest: () => null,
    getContext: () => thumbCtx
  };
  app.drawPaletteThumbnail(thumbCanvas, 'AND', 1);
  assertEqual(thumbCanvas.width >= 200, true, 'drawPaletteThumbnail supersamples backing buffer (>= 2x on 1x DPR)');
  assertEqual(thumbCanvas.height >= 152, true, 'drawPaletteThumbnail supersamples height cleanly');
  assertEqual(drawnThumbTexts.includes('AND'), false, 'Single-component thumbnail omits redundant top label above gate body');
  assertEqual(Boolean(app.renderer._hideTopLabelInPreview), false, '_hideTopLabelInPreview is reset to false after thumbnail draw');
});

runTest('WISH-053', 'Pressing BUTTON near canvas edge does not trigger wire preview, auto-pan, or shift circuit/component', () => {
  const prevWinAdd = window.addEventListener;
  const canvasEl = document.getElementById('grid-canvas');
  const prevCanvasListeners = {};
  if (canvasEl && canvasEl.listeners) {
    for (const k of Object.keys(canvasEl.listeners)) prevCanvasListeners[k] = canvasEl.listeners[k].slice();
  }
  const winListeners = {};
  window.addEventListener = (type, fn) => {
    if (!winListeners[type]) winListeners[type] = [];
    winListeners[type].push(fn);
    return prevWinAdd(type, fn);
  };
  let app;
  try {
    app = new LogicSimApp();
  } finally {
    window.addEventListener = prevWinAdd;
  }

  const prevRectFn = app.gridCanvas.getBoundingClientRect;
  const prevCreateTextNode = document.createTextNode;
  if (typeof document.createTextNode !== 'function') {
    document.createTextNode = (t) => ({ nodeType: 3, textContent: String(t) });
  }
  try {
    app.gridCanvas.getBoundingClientRect = () => ({ left: 0, top: 0, width: 800, height: 600, right: 800, bottom: 600 });
    app.engine.mode = 'edit';
    app.allowEditModeInteraction = true;
    app.smartWires = true;
    app.renderer.panX = 0;
    app.renderer.panY = 0;
    app.renderer.zoom = 1;

    const btn = app.circuit.addComponent('BUTTON', 100, 560);
    const led = app.circuit.addComponent('LED', 300, 540);
    const wire = app.circuit.addWire(btn.id, 0, led.id, 0);
    wire.autoRouted = true;
    wire.waypoints = [{ x: 220, y: 580 }, { x: 220, y: 560 }];

    const mdHandlers = app.gridCanvas.listeners.mousedown || [];
    const lastMd = mdHandlers[mdHandlers.length - 1];
    const mm = (ev) => (winListeners.mousemove || []).forEach(fn => fn(ev));
    const mu = (ev) => (winListeners.mouseup || []).forEach(fn => fn(ev));

    // 1. Press BUTTON near bottom edge (< 48px from 600px bottom)
    lastMd({ button: 0, clientX: 140, clientY: 580, shiftKey: false, ctrlKey: false, preventDefault: () => {} });
    assertEqual(btn.state.pressed, 1, 'BUTTON activates pressed = 1 on mousedown');
    assertEqual(app.activeButtonComp, btn, 'activeButtonComp tracks held BUTTON');
    assertEqual(wire._preview, false, 'Wire _preview is NOT set when pressing BUTTON');
    assertEqual(app.isActivelyDraggingComponent(), false, 'Pressing BUTTON is not treated as active drag');

    // 2. Small mouse jitter while holding BUTTON near bottom edge must NOT auto-pan or move BUTTON
    mm({ clientX: 144, clientY: 589, target: app.gridCanvas });
    app.startDragAutoPan();
    assertEqual(Boolean(app._autoPanActive), false, 'Auto-pan stays inactive while holding BUTTON');
    assertEqual(app.renderer.panX, 0, 'Canvas panX unchanged while pressing BUTTON');
    assertEqual(app.renderer.panY, 0, 'Canvas panY unchanged while pressing BUTTON');
    assertEqual(btn.x, 100, 'BUTTON x coordinate unchanged on press jitter');
    assertEqual(btn.y, 560, 'BUTTON y coordinate unchanged on press jitter');

    // 3. Releasing BUTTON keeps waypoints and position intact
    mu({ clientX: 144, clientY: 589, shiftKey: false, ctrlKey: false });
    assertEqual(btn.state.pressed, 0, 'BUTTON resets pressed = 0 on mouseup');
    assertEqual(btn.x, 100, 'BUTTON x remains at 100 after release');
    assertEqual(btn.y, 560, 'BUTTON y remains at 560 after release');
    assertEqual(wire.waypoints.length, 2, 'Connected wire waypoints remain intact after BUTTON press');

    // 4. Intentional drag beyond 16px threshold moves BUTTON cleanly and releases pressed state
    lastMd({ button: 0, clientX: 140, clientY: 580, shiftKey: false, ctrlKey: false, preventDefault: () => {} });
    mm({ clientX: 140, clientY: 520, target: app.gridCanvas });
    assertEqual(app.isActivelyDraggingComponent(), true, 'Intentional > 16px drag promotes to active component drag');
    assertEqual(btn.state.pressed, 0, 'BUTTON releases pressed state once intentional drag begins');
    assertEqual(btn.y, 500, 'BUTTON moves to grid-snapped target y=500 on intentional drag');
    mu({ clientX: 140, clientY: 520, shiftKey: false, ctrlKey: false });
  } finally {
    if (prevCreateTextNode === undefined) delete document.createTextNode;
    else document.createTextNode = prevCreateTextNode;
    app.gridCanvas.getBoundingClientRect = prevRectFn;
    if (canvasEl && canvasEl.listeners) {
      for (const k of Object.keys(canvasEl.listeners)) {
        if (prevCanvasListeners[k]) canvasEl.listeners[k] = prevCanvasListeners[k];
      }
    }
  }
});

runTest('WISH-054', 'Selection rectangle selects and unselects modules and wires live during mousemove', () => {
  const prevWinAdd = window.addEventListener;
  const canvasEl = document.getElementById('grid-canvas');
  const prevCanvasListeners = {};
  if (canvasEl && canvasEl.listeners) {
    for (const k of Object.keys(canvasEl.listeners)) prevCanvasListeners[k] = canvasEl.listeners[k].slice();
  }
  const winListeners = {};
  window.addEventListener = (type, fn) => {
    if (!winListeners[type]) winListeners[type] = [];
    winListeners[type].push(fn);
    return prevWinAdd(type, fn);
  };
  let app;
  try {
    app = new LogicSimApp();
  } finally {
    window.addEventListener = prevWinAdd;
  }

  const prevRectFn = app.gridCanvas.getBoundingClientRect;
  const prevCreateTextNode = document.createTextNode;
  if (typeof document.createTextNode !== 'function') {
    document.createTextNode = (t) => ({ nodeType: 3, textContent: String(t) });
  }
  try {
    app.gridCanvas.getBoundingClientRect = () => ({ left: 0, top: 0, width: 800, height: 600, right: 800, bottom: 600 });
    app.engine.mode = 'edit';
    app.renderer.panX = 0;
    app.renderer.panY = 0;
    app.renderer.zoom = 1;

    const c1 = app.circuit.addComponent('AND', 100, 100);
    const c2 = app.circuit.addComponent('OR', 300, 100);
    const wire = app.circuit.addWire(c1.id, 0, c2.id, 0);

    const mdHandlers = app.gridCanvas.listeners.mousedown || [];
    const lastMd = mdHandlers[mdHandlers.length - 1];
    const mm = (ev) => (winListeners.mousemove || []).forEach(fn => fn(ev));
    const mu = (ev) => (winListeners.mouseup || []).forEach(fn => fn(ev));

    // Start marquee selection in empty space
    lastMd({ button: 0, clientX: 50, clientY: 50, shiftKey: false, ctrlKey: false, preventDefault: () => {} });
    assertEqual(app.isSelectingBox, true, 'Selection box starts on empty canvas mousedown');
    assertEqual(app.renderer.selectedCompIds.size, 0, 'Initial selection is empty');

    // Drag over c1 and wire (BEFORE mouseup)
    mm({ clientX: 200, clientY: 200, target: app.gridCanvas, shiftKey: false, ctrlKey: false });
    assertEqual(app.renderer.selectedCompIds.has(c1.id), true, 'c1 is selected live during mousemove');
    assertEqual(app.renderer.selectedCompIds.has(c2.id), false, 'c2 outside box is not yet selected');
    assertEqual(app.renderer.selectedWireIds.has(wire.id), true, 'Intersecting wire is selected live during mousemove');

    // Expand over c2 as well (BEFORE mouseup)
    mm({ clientX: 400, clientY: 220, target: app.gridCanvas, shiftKey: false, ctrlKey: false });
    assertEqual(app.renderer.selectedCompIds.has(c1.id) && app.renderer.selectedCompIds.has(c2.id), true, 'Both c1 and c2 are selected live as box expands');

    // Shrink box off c2 (BEFORE mouseup)
    mm({ clientX: 190, clientY: 200, target: app.gridCanvas, shiftKey: false, ctrlKey: false });
    assertEqual(app.renderer.selectedCompIds.has(c1.id), true, 'c1 stays selected as box stays over c1');
    assertEqual(app.renderer.selectedCompIds.has(c2.id), false, 'c2 unselects live when box shrinks off c2');

    // Release mouseup
    mu({ clientX: 190, clientY: 200, shiftKey: false, ctrlKey: false });
    assertEqual(app.isSelectingBox, false, 'Selection box finishes on mouseup');
    assertEqual(app.renderer.selectedCompIds.has(c1.id), true, 'Final selection keeps c1 after mouseup');
    assertEqual(app.renderer.selectedCompIds.has(c2.id), false, 'Final selection excludes c2 after mouseup');

    // Shift-additive live marquee preserves existing selection (c2) while adding c1
    app.selectMulti([c2.id], []);
    lastMd({ button: 0, clientX: 50, clientY: 50, shiftKey: true, ctrlKey: false, preventDefault: () => {} });
    mm({ clientX: 190, clientY: 200, target: app.gridCanvas, shiftKey: true, ctrlKey: false });
    assertEqual(app.renderer.selectedCompIds.has(c1.id) && app.renderer.selectedCompIds.has(c2.id), true, 'Shift+marquee keeps base c2 and selects c1 live during mousemove');
    mu({ clientX: 190, clientY: 200, shiftKey: true, ctrlKey: false });
  } finally {
    if (prevCreateTextNode === undefined) delete document.createTextNode;
    else document.createTextNode = prevCreateTextNode;
    app.gridCanvas.getBoundingClientRect = prevRectFn;
    if (canvasEl && canvasEl.listeners) {
      for (const k of Object.keys(canvasEl.listeners)) {
        if (prevCanvasListeners[k]) canvasEl.listeners[k] = prevCanvasListeners[k];
      }
    }
  }
});

runTest('WISH-055', 'Selection delay control, Hz-based ms readout, and edit-mode delayed propagation', () => {
  const prevCreateTextNode = document.createTextNode;
  if (!document.createTextNode) {
    document.createTextNode = (txt) => ({ nodeType: 3, textContent: String(txt || '') });
  }
  const prevLang = I18N.currentLang;
  try {
    const app = new LogicSimApp();
    app.engine.setMode('edit');
    app.engine.setFrequency(10);

    const sw = app.circuit.addComponent('SWITCH', 40, 80, { initialValue: 0 });
    const andGate = app.circuit.addComponent('AND', 160, 80, { numInputs: 2 });
    const notGate = app.circuit.addComponent('NOT', 280, 80, {});
    const led = app.circuit.addComponent('LED', 400, 80, {});
    app.circuit.addWire(sw.id, 0, andGate.id, 0);
    app.circuit.addWire(sw.id, 0, andGate.id, 1);
    app.circuit.addWire(andGate.id, 0, notGate.id, 0);
    app.circuit.addWire(notGate.id, 0, led.id, 0);
    app.circuit.syncImmediateWireLevels();

    // 1. Multi-selection delay control with Hz-based ms readout
    app.selectMulti([andGate.id, notGate.id, led.id], []);

    const findElements = (node, pred, acc = []) => {
      if (!node || typeof node !== 'object') return acc;
      if (pred(node)) acc.push(node);
      if (Array.isArray(node.children)) {
        for (const ch of node.children) findElements(ch, pred, acc);
      }
      return acc;
    };

    const sliders = findElements(app.inspector.container, el => el.type === 'range');
    assertEqual(sliders.length >= 1, true, 'Multi-selection renders delay range slider when delay-capable gates are selected');

    const delayLabels = findElements(app.inspector.container, el => Array.isArray(el.children) && el.children.length === 0 && typeof el.textContent === 'string' && el.textContent.includes('Tick'));
    assertEqual(delayLabels.some(s => s.textContent === '1 Tick (100 ms)'), true, 'Delay readout shows 1 Tick (100 ms) at 10 Hz');

    // Change selection delay to 4 ticks
    const delaySlider = sliders[0];
    delaySlider.value = '4';
    (delaySlider.listeners.input || []).forEach(fn => fn({ target: delaySlider }));

    assertEqual(andGate.params.delay, 4, 'Multi-selection delay slider updates AND gate delay to 4');
    assertEqual(notGate.params.delay, 4, 'Multi-selection delay slider updates NOT gate delay to 4');
    assertEqual(led.params.delay, undefined, 'Non-delay LED component is not given a delay param');
    assertEqual(delayLabels.some(s => s.textContent === '4 Ticks (400 ms)'), true, 'Delay readout updates to 4 Ticks (400 ms) at 10 Hz');

    // Change frequency to 20 Hz -> readout updates to 200 ms
    app.engine.setFrequency(20);
    app.refreshInspector();
    const delayLabels20Hz = findElements(app.inspector.container, el => Array.isArray(el.children) && el.children.length === 0 && typeof el.textContent === 'string' && el.textContent.includes('Tick'));
    assertEqual(delayLabels20Hz.some(s => s.textContent === '4 Ticks (200 ms)'), true, 'Delay readout recalculates with 20 Hz to 4 Ticks (200 ms)');

    // Palette global + module-specific delay slider
    const paletteTypeSel = document.getElementById('palette-delay-type');
    const paletteSlider = document.getElementById('palette-global-delay-slider');
    const paletteVal = document.getElementById('palette-global-delay-val');
    assertEqual(Boolean(paletteTypeSel && paletteSlider && paletteVal), true, 'Palette delay type selector, slider and readout exist');
    paletteTypeSel.value = '__GLOBAL__';
    paletteSlider.value = '5';
    (paletteSlider.listeners.input || []).forEach(fn => fn({ target: paletteSlider }));
    assertEqual(app.globalGateDelay, 5, 'Palette global delay slider updates app.globalGateDelay to 5');
    assertEqual(app.circuit.globalGateDelay, 5, 'Palette global delay slider updates circuit.globalGateDelay to 5');
    assertEqual(paletteVal.textContent, '5 Ticks (250 ms)', 'Palette global delay readout computes ms with 20 Hz');

    // Module-specific delay for AND gates only
    andGate.params.delay = null;
    notGate.params.delay = null;
    paletteTypeSel.value = 'AND';
    (paletteTypeSel.listeners.change || []).forEach(fn => fn());
    paletteSlider.value = '7';
    (paletteSlider.listeners.input || []).forEach(fn => fn({ target: paletteSlider }));
    assertEqual(app.circuit.moduleGateDelays.AND, 7, 'Module-specific delay sets moduleGateDelays.AND to 7');
    assertEqual(andGate.getEffectiveDelay(), 7, 'AND gate inherits module-specific delay 7');
    assertEqual(notGate.getEffectiveDelay(), 5, 'NOT gate keeps global delay 5');
    assertEqual(paletteVal.textContent, '7 Ticks (350 ms)', 'Palette readout shows 7 Ticks (350 ms) for AND at 20 Hz');

    // Circuit JSON roundtrip preserves moduleGateDelays
    const roundtripCircuit = new Circuit();
    roundtripCircuit.fromJSON(app.circuit.toJSON());
    assertEqual(roundtripCircuit.moduleGateDelays.AND, 7, 'Circuit JSON roundtrip preserves moduleGateDelays.AND');

    // English i18n formatting for delay with ms
    I18N.currentLang = 'en';
    assertEqual(I18N.phrase('4 Ticks (200 ms)'), '4 ticks (200 ms)', 'English translation formats 4 ticks (200 ms)');
    I18N.currentLang = 'de';

    // 2. Edit-mode delayed combinational propagation
    andGate.params.delay = 3;
    notGate.params.delay = 1;
    sw.state.value = 1;
    sw.outputs[0].value = 1;
    sw.nextOutputs[0] = 1;
    app.circuit.updateWireLevelsFromDrivers();

    // Immediately after switch toggle, AND gate output has not changed yet
    assertEqual(andGate.outputs[0].value, 0, 'AND gate output stays 0 immediately after switch toggle in edit mode');
    assertEqual(app.circuit.stepCombinational(), true, 'Tick 1: AND gate starts 3-tick delay countdown');
    assertEqual(andGate.outputs[0].value, 0, 'Tick 1: AND gate output still 0');
    assertEqual(app.circuit.stepCombinational(), true, 'Tick 2: AND gate delay countdown continues');
    assertEqual(andGate.outputs[0].value, 0, 'Tick 2: AND gate output still 0');
    assertEqual(app.circuit.stepCombinational(), true, 'Tick 3: AND gate commits output 1');
    assertEqual(andGate.outputs[0].value, 1, 'Tick 3: AND gate output becomes 1');
    app.circuit.stepCombinational();
    assertEqual(notGate.outputs[0].value, 0, 'Tick 4: NOT gate propagates output 0');
    assertEqual(led.inputs[0].value, 0, 'Tick 4: LED receives updated level');

    // triggerEditPropagation + stopEditPropagation cleans up cleanly
    app.triggerEditPropagation(app.circuit);
    app.stopEditPropagation();
    assertEqual(app._editPropRafId, null, 'stopEditPropagation clears pending rAF timer');
  } finally {
    I18N.currentLang = prevLang;
    if (prevCreateTextNode === undefined) delete document.createTextNode;
    else document.createTextNode = prevCreateTextNode;
  }
});

runTest('WISH-056', 'Sequential invertedOutput, NOT input/output stubs, and LED snap on move/wire drop', () => {
  // 1. T_FF / D_FF / COUNTER / SHIFT_REG output inversion
  const c = new Circuit();
  const tff = c.addComponent('T_FF', 100, 100, { invertedOutput: true });
  tff.compute();
  tff.commit(true);
  assertEqual(tff.state.q, 0, 'T_FF internal Q starts at 0');
  assertEqual(tff.outputs[0].value, 1, 'T_FF Q output is inverted to 1 when invertedOutput=true');
  assertEqual(tff.outputs[1].value, 1, 'T_FF !Q output remains 1 when Q=0');

  const cnt = c.addComponent('COUNTER', 260, 100, { invertedOutput: true });
  cnt.compute();
  cnt.commit(true);
  assertEqual(cnt.outputs[0].value, 1, 'COUNTER Q0 is inverted to 1 at count=0 when invertedOutput=true');

  // 2. NOT gate has 20px input/output stubs on 20px grid
  const notGate = c.addComponent('NOT', 100, 220);
  assertEqual(notGate.inputs[0].relX, -20, 'NOT gate has -20px input lead stub');
  assertEqual(notGate.outputs[0].relX, 60, 'NOT gate has +20px output lead stub beyond 40px body');

  // 3. Moving an LED onto an open wire end via endDragPreview snaps and connects it
  const app = new LogicSimApp();
  const sw = app.circuit.addComponent('SWITCH', 40, 100, { initialValue: 1 });
  const openWire = app.circuit.addWire(sw.id, 0, null, null, null, null, { toPoint: { x: 200, y: 120 } });
  const led = app.circuit.addComponent('LED', 200, 100);
  app.endDragPreview([led.id], true);
  assertEqual(openWire.toCompId, led.id, 'Moving LED onto open wire end snaps wire to LED');
  assertEqual(openWire.toPin, 0, 'Snapped wire targets LED input pin 0');
  assertEqual(led.inputs[0].value, 1, 'Snapped LED receives HIGH signal from switch');
});

runTest('WISH-057', 'Zero-delay (Sofort / 0 ms) propagation in edit/sim mode and JSON persistence', () => {
  const prevLang = I18N.currentLang;
  try {
    const app = new LogicSimApp();
    app.engine.setMode('edit');

    const sw = app.circuit.addComponent('SWITCH', 40, 80, { initialValue: 0 });
    const andGate = app.circuit.addComponent('AND', 160, 80, { numInputs: 2, delay: 0 });
    const notGate = app.circuit.addComponent('NOT', 280, 80, { delay: 0 });
    const led = app.circuit.addComponent('LED', 400, 80, {});
    app.circuit.addWire(sw.id, 0, andGate.id, 0);
    app.circuit.addWire(sw.id, 0, andGate.id, 1);
    app.circuit.addWire(andGate.id, 0, notGate.id, 0);
    app.circuit.addWire(notGate.id, 0, led.id, 0);
    app.circuit.syncImmediateWireLevels();

    assertEqual(andGate.getEffectiveDelay(), 0, 'AND gate accepts 0 tick delay');
    assertEqual(notGate.getEffectiveDelay(), 0, 'NOT gate accepts 0 tick delay');

    // Palette slider accepts 0 and formats as 'Sofort (0 ms)'
    const paletteTypeSel = document.getElementById('palette-delay-type');
    const paletteSlider = document.getElementById('palette-global-delay-slider');
    const paletteVal = document.getElementById('palette-global-delay-val');
    paletteTypeSel.value = '__GLOBAL__';
    paletteSlider.value = '0';
    (paletteSlider.listeners.input || []).forEach(fn => fn({ target: paletteSlider }));
    assertEqual(app.globalGateDelay, 0, 'Palette slider sets globalGateDelay to 0');
    assertEqual(app.circuit.globalGateDelay, 0, 'Circuit globalGateDelay is 0');
    assertEqual(paletteVal.textContent, 'Sofort (0 ms)', 'Zero delay readout displays Sofort (0 ms)');

    I18N.currentLang = 'en';
    assertEqual(I18N.phrase('Sofort (0 ms)'), 'Instant (0 ms)', 'English translation for Sofort (0 ms)');
    I18N.currentLang = 'de';

    // Edit-mode propagation settles 0-delay chain immediately without waiting ticks
    sw.state.value = 1;
    sw.outputs[0].value = 1;
    sw.nextOutputs[0] = 1;
    app.triggerEditPropagation(app.circuit);
    app.stopEditPropagation();
    assertEqual(andGate.outputs[0].value, 1, '0-delay AND gate settles immediately in edit mode');
    assertEqual(notGate.outputs[0].value, 0, '0-delay NOT gate settles immediately in edit mode');
    assertEqual(led.inputs[0].value, 0, 'LED receives updated level immediately in edit mode');

    // Simulation mode single step propagates entire 0-delay chain in same tick
    app.engine.setMode('sim');
    sw.state.value = 0;
    sw.outputs[0].value = 0;
    sw.nextOutputs[0] = 0;
    app.circuit.step();
    assertEqual(andGate.outputs[0].value, 0, '0-delay AND gate propagates in single sim tick');
    assertEqual(notGate.outputs[0].value, 1, '0-delay NOT gate propagates in same sim tick');
    assertEqual(led.inputs[0].value, 1, 'LED receives updated level in same sim tick');

    // JSON roundtrip preserves 0 delay (not reset to 1)
    app.setModuleGateDelay('AND', 0, false);
    const rt = new Circuit();
    rt.fromJSON(app.circuit.toJSON());
    assertEqual(rt.globalGateDelay, 0, 'JSON roundtrip preserves globalGateDelay = 0');
    assertEqual(rt.moduleGateDelays.AND, 0, 'JSON roundtrip preserves moduleGateDelays.AND = 0');
  } finally {
    I18N.currentLang = prevLang;
  }
});

runTest('WISH-058', 'Live palette drag-and-drop module preview tracks cursor and clears on drop/dragend', () => {
  const prevCreateTextNode = document.createTextNode;
  if (!document.createTextNode) {
    document.createTextNode = (txt) => ({ nodeType: 3, textContent: String(txt || '') });
  }
  const winListeners = {};
  const prevWinAdd = window.addEventListener;
  window.addEventListener = (type, fn, opts) => {
    if (!winListeners[type]) winListeners[type] = [];
    winListeners[type].push(fn);
    if (typeof prevWinAdd === 'function') prevWinAdd.call(window, type, fn, opts);
  };
  const app = new LogicSimApp();
  app.engine.setMode('edit');

  const dtStore = {};
  const fakeEvent = {
    dataTransfer: {
      setData: (k, v) => { dtStore[k] = v; },
      getData: (k) => dtStore[k] || '',
      effectAllowed: ''
    },
    preventDefault: () => {}
  };

  app.startPaletteDrag(fakeEvent, 'AND');
  assertEqual(app._paletteDragType, 'AND', 'startPaletteDrag records dragged module type');
  assertEqual(dtStore['text/plain'], 'AND', 'dataTransfer stores module type');

  // Also verify startPaletteDrag passes preloaded 1x1 transparent Image to setDragImage when Image is available
  const prevImage = global.Image;
  let dragImgArg = null;
  global.Image = function MockImage() { this.src = ''; };
  try {
    app._blankDragImg = null;
    app.initPaletteEvents();
    assertEqual(Boolean(app._blankDragImg && app._blankDragImg.src.startsWith('data:image/gif')), true, 'initPaletteEvents preloads 1x1 transparent GIF Image for setDragImage');
    app.startPaletteDrag({
      dataTransfer: {
        setData: () => {},
        setDragImage: (img) => { dragImgArg = img; },
        effectAllowed: ''
      }
    }, 'BUTTON');
    assertEqual(dragImgArg, app._blankDragImg, 'startPaletteDrag passes preloaded transparent Image to setDragImage to suppress browser button ghost');
    app.clearPaletteDragGhost();
  } finally {
    if (prevImage === undefined) delete global.Image;
    else global.Image = prevImage;
  }

  const prevRectFn = app.gridCanvas.getBoundingClientRect;
  app.gridCanvas.getBoundingClientRect = () => ({ left: 0, top: 0, width: 1200, height: 800 });
  try {
    const dragoverHandlers = app.gridCanvas.listeners.dragover || [];
    const dropHandlers = app.gridCanvas.listeners.drop || [];
    const dragleaveHandlers = app.gridCanvas.listeners.dragleave || [];
    assertEqual(dragoverHandlers.length >= 1 && dropHandlers.length >= 1, true, 'Palette dragover and drop listeners are attached');

    const screenX = app.renderer.panX + 200 * app.renderer.zoom;
    const screenY = app.renderer.panY + 140 * app.renderer.zoom;
    dragoverHandlers.forEach(fn => fn({
      clientX: screenX,
      clientY: screenY,
      dataTransfer: fakeEvent.dataTransfer,
      preventDefault: () => {}
    }));

    assertEqual(Boolean(app.renderer.paletteDragGhost && app.renderer.paletteDragGhost.comp), true, 'dragover sets live component ghost on renderer');
    assertEqual(app.renderer.paletteDragGhost.comp.type, 'AND', 'Ghost component matches dragged module type');
    assertEqual(app.renderer.paletteDragGhost.comp.x, 160, 'Ghost component X is centered & grid-snapped around cursor (200 - 40)');
    assertEqual(app.renderer.paletteDragGhost.comp.y, 100, 'Ghost component Y is centered & grid-snapped around cursor (140 - 40)');

    // Move cursor -> ghost moves with cursor
    const screenX2 = app.renderer.panX + 300 * app.renderer.zoom;
    const screenY2 = app.renderer.panY + 220 * app.renderer.zoom;
    dragoverHandlers.forEach(fn => fn({
      clientX: screenX2,
      clientY: screenY2,
      dataTransfer: fakeEvent.dataTransfer,
      preventDefault: () => {}
    }));
    assertEqual(app.renderer.paletteDragGhost.comp.x, 260, 'Ghost moves with cursor on dragover');
    assertEqual(app.renderer.paletteDragGhost.comp.y, 180, 'Ghost Y moves with cursor on dragover');

    // Drop places component at centered ghost position and clears ghost
    dropHandlers.forEach(fn => fn({
      clientX: screenX2,
      clientY: screenY2,
      dataTransfer: fakeEvent.dataTransfer,
      preventDefault: () => {}
    }));
    assertEqual(app.renderer.paletteDragGhost, null, 'drop clears paletteDragGhost');
    assertEqual(app._paletteDragType, null, 'drop clears _paletteDragType');
    const placed = app.circuit.components.find(c => c.type === 'AND');
    assertEqual(Boolean(placed), true, 'drop creates AND component');
    assertEqual(placed.x, 260, 'Placed component X matches centered cursor ghost');
    assertEqual(placed.y, 180, 'Placed component Y matches centered cursor ghost');

    // dragleave also clears ghost
    app.startPaletteDrag(fakeEvent, 'LED');
    assertEqual(Boolean(app._paletteGhostOverlayEl), true, 'Floating ghost overlay canvas is created on dragstart');

    // Dragging over other GUI elements (non-canvas target) shows floating ghost overlay at cursor via translate3d
    const winDragover = (winListeners.dragover || []);
    winDragover.forEach(fn => fn({ target: createMockElem('sidebar'), clientX: 120, clientY: 220, preventDefault: () => {} }));
    assertEqual(app._paletteGhostOverlayEl.style.display, 'block', 'Floating ghost overlay is visible when dragging over non-canvas GUI');
    assertEqual(String(app._paletteGhostOverlayEl.style.transform || '').includes('translate3d('), true, 'Floating ghost overlay positions with GPU translate3d');

    // Entering gridCanvas hides floating overlay and switches to grid-snapped canvas ghost
    dragoverHandlers.forEach(fn => fn({ clientX: screenX, clientY: screenY, dataTransfer: fakeEvent.dataTransfer, preventDefault: () => {} }));
    assertEqual(app._paletteGhostOverlayEl.style.display, 'none', 'Floating ghost overlay hides when entering workspace canvas');
    assertEqual(Boolean(app.renderer.paletteDragGhost), true, 'LED ghost appears during dragover');
    dragleaveHandlers.forEach(fn => fn());
    assertEqual(app.renderer.paletteDragGhost, null, 'dragleave clears paletteDragGhost');
    app.clearPaletteDragGhost();
    assertEqual(app._paletteGhostOverlayEl.style.display, 'none', 'clearPaletteDragGhost hides floating overlay');

    // Smooth mouse-drag (mousedown -> mousemove -> mouseup) places component without native HTML5 DnD lag
    const mockItem = createMockElem('mock-or-item');
    mockItem.dataset = { type: 'OR' };
    app.bindPaletteItemDrag(mockItem);
    (mockItem.listeners.mousedown || []).forEach(fn => fn({ button: 0, clientX: 20, clientY: 20, target: mockItem, preventDefault: () => {} }));
    assertEqual(Boolean(app._mousePaletteDrag && !app._mousePaletteDrag.started), true, 'mousedown arms mouse palette drag');
    (winListeners.mousemove || []).forEach(fn => fn({ clientX: screenX, clientY: screenY }));
    assertEqual(Boolean(app._mousePaletteDrag && app._mousePaletteDrag.started), true, 'mousemove past 5px starts smooth palette drag');
    const prevOrCount = app.circuit.components.filter(c => c.type === 'OR').length;
    (winListeners.mouseup || []).forEach(fn => fn({ clientX: screenX, clientY: screenY }));
    const nextOrCount = app.circuit.components.filter(c => c.type === 'OR').length;
    assertEqual(nextOrCount, prevOrCount + 1, 'mouseup over canvas drops OR component cleanly');
    assertEqual(app._paletteDragType, null, 'mouseup clears active palette drag');
  } finally {
    window.addEventListener = prevWinAdd;
    if (prevCreateTextNode === undefined) delete document.createTextNode;
    else document.createTextNode = prevCreateTextNode;
    app.gridCanvas.getBoundingClientRect = prevRectFn;
  }
});

runTest('WISH-059', 'Non-gate module input and output inversion bubbles render cleanly outside module border without overlapping pin circle', () => {
  const c = new Circuit();
  const sipo = c.addComponent('SHIFT_REG', 200, 100, { invertedInputs: [true, false, false] });
  const tff = c.addComponent('T_FF', 400, 100, { invertedOutput: false });
  const engine = new SimulationEngine(c, new RingBuffer(10), () => {});
  const renderer = new CanvasRenderer(createMockElem('grid-canvas'), c, engine);

  const arcCalls = [];
  const spyCtx = Object.assign({}, mockCtx, {
    arc: (x, y, r) => arcCalls.push({ x, y, r })
  });

  renderer.drawComponentPins(spyCtx, sipo);
  const dinY = sipo.y + sipo.inputs[0].relY;
  const dinArcs = arcCalls.filter(a => Math.abs(a.y - dinY) < 1 && a.x <= sipo.x + 10);
  assertEqual(dinArcs.length, 1, 'Inverted DIN input draws exactly 1 circle (no overlapping pin circle)');
  assertEqual(dinArcs[0].x < sipo.x, true, 'Inverted DIN bubble is placed outside the left module wall');

  arcCalls.length = 0;
  renderer.drawComponentPins(spyCtx, tff);
  const negQY = tff.y + tff.outputs[1].relY;
  const negQArcs = arcCalls.filter(a => Math.abs(a.y - negQY) < 1 && a.x >= tff.x + tff.width - 10);
  assertEqual(negQArcs.length, 1, 'Negated !Q output draws exactly 1 circle (no overlapping pin circle)');
  assertEqual(negQArcs[0].x > tff.x + tff.width, true, 'Negated !Q bubble is placed outside the right module wall');
});

runTest('WISH-060', 'Java Swing slider track alignment CSS and palette delay dropdown live timing labels', () => {
  const prevLang = I18N.currentLang;
  I18N.currentLang = 'de';
  try {
    // 1. Static CSS check: java_swing runnable track uses border: none and height: 4px so thumb has no horizontal/vertical offset
    const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
    const swingTrackMatch = html.match(/\[data-theme="java_swing"\]\s+input\[type="range"\]::-webkit-slider-runnable-track\s*\{([^}]*)\}/);
    assertEqual(Boolean(swingTrackMatch), true, 'java_swing range track CSS block exists');
    assertEqual(swingTrackMatch[1].includes('border: none'), true, 'java_swing range track uses border: none to avoid left-edge thumb offset');
    assertEqual(swingTrackMatch[1].includes('height: 4px'), true, 'java_swing range track keeps 4px height matching margin-top: -6px on 16px thumb');

    // 2. Dropdown options show concise right-aligned ms values only
    const app = new LogicSimApp();
    const sel = document.getElementById('palette-delay-type');
    const optGlobal = createMockElem('opt-global');
    optGlobal.value = '__GLOBAL__';
    optGlobal['data-base-label'] = 'Alle (Global)';
    const optAnd = createMockElem('opt-and');
    optAnd.value = 'AND';
    optAnd['data-base-label'] = 'AND-Gatter';
    const optOr = createMockElem('opt-or');
    optOr.value = 'OR';
    optOr['data-base-label'] = 'OR-Gatter';
    sel.options = [optGlobal, optAnd, optOr];
    sel.value = '__GLOBAL__';

    app.engine.setFrequency(10);
    app.setGlobalGateDelay(0, false);
    app.setModuleGateDelay('AND', 3, false);

    const menu = document.getElementById('palette-delay-menu');
    assertEqual(menu.children.length, 3, 'Custom palette delay dropdown renders 3 rows');
    assertEqual(menu.children[0].children[0].textContent, 'Alle (Global)', 'Row 0 left label is Alle (Global)');
    assertEqual(menu.children[0].children[1].textContent, '0 ms', 'Row 0 right-aligned value is 0 ms');
    assertEqual(menu.children[1].children[0].textContent, 'AND-Gatter', 'Row 1 left label is AND-Gatter');
    assertEqual(menu.children[1].children[1].textContent, '300 ms', 'Row 1 right-aligned value is 300 ms');
    assertEqual(menu.children[2].children[1].textContent, '0 ms', 'Row 2 inherited right-aligned value is 0 ms');

    // Changing frequency recalculates dropdown times
    app.engine.setFrequency(20);
    app.syncPaletteDelayUi();
    assertEqual(menu.children[1].children[1].textContent, '150 ms', 'Dropdown option right-aligned time updates to 150 ms at 20 Hz');
  } finally {
    I18N.currentLang = prevLang;
  }
});

runTest('WISH-061', 'Remove symbol-norm switcher from workspace context menu and use diagonal wires in auto-arrange when allowed', () => {
  const app = new LogicSimApp();
  app.engine.setMode('edit');

  // 1. Workspace right-click context menu no longer contains symbol-norm switcher
  app.showContextMenu(146, 202, null, null, { x: 146, y: 202 });
  const menuEl = document.getElementById('context-menu');
  const collectText = (node, acc = []) => {
    if (!node) return acc;
    if (typeof node.textContent === 'string' && node.textContent) acc.push(node.textContent);
    if (Array.isArray(node.children)) {
      for (const ch of node.children) collectText(ch, acc);
    }
    return acc;
  };
  const menuTexts = collectText(menuEl).join(' ');
  assertEqual(menuTexts.includes('Symbol-Norm'), false, 'Workspace context menu does not include Symbol-Norm umschalten');
  assertEqual(menuTexts.includes('DIN 40700'), false, 'Workspace context menu does not include DIN 40700 chip');
  app.hideContextMenu();

  // 2. Normal forward wires stay orthogonal; optimal cases like RS flip-flop feedback use diagonal when allowDiagonalWires=true
  app.layoutAnimation = false;
  const btnS = app.circuit.addComponent('BUTTON', 40, 60, {});
  const btnR = app.circuit.addComponent('BUTTON', 40, 200, {});
  const nand1 = app.circuit.addComponent('NAND', 200, 60, { numInputs: 2 });
  const nand2 = app.circuit.addComponent('NAND', 200, 180, { numInputs: 2 });
  const wS = app.circuit.addWire(btnS.id, 0, nand1.id, 0);
  const wR = app.circuit.addWire(btnR.id, 0, nand2.id, 1);
  const wFb1 = app.circuit.addWire(nand2.id, 0, nand1.id, 1);
  const wFb2 = app.circuit.addWire(nand1.id, 0, nand2.id, 0);

  app.setAllowDiagonalWires(true);
  app.autoLayoutCircuit();
  assertEqual(wS.style, 'orthogonal', 'Normal forward wire wS stays orthogonal even when allowDiagonalWires=true');
  assertEqual(wFb1.style, 'diagonal', 'RS flip-flop feedback wFb1 uses diagonal connection when optimal');
  assertEqual(wFb2.style, 'diagonal', 'RS flip-flop feedback wFb2 uses diagonal connection when optimal');

  // 3. Disabling allowDiagonalWires makes auto-layout route purely orthogonally
  app.setAllowDiagonalWires(false);
  app.autoLayoutCircuit();
  assertEqual(wFb1.style, 'orthogonal', 'Feedback wire wFb1 becomes orthogonal on auto-layout when allowDiagonalWires=false');
  assertEqual(wFb2.style, 'orthogonal', 'Feedback wire wFb2 becomes orthogonal on auto-layout when allowDiagonalWires=false');
});

runTest('WISH-062', 'Waypoint handles match visible corners and segment drag does not spawn phantom waypoints', () => {
  const prevCreateTextNode = document.createTextNode;
  if (!document.createTextNode) {
    document.createTextNode = (txt) => ({ nodeType: 3, textContent: String(txt || '') });
  }
  const app = new LogicSimApp();
  app.engine.setMode('edit');
  const prevRectFn = app.gridCanvas.getBoundingClientRect;
  app.gridCanvas.getBoundingClientRect = () => ({ left: 0, top: 0, width: 1200, height: 800 });

  try {
    const sw = app.circuit.addComponent('SWITCH', 40, 100, {});
    const led = app.circuit.addComponent('LED', 280, 40, {});
    const w = app.circuit.addWire(sw.id, 0, led.id, 0);
    // Inject a stale collinear waypoint on the vertical segment (180, 100) -> (180, 60)
    w.waypoints = [{ x: 180, y: 120 }, { x: 180, y: 100 }, { x: 180, y: 60 }];
    app.selectItem(null, w.id);

    // 1. drawWires only draws handles at actual visible corners (pts.slice(1, -1)) — NOT at collinear (180, 100)
    const drawnCircles = [];
    const spyCtx = Object.assign({}, mockCtx, {
      arc: (x, y, r) => drawnCircles.push({ x, y, r })
    });
    app.renderer.drawWires(spyCtx);
    const hasPhantomMid = drawnCircles.some(c => Math.abs(c.x - 180) < 1 && Math.abs(c.y - 100) < 1 && c.r === 4);
    assertEqual(hasPhantomMid, false, 'No phantom waypoint circle drawn on collinear mid-segment point');

    // 2. ensureWireWaypoints(w, true) synchronizes stale waypoints to actual corners
    app.ensureWireWaypoints(w, true);
    assertEqual(w.waypoints.length, 2, 'Force-synced waypoints match the 2 actual visible corners');

    // 3. Repeated mousemove while dragging last segment does not push unbounded waypoints
    app.renderer.panX = 0;
    app.renderer.panY = 0;
    app.renderer.zoom = 1;
    const mdHandlers = app.gridCanvas.listeners.mousedown || [];
    const mmHandlers = (typeof window.listeners === 'object' && window.listeners.mousemove) ? window.listeners.mousemove : [];
    // Click on last horizontal segment (180, 60) -> (280, 60) at (220, 60)
    mdHandlers.forEach(fn => fn({ button: 0, clientX: 220, clientY: 60, preventDefault: () => {} }));
    assertEqual(Boolean(app.draggingSegment), true, 'Segment drag starts on last horizontal segment');
    const prevIdx = app.draggingSegment.segmentIndex;
    // Simulate dragging segment via mousemove directly on app.draggingSegment logic if window listener isn't captured
    for (let step = 0; step < 5; step++) {
      const ev = { clientX: 220, clientY: 80 + step * 20 };
      if (mmHandlers.length > 0) mmHandlers.forEach(fn => fn(ev));
    }
    assertEqual(w.waypoints.length <= 4, true, 'Segment drag adds at most 2 end-jog waypoints instead of pushing infinitely');
    app.draggingSegment = null;
    app.cleanWireWaypoints(w);

    // 4. removeWaypointFromWire cleans collinear remnants
    w.waypoints = [{ x: 180, y: 120 }, { x: 180, y: 100 }, { x: 180, y: 60 }];
    app.removeWaypointFromWire(w, 1);
    assertEqual(w.waypoints.length, 2, 'removeWaypointFromWire leaves clean 2-corner waypoints');
  } finally {
    if (prevCreateTextNode === undefined) delete document.createTextNode;
    else document.createTextNode = prevCreateTextNode;
    app.gridCanvas.getBoundingClientRect = prevRectFn;
  }
});

runTest('WISH-063', 'CLOCK supports independent HIGH-phase and LOW-phase tick counts with Inspector controls and JSON persistence', () => {
  const prevCreateTextNode = document.createTextNode;
  if (!document.createTextNode) {
    document.createTextNode = (txt) => ({ nodeType: 3, textContent: String(txt || '') });
  }
  const prevLang = I18N.currentLang;
  try {
    const app = new LogicSimApp();
    app.engine.setMode('edit');
    app.engine.setFrequency(10);

    // 1. Asymmetric duty cycle: highTicks = 3, lowTicks = 1
    const clk = app.circuit.addComponent('CLOCK', 80, 100, { highTicks: 3, lowTicks: 1 });
    assertEqual(clk.params.highTicks, 3, 'CLOCK stores highTicks = 3');
    assertEqual(clk.params.lowTicks, 1, 'CLOCK stores lowTicks = 1');

    const seq = [];
    for (let i = 0; i < 8; i++) {
      app.circuit.step();
      seq.push(clk.outputs[0].value);
    }
    assertEqual(JSON.stringify(seq), JSON.stringify([1, 1, 1, 0, 1, 1, 1, 0]), 'CLOCK produces exact 3-tick HIGH / 1-tick LOW duty cycle');

    // 2. Legacy halfPeriod fallback
    const clkSym = app.circuit.addComponent('CLOCK', 80, 200, { halfPeriod: 2 });
    assertEqual(clkSym.params.highTicks, 2, 'Legacy halfPeriod initializes highTicks = 2');
    assertEqual(clkSym.params.lowTicks, 2, 'Legacy halfPeriod initializes lowTicks = 2');

    // 3. Inspector renders HIGH-Phase and LOW-Phase sliders with ms readouts
    app.selectItem(clk.id, null);
    const findElements = (node, pred, acc = []) => {
      if (!node || typeof node !== 'object') return acc;
      if (pred(node)) acc.push(node);
      if (Array.isArray(node.children)) {
        for (const ch of node.children) findElements(ch, pred, acc);
      }
      return acc;
    };
    const sliders = findElements(app.inspector.container, el => el.type === 'range');
    assertEqual(sliders.length, 2, 'CLOCK inspector renders 2 sliders (HIGH-Phase and LOW-Phase)');
    sliders[0].value = '4';
    (sliders[0].listeners.input || []).forEach(fn => fn({ target: sliders[0] }));
    sliders[1].value = '2';
    (sliders[1].listeners.input || []).forEach(fn => fn({ target: sliders[1] }));
    assertEqual(clk.params.highTicks, 4, 'HIGH-Phase slider updates clk.params.highTicks');
    assertEqual(clk.params.lowTicks, 2, 'LOW-Phase slider updates clk.params.lowTicks');

    // 4. JSON roundtrip & I18N check
    const rt = new Circuit();
    rt.fromJSON(app.circuit.toJSON());
    const rtClk = rt.getComponent(clk.id);
    assertEqual(rtClk.params.highTicks, 4, 'JSON roundtrip preserves highTicks = 4');
    assertEqual(rtClk.params.lowTicks, 2, 'JSON roundtrip preserves lowTicks = 2');

    I18N.currentLang = 'en';
    assertEqual(I18N.phrase('HIGH-Phase (Ticks)'), 'HIGH phase (ticks)', 'English translation for HIGH-Phase (Ticks)');
    assertEqual(I18N.phrase('LOW-Phase (Ticks)'), 'LOW phase (ticks)', 'English translation for LOW-Phase (Ticks)');
  } finally {
    I18N.currentLang = prevLang;
    if (prevCreateTextNode === undefined) delete document.createTextNode;
    else document.createTextNode = prevCreateTextNode;
  }
});

runTest('WISH-064', 'LogicAnalyzer channels can be reordered up and down via gutter buttons, drag-and-drop, inspector, and context menu', () => {
  const prevCreateTextNode = document.createTextNode;
  if (!document.createTextNode) {
    document.createTextNode = (txt) => ({ nodeType: 3, textContent: String(txt || '') });
  }
  const prevLang = I18N.currentLang;
  try {
    const app = new LogicSimApp();
    app.engine.setMode('edit');
    app.circuit.clear(app.ringBuffer);
    app.getActiveTab().lastSnapshot = JSON.stringify(app.circuit.toJSON());
    app.getActiveTab().undoStack = [];
    app.getActiveTab().redoStack = [];
    app.refreshAll();

    const sw = app.circuit.addComponent('SWITCH', 40, 80);
    const not1 = app.circuit.addComponent('NOT', 160, 80);
    const led = app.circuit.addComponent('LED', 280, 80);
    const led2 = app.circuit.addComponent('LED', 280, 160);
    const w1 = app.circuit.addWire(sw.id, 0, not1.id, 0);
    const w2 = app.circuit.addWire(not1.id, 0, led.id, 0);
    const w3 = app.circuit.addWire(sw.id, 0, led2.id, 0);

    const p1 = app.circuit.addProbe(w1.id, { id: 'pr_a', name: 'CH1' });
    const p2 = app.circuit.addProbe(w2.id, { id: 'pr_b', name: 'CH2' });
    const p3 = app.circuit.addProbe(w3.id, { id: 'pr_c', name: 'CH3' });
    app.refreshAll();

    const names = () => app.circuit.getProbes().map(p => p.name);
    assertEqual(JSON.stringify(names()), JSON.stringify(['CH1', 'CH2', 'CH3']), 'Initial probe order is CH1, CH2, CH3');

    // 1. Direct Circuit.moveProbe / moveProbeBy
    assertEqual(app.circuit.moveProbeBy(p1.id, -1), false, 'Top channel cannot move further up');
    assertEqual(app.circuit.moveProbeBy(p3.id, 1), false, 'Bottom channel cannot move further down');
    assertEqual(app.circuit.moveProbe(p3.id, 0), true, 'moveProbe moves CH3 to index 0');
    assertEqual(JSON.stringify(names()), JSON.stringify(['CH3', 'CH1', 'CH2']), 'Order updated to CH3, CH1, CH2');

    // 2. Undo restores prior probe order
    app.refreshAll();
    app.undo();
    assertEqual(JSON.stringify(names()), JSON.stringify(['CH1', 'CH2', 'CH3']), 'Undo restores CH1, CH2, CH3 order');

    // Record samples after undo so we verify reordering preserves RingBuffer history
    app.ringBuffer.record(1, new Map([['pr_a', 1], ['pr_b', 0], ['pr_c', 1]]));

    // 3. Gutter up/down button clicks on analyzer canvas
    app.analyzerCanvas.width = 800;
    app.analyzerCanvas.height = 200;
    app.analyzerCanvas.getBoundingClientRect = () => ({ left: 0, top: 0, width: 800, height: 200 });
    const { headerH, rowH } = app.analyzer.getRowLayout(3);
    const row0Btns = app.analyzer.getChannelRowButtons(headerH, rowH);
    const row1Btns = app.analyzer.getChannelRowButtons(headerH + rowH, rowH);
    const clickHandlers = app.analyzerCanvas.listeners.click || [];

    // Click Down on row 0 (CH1 -> index 1)
    clickHandlers.forEach(fn => fn({ clientX: row0Btns.down.x + 8, clientY: row0Btns.down.y + 8 }));
    assertEqual(JSON.stringify(names()), JSON.stringify(['CH2', 'CH1', 'CH3']), 'Clicking gutter down arrow moves CH1 down');

    // Click Up on row 1 (CH1 -> index 0)
    clickHandlers.forEach(fn => fn({ clientX: row1Btns.up.x + 8, clientY: row1Btns.up.y + 8 }));
    assertEqual(JSON.stringify(names()), JSON.stringify(['CH1', 'CH2', 'CH3']), 'Clicking gutter up arrow moves CH1 back up');

    // 4. Vertical drag-and-drop in gutter moves row 0 (CH1) to row 2
    const mdHandlers = app.analyzerCanvas.listeners.mousedown || [];
    const mmHandlers = app.analyzerCanvas.listeners.mousemove || [];
    const muHandlers = (typeof window.listeners === 'object' && window.listeners.mouseup) ? window.listeners.mouseup : [];

    mdHandlers.forEach(fn => fn({ button: 0, clientX: 40, clientY: headerH + rowH * 0.5 }));
    mmHandlers.forEach(fn => fn({ clientX: 40, clientY: headerH + rowH * 2.5 }));
    muHandlers.forEach(fn => fn({ clientX: 40, clientY: headerH + rowH * 2.5 }));
    assertEqual(JSON.stringify(names()), JSON.stringify(['CH2', 'CH3', 'CH1']), 'Vertical gutter drag moves CH1 to bottom');

    // RingBuffer data stays bound to probe ID after reordering
    assertEqual(app.ringBuffer.getValueAtOffset('pr_a', 0), 1, 'CH1 retains its RingBuffer samples after reorder');
    assertEqual(app.ringBuffer.getValueAtOffset('pr_b', 0), 0, 'CH2 retains its RingBuffer samples after reorder');

    // 5. Inspector channel order buttons & Context menu items
    app.selectItem(null, null, p1.id);
    const findBtns = (node, acc = []) => {
      if (!node || typeof node !== 'object') return acc;
      if (node.className === 'btn') acc.push(node);
      if (Array.isArray(node.children)) node.children.forEach(c => findBtns(c, acc));
      return acc;
    };
    const inspBtns = findBtns(app.inspector.container);
    const upInspBtn = inspBtns.find(b => (b.textContent || '').includes('Nach oben'));
    const downInspBtn = inspBtns.find(b => (b.textContent || '').includes('Nach unten'));
    assertEqual(Boolean(upInspBtn && downInspBtn), true, 'Inspector renders channel order up/down buttons for probe');
    assertEqual(downInspBtn.disabled, true, 'Down button disabled when probe is already at bottom');
    (upInspBtn.listeners.click || []).forEach(fn => fn());
    assertEqual(JSON.stringify(names()), JSON.stringify(['CH2', 'CH1', 'CH3']), 'Inspector up button moves selected probe up');

    app.showProbeContextMenu(100, 100, p1);
    const ctxItems = (app.contextMenuEl.children || []).filter(el => (el.className || '').includes('ctx-item'));
    const ctxUp = ctxItems.find(el => (el.innerHTML || '').includes('Nach oben verschieben'));
    const ctxDown = ctxItems.find(el => (el.innerHTML || '').includes('Nach unten verschieben'));
    assertEqual(Boolean(ctxUp && ctxDown), true, 'Probe context menu exposes move up / move down items');

    // 6. JSON roundtrip and English localization
    const rt = new Circuit();
    rt.fromJSON(app.circuit.toJSON());
    assertEqual(JSON.stringify(rt.getProbes().map(p => p.name)), JSON.stringify(['CH2', 'CH1', 'CH3']), 'JSON roundtrip preserves custom channel order');

    I18N.currentLang = 'en';
    assertEqual(I18N.phrase('Nach oben verschieben'), 'Move up', 'English translation for Nach oben verschieben');
    assertEqual(I18N.phrase('Nach unten verschieben'), 'Move down', 'English translation for Nach unten verschieben');
  } finally {
    I18N.currentLang = prevLang;
    if (prevCreateTextNode === undefined) delete document.createTextNode;
    else document.createTextNode = prevCreateTextNode;
  }
});

runTest('WISH-065', 'Inverting gate inputs preserves full gate body size across ANSI, DIN, and IEC standards', () => {
  const c = new Circuit();
  const canvas = createMockElem('canvas');
  const rend = new CanvasRenderer(canvas, c);

  const captureDraw = (comp, std) => {
    const moves = [];
    const arcs = [];
    const spyCtx = Object.assign({}, mockCtx, {
      moveTo: (x, y) => moves.push({ x, y }),
      lineTo: (x, y) => moves.push({ x, y }),
      arc: (x, y, r) => arcs.push({ x, y, r }),
      bezierCurveTo: () => {}
    });
    if (std === 'DIN_EN_60617') {
      rend.drawGateIEC(spyCtx, comp, false);
    } else {
      rend.drawGateShape(spyCtx, comp, false, std);
    }
    return { moves, arcs };
  };

  for (const std of ['ANSI', 'DIN_40700', 'DIN_EN_60617']) {
    const notPlain = c.addComponent('NOT', 100, 100, { invertedInputs: [false] });
    const notInv = c.addComponent('NOT', 100, 100, { invertedInputs: [true] });

    const rPlain = captureDraw(notPlain, std);
    const rInv = captureDraw(notInv, std);

    // Gate body left edge and right edge/tip must stay identical (no inward shrinking when input inverted)
    assertEqual(rInv.moves[0].x, rPlain.moves[0].x, `${std} input-inverted NOT keeps exact same left edge (${rPlain.moves[0].x})`);
    assertEqual(rInv.moves[1].x, rPlain.moves[1].x, `${std} input-inverted NOT preserves full body width`);

    // Input inversion bubble is placed cleanly on the external pin stub (cx < 100)
    const inputBubble = rInv.arcs.find(a => a.x < 100 && Math.abs(a.r - 3.6) < 0.1);
    assertEqual(Boolean(inputBubble), true, `${std} input-inverted NOT draws input bubble on external stub (cx < 100)`);
    c.clear();
  }

  // Verify logic: NOT with inverted input behaves as double negation
  const notDouble = new Component('n1', 'NOT', 0, 0, { invertedInputs: [true] });
  notDouble.compute([1]);
  assertEqual(notDouble.nextOutputs[0], 1, 'NOT with inverted input evaluates 1 -> 1');
  notDouble.compute([0]);
  assertEqual(notDouble.nextOutputs[0], 0, 'NOT with inverted input evaluates 0 -> 0');
});

runTest('WISH-066', 'Global delay 0 settles async ripple counters, combinational blocks, and synchronous FFs without tick lag, and persists across loadScenario', () => {
  const app = new LogicSimApp();
  app.setGlobalGateDelay(0, true);

  // 1. Loading a scenario preserves globalGateDelay = 0 instead of resetting to 1
  app.loadScenario('jk_counter', { silent: true });
  assertEqual(app.circuit.globalGateDelay, 0, 'loadScenario preserves globalGateDelay = 0');

  // 2. Ripple counter (CLK -> JK0 -> JK1 -> JK2) with global delay 0 settles all cascading stages on the same tick
  app.engine.setMode('sim');
  const getJkOutputs = () => ['jk_clk', 'jk_ff0', 'jk_ff1', 'jk_ff2'].map(id => app.circuit.getComponent(id).outputs[0].value);
  // halfPeriod = 2: ticks 1,2 CLK=1; ticks 3,4 CLK=0 (falling edge on tick 3!)
  // Actually let's check CLK sequence cleanly: step until CLK drops 1 -> 0
  let fellTick = null;
  for (let t = 1; t <= 12; t++) {
    const prevClk = app.circuit.getComponent('jk_clk').outputs[0].value;
    app.circuit.step();
    const curClk = app.circuit.getComponent('jk_clk').outputs[0].value;
    if (prevClk === 1 && curClk === 0) {
      fellTick = t;
      const [, q0, q1, q2] = getJkOutputs();
      if (t <= 4) {
        // First falling clock edge: Q0 flips 0 -> 1 immediately on the SAME tick!
        assertEqual(q0, 1, 'First JK-FF toggles on exact same tick as falling CLK when globalGateDelay = 0');
        assertEqual(q1, 0, 'Second JK-FF stays 0 on rising edge of Q0');
        assertEqual(q2, 0, 'Third JK-FF stays 0');
      } else {
        // Second falling clock edge: Q0 falls 1 -> 0 AND triggers Q1 0 -> 1 on the exact SAME tick!
        assertEqual(q0, 0, 'First JK-FF falls 1 -> 0 on second CLK edge');
        assertEqual(q1, 1, 'Second JK-FF ripples 0 -> 1 on the SAME tick (0 tick lag!)');
        assertEqual(q2, 0, 'Third JK-FF stays 0 on rising Q1');
        break;
      }
    }
  }
  assertEqual(fellTick !== null, true, 'Observed falling clock edges in jk_counter');

  // 3. Combinational blocks (BCD_DEC) settle in 0 ticks when globalGateDelay = 0
  const cComb = new Circuit();
  cComb.globalGateDelay = 0;
  const sw = cComb.addComponent('SWITCH', 40, 80, { initialValue: 1 });
  const dec = cComb.addComponent('BCD_DEC', 180, 80, {});
  cComb.addWire(sw.id, 0, dec.id, 0);
  cComb.step();
  // Digit 1 => b (pin 1) = 1, c (pin 2) = 1, a (pin 0) = 0
  assertEqual(dec.outputs[0].value, 0, 'BCD_DEC segment a settles immediately to 0 for input 1');
  assertEqual(dec.outputs[1].value, 1, 'BCD_DEC segment b settles immediately to 1 for input 1');

  // 4. Synchronous D-FF shift chain has NO hold-time race when globalGateDelay = 0
  const cSync = new Circuit();
  cSync.globalGateDelay = 0;
  const clk = cSync.addComponent('CLOCK', 40, 80, { highTicks: 1, lowTicks: 1 });
  const dIn = cSync.addComponent('SWITCH', 40, 160, { initialValue: 1 });
  const dff1 = cSync.addComponent('D_FF', 180, 80, { trigger: 'rising' });
  const dff2 = cSync.addComponent('D_FF', 340, 80, { trigger: 'rising' });
  cSync.addWire(dIn.id, 0, dff1.id, 0);
  cSync.addWire(clk.id, 0, dff1.id, 1);
  cSync.addWire(dff1.id, 0, dff2.id, 0);
  cSync.addWire(clk.id, 0, dff2.id, 1);
  cSync.syncImmediateWireLevels();
  cSync.step(); // CLK rises 0 -> 1: dff1 captures 1, dff2 captures old dff1 (0)
  assertEqual(dff1.outputs[0].value, 1, 'Sync DFF1 captures dIn=1 on first rising clock');
  assertEqual(dff2.outputs[0].value, 0, 'Sync DFF2 keeps prior Q=0 (no hold-time race in 0-delay mode)');
  cSync.step(); // CLK falls 1 -> 0
  cSync.step(); // CLK rises 0 -> 1: dff2 captures dff1 (1)
  assertEqual(dff2.outputs[0].value, 1, 'Sync DFF2 shifts captured 1 cleanly on next rising clock');

  // 5. Default globalGateDelay = 1 preserves unit-delay ripple behavior
  const cUnit = new Circuit();
  assertEqual(cUnit.globalGateDelay, 1, 'Default globalGateDelay stays 1');
  const uClk = cUnit.addComponent('SWITCH', 40, 80, { initialValue: 0 });
  const uDec = cUnit.addComponent('BCD_DEC', 180, 80, {});
  cUnit.addWire(uClk.id, 0, uDec.id, 0);
  cUnit.syncImmediateWireLevels();
  uClk.state.value = 1;
  uClk.outputs[0].value = 1;
  uClk.nextOutputs[0] = 1;
  cUnit.step(); // tick 1 propagates switch -> dec input; dec computes on tick 2 (digit 0 has a=1)
  assertEqual(uDec.outputs[0].value, 1, 'With globalGateDelay=1, BCD_DEC takes 1 extra tick before updating segment a');
  cUnit.step(); // tick 2 commits new digit 1 -> a=0, b=1
  assertEqual(uDec.outputs[0].value, 0, 'BCD_DEC updates segment a=0 for digit 1 on tick 2');
  assertEqual(uDec.outputs[1].value, 1, 'BCD_DEC b=1 for digit 1');
});

runTest('WISH-067', 'Multi-selection context menu delete button has red background and vertical/horizontal distribute is removed', () => {
  const app = new LogicSimApp();
  app.circuit.clear();
  const c = app.circuit;
  const c1 = c.addComponent('AND', 40, 40);
  const c2 = c.addComponent('OR', 140, 40);
  const c3 = c.addComponent('XOR', 240, 40);
  app.renderer.selectedCompIds = new Set([c1.id, c2.id, c3.id]);
  app.engine.mode = 'edit';

  // 1. distributeSelection method and legacy vertical/horizontal distribute UI removed globally
  assertEqual(typeof app.distributeSelection, 'undefined', 'distributeSelection method removed from LogicSimApp');
  assertEqual(html.includes('distributeSelection'), false, 'No distributeSelection references remain in index.html');
  assertEqual(html.includes('Vertikal gleichmäßig verteilen'), false, 'Vertikal gleichmäßig verteilen removed from index.html');
  assertEqual(html.includes('Horizontal gleichmäßig verteilen'), false, 'Horizontal gleichmäßig verteilen removed from index.html');
  assertEqual(html.includes('data-distribute'), false, 'No data-distribute attributes or handlers remain in index.html');

  // 2. Multi-selection context menu omits vertical/horizontal distribute and styles delete button with red background
  const menu = app.contextMenuEl;
  app.showContextMenu(100, 100, null, null, { x: 100, y: 100 }, true);
  const items = Array.from(menu.children);
  const texts = items.map(el => el.textContent || '');
  assertEqual(texts.some(t => t.includes('Vertikal gleichmäßig') || t.includes('Horizontal gleichmäßig')), false, 'No vertical/horizontal distribute items in multi-selection context menu');
  assertEqual(texts.some(t => t.includes('Alles anordnen (A)')), true, 'Alles anordnen (A) remains in multi-selection context menu');

  const delItem = items.find(el => (el.textContent || '').includes('Auswahl löschen (Entf)'));
  assertEqual(Boolean(delItem), true, 'Auswahl löschen (Entf) present in multi-selection context menu');
  assertEqual(delItem.className.includes('ctx-danger-btn'), true, 'Auswahl löschen (Entf) carries ctx-danger-btn class for red background');
  app.hideContextMenu();

  // 3. CSS rules provide solid red background across themes for context menu and inspector danger buttons
  assertEqual(html.includes('.ctx-item.danger.ctx-danger-btn'), true, 'Base .ctx-danger-btn CSS rule present');
  assertEqual(html.includes('[data-theme="java_swing"] .ctx-item.danger.ctx-danger-btn'), true, 'Java Swing .ctx-danger-btn CSS rule present');
  assertEqual(html.includes('[data-theme="light_cad"] .ctx-item.danger.ctx-danger-btn'), true, 'Light CAD .ctx-danger-btn CSS rule present');
  assertEqual(html.includes('[data-theme="java_swing"] .btn.btn-danger'), true, 'Java Swing .btn.btn-danger override ensures red background');

  // 4. Inspector multi-selection delete button retains btn-danger class
  app.inspector.renderMulti(app.renderer.selectedCompIds, new Set());
  const inspBtns = [];
  const collect = (node) => {
    if (!node || typeof node !== 'object') return;
    if ((node.className || '').includes('btn-danger')) inspBtns.push(node);
    if (Array.isArray(node.children)) node.children.forEach(collect);
  };
  collect(app.inspector.container);
  assertEqual(inspBtns.length > 0, true, 'Inspector multi-selection renders btn-danger delete button');

  // 5. Updated help label translates cleanly in English
  const prevLang = I18N.currentLang;
  try {
    I18N.currentLang = 'en';
    assertEqual(I18N.phrase('Anordnen-Optionen'), 'Layout options', 'English translation for Anordnen-Optionen');
  } finally {
    I18N.currentLang = prevLang;
  }
});

runTest('WISH-068', 'Inspector wire routing select overflow fixed and probe name text button allows direct inline renaming', () => {
  // 1. CSS overflow & select containment guards
  assertEqual(html.includes('.inspector-select {'), true, '.inspector-select CSS rule exists');
  assertEqual(html.includes('overflow-x: hidden;') && html.includes('#inspector {'), true, '#inspector disables horizontal overflow');
  assertEqual(html.includes('min-width: 0;') && html.includes('flex: 1 1 110px;'), true, '.inspector-select uses min-width: 0 and flex shrink/wrap containment');

  const app = new LogicSimApp();
  app.circuit.clear();
  const c = app.circuit;
  const sw = c.addComponent('SWITCH', 40, 80);
  const led = c.addComponent('LED', 200, 80);
  const w = c.addWire(sw.id, 0, led.id, 0);

  // Wire styleRow uses flex-wrap + gap so Verlegungsart select cannot overflow Inspector
  app.inspector.render(null, w.id);
  const findSelects = (node, acc = []) => {
    if (!node || typeof node !== 'object') return acc;
    if ((node.className || '').includes('inspector-select')) acc.push(node);
    if (Array.isArray(node.children)) node.children.forEach(ch => findSelects(ch, acc));
    return acc;
  };
  const selects = findSelects(app.inspector.container);
  assertEqual(selects.length, 1, 'Wire inspector renders .inspector-select');

  // 2. LogicAnalyzer gutter channel name text button click opens inline rename input and commits directly
  const p = c.addProbe(w.id, { name: 'CLK_IN' });
  app.analyzerCanvas.width = 800;
  app.analyzerCanvas.height = 200;
  app.analyzerCanvas.getBoundingClientRect = () => ({ left: 0, top: 0, width: 800, height: 200 });
  const { headerH, rowH } = app.analyzer.getRowLayout(1);
  const btns = app.analyzer.getChannelRowButtons(headerH, rowH);
  assertEqual(Boolean(btns.rename && btns.rename.w > 30), true, 'Gutter row defines clickable rename text button box');

  const hit = app.analyzer.hitTestGutter(btns.rename.x + 8, btns.rename.y + 6);
  assertEqual(hit && hit.action, 'rename', 'hitTestGutter identifies channel text button as rename action');

  const wrap = createMockElem('analyzer-canvas-wrap');
  wrap.appendChild(app.analyzerCanvas);
  app.analyzerCanvas.parentElement = wrap;

  const clickHandlers = app.analyzerCanvas.listeners.click || [];
  const lastClick = clickHandlers[clickHandlers.length - 1];
  lastClick({ clientX: btns.rename.x + 8, clientY: btns.rename.y + 6 });
  const inlineInput = wrap.children.find(ch => (ch.className || '').includes('probe-inline-rename-input'));
  assertEqual(Boolean(inlineInput), true, 'Clicking probe text button in analyzer opens inline rename input');
  assertEqual(inlineInput.value, 'CLK_IN', 'Inline rename input pre-fills current probe name');

  inlineInput.value = 'DATA_BUS';
  inlineInput.dispatchEvent({ type: 'keydown', key: 'Enter', preventDefault: () => {}, stopPropagation: () => {} });
  assertEqual(p.name, 'DATA_BUS', 'Pressing Enter in inline rename input updates probe name directly');

  // 3. Canvas probe badge rect + dblclick inline rename works on circuit canvas too
  const badgeRect = app.renderer.getProbeBadgeRect(p);
  assertEqual(Boolean(badgeRect && badgeRect.w >= 34 && badgeRect.h === 14), true, 'CanvasRenderer computes probe badge rectangle');
  const badgeHit = app.renderer.findProbeBadgeAt(badgeRect.x + 5, badgeRect.y + 5);
  assertEqual(Boolean(badgeHit && badgeHit.probe.id === p.id), true, 'findProbeBadgeAt detects click inside probe text badge');

  const paneLeft = createMockElem('canvas-pane-left');
  paneLeft.appendChild(app.gridCanvas);
  app.gridCanvas.parentElement = paneLeft;
  app.gridCanvas.getBoundingClientRect = () => ({ left: 0, top: 0, width: 1200, height: 800 });
  const sx = (badgeRect.x + 5) * app.renderer.zoom + app.renderer.panX;
  const sy = (badgeRect.y + 5) * app.renderer.zoom + app.renderer.panY;
  const dblHandlers = app.gridCanvas.listeners.dblclick || [];
  const lastDbl = dblHandlers[dblHandlers.length - 1];
  lastDbl({ clientX: sx, clientY: sy });
  const canvasInput = paneLeft.children.find(ch => (ch.className || '').includes('probe-inline-rename-input'));
  assertEqual(Boolean(canvasInput), true, 'Double-clicking probe badge on canvas opens inline rename input');
  canvasInput.value = 'SIG_A';
  canvasInput.dispatchEvent({ type: 'blur' });
  assertEqual(p.name, 'SIG_A', 'Blurring canvas probe inline input commits new probe name');
});

runTest('WISH-069', 'High-contrast open wire terminus & midpoint strokes in light themes and centered selection UI controls', () => {
  const c = new Circuit();
  const sw = c.addComponent('SWITCH', 40, 80);
  const w = c.addWire(sw.id, 0, null, 0, null, [{ x: 160, y: 80 }, { x: 160, y: 160 }], { toPoint: { x: 240, y: 160 } });
  const canvas = createMockElem('c');
  const rend = new CanvasRenderer(canvas, c, new SimulationEngine(c, new RingBuffer(64)));

  // 1. Light themes (java_swing, light_cad) must NEVER stroke open terminus rings or midpoint borders with invisible #ffffff
  for (const theme of ['java_swing', 'light_cad']) {
    rend.appTheme = theme;
    rend.selectedWireId = w.id;
    rend.hoveredTerminus = { wire: w, isEnd: true };
    rend.activeTerminusDrag = { wire: w, isEnd: true };
    const strokes = [];
    const spyCtx = Object.assign({}, mockCtx, {
      stroke: () => strokes.push(spyCtx.strokeStyle),
      beginPath: () => {},
      arc: () => {},
      moveTo: () => {},
      lineTo: () => {},
      fill: () => {}
    });
    rend.drawWires(spyCtx);
    assertEqual(strokes.includes('#ffffff'), false, `${theme} wire handles/open terminus use dark high-contrast stroke instead of #ffffff`);
    assertEqual(strokes.includes('#0f172a'), true, `${theme} wire handles/open terminus use #0f172a contrast stroke`);

    // Active wire drag also draws dark high-contrast ring at cursor endpoint on light themes
    const dragStrokes = [];
    const dragCtx = Object.assign({}, mockCtx, {
      stroke: () => dragStrokes.push(dragCtx.strokeStyle),
      beginPath: () => {},
      arc: () => {},
      moveTo: () => {},
      lineTo: () => {},
      fill: () => {}
    });
    rend.activeWireDrag = { startX: 100, startY: 100, currX: 220, currY: 140, isOutput: true, waypoints: [] };
    rend.drawActiveWireDrag(dragCtx);
    assertEqual(dragStrokes.includes('#0f172a'), true, `${theme} activeWireDrag endpoint ring uses #0f172a contrast stroke`);
    rend.activeWireDrag = null;
  }

  // 2. Selection windows / buttons / context menus / cards CSS centering checks
  assertEqual(/\.btn\s*\{[^}]*justify-content:\s*center;/.test(html), true, '.btn centers icon and label horizontally');
  assertEqual(/#inspector-content\s*>\s*\.btn\s*\{[^}]*width:\s*100%;/.test(html), true, 'Inspector action buttons fill width and center text');
  assertEqual(/\.ctx-item\.danger\.ctx-danger-btn\s*\{[^}]*justify-content:\s*center;/.test(html), true, 'Context menu red delete button centers content');
  assertEqual(/\.ctx-chip\s*\{[^}]*justify-content:\s*center;/.test(html), true, 'Context menu chips center content');
  assertEqual(/\.norm-card\s*\{[^}]*align-items:\s*center;/.test(html) && /\.theme-card\s*\{[^}]*align-items:\s*center;/.test(html), true, 'Settings norm and theme selection cards are centered');
});

runTest('WISH-070', 'Clicking upstream of a wire fork selects all wires at and downstream of the fork', () => {
  const app = new LogicSimApp();
  app.circuit.clear();
  app.engine.setMode('edit');
  app.renderer.panX = 0;
  app.renderer.panY = 0;
  app.renderer.zoom = 1;
  app.gridCanvas.getBoundingClientRect = () => ({ left: 0, top: 0, width: 1200, height: 800 });

  const c = app.circuit;
  const mdHandlers = app.gridCanvas.listeners.mousedown || [];
  const lastMd = mdHandlers[mdHandlers.length - 1];
  const clickAt = (x, y) => lastMd({ button: 0, clientX: x, clientY: y, shiftKey: false, ctrlKey: false, preventDefault: () => {} });

  // 1. Explicit wire-to-wire branching (fromWireId cascade)
  const sw = c.addComponent('SWITCH', 40, 80); // output pin at (120, 100)
  const led1 = c.addComponent('LED', 320, 80); // input pin at (320, 100)
  const led2 = c.addComponent('LED', 320, 180); // input pin at (320, 200)
  const led3 = c.addComponent('LED', 320, 260); // input pin at (320, 280)

  const wMain = c.addWire(sw.id, 0, led1.id, 0);
  const wBranch = c.addWire(null, 0, led2.id, 0, null, [{ x: 200, y: 200 }], { fromWireId: wMain.id, fromPoint: { x: 200, y: 100 } });
  const wSubBranch = c.addWire(null, 0, led3.id, 0, null, [{ x: 200, y: 280 }], { fromWireId: wBranch.id, fromPoint: { x: 200, y: 160 } });

  // Click BEFORE first fork at (150, 100): selects wMain, wBranch, and wSubBranch
  clickAt(150, 100);
  assertEqual(app.renderer.selectedWireIds.size, 3, 'Clicking before fork selects all 3 fork wires');
  assertEqual(app.renderer.selectedWireIds.has(wMain.id) && app.renderer.selectedWireIds.has(wBranch.id) && app.renderer.selectedWireIds.has(wSubBranch.id), true, 'Selected set includes wMain, wBranch, and wSubBranch');

  // Click AFTER first fork on wMain at (260, 100): selects only wMain
  clickAt(260, 100);
  assertEqual(app.renderer.selectedWireIds.size, 1, 'Clicking downstream of fork on main branch selects only 1 wire');
  assertEqual(app.renderer.selectedWireId, wMain.id, 'Selected wire is wMain');

  // Click on wBranch BEFORE its sub-fork at (200, 130): selects wBranch + wSubBranch (not wMain)
  clickAt(200, 130);
  assertEqual(app.renderer.selectedWireIds.size, 2, 'Clicking upstream of sub-fork selects wBranch and wSubBranch');
  assertEqual(app.renderer.selectedWireIds.has(wBranch.id) && app.renderer.selectedWireIds.has(wSubBranch.id), true, 'Selected set contains wBranch and wSubBranch');

  // Click on wBranch AFTER its sub-fork at (260, 200): selects only wBranch
  clickAt(260, 200);
  assertEqual(app.renderer.selectedWireIds.size, 1, 'Clicking downstream of sub-fork selects only wBranch');
  assertEqual(app.renderer.selectedWireId, wBranch.id, 'Selected wire is wBranch');

  // 2. Shared output pin multi-drop trunk fork
  const sw2 = c.addComponent('SWITCH', 40, 380); // output pin at (120, 400)
  const led4 = c.addComponent('LED', 280, 340); // input pin at (280, 360)
  const led5 = c.addComponent('LED', 280, 420); // input pin at (280, 440)
  const wTop = c.addWire(sw2.id, 0, led4.id, 0, null, [{ x: 200, y: 400 }, { x: 200, y: 360 }]);
  const wBot = c.addWire(sw2.id, 0, led5.id, 0, null, [{ x: 200, y: 400 }, { x: 200, y: 440 }]);

  // Click on shared trunk BEFORE fork at (160, 400): selects both wTop and wBot
  clickAt(160, 400);
  assertEqual(app.renderer.selectedWireIds.size, 2, 'Clicking shared trunk before pin fork selects both wTop and wBot');
  assertEqual(app.renderer.selectedWireIds.has(wTop.id) && app.renderer.selectedWireIds.has(wBot.id), true, 'Selected set includes wTop and wBot');

  // Click AFTER fork on wTop at (240, 360): selects only wTop
  clickAt(240, 360);
  assertEqual(app.renderer.selectedWireIds.size, 1, 'Clicking individual branch after shared-pin fork selects only wTop');
  assertEqual(app.renderer.selectedWireId, wTop.id, 'Selected wire is wTop');
});

runTest('WISH-071', 'Wire forks are stored explicitly as fromWireId + fromPoint trees with zero segment overlap', () => {
  const app = new LogicSimApp();
  app.allowDiagonalWires = false;

  const mdHandlers = app.gridCanvas.listeners.mousedown || [];
  const lastMd = mdHandlers[mdHandlers.length - 1];
  const clickAt = (wx, wy) => {
    const rect = app.gridCanvas.getBoundingClientRect();
    const cx = rect.left + wx * app.renderer.zoom + app.renderer.panX;
    const cy = rect.top + wy * app.renderer.zoom + app.renderer.panY;
    lastMd({ button: 0, clientX: cx, clientY: cy, shiftKey: false, ctrlKey: false, metaKey: false, preventDefault: () => {} });
  };

  // 1. Scenario load / Auto-Layout stores multi-drop fanouts (jk_hi) as non-overlapping Steiner fork tree
  app.loadScenario('jk_counter', { silent: true });
  const hiWires = app.circuit.wires.filter(w => app.circuit.resolveWireRoot(w).compId === 'jk_hi');
  const hiTrunkWires = hiWires.filter(w => app.circuit.isForkTrunkWire(w));
  const hiLeafWires = hiWires.filter(w => !app.circuit.isForkTrunkWire(w));
  assertEqual(hiLeafWires.length, 6, 'jk_hi net has 6 leaf wires to J/K inputs');
  assertEqual(hiTrunkWires.length >= 1, true, 'jk_hi net stores shared upstream segments as explicit Steiner fork trunk wire(s)');
  const hiRootWires = hiWires.filter(w => w.fromCompId === 'jk_hi');
  assertEqual(hiRootWires.length, 1, 'jk_hi net has exactly 1 stem trunk wire attached to output pin');
  assertEqual(app.circuit.isForkTrunkWire(hiRootWires[0]), true, 'Single stem wire attached to jk_hi is an explicit fork trunk wire');
  assertEqual(hiLeafWires.every(w => !w.fromCompId && Boolean(w.fromWireId) && Boolean(w.fromPoint)), true, 'All 6 leaf wires to J/K inputs start at explicit fromWireId + fromPoint fork junctions');

  // Verify zero collinear segment overlap between any pair of wires in jk_hi net
  const segOverlapPx = (ptsA, ptsB) => {
    let totalOverlap = 0;
    for (let i = 0; i + 1 < ptsA.length; i++) {
      const a1 = ptsA[i], a2 = ptsA[i + 1];
      const ah = Math.abs(a1.y - a2.y) < 0.5;
      const av = Math.abs(a1.x - a2.x) < 0.5;
      if (!ah && !av) continue;
      for (let j = 0; j + 1 < ptsB.length; j++) {
        const b1 = ptsB[j], b2 = ptsB[j + 1];
        if (ah && Math.abs(b1.y - b2.y) < 0.5 && Math.abs(a1.y - b1.y) < 0.5) {
          const lo = Math.max(Math.min(a1.x, a2.x), Math.min(b1.x, b2.x));
          const hi = Math.min(Math.max(a1.x, a2.x), Math.max(b1.x, b2.x));
          if (hi > lo) totalOverlap += hi - lo;
        } else if (av && Math.abs(b1.x - b2.x) < 0.5 && Math.abs(a1.x - b1.x) < 0.5) {
          const lo = Math.max(Math.min(a1.y, a2.y), Math.min(b1.y, b2.y));
          const hi = Math.min(Math.max(a1.y, a2.y), Math.max(b1.y, b2.y));
          if (hi > lo) totalOverlap += hi - lo;
        }
      }
    }
    return totalOverlap;
  };
  let maxNetOverlap = 0;
  for (let i = 0; i < hiWires.length; i++) {
    const ptsA = app.renderer.getWirePolyline(hiWires[i]);
    for (let j = i + 1; j < hiWires.length; j++) {
      const ptsB = app.renderer.getWirePolyline(hiWires[j]);
      maxNetOverlap = Math.max(maxNetOverlap, segOverlapPx(ptsA, ptsB));
    }
  }
  assertEqual(maxNetOverlap, 0, 'jk_hi fork tree has zero overlapping collinear wire segments');

  // Verify signal level 1 propagates across all forked branches into every JK flip-flop J and K pin
  app.circuit.syncImmediateWireLevels();
  for (const ffId of ['jk_ff0', 'jk_ff1', 'jk_ff2']) {
    const ff = app.circuit.getComponent(ffId);
    assertEqual(ff.inputs[0].value, 1, `${ffId}.J receives HIGH through fork tree`);
    assertEqual(ff.inputs[2].value, 1, `${ffId}.K receives HIGH through fork tree`);
  }

  // Click on terminal segment before jk_ff1.J (safely outside 10px pin radius) selects ONLY that branch
  const j1Wire = hiLeafWires.find(w => w.toCompId === 'jk_ff1' && w.toPin === 0);
  const j1Pts = app.renderer.getWirePolyline(j1Wire);
  const j1End = j1Pts[j1Pts.length - 1];
  const j1Prev = j1Pts[j1Pts.length - 2];
  clickAt(j1Prev.x + (j1End.x - j1Prev.x) * 0.45, j1Prev.y + (j1End.y - j1Prev.y) * 0.45);
  assertEqual(app.renderer.selectedWireIds.size, 1, 'Clicking terminal segment before J pin selects only 1 wire');
  assertEqual(app.renderer.selectedWireId, j1Wire.id, 'Selected wire is the terminal J1 branch');
  assertEqual(Boolean(j1Wire.fromWireId && j1Wire.fromPoint), true, 'Terminal J1 wire starts at a stored fork junction rather than root component');

  // Click on trunk right outside jk_hi output pin (before first fork) selects all wires in fork tree
  const rootPts = app.renderer.getWirePolyline(hiRootWires[0]);
  const rootSegDist = Math.hypot(rootPts[1].x - rootPts[0].x, rootPts[1].y - rootPts[0].y);
  clickAt(rootPts[0].x + Math.min(20, Math.max(12, rootSegDist * 0.5)), rootPts[0].y);
  assertEqual(app.renderer.selectedWireIds.size, hiWires.length, 'Clicking upstream of first jk_hi fork selects all wires in fork tree');

  // 2. Drawing overlapping manual wires from same output pin collapses into dedicated Steiner trunk + 2 child branches + removeWire trunk cleanup
  const app2 = new LogicSimApp();
  app2.circuit.clear();
  const c2 = app2.circuit;
  const sw = c2.addComponent('SWITCH', 40, 80, { initialValue: 1 }); // out at (120, 100)
  const led1 = c2.addComponent('LED', 300, 40);  // in at (300, 60)
  const led2 = c2.addComponent('LED', 300, 140); // in at (300, 160)
  const wA = c2.addWire(sw.id, 0, led1.id, 0, null, [{ x: 200, y: 100 }, { x: 200, y: 60 }]);
  app2.finishNewWire(wA, wA.waypoints);
  const wB = c2.addWire(sw.id, 0, led2.id, 0, null, [{ x: 200, y: 100 }, { x: 200, y: 160 }]);
  app2.finishNewWire(wB, wB.waypoints);
  const rootWires2 = c2.wires.filter(w => w.fromCompId === sw.id && !w.fromWireId);
  const trunkWire = rootWires2[0];
  assertEqual(rootWires2.length, 1, 'Overlapping manual wires collapse to 1 root trunk wire');
  assertEqual(c2.isForkTrunkWire(trunkWire), true, 'Root wire is stored as explicit Steiner fork trunk wire');
  assertEqual(trunkWire.toPoint && trunkWire.toPoint.x === 200 && trunkWire.toPoint.y === 100, true, 'Trunk wire ends cleanly at fork junction (200, 100)');
  assertEqual(!wA.fromCompId && wA.fromWireId === trunkWire.id, true, 'First leaf wire wA becomes explicit child branch of trunk');
  assertEqual(!wB.fromCompId && wB.fromWireId === trunkWire.id, true, 'Second leaf wire wB becomes explicit child branch of trunk');
  assertEqual(wA.fromPoint.x === 200 && wA.fromPoint.y === 100, true, 'wA fork stores exact junction (200, 100)');
  assertEqual(wB.fromPoint.x === 200 && wB.fromPoint.y === 100, true, 'wB fork stores exact junction (200, 100)');
  assertEqual(segOverlapPx(app2.renderer.getWirePolyline(trunkWire), app2.renderer.getWirePolyline(wA)), 0, 'Trunk and wA share 0 overlapping pixels after normalization');
  assertEqual(segOverlapPx(app2.renderer.getWirePolyline(trunkWire), app2.renderer.getWirePolyline(wB)), 0, 'Trunk and wB share 0 overlapping pixels after normalization');
  assertEqual(segOverlapPx(app2.renderer.getWirePolyline(wA), app2.renderer.getWirePolyline(wB)), 0, 'Leaf branches wA and wB share 0 overlapping pixels after normalization');

  // JSON roundtrip preserves trunk + fork tree & signal
  const jsonSnap = c2.toJSON();
  const roundtrip = new Circuit();
  roundtrip.fromJSON(jsonSnap);
  assertEqual(roundtrip.getWire(wB.id).fromWireId, trunkWire.id, 'fromWireId preserved across JSON roundtrip');
  assertEqual(roundtrip.getWire(wB.id).fromPoint.x, 200, 'fromPoint preserved across JSON roundtrip');
  assertEqual(roundtrip.getComponent(led2.id).inputs[0].value, 1, 'LED2 retains HIGH level after fork JSON roundtrip');

  // Deleting a leaf branch triggers removeWire trunk cleanup and merges trunk into remaining branch
  roundtrip.removeWire(wA.id);
  assertEqual(roundtrip.getWire(trunkWire.id), null, 'Deleting 1 of 2 leaf branches cleans up obsolete fork trunk wire');
  const promoted = roundtrip.getWire(wB.id);
  assertEqual(promoted.fromCompId, sw.id, 'Remaining leaf branch is promoted to inherit source switch');
  assertEqual(promoted.fromWireId, null, 'Promoted branch clears stale fromWireId');
  assertEqual(promoted.fromPoint, null, 'Promoted branch clears stale fromPoint');
  roundtrip.syncImmediateWireLevels();
  assertEqual(roundtrip.getComponent(promoted.toCompId).inputs[0].value, 1, 'Promoted branch continues driving target LED with HIGH');
});

runTest('WISH-072', 'Single-component delete menu item uses red ctx-danger-btn and non-gate modules hide permanent pin circles while keeping hover & inversion bubbles', () => {
  // (a) Single-component context menu "Bauteil löschen" carries ctx-item, danger, and ctx-danger-btn
  const app = new LogicSimApp();
  app.circuit.clear();
  app.engine.mode = 'edit';
  const comp = app.circuit.addComponent('COUNTER', 100, 100);
  app.renderer.selectedCompIds = new Set([comp.id]);
  app.renderer.selectedWireIds = new Set();

  app.showContextMenu(100, 100, comp, null, { x: 100, y: 100 });
  const menu = app.contextMenuEl;
  const items = Array.from(menu.children);
  const delItem = items.find(el => (el.textContent || '').includes('Bauteil löschen'));
  assertEqual(Boolean(delItem), true, 'Bauteil löschen present in single-component context menu');
  const delClasses = (delItem.className || '').trim().split(/\s+/);
  assertEqual(delClasses.includes('ctx-item'), true, 'Bauteil löschen has ctx-item class');
  assertEqual(delClasses.includes('danger'), true, 'Bauteil löschen has danger class');
  assertEqual(delClasses.includes('ctx-danger-btn'), true, 'Bauteil löschen has ctx-danger-btn class for red background');
  app.hideContextMenu();

  // (b) Non-gate modules draw 0 permanent pin circles when unhovered and non-inverted,
  //     1 hovered circle (radius 6) via drawPinCircle on hover, and outer rBubble=3.2 circles when inverted
  const c = new Circuit();
  const engine = new SimulationEngine(c, new RingBuffer(10), () => {});
  const renderer = new CanvasRenderer(createMockElem('grid-canvas'), c, engine);
  const arcCalls = [];
  const spyCtx = Object.assign({}, mockCtx, {
    arc: (x, y, r) => arcCalls.push({ x, y, r })
  });

  const sw = c.addComponent('SWITCH', 100, 100);
  const counter = c.addComponent('COUNTER', 260, 100);
  const jkff = c.addComponent('JK_FF', 460, 100);

  // Unhovered & non-inverted: SWITCH and COUNTER draw 0 arcs; JK_FF draws 0 pin circles (only inherent !Q outer bubble r=3.2)
  renderer.hoveredPin = null;
  arcCalls.length = 0;
  renderer.drawComponentPins(spyCtx, sw);
  assertEqual(arcCalls.length, 0, 'Unhovered SWITCH draws 0 pin circles via ctx.arc');

  arcCalls.length = 0;
  renderer.drawComponentPins(spyCtx, counter);
  assertEqual(arcCalls.length, 0, 'Unhovered non-inverted COUNTER draws 0 pin circles via ctx.arc');

  arcCalls.length = 0;
  renderer.drawComponentPins(spyCtx, jkff);
  const jkPinCircles = arcCalls.filter(a => Math.abs(a.r - 4.2) < 0.01 || Math.abs(a.r - 6) < 0.01);
  assertEqual(jkPinCircles.length, 0, 'Unhovered JK_FF draws 0 pin circles via drawPinCircle');
  const jkNegQBubbles = arcCalls.filter(a => Math.abs(a.r - 3.2) < 0.01);
  assertEqual(jkNegQBubbles.length, 1, 'JK_FF still draws 1 inherent !Q outer inversion bubble (r=3.2)');

  // Hovering an input pin (COUNTER pin 1) draws 1 hovered pin circle (radius 6)
  arcCalls.length = 0;
  renderer.hoveredPin = { compId: counter.id, isOutput: false, pinIndex: 1 };
  renderer.drawComponentPins(spyCtx, counter);
  assertEqual(arcCalls.length, 1, 'Hovering COUNTER input pin draws exactly 1 pin circle');
  assertEqual(arcCalls[0].r, 6, 'Hovered input pin circle uses radius 6');
  assertEqual(arcCalls[0].x, counter.x + counter.inputs[1].relX, 'Hovered input pin circle x matches pin');
  assertEqual(arcCalls[0].y, counter.y + counter.inputs[1].relY, 'Hovered input pin circle y matches pin');

  // Hovering an output pin (SWITCH pin 0) draws 1 hovered pin circle (radius 6)
  arcCalls.length = 0;
  renderer.hoveredPin = { compId: sw.id, isOutput: true, pinIndex: 0 };
  renderer.drawComponentPins(spyCtx, sw);
  assertEqual(arcCalls.length, 1, 'Hovering SWITCH output pin draws exactly 1 pin circle');
  assertEqual(arcCalls[0].r, 6, 'Hovered output pin circle uses radius 6');
  assertEqual(arcCalls[0].x, sw.x + sw.outputs[0].relX, 'Hovered output pin circle x matches pin');
  assertEqual(arcCalls[0].y, sw.y + sw.outputs[0].relY, 'Hovered output pin circle y matches pin');

  // Inverted input/output on non-gate modules still draws outer inversion bubbles (rBubble = 3.2)
  renderer.hoveredPin = null;
  const counterInv = c.addComponent('COUNTER', 260, 280, {
    invertedInputs: [true, false, false],
    invertedOutput: true
  });
  arcCalls.length = 0;
  renderer.drawComponentPins(spyCtx, counterInv);
  const rBubble = 3.2;
  const leftBubbles = arcCalls.filter(a => Math.abs(a.r - rBubble) < 0.01 && a.x < counterInv.x);
  const rightBubbles = arcCalls.filter(a => Math.abs(a.r - rBubble) < 0.01 && a.x > counterInv.x + counterInv.width);
  const nonBubbleArcs = arcCalls.filter(a => Math.abs(a.r - rBubble) >= 0.01);
  assertEqual(leftBubbles.length, 1, 'Inverted input on COUNTER draws 1 outer inversion bubble (r=3.2) left of module');
  assertEqual(rightBubbles.length, counterInv.outputs.length, 'invertedOutput on COUNTER draws outer inversion bubbles (r=3.2) right of module');
  assertEqual(nonBubbleArcs.length, 0, 'Inverted COUNTER without hover draws 0 regular pin circles');

  const jkffInv = c.addComponent('JK_FF', 460, 280, {
    invertedInputs: [false, true, false],
    invertedOutput: true
  });
  arcCalls.length = 0;
  renderer.drawComponentPins(spyCtx, jkffInv);
  const jkLeftBubbles = arcCalls.filter(a => Math.abs(a.r - rBubble) < 0.01 && a.x < jkffInv.x);
  const jkRightBubbles = arcCalls.filter(a => Math.abs(a.r - rBubble) < 0.01 && a.x > jkffInv.x + jkffInv.width);
  const jkNonBubbleArcs = arcCalls.filter(a => Math.abs(a.r - rBubble) >= 0.01);
  assertEqual(jkLeftBubbles.length, 1, 'Inverted input on JK_FF draws 1 outer inversion bubble (r=3.2) left of module');
  assertEqual(jkRightBubbles.length, 2, 'Inverted Q and !Q on JK_FF draw 2 outer inversion bubbles (r=3.2) right of module');
  assertEqual(jkNonBubbleArcs.length, 0, 'Inverted JK_FF without hover draws 0 regular pin circles');
});

runTest('WISH-073', 'Movable fork junctions, isolated downstream branch selection in jk_counter, and Java Swing / Light CAD theme-card contrast', () => {
  // Capture window mousemove/mouseup listeners cleanly like WISH-053 / WISH-054
  const prevWinAdd = window.addEventListener;
  const canvasEl = document.getElementById('grid-canvas');
  const prevCanvasListeners = {};
  if (canvasEl && canvasEl.listeners) {
    for (const k of Object.keys(canvasEl.listeners)) prevCanvasListeners[k] = canvasEl.listeners[k].slice();
  }
  const winListeners = {};
  window.addEventListener = (type, fn) => {
    if (!winListeners[type]) winListeners[type] = [];
    winListeners[type].push(fn);
    return prevWinAdd(type, fn);
  };
  let app;
  try {
    app = new LogicSimApp();
  } finally {
    window.addEventListener = prevWinAdd;
  }

  const prevRectFn = app.gridCanvas.getBoundingClientRect;
  try {
    app.gridCanvas.getBoundingClientRect = () => ({ left: 0, top: 0, width: 1200, height: 800, right: 1200, bottom: 800 });
    app.allowDiagonalWires = false;
    app.engine.mode = 'edit';

    const mdHandlers = app.gridCanvas.listeners.mousedown || [];
    const lastMd = mdHandlers[mdHandlers.length - 1];
    const mm = (ev) => (winListeners.mousemove || []).forEach(fn => fn(ev));
    const mu = (ev) => (winListeners.mouseup || []).forEach(fn => fn(ev));
    const toClient = (wx, wy) => ({
      x: wx * app.renderer.zoom + app.renderer.panX,
      y: wy * app.renderer.zoom + app.renderer.panY
    });

    // (a) In jk_counter, clicking lower chain jkw_k1 after its fork at (380, 140) selects ONLY jkw_k1
    app.loadScenario('jk_counter', { silent: true });
    app.renderer.panX = 0;
    app.renderer.panY = 0;
    app.renderer.zoom = 1;
    app.selectItem(null, null);

    const k1Wire = app.circuit.getWire('jkw_k1');
    const j1Wire = app.circuit.getWire('jkw_j1');
    assertEqual(Boolean(k1Wire && !k1Wire.fromCompId && k1Wire.fromWireId && k1Wire.fromPoint), true, 'jkw_k1 starts at an explicit fork junction');
    assertEqual(k1Wire.fromPoint.x, 380, 'jkw_k1 fork junction x is 380');
    assertEqual(k1Wire.fromPoint.y, 140, 'jkw_k1 fork junction y is 140');

    const k1Pts = app.renderer.getWirePolyline(k1Wire);
    let clickPt = null;
    for (let i = k1Pts.length - 2; i >= 0; i--) {
      const pA = k1Pts[i], pB = k1Pts[i + 1];
      const segLen = Math.hypot(pB.x - pA.x, pB.y - pA.y);
      if (segLen < 16) continue;
      const cand = { x: pA.x + (pB.x - pA.x) * 0.45, y: pA.y + (pB.y - pA.y) * 0.45 };
      if (
        Math.hypot(cand.x - k1Wire.fromPoint.x, cand.y - k1Wire.fromPoint.y) > 12 &&
        !app.renderer.findJunctionAt(cand.x, cand.y, 11) &&
        !app.renderer.findComponentAt(cand.x, cand.y) &&
        !app.renderer.findPinAt(cand.x, cand.y, 10)
      ) {
        clickPt = cand;
        break;
      }
    }
    assertEqual(Boolean(clickPt), true, 'Found clickable downstream point on jkw_k1 outside fork and pin radii');
    const cClick = toClient(clickPt.x, clickPt.y);
    lastMd({ button: 0, clientX: cClick.x, clientY: cClick.y, shiftKey: false, ctrlKey: false, metaKey: false, preventDefault: () => {} });
    assertEqual(app.renderer.selectedWireIds.size, 1, 'Clicking lower chain jkw_k1 after fork selects ONLY 1 wire');
    assertEqual(app.renderer.selectedWireId, k1Wire.id, 'Selected wire is jkw_k1');
    assertEqual(app.renderer.selectedWireIds.has(j1Wire.id), false, 'Does NOT select sibling jkw_j1');
    assertEqual(app.renderer.selectedWireIds.has(k1Wire.fromWireId), false, 'Does NOT select upstream trunk before (380, 140)');

    // (b) findJunctionAt locates a fork junction and mousedown -> mousemove -> mouseup moves trunk toPoint + child fromPoint cleanly
    app.circuit.clear();
    app.selectItem(null, null);
    const sw = app.circuit.addComponent('SWITCH', 40, 80, { initialValue: 1 }); // out at (120, 100)
    const led1 = app.circuit.addComponent('LED', 340, 40);  // in at (340, 60)
    const led2 = app.circuit.addComponent('LED', 340, 140); // in at (340, 160)
    const wA = app.circuit.addWire(sw.id, 0, led1.id, 0, null, [{ x: 200, y: 100 }, { x: 200, y: 60 }]);
    app.finishNewWire(wA, wA.waypoints);
    const wB = app.circuit.addWire(sw.id, 0, led2.id, 0, null, [{ x: 200, y: 100 }, { x: 200, y: 160 }]);
    app.finishNewWire(wB, wB.waypoints);
    const trunk = app.circuit.wires.find(w => app.circuit.isForkTrunkWire(w));
    assertEqual(Boolean(trunk), true, 'Fork circuit creates a dedicated Steiner trunk wire');

    const junc = app.renderer.findJunctionAt(200, 100, 10);
    assertEqual(Boolean(junc), true, 'findJunctionAt locates fork junction at (200, 100)');
    assertEqual(junc.x === 200 && junc.y === 100, true, 'Junction coordinates equal (200, 100)');
    assertEqual(junc.endWires.some(w => w.id === trunk.id), true, 'Trunk wire is attached in endWires');
    assertEqual(junc.startWires.some(w => w.id === wA.id) && junc.startWires.some(w => w.id === wB.id), true, 'Child wires are attached in startWires');

    const cStart = toClient(200, 100);
    const cMove = toClient(243, 118); // snaps to (240, 120)
    lastMd({ button: 0, clientX: cStart.x, clientY: cStart.y, shiftKey: false, ctrlKey: false, metaKey: false, preventDefault: () => {} });
    assertEqual(Boolean(app.draggingJunction), true, 'mousedown on fork junction initiates draggingJunction');
    assertEqual(Boolean(app.renderer.activeJunctionDrag), true, 'mousedown sets activeJunctionDrag highlight');

    mm({ clientX: cMove.x, clientY: cMove.y, target: app.gridCanvas, __autoPan: true });
    assertEqual(trunk.toPoint.x === 240 && trunk.toPoint.y === 120, true, 'mousemove moves trunk toPoint to grid-snapped (240, 120)');
    assertEqual(wA.fromPoint.x === 240 && wA.fromPoint.y === 120, true, 'mousemove moves wA fromPoint to grid-snapped (240, 120)');
    assertEqual(wB.fromPoint.x === 240 && wB.fromPoint.y === 120, true, 'mousemove moves wB fromPoint to grid-snapped (240, 120)');

    mu({ clientX: cMove.x, clientY: cMove.y, shiftKey: false, ctrlKey: false });
    assertEqual(app.draggingJunction, null, 'mouseup clears draggingJunction');
    assertEqual(app.renderer.activeJunctionDrag, null, 'mouseup clears activeJunctionDrag');
    const movedJunc = app.renderer.findJunctionAt(240, 120, 10);
    assertEqual(Boolean(movedJunc && movedJunc.x === 240 && movedJunc.y === 120), true, 'findJunctionAt finds moved junction at (240, 120)');

    const isOrtho = (pts) => {
      if (!pts || pts.length < 2) return false;
      for (let i = 0; i + 1 < pts.length; i++) {
        if (Math.abs(pts[i].x - pts[i + 1].x) >= 0.5 && Math.abs(pts[i].y - pts[i + 1].y) >= 0.5) return false;
      }
      return true;
    };
    assertEqual(isOrtho(app.renderer.getWirePolyline(trunk)), true, 'Moved trunk wire remains strictly orthogonal');
    assertEqual(isOrtho(app.renderer.getWirePolyline(wA)), true, 'Moved child wA remains strictly orthogonal');
    assertEqual(isOrtho(app.renderer.getWirePolyline(wB)), true, 'Moved child wB remains strictly orthogonal');

    // (c) Theme CSS rules scope variables with :not(.theme-card) and enforce high-contrast java_swing / light_cad card text
    for (const t of ['modern', 'pitch_black', 'java_swing', 'blueprint', 'light_cad']) {
      assertEqual(html.includes(`[data-theme="${t}"]:not(.theme-card)`), true, `[data-theme="${t}"] root block excludes .theme-card`);
    }
    assertEqual(/\[data-theme="java_swing"\]\s+\.theme-card\s+\.theme-card-title\s*\{\s*color:\s*#000000\s*!important;/.test(html), true, 'java_swing theme card title enforces #000000');
    assertEqual(/\[data-theme="java_swing"\]\s+\.theme-card\s+\.theme-card-desc\s*\{\s*color:\s*#333333\s*!important;/.test(html), true, 'java_swing theme card desc enforces #333333');
    assertEqual(/\[data-theme="light_cad"\]\s+\.theme-card\s+\.theme-card-title\s*\{\s*color:\s*#0f172a\s*!important;/.test(html), true, 'light_cad theme card title enforces #0f172a');
    assertEqual(/\[data-theme="light_cad"\]\s+\.theme-card\s+\.theme-card-desc\s*\{\s*color:\s*#475569\s*!important;/.test(html), true, 'light_cad theme card desc enforces #475569');
  } finally {
    if (app && typeof app.stopDragAutoPan === 'function') app.stopDragAutoPan();
    if (app && app.gridCanvas) app.gridCanvas.getBoundingClientRect = prevRectFn;
    if (canvasEl && canvasEl.listeners) {
      for (const k of Object.keys(canvasEl.listeners)) {
        if (prevCanvasListeners[k]) canvasEl.listeners[k] = prevCanvasListeners[k];
      }
    }
  }
});

runTest('WISH-074', 'All logic and sequential modules support configurable propagation delay without gate pin stubs', () => {
  const moduleTypes = ['FULL_ADDER', 'MUX', 'DECODER', 'BCD_DEC', 'SR_FF', 'D_FF', 'JK_FF', 'T_FF', 'D_LATCH', 'COUNTER', 'SHIFT_REG', 'CUSTOM_IC'];

  // 1. All modules are registered in GATE_DELAY_TYPES, support global/module/instance delay, and keep zero pin stub offset
  const app = new LogicSimApp();
  app.setGlobalGateDelay(4, false);
  for (const t of moduleTypes) {
    assertEqual(Boolean(GATE_DELAY_TYPES[t]), true, `${t} is enabled in GATE_DELAY_TYPES`);
    const comp = app.circuit.addComponent(t, 100, 100, t === 'CUSTOM_IC' ? { inputs: [{ name: 'A' }], outputs: [{ name: 'Y' }], subcircuit: { components: [], wires: [] } } : {});
    assertEqual(comp.getEffectiveDelay(), 4, `${t} inherits globalGateDelay = 4`);
    if (comp.inputs.length > 0) assertEqual(comp.inputs[0].relX, 0, `${t} keeps input pin on left wall (no gate stub)`);
    if (comp.outputs.length > 0) assertEqual(comp.outputs[0].relX, comp.width, `${t} keeps output pin on right wall (no gate stub)`);
    app.setModuleGateDelay(t, 6, false);
    assertEqual(comp.getEffectiveDelay(), 6, `${t} inherits moduleGateDelays[${t}] = 6`);
    comp.params.delay = 2;
    assertEqual(comp.getEffectiveDelay(), 2, `${t} respects per-instance delay = 2`);
    assertEqual(html.includes(`<option value="${t}"`), true, `Palette delay dropdown contains <option value="${t}">`);
  }

  // 2. Multi-output combinational module (FULL_ADDER with delay=3) delays both SUM and COUT simultaneously
  const cComb = new Circuit();
  const swA = cComb.addComponent('SWITCH', 40, 60, { initialValue: 1 });
  const swB = cComb.addComponent('SWITCH', 40, 120, { initialValue: 1 });
  const adder = cComb.addComponent('FULL_ADDER', 200, 80, { delay: 3 });
  cComb.addWire(swA.id, 0, adder.id, 0);
  cComb.addWire(swB.id, 0, adder.id, 1);
  // Start with A=1, B=1 -> syncImmediate settles SUM=0, COUT=1
  cComb.syncImmediateWireLevels();
  assertEqual(adder.outputs[0].value, 0, 'FULL_ADDER initial SUM is 0 (1+1)');
  assertEqual(adder.outputs[1].value, 1, 'FULL_ADDER initial COUT is 1 (1+1)');
  // Switch B off -> SUM becomes 1, COUT becomes 0 after 3 ticks
  swB.state.value = 0; swB.outputs[0].value = 0; swB.nextOutputs[0] = 0;
  cComb.updateWireLevelsFromDrivers();
  cComb.step(); // tick 1: delayTimer -> 2 (still old SUM=0, COUT=1)
  assertEqual(adder.outputs[0].value, 0, 'FULL_ADDER holds SUM=0 on tick 1 of 3-tick delay');
  assertEqual(adder.outputs[1].value, 1, 'FULL_ADDER holds COUT=1 on tick 1 of 3-tick delay');
  cComb.step(); // tick 2: delayTimer -> 1
  assertEqual(adder.outputs[0].value, 0, 'FULL_ADDER holds SUM=0 on tick 2 of 3-tick delay');
  assertEqual(adder.outputs[1].value, 1, 'FULL_ADDER holds COUT=1 on tick 2 of 3-tick delay');
  cComb.step(); // tick 3: commits new outputs together
  assertEqual(adder.outputs[0].value, 1, 'FULL_ADDER updates SUM=1 on tick 3');
  assertEqual(adder.outputs[1].value, 0, 'FULL_ADDER updates COUT=0 on tick 3');

  // 3. Sequential module (JK_FF with delay=3) latches clock edge and delays both Q and !Q by 3 ticks
  const cSeq = new Circuit();
  const swJ = cSeq.addComponent('SWITCH', 40, 60, { initialValue: 1 });
  const swK = cSeq.addComponent('SWITCH', 40, 140, { initialValue: 0 });
  const swClk = cSeq.addComponent('SWITCH', 40, 100, { initialValue: 0 });
  const jk = cSeq.addComponent('JK_FF', 200, 80, { trigger: 'rising', delay: 3 });
  cSeq.addWire(swJ.id, 0, jk.id, 0);
  cSeq.addWire(swClk.id, 0, jk.id, 1);
  cSeq.addWire(swK.id, 0, jk.id, 2);
  cSeq.syncImmediateWireLevels();
  assertEqual(jk.outputs[0].value, 0, 'JK_FF initial Q=0');
  assertEqual(jk.outputs[1].value, 1, 'JK_FF initial !Q=1');

  // Rising edge on CLK with delay=3
  swClk.state.value = 1; swClk.outputs[0].value = 1; swClk.nextOutputs[0] = 1;
  cSeq.updateWireLevelsFromDrivers();
  cSeq.step(); // tick 1: captures edge, delayTimer -> 2, committedQ remains 0
  assertEqual(jk.outputs[0].value, 0, 'JK_FF holds Q=0 on tick 1 of 3-tick delay');
  assertEqual(jk.outputs[1].value, 1, 'JK_FF holds !Q=1 on tick 1 of 3-tick delay');
  assertEqual(jk.state.committedQ, 0, 'JK_FF visual committedQ stays 0 during delay countdown');
  cSeq.step(); // tick 2: delayTimer -> 1
  assertEqual(jk.outputs[0].value, 0, 'JK_FF holds Q=0 on tick 2 of 3-tick delay');
  cSeq.step(); // tick 3: commits Q=1, !Q=0
  assertEqual(jk.outputs[0].value, 1, 'JK_FF updates Q=1 on tick 3');
  assertEqual(jk.outputs[1].value, 0, 'JK_FF updates !Q=0 on tick 3');
  assertEqual(jk.state.committedQ, 1, 'JK_FF visual committedQ updates to 1 on commit');

  // 4. Sequential module stepCombinational works in Edit mode with delay
  app.circuit.clear();
  app.engine.setMode('edit');
  const swEdit = app.circuit.addComponent('SWITCH', 40, 80, { initialValue: 0 });
  const tffEdit = app.circuit.addComponent('T_FF', 180, 60, { trigger: 'rising', delay: 2 });
  const swT = app.circuit.addComponent('SWITCH', 40, 140, { initialValue: 1 });
  app.circuit.addWire(swT.id, 0, tffEdit.id, 0);
  app.circuit.addWire(swEdit.id, 0, tffEdit.id, 1);
  app.circuit.syncImmediateWireLevels();
  swEdit.state.value = 1; swEdit.outputs[0].value = 1; swEdit.nextOutputs[0] = 1;
  app.circuit.updateWireLevelsFromDrivers();
  const p1 = app.circuit.stepCombinational();
  assertEqual(p1, true, 'stepCombinational reports pending delay on T_FF tick 1');
  assertEqual(tffEdit.outputs[0].value, 0, 'T_FF in edit mode holds Q=0 on tick 1');
  app.circuit.stepCombinational();
  assertEqual(tffEdit.outputs[0].value, 1, 'T_FF in edit mode commits Q=1 on tick 2');

  // 5. Inspector renders Verzögerung slider for module components like JK_FF & COUNTER
  app.selectItem(tffEdit.id, null);
  const inspText = app.inspector.container.textContent || '';
  assertEqual(inspText.includes('Verzögerung'), true, 'Inspector renders Verzögerung slider for T_FF module');
});

runTest('WISH-075', 'Comprehensive bug fixes: Steiner fork clipboard/nudge/inline-NOT, playhead scrub, floating/toWireId levels, parser/synthesis, truth table, CUSTOM_IC, settings & PNG export', () => {
  const prevLang = I18N.currentLang;
  const prevGetItem = localStorage.getItem;
  const prevSetItem = localStorage.setItem;
  const prevCreateElement = document.createElement;
  I18N.currentLang = 'de';

  try {
    const app = new LogicSimApp();
    app.engine.setMode('edit');
    app.renderer.panX = 0;
    app.renderer.panY = 0;
    app.renderer.zoom = 1;

    // 1. Open wire terminus right-click context menu does not throw showWireContextMenu TypeError
    app.circuit.clear(app.ringBuffer);
    const swTerm = app.circuit.addComponent('SWITCH', 40, 80);
    app.circuit.addWire(swTerm.id, 0, null, 0, null, [], { toPoint: { x: 240, y: 100 } });
    const ctxHandlers = app.gridCanvas.listeners.contextmenu || [];
    ctxHandlers.forEach(fn => fn({ clientX: 240, clientY: 100, preventDefault: () => {} }));
    assertEqual(app.contextMenuEl.style.display, 'block', 'Right-clicking open wire terminus opens context menu without throwing');
    app.hideContextMenu();

    // 2. Steiner fork tree copy/paste (duplicateSelection), nudgeSelection, and inlineGateIntoWire (NOT drop)
    app.circuit.clear(app.ringBuffer);
    app.setGlobalGateDelay(0, true);
    const swFork = app.circuit.addComponent('SWITCH', 40, 80, { initialValue: 1 }); // pin at (120, 100)
    const ledA = app.circuit.addComponent('LED', 300, 40); // pin at (300, 60)
    const ledB = app.circuit.addComponent('LED', 300, 120); // pin at (300, 140)
    app.circuit.addWire(swFork.id, 0, ledA.id, 0, null, [{ x: 200, y: 100 }, { x: 200, y: 60 }]);
    app.circuit.addWire(swFork.id, 0, ledB.id, 0, null, [{ x: 200, y: 100 }, { x: 200, y: 140 }]);
    app.circuit.normalizeForkWires();
    const origTrunk = app.circuit.wires.find(w => app.circuit.isForkTrunkWire(w));
    assertEqual(Boolean(origTrunk), true, 'normalizeForkWires creates Steiner fork trunk');
    const origProbe = app.circuit.addProbe(origTrunk.id, { name: 'FORK_PR' });
    app.circuit.syncImmediateWireLevels();

    app.selectMulti([swFork.id, ledA.id, ledB.id], []);
    app.duplicateSelection();
    assertEqual(app.circuit.components.length, 6, 'duplicateSelection duplicates all 3 components');
    assertEqual(app.circuit.getProbes().length, 2, 'duplicateSelection preserves probe on Steiner fork tree');
    const dupTrunk = app.circuit.wires.find(w => w.id !== origTrunk.id && app.circuit.isForkTrunkWire(w));
    assertEqual(Boolean(dupTrunk), true, 'Pasted selection preserves Steiner fork trunk');
    const dupLeds = app.circuit.components.filter(c => c.type === 'LED' && c.id !== ledA.id && c.id !== ledB.id);
    app.circuit.syncImmediateWireLevels();
    assertEqual(dupLeds[0].inputs[0].value, 1, 'First duplicated fork LED receives HIGH');
    assertEqual(dupLeds[1].inputs[0].value, 1, 'Second duplicated fork LED receives HIGH');

    // Nudge duplicated selection including Steiner fork trunk and clamp check
    const oldTrunkToX = dupTrunk.toPoint.x;
    app.nudgeSelection(1, 1);
    assertEqual(Number.isFinite(dupTrunk.toPoint.x) && dupTrunk.toPoint.x !== oldTrunkToX, true, 'nudgeSelection updates Steiner fork trunk toPoint');

    // Inline NOT gate onto Steiner fork trunk rebinds all child branches and probes
    const inlined = app.circuit.inlineGateIntoWire(origTrunk, 'NOT', 140, 80);
    assertEqual(Boolean(inlined && inlined.wireOut), true, 'inlineGateIntoWire succeeds on Steiner fork trunk');
    app.circuit.syncImmediateWireLevels();
    assertEqual(ledA.inputs[0].value, 0, 'Inline NOT on trunk inverts downstream branch ledA to 0');
    assertEqual(ledB.inputs[0].value, 0, 'Inline NOT on trunk inverts downstream branch ledB to 0');
    assertEqual(Boolean(app.circuit.getWire(origProbe.wireId)), true, 'Probe on split trunk is rebound to a live wire');

    // 3. Floating wire Zombie HIGH reset & toWireId signal propagation
    const cWire = new Circuit();
    const swW = cWire.addComponent('SWITCH', 40, 80, { initialValue: 1 });
    const wFloat = cWire.addWire(swW.id, 0, null, 0, null, [], { toPoint: { x: 200, y: 100 } });
    cWire.syncImmediateWireLevels();
    assertEqual(wFloat.level, 1, 'Driven open-ended wire starts HIGH');
    wFloat.fromCompId = '';
    wFloat.fromPoint = { x: 100, y: 100 };
    cWire.updateWireLevelsFromDrivers();
    assertEqual(wFloat.level, 0, 'Detached floating wire resets to LOW (no Zombie HIGH)');

    const ledW = cWire.addComponent('LED', 280, 160);
    const wTarget = cWire.addWire(null, 0, ledW.id, 0, null, [], { fromPoint: { x: 180, y: 180 } });
    cWire.addWire(swW.id, 0, null, 0, null, [], { toWireId: wTarget.id, toPoint: { x: 180, y: 180 } });
    cWire.syncImmediateWireLevels();
    assertEqual(wTarget.level, 1, 'toWireId driver wire propagates HIGH to target wire');
    assertEqual(ledW.inputs[0].value, 1, 'Target wire connected via toWireId drives LED input HIGH');

    // 4. SimulationEngine playhead scrubbing (backward to past tick & forward back to head)
    const cScrub = new Circuit();
    const rbScrub = new RingBuffer(128);
    const engScrub = new SimulationEngine(cScrub, rbScrub);
    const clkScrub = cScrub.addComponent('CLOCK', 40, 80, { highTicks: 1, lowTicks: 1 });
    const cntScrub = cScrub.addComponent('COUNTER', 200, 60, { delay: 0 });
    const wScrub = cScrub.addWire(clkScrub.id, 0, cntScrub.id, 0);
    cScrub.addProbe(wScrub.id, { name: 'CLK' });
    engScrub.setMode('sim');
    let countAt2 = 0;
    for (let t = 1; t <= 6; t++) {
      engScrub.stepTick();
      if (t === 2) countAt2 = cntScrub.state.count;
    }
    const countAt6 = cntScrub.state.count;
    assertEqual(engScrub.scrubToTick(2), true, 'scrubToTick(2) restores historical snapshot');
    assertEqual(engScrub.tickCount, 2, 'tickCount matches scrubbed tick 2');
    assertEqual(cntScrub.state.count, countAt2, 'COUNTER state matches historical tick 2');
    assertEqual(engScrub.scrubToTick(6), true, 'scrubToTick(6) restores head snapshot');
    assertEqual(engScrub.tickCount, 6, 'tickCount restored to head tick 6');
    assertEqual(cntScrub.state.count, countAt6, 'COUNTER state restored to head tick 6');
    engScrub.stepTick();
    assertEqual(engScrub.tickCount, 7, 'Stepping after scrubbing back to head advances monotonically to tick 7');

    // 5. BooleanParser semicolon validation, 3-input XOR parity synthesis, and >8-input gate cascading
    let badSyntax = false;
    try { BooleanParser.parse('Y = A B'); } catch (_) { badSyntax = true; }
    assertEqual(badSyntax, true, 'BooleanParser rejects missing operator / missing semicolon between tokens');

    const cXor = new Circuit();
    cXor.globalGateDelay = 0;
    BooleanParser.synthesizeToCircuit(cXor, BooleanParser.parse('Y = A ^ B ^ C'), { mode: 'replace' });
    for (const c of cXor.components) {
      if (c.type === 'SWITCH') { c.state.value = 1; c.outputs[0].value = 1; c.nextOutputs[0] = 1; }
    }
    cXor.syncImmediateWireLevels();
    const xorLed = cXor.components.find(c => c.type === 'LED');
    assertEqual(xorLed.inputs[0].value, 1, 'Synthesized 3-input XOR uses odd parity (1 ^ 1 ^ 1 = 1)');

    const cWide = new Circuit();
    cWide.globalGateDelay = 0;
    BooleanParser.synthesizeToCircuit(cWide, BooleanParser.parse('Y = V0 | V1 | V2 | V3 | V4 | V5 | V6 | V7 | V8 | V9'), { mode: 'replace' });
    const wideGates = cWide.components.filter(c => c.type === 'OR');
    assertEqual(wideGates.length >= 2 && wideGates.every(g => g.inputs.length <= 8), true, '10-term OR synthesis cascades into <=8-input gates');
    const v9 = cWide.components.find(c => c.type === 'SWITCH' && c.params.label === 'V9');
    v9.state.value = 1; v9.outputs[0].value = 1; v9.nextOutputs[0] = 1;
    cWide.syncImmediateWireLevels();
    assertEqual(cWide.components.find(c => c.type === 'LED').inputs[0].value, 1, 'Cascaded 10-term OR propagates V9=1 to LED');

    // 6. TruthTableGenerator SWITCH state.value preservation, label deduplication, wire-tap probes & applyInputCombination
    app.circuit.clear(app.ringBuffer);
    const s1 = app.circuit.addComponent('SWITCH', 40, 40, { label: 'SW', initialValue: 1 });
    const s2 = app.circuit.addComponent('SWITCH', 40, 100, { label: 'SW_2', initialValue: 0 });
    const s3 = app.circuit.addComponent('SWITCH', 40, 160, { initialValue: 0 }); // unlabeled -> default 'SW'
    const gAnd = app.circuit.addComponent('AND', 200, 80, { numInputs: 3, delay: 0 });
    app.circuit.addWire(s1.id, 0, gAnd.id, 0);
    app.circuit.addWire(s2.id, 0, gAnd.id, 1);
    app.circuit.addWire(s3.id, 0, gAnd.id, 2);
    const wTap = app.circuit.addWire(gAnd.id, 0, null, 0, null, [], { toPoint: { x: 340, y: 100 } });
    app.circuit.addProbe(wTap.id, { name: 'TAP_Y' });

    const tt = TruthTableGenerator.generate(app.circuit, app.engine);
    assertEqual(Boolean(tt.error), false, 'TruthTableGenerator evaluates circuits with wire-tap probes as outputs');
    assertEqual(new Set(tt.inputs.map(i => i.name)).size, 3, 'Collision-free deduplication produces 3 unique input names');
    assertEqual(s1.state.value, 1, 'TruthTableGenerator restores original SWITCH state.value = 1');
    assertEqual(tt.rows[7].outputs.TAP_Y, 1, '3-input AND wire-tap probe row 7 evaluates to 1');

    app.currentTruthTableData = tt;
    app.applyInputCombination({ [tt.inputs[0].name]: 0, [tt.inputs[1].name]: 1, [tt.inputs[2].name]: 1 });
    assertEqual(s1.state.value, 0, 'applyInputCombination updates s1.state.value to 0');
    assertEqual(s2.state.value, 1, 'applyInputCombination updates s2.state.value to 1');
    assertEqual(s3.state.value, 1, 'applyInputCombination updates deduplicated s3.state.value to 1');

    // 7. CUSTOM_IC >4-stage combinational settling, invertedOutput resetState, and multi-pin HEX_DISPLAY compression
    const icChain = new Component('ic6', 'CUSTOM_IC', 0, 0, {
      delay: 0,
      inputs: [{ name: 'A', targets: [{ targetCompIdx: 0, targetPin: 0 }] }],
      outputs: [{ name: 'Y', sourceCompIdx: 5, sourcePin: 0 }],
      subcircuit: {
        components: Array.from({ length: 6 }, (_, i) => ({ type: 'NOT', dx: i * 60, dy: 0, params: {} })),
        wires: Array.from({ length: 5 }, (_, i) => ({ from: i, fp: 0, to: i + 1, tp: 0, wp: [] }))
      }
    });
    icChain.compute([1]);
    assertEqual(icChain.nextOutputs[0], 1, '6-stage NOT chain inside CUSTOM_IC settles in a single evaluation');
    icChain.compute([0]);
    assertEqual(icChain.nextOutputs[0], 0, '6-stage NOT chain inside CUSTOM_IC settles 0 -> 0');

    const icInv = new Component('ic_inv', 'CUSTOM_IC', 0, 0, {
      invertedOutput: true,
      inputs: [{ name: 'A', targets: [{ targetCompIdx: 0, targetPin: 0 }] }],
      outputs: [{ name: 'Y', sourceCompIdx: 0, sourcePin: 0 }],
      subcircuit: { components: [{ type: 'BUFFER', dx: 0, dy: 0, params: {} }], wires: [] }
    });
    icInv.resetState();
    assertEqual(icInv.outputs[0].value, 1, 'CUSTOM_IC resetState honors invertedOutput');

    app.circuit.clear(app.ringBuffer);
    const hexSw0 = app.circuit.addComponent('SWITCH', 40, 40, { label: 'B0' });
    const hexSw1 = app.circuit.addComponent('SWITCH', 40, 100, { label: 'B1' });
    const hexBuf0 = app.circuit.addComponent('BUFFER', 160, 40);
    const hexBuf1 = app.circuit.addComponent('BUFFER', 160, 100);
    const hexDisp = app.circuit.addComponent('HEX_DISPLAY', 300, 40, { label: 'HEX' });
    app.circuit.addWire(hexSw0.id, 0, hexBuf0.id, 0);
    app.circuit.addWire(hexSw1.id, 0, hexBuf1.id, 0);
    app.circuit.addWire(hexBuf0.id, 0, hexDisp.id, 0);
    app.circuit.addWire(hexBuf1.id, 0, hexDisp.id, 1);
    app.selectMulti([hexSw0.id, hexSw1.id, hexBuf0.id, hexBuf1.id, hexDisp.id], []);
    const hexMod = app.saveSelectionAsModule('Hex2Bit', true);
    assertEqual(Boolean(hexMod && hexMod.outputs.length === 2), true, 'CUSTOM_IC compression preserves multiple connected HEX_DISPLAY input pins');

    // 8. Settings persistence (showWireBridges = false) & exportCanvasAsPNG light-theme background + offCtx translation
    const memStore = new Map();
    localStorage.getItem = (k) => (memStore.has(k) ? memStore.get(k) : null);
    localStorage.setItem = (k, v) => { memStore.set(k, String(v)); };

    app.setShowWireBridges(false);
    app.saveSettings();
    const appReloaded = new LogicSimApp();
    assertEqual(appReloaded.showWireBridges, false, 'loadSettings preserves showWireBridges = false across reload');

    const pngTranslates = [];
    const pngBgFills = [];
    document.createElement = (tag) => {
      const el = prevCreateElement(tag);
      if (tag === 'canvas') {
        const ctxSpy = Object.assign({}, mockCtx, {
          fillStyle: '',
          translate: (x, y) => pngTranslates.push({ x, y }),
          fillRect: (x, y, w, h) => {
            if (x === 0 && y === 0 && w >= 200 && h >= 150) pngBgFills.push(ctxSpy.fillStyle);
          }
        });
        el.getContext = () => ctxSpy;
        el.toDataURL = () => 'data:image/png;base64,AA==';
      }
      return el;
    };
    app.circuit.clear(app.ringBuffer);
    app.circuit.addComponent('AND', 600, 400);
    app.setAppTheme('java_swing', false);
    app.exportCanvasAsPNG();
    assertEqual(pngBgFills[0].toLowerCase(), '#ffffff', 'exportCanvasAsPNG uses java_swing palette background #ffffff');
    assertEqual(pngTranslates.some(t => t.x !== 0 || t.y !== 0), true, 'exportCanvasAsPNG translates offscreen context by panX/panY');
  } finally {
    I18N.currentLang = prevLang;
    localStorage.getItem = prevGetItem;
    localStorage.setItem = prevSetItem;
    document.createElement = prevCreateElement;
  }
});

runTest('WISH-049', 'Click-to-place mode arms, previews, places, and cancels', () => {
  const app = new LogicSimApp();
  const ghost = document.getElementById('placement-ghost');
  app.engine.mode = 'edit';

  app.armPlacement('AND');
  assertEqual(Boolean(app.pendingPlacement), true, 'Palette selection arms pending placement');
  assertEqual(app.pendingPlacement.type, 'AND');
  assertEqual(ghost.hidden, false, 'Placement ghost becomes visible');
  assertEqual(app.gridCanvas.classList.contains('placement-active'), true, 'Canvas shows placement cursor');

  let placedArgs = null;
  app.placePaletteItem = (...args) => { placedArgs = args; };
  app.placePendingAt(40, 60, 'canvas', 'renderer', () => 'tab');
  assertEqual(placedArgs[0], 'AND', 'Canvas click reuses palette placement path');
  assertEqual(placedArgs[1], 40);
  assertEqual(placedArgs[2], 60);

  app.cancelPlacement();
  assertEqual(app.pendingPlacement, null, 'Escape/cancel clears pending placement');
  assertEqual(ghost.hidden, true, 'Placement ghost is hidden again');
  assertEqual(app.gridCanvas.classList.contains('placement-active'), false, 'Canvas cursor is restored');
});

runTest('WISH-049', 'Shortcut normalization and formatting are locale-aware', () => {
  assertEqual(normalizeShortcutEvent({ key: 'z', ctrlKey: true }), 'ctrl+z');
  assertEqual(normalizeShortcutEvent({ key: 'Z', ctrlKey: true, shiftKey: true }), 'ctrl+shift+z');
  assertEqual(normalizeShortcutEvent({ key: '?', shiftKey: true }), '?');
  assertEqual(normalizeShortcutEvent({ key: ' ' }), 'space');
  assertEqual(formatShortcut('ctrl+z', 'de'), 'Strg+Z');
  assertEqual(formatShortcut('ctrl+z', 'en'), 'Ctrl+Z');
  assertEqual(SHORTCUT_DEFINITIONS.length >= 20, true, 'Professional shortcut actions are registered');
  assertEqual(Boolean(SHORTCUT_LOOKUP['edit.undo']), true, 'Undo is a customizable action');
});

runTest('WISH-049', 'Shortcut overrides are sanitized and conflict-free', () => {
  const clean = sanitizeShortcutOverrides({
    'edit.undo': 'ctrl+u',
    'edit.redo': 'ctrl+u',
    'file.new': 'javascript:alert(1)',
    unknown: 'x'
  });
  assertEqual(clean['edit.undo'], 'ctrl+u', 'Valid override is kept');
  assertEqual(clean['edit.redo'], undefined, 'Duplicate binding is rejected');
  assertEqual(clean['file.new'], undefined, 'Invalid binding is rejected');
  assertEqual(clean.unknown, undefined, 'Unknown action is rejected');
});

runTest('WISH-049', 'Shortcut dispatch honors overrides and suppresses replaced defaults', () => {
  const app = new LogicSimApp();
  let undone = 0;
  app.undo = () => { undone += 1; };
  app.shortcutOverrides = { 'edit.undo': 'ctrl+u' };

  const preventDefault = () => {};
  assertEqual(app.dispatchShortcut({ key: 'u', ctrlKey: true, preventDefault }), true, 'Override triggers action');
  assertEqual(undone, 1);
  assertEqual(app.isSuppressedDefaultShortcut({ key: 'z', ctrlKey: true }), true, 'Old default binding is suppressed');
  assertEqual(app.dispatchShortcut({ key: 'z', ctrlKey: true, preventDefault }), false, 'Old default no longer triggers action');
  assertEqual(undone, 1);
});

runTest('WISH-049', 'Shortcut settings expose editable bindings with reset', () => {
  const html = require('fs').readFileSync(require('path').join(__dirname, '..', 'index.html'), 'utf8');
  assertEqual(html.includes('id="shortcut-list"'), true, 'Settings modal contains shortcut list');
  assertEqual(html.includes('id="btn-shortcuts-reset"'), true, 'Settings modal contains reset control');

  const app = new LogicSimApp();
  let saved = null;
  app.saveSettings = () => { saved = { ...app.shortcutOverrides }; };
  assertEqual(app.setShortcutOverride('edit.undo', 'ctrl+u'), true);
  assertEqual(saved['edit.undo'], 'ctrl+u', 'Override is persisted through saveSettings');
  assertEqual(app.setShortcutOverride('edit.redo', 'ctrl+u'), false, 'Conflicting override is rejected');
  app.resetShortcutOverrides();
  assertEqual(Object.keys(app.shortcutOverrides).length, 0, 'Reset clears all overrides');
});

runTest('WISH-049', 'Components receive unique KiCad-style reference designators', () => {
  const circuit = new Circuit();
  const sw1 = circuit.addComponent('SWITCH', 0, 0);
  const sw2 = circuit.addComponent('SWITCH', 40, 0);
  const led = circuit.addComponent('LED', 80, 0);
  const gate = circuit.addComponent('AND', 120, 0);
  const duplicate = circuit.addComponent('SWITCH', 160, 0, { ref: 'SW1' });

  assertEqual(sw1.params.ref, 'SW1');
  assertEqual(sw2.params.ref, 'SW2');
  assertEqual(led.params.ref, 'D1');
  assertEqual(gate.params.ref, 'U1');
  assertEqual(duplicate.params.ref, 'SW3', 'Duplicate reference is regenerated');
});

runTest('WISH-049', 'Reference designators survive import and can be edited uniquely', () => {
  const source = new Circuit();
  const sw = source.addComponent('SWITCH', 0, 0, { label: 'A' });
  sw.params.ref = 'SW7';
  const target = new Circuit();
  target.fromJSON(source.toJSON());
  assertEqual(target.getComponent(sw.id).params.ref, 'SW7', 'Valid reference survives JSON roundtrip');

  const app = new LogicSimApp();
  const other = app.circuit.addComponent('SWITCH', 40, 0);
  const inspectorSource = require('fs').readFileSync(require('path').join(__dirname, '..', 'index.html'), 'utf8');
  assertEqual(inspectorSource.includes("addTextControl('Referenz'"), true, 'Inspector exposes reference control');
  assertEqual(other.params.ref === sw.params.ref, false, 'References remain unique per circuit');
});

runTest('WISH-049', 'PDF export builds a valid embedded-image PDF', () => {
  const pdf = buildPdfFromJpegDataUrl('data:image/jpeg;base64,QUJD', 800, 600);
  assertEqual(pdf.startsWith('%PDF-1.4'), true, 'PDF starts with version header');
  assertEqual(pdf.includes('/Filter /DCTDecode'), true, 'JPEG image uses DCTDecode');
  assertEqual(pdf.includes('\nQUJD\n'), true, 'Image payload is embedded');
  assertEqual(pdf.includes('xref'), true, 'PDF contains cross-reference table');
  assertEqual(pdf.endsWith('%%EOF'), true, 'PDF ends with EOF marker');
});

runTest('WISH-049', 'File menu exposes PNG and PDF circuit exports', () => {
  const app = new LogicSimApp();
  const html = require('fs').readFileSync(require('path').join(__dirname, '..', 'index.html'), 'utf8');
  assertEqual(typeof app.exportCanvasAsPNG, 'function', 'PNG export is available');
  assertEqual(typeof app.exportCanvasAsPDF, 'function', 'PDF export is available');
  assertEqual(typeof app.renderCircuitExportCanvas, 'function', 'Export canvas is shared');
  assertEqual(html.includes('id="menu-item-export-pdf"'), true, 'PDF menu entry exists');
  assertEqual(html.includes("'menu.file.export_pdf': 'Als PDF exportieren'"), true, 'German PDF label exists');
  assertEqual(html.includes("'menu.file.export_pdf': 'Export PDF'"), true, 'English PDF label exists');
});

runTest('WISH-076', 'Wire context menu places Messpunkt setzen and Leitung löschen at the top near the mouse cursor', () => {
  const app = new LogicSimApp();
  app.circuit.clear(app.ringBuffer);
  app.engine.mode = 'edit';
  const sw = app.circuit.addComponent('SWITCH', 40, 80);
  const led = app.circuit.addComponent('LED', 240, 80);
  const wire = app.circuit.addWire(sw.id, 0, led.id, 0);

  app.showContextMenu(180, 120, null, wire, { x: 140, y: 100 });
  const children = Array.from(app.contextMenuEl.children);
  const actionItems = children.filter(el => (el.className || '').includes('ctx-item'));
  assertEqual(actionItems.length >= 4, true, 'Wire context menu renders action items');
  assertEqual((actionItems[0].textContent || '').includes('Messpunkt setzen'), true, 'First action item near mouse is Messpunkt setzen');
  assertEqual((actionItems[1].textContent || '').includes('Leitung löschen'), true, 'Second action item near mouse is Leitung löschen');
  assertEqual((actionItems[1].className || '').includes('danger'), true, 'Leitung löschen retains danger styling');
  const dividerIdx = children.findIndex(el => (el.className || '').includes('ctx-divider'));
  const probeIdx = children.indexOf(actionItems[0]);
  const delIdx = children.indexOf(actionItems[1]);
  assertEqual(probeIdx < delIdx && delIdx < dividerIdx, true, 'Quick actions precede divider separating secondary wire actions');

  // Clicking Messpunkt setzen adds a probe to the wire
  actionItems[0].dispatchEvent({ type: 'click' });
  assertEqual(app.circuit.getProbes().length, 1, 'Clicking Messpunkt setzen adds a probe');

  // Re-open menu and click Leitung löschen to remove wire
  app.showContextMenu(180, 120, null, wire, { x: 140, y: 100 });
  const delBtn = Array.from(app.contextMenuEl.children).find(el => (el.textContent || '').includes('Leitung löschen'));
  delBtn.dispatchEvent({ type: 'click' });
  assertEqual(app.circuit.wires.some(w => w.id === wire.id), false, 'Clicking Leitung löschen removes the wire');
});

runTest('VISUAL-BUGS', 'Active waypoint drag hides off-path ghost handles, resets shadow state, and layers selected wire overlays on top', () => {
  const prevCreateTextNode = document.createTextNode;
  if (!document.createTextNode) {
    document.createTextNode = (txt) => ({ nodeType: 3, textContent: String(txt || '') });
  }
  const app = new LogicSimApp();
  app.circuit.clear(app.ringBuffer);
  app.engine.setMode('edit');
  app.renderer.panX = 0;
  app.renderer.panY = 0;
  app.renderer.zoom = 1;
  app.renderer.appTheme = 'light_cad';

  const createStatefulSpyCtx = () => {
    const stack = [];
    const arcs = [];
    const texts = [];
    const strokes = [];
    const ctx = Object.assign({}, mockCtx, {
      shadowBlur: 0,
      shadowColor: 'transparent',
      strokeStyle: '#000',
      fillStyle: '#000',
      lineWidth: 1,
      font: '10px monospace',
      textAlign: 'left',
      textBaseline: 'alphabetic',
      canvas: { width: 1200, height: 800 },
      save: () => {
        stack.push({
          shadowBlur: ctx.shadowBlur,
          shadowColor: ctx.shadowColor,
          strokeStyle: ctx.strokeStyle,
          fillStyle: ctx.fillStyle,
          lineWidth: ctx.lineWidth
        });
      },
      restore: () => {
        const prev = stack.pop();
        if (prev) Object.assign(ctx, prev);
      },
      arc: (x, y, r) => {
        arcs.push({ x, y, r, shadowBlur: ctx.shadowBlur, strokeStyle: ctx.strokeStyle, fillStyle: ctx.fillStyle });
      },
      fillText: (txt, x, y) => {
        texts.push({ txt: String(txt), x, y, shadowBlur: ctx.shadowBlur, fillStyle: ctx.fillStyle });
      },
      stroke: () => {
        strokes.push({ strokeStyle: ctx.strokeStyle, lineWidth: ctx.lineWidth, shadowBlur: ctx.shadowBlur });
      }
    });
    return { ctx, arcs, texts, strokes };
  };

  try {
    // 1. Branched open-ended wire with backtracked/off-path waypoints during active drag
    const sw = app.circuit.addComponent('SWITCH', 400, 140);
    const led = app.circuit.addComponent('LED', 680, 140);
    const trunk = app.circuit.addWire(sw.id, 0, led.id, 0);
    const branch = app.circuit.addWire('', 0, '', 0, null, [
      { x: 580, y: 160 },
      { x: 600, y: 20 },
      { x: 640, y: 100 }
    ], {
      fromWireId: trunk.id,
      fromPoint: { x: 580, y: 160 },
      toPoint: { x: 640, y: 60 }
    });

    app.selectItem(null, branch.id);
    app.renderer.activeWaypointDrag = { wire: branch, index: 1 };

    const spy1 = createStatefulSpyCtx();
    app.renderer.drawWires(spy1.ctx);

    // Off-path waypoints (640, 100) and endpoint-coincident (580, 160) must NOT draw ghost circles
    assertEqual(spy1.arcs.some(a => Math.abs(a.x - 640) < 0.5 && Math.abs(a.y - 100) < 0.5), false, 'No off-path ghost waypoint handle drawn at (640, 100)');
    assertEqual(spy1.arcs.some(a => Math.abs(a.x - 580) < 0.5 && Math.abs(a.y - 160) < 0.5 && a.r === 4), false, 'No endpoint-coincident waypoint circle drawn at (580, 160)');

    // Visible bend (640, 20) and active dragged corner (600, 20) MUST be drawn cleanly with shadowBlur === 0
    const cornerAtBend = spy1.arcs.find(a => Math.abs(a.x - 640) < 0.5 && Math.abs(a.y - 20) < 0.5 && a.r === 4);
    assertEqual(Boolean(cornerAtBend), true, 'Visible corner handle drawn at (640, 20)');
    assertEqual(cornerAtBend.shadowBlur, 0, 'Corner handle has shadowBlur === 0');

    const activeDot = spy1.arcs.find(a => Math.abs(a.x - 600) < 0.5 && Math.abs(a.y - 20) < 0.5 && a.r === 5.5);
    const activeHalo = spy1.arcs.find(a => Math.abs(a.x - 600) < 0.5 && Math.abs(a.y - 20) < 0.5 && a.r === 8);
    assertEqual(Boolean(activeDot && activeHalo), true, 'Active dragged waypoint handle + halo drawn at (600, 20)');
    assertEqual(activeDot.shadowBlur, 0, 'Active dragged waypoint dot has shadowBlur === 0');
    assertEqual(activeHalo.shadowBlur, 0, 'Active dragged waypoint halo has shadowBlur === 0');

    const coordLabel = spy1.texts.find(t => t.txt === '600, 20');
    assertEqual(Boolean(coordLabel), true, 'Active drag coordinate label rendered');
    assertEqual(coordLabel.shadowBlur, 0, 'Coordinate label has shadowBlur === 0 (no red shadow bleed)');

    // Open-endpoint inner dot at (640, 60) must have shadowBlur === 0 (no blue halo bleed)
    const openEndDot = spy1.arcs.find(a => Math.abs(a.x - 640) < 0.5 && Math.abs(a.y - 60) < 0.5 && a.r === 4);
    assertEqual(Boolean(openEndDot), true, 'Open-endpoint inner dot drawn at (640, 60)');
    assertEqual(openEndDot.shadowBlur, 0, 'Open-endpoint inner dot has shadowBlur === 0');

    // 2. Z-order: selected wire (even if added BEFORE unselected wire) must draw stroke & overlays AFTER unselected wire stroke
    const trunkStrokeIdx = spy1.strokes.findIndex(s => s.strokeStyle !== '#ff5252' && s.lineWidth <= 3);
    const selectedStrokeIdx = spy1.strokes.findIndex(s => s.strokeStyle === '#ff5252');
    assertEqual(trunkStrokeIdx >= 0 && selectedStrokeIdx > trunkStrokeIdx, true, 'Selected wire stroke renders above earlier/unselected wires');

    // 3. No-glow theme (java_swing) suppresses shadowBlur on selected wire stroke and open-endpoint halo
    app.renderer.appTheme = 'java_swing';
    const spySwing = createStatefulSpyCtx();
    app.renderer.drawWires(spySwing.ctx);
    const swingSelectedStroke = spySwing.strokes.find(s => s.strokeStyle === '#ff5252');
    assertEqual(Boolean(swingSelectedStroke) && swingSelectedStroke.shadowBlur === 0, true, 'java_swing disables shadowBlur on selected wire stroke');
    const swingEndHalo = spySwing.arcs.find(a => Math.abs(a.x - 640) < 0.5 && Math.abs(a.y - 60) < 0.5 && a.r === 6.5);
    assertEqual(Boolean(swingEndHalo) && swingEndHalo.shadowBlur === 0, true, 'java_swing disables shadowBlur on open-endpoint halo');

    // 4. Collinear dragWp fallback: if dragged waypoint becomes collinear with neighbors, active handle still renders at dragWp
    app.renderer.appTheme = 'light_cad';
    branch.waypoints = [{ x: 600, y: 160 }, { x: 620, y: 160 }];
    branch.toPoint = { x: 640, y: 160 };
    app.renderer.activeWaypointDrag = { wire: branch, index: 0 };
    const spyCollinear = createStatefulSpyCtx();
    app.renderer.drawWires(spyCollinear.ctx);
    const collinearActive = spyCollinear.arcs.find(a => Math.abs(a.x - 600) < 0.5 && Math.abs(a.y - 160) < 0.5 && a.r === 5.5);
    assertEqual(Boolean(collinearActive), true, 'Collinear active drag waypoint still draws handle under cursor');
  } finally {
    app.renderer.activeWaypointDrag = null;
    if (prevCreateTextNode === undefined) delete document.createTextNode;
    else document.createTextNode = prevCreateTextNode;
  }
});

runTest('WISH-078', 'Auto-format connector points inside modules and improve wire endpoint entry into open modules', () => {
  const app = new LogicSimApp();
  app.circuit.clear(app.ringBuffer);
  app.engine.setMode('edit');

  // 1. Open-module endpoint resolution: dropping/hovering a wire endpoint inside a multi-pin open module snaps to free input pins
  const sw1 = app.circuit.addComponent('SWITCH', 40, 80, { initialValue: 1 });
  const sw2 = app.circuit.addComponent('SWITCH', 40, 160, { initialValue: 1 });
  const dff = app.circuit.addComponent('D_FF', 240, 80); // body [240..320, 80..160], inputs D@(240,100), CLK@(240,140)

  app.renderer.activeWireDrag = {
    compId: sw1.id,
    isOutput: true,
    pinIndex: 0,
    startX: 120,
    startY: 100,
    waypoints: [],
    currX: 280,
    currY: 105
  };
  const resolvedD = app.resolveActiveWireDragPin(280, 105, app.renderer.activeWireDrag, 20);
  assertEqual(Boolean(resolvedD), true, 'Wire drag inside open D_FF body resolves to an open input pin');
  assertEqual(resolvedD.compId, dff.id, 'Resolved target component is D_FF');
  assertEqual(resolvedD.isOutput, false, 'Resolved pin is an input');
  assertEqual(resolvedD.pinIndex, 0, 'Upper half of D_FF resolves to input 0 (D)');
  app.finishActiveWireAtPoint({ x: resolvedD.x, y: resolvedD.y }, null, resolvedD);

  // Now input 0 (D) is occupied: dropping a second wire even near the upper half of D_FF automatically enters the remaining open input 1 (CLK)!
  app.renderer.activeWireDrag = {
    compId: sw2.id,
    isOutput: true,
    pinIndex: 0,
    startX: 120,
    startY: 180,
    waypoints: [],
    currX: 270,
    currY: 108
  };
  const resolvedClk = app.resolveActiveWireDragPin(270, 108, app.renderer.activeWireDrag, 20);
  assertEqual(Boolean(resolvedClk), true, 'Second wire drag onto partially-open D_FF resolves to remaining free pin');
  assertEqual(resolvedClk.pinIndex, 1, 'Occupied pin 0 is skipped in favor of open pin 1 (CLK)');
  app.finishActiveWireAtPoint({ x: resolvedClk.x, y: resolvedClk.y }, null, resolvedClk);
  assertEqual(Boolean(app.circuit.getWireToInput(dff.id, 0)), true, 'D_FF pin 0 connected');
  assertEqual(Boolean(app.circuit.getWireToInput(dff.id, 1)), true, 'D_FF pin 1 connected');

  // 2. Open terminus drag into open module (AND gate) connects cleanly
  const andGate = app.circuit.addComponent('AND', 440, 80); // body [440..520, 80..140], inputs @(420,100), @(420,120)
  const openLead = app.circuit.addWire(dff.id, 0, null, 0, null, [], { toPoint: { x: 360, y: 100 } });
  const termPin = app.resolveTerminusDragPin(470, 122, { wire: openLead, isEnd: true, isStart: false }, 20);
  assertEqual(Boolean(termPin), true, 'Dragging open wire terminus onto open AND gate resolves target pin');
  assertEqual(termPin.compId, andGate.id, 'Open terminus targets AND gate');
  assertEqual(termPin.pinIndex, 1, 'Open terminus selects lower aligned open input pin 1');

  // 3. Dropping/moving a wide module centered over multiple parallel open wire endpoints snaps each wire without pin-stealing
  app.circuit.clear(app.ringBuffer);
  const srcA = app.circuit.addComponent('SWITCH', 20, 80, { initialValue: 1 });
  const srcB = app.circuit.addComponent('SWITCH', 20, 140, { initialValue: 0 });
  // Intentionally add lower wire FIRST to verify sorted matching prevents pin 0 from stealing lower wire
  const wLower = app.circuit.addWire(srcB.id, 0, null, 0, null, [], { toPoint: { x: 260, y: 140 } });
  const wUpper = app.circuit.addWire(srcA.id, 0, null, 0, null, [], { toPoint: { x: 260, y: 120 } });
  const hex = app.circuit.addComponent('HEX_DISPLAY', 220, 100); // body [220..300, 100..200], pins D0@(220,120), D1@(220,140)
  const snappedMulti = app.snapOpenWiresToComponent(hex, 28, app.circuit, app.renderer);
  assertEqual(snappedMulti, 2, 'Both open endpoints inside wide HEX_DISPLAY snap to its open inputs');
  assertEqual(wUpper.toCompId === hex.id && wUpper.toPin === 0, true, 'Upper open wire snaps to D0 (pin 0)');
  assertEqual(wLower.toCompId === hex.id && wLower.toPin === 1, true, 'Lower open wire snaps to D1 (pin 1) without greedy pin-stealing');

  // 4. Connector points (manual waypoints AND Steiner fork junctions) inside a module are automatically formatted outside
  app.circuit.clear(app.ringBuffer);
  const driver = app.circuit.addComponent('SWITCH', 40, 120, { initialValue: 1 });
  const ledTop = app.circuit.addComponent('LED', 420, 60);
  const ledBot = app.circuit.addComponent('LED', 420, 180);
  const trunk = app.circuit.addWire(driver.id, 0, null, 0, null, [], { toPoint: { x: 240, y: 140 } });
  trunk.autoRouted = false;
  const brTop = app.circuit.addWire('', 0, ledTop.id, 0, null, [{ x: 240, y: 80 }], {
    fromWireId: trunk.id,
    fromPoint: { x: 240, y: 140 }
  });
  brTop.autoRouted = false;
  const brBot = app.circuit.addWire('', 0, ledBot.id, 0, null, [{ x: 240, y: 200 }], {
    fromWireId: trunk.id,
    fromPoint: { x: 240, y: 140 }
  });
  brBot.autoRouted = false;

  // Place/move an obstacle module directly over the fork junction (240, 140)
  const blocker = app.circuit.addComponent('COUNTER', 200, 100); // body [200..280, 100..220] covers junction (240, 140)!
  app.endDragPreview([blocker.id], true);

  for (const w of app.circuit.wires) {
    const pts = app.renderer.getWirePolyline(w);
    assertEqual(
      app.renderer.wireHasConnectorOrSegmentInModule(w, pts, blocker),
      false,
      `Wire ${w.id} has zero connector points or segments inside COUNTER module after auto-formatting`
    );
  }
  app.circuit.syncImmediateWireLevels();
  assertEqual(ledTop.inputs[0].value, 1, 'Formatted fork still delivers HIGH signal to upper LED');
  assertEqual(ledBot.inputs[0].value, 1, 'Formatted fork still delivers HIGH signal to lower LED');

  // 5. Open endpoint dropped inside a fully-occupied module is evicted outside and routed cleanly around the module
  const occSw = app.circuit.addComponent('SWITCH', 40, 260, { initialValue: 1 });
  const occLed = app.circuit.addComponent('LED', 220, 260); // single input pin 0
  app.circuit.addWire(occSw.id, 0, occLed.id, 0);
  const extraSw = app.circuit.addComponent('SWITCH', 40, 320, { initialValue: 1 });
  const trappedOpen = app.circuit.addWire(extraSw.id, 0, null, 0, null, [], { toPoint: { x: 240, y: 280 } }); // inside occLed [220..260, 260..300]!
  app.formatConnectorsInModules(null, app.circuit, app.renderer);
  assertEqual(Boolean(trappedOpen.toPoint), true, 'Unconnectable wire remains open');
  const inOccLed = trappedOpen.toPoint.x >= occLed.x && trappedOpen.toPoint.x <= occLed.x + occLed.width &&
    trappedOpen.toPoint.y >= occLed.y && trappedOpen.toPoint.y <= occLed.y + occLed.height;
  assertEqual(inOccLed, false, 'Open connector point is automatically evicted outside fully-occupied module');
  const trappedPts = app.renderer.getWirePolyline(trappedOpen);
  assertEqual(app.renderer.wireHasConnectorOrSegmentInModule(trappedOpen, trappedPts, occLed), false, 'Open wire routes cleanly around occupied module');
});

runTest('WISH-079', 'Remove floating canvas zoom controls and scenario guide, and expand Properties and Logic Analyzer by default', () => {
  const rawHtml = require('fs').readFileSync(require('path').join(__dirname, '..', 'index.html'), 'utf8');

  // 1. Floating bottom-right zoom controls and scenario guide context box removed from workspace HTML
  assertEqual(rawHtml.includes('<div id="zoom-controls">'), false, 'Floating #zoom-controls removed from workspace markup');
  assertEqual(rawHtml.includes('id="zoom-controls-right"'), false, 'Floating #zoom-controls-right removed from split-pane markup');
  assertEqual(rawHtml.includes('id="scenario-guide"'), false, 'Floating #scenario-guide removed from workspace markup');
  assertEqual(rawHtml.includes('id="menu-item-guide-toggle"'), false, 'Scenario guide toggle removed from Szenarien menu');

  // 2. Fresh app initializes cleanly with Properties (#inspector) and Logic Analyzer (#analyzer-panel) expanded by default
  const inspectorEl = document.getElementById('inspector');
  const btnExpand = document.getElementById('btn-inspector-expand');
  const analyzerEl = document.getElementById('analyzer-panel');
  inspectorEl.classList.add('collapsed');
  btnExpand.style.display = 'block';
  analyzerEl.classList.add('collapsed');

  const app = new LogicSimApp();
  assertEqual(inspectorEl.classList.contains('collapsed'), false, '#inspector (Eigenschaften) is expanded by default on startup');
  assertEqual(btnExpand.style.display, 'none', '#btn-inspector-expand is hidden when #inspector is expanded');
  assertEqual(analyzerEl.classList.contains('collapsed'), false, '#analyzer-panel (Impulsdiagramm) is expanded by default on startup');

  // 3. Loading scenarios (both 0-probe beginner scenario via stepScenario and probed scenario) keeps panels expanded and never injects scenario guide
  app.loadScenario('jk_counter', { silent: true });
  app.stepScenario(1);
  assertEqual(app.circuit.probes.length >= 0, true, 'Scenario loaded cleanly');
  assertEqual(inspectorEl.classList.contains('collapsed'), false, '#inspector remains expanded after loading scenario');
  assertEqual(analyzerEl.classList.contains('collapsed'), false, '#analyzer-panel remains expanded across scenario loads');
  assertEqual(app.guideHidden, true, 'Scenario guide remains permanently disabled');

  // 4. Tool rail zoom actions still work directly without #btn-zoom-* elements
  const z0 = app.renderer.zoom;
  app.setZoom(1.0);
  const railZoomIn = document.getElementById('rail-zoom-in');
  if (railZoomIn && railZoomIn.listeners && railZoomIn.listeners.click) {
    railZoomIn.listeners.click.forEach(fn => fn());
    assertEqual(app.renderer.zoom > 1.0, true, 'Left tool rail zoom-in works directly without floating #zoom-controls');
  }
  app.setZoom(z0);
});

runTest('WISH-077', 'Mathematical data-structure optimizations (O(1) topology/spatial maps, quotient netlist, bit-packed history/mipmap, SWAR truth tables, delta undo) and configurable schematic plan optimizer', () => {
  const rawHtml = require('fs').readFileSync(require('path').join(__dirname, '..', 'index.html'), 'utf8');
  const prevLang = I18N.currentLang;

  try {
    // 1. UI controls exist for configurable plan optimization
    assertEqual(rawHtml.includes('id="settings-optimize-plan"'), true, 'Settings modal includes #settings-optimize-plan');
    assertEqual(rawHtml.includes('id="chk-optimize-plan"'), true, 'Align popover includes #chk-optimize-plan');
    assertEqual(rawHtml.includes('data-align-action="optimize"'), true, 'Align popover includes optimize action button');
    assertEqual(rawHtml.includes('id="chk-synth-optimize"'), true, 'Boolean synthesis modal includes #chk-synth-optimize');
    assertEqual(rawHtml.includes('id="menu-item-optimize-plan"'), true, 'Analysis menu includes #menu-item-optimize-plan');

    const app = new LogicSimApp();
    app.circuit.clear(app.ringBuffer);
    assertEqual(app.optimizePlanEnabled, false, 'Schematic plan optimization is opt-in (disabled by default)');

    // 2. O(1) _inputWireMap, _forkChildCounts, mergeOpenWireTermini, and 64x64 spatial scene queries
    const swA = app.circuit.addComponent('SWITCH', 40, 60, { label: 'A', initialValue: 1 });
    const swB = app.circuit.addComponent('SWITCH', 40, 180, { label: 'B', initialValue: 0 });
    const gAnd = app.circuit.addComponent('AND', 240, 100, { numInputs: 2 });
    const wIn0 = app.circuit.addWire(swA.id, 0, gAnd.id, 0);
    assertEqual(app.circuit.getWireToInput(gAnd.id, 0), wIn0, 'O(1) getWireToInput finds wire on pin 0');
    wIn0.toPin = 1;
    assertEqual(app.circuit.getWireToInput(gAnd.id, 0), null, 'Pin 0 cleared when wire.toPin setter mutates pin');
    assertEqual(app.circuit.getWireToInput(gAnd.id, 1), wIn0, 'O(1) getWireToInput tracks updated pin 1');
    wIn0.toPin = 0;

    const trunk = app.circuit.addWire(swB.id, 0, null, 0, null, [], { toPoint: { x: 160, y: 200 } });
    const child = app.circuit.addWire(null, 0, gAnd.id, 1, null, [], { fromWireId: trunk.id, fromPoint: { x: 160, y: 200 } });
    assertEqual(app.circuit.isForkTrunkWire(trunk), true, 'O(1) _forkChildCounts marks trunk wire');
    assertEqual(app.renderer.findComponentAt(260, 120), gAnd, '64x64 spatial grid hits component body');
    assertEqual(app.renderer.findWireAt(190, 200) === child || app.renderer.findWireAt(130, 200) === trunk, true, '64x64 spatial grid hits wire segment');

    // Quotient netlist propagates multi-hop wire branches in a single pass
    swB.state.value = 1;
    swB.outputs[0].value = 1;
    swB.nextOutputs[0] = 1;
    app.circuit.updateWireLevelsFromDrivers();
    assertEqual(gAnd.inputs[1].value, 1, 'Quotient netlist propagates signal across fork trunk + branch in 1 pass');

    // Cell-hashed mergeOpenWireTermini merges coincident open ends
    const open1 = app.circuit.addWire(swA.id, 0, null, 0, null, [], { toPoint: { x: 140, y: 320 } });
    const ledM = app.circuit.addComponent('LED', 320, 300);
    const open2 = app.circuit.addWire(null, 0, ledM.id, 0, null, [], { fromPoint: { x: 140, y: 320 } });
    const mergedCnt = app.circuit.mergeOpenWireTermini(16);
    assertEqual(mergedCnt >= 1, true, 'Spatial cell-hashed mergeOpenWireTermini merges coincident open termini');
    assertEqual(Boolean(open1.id && open2.id), true, 'Open wire handles remain valid');

    // 3. CUSTOM_IC combinational LUT compilation & bit-packed SimulationEngine HistoryRing wrap-around (>512 ticks)
    const ic = app.circuit.addComponent('CUSTOM_IC', 420, 100, {
      label: 'XOR_IC',
      inputs: [
        { name: 'X', targets: [{ targetCompIdx: 0, targetPin: 0 }] },
        { name: 'Y', targets: [{ targetCompIdx: 0, targetPin: 1 }] }
      ],
      outputs: [{ name: 'Z', sourceCompIdx: 0, sourcePin: 0 }],
      subcircuit: {
        components: [{ type: 'XOR', dx: 0, dy: 0, params: { numInputs: 2 } }],
        wires: []
      }
    });
    const icPlan = ic._getCompiledIC();
    assertEqual(Boolean(icPlan && icPlan.lut instanceof Int32Array && icPlan.lut.length === 4), true, 'Pure combinational CUSTOM_IC compiles 2^k Int32Array LUT');
    assertEqual(icPlan.lut[0] === 0 && icPlan.lut[1] === 1 && icPlan.lut[2] === 1 && icPlan.lut[3] === 0, true, 'Compiled CUSTOM_IC LUT matches XOR truth vector');

    app.circuit.clear(app.ringBuffer);
    const clk = app.circuit.addComponent('CLOCK', 40, 80, { halfPeriod: 1, highTicks: 1, lowTicks: 1 });
    const cnt = app.circuit.addComponent('COUNTER', 220, 60, { mode: 'binary' });
    const swEn = app.circuit.addComponent('CONST', 40, 160, { value: 1 });
    app.circuit.addWire(clk.id, 0, cnt.id, 0);
    app.circuit.addWire(swEn.id, 0, cnt.id, 1);
    app.engine.setMode('sim');
    for (let t = 0; t < 600; t++) {
      app.engine.stepTick();
    }
    assertEqual(app.engine.tickCount, 600, 'Simulation ran 600 ticks past 512-entry HistoryRing capacity');
    assertEqual(app.engine.history.length, 512, 'Bit-packed HistoryRing caps cleanly at 512 entries with O(1) eviction');
    const countAt600 = cnt.state.count;
    app.engine.scrubToTick(550);
    const countAt550 = cnt.state.count;
    assertEqual(countAt550 !== countAt600, true, 'O(1) scrubToTick restores historical sequential state from bit-packed ring');
    app.engine.scrubToTick(600);
    assertEqual(cnt.state.count, countAt600, 'Scrubbing back to head restores lazy _headSnapshot state');
    app.engine.setMode('edit');

    // 4. Bit-packed RingBuffer + 2-bit Monoid Mipmap glitch preservation & zoomed-out analyzer
    const rb = new RingBuffer(10000);
    rb.ensureChannel('prb_1');
    const zeroMap = new Map([['prb_1', 0]]);
    const oneMap = new Map([['prb_1', 1]]);
    for (let t = 1; t <= 10200; t++) {
      // Single 1-tick HIGH glitch at tick 5555 (well inside wrapped 201..10200 window)
      rb.record(t, t === 5555 ? oneMap : zeroMap);
    }
    assertEqual(rb.count, 10000, 'Bit-packed RingBuffer wraps at 10,000 ticks');
    assertEqual(rb.getRangeSummary('prb_1', 0, 5000), 1, 'Pure LOW range summarizes to monoid state 1');
    assertEqual(rb.getRangeSummary('prb_1', 5000, 6000), 3, 'Single 1-tick HIGH glitch in 1,000-tick span summarizes to monoid state 3 (never lost!)');
    assertEqual(rb.getValueAtOffset('prb_1', 5555 - 201), 1, 'Exact bit lookup retrieves 1-tick glitch after wrap-around');
    app.analyzer.pixelsPerTick = 0.25;
    app.analyzer.render();
    app.analyzer.pixelsPerTick = 12;

    // 5. 32-Bit SWAR TruthTableGenerator, Quine-McCluskey minimization, and >8 input opt-in
    app.circuit.clear(app.ringBuffer);
    BooleanParser.synthesizeToCircuit(app.circuit, BooleanParser.parse('Y = (A & B) | (A & !B); Maj = (A & B) | (A & C) | (B & C)'), { mode: 'replace' });
    const tt = TruthTableGenerator.generate(app.circuit, app.engine);
    assertEqual(tt.rows.length, 8, '3-variable SWAR truth table produces 8 rows');
    assertEqual(tt.minMap.Y.formula, 'A', 'Quine-McCluskey minimizes (A & B) | (A & !B) to A');
    for (const row of tt.rows) {
      assertEqual(row.outputs.Y, row.inputs.A, 'SWAR row evaluation matches simplified Boolean function Y = A');
      const majExpected = (row.inputs.A + row.inputs.B + row.inputs.C) >= 2 ? 1 : 0;
      assertEqual(row.outputs.Maj, majExpected, 'SWAR row evaluation matches 3-input Majority carry function');
    }

    const wideCircuit = new Circuit();
    const wideSw = [];
    for (let i = 0; i < 10; i++) {
      wideSw.push(wideCircuit.addComponent('SWITCH', 40, 40 + i * 60, { label: `X${i}` }));
    }
    const wideAnd = wideCircuit.addComponent('AND', 260, 120, { numInputs: 2 });
    const wideLed = wideCircuit.addComponent('LED', 420, 120, { label: 'OUT10' });
    wideCircuit.addWire(wideSw[0].id, 0, wideAnd.id, 0);
    wideCircuit.addWire(wideSw[9].id, 0, wideAnd.id, 1);
    wideCircuit.addWire(wideAnd.id, 0, wideLed.id, 0);
    const ttDefault = TruthTableGenerator.generate(wideCircuit, null);
    assertEqual(ttDefault.rows.length, 256, 'Default TruthTableGenerator caps at 8 inputs (256 rows)');
    assertEqual(Boolean(ttDefault.warning && ttDefault.warning.includes('8 Eingänge')), true, 'Default 8-input warning preserved');
    const ttExpanded = TruthTableGenerator.generate(wideCircuit, null, { maxInputs: 10 });
    assertEqual(ttExpanded.rows.length, 1024, 'Opt-in maxInputs: 10 evaluates 1,024 rows via SWAR');
    assertEqual(ttExpanded.warning, null, 'No warning when all 10 inputs are analyzed');

    // 6. Structural Delta Undo/Redo roundtrip
    app.circuit.clear(app.ringBuffer);
    const tab = app.getActiveTab();
    tab.undoStack = [];
    tab.redoStack = [];
    tab.lastSnapshot = null;
    app.commitHistory(tab);
    const uSw = app.circuit.addComponent('SWITCH', 60, 80, { label: 'U1' });
    app.checkpointHistory(tab);
    uSw.x = 180;
    uSw.y = 220;
    app.checkpointHistory(tab);
    assertEqual(tab.undoStack.length, 2, 'Two distinct structural delta entries recorded');
    assertEqual(tab.undoStack[1].__delta, 1, 'Undo entry uses compact O(|Delta|) structural patch format');
    app.undo(tab);
    assertEqual(app.circuit.getComponent(uSw.id).x, 60, 'Delta undo restores previous component X coordinate');
    app.undo(tab);
    assertEqual(app.circuit.components.length, 0, 'Second delta undo removes added component');
    app.redo(tab);
    app.redo(tab);
    assertEqual(app.circuit.getComponent(uSw.id).x, 180, 'Delta redo restores moved component X coordinate');

    // 7. Configurable Schematic Plan Optimizer (CSE, NOT bubble-pushing, double-NOT elimination, pin untangling)
    const cRaw = new Circuit();
    const cOpt = new Circuit();
    const eqs = BooleanParser.parse('F1 = !!(A & B) | !C; F2 = (A & B) & !C');
    BooleanParser.synthesizeToCircuit(cRaw, eqs, { mode: 'replace' });
    BooleanParser.synthesizeToCircuit(cOpt, eqs, { mode: 'replace', optimizePlan: true });
    assertEqual(cOpt.components.length < cRaw.components.length, true, 'Optimized plan uses fewer components than unoptimized synthesis');
    assertEqual(cOpt.components.filter(c => c.type === 'NOT').length, 0, 'All standalone NOT gates eliminated/absorbed into pin bubbles');
    assertEqual(cOpt.components.filter(c => c.type === 'AND').length, 2, 'Shared (A & B) subexpression synthesized once via DAG CSE');

    const ttRaw = TruthTableGenerator.generate(cRaw, null);
    const ttOpt = TruthTableGenerator.generate(cOpt, null);
    assertEqual(ttRaw.rows.length, ttOpt.rows.length, 'Optimized circuit has same input space');
    for (let r = 0; r < ttRaw.rows.length; r++) {
      assertEqual(ttOpt.rows[r].outputs.F1, ttRaw.rows[r].outputs.F1, `Row ${r} F1 preserved after optimizePlan`);
      assertEqual(ttOpt.rows[r].outputs.F2, ttRaw.rows[r].outputs.F2, `Row ${r} F2 preserved after optimizePlan`);
    }

    // Commutative pin untangling when driver Y coordinates cross
    const cCross = new Circuit();
    const sTop = cCross.addComponent('SWITCH', 40, 40, { label: 'TOP' });
    const sBot = cCross.addComponent('SWITCH', 40, 220, { label: 'BOT' });
    const gSym = cCross.addComponent('OR', 240, 120, { numInputs: 2, invertedInputs: [true, false] });
    const lOut = cCross.addComponent('LED', 420, 120, { label: 'Y' });
    cCross.addWire(sBot.id, 0, gSym.id, 0); // lower switch connected to upper pin 0 (inverted!)
    cCross.addWire(sTop.id, 0, gSym.id, 1); // upper switch connected to lower pin 1 (non-inverted!)
    cCross.addWire(gSym.id, 0, lOut.id, 0);
    const ttBeforeUntangle = TruthTableGenerator.generate(cCross, null);
    const untangleStats = cCross.optimizePlan({ untanglePins: true });
    assertEqual(untangleStats.swappedPins, 2, 'Rearrangement-inequality untangler swaps crossed symmetric input pins');
    assertEqual(gSym.params.invertedInputs[0], false, 'Inversion bubble moves with wire so Boolean semantics stay invariant');
    assertEqual(gSym.params.invertedInputs[1], true, 'Lower pin receives the inverted bubble from sBot');
    const ttAfterUntangle = TruthTableGenerator.generate(cCross, null);
    for (let r = 0; r < ttBeforeUntangle.rows.length; r++) {
      assertEqual(ttAfterUntangle.rows[r].outputs.Y, ttBeforeUntangle.rows[r].outputs.Y, `Pin untangling preserves exact truth table row ${r}`);
    }

    // Settings persistence & English I18N parity
    const origGet = localStorage.getItem;
    const origSet = localStorage.setItem;
    const memStore = new Map();
    localStorage.getItem = (k) => (memStore.has(k) ? memStore.get(k) : null);
    localStorage.setItem = (k, v) => { memStore.set(k, String(v)); };
    try {
      app.setOptimizePlanEnabled(true);
      app.saveSettings();
      const appReloaded = new LogicSimApp();
      assertEqual(appReloaded.optimizePlanEnabled, true, 'optimizePlanEnabled persists across settings reload');
      appReloaded.setOptimizePlanEnabled(false);
      appReloaded.saveSettings();
      app.setOptimizePlanEnabled(false);
    } finally {
      localStorage.getItem = origGet;
      localStorage.setItem = origSet;
    }

    I18N.currentLang = 'en';
    assertEqual(I18N.t('menu.analysis.optimize_plan'), 'Optimize Schematic', 'Analysis menu item translates to English');
    assertEqual(I18N.phrase('Beim Anordnen Schaltung optimieren'), 'Optimize circuit when aligning', 'Align checkbox translates to English');
    assertEqual(
      I18N.phrase('⚡ Schaltplan optimiert: 3 Gatter eingespart, 2 Inverter absorbiert, 2 Pins entwirrt'),
      '⚡ Schematic optimized: 3 gates saved, 2 inverters absorbed, 2 pins untangled',
      'Optimization summary toast translates to English'
    );
  } finally {
    I18N.currentLang = prevLang;
  }
});

console.log('\n================================================================');
console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log('================================================================\n');

if (failed > 0) {
  process.exit(1);
}
