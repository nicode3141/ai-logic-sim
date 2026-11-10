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
| **WISH-016** | Einheitliche Theme-Farben, Modul-Styling & Kontraste über alle 5 Themes | `alpha` | 🟢 **Completed** | Durchgehend harmonische Farbgebung für Modern, Pitch Black, Java Swing, Nordic Blueprint und Clean Light; Modul-Innenseiten (Flip-Flops, Zähler, Schieberegister, BCD-Decoder, 7-Segment, Anzeigen, Schalter, Taster, Messpunkte) passen sich dem gewählten Design an; hohe Kontraste und einheitliche CSS-Variablen. |
| **WISH-017** | Vollständiger English-Support (Lückenlose Übersetzung aller Menüs, Dialoge & Inspector-Texte) | `alpha` | 🟢 **Completed** | Lückenlose Übersetzung aller UI-Texte, Modale (Settings, Help, Truth Table, Synthesizer), Inspector-Eigenschaften, Statusleiste und Szenario-Texte ins Englische mit dynamischer Umschaltung. |
| **WISH-018** | GUI-Kontraste & Kontextmenü-Inkonsistenzen beheben | `alpha` | 🟢 **Completed** | Behebung von weißem Text auf beigem Hintergrund im Java Swing Kontextmenü; themenspezifische High-Contrast-Regeln für Hover-Zustände in Java Swing (`#0a246a` mit weißer Schrift) und Clean Light (`#e0f2fe` mit blauem Text). |
| **WISH-019** | Saubere Pin-Labels ohne Überlappungen | `alpha` | 🟢 **Completed** | Entfernung redundanter, kollidierender Pin-Texte (`OUT`, `IN`, `CLK`) auf einfachen Bauteilen (Schalter, Taster, Taktgeber, Konstanten, Lampen); saubere Ausrichtung, Polsterung und Schrift für komplexe IC-Module. |
| **WISH-020** | Meldeleuchten / Lampen als reines Kreis-mit-X-Symbol & sattere Leuchtfarben | `alpha` | 🟢 **Completed** | Lampen (LED) werden nach DIN EN 60617 / IEC als reines Kreissymbol mit Diagonalkreuz ohne rechteckigen Chassis-Kasten gezeichnet; sattere und leuchtstärkere Farbpalette (vibrant green, red, yellow, blue) mit hohem Kontrast im Ein- und Aus-Zustand. |
| **WISH-021** | Individuelle HIGH & LOW Signalfarben, abgestimmte Presets & flüssiger Colorpicker | `alpha` | 🟢 **Completed** | HIGH (1) und LOW (0) Signalfarben konfigurierbar in Renderer, UI und CSS; 8 neue abgestimmte Preset-Paare mit Leuchteffekten; Live-Vorschauleiste; flüssige Echtzeit-Farbwahl (60fps) mit synchronisierten Hex-Feldern und Standard-Reset. |
| **WISH-022** | Offene Leitungs-Enden verschieben & interaktiv verbinden | `alpha` | 🟢 **Completed** | Freie Leitungs-Endpunkte (offene Drähte) lassen sich per Maus greifen, im Raster verschieben und direkt auf Bauteil-Pins fallen lassen, um die Verbindung herzustellen. Visuelles Feedback mit Fang-Aura, Drag-Cursor und Kontextmenü. |
| **WISH-023** | Eckpunkt-Kontextmenü: Ganze Leitung löschen & Begradigen | `alpha` | 🟢 **Completed** | Beim Rechtsklick auf einen Leitungs-Eckpunkt (Wegpunkt) kann nicht nur der einzelne Eckpunkt gelöscht werden, sondern direkt auch die gesamte Leitung („Ganze Leitung löschen“); zudem Option zum Begradigen und Neu verlegen. |

---

## 📝 Change Log & Completed Wishes

- **WISH-023 (Eckpunkt-Kontextmenü: Ganze Leitung löschen & Begradigen)**:
  - **Umfassende Löschoptionen im Eckpunkt-Kontextmenü**:
    - Beim Rechtsklick auf einen Eckpunkt bietet das Kontextmenü nun sowohl `Diesen Eckpunkt löschen` als auch `Ganze Leitung löschen`.
    - `Ganze Leitung löschen` entfernt die komplette Leitung aus dem Schaltplan, trennt alle verbundenen Signale und Messpunkte, bereinigt die Auswahl und vermerkt die Aktion im Undo/Redo-Verlauf.
    - Zusätzliche Optionen zum schnellen `Begradigen` (Entfernen überflüssiger Knicke) und `Neu verlegen (Auto)`.
    - Vollständige zweisprachige Lokalisierung (Deutsch/Englisch) in `I18N_PHRASES_EN`.

