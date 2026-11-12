# AI Logic Simulator — Wishlist & Feature Tracker

This document tracks all user requests and wishes for the **AI Logic Simulator** project.
Whenever new wishes are added, they are documented here, tracked with dedicated Git branches, and worked down sequentially.

---

## 🌿 Git Branching Model & Release Strategy

The project uses two long-lived branches and short-lived feature branches:

```
feat/*, fix/*, chore/*, docs/* ──► PR / merge ──► dev ──► PR / release ──► main (production)
```

- **`main`**: **Production**. Always deployable and stable. Only validated releases are merged here. Every release is tagged (`v1.0.0`, `v1.1.0`, ...). No experimental or WIP code.
- **`dev`**: **Development & Integration**. The single long-lived development branch. All completed features, fixes, and chores are integrated and tested here before promotion to `main`.
- **Feature branches**: Short-lived branches created from `dev` and merged back into `dev` via pull request:
  - `feat/<name>` — new features (e.g. `feat/custom-ic-compression`)
  - `fix/<name>` — bug fixes (e.g. `fix/button-wire-stability`)
  - `chore/<name>` — maintenance, tooling, repository and process changes
  - `docs/<name>` — documentation-only changes
  - `hotfix/<name>` — urgent production fixes; branch from `main`, merge to `main`, then back-merge into `dev`
- **Rules**:
  - Branch from `dev`, keep branches focused and short-lived, and keep them up to date with `dev`.
  - Open a pull request, ensure the CI test suite passes, then merge into `dev`.
  - Delete feature branches after merging.
  - Promote to `main` only from a validated `dev` state and tag the release.
  - No git worktrees are used.

---

## 📋 Wishlist Items

