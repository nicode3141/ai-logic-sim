# Changelog

All notable changes to the **AI Logic Simulator** (`ai-logic-sim`) are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### ✨ Added
- **Feature:** Konfigurierbare Signallaufzeit/Verzögerung (`0..20` Ticks — global, modulspezifisch im Paletten-Dropdown `#palette-delay-type` sowie je Instanz und Mehrfachauswahl im Inspector) gilt jetzt neben den 10 Grundgattern für alle Kombinatorik- und Sequenzmodule (`FULL_ADDER`, `MUX`, `DECODER`, `BCD_DEC`, `SR_FF`, `D_FF`, `JK_FF`, `T_FF`, `D_LATCH`, `COUNTER`, `SHIFT_REG`, `CUSTOM_IC`), getrennt von der Pin-Stummelgeometrie (`ONLY_GATE_TYPES` in `rebuildPins()`), mit synchroner Mehrkanal-Verzögerung (`pendingOutputs` in `Component.commit()`), verzögerter Innenanzeige (`committed*`) und Edit-Modus-Propagation (`stepCombinational()` / `settleZeroDelayGates()`) (WISH-074).
- **Feature:** Gabelungspunkte (Verbindungsknoten) von Leitungen lassen sich jetzt direkt auf der Arbeitsfläche greifen und orthogonal im 20px-Raster verschieben (`CanvasRenderer.findJunctionAt`, Hover-/Drag-Markierung in `drawWires`, Junction-Drag in `LogicSimApp.initCanvasEvents`); zudem funktionieren Eckpunkt-, Mittelpunkts- und Segment-Handles nun über alle in `selectedWireIds` ausgewählten Leitungen hinweg inkl. sauberer Knoten-Mitführung beim Ziehen angrenzender Segmente (WISH-073).
- **Feature:** Leitungs-Gabelungen werden jetzt intern nativ als verzweigter `fromWireId` + `fromPoint`-Baum ohne überlappende Stammsegmente gespeichert (`Circuit.normalizeForkWires`, `Circuit.resolveWireRoot`): geteilte Stammabschnitte existieren nach Auto-Layout, Auto-Routing sowie beim manuellen Zeichnen exakt einmal, jeder Abzweig beginnt direkt an seiner Gabelung (keine Überlappung mit Geschwisterzweigen beim Anklicken von Zweigenden), `AutoLayoutEngine`/`WireRouter`/`LayoutMetrics`/`copySelection`/`Circuit.removeWire` (mit sauberer Stamm-Promotion beim Löschen einzelner Zweige) unterstützen beliebige Verzweigungstiefen (WISH-071).
- **Feature:** Klick auf eine Leitung vor einer Gabelung (`getForkWireIdsAt`) wählt automatisch alle Leitungen an bzw. hinter der Gabelung gemeinsam aus (sowohl explizite `fromWireId`/`toWireId`-Abzweigungen inkl. Unterverzweigungen als auch gemeinsame Ausgangs-Stammleitungen); ein Klick hinter der Gabelung wählt weiterhin nur den angeklickten Einzelzweig (WISH-070).
- **Feature:** Kanäle im Impulsdiagramm lassen sich jetzt beliebig nach oben und unten umsortieren — direkt per vertikalem Drag & Drop oder kompakten `▲`/`▼`-Schaltflächen im Kanal-Gutter (`LogicAnalyzerRenderer`), über die Buttons `Kanal-Reihenfolge:` im Inspector sowie über das Rechtsklick-Kontextmenü (`Nach oben verschieben` / `Nach unten verschieben`), inkl. Erhalt der `RingBuffer`-Aufzeichnung, Undo/Redo-Verlauf und JSON-Persistenz (WISH-064).
- **Feature:** Beim Taktgenerator (`CLOCK`) lassen sich jetzt die Dauer der `HIGH`-Phase (`highTicks`) und der `LOW`-Phase (`lowTicks`) getrennt in Ticks (inkl. ms-Anzeige anhand des aktuellen Hz-Werts) im Inspector einstellen sowie auf dem Bauteil (`H:… L:…` bei asymmetrischem Tastverhältnis) anzeigen (WISH-063).
- **Feature:** Wenn „Schräge Leitungen erlauben“ aktiv ist, nutzen „Alles anordnen“ (`autoLayoutCircuit`) und „Leitungen neu verlegen“ (`autoRouteAllWires`) schräge Verbindungen gezielt dort, wo sie optimal sind (z. B. gekreuzte Rückkopplungen bei RS-Flip-Flops über die Gate-Lücke oder komplexe Umwege mit `>= 3` Knicken), während normale Vorwärtsverbindungen sauber rechtwinklig bleiben (WISH-061).
- **Feature:** Beim Ziehen von Bauteilen, Messpunkten oder eigenen Modulen aus der Palette in den Arbeitsbereich wird das echte Bauteil als Live-Vorschau zentriert im 20px-Raster direkt am Cursor mitgeführt (`startPaletteDrag`, `updatePaletteDragGhost`, `drawPaletteDragGhost`) sowie über ein schwebendes Canvas-Overlay (`#palette-drag-ghost-overlay`) bereits beim Bewegen über andere GUI-Bereiche (Palette, Toolbar, Inspector, Analyzer) angezeigt (WISH-058).
- **Feature:** Gatterverzögerung lässt sich jetzt bis auf `0` (`Sofort (0 ms)` / `Instant (0 ms)`) herunterregeln — global, modulspezifisch in der Palette sowie im Inspector für Einzel- und Mehrfachauswahlen; `0 ms`-Gatter propagieren Signale sowohl im Edit-Modus als auch im Simulationsmodus sofort ohne Tick-Wartezeit (WISH-057).
- **Feature:** Verzögerung (Gatterlaufzeit) lässt sich direkt bei Mehrfachauswahlen (`InspectorUI.renderMulti`) für alle selektierten Gatter gemeinsam einstellen sowie in der Bauteil-Palette (`#palette-delay-type` + `#palette-global-delay-slider`) sowohl global als auch modulspezifisch pro Gattertyp (`moduleGateDelays`) direkt beim Drag & Drop steuern; zudem werden Gatterverzögerungen im Edit-Modus zeitgesteuert mit der aktuellen Taktfrequenz (Hz) propagiert (`Circuit.stepCombinational()`, `triggerEditPropagation`) und in Palette, Inspector & Einstellungen direkt in Millisekunden umgerechnet (`X Ticks (Y ms)`) (WISH-055).
- **Feature:** Auswahlrechteck (`selectionBox`) selektiert Module und Leitungen bereits live während der Mausbewegung statt erst beim Loslassen (WISH-054).
- **Feature:** Editierbare Ein- und Ausgangs-Pin-Beschriftungen (`Pin-Beschriftungen`) im Inspector für sämtliche Modultypen inkl. Synchronisation für eigene ICs und englischer I18N-Übersetzung (WISH-051).
- **Feature:** Persistente Projekt-Workflow-Regel (`.agents/rules/project-workflow.md`) für Kontext-Check, Dokumentation (`WISHLIST.md`, `CHANGELOG.md`, `docu/PROMPT_LOG.md`), Tests und Git/PR-Konventionen hinzugefügt.
- **Feature:** Die Kamera folgt beim Verschieben ausgewählter Module - am Rand der Arbeitsfläche scrollt die Ansicht automatisch mit (WISH-048).

