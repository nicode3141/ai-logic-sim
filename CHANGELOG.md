# Changelog

All notable changes to the **AI Logic Simulator** (`ai-logic-sim`) are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.0-alpha] - 2026-11-10

### 🚀 Milestone Overview
The **Alpha Milestone** represents a comprehensive transformation of the AI Logic Simulator into a professional, robust, and highly optimized digital electronics design and simulation workstation. It incorporates 28 user-requested feature wishes (WISH-001 through WISH-028), extensive security penetration testing, memory leak hardening, and extreme fuzzing torture testing.

---

### ✨ Added

#### 1. Wire Topology, Branching & Auto-Snapping
* **Floating & Terminus-Free Connections (WISH-007)**: Wires and test leads can now terminate freely on the canvas grid without strictly requiring a component pin at both ends; visual terminal pad markers indicate open endpoints.
* **Interactive Moving & Reconnecting of Wire Termini (WISH-022)**: Open wire ends (`toPoint` and free `fromPoint`) can be grabbed via LMB drag, moved across the grid, and dropped directly onto component pins to establish permanent electrical connections.
* **Auto-Snap of Open Wires (WISH-026)**: Open wire ends automatically detect and snap to pins when components are placed via Drag & Drop, pasted via keyboard shortcut (<kbd>Ctrl</kbd>+<kbd>V</kbd>), or duplicated.
* **Unified NOT Gate with Wire Inlining & Pin Inversion (WISH-026)**: Dropping a NOT gate onto an existing wire automatically splices it inline; dropping it onto any component pin toggles inversion (○ bubble).
* **Universal Pin Inversion (WISH-026)**: Full support for inverting inputs and outputs on all logic gates (AND, OR, NAND, NOR, XOR, XNOR) and complex IC modules (Flip-Flops, Adders, Multiplexers).
* **Waypoint Context Menu (WISH-023)**: Right-clicking any wire corner/waypoint opens a dedicated context menu with options to delete only that waypoint or delete the entire wire.

#### 2. Timing Diagram & Logic Analyzer
* **Free Mouse Panning to Tick 0 (WISH-028)**: Dragging on the waveform canvas smoothly pans horizontally across the complete recording history back to tick 0 (`scrollRatio = 0.0`) without view locking.
* **RingBuffer Expanded Capacity (WISH-028)**: Default circular buffer history expanded from 256 to **10,000 ticks**, preserving complete history from tick 0.
* **Live Speed Badge & Clock Readout (WISH-028)**: Added `#analyzer-speed-badge` displaying real-time clock frequency and period duration (e.g., `10 Hz (100 ms)`), synchronized with the main simulation toolbar.
* **Premiere Pro Style Scrubbing & Timeline Navigation (WISH-015, WISH-024)**: Direct playhead scrubbing in the ruler header with automatic edge-scrolling and hold-repeat controls (<kbd>-1 Tick</kbd>, <kbd>+1 Tick</kbd>).
* **Dynamic Loop Brackets (WISH-025)**: Bracket controls (<kbd>[ In</kbd> and <kbd>] Out</kbd>) for loop playback anchored to exact ticks, with real-time millisecond duration scaling upon frequency adjustments.

#### 3. Visual Customization & Signal Contrasts
* **Signal Colors (HIGH & LOW) Customization (WISH-021)**: Full user control over HIGH (1) and LOW (0) wire colors with live preview bar, 8 balanced color presets, and fluid 60 FPS color pickers.
* **DIN EN 60617 Lamp Indicator Symbol (WISH-020, WISH-027)**: LEDs/lamps rendered according to international electrical standards as a pure circle with an internal diagonal cross (X), matching the outer outline color across both active and inactive states.
* **Switch & Source Component Contrast (WISH-027)**: Switch, button, and clock chassis interiors utilize `pal.gateFill` (clean white `#ffffff` in Java Swing and Light CAD), guaranteeing distinct visual contrast against dark LOW signal colors.

#### 4. User Interface, Desktop Modernization & Internationalization
* **Complete Bilingual Support (WISH-003, WISH-017)**: Comprehensive `I18N` localization engine with seamless German (`de`) and English (`en`) translations across all menus, toolbars, dialogs, inspector panels, and status bars.
* **Interactive Bottom Status Bar (WISH-002, WISH-010, WISH-014)**: Non-wrapping 38px toolbar, segmented status bar with live cursor coordinates, double-click coordinate editor with instant canvas jump, and extended field boundaries ($-5000$ to $+5000$ px).
* **Consistent Design Themes (WISH-016, WISH-018)**: High-contrast theme palettes for Modern Dark CAD, Pitch Black OLED, Java Swing Classic, Nordic Blueprint, and Clean Light.