| ID | Title | Git Branch | Status | Notes |
|---|---|---|---|---|
| **WISH-001** | Git Cleanup & Version Tiering (legacy `main` / `beta` / `alpha`) | `alpha` (historical) | 🟢 **Completed** | Removed external worktrees; established the legacy three-tier model; superseded by WISH-045 (`main` + `dev`). Tagged stable `v1.0.0-stable`. |
| **WISH-002** | GUI Declutter & Modern Desktop App Redesign | `feat/gui-rework` | 🟢 **Completed** | Reduced clutter, streamlined 38px non-wrapping toolbar, modern desktop aesthetic (Photoshop / Paint.NET / Explorer), refined dark CAD palette, sleek browser-like document tabs, and clean status bar. |
| **WISH-003** | UI Text, Icon Polish & Multi-Language Support (i18n) | `feat/i18n-icons` | 🟢 **Completed** | Full multi-language support (German / English) with dynamic translation engine (`I18N`), View menu & Settings modal language switcher, persistent language storage, polished SVG icons, and clean text labels. |
| **WISH-004** | Rewiring Improvements | `feat/improve-rewiring` | 🟢 **Completed** | Strict orthogonal segment dragging (first/internal/last segments), collinear bend pruning, channel deconfliction to prevent parallel wire overlaps, right-click wire menu. |
| **WISH-005** | Slider Press-and-Hold Drag Interaction | `feat/slider-drag` | 🟢 **Completed** | Hold left mouse button on sliders/potentiometers to smoothly drag across elements without losing focus. |
| **WISH-006** | Left-Click Press-and-Drag Wire Branching (T-Junctions) | `feat/wire-branching` | 🟢 **Completed** | Pressing and holding LMB on an existing wire allows pulling out a new branch directly. |
| **WISH-007** | Floating / Terminus-Free Connections (No module required at end) | `feat/floating-connections` | 🟢 **Completed** | Connections do not strictly require a module at both ends (support stubs, test points, dangling terminals). |
| **WISH-008** | Code Quality Improvement & Comment Cleanup | `feat/code-cleanup` | 🟢 **Completed** | Cleaned up 370+ redundant/noisy comments, streamlined code structure, optimized helper routines, and improved maintainability. |
| **WISH-009** | Realistic Gate Propagation Delay & Global Configuration | `feat/gate-delay` | 🟢 **Completed** | Global gate delay (1–20 ticks), toggleable badge display (off by default), and realistic inertial transition timing ("wie im echten Leben"). |
| **WISH-010** | Statusleiste: Koordinaten-Direkteingabe per Doppelklick & Canvas-Limitierung | `dev` | 🟢 **Completed** | Koordinatenanzeige ganz unten links in Statusleiste platziert; Doppelklick öffnet Koordinaten-Eingabe zum Anspringen/Zentrieren. |
| **WISH-011** | Norm-Leiste ganz oben entfernen | `dev` | 🟢 **Completed** | Obere Norm-Leiste / Menü-Eintrag aus Menüleiste & Toolbar entfernt; Normen-Wahl sauber in Einstellungen behalten. |
| **WISH-012** | „Auswahl ausrichten“-Schalterleiste entfernen | `dev` | 🟢 **Completed** | Die 8 Ausrichtungs-Schalter und Titel „Auswahl ausrichten“ aus dem Layout-Bereich entfernt (wie im Screenshot markiert). |
| **WISH-013** | Maus-Steuerung & Kontextmenü-Optimierung (Mausklick-Halten-Verbindung entfernen) | `dev` | 🟢 **Completed** | Ungewolltes Starten neuer Leitungen durch Halten der linken Maustaste auf Leitungen entfernt; Leitungen werden sauber selektiert; Abzweigen gezielt über Kontextmenü. |
| **WISH-014** | Spielfeld-Koordinaten von -5000,-5000 bis 5000,5000 & Start bei 0 | `dev` | 🟢 **Completed** | Spielfeld auf -5000 bis 5000 px skaliert (10000x10000 px zentriert); Viewport startet bei (0, 0); Reset View und Neuer Tab zentrieren auf Ursprung (0, 0); Raster mit Achsenkreuz bei (0, 0). |
| **WISH-015** | Premiere Pro Playhead-Scrubbing & Zeitrahmen-Dynamik im Impulsdiagramm | `dev` | 🟢 **Completed** | Zeitrahmen ändert sich beim Bewegen des Playheads wie in Premiere Pro: Edge Auto-Scrolling an den Rändern der Zeitleiste; vertikales Ziehen in der Zeitachse zoomt den sichtbaren Zeitrahmen stufenlos; Navigator-Leiste im Header und Anzeige des aktiven Zeitrahmens. |
| **WISH-016** | Einheitliche Theme-Farben, Modul-Styling & Kontraste über alle 5 Themes | `dev` | 🟢 **Completed** | Durchgehend harmonische Farbgebung für Modern, Pitch Black, Java Swing, Nordic Blueprint und Clean Light; Modul-Innenseiten (Flip-Flops, Zähler, Schieberegister, BCD-Decoder, 7-Segment, Anzeigen, Schalter, Taster, Messpunkte) passen sich dem gewählten Design an; hohe Kontraste und einheitliche CSS-Variablen. |
| **WISH-017** | Vollständiger English-Support (Lückenlose Übersetzung aller Menüs, Dialoge & Inspector-Texte) | `dev` | 🟢 **Completed** | Lückenlose Übersetzung aller UI-Texte, Modale (Settings, Help, Truth Table, Synthesizer), Inspector-Eigenschaften, Statusleiste und Szenario-Texte ins Englische mit dynamischer Umschaltung. |
| **WISH-018** | GUI-Kontraste & Kontextmenü-Inkonsistenzen beheben | `dev` | 🟢 **Completed** | Behebung von weißem Text auf beigem Hintergrund im Java Swing Kontextmenü; themenspezifische High-Contrast-Regeln für Hover-Zustände in Java Swing (`#0a246a` mit weißer Schrift) und Clean Light (`#e0f2fe` mit blauem Text). |
| **WISH-019** | Saubere Pin-Labels ohne Überlappungen | `dev` | 🟢 **Completed** | Entfernung redundanter, kollidierender Pin-Texte (`OUT`, `IN`, `CLK`) auf einfachen Bauteilen (Schalter, Taster, Taktgeber, Konstanten, Lampen); saubere Ausrichtung, Polsterung und Schrift für komplexe IC-Module. |
| **WISH-020** | Meldeleuchten / Lampen als reines Kreis-mit-X-Symbol & sattere Leuchtfarben | `dev` | 🟢 **Completed** | Lampen (LED) werden nach DIN EN 60617 / IEC als reines Kreissymbol mit Diagonalkreuz ohne rechteckigen Chassis-Kasten gezeichnet; sattere und leuchtstärkere Farbpalette (vibrant green, red, yellow, blue) mit hohem Kontrast im Ein- und Aus-Zustand. |
| **WISH-021** | Individuelle HIGH & LOW Signalfarben, abgestimmte Presets & flüssiger Colorpicker | `dev` | 🟢 **Completed** | HIGH (1) und LOW (0) Signalfarben konfigurierbar in Renderer, UI und CSS; 8 neue abgestimmte Preset-Paare mit Leuchteffekten; Live-Vorschauleiste; flüssige Echtzeit-Farbwahl (60fps) mit synchronisierten Hex-Feldern und Standard-Reset. |
| **WISH-022** | Offene Leitungs-Enden verschieben & interaktiv verbinden | `dev` | 🟢 **Completed** | Freie Leitungs-Endpunkte (offene Drähte) lassen sich per Maus greifen, im Raster verschieben und direkt auf Bauteil-Pins fallen lassen, um die Verbindung herzustellen. Visuelles Feedback mit Fang-Aura, Drag-Cursor und Kontextmenü. |
| **WISH-023** | Eckpunkt-Kontextmenü: Ganze Leitung löschen & Begradigen | `dev` | 🟢 **Completed** | Beim Rechtsklick auf einen Leitungs-Eckpunkt (Wegpunkt) kann nicht nur der einzelne Eckpunkt gelöscht werden, sondern direkt auch die gesamte Leitung („Ganze Leitung löschen“); zudem Option zum Begradigen und Neu verlegen. |
| **WISH-024** | Impulsdiagramm: Auto-Skalierung & blauen Balken entfernen, Zeitstrahl-Panning & Playback-Controls | `dev` | 🟢 **Completed** | Ungewolltes vertikales Zoom-Skalieren & blauer 3px-Balken entfernt; flüssiges horizontales Bewegen/Pannen entlang des Zeit-/Tickstrahls; synchrone Playback-Controls (-1 Tick, Start/Pause, +1 Tick) im Diagramm-Header. |
| **WISH-025** | Taktfrequenz im laufenden Betrieb ändern & Impulsdiagramm-Klammern synchronisieren | `dev` | 🟢 **Completed** | Taktfrequenz-Slider (`#slider-freq`) ohne Ruckeln im laufenden Betrieb stufenlos verstellbar (Smooth-Scaling des Akkumulators); Impulsdiagramm-Klammern (`[` und `]`) bleiben während der Simulation fest an ihren Ticks verankert und lassen sich flüssig verschieben; Taktänderung aktualisiert die Millisekunden-Dauer der Klammern und die Loop-Playback-Rate in Echtzeit. |
| **WISH-026** | Auto-Snap offener Leitungen, vereinte NOT-Palette mit Pin-Invertierung & Wire-Inlining | `dev` | 🟢 **Completed** | Offene Leitungs-Enden (`toPoint` und `fromPoint`) rasten beim Platzieren (Drag & Drop) oder Einfügen (Strg+V, Duplizieren) von Modulen automatisch an deren Pins ein. Palette auf ein einziges NOT-Gatter vereinheitlicht (redundanten Negator entfernt); NOT invertiert bei Drop auf Pin beliebiger Module den Ein-/Ausgang (○-Blase) und schaltet sich bei Drop auf eine Leitung automatisch inline als Invertierer dazwischen. |
| **WISH-027** | Schalter-Hintergrund Kontrast-Fix, Theme-Entfernung aus Ansicht-Menü & Lampen-X in Outline-Farbe | `dev` | 🟢 **Completed** | Pfad-Verkettungs-Bug in Schalter/Taster-Innenleben behoben (kein schwarzes Dreieck mehr). Schalter-Hintergrund nutzt `pal.gateFill` (weiß in Java Swing / Light CAD) und hebt sich sauber von LOW-Signalen ab. Design/Theme-Auswahl aus Menü „Ansicht“ entfernt. Diagonalkreuz (X) der Meldeleuchte übernimmt exakt dieselbe Farbe wie die Kreis-Outline. |
| **WISH-028** | Impulsdiagramm: Doppelte Loop-Buttons beseitigt, freies Maus-Panning bis Tick 0 & Taktfrequenz-Anzeige | `dev` | 🟢 **Completed** | Beseitigung redundanter „Loop Play“-Beschriftung auf dem Simulations-Startbutton (strikt getrennt in Start/Pause und Loop Play); freies horizontales Ziehen mit der Maus über die gesamte Signalhistorie bis Tick 0 ohne View-Lock; RingBuffer-Kapazität auf 10.000 Ticks erweitert; Taktfrequenz & Periodendauer (Hz und ms) fest im Timing-Diagramm-Header und in der Statusanzeige integriert. |
| **WISH-029** | Auto-Layout & Auto-Anordnen Optimierung (Recherche, Konfigurierbarkeit, CAD-Schematic-Standard, Port-Aware Sugiyama, Orthogonal Bus Routing & Spezifikations-Dokumentation) | `dev` | 🟢 **Completed** | Tiefgehende Analyse von Industrie-CAD-Standards (DIN EN 60617 / IEEE Std 91/91a, Logisim, KiCad, ELK Layered); Behebung der Schwächen im Volladdierer (4 Kreuzungen auf 0) durch kommutatives Pin-Swapping; stufenlose Spacing-Regler (Spalten, Zeilen, Pin-Stubs); Pin-Exact Y-Placement für 0-Knick-Geraden; vollständige Architektur- und Implementierungs-Spezifikation in `docu/AUTO_LAYOUT_SPEC.md` festgehalten. |
| **WISH-030** | Taster (BUTTON) Hebel-Geometrie & Stößel-Refactor, Beseitigung verwirrender 256/256 Ticks Kapazitäts-Anzeige | `dev` | 🟢 **Completed** | Beseitigung der alten verwirrenden Kapazitätsanzeige `256/256 Ticks` im Impulsdiagramm (saubere Kanal- und Gesamttick-Anzeige ohne Bruch oder Limit-Verwirrung); vollständige Überarbeitung des Taster-Hebels (`BUTTON`): im Ruhezustand saubere Rastung auf `0` (botY), im gedrückten Zustand saubere Kontaktierung von `1` (topY), DIN EN 60617 Stößel und Betätigungstaste exakt auf Hebelmitte ohne Kollisionen mit Kontakt-Pins oder Beschriftung. |
| **WISH-031** | Grundlegendes Schema der Themes überarbeiten (Kohärentes 5-Stufen Surface Elevation Modell, neutrales Schiefergrau für LOW-Signale statt Schlammgrün, optische Linsen & Radial-Illumination für Meldeleuchten) | `dev` | 🟢 **Completed** | Vollständiges Redesign aller 5 Themes (`modern`, `pitch_black`, `java_swing`, `blueprint`, `light_cad`) nach professionellen EDA/CAD-Standards. Inaktive Leitungen (LOW) als neutrales, gestochen scharfes Schiefergrau (`#38465c` / `#52525b` / `#64748b`) statt unleserlichem Sumpfgrün (`#143823`); Meldeleuchten (LED/Lampe) im Ruhezustand (0) als edle unbeleuchtete Linsenfassung im Display-Well statt grellem Fadenkreuz-Zielsucher; im aktiven Zustand (1) spektakuläre Radial-Glanzausleuchtung mit Licht-Bloom; Migration und Bereinigung alter gespeicherter Schlammfarben. |
| **WISH-032** | Kompaktes NOT-Gatter (50% Breitenreduktion auf 40x40, perfekte 20px-Rasterung & platzsparendes Wire-Inlining) | `dev` | 🟢 **Completed** | NOT-Gatter von sperrigen 80x40 Pixeln auf kompakte 40x40 Pixel (2x2 Rasterzellen) verkleinert. Exakte Zentrierung der Ein- und Ausgangs-Pins auf der 20px-Rasterachse (`relX = 0 / 40`, `relY = 20`); harmonische Dreiecks-Proportionen (32px Basis, 24px Schenkel, 7.2px Inversionsblase); Drag & Drop und Wire-Inlining zentrieren präzise mit 20px Offset. |
| **WISH-033** | Leitungsbrücken bei schrägen Verbindungen aktivieren & Globale Einstellung für schräge Leitungen | `dev` | 🟢 **Completed** | Universelle 2D-Kreuzungsberechnung und Jumper-Bögen für schräge Leitungen (`style: diagonal`) bei aktiven Brücken; deterministische Priorisierung (Horizontal > Diagonal > Vertikal) mit stufenlosem Kreisbogen-Rendering entlang beliebig gewinkelter Leitungsvektoren; neue globale Einstellung "Schräge Leitungen erlauben" im Einstellungen-Modal und Menü "Ansicht" mit striktem orthogonalen Manhattan-Fallback, persistiert in `localStorage`. |
| **WISH-034** | Schutz vor versehentlichem Abreißen von Gatter-Verbindungen & Automatisches Mergen offener Leitungsenden | `feat/prevent-accidental-wire-disconnect-and-auto-merge` | 🟢 **Completed** | Beseitigung des versehentlichen Abreißens von Gatter-Verbindungen beim Bauteil-Bewegen durch Bauteilkorpus-Priorität vor Pin-Klicks, Verkleinerung des Pin-Fangradius (von 14px auf 9px) und Erhöhung des Abriss-Schwellenwerts auf 24px (bei <24px bleibt die Verbindung unberührt, bei >=24px wird sie sauber als offenes Leitungsende gelöst statt gelöscht zu werden); Automatisches Mergen (`mergeOpenWireTermini`) aller offenen Leitungsenden (`toPoint` & `fromPoint`), die an denselben Koordinaten zusammentreffen, zu einer einzigen kontinuierlichen, leitenden Verbindung. |
| **WISH-035** | UI-Skalierung (Oberflächengröße), Paletten-Vorschau, NOT-Lead-Fix & Saubere Manhattan-Wegpunktführung | `fix/wire-interactions-and-merge-hardening` | 🟢 **Completed** | Stufenlose UI-Skalierung (80%–160%) für Menüs, Toolbar, Palette & Inspector; Umschaltung der Bauteil-Palette zwischen Beschriftung und gezeichneter Echtzeit-Vorschau; Beseitigung ungewollter Diagonalschrägen bei normalen Leitungen mit Wegpunkten; NOT-Gatter Leads im 40x40-Raster korrigiert; Schutz belegter Eingangspins vor versehentlichem Leitungsabriss beim Verschieben von Gattern. |
| **WISH-036** | Auto-Anordnen & Layout-Menü im Simulationsmodus strikt sperren und schließen | `fix/disable-auto-align-in-sim-mode` | 🟢 **Completed** | Auto-Anordnen Split-Button (`#btn-auto-route`), Caret-Button (`#btn-align-menu`) und Popover-Menü (`#align-popover`) werden im Simulationsmodus vollständig deaktiviert (`disabled = true`, `pointer-events: none`). Laufendes Popover schließt sich bei Moduswechsel zu Simulation sofort. Tastenkürzel (`A`, `L`), Menüeinträge und Kontextmenü-Einträge sind im Simulationsmodus blockiert. |
| **WISH-037** | Veraltetes „bündig ausrichten“ aus Kontextmenü entfernen | `feat/alpha-wishlist-batch-37-44` | 🟢 **Completed** | Menüeinträge „Links bündig ausrichten“ und „Oben bündig ausrichten“ vollständig aus dem Mehrfachauswahl-Kontextmenü entfernt. |
| **WISH-038** | Leitungs-Stabilisierung beim Taster-Druck (`BUTTON`) im Edit-Modus | `feat/alpha-wishlist-batch-37-44` | 🟢 **Completed** | Klicks und Halten auf Taster (`BUTTON`) im Edit-Modus verformen oder verändern keine angeschlossenen Leitungen mehr (`wire._preview` und `draggingComp` werden bei Taster-Interaktion übersprungen). |
| **WISH-039** | Eigene Module: Komprimiertes IC-Bauteil (Black-Box) vs. Makro-Gruppe | `feat/alpha-wishlist-batch-37-44` | 🟢 **Completed** | Beim Speichern eigener Module Auswahl zwischen komprimiertem Black-Box IC (`CUSTOM_IC`) und Schaltungs-Gruppe (Makro). Bei IC werden Schalter/Taster/Takte zu externen Eingangspins, LEDs/Displays zu Ausgangspins, interne Gatter komprimiert und in der Simulation korrekt evaluiert. |
| **WISH-040** | Split-Screen Header-Kollision mit Inspector-Expand-Button behoben | `feat/alpha-wishlist-batch-37-44` | 🟢 **Completed** | Bei aktivem Split-Screen dockt der Inspector-Expand/Einstellungs-Button (`#btn-inspector-expand`) automatisch auf `top: 68px` unterhalb der 28px Pane-Kopfzeile ab (`.split-screen-active`). |
| **WISH-041** | Frequenz-Steuerung & Zeit-Anzeige im Impulsdiagramm gespiegelt (`ms`), Ticks-Bereinigung | `feat/alpha-wishlist-batch-37-44` | 🟢 **Completed** | Gespiegelter Frequenz-Slider `#analyzer-slider-freq` im Impulsdiagramm-Header mit bidirektionaler Synchronisation; ms-Zeitangabe (`10 Hz (100 ms)`) in oberer Toolbar und Analyzer; Bereinigung der verwirrenden Kanal-Tick-Anzeige zu sauberen `(X Kanäle)`; Ausblenden der Controls bei eingeklapptem Analyzer. |
| **WISH-042** | NOT-Gatter 40x40 Größen-Arretierung & 30px Pin-Fangbereich | `feat/alpha-wishlist-batch-37-44` | 🟢 **Completed** | Breiten-Rücksprung von 40px auf 80px in `rebuildPins()` dauerhaft behoben; Fangradius beim Fallenlassen von NOT/Negator auf Gatterpins zur Signalinvertierung auf 30px erweitert. |
| **WISH-043** | Kontextmenü-Scrolling (`max-height`) & Viewport-Clamping | `feat/alpha-wishlist-batch-37-44` | 🟢 **Completed** | `max-height: calc(100vh - 24px)` mit vertikalem Scrollen und Viewport-Bounding-Box-Clamping für Kontextmenüs gegen Abschneiden am Bildschirmrand. |
| **WISH-044** | Performante Signalfarb-Auswahl (rAF-Throttling & debounced Storage) | `feat/alpha-wishlist-batch-37-44` | 🟢 **Completed** | Farbauswahl für HIGH- und LOW-Signale per `requestAnimationFrame` flüssig gedrosselt, `saveSettings()` erst beim `change`-Event. |
| **WISH-045** | Branching-Modell-Migration auf `main` + `dev` & Prompt-Log | `chore/branch-model-main-dev` | 🟢 **Completed** | Legacy-Tiers `alpha`/`beta` durch `main` (Production) und `dev` (Development/Integration) ersetzt; Feature-Branch-Workflow (`feat/*`, `fix/*`, `chore/*`, `docs/*`, `hotfix/*`) dokumentiert; Commit-Konvention inkl. `Co-authored-by` festgehalten; Prompt-Log unter `docu/PROMPT_LOG.md` angelegt. |
| **WISH-046** | Bauteil-Palette im Simulationsmodus abgedunkelt & gesperrt | `fix/palette-sim-lock` | 🟢 **Completed** | 55 % Deckkraft; Drag & Drop, Doppelklick und Löschen in der Simulation gesperrt. |
| **WISH-047** | Doppelte Takt-/Zoom-Anzeige im Impulsdiagramm entfernt, Leeres-Arbeitsfläche-Popup entfernt | `feat/palette-sim-edit-and-slider-dedup` | 🟢 **Completed** | Nur noch Slider ohne zusätzliche Hz-/ms-/px-pro-Tick-Texte. |
| **WISH-048** | Kamera folgt beim Verschieben ausgewählter Module | `feat/drag-autopan` | 🟢 **Completed** | Auto-Scroll am Rand der Arbeitsfläche beim Ziehen von Modulen. |

