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

const htmlPath = path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const scriptMatch = html.match(/<script[\s\S]*?>([\s\S]*?)<\/script>/i);
if (!scriptMatch) throw new Error('No script tag found in index.html');

const evalFn = new Function('window', 'document', 'localStorage', scriptMatch[1] + '; return { LogicSimApp, Circuit, Component, Wire, BooleanParser, TruthTableGenerator, sanitizeHtml: typeof sanitizeHtml !== "undefined" ? sanitizeHtml : null, escapeHtml: typeof escapeHtml !== "undefined" ? escapeHtml : null };');
const exported = evalFn(window, document, localStorage);

console.log('================================================================');
console.log('       SECURITY & HARDENING AUDIT: AI LOGIC SIMULATOR           ');
console.log('================================================================\n');

let findings = [];

function checkVulnerability(category, name, testFn) {
  try {
    const result = testFn();
    if (result && result.vulnerable) {
      findings.push({ category, name, severity: result.severity, details: result.details });
      console.log(`[VULNERABLE] [${result.severity.toUpperCase()}] ${name}`);
      console.log(`  Details: ${result.details}\n`);
    } else {
      console.log(`[SECURE] ${name}`);
    }
  } catch (err) {
    findings.push({ category, name, severity: 'HIGH', details: `Uncaught exception during test: ${err.message}` });
    console.log(`[ERROR/CRASH] ${name}: ${err.message}\n`);
  }
}

// 1. Prototype Pollution via JSON import
checkVulnerability('PROTOTYPE_POLLUTION', 'Payload attacking Object.prototype via __proto__ in fromJSON', () => {
  const maliciousJSON = JSON.parse(`{
    "components": [
      {
        "id": "c1",
        "type": "SWITCH",
        "params": {
          "__proto__": { "polluted": "YES_PWNED" }
        }
      }
    ],
    "wires": []
  }`);

  const circuit = new exported.Circuit();
  circuit.fromJSON(maliciousJSON);

  const testObj = {};
  if (testObj.polluted === 'YES_PWNED' || Object.prototype.polluted === 'YES_PWNED') {
    delete Object.prototype.polluted;
    return { vulnerable: true, severity: 'CRITICAL', details: 'Object.prototype was polluted via circuit component params' };
  }
  return { vulnerable: false };
});

// 2. Prototype Pollution via constructor.prototype
checkVulnerability('PROTOTYPE_POLLUTION', 'Payload attacking Object.prototype via constructor.prototype in fromJSON', () => {
  const maliciousJSON = JSON.parse(`{
    "components": [
      {
        "id": "c1",
        "type": "SWITCH",
        "params": {
          "constructor": {
            "prototype": { "pollutedConstructor": "YES_PWNED" }
          }
        }
      }
    ],
    "wires": []
  }`);

  const circuit = new exported.Circuit();
  circuit.fromJSON(maliciousJSON);

  const testObj = {};
  if (testObj.pollutedConstructor === 'YES_PWNED' || Object.prototype.pollutedConstructor === 'YES_PWNED') {
    delete Object.prototype.pollutedConstructor;
    return { vulnerable: true, severity: 'CRITICAL', details: 'Object.prototype was polluted via constructor.prototype' };
  }
  return { vulnerable: false };
});

// 3. Deep Recursion Stack Overflow DoS in BooleanParser
checkVulnerability('DOS', 'Call-stack exhaustion via deeply nested expressions in BooleanParser', () => {
  const deepParens = '('.repeat(5000) + 'A' + ')'.repeat(5000);
  try {
    exported.BooleanParser.parse(deepParens);
    return { vulnerable: false };
  } catch (err) {
    if (err.name === 'RangeError' || err.message.includes('Maximum call stack size exceeded')) {
      return { vulnerable: true, severity: 'HIGH', details: `Stack overflow on deeply nested expression (5000 parens): ${err.message}` };
    }
    return { vulnerable: false };
  }
});

// 4. Repeated NOT unary operator recursion DoS
checkVulnerability('DOS', 'Stack overflow via chained NOT operators (!...!)', () => {
  const chainedNot = '!'.repeat(5000) + 'A';
  try {
    exported.BooleanParser.parse(chainedNot);
    return { vulnerable: false };
  } catch (err) {
    if (err.name === 'RangeError' || err.message.includes('Maximum call stack size exceeded')) {
      return { vulnerable: true, severity: 'HIGH', details: `Stack overflow on chained NOTs (5000 nots): ${err.message}` };
    }
    return { vulnerable: false };
  }
});

// 5. AST Evaluation Stack Overflow DoS
checkVulnerability('DOS', 'Stack overflow during AST evaluation', () => {
  let node = { type: 'VAR', name: 'A' };
  for (let i = 0; i < 5000; i++) {
    node = { type: 'NOT', child: node };
  }
  try {
    exported.BooleanParser.evaluateAST(node, { A: 1 });
    return { vulnerable: false };
  } catch (err) {
    if (err.name === 'RangeError' || err.message.includes('Maximum call stack size exceeded')) {
      return { vulnerable: true, severity: 'HIGH', details: `Stack overflow during evaluateAST: ${err.message}` };
    }
    return { vulnerable: false };
  }
});

// 6. Number of inputs in TruthTableGenerator - Memory / CPU exhaustion
checkVulnerability('DOS', 'Exponential explosion on TruthTableGenerator with many inputs', () => {
  const circuit = new exported.Circuit();
  for (let i = 0; i < 20; i++) {
    circuit.addComponent('SWITCH', i * 20, 0, { label: `IN_${i}` });
  }
  const led = circuit.addComponent('LED', 500, 0, { label: 'OUT' });
  const t0 = Date.now();
  const res = exported.TruthTableGenerator.generate(circuit);
  const elapsed = Date.now() - t0;
  if (res.rows && res.rows.length > 256) {
    return { vulnerable: true, severity: 'HIGH', details: `Generated ${res.rows.length} rows (> 256 uncapped), taking ${elapsed}ms` };
  }
  return { vulnerable: false };
});

// 7. NaN / Infinity coordinate injection in circuit components
checkVulnerability('SYSTEMS_RESILIENCE', 'Handling NaN / Infinity / -Infinity coordinates safely', () => {
  const circuit = new exported.Circuit();
  const c1 = circuit.addComponent('AND', NaN, Infinity);
  if (isNaN(c1.x) || !isFinite(c1.x) || isNaN(c1.y) || !isFinite(c1.y)) {
    return { vulnerable: true, severity: 'MEDIUM', details: `Component accepted NaN/Infinity coordinates: x=${c1.x}, y=${c1.y}` };
  }
  return { vulnerable: false };
});

// 8. Sanitization check: Does escapeHtml/sanitizeHtml exist?
checkVulnerability('XSS', 'HTML entity escaping function availability and correctness', () => {
  if (typeof exported.escapeHtml !== 'function' && typeof exported.sanitizeHtml !== 'function') {
    return { vulnerable: true, severity: 'HIGH', details: 'No centralized HTML entity escaping function exported or implemented in index.html' };
  }
  return { vulnerable: false };
});

console.log('================================================================');
console.log(`AUDIT COMPLETE: Found ${findings.length} vulnerabilities/issues.`);
console.log('================================================================');
