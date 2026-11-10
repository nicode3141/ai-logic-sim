const fs = require('fs');
const path = require('path');

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

const htmlPath = path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const scriptMatch = html.match(/<script[\s\S]*?>([\s\S]*?)<\/script>/i);
const evalFn = new Function('window', 'document', 'localStorage', scriptMatch[1] + '; return { LogicSimApp, Circuit, Component, Wire };');
const { Circuit } = evalFn(window, document, localStorage);

console.log('======================================================');
console.log('       SIMULATION ENGINE PERFORMANCE BENCHMARK        ');
console.log('======================================================\n');

function benchmark1000Gates() {
  const c = new Circuit();
  const count = 1000;
  let prevComp = c.addComponent('SWITCH', 0, 0);
  prevComp.outputs[0].value = 1;

  for (let i = 0; i < count; i++) {
    const nextComp = c.addComponent(i % 2 === 0 ? 'BUFFER' : 'NOT', (i + 1) * 20, 0);
    c.addWire(prevComp.id, 0, nextComp.id, 0);
    prevComp = nextComp;
  }

  // Warmup
  for (let s = 0; s < 10; s++) c.step();

  // Benchmark 200 steps
  const t0 = performance.now();
  const steps = 200;
  for (let s = 0; s < steps; s++) {
    c.step();
  }
  const dt = performance.now() - t0;
  console.log(`1,000 gates x ${steps} steps: ${dt.toFixed(2)} ms (${(dt / steps).toFixed(3)} ms/step)`);
  return dt;
}

function benchmarkRingOscillator() {
  const c = new Circuit();
  const ringSize = 101;
  const inverters = [];
  for (let i = 0; i < ringSize; i++) {
    inverters.push(c.addComponent('NOT', i * 20, 0));
  }
  for (let i = 0; i < ringSize; i++) {
    c.addWire(inverters[i].id, 0, inverters[(i + 1) % ringSize].id, 0);
  }

  const t0 = performance.now();
  const steps = 5000;
  for (let s = 0; s < steps; s++) {
    c.step();
  }
  const dt = performance.now() - t0;
  console.log(`Ring Oscillator (${ringSize} NOTs) x ${steps} steps: ${dt.toFixed(2)} ms (${(dt / steps).toFixed(4)} ms/step)`);
  return dt;
}

benchmark1000Gates();
benchmarkRingOscillator();