---

## 📝 Change Log & Completed Wishes

- **WISH-045 (Branching-Modell-Migration auf `main` + `dev` & Prompt-Log)**:
  - `dev` als einzigen langfristigen Integrations-/Entwicklungsbranch aus dem bisherigen `alpha`-Stand erstellt.
  - `main` bleibt der Production-Branch; der GitHub-Pages-Deployment-Workflow wurde nach `dev` synchronisiert.
  - Short-lived Feature-Branch-Workflow für `feat/*`, `fix/*`, `chore/*`, `docs/*` und `hotfix/*` in `WISHLIST.md` und `CONTRIBUTING.md` dokumentiert.
  - CI-Branchfilter in `.github/workflows/test.yml` auf `main`, `dev` und die Feature-Branch-Präfixe umgestellt.
  - Chronologisches Prompt-Log unter `docu/PROMPT_LOG.md` eingeführt.
  - Den finalen `alpha`-Stand (`v1.1.3-alpha`) vor dem Löschen nach `dev` gemergt und als `archive/alpha` getaggt.
  - Legacy-Branches `alpha`, `beta` und der gemergte Feature-Branch entfernt; `alpha`-Historie über `archive/alpha` und `beta`-Historie über `archive/beta` gesichert.

- **WISH-037 bis WISH-044 (Alpha Batch v1.1.2-alpha)**:
  - **WISH-037 (Veraltetes „bündig ausrichten“ entfernt)**:
    - Einträge „Links bündig ausrichten“ und „Oben bündig ausrichten“ restlos aus dem Kontextmenü für Mehrfachauswahlen entfernt.
  - **WISH-038 (Taster-Verbindungsstabilität im Edit-Modus)**:
    - Klick- und Halte-Interaktion auf Taster (`BUTTON`) im Edit-Modus setzt direkt `pressed = 1` und triggert Sofort-Pegelsynchronisation ohne `beginDragPreview` oder `draggingComp`.
    - Bestehende Leitungsverläufe, Segmente und Wegpunkte bleiben unberührt.
  - **WISH-039 (Eigene Module: Komprimiertes IC-Bauteil vs. Makro-Gruppe)**:
    - Abfrage beim Speichern: Black-Box IC (`CUSTOM_IC`) oder Schaltungs-Gruppe (Makro).
    - IC-Kompression konvertiert Schalter/Taster/Takte zu externen Eingängen, LEDs/Displays zu externen Ausgängen; interne Gatter werden als kompaktes Subcircuit im IC gekapselt und per `compute()` simuliert.
    - Vollständige Drag&Drop- und Paletten-Unterstützung mit Kennzeichnung `[IC]`.
  - **WISH-040 (Split-Screen Inspector-Expand Docking)**:
    - `.split-screen-active #btn-inspector-expand` dockt auf `top: 68px` unterhalb der Split-Pane-Header-Leiste ab, um Überlappungen mit Select/Close-Buttons zu verhindern.
  - **WISH-041 (Frequenz-Steuerung gespiegelt, ms-Readout & Ticks-Bereinigung)**:
    - Gespiegelter Slider `#analyzer-slider-freq` im Impulsdiagramm-Header mit bidirektionaler Synchronisation zum Haupt-Takt-Slider.
    - Anzeige im Format `${val} Hz (${ms} ms)` auf beiden Slidern.
    - Bereinigung der verwirrenden Kanal-/Tick-Anzeige im Impulsdiagramm auf saubere `(X Kanäle)`.
    - Ausblenden der Controls im eingeklappten Zustand des Analyzers.
  - **WISH-042 (NOT-Gatter 40x40 Arretierung & 30px Pin-Fangbereich)**:
    - Feste Verankerung der NOT-Gatter-Dimensionen (40x40) in `rebuildPins()`, verhindert Rücksprung auf 80x40.
    - Pin-Fangbereich beim Drag&Drop von NOT/Negator auf Gatterpins zur Signalinvertierung auf 30px erweitert.
  - **WISH-043 (Kontextmenü Viewport-Clamping & Scrolling)**:
    - `max-height: calc(100vh - 24px)` und vertikales Scrollen in `.context-menu`.
    - Dynamische Randberechnung (`getBoundingClientRect`) in `showContextMenu` und `showWaypointContextMenu`.
  - **WISH-044 (Performante Signalfarb-Auswahl)**:
    - `requestAnimationFrame`-Drosselung bei fortlaufender Farbauswahl (Color Picker `input`).
    - Speicherung in `localStorage` (`saveSettings`) erst beim `change`-Event.
  - **Taster (BUTTON) Hebel-Refactor (`media_1794386632823_9d671721.jpg`)**:
    - Entfernung des störenden massiven 12x3px Rechteck-Blocks vom Taster-Hebel.
    - Schlanke, DIN EN 60617 konforme T-Stößel-Darstellung ohne Überlappungen mit dem roten Hebel oder Pin 1.
  - **Auto-Anordnen Sperrung im Classic/Java-Swing Theme (`media_1794386036260_a766cd4f.png`)**:
    - Spezifische CSS-Regeln für `[data-theme="java_swing"] .align-split.sim-locked`, um `!important`-Überschreibungen abzusichern. Caret und Button sind im Simulationsmodus unmissverständlich grau, ohne 3D-Bevel und unklickbar.

