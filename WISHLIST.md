# AI Logic Simulator — Wishlist & Feature Tracker

This document tracks all user requests and wishes for the **AI Logic Simulator** project.
Whenever new wishes are added, they are documented here, tracked with dedicated Git branches, and worked down sequentially.

---

## 🌿 Git Branching Model & Release Strategy

- **`main`**: **Stable releases only**. No experimental or WIP code is merged directly here. Releases are tagged (`v1.0.0`, `v1.1.0`, etc.).
- **`beta`**: **Pre-release & Staging**. Stabilized features from `alpha` are validated here before promoting to `main`.
- **`alpha`**: **Active Development & Integration**. The primary branch for integrating completed wishes and ongoing fixes.
- **`feat/<name>`**: Dedicated short-lived feature/fix branches for specific wishlist items. Branch off `alpha`, tested against the test suite, and merged back into `alpha` (no git worktrees used).

---

## 📋 Wishlist Items

| ID | Title | Git Branch | Status | Notes |
|---|---|---|---|---|
| **WISH-001** | Git Cleanup & Version Tiering (`main` = stable, `beta`, `alpha`) | `alpha` | 🟢 **Completed** | Removed external worktrees; established `main`, `beta`, `alpha` branches; tagged stable `v1.0.0-stable`. |
| **WISH-002** | GUI Declutter & Modern Desktop App Redesign | `feat/gui-rework` | 🟢 **Completed** | Reduced clutter, streamlined 38px non-wrapping toolbar, modern desktop aesthetic (Photoshop / Paint.NET / Explorer), refined dark CAD palette, sleek browser-like document tabs, and clean status bar. |
| **WISH-003** | UI Text, Icon Polish & Multi-Language Support (i18n) | `feat/i18n-icons` | 🟢 **Completed** | Full multi-language support (German / English) with dynamic translation engine (`I18N`), View menu & Settings modal language switcher, persistent language storage, polished SVG icons, and clean text labels. |
| **WISH-004** | Rewiring Improvements | `feat/improve-rewiring` | 🟢 **Completed** | Strict orthogonal segment dragging (first/internal/last segments), collinear bend pruning, channel deconfliction to prevent parallel wire overlaps, right-click wire menu. |
| **WISH-005** | Slider Press-and-Hold Drag Interaction | `feat/slider-drag` | 🟢 **Completed** | Hold left mouse button on sliders/potentiometers to smoothly drag across elements without losing focus. |
| **WISH-006** | Left-Click Press-and-Drag Wire Branching (T-Junctions) | `feat/wire-branching` | 🟢 **Completed** | Pressing and holding LMB on an existing wire allows pulling out a new branch directly. |
| **WISH-007** | Floating / Terminus-Free Connections (No module required at end) | `feat/floating-connections` | 🟢 **Completed** | Connections do not strictly require a module at both ends (support stubs, test points, dangling terminals). |
| **WISH-008** | Code Quality Improvement & Comment Cleanup | `feat/code-cleanup` | 🟢 **Completed** | Cleaned up 370+ redundant/noisy comments, streamlined code structure, optimized helper routines, and improved maintainability. |
| **WISH-009** | Realistic Gate Propagation Delay & Global Configuration | `feat/gate-delay` | 🟢 **Completed** | Global gate delay (1–20 ticks), toggleable badge display (off by default), and realistic inertial transition timing ("wie im echten Leben"). |
| **WISH-010** | Statusleiste: Koordinaten-Direkteingabe per Doppelklick & Canvas-Limitierung | `alpha` | 🟢 **Completed** | Koordinatenanzeige ganz unten links in Statusleiste platziert; Doppelklick öffnet Koordinaten-Eingabe zum Anspringen/Zentrieren. |
| **WISH-011** | Norm-Leiste ganz oben entfernen | `alpha` | 🟢 **Completed** | Obere Norm-Leiste / Menü-Eintrag aus Menüleiste & Toolbar entfernt; Normen-Wahl sauber in Einstellungen behalten. |
| **WISH-012** | „Auswahl ausrichten“-Schalterleiste entfernen | `alpha` | 🟢 **Completed** | Die 8 Ausrichtungs-Schalter und Titel „Auswahl ausrichten“ aus dem Layout-Bereich entfernt (wie im Screenshot markiert). |
| **WISH-013** | Maus-Steuerung & Kontextmenü-Optimierung (Mausklick-Halten-Verbindung entfernen) | `alpha` | 🟢 **Completed** | Ungewolltes Starten neuer Leitungen durch Halten der linken Maustaste auf Leitungen entfernt; Leitungen werden sauber selektiert; Abzweigen gezielt über Kontextmenü. |
| **WISH-014** | Spielfeld-Koordinaten von -5000,-5000 bis 5000,5000 & Start bei 0 | `alpha` | 🟢 **Completed** | Spielfeld auf -5000 bis 5000 px skaliert (10000x10000 px zentriert); Viewport startet bei (0, 0); Reset View und Neuer Tab zentrieren auf Ursprung (0, 0); Raster mit Achsenkreuz bei (0, 0). |
| **WISH-015** | Premiere Pro Playhead-Scrubbing & Zeitrahmen-Dynamik im Impulsdiagramm | `alpha` | 🟢 **Completed** | Zeitrahmen ändert sich beim Bewegen des Playheads wie in Premiere Pro: Edge Auto-Scrolling an den Rändern der Zeitleiste; vertikales Ziehen in der Zeitachse zoomt den sichtbaren Zeitrahmen stufenlos; Navigator-Leiste im Header und Anzeige des aktiven Zeitrahmens. |

