// Automated Layout Evaluation Suite & SVG Visualizer for AI pairs
// Can be run anytime via: node tests/layout_eval.js

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

const window = {
  addEventListener: () => {}, removeEventListener: () => {},
  devicePixelRatio: 1, innerWidth: 1920, innerHeight: 1080
};

const document = {
  getElementById: (id) => ({
    id, textContent: '', value: '10', width: 1200, height: 800,
    addEventListener: () => {}, querySelectorAll: () => [],
    classList: { add: () => {}, remove: () => {}, toggle: () => {} },
    style: {}, getContext: () => mockCtx,
    parentElement: { getBoundingClientRect: () => ({ width: 1200, height: 800 }) },
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 1200, height: 800 })
  }),
  querySelectorAll: () => [],
  createElement: () => ({
    addEventListener: () => {}, appendChild: () => {}, querySelectorAll: () => [],
    classList: { add: () => {}, remove: () => {}, toggle: () => {} }, style: {},
    getContext: () => mockCtx
  }),
  body: { style: {} },
  activeElement: null
};

const localStorage = { getItem: () => null, setItem: () => {} };

// 2. Load index.html logic
const htmlPath = path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const scriptMatch = html.match(/<script[\s\S]*?>([\s\S]*?)<\/script>/i);
if (!scriptMatch) throw new Error('No script tag found in index.html');

const evalFn = new Function('window', 'document', 'localStorage', scriptMatch[1] + '; return { LogicSimApp, Circuit, Component, Wire, DEMO_PRESETS, GRID_SIZE };');
const { LogicSimApp, Circuit, Component, Wire, DEMO_PRESETS, GRID_SIZE } = evalFn(window, document, localStorage);

// 3. Define Benchmark Test Circuits
const BENCHMARKS = {
  '1_bcd_clock': DEMO_PRESETS.bcd_clock,
  '2_lfsr_light': DEMO_PRESETS.lfsr_light,
  '3_full_adder': {
    version: 1,
    components: [
      { id: 'in_a',   type: 'SWITCH', x: 20, y: 40,  params: { label: 'Input A', initialValue: 1 } },
      { id: 'in_b',   type: 'SWITCH', x: 20, y: 120, params: { label: 'Input B', initialValue: 0 } },
      { id: 'in_cin', type: 'SWITCH', x: 20, y: 200, params: { label: 'Carry In (Cin)', initialValue: 1 } },
      { id: 'xor1',   type: 'XOR',    x: 100, y: 60, params: { label: 'XOR1' } },
      { id: 'and1',   type: 'AND',    x: 100, y: 140, params: { label: 'AND1' } },
      { id: 'xor2',   type: 'XOR',    x: 220, y: 80, params: { label: 'XOR2' } },
      { id: 'and2',   type: 'AND',    x: 220, y: 160, params: { label: 'AND2' } },
      { id: 'or1',    type: 'OR',     x: 320, y: 180, params: { label: 'OR_Cout' } },
      { id: 'out_sum',  type: 'LED',  x: 420, y: 80,  params: { label: 'Sum (S)', color: 'green' } },
      { id: 'out_cout', type: 'LED',  x: 420, y: 180, params: { label: 'Cout', color: 'red' } }
    ],
    wires: [
      { id: 'w1', fromCompId: 'in_a', fromPin: 0, toCompId: 'xor1', toPin: 0 },
      { id: 'w2', fromCompId: 'in_b', fromPin: 0, toCompId: 'xor1', toPin: 1 },
      { id: 'w3', fromCompId: 'in_a', fromPin: 0, toCompId: 'and1', toPin: 0 },
      { id: 'w4', fromCompId: 'in_b', fromPin: 0, toCompId: 'and1', toPin: 1 },
      { id: 'w5', fromCompId: 'xor1', fromPin: 0, toCompId: 'xor2', toPin: 0 },
      { id: 'w6', fromCompId: 'in_cin', fromPin: 0, toCompId: 'xor2', toPin: 1 },
      { id: 'w7', fromCompId: 'xor1', fromPin: 0, toCompId: 'and2', toPin: 0 },
      { id: 'w8', fromCompId: 'in_cin', fromPin: 0, toCompId: 'and2', toPin: 1 },
      { id: 'w9', fromCompId: 'and2', fromPin: 0, toCompId: 'or1', toPin: 0 },
      { id: 'w10', fromCompId: 'and1', fromPin: 0, toCompId: 'or1', toPin: 1 },
      { id: 'w11', fromCompId: 'xor2', fromPin: 0, toCompId: 'out_sum', toPin: 0 },
      { id: 'w12', fromCompId: 'or1',  fromPin: 0, toCompId: 'out_cout', toPin: 0 }
    ]
  },
  '4_sr_latch': {
    version: 1,
    components: [
      { id: 'btn_s',  type: 'BUTTON', x: 40, y: 60,  params: { label: 'Set (S)' } },
      { id: 'btn_r',  type: 'BUTTON', x: 40, y: 180, params: { label: 'Reset (R)' } },
      { id: 'nand1',  type: 'NAND',   x: 180, y: 80, params: { label: 'NAND 1' } },
      { id: 'nand2',  type: 'NAND',   x: 180, y: 160, params: { label: 'NAND 2' } },
      { id: 'led_q',  type: 'LED',    x: 320, y: 80,  params: { label: 'Q', color: 'green' } },
      { id: 'led_qn', type: 'LED',    x: 320, y: 160, params: { label: 'Q_not', color: 'red' } }
    ],
    wires: [
      { id: 'w_s',   fromCompId: 'btn_s', fromPin: 0, toCompId: 'nand1', toPin: 0 },
      { id: 'w_fb1', fromCompId: 'nand2', fromPin: 0, toCompId: 'nand1', toPin: 1 },
      { id: 'w_fb2', fromCompId: 'nand1', fromPin: 0, toCompId: 'nand2', toPin: 0 },
      { id: 'w_r',   fromCompId: 'btn_r', fromPin: 0, toCompId: 'nand2', toPin: 1 },
      { id: 'w_q',   fromCompId: 'nand1', fromPin: 0, toCompId: 'led_q', toPin: 0 },
      { id: 'w_qn',  fromCompId: 'nand2', fromPin: 0, toCompId: 'led_qn', toPin: 0 }
    ]
  }
};