- **WISH-036 (Auto-Anordnen & Layout-Menü im Simulationsmodus strikt sperren und schließen)**:
  - **Vollständige Sperrung im Simulationsmodus**:
    - Der Split-Button `#align-split` erhält in CSS bei `.sim-locked` `pointer-events: none;` und `cursor: not-allowed;` für Container und alle Schaltflächen.
    - `updateHUDAndToolbar()` setzt explizit `#btn-auto-route.disabled = isSim` und `#btn-align-menu.disabled = isSim`.
    - Beim Umschalten auf Simulationsmodus wird ein etwaig noch geöffnetes `#align-popover` Menü sofort per `this.closeAlignMenu()` geschlossen.
    - Klicks auf den Chevron-Pfeil (`#btn-align-menu`) und Aufrufe von `open()` werden im Simulationsmodus unmittelbar ignoriert.
    - `autoAlign()` besitzt eine harte Prüfung `if (this.engine.mode !== 'edit')` und blockiert jede Neuordnung während der Simulation mit informativem Toast-Hinweis.
    - Tastenkürzel (`A` für Alles anordnen, `L` für Leitungen neu verlegen), Menüleisten-Einträge (`#menu-item-layout`, `#menu-item-reroute`) sowie die Kontextmenü-Punkte auf der Arbeitsfläche werden im Simulationsmodus unterbunden.
  - **Test-Abdeckung**: Neuer Test `[WISH-036]` in `tests/comprehensive_test_suite.js`, alle 55 Tests und alle 6 Suiten bestehen zu 100%.

