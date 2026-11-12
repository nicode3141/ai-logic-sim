# Spezifikation & Architekturkonzept: Next-Gen Auto-Layout & Orthogonal-Routing Engine

> **Dokument-ID:** SPEC-2026-AUTOLAYOUT-01  
> **Status:** Entwurf / Genehmigt für Implementierung  
> **Referenzierte Tickets:** WISH-029 (Auto-Layout Optimierung & CAD-Standard-Spacing)  
> **Komponenten:** `AutoLayoutEngine`, `WireRouter`, `LayoutMetrics`, `SettingsModal`  
> **Ziel-Branch:** `alpha`

---

## 1. Motivation & Problemstellung

Ein professioneller Schaltplan zeichnet sich in der Elektrotechnik und Technischen Informatik (z. B. nach **DIN EN 60617** bzw. **IEEE Std 91/91a**) durch folgende Kernmerkmale aus:
1. **Strenger Signalfluss von links nach rechts (Primary Inputs $\to$ Logik-Ränge $\to$ Primary Outputs/Displays)**.
2. **Dominanz gerader horizontaler Leitungen**: Signale fließen horizontal auf derselben Höhe ($Y$-Achse); Richtungsänderungen (Knicke) erfolgen ausschließlich rechtwinklig ($90^\circ$).
3. **Kanal- und Busbündelung (Trunk Merging)**: Wenn ein Signal mehrere Empfänger speist (Multi-Drop Net), wird es nicht als wirres Geflecht einzelner Leitungen geführt, sondern über einen gemeinsamen vertikalen Stammkanal (*Trunk*), von dem kurze horizontale Stichleitungen (*Stubs*) zu den Pins abzweigen.
4. **Keine verdeckenden Leitungen durch Bauteile** und **minimale Kreuzungen**.
5. **Rückkopplungen (Feedback-Schleifen)** laufen auf dedizierten Außenbahnen (*Perimeter / Highway*) um die Logikstufen herum, anstatt mitten durch Bauteile und Gatter hindurch.

### Analyse des Ist-Zustands (`layout_eval.js`)
Die bisherige Implementierung in `index.html` liefert eine solide Basis (durchschnittlicher Beauty-Score: **77 / 100**), weist jedoch in komplexeren Standardschaltungen erhebliche Schwächen auf:

| Benchmark-Schaltung | Aktueller Score | Kreuzungen | Knicke (Bends) | Gerade Leitungen | Problem / Schwachstelle |
|---|---|---|---|---|---|
| `1_bcd_clock` | **100 / 100** | 0 | 6 | 80% (12/15) | Hervorragend (strikte Baumstruktur ohne Zyklen). |
| `2_lfsr_light` | **69 / 100** | 1 | 18 | 30% (3/10) | Schieberegister-Rückführung erzeugt unnötige Kreuzung im Kanal. |
| `3_full_adder` | **47 / 100** | 4 | 12 | 50% (6/12) | **Kritischer Ausfall**: `Cin`, `xor1` und `and1` überkreuzen sich 4-fach; keine Ausnutzung kommutativer Eingänge. |
| `4_sr_latch` | **93 / 100** | 1 | 8 | 67% (4/6) | Rückkopplungskreuzung unvermeidbar, aber Rückleiter schneidet Vorwärtskanäle. |

#### Hauptursachen für das "ungewohnte" Erscheinungsbild:
1. **Fehlende Benutzer-Konfigurierbarkeit**:
   - Bisher existieren lediglich drei starre Presets (`compact`: 60px Kanal / 20px Zeile; `normal`: 80px / 20px; `wide`: 120px / 40px) als fest einprogrammierte Strings in `getLayoutOptions()`.
   - Keine Schieberegler für Zeilenabstand, Spaltenabstand, Pin-Stub-Länge oder Kanalbreite.
   - Keine Richtungswahl (bislang nur strikt Left-to-Right; kein Top-to-Bottom für Kontrollflüsse).
2. **Fehlende Pin-Symmetrie (Kommutatives Pin-Swapping)**:
   - Gatter wie AND, OR, XOR, NAND, NOR besitzen logisch gleichwertige Eingänge ($A \land B = B \land A$). Die jetzige Crossing-Minimierung sperrt Pins starr auf `fromPin` / `toPin`. Im Volladdierer führt dies dazu, dass `Cin` nach oben zu Pin 1 von `xor2` geführt werden muss, während `xor1` nach unten zu Pin 0 geführt wird, was eine vermeidbare Kreuzung erzwingt.