### 🔧 Changed
- **Fix:** Theme-Karten-Kontrast in den Einstellungen (`#settings-theme-cards`) behoben: Alle 5 `[data-theme="..."]`-Variablenblöcke verwenden jetzt `:not(.theme-card)`, sodass `--text-main` nicht mehr auf Karten-Vorschauen überschrieben wird, und `.theme-card-title`/`.theme-card-desc` unter `java_swing` und `light_cad` nutzen explizite dunkle Kontrastfarben (`#000000`/`#333333` bzw. `#0f172a`/`#475569`); zudem erzeugt `Circuit.normalizeForkWires()` jetzt dedizierte Steiner-Stammleitungen (`Circuit.isForkTrunkWire`), sodass nachgelagerte Zweigleitungen erst exakt am Gabelungspunkt starten und ein Klick auf eine untere Kette keine vorgelagerten Stammabschnitte mitauswählt (`getForkWireIdsAt`, `Circuit.removeWire` mit automatischem Stamm-Merge/Cleanup, `LogicSimApp.routeWires`, `LayoutMetrics.evaluate`) (WISH-073).
- **Fix:** „Bauteil löschen“ im Einzelbauteil-Kontextmenü (`LogicSimApp.showContextMenu`) erhält mit `.ctx-danger-btn` jetzt ebenfalls einen durchgehend roten Hintergrund über alle 5 Themes; zudem zeichnet `CanvasRenderer.drawComponentPins()` bei Nicht-Gatter-Modulen keine permanenten Pin-Kreise mehr (`if (isHovered)` für Ein- und Ausgänge), sodass Module visuell klarer wirken, während Hover-Pin-Kreise (`drawPinCircle`, Radius `6`) und äußere Invertierungsblasen (`!isGateComp && isInv`, `rBubble = 3.2`) erhalten bleiben (WISH-072).
- **Fix:** Kontrast der Auswahlkreise an offenen Leitungsenden, Segment-Mittelpunkten und beim aktiven Leitungsziehen (`drawWires`, `drawActiveWireDrag`) auf hellen Themes (`java_swing`, `light_cad`) auf `#0f172a` / `#0284c7` statt unsichtbarem `#ffffff` korrigiert; zudem Inhalte, Icons und Buttons in Auswahlfenstern (`.btn`, `#inspector-content > .btn`, `.ctx-item`, `.ctx-danger-btn`, `.ctx-chip`, `.norm-card`, `.theme-card`, `.seg-control`) sauber zentriert und ausgerichtet (WISH-069).
- **Fix:** Inspector-Overflow beim `Verlegungsart:`-Dropdown (`.inspector-select`, `styleRow` mit `flex-wrap`/`min-width: 0` und `overflow-x: hidden` im `#inspector`) behoben sowie `.inspector-select` im `java_swing`-Theme passend gestaltet; zudem öffnet ein Klick auf den Messpunkt-Text-Button im Impulsdiagramm-Gutter (`btns.rename`) bzw. auf das Messpunkt-Textfeld auf der Arbeitsfläche (Klick auf bereits selektierten Badge oder Doppelklick) jetzt direkt ein Inline-Eingabefeld (`openInlineProbeRenameInput`) zum sofortigen Umbenennen (WISH-068).
- **Fix:** „Auswahl löschen“ im Mehrfachauswahl-Kontextmenü (`.ctx-item.danger.ctx-danger-btn`) sowie Lösch-Buttons (`.btn-danger`, inkl. `java_swing`-Theme-Override) erhalten jetzt einen durchgehend roten Hintergrund mit weißer Schrift über alle 5 Themes; zudem verhindert ein `gap` im `.ctx-header` das Aneinanderstoßen von Titel und Zähler in der Mehrfachauswahl (WISH-067).
- **Fix:** Globale Verzögerung `0` (`Sofort (0 ms)`) wirkt nun durchgängig ohne Rest-Delay auf die gesamte Schaltung: `Circuit.settleZeroDelayGates()` bezieht bei `globalGateDelay === 0` neben Gattern auch `BCD_DEC`, `FULL_ADDER`, `MUX`, `DECODER`, `CUSTOM_IC` sowie im Simulationsmodus sequenzielle Bausteine (`JK_FF`, `D_FF`, `T_FF`, `SR_FF`, `D_LATCH`, `COUNTER`, `SHIFT_REG`) zweiphasig und Race-frei ein (sodass z. B. asynchrone Ripple-Counter im 0-ms-Modus ohne Tick-Treppenstufen umschalten); außerdem behalten `loadScenario()` und `loadDemoPreset()` die eingestellte globale/modulspezifische Verzögerung bei (WISH-066).
- **Fix:** `NOT`-Gatter (und alle anderen Logikgatter in DIN, ANSI und IEC) schrumpfen beim Invertieren eines Eingangs nicht mehr zusammen: `drawGateShape()` und `drawGateIEC()` nutzen `inLeadInset = 0`, sodass die Eingangs-Invertierungsblase außen auf dem 20px-`GATE_PIN_STUB` sitzt und die volle Symbolgröße erhalten bleibt (WISH-065).
- **Fix:** Ruckeliges/laggendes Palette-Drag & Drop durch natives `mousedown` → `mousemove` → `mouseup`-Dragging (`bindPaletteItemDrag`), `requestAnimationFrame`-Throttling (`_schedulePaletteDragFrame`), GPU-`translate3d`-Overlay-Bewegung, gecachte Makro-Teile sowie selektives Canvas-Redraw nur bei tatsächlichem 20px-Rasterwechsel auf volle Bildwiederholrate (60–144 fps) optimiert (WISH-058).
- **Fix:** Eckpunkt- und Segment-Handles von Leitungen vollständig synchronisiert: `drawWires()` zeichnet Handles nun exakt auf den sichtbaren Ecken (`pts.slice(1, -1)` statt veralteter kollinearer `w.waypoints`), `ensureWireWaypoints(w, true)` synchronisiert Indizes vor jeder Bearbeitung, Endsegment-Ziehen (`draggingSegment`) aktualisiert `segmentIndex` statt bei jedem `mousemove` unendlich neue Punkte zu pushen, und `removeWaypointFromWire` bereinigt kollineare Reste (WISH-062).
- **Fix:** Browser-Geisterbild des Paletten-Buttons beim Drag & Drop unterdrückt: `setDragImage` nutzt jetzt ein bereits beim Start vorgeladenes transparentes 1×1-`Image()` statt eines unattached `<canvas>`, sodass Chromium den beigen Button nicht mehr neben dem Ghost-Modul mitbewegt (WISH-058).
- **Fix:** Slider-Offset im `java_swing`-Theme behoben (`border: none` + `box-shadow` auf `::-webkit-slider-runnable-track`/`::-moz-range-track` sowie `margin: 0; padding: 0` auf `input[type="range"]`, sodass der Reglergriff exakt bündig sitzt); zudem zeigt das Modul-Dropdown (`#palette-delay-dropdown`) nun bei jedem Eintrag links den Modulnamen und rechtsbündig kompakt die jeweilige Verzögerungszahl in `ms` an (WISH-060).
- **Fix:** Eingangs- und Ausgangsinvertierungs-Blasen (`○`) bei Nicht-Gatter-Modulen (`SHIFT_REG`, `T_FF`, `COUNTER`, `CUSTOM_IC`, usw.) werden in `drawComponentPins()` nun sauber außen bündig an der Modulkante gezeichnet statt innen mit dem Pin-Kreis zu überlappen (WISH-059).
- **Fix:** Ausgangs-Invertierung (`invertedOutput`) bei Flip-Flops (`T_FF`, `D_FF`, `JK_FF`, `SR_FF`, `D_LATCH`), Zählern (`COUNTER`) und Schieberegistern (`SHIFT_REG`) wird jetzt sowohl in `compute()` als auch beim Zeichnen der `○`-Blase (ohne Doppel-Markierung auf `Q̅`) korrekt ausgewertet; `NOT`-Gatter besitzen wieder 20px-Eingangs- und Ausgangsstäbe (`GATE_PIN_STUB`); und `LED`s rasten beim Verschieben (`endDragPreview`) sowie beim Ablegen einer Leitung auf dem Bauteilkörper zuverlässig am Eingangspin ein (WISH-056).
- **Fix:** Halten und Aktivieren eines Tasters (`BUTTON`, z. B. `Reset (RST)`) am Rand des Arbeitsbereichs löst kein Auto-Pan, kein `wire._preview` und kein ungewolltes Mitziehen der Schaltung mehr aus (WISH-053).
- **Fix:** Doppelte Pin-Label-Zeichnung bei komprimierten Custom-ICs (`CUSTOM_IC`, z. B. `SSW`/`LLEEDD`) behoben und Breite sauber am 20px-Grid ausgerichtet (WISH-051).
- **Fix:** Umschalten in der Bauteil-Palette zwischen „Vorschau“ und „Beschriftung“ zerschießt das Layout nicht mehr (`.palette-preview-canvas` standardmäßig `display: none`); Modul-Vorschauen sind jetzt größer (`76px`/`96px`), schärfer (`renderDpr >= 2`) und kontrastreicher und aktualisieren sich bei Theme-, Norm- und Farbumschaltung (WISH-052).
- **Fix:** „Kompakt“-Modus beim Auto-Anordnen behält jetzt mindestens 1 Grid-Zelle (`20px`) vertikalen Abstand (`labelPad: 20`), sodass gestapelte Eingänge/LEDs sich nicht berühren und Bauteilnamen lesbar bleiben; plus hindernisbewusstes Leitungs-Rerouting beim Bauteil-Verschieben (WISH-049).
- **Fix:** Theme- und Toast-Farbbalance (`#sim-toast`, `.btn-accent`, Slider, `.pane-header`, `#zoom-controls`), Erhalt von `--accent-green` bei Signalfarb-Wechsel sowie kontrastreicher `moduleValue`-Token für Modul-Innenwerte in hellen Themes (`java_swing`, `light_cad`) (WISH-050).
- **Feature:** Doppelte Takt-/Zoom-Anzeigen im Impulsdiagramm entfernt, nur noch die Slider (WISH-047).
- **Fix:** Bauteil-Palette ist im Simulationsmodus abgedunkelt (55 %) und gesperrt (WISH-046).
- Migrated the long-lived branching model from the legacy `alpha`/`beta` tiers to `main` (production) and `dev` (development/integration) (WISH-045).
- Documented the short-lived feature-branch workflow and Conventional Commit standard, including the required `Co-authored-by` trailer, in `CONTRIBUTING.md` and `WISHLIST.md`.
- Updated the CI branch filters to `main`, `dev`, and the `feat/*`, `fix/*`, `chore/*`, `docs/*`, `hotfix/*` prefixes.
- Added `docu/PROMPT_LOG.md` as the chronological, multi-person prompt log.