// 4. Metric Calculators
function checkSegmentsIntersect(a1, a2, b1, b2) {
  // Check if two line segments (a1-a2 and b1-b2) strictly intersect in an orthogonal grid
  const isHorizA = a1.y === a2.y;
  const isHorizB = b1.y === b2.y;

  if (isHorizA && !isHorizB) {
    const minAx = Math.min(a1.x, a2.x);
    const maxAx = Math.max(a1.x, a2.x);
    const minBy = Math.min(b1.y, b2.y);
    const maxBy = Math.max(b1.y, b2.y);
    // Strict interior intersection (not sharing endpoints)
    return b1.x > minAx && b1.x < maxAx && a1.y > minBy && a1.y < maxBy;
  }
  if (!isHorizA && isHorizB) {
    const minAy = Math.min(a1.y, a2.y);
    const maxAy = Math.max(a1.y, a2.y);
    const minBx = Math.min(b1.x, b2.x);
    const maxBx = Math.max(b1.x, b2.x);
    return a1.x > minBx && a1.x < maxBx && b1.y > minAy && b1.y < maxAy;
  }
  return false;
}

function evaluateLayout(app, circuitName) {
  const circuit = app.circuit;
  const comps = circuit.components;
  const wires = circuit.wires;

  let collisions = 0;
  let gridErrors = 0;

  // 1. Check Collisions & Grid Snapping
  for (let i = 0; i < comps.length; i++) {
    const c1 = comps[i];
    if (c1.x % GRID_SIZE !== 0 || c1.y % GRID_SIZE !== 0) {
      gridErrors++;
    }
    for (let j = i + 1; j < comps.length; j++) {
      const c2 = comps[j];
      const overlapX = !(c1.x + c1.width <= c2.x || c2.x + c2.width <= c1.x);
      const overlapY = !(c1.y + c1.height <= c2.y || c2.y + c2.height <= c1.y);
      if (overlapX && overlapY) {
        collisions++;
      }
    }
  }

  // 2. Wire Metrics
  const wirePolylines = [];
  let straightWires = 0;
  let totalBends = 0;
  let totalWireLength = 0;

  for (const w of wires) {
    const pts = app.renderer.getWirePolyline(w);
    wirePolylines.push(pts);

    let isStraight = true;
    let len = 0;
    if (pts.length === 2 && pts[0].y === pts[1].y) {
      straightWires++;
    }
    if (pts.length > 2) {
      totalBends += (pts.length - 2);
    }
    for (let i = 0; i < pts.length - 1; i++) {
      len += Math.abs(pts[i+1].x - pts[i].x) + Math.abs(pts[i+1].y - pts[i].y);
    }
    totalWireLength += len;
  }

  // 3. Count Wire Crossings
  const allSegments = [];
  for (const pts of wirePolylines) {
    for (let i = 0; i < pts.length - 1; i++) {
      allSegments.push({ p1: pts[i], p2: pts[i + 1] });
    }
  }

  let crossings = 0;
  const crossingDetails = [];
  for (let i = 0; i < allSegments.length; i++) {
    for (let j = i + 1; j < allSegments.length; j++) {
      if (checkSegmentsIntersect(allSegments[i].p1, allSegments[i].p2, allSegments[j].p1, allSegments[j].p2)) {
        crossings++;
        crossingDetails.push({ s1: allSegments[i], s2: allSegments[j] });
      }
    }
  }

  const straightRatio = wires.length > 0 ? straightWires / wires.length : 1;
  const score = Math.max(0, Math.round(
    100
    - (collisions * 40)
    - (gridErrors * 30)
    - (crossings * 12)
    - (totalBends * 1.5)
    + (straightRatio * 25)
  ));

  return {
    circuitName,
    componentCount: comps.length,
    wireCount: wires.length,
    collisions,
    gridErrors,
    crossings,
    straightWires,
    straightRatio: Math.round(straightRatio * 100),
    totalBends,
    totalWireLength,
    score: Math.min(100, score),
    wirePolylines,
    comps,
    crossingDetails
  };
}