---

## 📝 Change Log & Completed Wishes

- **WISH-014 & WISH-010**:
  - Spielfeldgrenzen auf `[-5000, 5000]` in X und Y angepasst (10.000 × 10.000 px Arbeitsfläche, Ursprung im Zentrum).
  - Doppelklick-Editor ganz unten links in der Statusleiste mit Bereich `-5000` bis `+5000 px`.
  - Ansicht startet zentriert bei `(0, 0)`.
  - Raster visualisiert Ursprung `0, 0 px (Zentrum)`, Achsenkreuz und Randkoordinaten `-5000, -5000 px` und `5000, 5000 px`.
  - Panning und Bauteilverschiebungen stoppen verlässlich an den Feldgrenzen.
- **WISH-015**:
  - Impulsdiagramm Playhead-Scrubbing im Stil von Adobe Premiere Pro implementiert:
  - Automatisches Scrollen (Edge Auto-Scroll) des sichtbaren Zeitfensters beim Bewegen des Playheads gegen die Ränder.
  - Dynamisches Skalieren/Zoomen des Zeitrahmens (`pixelsPerTick`) beim vertikalen Ziehen in der Zeitachse (Time Ruler).
  - Time-Navigator-Balken oben in der Kopfzeile des Impulsdiagramms, der den aktuell angezeigten Zeitrahmen visualisiert.
  - Erweiterte Playhead-Info zeigt aktuellen Tick und genauen sichtbaren Zeitrahmen an (`Zeitrahmen: t_start..t_end`).
  - Mausrad über der Zeitachse zoomt direkt in den Zeitrahmen hinein/heraus.
- **WISH-011**:
  - Norm-Eintrag aus der oberen Menüleiste und Norm-Badge aus der Toolbar entfernt.
- **WISH-012**:
  - Die 8 Buttons und der Titel „Auswahl ausrichten“ aus dem Layout-Panel entfernt.
- **WISH-013**:
  - Ungewolltes Starten neuer Leitungen beim Ziehen mit gedrückter linker Maustaste auf Leitungen entfernt.
  - Leitungsauswahl ist nun sauber und störungsfrei; Abzweigungen erfolgen gezielt über das Rechtsklick-Menü.

- **WISH-001**: 
  - Eliminated external worktrees.
  - Created `alpha` (integration/dev) and `beta` (staging) branches.
  - Tagged `main` as `v1.0.0-stable`.
  - Added `WISHLIST.md` tracker.
- **WISH-008**:
  - Removed 370+ verbose and redundant inline and HTML comments across `index.html`.
  - Streamlined code structure and improved overall readability and file size.
  - Preserved 100% test pass rate (30/30 comprehensive tests, security audit, benchmarks, stress tests).