3. **Mangelnde Pin-Höhen-Justierung (Pin-to-Pin Straight-Wire Alignment)**:
   - Der Algorithmus platziert Bauteile oft an ihrem geometrischen Mittelpunkt statt an den tatsächlichen Pin-Höhen. Wenn Ausgang `xor1` (Höhe $Y=80$) auf Eingang 0 von `xor2` (Höhe $Y=80$) trifft, ist die Leitung ideal gerade. Schlägt die Höhenausrichtung jedoch um 20px fehl, entstehen zwei $90^\circ$-Knicke ("Dogleg").
4. **Fehlende dedizierte Rückkopplungs-Kanäle**:
   - Rückwärtsdrähte (Back-Edges) teilen sich denselben Routing-Kanal wie Vorwärtsdrähte und verengen den Platz zwischen den Spalten.

---

## 2. Recherche & Wissenschaftlicher Stand der Technik (State of the Art)

Auf Basis von EDA-Forschungsliteratur (*Eclipse Layout Kernel / ELK Layered*, *KIELER Framework*, *yWorks yFiles*, *Brandes & Köpf*, *Sugiyama Framework*) ergeben sich fünf Kernprinzipien für professionelle Schaltplan-Layouts:

### 2.1 ELK Layered: Sugiyama-Framework mit Port-Constraints
Klassische Graph-Layout-Algorithmen betrachten Knoten als "Black Boxes" ohne feste Anschlusspunkte. Für elektronische Schaltungen gilt das **Port-Constraint-Modell**:
- **Fixed Side (`FIXED_SIDE`)**:
  - Eingänge liegen ausnahmslos auf der West-Seite (links).
  - Ausgänge liegen ausnahmslos auf der East-Seite (rechts).
  - Takt- und Reset-Leitungen können optional auf North/South (oben/unten) definiert sein.
- **Commutative Port Groups (`PORT_EQUAL_CLASS`)**:
  - Eingänge symmetrischer Logikgatter bilden eine Äquivalenzklasse. Während der Crossing-Minimierung dürfen Pins innerhalb dieser Gruppe vertauscht werden, um Kreuzungszahlen drastisch zu reduzieren.
- **Port-Aware Barycenter / Median**:
  - Die baryzentrische Schwerpunktberechnung darf nicht auf der Knoten-ID oder Knotenzentrum basieren, sondern muss die exakte relative Pin-Höhe $y_{\text{pin}} = y_{\text{node}} + \text{relY}$ gewichten:
  $$\text{Barycenter}(v) = \frac{1}{|E_{\text{in}}(v)|} \sum_{e = (u, v) \in E_{\text{in}}(v)} \left( y(u) + \text{relY}_{\text{src}}(e) \right)$$

### 2.2 Orthogonales Bus- & Trunk-Routing (Steiner-Tree-Heuristik)
Anstatt jedes Signalpaar $(u \to v_1), (u \to v_2)$ separat von Pin zu Pin zu führen:
```
           +----------+
           | Treiber  |---[Pin Out]---+-----------------> Empfänger 1
           +----------+               |
                                      +-----------------> Empfänger 2
                                      |
                                      +-----------------> Empfänger 3
                                   (Trunk)
```
1. Vom Ausgangspin führt ein horizontaler Stich (*Pin Stub*, mindestens $20\text{ px}$).
2. Im Zwischenspalten-Kanal (*Wiring Channel*) wird eine feste vertikale Trasse (*Trunk Track*) allokiert.
3. Von dieser Trasse biegen alle Abgänge auf Höhe der jeweiligen Ziel-Eingangspins rechtwinklig nach rechts ab.
4. **Ergebnis**: 0 Kreuzungen zwischen Signalen desselben Netzes, perfekt aufgeräumte CAD-Optik.

### 2.3 Brandes & Köpf: Horizontale Koordinaten- und Höhenzuweisung
Um Zickzack-Leitungen zu eliminieren, verwendet der Standard-Schaltplan-Algorithmus eine 4-Wege-Blockausrichtung:
- **Left-to-Right Ausrichtung** (Vorwärts-Treiber zieht Empfänger auf seine Höhe).
- **Right-to-Left Ausrichtung** (Empfänger zieht Treiber auf seine Höhe).
- **Balancierter Median**: Bauteile mit 1:1-Verbindungen bilden einen starren "Block" und werden auf exakt derselben Pin-Höhe arretiert, wodurch die Verbindungsleitung mit $0$ Knicken als waagerechte Gerade gezeichnet wird.