### 🗑️ Removed
- **Fix:** „Vertikal gleichmäßig verteilen“ und „Horizontal gleichmäßig verteilen“ (`distributeSelection`, `[data-distribute]`, Kontextmenü-Einträge, Hilfe-Eintrag und I18N-Texte) vollständig aus dem Programm entfernt (WISH-067).
- **Fix:** Abschnitt „Symbol-Norm umschalten“ (`DIN 40700` / `IEC` / `ANSI`) aus dem Rechtsklick-Kontextmenü der Arbeitsfläche entfernt (WISH-061).
- **Fix:** Störendes "Arbeitsfläche ist leer"-Popup entfernt (WISH-047).
- Retired the legacy remote branches `alpha`, `beta`, and the merged `feat/alpha-wishlist-batch-37-44`; history is preserved through release and archive tags.

---

## [1.1.3-alpha] - 2026-11-12
- Bauteil-Palette ist im Simulationsmodus bearbeitbar (Drag & Drop, Doppelklick, Löschen).
- Doppelte Takt-/Zoom-Anzeigen im Impulsdiagramm entfernt (nur noch Slider).
- Leeres-Arbeitsfläche-Popup entfernt.

## [1.1.2-alpha] - 2026-11-12

### 🚀 Alpha Batch Release (WISH-037 through WISH-044) & Team Collaboration Setup

