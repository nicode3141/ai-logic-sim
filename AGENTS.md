# AGENTS.md

Guidance for AI coding agents and human contributors working on **AI Logic Simulator** (`ai-logic-sim`).

This file is the fast path to understanding the project. When in doubt, prefer the existing code and documents over assumptions.

---

## 1. Project Summary

AI Logic Simulator is an offline-capable, browser-based digital logic circuit simulator. It is a **single-file application**: all HTML, CSS, and JavaScript live in `index.html` (roughly 23,000 lines / 1 MB). There is no build step, bundler, package dependency, or CDN requirement.

Main capabilities:

- Drag-and-drop logic components: switches, buttons, clocks, constants, gates, LEDs, 7-segment displays, adders, multiplexers, counters, shift registers, flip-flops, probes, custom ICs.
- Edit mode and simulation mode with tick-based two-phase simulation.
- Configurable gate delays, clock frequency, and wire behavior.
- Logic analyzer with waveform history, playhead scrubbing, panning, zooming, and loop playback.
- Orthogonal wire routing, waypoints, branches, floating wire ends, wire bridges, and optional diagonal wires.
- Auto-layout and auto-routing with a documented CAD-oriented algorithm.
- Truth table generation and Boolean-expression-to-circuit synthesis.
- Built-in scenarios/tutorials, multi-tab circuits, split-screen view, inspector, and custom modules.
- Five UI themes, three gate-symbol standards, and German/English localization.

The UI source language is **German**. English is provided through the `I18N` translation layer. Code, identifiers, and most technical documentation are in English.

---

## 2. Quick Start

No installation is required to run the application.

```bash
open index.html
```

Run all tests:

```bash
npm test
```

Equivalent direct command:

```bash
node tests/run_all_tests.js
```

Individual suites:

```bash
npm run test:comprehensive
npm run test:fuzz
npm run test:layout
npm run test:bench
```

CI uses **Node.js 20**. Tests use only Node built-ins and require no `npm install`.

---

## 3. Repository Map

| Path | Purpose |
|---|---|
| `index.html` | Entire application: DOM, CSS, and JavaScript. Primary source file. |
| `tests/` | Node-based test, stress, fuzz, security, layout, and benchmark suites. |
| `tests/run_all_tests.js` | Unified CI test runner. |
| `tests/output/` | Generated SVG/layout artifacts. Gitignored; safe to delete. |
| `WISHLIST.md` | Feature tracker, WISH IDs, branch history, and completed-work notes. |
| `CHANGELOG.md` | Keep-a-Changelog-style release history. |
| `CONTRIBUTING.md` | Branching model, commit standard, testing, and versioning rules. |
| `docu/PROMPT_LOG.md` | Chronological log of user prompts and related work. Append-only. |
| `docu/AUTO_LAYOUT_SPEC.md` | Detailed auto-layout and orthogonal-routing specification. |
| `docu/docu.txt` | Older pre-repository prompt notes. |
| `.github/workflows/test.yml` | CI test workflow. |
| `.github/workflows/static.yml` | GitHub Pages deployment from `main`. |
| `.github/pull_request_template.md` | Pull-request checklist. |
| `package.json` | Metadata, version, and test scripts. No runtime dependencies. |
| `scratch_check.ps1`, `tests/test_fix.js` | Small scratch/utility files. Do not treat them as core tooling. |

---

## 4. Branching, Commits, and Collaboration

The project uses two long-lived branches:

- `main`: production, always deployable, deployed to GitHub Pages.
- `dev`: integration/development branch for all completed work.

Short-lived branches are created from `dev`:

- `feat/<name>` for features
- `fix/<name>` for bug fixes
- `chore/<name>` for maintenance/tooling/repository work
- `docs/<name>` for documentation
- `hotfix/<name>` for urgent production fixes, branched from `main`, merged to `main`, then back-merged to `dev`

Rules:

- Never commit directly to `main`.
- Keep branches focused and short-lived; delete them after merging.
- Open a PR targeting `dev` (or `main` for an approved release/hotfix).
- Fetch and update from `dev` before starting work.
- Do not recreate the retired legacy `alpha` or `beta` branches. Their history is preserved by release/archive tags.
- No Git worktrees are used.

### Commit format

Use Conventional Commits in the imperative mood:

```text
<type>(<scope>): <short summary>

<optional body explaining what and why>

Refs: WISH-XXX
Co-authored-by: opencode-agent[bot] <156322137+opencode-agent[bot]@users.noreply.github.com>
```

Common types: `feat`, `fix`, `test`, `docs`, `refactor`, `chore`, `ci`.

AI-assisted commits must include the co-author trailer above.

### Prompt log

Every new user prompt must be appended to `docu/PROMPT_LOG.md` with:

- date
- author
- branch
- related WISH/issue ID
- prompt text or a faithful excerpt when a large CI log was pasted

Never rewrite or delete prior entries. Redact secrets and personal data.

### Documentation expectations

- New features and user-visible changes: update `WISHLIST.md` and `CHANGELOG.md`.
- Release changes: follow Keep a Changelog and semantic versioning.
- Layout/routing changes: keep `docu/AUTO_LAYOUT_SPEC.md` accurate.
- Do not move historical release or archive tags.

---

## 5. Architecture

### 5.1 Single-file execution model

`index.html` contains the DOM, CSS, and one large `<script>` block. It must remain directly openable in a browser without a server, build step, or external resources.

The comprehensive test suite loads `index.html`, extracts the first `<script>` block, and executes it with `new Function(...)`. It then exposes selected classes and helpers through an explicit return object. If tests need a new top-level class or function, update that return object and the destructuring in `tests/comprehensive_test_suite.js`.

### 5.2 Core domain classes

| Class/component | Responsibility |
|---|---|
| `RingBuffer` | Fixed-capacity circular sample history, default 10,000 ticks, used by the logic analyzer. |
| `Wire` | Endpoints, waypoints, branching, routing style, signal level, JSON serialization. |
| `Probe` | Logic-analyzer channel metadata, color, and sampling. |
| `Component` | Component state, pins, parameters, logic evaluation, JSON serialization, hit testing. |
| `Circuit` | Owns components, wires, probes, O(1) lookup maps, IDs, import/export, topology operations. |
| `SimulationEngine` | Tick loop, two-phase evaluation, frequency, run/pause/reset, gate-delay handling, history. |
| `AutoLayoutEngine` | Layered left-to-right placement, pin constraints, spacing, feedback handling. |
| `WireRouter` | Orthogonal routing, trunk/channel allocation, crossing/bend optimization. |
| `LayoutMetrics` | Layout quality scoring and benchmark metrics. |
| `CanvasRenderer` | Main canvas rendering, components, pins, wires, themes, bridges, hit testing. |
| `LogicAnalyzerRenderer` | Waveform rendering, probes, timeline, playhead, loop range, pan/zoom/scrub. |
| `InspectorUI` | Inspector panel for selected components, wires, and probes. |
| `BooleanParser` | Boolean-expression parsing and validation with safety limits. |
| `TruthTableGenerator` | Truth-table generation and normal-form extraction. |
| `ScenarioBuilder` | Builds predefined scenario circuits and localized variants. |
| `TabSession` | Per-tab circuit, ring buffer, undo/redo stacks, pan/zoom, scenario state. |
| `LogicSimApp` | Application controller: DOM wiring, events, modes, tabs, persistence, dialogs, settings. |

The file also contains dictionaries, theme palettes, component metrics, demo presets, scenario definitions, icon SVG strings, and helper functions.

### 5.3 Simulation model

The simulator deliberately avoids recursive gate evaluation. Each tick is a two-phase unit-delay update:

1. **Read and compute**: every component reads current input levels and writes its next output into a temporary buffer.
2. **Commit and propagate**: all next outputs are applied together and propagated through wires.

This prevents call-stack overflow in feedback circuits such as NAND-based SR latches.

Important behavior:

- Each input pin has at most one driver; each output may fan out.
- Unconnected inputs read as LOW (`0`).
- Clocks and sequential components are edge-triggered.
- Gate delay is configurable per circuit (`1` to `20` ticks, default `1`) and uses an inertial model: short pulses can be filtered out.
- Gate-delay badges are off by default.
- Simulation frequency is limited to `1`-`60` Hz.
- The engine keeps a bounded history (default `512`) for step-back support.
- The logic analyzer keeps 10,000 ticks and only displays playhead information when samples exist.

### 5.4 Geometry and routing invariants

- Grid size: `20 px`.
- Canvas field: `-5000` to `+5000` on both axes; the origin is centered.
- Coordinates must be finite numbers and clamped to field bounds.
- Wires support component-to-component, component-to-open-end, wire-to-wire, branching, and floating endpoints.
- Normal wires are orthogonal/Manhattan. Diagonal wires are opt-in via `allowDiagonalWires`.
- Wire bridges at crossings are enabled by default and must work for orthogonal and diagonal segments.
- Auto-layout is left-to-right and CAD-oriented. It uses port-aware ordering, commutative pin swapping for symmetric gates, pin-height alignment, and trunk/channel routing. See `docu/AUTO_LAYOUT_SPEC.md` before changing layout behavior.

### 5.5 UI and theming

Major UI regions:

- menubar and dropdowns
- toolbar with edit/simulation modes, align controls, simulation deck, scenarios, undo/redo
- component palette with search and text/preview modes
- document tabs and optional split-screen secondary canvas
- inspector
- logic analyzer panel
- status bar with coordinates, mode, counts, and zoom
- modals for settings, truth table, Boolean synthesis, scenarios, shortcuts/welcome