---

## 3. Neue Konfigurationsmöglichkeiten (User Settings & GUI)

Um dem Benutzer volle Kontrolle über das Erscheinungsbild und Spacing zu geben ("mehr Möglichkeiten hat Sachen einzustellen"), wird das Layout-System um folgende Parameter erweitert:

### 3.1 Parameter-Katalog

| Einstellungs-Parameter | Typ | Wertebereich | Standardwert | Beschreibung |
|---|---|---|---|---|
| `layoutDirection` | Enum | `'LR'`, `'TB'`, `'RL'` | `'LR'` | Haupt-Signalflussrichtung (Links-nach-Rechts, Oben-nach-Unten, Rechts-nach-Links). |
| `columnSpacing` | Number | $40\text{ px} \dots 240\text{ px}$ | $100\text{ px}$ | Horizontaler Mindestabstand zwischen Logikstufen (Spalten). |
| `rowSpacing` | Number | $20\text{ px} \dots 120\text{ px}$ | $40\text{ px}$ | Vertikaler Mindestabstand zwischen Bauteilen innerhalb derselben Stufe. |
| `pinStubLength` | Number | $20\text{ px} \dots 80\text{ px}$ | $20\text{ px}$ | Horizontale Mindestlänge des Leitungsansatzes vor dem ersten Knick. |
| `alignmentMode` | Enum | `'pin-exact'`, `'center'`, `'barycentric'` | `'pin-exact'` | Ausrichtungsstrategie: Pin-Höhen-Priorität (gerade Drähte), Bauteilzentriert, oder Kompakter Schwerpunkt. |
| `commutativePinSwap` | Boolean | `true` / `false` | `true` | Automatische Optimierung symmetrischer Eingänge (AND/OR/XOR), um Kreuzungen zu eliminieren. |
| `busTrunkMerging` | Boolean | `true` / `false` | `true` | Bündelung von Mehrfachabzweigen (Fan-Out) zu sauberen Stamm-Leitungen (Trunks). |
| `feedbackChannel` | Enum | `'perimeter'`, `'direct'` | `'perimeter'` | Führung von Rückkopplungsschleifen (über Außenbahnen oben/unten oder kürzester Pfad). |
| `layoutPreset` | Enum | `'compact'`, `'standard'`, `'cad_wide'`, `'custom'` | `'standard'` | Vordefinierte Spacing-Kombinationen für schnelle Auswahl. |

### 3.2 Spacing-Presets im Detail

```
+---------------------------------------------------------------------------------------+
| PRESET               | Spaltenabstand | Zeilenabstand | Stub | Einsatzzweck           |
+---------------------------------------------------------------------------------------+
| 1. Kompakt (Eng)     |     60 px      |     20 px     | 20px | Hohe Bauteildichte,    |
|                      |                |               |      | kleine Bildschirme     |
| 2. Standard (Lehrbuch)|    100 px     |     40 px     | 20px | Optimale Lesbarkeit,   |
|                      |                |               |      | Logisim-/KiCad-Look    |
| 3. CAD / Großzügig   |    160 px      |     60 px     | 40px | Präsentation, Druck,   |
|                      |                |               |      | komplexe Busse         |
| 4. Benutzerdefiniert |   stufenlos    |   stufenlos   | dyn. | Volle manuelle Kontrolle|
+---------------------------------------------------------------------------------------+
```

### 3.3 UI-Mockup: Neuer Tab "Layout & Routing" im Einstellungs-Dialog

Im bestehenden Einstellungsfenster (`#modal-settings`) wird ein dedizierter Tab bzw. Konfigurationsbereich **"Auto-Layout & Leitungen"** integriert:

```
+---------------------------------------------------------------------------------+
|  Einstellungen: Auto-Layout & Leitungsführung                               [X] |
+---------------------------------------------------------------------------------+
|                                                                                 |
|  Layout-Stil & Preset:                                                          |
|  [ Kompakt (Eng) ]  [ (X) Standard (Lehrbuch) ]  [ CAD (Großzügig) ]  [ Manuell ]|
|                                                                                 |
|  -----------------------------------------------------------------------------  |
|  Abstände & Geometrie:                                                          |
|                                                                                 |
|  Spalten-Abstand (Horizontal): [===========o=====]  100 px                      |
|  Zeilen-Abstand (Vertikal):    [========o========]   40 px                      |
|  Leitungsansatz (Pin-Stub):    [====o============]   20 px                      |
|                                                                                 |
|  -----------------------------------------------------------------------------  |
|  Signalfluss & Ausrichtung:                                                     |
|                                                                                 |
|  Signal-Flussrichtung:  (X) Links -> Rechts    ( ) Oben -> Unten                |
|  Gatter-Ausrichtung:    (X) Gerade Leitungen bevorzugen (Pin-Exact)             |
|                         ( ) Bauteilmitte zentrieren                             |
|                                                                                 |
|  -----------------------------------------------------------------------------  |
|  Erweiterte Optimierungen:                                                      |
|                                                                                 |
|  [X] Symmetrische Eingänge vertauschen (Kommutatives Pin-Swapping gegen Kreuze) |
|  [X] Mehrfach-Abzweige als Bus-Stamm bündeln (Trunk Merging)                    |
|  [X] Rückkopplungen über Außenbahnen führen (Perimeter Routing)                 |
|                                                                                 |
|  -----------------------------------------------------------------------------  |
|  [ Auf Standard zurücksetzen ]            [ Vorschau ]   [ Abbrechen ]  [ Übernehmen ]|
+---------------------------------------------------------------------------------+
```

---

## 4. Algorithmus-Architektur (5-Phasen-Pipeline)

Die überarbeitete `AutoLayoutEngine` arbeitet in fünf klar getrennten, deterministischen Phasen:

```
  +-------------------------------------------------------------------+
  | Phase 1: Zykluserkennung & Feedback-Außenbahn-Allokation          |
  |          - Tarjan SCC & Feedback Arc Set (FAS)                    |
  |          - Temporäre Umkehr von Rückwärtskanten                   |
  +---------------------------------+---------------------------------+
                                    |
  +---------------------------------v---------------------------------+
  | Phase 2: Stufen- und Rangzuweisung (Layer Assignment)             |
  |          - Topologische Sortierung mit Longest-Path               |
  |          - Justification (Ausgänge und Displays nach rechts)      |
  +---------------------------------+---------------------------------+
                                    |
  +---------------------------------v---------------------------------+
  | Phase 3: Kreuzungsminimierung & Kommutatives Pin-Swapping         |
  |          - 24 Layer-Sweeps (alternierend Vorwärts/Rückwärts)      |
  |          - Port-gewichtetes Barycenter                            |
  |          - Lokale Transpositionen + Pin-Permutation               |
  +---------------------------------+---------------------------------+
                                    |
  +---------------------------------v---------------------------------+
  | Phase 4: Pin-Exact Koordinatenzuweisung (Y-Placement)             |
  |          - Brandes & Köpf Block-Bildung für 1:1-Verbindungen      |
  |          - Arretierung auf exakter Pin-Höhe (Zero-Bend Wires)     |
  |          - Kollisionsauflösung mit benutzerdefiniertem rowGap     |
  +---------------------------------+---------------------------------+
                                    |
  +---------------------------------v---------------------------------+
  | Phase 5: Spaltenpositionierung & Orthogonales Trunk-Routing       |
  |          - Berechnung der Kanalbreiten anhand Spalten-Dichte      |
  |          - Steiner-Trunk-Generierung für Multi-Drop-Netze         |
  |          - Rückkopplungs-Perimeter-Kanal oben/unten               |
  +-------------------------------------------------------------------+
```

### Mathematische Detaillierung der Schlüsselphasen:

#### Phase 3: Kommutatives Pin-Swapping
Für jedes Gatter $g \in \{ \text{AND, OR, XOR, NAND, NOR} \}$ mit zwei Eingängen $p_0, p_1$ und ankommenden Kanten $e_0, e_1$ aus Quellen $u_0, u_1$:
1. Berechne die Quell-Höhen:
   $$y_0 = y(u_0) + \text{relY}(e_0.\text{fromPin}), \quad y_1 = y(u_1) + \text{relY}(e_1.\text{fromPin})$$