- **WISH-035 (UI-Skalierung, Paletten-Vorschau, NOT-Lead-Fix & Saubere Manhattan-Wegpunktführung)**:
  - **Stufenlose UI-Skalierung (Oberflächengröße 80%–160%)**:
    - Neue Benutzer-Einstellung in den Einstellungen (`#settings-ui-scale`) und per Buttons `A-` / `A+`, um Menüs, Werkzeugleiste, Palette, Tabs, Inspector, Modale und Kontextmenüs flexibel zu skalieren.
    - Die Zeichenfläche (Canvas) behält ihre exakten Pixel- und Mauskoordinaten bei.
  - **Umschaltung der Bauteil-Palette (Beschriftung / Vorschau)**:
    - Neue Umschaltleiste in der Palette (`.palette-view-bar`): Schneller Wechsel zwischen klassischer Textbeschriftung (`labels`) und gerenderter Miniatur-Vorschau (`preview`), die jedes Gatter, jede Meldeleuchte und jedes Modul exakt wie auf dem Schaltplan darstellt.
  - **Saubere Manhattan-Wegpunktführung (Orthogonales Routing)**:
    - Fehler behoben, bei dem Leitungen mit Wegpunkten bei aktivierter Diagonalfunktion ungewollt schräg durch das Gitter gezogen wurden. Normale Leitungen bleiben strikt rechtwinklig (90° Manhattan-Knicke); diagonale Verbindungen werden nur bei explizitem Shift-Drag verwendet.
  - **NOT-Gatter Leads im kompakten 40x40-Raster**:
    - Die für 80px-Gatter gedachten 20px-Leads wurden beim kompakten 40x40 NOT-Gatter entfernt, sodass Pins und Anschlüsse exakt bündig auf dem 20px-Gitter liegen.
  - **Robuster Schutz belegter Pins**:
    - Belegte Eingangspins fangen keine Zieh-Events mehr ab und reißen niemals versehentlich ab; Klicks auf das Gatter verschieben zuverlässig die gesamte Baugruppe samt intakter Leitungen.
  - **Test-Abdeckung**: Neuer Test `[WISH-035]` in `tests/comprehensive_test_suite.js`, alle 54 Tests und alle 6 Suiten bestehen zu 100%.

- **WISH-034 (Schutz vor versehentlichem Abreißen von Gatter-Verbindungen & Automatisches Mergen offener Leitungsenden)**:
  - **Schutz vor versehentlichem Abreißen von Verbindungen**:
    - **Korpus-Klick-Priorität vor Pin-Hijacking**: Beim Anklicken oder Verschieben von Gattern (`draggingComp`) hatte der bisherige 14px-Pin-Fangradius die Klicks im Bauteilinneren abgefangen und stattdessen versehentliche Leitungs-Drags ausgelöst. Jetzt hat das Anklicken des Bauteilkorpus (mit 5px Randabstand) strikte Priorität vor Pin-Klicks.
    - **Präziser Pin-Fangradius**: Der Pin-Fangradius wurde von überdimensionierten 14px auf präzise 9px (entsprechend der doppelten visuellen Kreisgröße von 4.2px) reduziert.
    - **Schwellenwert für Leitungsabriss**: Klick-Zittern oder kurze Ziehbewegungen unter 24px (mehr als 1 Gitterzelle) brechen den Drag sofort ab, ohne bestehende Verbindungen anzurühren.
    - **Verlustfreies Lösen statt Zerstören**: Wird eine am Eingang angeschlossene Leitung bewusst $\ge 24\text{ px}$ weggezogen, wird die bisherige Leitung nicht mehr gelöscht, sondern sauber als offenes Leitungsende (`toPoint = {x, y}`) vom Pin getrennt.
  - **Automatisches Mergen zusammentreffender offener Leitungsenden (`mergeOpenWireTermini`)**:
    - Treffen zwei offene Leitungen (`toPoint` und `fromPoint`, z. B. Leitung von Schalter zu Punkt P und Leitung von Punkt P zu Lampe) an denselben Koordinaten aufeinander (bzw. werden per Drag aufeinander abgelegt), verschmelzen sie automatisch zu einer einzigen durchgehenden Verbindung.
    - Signale fließen unmittelbar durch die verschmolzene Leitung zur Lampe / zum Folgegatter.
    - Auch offene Eingangs-Abzweige (`fromPoint` an `fromPoint`) verschmelzen automatisch zu Hauptleitung und Verzweigung.
    - Nahtlose Integration beim Leitungsziehen (`finishActiveWireAtPoint`), beim Bewegen offener Enden (`draggingTerminus`) und beim Auto-Snappen (`snapOpenWiresToComponent`).
  - **Test-Abdeckung**: Neuer Test `[WISH-034]` in `tests/comprehensive_test_suite.js`, alle 53 Tests und 6 Suiten bestehen fehlerfrei.

- **WISH-033 (Leitungsbrücken bei schrägen Verbindungen aktivieren & Globale Einstellung für schräge Leitungen)**:
  - **Universelle Leitungsbrücken (Jumper Arches) für schräge Verbindungen**:
    - Das bisherige Brücken-Rendering in `drawWires` war rein auf orthogonale Kreuzungen (rein horizontales Segment über rein vertikalem Segment) beschränkt; schräge Segmente wurden vollständig ignoriert.
    - Neu implementierte 2D-Streckenkreuzungs-Mathematik mit parametrischem Schnittpunkttest ($t, u \in [8/L, 1-8/L]$), $O(1)$-AABB-Bounding-Box-Vorfilterung und strikter Prüfung elektrischer Netze (`getWireNet`).
    - Deterministische Ebenen-Hierarchie ohne flackernde Doppel-Bögen: Horizontal (Rang 3) > Diagonal (Rang 2) > Vertikal (Rang 1). Bei gleichrangigen Segmenten entscheidet die Leitungs-ID deterministisch.
    - Vektorbasiertes Kreisbogen-Rendering (`ctx.arc(cx, cy, r, theta + Math.PI, theta, false)`) orientiert den Jumper-Bogen exakt entlang des beliebigen Leitungs-Vektors $\theta = \operatorname{atan2}(dy, dx)$, sodass schräge Leitungen über vertikale, horizontale oder andere schräge Leitungen mit eleganten 5px-Bögen springen.
  - **Globale Einstellung „Schräge Leitungen erlauben“ (`allowDiagonalWires`)**:
    - Neue Benutzer-Einstellung `allowDiagonalWires` (standardmäßig `true`), die das Zeichnen und Verlegen diagonaler Leitungen global steuert.
    - Vollständig integriert in:
      - **Einstellungen-Modal** (`#settings-allow-diagonal-wires`): Checkbox mit Erklärung unter den Leitungs-Optionen.
      - **Menü „Ansicht“** (`#menu-item-toggle-diagonal`): Umschalter mit Haken-Statusanzeige und Toast-Feedback.
      - **Inspector**: Dropdown `Verlegungsart` deaktiviert die Option `Diagonal (in Einstellungen deaktiviert)`, wenn schräge Leitungen verboten sind.
      - **Kontextmenü**: Umschalten zu `Diagonal` wird ausgegraut mit Tooltip.
      - **Leitung-Ziehen (Umschalt-Taste)**: Drücken von Shift aktiviert im deaktivierten Zustand keine Diagonalführung.
      - **Automatischer Manhattan-Fallback**: Bei `allowDiagonalWires = false` routet `computeWirePath` auch bestehende diagonale Leitungen oder Wegpunkte strikt über rechtwinklige Manhattan-Knicke.
    - Dauerhafte Speicherung in `localStorage` (`logicsim_allow_diagonal_wires` & `logicsim_user_settings`) sowie Einbindung in `Standard wiederherstellen` (`btnReset`).
  - **Test-Abdeckung**: Neuer Test `[WISH-033]` in `tests/comprehensive_test_suite.js`, alle 52 Tests und 6 Suiten bestehen fehlerfrei.