Themes: `modern`, `pitch_black`, `java_swing`, `blueprint`, `light_cad`.

Symbol standards: `DIN_40700`, `DIN_60617` (IEC), `ANSI`.

When adding or changing UI, use existing CSS variables and theme palette tokens rather than hardcoded colors. Renderer code must remain theme-aware for both the main canvas and the analyzer.

### 5.6 Localization

- German is the source language.
- `I18N.t(key)` translates keyed UI strings from the `de`/`en` dictionaries.
- `I18N.phrase(text)` translates dynamic German source strings and patterns, but **returns the input unchanged unless `I18N.currentLang === 'en'`**.
- Markup uses `data-i18n`, `data-i18n-title`, and `data-i18n-placeholder` attributes.
- New user-facing German strings need English translations in the phrase dictionary or an appropriate keyed entry.
- Tests that exercise English translation must set `I18N.currentLang = 'en'` and restore the previous value in a `finally` block.

### 5.7 Persistence

The app uses `localStorage` for user state. Known keys:

- `logicsim_theme`
- `logicsim_language`
- `logicsim_symbol_norm`
- `logicsim_user_settings`
- `logicsim_wire_bridges`
- `logicsim_allow_diagonal_wires`
- `logicsim_global_delay`
- `logicsim_show_gate_delay`
- `logicsim_tabs`
- `logicsim_autosave`
- `logicsim_custom_modules`
- `logicsim_inspector_width`
- `logicsim_scenarios_seen`
- `logicsim_guide_collapsed`
- `logicsim_welcomed`

When adding a setting, update both the load and save paths and preserve backward compatibility.

### 5.8 Scenarios and custom modules

- Scenarios are defined centrally in the `SCENARIOS` collection and built/localized through `ScenarioBuilder`.
- Scenario progress is persisted.
- Custom modules can be saved as multi-part macros or compressed `CUSTOM_IC` components.
- Custom module limits: 60 saved modules, 300 parts per module.
- `CUSTOM_IC` inputs come from external switches/buttons/clocks; outputs come from LEDs/displays and are evaluated through subcircuit simulation.

---

## 6. Testing

All suites are Node scripts. The unified runner executes each suite in a separate process and fails the run if any suite exits non-zero.

| Suite | Focus |
|---|---|
| `comprehensive_test_suite.js` | Logic rules, security bounds, interaction invariants, UI contract, i18n, WISH regression tests. |
| `security_audit.js` | HTML escaping, sanitization, coordinate/parameter poisoning, parser and import limits. |
| `stress_test.js` | Feedback loops, clone/rollback state, topology roundtrips, simulation resilience. |
| `fuzz_torture_suite.js` | Fuzzed inputs, malformed topology, extreme nesting and pathological cases. |
| `benchmark_sim.js` | Simulation throughput/performance. |
| `layout_eval.js` | Auto-layout quality: crossings, collisions, bends, straight wires, beauty score. |

### Test harness details

- Tests read and evaluate `index.html` source directly.
- The DOM is mocked; there is no real browser layout, canvas rendering, or CSS engine.
- `document.getElementById` lazily creates mock elements. Their `textContent` is empty unless a test sets it.
- `querySelector`/`querySelectorAll` are minimal. Do not add production logic that depends on unsupported DOM behavior without updating the mocks.
- Static markup assertions often read the raw HTML string rather than mock DOM state.
- Canvas contexts are mocked, so drawing code can be executed but pixels are not validated.
- Tests run sequentially in one process and share globals. Restore language, settings, and other global state after tests.
- `tests/output/` is generated and gitignored.

### Test conventions

- Add or update a `runTest('WISH-XXX', ...)` regression test for each tracked wish/behavior change.
- Use the existing `assertEqual` helper and match surrounding naming/style.
- Do not weaken assertions merely to make a test pass. Fix the product or correct the test setup/precondition.
- Run `npm test` before committing and again after merge.
- If a test depends on analyzer samples, explicitly record a sample in the `RingBuffer`; a fresh app has no playhead sample.

---

## 7. CI/CD

- `.github/workflows/test.yml` runs all suites on pushes to `main`, `dev`, and feature branches (`feat/**`, `fix/**`, `chore/**`, `docs/**`, `hotfix/**`), and on PRs targeting `main` or `dev`.
- `.github/workflows/static.yml` deploys the repository root to GitHub Pages on pushes to `main`, plus manual dispatch.
- CI uses Node 20 and `node tests/run_all_tests.js`.
- Keep `main` deployable. Do not merge experimental or WIP work into `main`.

---

## 8. Security and Robustness Rules

These are intentional hardening boundaries; do not bypass them:

- Escape user-controlled HTML with `escapeHtml`.
- Sanitize parameter objects with `sanitizeParams`; strip prototype-pollution keys.
- Validate finite coordinates and clamp to field bounds.
- Reject imports above 5,000 components or 10,000 wires.
- Limit Boolean input to 20,000 characters and parser nesting depth to 100.
- Custom modules are capped at 60 modules and 300 parts each.
- Preserve deterministic behavior for invalid/missing inputs.
- Keep localStorage access defensive; storage can throw or contain stale/malformed JSON.

---

## 9. Coding Conventions

- Use modern vanilla JavaScript (ES6+) inside the single `<script>` block.
- Do not add frameworks, libraries, CDNs, external fonts, or build tooling.
- Keep the application functional offline when opened directly from disk.
- Prefer targeted edits. Avoid rewriting or reformatting the entire `index.html`.
- Follow existing naming, class structure, indentation, and section organization.
- Use existing constants (`GRID_SIZE`, field bounds, palette tokens, limits) instead of duplicating magic numbers.
- Use existing theme colors/CSS variables; do not hardcode theme-specific colors in renderers.
- Preserve DOM IDs and class contracts. Tests, menus, inline handlers, and CSS depend on them.
- Add new user-facing text in German and English, with the correct `I18N` mechanism.
- Persist new settings in both the load and save paths.
- Use `requestAnimationFrame` for visual updates and debounce/throttle expensive storage writes.
- Prefer O(1) maps (`compMap`, `wireMap`, `probeMap`) and cached pointers in hot simulation/render paths.
- Keep comments sparse and meaningful, matching the existing codebase.
- Preserve UTF-8 encoding. German umlauts and special symbols have caused mojibake in merges before.

### Adding a new component

Check all relevant integration points:

1. Component type/params and `Component` evaluation.
2. `rebuildPins()` geometry and labels.
3. Palette button/category and translations.
4. Renderer drawing for all symbol standards/themes.
5. Inspector controls.
6. Wire/hit-test behavior.
7. JSON import/export and sanitization.
8. Simulation behavior, edge cases, and limits.
9. Tests and `WISHLIST.md`/`CHANGELOG.md`.

### Adding a new scenario

Update the central scenario definitions, ensure localization works, keep the progress list consistent, and add/adjust tests if behavior is covered.

### Adding or changing a theme

Update the CSS theme selector, `getThemePalette()`, renderer/analyzer theme branches, settings theme cards, and theme-related tests. Verify all five existing themes remain usable.

---

## 10. Definition of Done

A change is complete when:

- The implementation is targeted and consistent with existing patterns.
- User-facing text works in German and English.
- Relevant tests are added or updated, and `npm test` passes.
- `WISHLIST.md` and `CHANGELOG.md` are updated for feature/user-visible changes.
- Documentation is updated where behavior, architecture, or workflow changed.
- The commit uses Conventional Commits and includes the AI co-author trailer when applicable.
- The prompt was appended to `docu/PROMPT_LOG.md`.
- The branch is merged into `dev`, pushed, and deleted.
- `main` is not changed unless this is an approved release or hotfix.

---

## 11. Known Pitfalls and Strategic Notes

- `index.html` is very large. Search before editing, inspect surrounding code, and make surgical changes.
- The test harness evaluates source text, not a browser bundle. A syntax error in `index.html` breaks test loading.
- The mock DOM does not reproduce real layout or initial HTML text. For static UI contracts, assert against the raw HTML source.
- `I18N.phrase()` silently returns German unless the current language is `en`. This has caused false positives/negatives in tests.
- Analyzer assertions can fail because a fresh circuit has zero ring-buffer samples; record a sample when testing playhead output.
- Test globals are shared. Language, settings, and mock element state can leak between tests.
- The legacy `alpha`/`beta` branches were retired after a multi-step migration. Do not restore them; use `dev` and feature branches.
- Archive tags such as `archive/alpha`, `archive/beta`, and `archive/begin` preserve retired history. Do not move or delete them.
- `main` intentionally does not contain all `dev` documentation/tests/features until a release is promoted. Do not assume `main` and `dev` are identical.
- `tests/output/`, `.idea/`, `node_modules/`, and `.worktrees/` are ignored. Do not commit generated artifacts.
- There is no README. Treat `AGENTS.md`, `CONTRIBUTING.md`, `WISHLIST.md`, `CHANGELOG.md`, and `docu/` as the documentation source of truth.
- If a feature touches analyzer rendering, simulation timing, wire routing, or i18n, add focused regression tests; these areas have the highest historical failure rate.
- Future improvements worth considering: browser-based smoke tests for real canvas interactions, shared test helpers to prevent state leakage, and eventually extracting modules from the single-file source without breaking the offline single-file requirement.