- **WISH-022 (Offene Leitungs-Enden verschieben & interaktiv verbinden)**:
  - **Interaktives Greifen & Verschieben von offenen Leitungs-Enden**:
    - `CanvasRenderer.findOpenTerminusAt(x, y)` erkennt offene Endpunkte (`toPoint` und freie `fromPoint`) im Fangradius (12px), bevorzugt die aktuell ausgewählte Leitung.
    - Freie Enden werden im Edit-Modus mit einem interaktiven Cyan-Ring (`r = 6.5px`) hervorgehoben und erhalten beim Hovern den `grab`-Cursor.
    - Beim Ziehen (`mousedown` + Drag) wechselt der Cursor zu `grabbing`, und ein leuchtender Halo-Ring (`r = 8px`) folgt der Maus unter Einhaltung des Rasters (`GRID_SIZE = 20`) und der Arbeitsflächen-Grenzen `[-5000, 5000]`.
    - Leitungs-Polylinie und Wegpunkte aktualisieren sich in Echtzeit bei jeder Mausbewegung.
  - **Automatisches Verbinden beim Ablegen auf Bauteil-Pins (Snap & Connect)**:
    - Wird das offene Ende über einem gültigen Bauteil-Pin losgelassen (`mouseup`), wird die Leitung automatisch an den Pin angeschlossen (`toCompId = pin.compId`, `toPin = pin.pinIndex`, `toPoint = null`).
    - Wegpunkte werden automatisch begradigt (`cleanWireWaypoints`) und Signalpegel sofort synchronisiert.
    - Änderung wird in der Historie (Undo/Redo) protokolliert.
  - **Kontextmenü & Inspector**:
    - Rechtsklick auf ein offenes Leitungsende öffnet sofort das Leitungs-Kontextmenü zur Inspektion, Pegelanzeige und Begradigung.

- **WISH-021 (Individuelle HIGH & LOW Signalfarben, abgestimmte Presets & flüssiger Colorpicker)**:
  - **Beide Signalpegel (HIGH & LOW) konfigurierbar**:
    - Signalfarben unterstützen nun sowohl den HIGH-Zustand (1) als auch den LOW-Zustand (0) über `CanvasRenderer` (`highSignalColor`, `lowSignalColor`), `LogicSimApp` und CSS-Variablen (`--wire-high`, `--wire-low`).
    - Leitungen, Pin-Kreise, Leitungs-Endpunkte und Messpunkte visualisieren den LOW-Pegel mit der eingestellten LOW-Farbe (mit Rückfall auf das gewählte Theme).
  - **Verbesserte Presets mit Signalpaaren**:
    - 8 sorgfältig abgestimmte Signalpaare (HIGH/LOW) mit Leuchteffekten: Cyber Grün (`#00ff66`/`#143823`), Cyber Cyan (`#00e5ff`/`#0e2a3e`), Bernstein (`#ffb300`/`#3d280e`), Alarm Rot (`#ff1744`/`#3f1015`), Synthwave (`#e040fb`/`#2e123d`), Blueprint (`#38bdf8`/`#132c4a`), Monokai Weiß (`#ffffff`/`#334155`), Klassisch TTL (`#00e676`/`#475569`).
    - Preset-Buttons zeigen Name und ein Doppel-Signal-Badge (HIGH-Dot mit Aura + Leitungsstrecke + LOW-Dot) mit aktiver Kontur.
  - **Live Wire Preview Bar**:
    - Dynamische Echtzeit-Vorschau im Einstellungs-Dialog visualisiert den HIGH-Draht (mit Glow) und den LOW-Draht nebeneinander.
  - **Flüssiger Custom-Colorpicker mit Live-Synchronisation**:
    - Reaktives Dual-Picker-Panel für HIGH (Pegel 1) und LOW (Pegel 0) mit nativer Farbauswahl und synchronisierten Hexadezimal-Eingabefeldern.
    - Reagiert direkt auf `input`-Events beim Ziehen im Farbdialog für 60fps-Echtzeit-Updates der Arbeitsfläche und Vorschau.
    - Schnelltaste zum Zurücksetzen auf Standardwerte (`#00ff66` / `#143823`).
  - **Persistenz & i18n**:
    - Beide Signalfarben werden in `logicsim_user_settings` im `localStorage` gespeichert und beim Laden zuverlässig wiederhergestellt.
    - Vollständige zweisprachige Lokalisierung (Deutsch/Englisch) in `I18N` und `I18N_PHRASES_EN`.