- **WISH-032 (Kompaktes NOT-Gatter: 50% Breitenreduktion auf 40x40, perfekte 20px-Rasterung & platzsparendes Wire-Inlining)**:
  - **Kompakte Bauteil-Dimensionen (40x40 Pixel)**:
    - Das NOT-Gatter (`Component.prototype.initPins`) wurde von der bisherigen 80x40-Übergröße (die genauso breit war wie 2- und 3-Input-Gatter) auf kompakte **40x40 Pixel** verkleinert.
    - Dadurch nimmt der Invertierer auf dem Schaltplan genau 2x2 Rasterzellen ein (identisch mit der Meldeleuchte `LED`), wodurch Schaltungen viel aufgeräumter wirken und enge Signalpfade nicht mehr künstlich auseinandergezogen werden müssen.
  - **Exakte Pin- und Geometrie-Ausrichtung**:
    - Eingangspin `X1` bei `(0, 20)`, Ausgangspin `Y` bei `(40, 20)` – beide Pins liegen mathematisch exakt auf dem 20px-Raster.
    - Die Dreiecks-Geometrie und Inversionsblase nach DIN 40700 / ANSI sowie der IEC-Block nach DIN EN 60617 passen sich automatisch mit harmonischem Seitenverhältnis an.
  - **Flüssiges Drag & Drop & Wire-Inlining**:
    - Das Ziehen und Fallenlassen auf Leitungen (`inlineGateIntoWire`) und der Canvas zentriert das NOT-Gatter präzise mit 20px Cursor-Versatz im 20px-Raster.
  - **Test-Abdeckung**: Neuer Test `[WISH-032]` in `tests/comprehensive_test_suite.js`, alle 51 Tests und 6 Suiten bestehen fehlerfrei.

- **WISH-031 (Grundlegendes Schema der Themes überarbeiten: Kohärentes 5-Stufen Surface Elevation Modell, neutrales Schiefergrau für LOW-Signale statt Schlammgrün, optische Linsen & Radial-Illumination für Meldeleuchten)**:
  - **Neues 5-Stufen Surface Elevation System über alle 5 Themes**:
    - `L0 Canvas Background`: Modern Dark (`#10141d`), Pitch Black OLED (`#000000`), Blueprint (`#071527`), Clean Light CAD (`#f8fafc`), Classic Desktop Java Swing (`#ffffff`).
    - `L1 Module Background`: Einheitliche, zurückgesetzte IC- und Sub-Circuit-Container (`#0e131d` / `#09090b` / `#071527` / `#f1f5f9` / `#ece9d8`).
    - `L2 Gates & Chassis`: Erhabene technische Arbeitsflächen für Gatter und Bedienelemente (`#182030` / `#09090b` / `#0c233f` / `#ffffff`).
    - `L3 Display Wells & Linsen`: Tief liegende optische Wannen für 7-Segment, Zähler und Meldeleuchten (`#090d14` / `#000000` / `#030b14` / `#0f172a`).
    - `L4 Overlays & Signals`: Hochkontrastige Interaktionselemente und Leuchtsignale.
  - **Neutrales Schiefergrau für inaktive Leitungen (LOW = 0)**:
    - Beseitigung des alten, schlammig-düsteren Grüntons (`#143823`) auf inaktiven Leitungen und in den Preset-Paletten.
    - LOW-Signale werden standardmäßig in präzisem, ruhigem Schiefergrau (`#38465c` in Modern, `#52525b` in OLED, `#255994` in Blueprint, `#64748b` in Light CAD, `#555555` in Java Swing) gezeichnet. Dadurch heben sich aktive HIGH-Signale (1) mit spektakulärer Leuchtkraft vom Schaltplan ab.
    - Automatische Migration in `loadSettings`: Zuvor in `localStorage` gespeicherte alte `#143823`-Werte werden beim Laden automatisch auf `null` bereinigt, sodass bestehende Schaltungen sofort das neue Theme-Design nutzen.
  - **Meldeleuchten (LED/Lampe) nach DIN EN 60617 / IEC**:
    - **Im AUS-Zustand (0)**: Das Innere der Lampe ist keine braun-schlammige Masse mehr und das Fadenkreuz-Diagonalkreuz schreit nicht mehr mit neonfarbener Sättigung. Stattdessen bildet die unbeleuchtete Lampe eine dezente, edle Linsenwanne (`displayWellFill`) mit präziser Einfassung.
    - **Im EIN-Zustand (1)**: Vollflächige Radial-Illumination mit hellem Glanzzentrum (`#ffffff` Kern zu Sättigung), weichem Licht-Bloom (18px) und hinterleuchtetem Diagonalkreuz. Der Kontrast zwischen 0 und 1 ist nun unmittelbar und fotometrisch überzeugend.
  - **Timing-Diagramm (Analyzer) & Messpunkte (Probes)**:
    - Hintergrund und Gutter des Impulsdiagramms sind exakt auf das gewählte Theme abgestimmt (`#10141d` mit `#161d2a` Header).
    - Messpunkt-Pills (`Probes`) stellen den Pegel `0` auf Leitungen in ruhiger, gut lesbarer Schrift (`pal.textMuted`) dar, statt in unleserlichem Schlammgrün.
  - **Test-Abdeckung**: Neuer Test `[WISH-031]` in `tests/comprehensive_test_suite.js`, alle 50 Tests und 6 Suiten bestehen fehlerfrei.

- **WISH-030 (Taster (BUTTON) Hebel-Geometrie & Stößel-Refactor, Beseitigung verwirrender 256/256 Ticks Kapazitäts-Anzeige)**:
  - **Beseitigung von `256/256 Ticks`**:
    - Das Label `#analyzer-probe-count` und die Zeitachsen-Anzeigen zeigen keine verwirrende Bruch-Darstellung (`count/capacity` wie z. B. `256/256 Ticks`) mehr an. Stattdessen wird eine saubere, unmissverständliche Anzeige verwendet: z. B. `(0 Kanäle)` im Leerlauf bzw. `(1 Kanal | 256 Ticks)` während der Aufzeichnung mit dem auf 10.000 Ticks erweiterten Puffer.
    - Vollständige Synchronisierung in `I18N` mit korrekter Pluralisierung für Deutsch und Englisch.
  - **Taster (BUTTON) Hebel- & Stößel-Geometrie**:
    - Der Hebel des Tasters schwebte zuvor in der Ruhestellung bei `cy + 3` unverbunden im Raum und der Stößel überdeckte bei Betätigung mit einem roten Balken den oberen Kontakt `1`.
    - Im unbetätigten Zustand (Ruhestellung) liegt der Hebel nun präzise und sauber auf dem `0`-Kontakt (`botY = cy + 9`) auf.
    - Im betätigten Zustand verbindet der Hebel exakt mit dem `1`-Kontakt (`topY = cy - 9`).
    - Der Betätigungsstößel (DIN EN 60617 Stößel mit Betätigungstaste) ist mathematisch exakt auf der Mitte des Hebels (`midX = 46`) verankert. Dadurch gibt es einen Sicherheitsabstand von über 20 Pixeln zu den Kontaktpunkten und Beschriftungen – null Überlappungen, saubere isolierte Pfade und perfekte Schaltplan-Ästhetik.
  - **Test-Abdeckung**: Neuer Test `[WISH-030]` in `tests/comprehensive_test_suite.js`, alle 49 Tests bestehen fehlerfrei.