#### ✨ Features & Improvements
* **Custom Module Compression as Black-Box IC (`CUSTOM_IC`) (WISH-039)**:
  - Users can choose between saving selections as a compressed single component (**Black-Box IC**) or as a multi-part circuit group (**Macro**).
  - In IC mode, external inputs (switches/buttons/clocks) become component input pins, and external outputs (LEDs/hex displays) become output pins.
  - Subcircuit simulation runs within the single placed `CUSTOM_IC` element via multi-pass propagation.
  - Marked with `[IC]` badge in the component palette.
* **Mirrored Frequency & Clock Slider with Millisecond Timing (WISH-041)**:
  - Added `#analyzer-slider-freq` directly into the logic analyzer header with bidirectional synchronization to the main toolbar slider.
  - Extended frequency display to include period in milliseconds: `X Hz (Y ms)`.
  - Removed confusing tick fraction readout from probe count label (now clean `(X Kanäle)`).
  - Automatically hides simulation controls when the logic analyzer is collapsed.
* **Split-Screen Inspector Expand Docking (WISH-040)**:
  - Inspector gear/expand button automatically docks below the split pane header at `top: 68px` in split-screen mode (`.split-screen-active`), eliminating control overlaps.
* **Pushbutton (BUTTON) Wire Stability (WISH-038)**:
  - Pressing or holding a pushbutton in edit mode no longer resets or reroutes connected wires or waypoints.