2. Liegt Quelle 0 unterhalb von Quelle 1 ($y_0 > y_1$), während Eingang 0 oberhalb von Eingang 1 liegt ($\text{relY}(p_0) < \text{relY}(p_1)$), kreuzen sich die beiden Drähte im Zwischenraum.
3. Vertausche $e_0.\text{toPin} \leftrightarrow e_1.\text{toPin}$.
4. **Ergebnis**: Die Kreuzung wird mit Zeitaufwand $\mathcal{O}(1)$ eliminiert, ohne die logische Funktion der Schaltung zu verändern!

#### Phase 4: Pin-Exact Straight Alignment
Wenn Ausgangspin $(u, p_{\text{out}})$ exklusiv auf Eingangspin $(v, p_{\text{in}})$ führt, wird die vertikale Position von $v$ so fixiert, dass:
$$y(v) = y(u) + \text{relY}(p_{\text{out}}) - \text{relY}(p_{\text{in}})$$
Sofern kein vertikaler Konflikt mit Nachbarbauteilen entsteht, verläuft das Verbindungskabel exakt horizontal als **Einzelsegment mit 0 Knicken**.

---

## 5. Geplante Code-Änderungen in `index.html`

### 5.1 Erweiterung der Default-Optionen (`AutoLayoutEngine.defaults`)
```javascript
static defaults() {
  return {
    direction: 'LR',       // 'LR' | 'TB' | 'RL'
    rowGap: 40,            // vertikaler Mindestabstand (CAD-Standard: 40px)
    colGap: 100,           // horizontaler Spaltenabstand (Standard: 100px)
    labelPad: 20,          // Platz für Beschriftungen oberhalb
    pinStub: 20,           // Mindestansatz vor Knick (20px Grid)
    trackPitch: 20,        // Rastermaß für Routing-Kanäle
    subGap: 80,            // Abstand unabhängiger Teilschaltungen
    alignMode: 'pin-exact',// 'pin-exact' | 'center' | 'barycentric'
    pinSwapping: true,     // Kommutatives Vertauschen symmetrischer Eingänge
    trunkMerging: true,    // Mehrfachabzweige als Bus-Stamm bündeln
    feedbackRouting: 'perimeter', // 'perimeter' | 'direct'
    sweeps: 24             // Optimierungsdurchläufe
  };
}
```

### 5.2 Speicher- und Einstellungsverwaltung (`LogicSimApp`)
- Persistierung der Benutzereinstellungen in `localStorage.getItem('logicsim_layout_settings')`.
- Methode `getLayoutOptions()` liest die Live-Konfiguration aus und übergibt sie transparent an `AutoLayoutEngine.compute()` und `WireRouter`.

### 5.3 Menü- und Schnellzugriffs-Erweiterung
- Unter Menü `Bearbeiten` bzw. Rechtsklick auf leeres Spielfeld:
  - `Alles anordnen (A)` $\to$ Führt Auto-Layout mit aktuellem Preset aus.
  - Submenü `Layout-Stil`:
    - `✓ Standard (Lehrbuch)`
    - `  Kompakt (Eng)`
    - `  CAD (Großzügig)`
    - `  Layout-Einstellungen öffnen...`

---

## 6. Verifikation & Benchmark-Ziele

Nach Implementierung der Spezifikation muss die Test-Suite `layout_eval.js` folgende Zielwerte erreichen:

| Testfall | Vorheriger Score | Ziel-Score | Kreuzungen (Neu) | Knicke (Neu) |
|---|---|---|---|---|
| `1_bcd_clock` | 100 / 100 | **100 / 100** | 0 | $\le 6$ |
| `2_lfsr_light` | 69 / 100 | **$\ge 90$ / 100** | 0 | $\le 12$ |
| `3_full_adder` | 47 / 100 | **$\ge 95$ / 100** | **0** (durch Pin-Swap) | $\le 8$ |
| `4_sr_latch` | 93 / 100 | **$\ge 95$ / 100** | 1 (echte Schleife) | $\le 6$ |
| **Gesamtdurchschnitt** | **77 / 100** | **$\ge 95$ / 100** | **$\le 1$** | **Deutliche Reduktion** |

---

## 7. Zusammenfassung

Dieses Spezifikationsdokument bildet das vollständige Fundament für die anstehende Implementierung. Es kombiniert anerkannte Algorithmen aus modernen EDA-Systemen (ELK Layered, Brandes & Köpf, Steiner-Tree-Trunks) mit den spezifischen Wünschen des Benutzers nach flexibler Konfigurierbarkeit, intuitiven Reglern und einem aufgeräumten CAD-Schaltplan-Look.