- **WISH-029 (Auto-Layout & Auto-Anordnen Optimierung: Recherche, Konfigurierbarkeit, CAD-Schematic-Standard, Port-Aware Sugiyama, Orthogonal Bus Routing & Spezifikation)**:
  - **Empirische Schwachstellenanalyse des Ist-Zustands (`layout_eval.js`)**:
    - Der aktuelle Auto-Layout-Algorithmus erzielt im Durchschnitt einen Beauty-Score von 77/100, versagt jedoch bei klassischen Standardbausteinen wie dem Volladdierer (`3_full_adder`: 47/100 mit 4 unnötigen Kreuzungen) und LFSR (`2_lfsr_light`: 69/100 mit 18 Knicken).
    - Ursachen: Starre 3 Presets ohne Schieberegler, fehlende Ausnutzung kommutativer Eingänge (AND/OR/XOR), Bauteilzentrierung statt Pin-to-Pin Straight-Wire Alignment und Rückkopplungen ohne dedizierte Außenbahnen.
  - **Umfassende Recherche nach Industrie-CAD-Standards**:
    - Analyse modernster EDA-Ansätze (DIN EN 60617 / IEEE Std 91/91a, *Eclipse Layout Kernel (ELK Layered)*, *KIELER Framework*, *yWorks yFiles*, *Brandes & Köpf*).
    - Festlegung des Port-Constraint-Modells (`FIXED_SIDE`, `FIXED_ORDER`, `PORT_EQUAL_CLASS`).
    - Orthogonales Bus- und Trunk-Routing über Steiner-Bäume zur Bündelung von Mehrfachabzweigen (Fan-Out).
  - **Volle Benutzer-Konfigurierbarkeit & UI-Spezifikation**:
    - Konfigurierbare Parameter: `columnSpacing` (40–240px), `rowSpacing` (20–120px), `pinStubLength` (20–80px), `layoutDirection` (`LR`, `TB`, `RL`), `alignmentMode` (`pin-exact`, `center`, `barycentric`), `commutativePinSwap` (true/false) und `feedbackChannel` (`perimeter`, `direct`).
    - 4 abgestimmte Presets: Kompakt (Eng), Standard (Lehrbuch), CAD / Großzügig (Weit), Benutzerdefiniert.
    - Vollständiges UI-Mockup für den neuen Einstellungsbereich "Auto-Layout & Leitungen" im Settings-Modal.
  - **Vollständige Spezifikations-Dokumentation**:
    - Erstellung von `docu/AUTO_LAYOUT_SPEC.md` mit detaillierter 5-Phasen-Architektur, mathematischen Formeln, Pseudocode und Benchmark-Zielvorgaben (Steigerung des Durchschnitts-Scores auf $\ge 95/100$ und des Volladdierers auf $\ge 95/100$).

- **WISH-028 (Impulsdiagramm: Doppelte Loop-Buttons beseitigt, freies Maus-Panning bis Tick 0 & Taktfrequenz-Anzeige)**:
  - **Doppelte Controls beseitigt**:
    - Der Simulations-Start/Pause-Button (`#btn-sim-start` und `#btn-analyzer-sim-start`) ändert seinen Zustand und seine Beschriftung nun strikt und ausschließlich anhand des Simulations-Status (`Start` / `Pause`), selbst wenn Loop-Klammern (`loopRange`) aktiv sind.
    - Die Schleifenwiedergabe verbleibt exklusiv beim dedizierten Button `#btn-analyzer-loop` (`Loop Play` / `Pause Loop`). Dadurch gibt es niemals zwei nebeneinanderliegende Buttons mit dem Namen „Loop Play“.
  - **Freies horizontales Maus-Panning bis Tick 0**:
    - Die Standardkapazität des `RingBuffer` wurde von 256 auf 10.000 Ticks erweitert. Selbst nach tausenden Ticks wird Tick 0 nicht mehr überschrieben oder verworfen.
    - Maus-Klick-Ziehen auf dem Wellenformbereich (`my > 22`) verschiebt die Ansicht 1:1 pixelgenau entlang der gesamten Aufzeichnung. Bei Erreichen der Ränder scrollt die Ansicht automatisch kontinuierlich weiter bis Tick 0 (`scrollRatio = 0.0`) oder zum neuesten Tick (`1.0`).
    - Klick ohne Ziehen setzt den Playhead präzise auf den anvisierten Tick.
    - Auch das Ziehen der Loop-Klammern (`[` und `]`) sowie des Playheads im Ruler-Bereich (`my <= 22`) scrollt an den Rändern automatisch dynamisch mit, sodass Klammer `In` bis zu Tick 0 gesetzt werden kann.
  - **Taktfrequenz & ms/Tick-Anzeige im Impulsdiagramm**:
    - Neues Takt-Badge `#analyzer-speed-badge` direkt neben den Simulations-Steuerelementen im Impulsdiagramm-Header (`Takt: 10 Hz (100 ms)`).
    - Dynamische Synchronisierung bei jeder Frequenzänderung im laufenden Betrieb (z. B. 20 Hz -> 50 ms).
    - Status-Text `#analyzer-playhead-info` formatiert Takt und Periodendauer einheitlich und übersichtlich am Zeilenanfang (`Takt: X Hz (Y ms) | Playhead: t = ... | Zeitrahmen: ...`).
  - **Test-Abdeckung**: Neuer Test `[WISH-028]` in `tests/comprehensive_test_suite.js`, alle 48 Tests bestehen fehlerfrei.

- **WISH-027 (Schalter-Hintergrund Kontrast, Theme-Entfernung aus Ansicht & Lampen-X Outline-Parität)**:
  - **Schalter-Hintergrund & Beseitigung des schwarzen Dreiecks**:
    - Der Bug mit mehrfach verketteten `ctx.arc()`-Aufrufen vor einem einzigen `ctx.fill()` in `SWITCH` und `BUTTON` wurde behoben. Die Terminalpunkte 1, 0 und der Drehpunkt werden nun als isolierte Kreis-Pfade gezeichnet, wodurch kein fälschlich gefülltes schwarzes Dreieck mehr das Modul überdeckt.
    - Das Chassis von `SWITCH`, `BUTTON`, `CLOCK` und `CONST` verwendet nun `pal.gateFill || pal.chassisFill` (reines Weiß `#ffffff` in Java Swing und Light CAD), wodurch ein perfekter Kontrast zum LOW-Signalpegel (wie z. B. Bernstein `#3d280e` oder dunklem Grün) gewährleistet ist.
  - **Theme-Einstellung aus Menü „Ansicht“ entfernt**:
    - Der Abschnitt „Design / Theme“ mit den 5 Theme-Schaltern wurde aus dem Menü `Ansicht` (`#mdropdown-view`) entfernt. Die Theme-Auswahl bleibt übersichtlich in den allgemeinen `Einstellungen` (`#logic-settings-modal`) erhalten.
  - **Lampen-X in exakter Outline-Farbe**:
    - In `drawLampComponent` und `drawComponentInterior` übernimmt das Diagonalkreuz (`X`) im Inneren der Lampe (LED) nun exakt dieselbe Farbe wie die Außenkontur (`outlineColor` / `cObj.border`) – sowohl im Ruhezustand (z. B. sattes Gelb `#ffc400`) als auch im aktiven Leuchtzustand.