- **WISH-003**:
  - Implemented complete internationalization engine (`I18N`) supporting German (`de`) and English (`en`).
  - Added comprehensive translation dictionaries covering Menubar, Toolbar, Component Palette categories and items, Inspector labels, Status Bar hints, and Settings dialogs.
  - Added language switcher under `Ansicht` (View) -> `Sprache / Language` (DE/EN checkmarks) and in `Einstellungen` (Settings) modal.
  - Added dynamic `data-i18n`, `data-i18n-title`, and `data-i18n-placeholder` binding system that updates all UI text reactively upon language switch without needing a page reload.
  - Added automatic browser language detection fallback and `localStorage` persistence (`logicsim_language`).
  - Polished SVG vector icons across all gates and toolbar buttons for clean presentation.
- **WISH-002**:
  - Streamlined primary toolbar to a fixed 38px non-wrapping height with clean button grouping and compact desktop padding.
  - Modernized theme palette to professional neutral dark CAD tones (`#1e1e1e` canvas, `#252526` panels, `#2d2d30` elevated/hover, `#333333` borders) matching desktop standards like Photoshop, Paint.NET, and VS Code.
  - Reworked Document Tabs (`.tabs-bar`): browser/IDE-style soft rounded tabs with seamless canvas integration for the active tab, clear dirty status indicator, and minimalist `+` new tab icon.
  - Refined Left Sidebar (Toolbox / Component Palette): 220px compact width, native Windows/Explorer-style search box, and 32px height component cards with smooth instant hover feedback (eliminating disruptive jump/scale animations).
  - Modernized Bottom Status Bar (`#statusbar`): Explorer/Paint.NET style with clear segmented dividers, mode indicator, component/wire counters, zoom percentage, and precise cursor coordinates (`X: ... px, Y: ... px`).
  - Added custom sleek 7px dark scrollbars across the entire application.
- **Wire Crossing Bridges Restoration**:
  - Restored original crossing jumper arches (enabled by default as in `11dfd45`).
- **WISH-004**:
  - Implemented strict orthogonal segment dragging: dragging any segment (first from pin, middle, or last into pin) preserves 90° bends and automatically introduces clean 20px orthogonal pin stubs rather than diagonally slanting wires.
  - Added automatic collinear and redundant bend pruning (`cleanWireWaypoints`) on mouseup so wires snap into straight lines when bends are eliminated.
  - Added multi-wire channel deconfliction (`deconflictWireChannels`) in `autoRouteAllWires`: assigns distinct non-overlapping grid channels (multiples of 20px) to parallel wires sharing routing columns.
  - Fixed `addWaypointToWire` to work safely with terminus-free floating wires and branched wires without requiring components on both ends.
  - Unlocked the native Wire Context Menu on right-click (removing the legacy Shift-only requirement) and added "Überflüssige Knicke entfernen (Begradigen)" and "Wegpunkte zurücksetzen (Auto)" to both context menu and Inspector.
- **WISH-005**:
  - Implemented `attachSliderHoldRepeat` for smooth press-and-hold drag interactions.
  - Enhanced range slider CSS hit targets (18px area, 4px track, dynamic thumb scaling).
- **WISH-006**:
  - Added press-and-drag LMB detection on existing wires to pull out a new branch wire directly.
- **WISH-007**:
  - Added support for open-ended/floating connections terminating on the canvas grid without needing a target module.
  - Added clean visual terminal pad markers for floating/unconnected wire endpoints.
- **WISH-009**:
  - Global Gate Delay: Added `circuit.globalGateDelay` (1–20 ticks, default 1) with settings modal slider and JSON persistence.
  - Toggle Gate Delay Display: Added toggle setting and view menu item to display `Δt <delay>` under gates, set to **OFF by default** (`showGateDelay = false`).
  - Realistic Gate Transitions ("wie im echten Leben"): Implemented physical inertial gate delay model — gate output maintains its prior state until the propagation delay completes; input pulses shorter than the delay are filtered out; interactive switches/buttons in live SIM mode update wire levels without instantaneously snapping downstream gate outputs.