// 5. Generate SVG for Visual AI Inspection
function generateSVG(result, outPath) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const c of result.comps) {
    minX = Math.min(minX, c.x);
    minY = Math.min(minY, c.y);
    maxX = Math.max(maxX, c.x + c.width);
    maxY = Math.max(maxY, c.y + c.height);
  }
  for (const pts of result.wirePolylines) {
    for (const p of pts) {
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x);
      maxY = Math.max(maxY, p.y);
    }
  }

  const pad = 40;
  minX -= pad; minY -= pad;
  maxX += pad; maxY += pad;
  const w = maxX - minX;
  const h = maxY - minY;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${w} ${h}" width="${w}" height="${h}" style="background:#0b0f19; font-family: sans-serif;">\n`;
  svg += `<defs>\n`;
  svg += `<pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">\n`;
  svg += `  <circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.12)"/>\n`;
  svg += `</pattern>\n`;
  svg += `</defs>\n`;
  svg += `<rect x="${minX}" y="${minY}" width="${w}" height="${h}" fill="url(#grid)"/>\n`;

  // Draw Wires
  svg += `<g id="wires">\n`;
  for (const pts of result.wirePolylines) {
    if (pts.length < 2) continue;
    const pathStr = pts.map((p, idx) => (idx === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');
    svg += `  <path d="${pathStr}" fill="none" stroke="#00e676" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>\n`;
  }
  svg += `</g>\n`;

  // Draw Components
  svg += `<g id="components">\n`;
  for (const c of result.comps) {
    svg += `  <g transform="translate(${c.x}, ${c.y})">\n`;
    svg += `    <rect width="${c.width}" height="${c.height}" rx="6" fill="#131b2e" stroke="#2a3b5c" stroke-width="1.8"/>\n`;
    svg += `    <text x="${c.width / 2}" y="18" fill="#e2e8f0" font-size="11" font-weight="bold" text-anchor="middle">${c.params.label || c.type}</text>\n`;
    svg += `    <text x="${c.width / 2}" y="32" fill="#64748b" font-size="9" text-anchor="middle">${c.type}</text>\n`;

    // Pins
    for (const p of c.inputs) {
      svg += `    <circle cx="${p.relX}" cy="${p.relY}" r="3" fill="#00b0ff"/>\n`;
      svg += `    <text x="${p.relX + 6}" y="${p.relY + 3}" fill="#94a3b8" font-size="8">${p.name}</text>\n`;
    }
    for (const p of c.outputs) {
      svg += `    <circle cx="${p.relX}" cy="${p.relY}" r="3" fill="#00e676"/>\n`;
      svg += `    <text x="${p.relX - 6}" y="${p.relY + 3}" fill="#94a3b8" font-size="8" text-anchor="end">${p.name}</text>\n`;
    }
    svg += `  </g>\n`;
  }
  svg += `</g>\n`;

  // Overlay stats
  svg += `<rect x="${minX + 15}" y="${minY + 15}" width="240" height="85" rx="6" fill="rgba(15,23,42,0.85)" stroke="#334155"/>\n`;
  svg += `<text x="${minX + 25}" y="${minY + 35}" fill="#38bdf8" font-size="12" font-weight="bold">${result.circuitName} (Score: ${result.score}/100)</text>\n`;
  svg += `<text x="${minX + 25}" y="${minY + 52}" fill="#f8fafc" font-size="10">Crossings: ${result.crossings} | Collisions: ${result.collisions}</text>\n`;
  svg += `<text x="${minX + 25}" y="${minY + 68}" fill="#f8fafc" font-size="10">Straight Wires: ${result.straightWires}/${result.wireCount} (${result.straightRatio}%)</text>\n`;
  svg += `<text x="${minX + 25}" y="${minY + 84}" fill="#f8fafc" font-size="10">Total 90° Bends: ${result.totalBends}</text>\n`;

  svg += `</svg>`;
  try { fs.mkdirSync(path.dirname(outPath), { recursive: true }); } catch (e) {}
  fs.writeFileSync(outPath, svg, 'utf8');
}

// 6. Run Test Suite
function runTestSuite() {
  console.log('======================================================');
  console.log('       AI LOGIC SIMULATOR - AUTO-LAYOUT EVAL SUITE    ');
  console.log('======================================================\n');

  const scratchDir = 'C:\\Users\\leqit\\.gemini\\antigravity-cli\\brain\\00a4dae0-e337-4d01-9f56-f5b0136eb988\\scratch';
  const outDir = fs.existsSync(scratchDir) ? scratchDir : __dirname;
  const results = [];

  for (const [name, preset] of Object.entries(BENCHMARKS)) {
    const app = new LogicSimApp();
    app.circuit.fromJSON(preset);
    app.autoLayoutCircuit();

    const res = evaluateLayout(app, name);
    results.push(res);

    const svgPath = path.join(outDir, `${name}.svg`);
    generateSVG(res, svgPath);

    console.log(`[CIRCUIT: ${name}]`);
    console.log(`  Score:         ${res.score} / 100`);
    console.log(`  Crossings:     ${res.crossings} ${res.crossings === 0 ? '✓ (PERFECT)' : '✗'}`);
    console.log(`  Collisions:    ${res.collisions} ${res.collisions === 0 ? '✓' : '✗'}`);
    console.log(`  Grid Errors:   ${res.gridErrors} ${res.gridErrors === 0 ? '✓' : '✗'}`);
    console.log(`  Straight Wires:${res.straightWires}/${res.wireCount} (${res.straightRatio}%)`);
    console.log(`  Total Bends:   ${res.totalBends}`);
    console.log(`  SVG Snapshot:  ${svgPath}`);
    if (res.crossings > 0) {
      console.log('  Components:');
      for (const c of res.comps) {
        console.log(`    ${c.id} (${c.type}): x=${c.x}, y=${c.y}`);
      }
      console.log('  Wires:');
      for (const w of app.circuit.wires) {
        const fromC = app.circuit.getComponent(w.fromCompId);
        const toC = app.circuit.getComponent(w.toCompId);
        const p1 = fromC.getPinWorldPos(true, w.fromPin);
        const p2 = toC.getPinWorldPos(false, w.toPin);
        console.log(`    ${w.id} (${w.fromCompId}->${w.toCompId}): p1=(${p1.x},${p1.y}) p2=(${p2.x},${p2.y}) offset=${w.channelOffset}`);
      }
      console.log('  Crossings details:');
      for (const cd of res.crossingDetails) {
        console.log(`    Seg1: (${cd.s1.p1.x},${cd.s1.p1.y})->(${cd.s1.p2.x},${cd.s1.p2.y}) vs Seg2: (${cd.s2.p1.x},${cd.s2.p1.y})->(${cd.s2.p2.x},${cd.s2.p2.y})`);
      }
    }
    console.log('');
  }

  const avgScore = Math.round(results.reduce((s, r) => s + r.score, 0) / results.length);
  const totalCrossings = results.reduce((s, r) => s + r.crossings, 0);
  const totalCollisions = results.reduce((s, r) => s + r.collisions, 0);

  console.log('------------------------------------------------------');
  console.log(`AVERAGE BEAUTY SCORE: ${avgScore} / 100`);
  console.log(`TOTAL CROSSINGS:      ${totalCrossings}`);
  console.log(`TOTAL COLLISIONS:     ${totalCollisions}`);
  console.log('======================================================\n');

  return { results, avgScore };
}

if (require.main === module) {
  runTestSuite();
}

module.exports = { runTestSuite, evaluateLayout, BENCHMARKS, generateSVG };