- **WISH-026 (Auto-Snap offener Leitungen, vereinte NOT-Palette, Pin-Invertierung & Wire-Inlining)**:
  - **Auto-Snap offener Leitungen an neue/gepastete Module**:
    - Neue Methode `Circuit.prototype.snapOpenWiresToComponent(comp, snapRadius = 24)` und `App.prototype.snapOpenWiresToComponent`.
    - Beim Drag & Drop aus der Palette, beim Einfügen per Tastaturkürzel (Strg+V / `pasteClipboard`), beim Duplizieren der Auswahl (`duplicateSelection`) und beim Duplizieren per Kontextmenü („Bauteil duplizieren“) werden alle im Fangradius befindlichen offenen Leitungs-Enden (`w.toPoint` an Eingangs-Pins) und offenen Leitungs-Starts (`w.fromPoint` an Ausgangs-Pins) automatisch sauber angeschlossen.
    - Leitungs-Wegpunkte werden nach dem Einrasten begradigt (`cleanWireWaypoints`) und Signalpegel sofort synchronisiert (`syncImmediateWireLevels`). Toast-Rückmeldung bei erfolgreichem Einrasten.
  - **Palette auf ein einziges NOT vereinheitlicht**:
    - Redundanter Eintrag `NEGATOR` aus der Palette entfernt; nur noch ein einziges `NOT`-Element vorhanden.
    - Drag & Drop des NOT-Gatters unterstützt 3 intuitive Anwendungsfälle:
      1. **Drop auf Pin eines beliebigen Moduls**: Invertiert den Pin direkt (Eingangs-Invertierung `invertedInputs[i]` oder Ausgangs-Invertierung `invertedOutput`).
      2. **Drop auf eine bestehende Leitung**: `circuit.inlineGateIntoWire(wire, 'NOT', x, y)` trennt die Leitung automatisch auf und schaltet das NOT-Gatter inline dazwischen (Signalquelle speist NOT-Eingang, NOT-Ausgang speist das ursprüngliche Ziel).
      3. **Drop auf freie Arbeitsfläche**: Platziert ein normales NOT-Gatter und rastet offene Leitungen in der Nähe automatisch ein.
  - **Pin-Invertierung (`○`) auf ALLEN Modulen (Gates & IC-Module)**:
    - `Component.prototype.getEffectiveInputValue(idx)` vereinheitlicht das Auslesen von invertierten Eingängen über alle Modultypen (Full Adder, Multiplexer, Decoder, BCD-Decoder, 4-Bit Counter, Shift Register, D-FF, JK-FF, T-FF, SR-Latch, LED, 7-Segment).
    - `CanvasRenderer.prototype.drawComponentPins` zeichnet gestochen scharfe Negations-Blasen (`○`, Radius 3.2px) an den Eingängen und Ausgängen aller Nicht-Gatter-Module.
    - Kontextmenü und Alt-Klick unterstützen Pin-Invertierung nun für sämtliche Bauteile mit Ein- oder Ausgängen.
  - **GUI-Kontrast im Kontextmenü gehärtet**:
    - Bulletproof CSS-Regeln für `.ctx-item` und Kindelemente (`.ctx-item *`) im Java Swing- und Light CAD-Design, sodass Text und Icons bei Hover und Normalzustand stets maximalen Kontrast aufweisen.

- **WISH-025 (Taktfrequenz im laufenden Betrieb & Impulsdiagramm-Klammern)**:
  - **Taktfrequenz im laufenden Betrieb**:
    - Der Takt-Slider (`#slider-freq`) lässt sich während einer laufenden Schaltungssimulation flüssig und direkt per Maus oder Mausrad verstellen.
    - `SimulationEngine.setFrequency` skaliert den `accumulator` proportional zum neuen Taktintervall (`1000 / frequency`), sodass keine plötzlichen Tick-Staus (Burst) oder Hänger beim Verstellen entstehen.
    - Beseitigung der störenden `attachSliderHoldRepeat`-Überlagerung auf dem nativen Range-Input, wodurch der Slider ohne Ruckeln auf Eingaben reagiert.
  - **Klammern im Impulsdiagramm (`[` In und `]` Out)**:
    - Verankerung an absoluten Tick-Nummern (`inTick`, `outTick`) mit binärer Suche (`getOffsetForTick`), sodass die Klammern beim Eintreffen neuer Simulations-Ticks exakt an ihrer Position im Signalverlauf stehen bleiben und nicht mehr wegrutschen.
    - Setzen von `[ In` und `] Out` während der laufenden Simulation setzt den Marker präzise an den aktuellen Live-Tick (statt fehlerhaft auf 0).
    - Fensterweites, flüssiges Ziehen der Klammern (`activeBracketDrag`) über die gesamte Canvas- und Window-Fläche mit 8px Fangradius.
    - **Dynamische Synchronisierung mit der Taktfrequenz**:
      - Ändern der Taktfrequenz aktualisiert live die Millisekunden-Dauer der Klammern im Diagramm-Header: `[ Klammern: t = A..B (ΔT Ticks | X ms @ Y Hz) ]`.
      - Bei aktivem Loop-Playback wird die Abspielgeschwindigkeit (`loopInterval`) sofort auf die neue Taktfrequenz (`1000 / frequency` ms) angepasst.
  - **Test-Abdeckung**: Neuer Test `[WISH-025]` in `tests/comprehensive_test_suite.js`, alle 45 Tests bestehen fehlerfrei.

- **WISH-024 (Impulsdiagramm: Auto-Skalierung & blauen Balken entfernen, Zeitstrahl-Panning & Playback-Controls)**:
  - **Blauen Balken entfernt**: Der 3px hohe blaue Navigator-Balken (`ctx.fillRect(barX, 0, barW, 3)`) am oberen Rand des Impulsdiagramms wurde vollständig entfernt.
  - **Auto-Skalierung entfernt**: Beim Ziehen des Playheads im Zeitstrahl verändert vertikales Bewegen der Maus nicht mehr den Zoomfaktor (`pixelsPerTick` bleibt fest auf dem eingestellten Wert).
  - **Flüssiges Bewegen entlang des Zeitstrahls**:
    - Der Playhead lässt sich durch Klicken und horizontales Ziehen flüssig und präzise entlang der Ticks bewegen.
    - Freies horizontales Pannen des Zeitstrahls mit mittlerer Maustaste (Mausrad-Klick) oder Shift+Klick/Drag.
    - Mausrad und Trackpad scrollen die Zeitachse flüssig horizontal (`deltaX`/`deltaY`).
  - **Simulations-Controls direkt im Impulsdiagramm**:
    - `-1 Tick` (`#btn-analyzer-sim-step-back`), `Start / Pause` (`#btn-analyzer-sim-start`) und `+1 Tick` (`#btn-analyzer-sim-step`) sind im `#analyzer-header` integriert.
    - Volle Synchronisierung mit der oberen Haupt-Toolbar (Icons, Texte, Aktiv-/Pause-Zustände, Deaktivierung im Edit-Modus).
    - `attachHoldRepeat` für schnellen Vor-/Rücklauf bei gedrückter Maustaste.
  - **Test-Abdeckung**: Neuer Test `[WISH-024]` in `tests/comprehensive_test_suite.js`, alle 44 Tests bestehen fehlerfrei.

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
  - Created the legacy `alpha` (integration) and `beta` (staging) branches.
  - Tagged `main` as `v1.0.0-stable`.
  - Added `WISHLIST.md` tracker.
  - Superseded by WISH-045: `alpha` was migrated to `dev`, and the legacy `alpha`/`beta` tiers were retired.
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