#### 5. Simulation Engine & Physical Gate Delays
* **Physical Inertial Gate Propagation Delay (WISH-009)**: Realistic gate transitions where outputs retain prior states until the propagation delay completes; glitch filtering eliminates transient spikes shorter than the gate delay.
* **Global Gate Delay Setting (WISH-009)**: Configurable global delay (1–20 ticks) with toggleable badge display under gates (default: off).

---

### ⚡ Performance & Code Optimizations

* **Garbage Collection Churn Elimination in Simulation Loop**:
  * Replaced per-tick `new Map()` probe allocations in `SimulationEngine.stepTick` with a reusable internal cache (`this._probeSamplesCache`).
  * Replaced `this.channels.entries()` iterator allocation in `RingBuffer.record` with optimized `forEach` traversal.
  * Optimized snapshot storage in `SimulationEngine.createSnapshot` to utilize `Uint8Array` for wire levels instead of allocating hundreds of individual JavaScript objects per tick.
* **Multi-Hop Branched Wire Resolution**:
  * Resolved nested wire branch hierarchies transitively in $O(1)$ through direct `wireMap` pointer chasing in `syncImmediateWireLevels` and `updateWireLevelsFromDrivers`.
* **Parallel Wire Channel Deconfliction (WISH-004)**:
  * Automatic multi-channel offset calculation (`deconflictWireChannels`) prevents collinear parallel wires from visually colliding.
* **Collinear Bend Simplification (WISH-004)**:
  * Automatic pruning of redundant intermediate waypoints (`cleanWireWaypoints`) on mouse release.

---

### 🛡️ Security & Hardening (Pen-Testing)

* **Prototype Pollution Mitigation**:
  * Sanitized all object ingestion points in `Circuit.fromJSON`, `sanitizeParams`, and AST expressions against `__proto__`, `constructor.prototype`, and prototype overrides.
* **Denial of Service (DoS) Guard**:
  * Enforced circuit import limit of 5,000 components to prevent browser tab locking.
* **ReDoS & Recursion Depth Hardening in BooleanParser**:
  * Implemented maximum expression length limit of 20,000 characters.
  * Implemented strict parser nesting depth limit (100 levels) and AST evaluator depth limit (150 levels), preventing call-stack overflows on malicious recursive inputs.
* **Coordinate Poisoning Hardening**:
  * Validated and sanitized component coordinates and wire waypoints against `NaN`, `Infinity`, and extreme floating-point injection.
* **Race Condition Elimination on Multi-Driver Inputs**:
  * Implemented non-destructive logical OR (`|=`) input accumulation in `updateWireLevelsFromDrivers`, ensuring parallel branches arriving at an input pin do not clobber high signals.

---

### 🧹 Removed & Cleaned Up

* **Decoupled Loop Controls (WISH-028)**: Removed simulation play button hijacking that caused duplicate "Loop Play" labels.
* **Removed Redundant Controls (WISH-011, WISH-012, WISH-027)**:
  * Removed upper standard norm bar from toolbar.
  * Removed "Auswahl ausrichten" alignment buttons from toolbar.
  * Removed redundant "Design / Theme" dropdown from "Ansicht" (View) menu (retained in Settings).
  * Removed disruptive blue auto-zoom indicator bar from the logic analyzer header.
* **Eliminated Text Clutter (WISH-019)**:
  * Removed redundant `OUT`, `IN`, and `CLK` text labels on simple components (switches, buttons, clocks, constants, LEDs) to prevent label overlaps.
* **Accidental Branching Removed (WISH-013)**:
  * Disabled accidental wire branching on left-click hold; wire branching is now strictly intentional via context menu or pin drag.

---

### 🧪 Automated Test Suite Status

The test suite now encompasses **6 comprehensive automated testing suites** running under CI:
1. **Comprehensive & Logic Hardening Suite** (`tests/comprehensive_test_suite.js`): 48 tests passed (100%).
2. **Security & Penetration Audit Suite** (`tests/security_audit.js`): 0 vulnerabilities, 0 warnings.
3. **Stress & Feedback Loop Resilience Suite** (`tests/stress_test.js`): 4/4 stress tests passed.
4. **Extreme Fuzzing, Pen-Testing & Torture Suite** (`tests/fuzz_torture_suite.js`): 25/25 torture tests passed (including 16-bit Ripple Carry Adder, 50,000-step heap stability check, and 64-deep branch wire propagation).
5. **Simulation Engine Performance Benchmark** (`tests/benchmark_sim.js`): 1,000 gates cascade: ~0.045 ms/step; 101-NOT ring oscillator: ~0.0039 ms/step.
6. **Orthogonal Layout & Beauty Evaluation Suite** (`tests/layout_eval.js`): Average beauty score: 77/100, 0 collisions.