* **Pushbutton Lever Visual Refactoring**:
  - Removed bulky colliding rectangle cap from the pushbutton lever blade; implemented crisp DIN EN 60617 mechanical actuator plunger.
* **Auto-Anordnen Simulation Lock in Classic Theme**:
  - Added explicit CSS rules for `[data-theme="java_swing"] .align-split.sim-locked` so caret button is visibly disabled and unbeveled in simulation mode.
* **NOT Gate Lock & Pin Inversion Detection (WISH-042)**:
  - Fixed NOT gate width lock at 40x40 in `rebuildPins()`.
  - Expanded drop detection radius to 30px when dragging NOT gates onto input pins.
* **Context Menu Viewport Clamping (WISH-043)**:
  - Added `max-height: calc(100vh - 24px)` with vertical scrolling and bounding-box clamping.
* **High-Performance Color Picker (WISH-044)**:
  - Throttled signal color pickers with `requestAnimationFrame` and deferred settings storage.
* **Team Collaboration & CI Infrastructure**:
  - Added GitHub Actions CI workflow (`.github/workflows/test.yml`) running all test suites on PRs and pushes.
  - Added PR template (`.github/pull_request_template.md`), Issue templates, `CONTRIBUTING.md`, and `package.json`.

---

## [1.1.0-alpha] - 2026-11-10