- **WISH-017, WISH-018, WISH-019, WISH-020**:
  - **WISH-017 (Complete English Support)**:
    - Alle verbliebenen Texte in Einstellungen, Tastenkürzel-Hilfe, Wahrheitstabelle, Boolescher Schaltalgebra, Koordinaten-Popover und Kontextmenüs vollständig zweisprachig (Deutsch und Englisch) erfasst.
    - Phrase-Dictionary `I18N_PHRASES_EN` und Wörterbücher `I18N.dicts.de` / `I18N.dicts.en` lückenlos synchronisiert.
    - Umschaltung der Sprache aktualisiert sofort alle DOM-Elemente, Inspector-Titel und Statusmeldungen.
  - **WISH-018 (GUI-Kontraste & Kontextmenü)**:
    - Behebung des Kontrastfehlers aus Screenshot 1: Im Java Swing-Design wurde Hover-Text weiß auf hellem Grund gezeichnet.
    - High-Contrast-Hover-Regeln hinzugefügt: Java Swing nutzt nun stilechtes Windows-95/Swing-Menüblau (`#0a246a`) mit gestochen scharfem Weiß; Light CAD nutzt sanftes Blau `#e0f2fe` mit `#0284c7`.
    - Basis-CSS von hartkodiertem Weiß auf themenadaptive Variablen umgestellt.
  - **WISH-019 (Saubere Pin-Labels)**:
    - Überlappende Beschriftungen aus Screenshot 2 behoben: Redundante `OUT`- und `IN`-Texte bei Schaltern, Tastern, Taktgebern, Konstanten und Lampen entfernt.
    - Pins und Leber/Symbole werden frei und sauber ohne Textüberlagerung dargestellt.
    - Komplexe ICs (Flip-Flops, Zähler, Addierer, Decoder) behalten ihre Pinbezeichnungen mit verbessertem Padding und `600 9px monospace`-Typografie.
  - **WISH-020 (Lampen als reiner Kreis mit X & sattere Farben)**:
    - Lampen (LED) werden nun exakt wie im elektrotechnischen Standard DIN EN 60617 als reines Kreissymbol mit Diagonalkreuz dargestellt (kein störender rechteckiger Kasten mehr).
    - Zuleitung verbindet den linken Pin direkt bündig mit dem Lampenkreis; Auswahl zeigt eine zentrierte leuchtende Cyan-Aura.
    - Leuchtfarben gesättigt und intensiviert: Neon-Grün (`#00ff66`), Signal-Rot (`#ff1744`), Sonnengelb (`#ffee00`), Cyan-Blau (`#00b4ff`) mit sattem Kontrast auch im ausgeschalteten Zustand.

- **WISH-016**:
  - Farbkonzept und Kontraste über alle 5 Themes (`modern`, `pitch_black`, `java_swing`, `blueprint`, `light_cad`) vereinheitlicht:
  - `getThemePalette()` um design-spezifische Tokens erweitert (`moduleFill`, `moduleStroke`, `moduleTitle`, `moduleText`, `moduleSub`, `displayWellFill`, `displayWellStroke`, `segOff`, `pinFill`, `pinStroke`, `gridCrosshair`, `gridBorder`, `gridText`).
  - Hartkodierte dunkle Kästen und kontrastarme Texte in Modulen (`BCD_DEC`, `COUNTER`, `SHIFT_REG`, `SR_FF`, `D_FF`, `JK_FF`, `T_FF`, `D_LATCH`, `SEVEN_SEG`, `HEX_DISPLAY`, `SWITCH`, `BUTTON`, `PROBE`) durch themenadaptive Farbwerte ersetzt.
  - Helle Designs (`java_swing`, `light_cad`) besitzen nun klare Konturen und dunkle, lesbare Beschriftungen ohne unpassende schwarze Kästen; Java Swing hat stilechtes Windows-95/Workbench-Styling (weißes Inset-Feld, marineblaue Titel `#000080`, 0px Ecken).
  - Reines OLED-Design (`pitch_black`) konsequent ohne Glow mit `#000000` Gehäuse- und Modulfüllung.
  - Fehlende CSS-Variablen (`--bg-canvas`, `--bg-surface`, `--accent-cyan`, `--accent-amber`, `--accent-red`, `--accent-green`) in allen Theme-Selektoren ergänzt.
  - Menü-Popups (`.app-dropdown-menu`, `.context-menu`) und Eingabefelder (`.synth-input-area`, Wahrheitstabellen-Formelpreview) auf Theme-Variablen umgestellt, sodass in hellen Themes keine weißen Texte auf weißem Grund entstehen.
  - Impulsdiagramm (`LogicAnalyzerRenderer`) optisch an alle 5 Themes angepasst (Kanal-Gutter, Zeilentrennlinien, Taktunterteilungen und Textfarben).

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