### 🚀 Milestone Overview
The **Alpha Milestone** represents a comprehensive transformation of the AI Logic Simulator into a professional, robust, and highly optimized digital electronics design and simulation workstation. It incorporates 28 user-requested feature wishes (WISH-001 through WISH-028), extensive security penetration testing, memory leak hardening, and extreme fuzzing torture testing.

---

### ✨ Added

#### 1. Wire Topology, Branching & Auto-Snapping
* **Lock Auto-Align and Layout Menu in Simulation Mode (WISH-036)**: Disabled and locked the Auto-Anordnen split button (`#btn-auto-route`), dropdown chevron (`#btn-align-menu`), and align popover (`#align-popover`) in simulation mode (`disabled = true`, CSS `pointer-events: none`). Automatically closes any active popover upon switching to simulation mode; guards shortcuts (<kbd>A</kbd>, <kbd>L</kbd>), menubar entries (`#menu-item-layout`, `#menu-item-reroute`), context menu items, and calls to `autoAlign()`.
* **UI Scaling / Oberflächengröße (WISH-035)**: Added continuous scaling of chrome UI elements (menus, toolbar, palette, tabs, inspector, modals, context menus) between 80% and 160% in 5% increments without distorting canvas coordinate mathematics.
* **Component Palette View Switch (WISH-035)**: Toggle component palette between text labels (`Beschriftung`) and rendered graphic thumbnails (`Vorschau`), rendering live miniature schematics of components and custom modules.
* **Manhattan Wire Routing Hardening (WISH-035)**: Fixed unintended diagonal slant routing on normal wires with waypoints when `allowDiagonalWires` was active. Regular wires strictly follow 90° Manhattan bends; only explicit diagonal wires use diagonal segments.
* **NOT Gate Geometry Alignment (WISH-035)**: Removed extraneous lead stubs from the compact 40x40 NOT gate in DIN and IEC rendering, ensuring pins align flush to the 20px grid.
* **Occupied Pin Drag Protection (WISH-035)**: Occupied input pins no longer hijack mouse drags or detach wires when clicking gates; dragging moves the component safely with connections intact.
* **Auto-Merge of Matching Open Wire Ends (WISH-034)**: When two open connections share the exact same coordinates (e.g. an open `toPoint` from a switch and an open `fromPoint` from a gate), or when one open terminus is dropped onto another, `mergeOpenWireTermini` automatically fuses them into a single continuous wire with immediate signal level propagation.
* **Resilient Pin Detachment Protection (WISH-034)**: Clicks inside component bodies now strictly take precedence over pin hit-testing (pin hit radius refined from 14px to 9px), preventing gates from accidentally dragging wires instead of moving. Wire detachment threshold raised to 24px, and intentionally unplugging an input wire converts it cleanly into a floating open wire end instead of destroying it.
* **Diagonal Wire Bridges & Jumper Arches (WISH-033)**: Extended wire crossing bridges (`showWireBridges`) from axis-aligned orthogonal segments to full arbitrary 2D line segment intersections. Crossings involving diagonal wires (`style: diagonal`) render smooth 5px half-circle jumper arches aligned along the wire's angle vector $\theta = \operatorname{atan2}(dy, dx)$, with deterministic priority layering (Horizontal > Diagonal > Vertical) preventing double-bridge flicker.
* **Global Setting for Diagonal Wires (WISH-033)**: Added user preference toggle `allowDiagonalWires` (defaults to `true`), accessible via the Settings modal (`#settings-allow-diagonal-wires`) and the View menu (`#menu-item-toggle-diagonal`). Disabling diagonal wires forces strict orthogonal Manhattan routing across manual drag previews, Inspector style controls, context menu operations, and existing circuit polyline evaluations.
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
* **Compact 40x40 NOT Gate (WISH-032)**: Reduced NOT gate dimensions by 50% from bulky 80x40 down to compact 40x40 pixels (2x2 grid units), matching the compact footprint of indicator lamps (`LED`). Input pin `X1` at `(0, 20)` and output pin `Y` at `(40, 20)` align mathematically with the 20px grid, creating balanced triangular proportions and space-efficient inlining on wires.
* **Theme System & Surface Elevation Overhaul (WISH-031)**: Complete re-engineering of the 5-tier theme architecture (`modern`, `pitch_black`, `java_swing`, `blueprint`, `light_cad`) following industrial EDA standards. Replaced muddy green LOW wires (`#143823`) with crisp, neutral technical slate (`#38465c` in Modern Dark, `#52525b` in OLED, `#255994` in Blueprint, `#64748b` in Light CAD, `#555555` in Java Swing), giving active signals dramatic visual punch.
* **Optical Lamp Lenses & Radial Illumination (WISH-031)**: Unlit indicator lamps (0) now rest quietly as clean dark optical lens wells (`pal.displayWellFill`) with precision bezels instead of fluorescent sniper-crosshair targets. Activated lamps (1) radiate with vivid radial light gradients, optical white-hot centers, 18px bloom glow, and backlit diagonal cross filaments.
* **Legacy Signal Color Migration (WISH-031)**: Added automatic migration in `loadSettings` to cleanse legacy `#143823` muddy low color caches from browser `localStorage` on startup.
* **Pushbutton (Taster) Lever & DIN EN 60617 Actuator (WISH-030)**: Complete geometry refactoring for `BUTTON` components: unpressed resting state cleanly contacts 0 (`botY`), pressed active state connects to 1 (`topY`), and the actuator plunger with tactile push cap is centered at the blade midpoint without overlapping contacts or text labels.
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
