# Prompt Log

This file is the chronological log of user prompts for the **AI Logic Simulator**. It lets every contributor trace requirements, decisions, and follow-up work across sessions and team members.

## Logging Rules

- Append new entries at the bottom; never rewrite or delete past entries.
- Record the prompt verbatim, together with the date, author, branch, and related WISH/issue ID.
- Reference the resulting commit or pull request when available.
- Keep secrets, credentials, and personal data out of this log.
- Older pre-repository prompt notes are preserved in `docu/docu.txt`; all new prompts are logged here.

---

## 2026-11-12 — Branch model migration, prompt log, commit convention

- **Author:** nicode
- **Branch:** `chore/branch-model-main-dev`
- **Related:** WISH-045
- **Prompt:**

> please stick to all md files and do what they say. Also keep log of the propmts I ve sent you and add them to /docu. This is a multi person project so we will use industry standards. Currently we have main alpha beta branch. Please migrate this to only main and dev branch. Dev contains any thing dev and main is the production. After that we have to create feature branches. Add tghis to md file. Please use commits like that: industry style commit messages + Co-authored-by: opencode-agent[bot] <156322137+opencode-agent[bot]@users.noreply.github.com>

---

## 2026-11-12 — Migration status check

- **Author:** nicode
- **Branch:** `dev`
- **Related:** WISH-045
- **Prompt:**

> What did we do so far?

---

## 2026-11-12 — Continue migration and verification

- **Author:** nicode
- **Branch:** `dev`
- **Related:** WISH-045
- **Prompt:**

> Continue if you have next steps, or stop and ask for clarification if you are unsure how to proceed.

---

## 2026-11-12 — Fix WISH-017 CI failure

- **Author:** nicode
- **Branch:** `fix/wish-017-language-state`
- **Related:** WISH-017
- **Prompt (CI log excerpt):**

> fix the tests etc
>
> [FAIL] [WISH-017] Complete English language support and phrase dictionary parity: Translation for "Interaktion & Bedienung:" must not be identical to German source: got "Interaktion & Bedienung:": Expected true, got false
> Error: Process completed with exit code 1.

---

## 2026-11-12 — Create AGENTS.md

- **Author:** nicode
- **Branch:** `docs/agents-md`
- **Related:** Repository documentation
- **Prompt:**

> write an AGENTS.MD file covering up everything you know and think about this project

---

## 2026-11-12 — Palette sperren, Kamera-Auto-Pan, Branch-/Docs-Regeln

- **Author:** Leegende
- **Branch:** `fix/palette-sim-lock`, `feat/drag-autopan`, `docs/changelog-wishlist-catchup`
- **Related:** WISH-046, WISH-047, WISH-048
- **Prompt:**

> die opcacity von modulen ist jetzt 100% ich wil ldas es null ist und man auch nichts ändern kann im simulationsmodus bzw. vielleicht exited man den simulationsmodus bzw. pausiert die abläufe
> wenn ich module selected habe und verschiebe mache das die kamera mit folgt unf man das so verschieben kann
> gibt es einen weg die merges zu verstecken und außerdem löschst du die alten branches nicht. Außerdem passe die contribution.md file nochmal so an das auch ein changelog aufgeschrieben wird mit fix und feature ähnlich wie bei der wishlist und schreibe auch rein das man diese wishlist bzw. offene requests noch fixed
> kannst du bitte alpha in dev mergen
> Wir haben jetzt nochmal die contribution, agents und changelogs angepasst. Bitte befolge jetzt genau so wie es dort steht und arbeite mit pull requests!!!!

---

## 2026-11-14 — Projekt-Workflow-Regel (`/learn`), Kompakt-Auto-Layout & Theme-/Toast-Farbbalance

- **Author:** Leegende
- **Branch:** `fabian`
- **Related:** WISH-049, WISH-050
- **Prompt:**

> gibt es eine möglichkeit bei gemini sachen als artifacts reinzuladen bzw. memory zu enablen von früheren gesprächen bzw. weißt du jetzt was du das letzte mal gemacht hast und das du dich an alle .mds halten sollst?
> /learn
> manchmal ist das anordnen noch nicht so gut und beim zweiten bild so soll es bei kompakt aussehen !
> das toast und manche farben sind nicht ganz richtig gebalanced auf das theme. Pushe die changes in den fabian branch

---

## 2026-11-14 — Kompakt-Mindestabstand (1 Grid-Zelle), editierbare Pin-Beschriftungen & Modul-Vorschau-Fixes

- **Author:** Leegende
- **Branch:** `fabian`
- **Related:** WISH-049, WISH-051, WISH-052
- **Prompt:**

> mache das wenigstens noch ein gap ist. Zudem will ich das man die inputs und output beschriftung sämtlicher module ändern kann und wenn ich bei der bauteil selection auf vorschau gehe und zurück buggt das rum. MAche zudem die vorschau der module schärfer kontrastreicher und größer!

---

## 2026-11-14 — Taster-Stabilität beim Klicken/Halten & Live-Auswahlrechteck

- **Author:** Leegende
- **Branch:** `fabian`
- **Related:** WISH-053, WISH-054
- **Prompt:**

> wenn ich den taster aktiviere verschiebt sich die schaltung. Adde zudem das module schon während der bewegung des selectionsvierecks selected werden

---

## 2026-11-16 — Verzögerung in Mehrfachauswahl, Edit-Modus-Propagation & Hz-basierte Zeitanzeige

- **Author:** Leegende
- **Branch:** `fabian`
- **Related:** WISH-055
- **Prompt:**

> mache das man die globale verzögerung von bauteilen bei der selektion einstellen kann und das man die verzögerung auch schon beim edit modus merkt. rechne bei der verzögerung einfach schon mit den momentanen hz wert
> entferne den global anwenden button und mache es lieber bei dem module drag and drop
> kannst du bitte das modulspezifisch machen

---

## 2026-11-16 — Ausgangs-Invertierung bei sequenziellen Modulen, NOT-Anschlussstäbe & LED-Einrasten

- **Author:** Leegende
- **Branch:** `fabian`
- **Related:** WISH-056
- **Prompt:**

> teilweise sind die invertierung von ausgängen von modulen immernoch fehlerhaft und so bauelemente wie not haben immernoch keine eingangs und ausgangstäbe und leds werden teilweise immernoch nicht richtig drangesteckt

---

## 2026-11-16 — Sofort-Verzögerung (0 ms)

- **Author:** Leegende
- **Branch:** `fabian`
- **Related:** WISH-057
- **Prompt:**

> füge noch hinzu das man sofort einstellen kann also 0 ms verzögerung

---

## 2026-11-16 — Live-Bauteilvorschau am Cursor beim Palette-Drag & Drop

- **Author:** Leegende
- **Branch:** `fabian`
- **Related:** WISH-058
- **Prompt:**

> kannst du es hinzufügen wenn man ein modul vom drag in drop in den arbeitsspace schiebt das beim cursor das module verschoben wird

---

## 2026-11-16 — Positionierung der Eingangs-/Ausgangsinvertierung am Modulrand

- **Author:** Leegende
- **Branch:** `fabian`
- **Related:** WISH-059
- **Prompt:**

> fixe das die eingangsinvertiertung richtig beim modul geplaced ist

---

## 2026-11-16 — Java-Swing Slider-Offset-Fix & gespeicherte Verzögerung im Dropdown

- **Author:** Leegende
- **Branch:** `fabian`
- **Related:** WISH-060
- **Prompt:**

> fixe diesen offset hier und füge beim drop down das man die gespeicherte verzögerung der zeit siehet
> füge das ghost module auch schon ein wenn man über andern guis ist

---

## 2026-11-16 — DIN-Normen aus Arbeitsflächen-Kontextmenü entfernen & schräge Leitungen beim Anordnen

- **Author:** Leegende
- **Branch:** `fabian`
- **Related:** WISH-061
- **Prompt:**

> entferne das man die din normen beim rechts klicken auf die arbeitsfläche ist
> Füge hinzu das wenn man schräge verbindungen zulässt das bei anordnung auch schräge verbindungnen verwendet werden
> beim hovern wird immernoch der beige button auch mitbewegt

---

## 2026-11-16 — Schräge Leitungen gezielt bei Optimalfällen (RS-Flip-Flops) & Eckpunkt-Handle-Fix

- **Author:** Leegende
- **Branch:** `fabian`
- **Related:** WISH-061, WISH-062
- **Prompt:**

> ich will nicht wenn schräge verbindungen aktiviert sind das nur schräge verbindungen verwendet werden sondern z.b. wenn sie optimal sind z.b. bei rs-flip flops
> die eckpunkte buggen immernoch rum

---

## 2026-11-16 — Flüssiges 60/144fps Palette-Dragging ohne HTML5-DnD-Lag

- **Author:** Leegende
- **Branch:** `fabian`
- **Related:** WISH-058
- **Prompt:**

> das draggen des ghost modules laggt komplett und ist überhaupt nicht flüssig

---

## 2026-11-16 — Taktgenerator: HIGH- und LOW-Phase getrennt einstellbar

- **Author:** Leegende
- **Branch:** `fabian`
- **Related:** WISH-063
- **Prompt:**

> füge hinzu das man beim taktgenerator die ticks der high und low phase einstellen kann

---

## 2026-11-16 — Kompakte rechtsbündige Verzögerungsanzeige im Palette-Dropdown

- **Author:** Leegende
- **Branch:** `fabian`
- **Related:** WISH-060
- **Prompt:**

> mache das einfach nur die verzögerungszahl da steht unzwar rechtsbündig

---

## 2026-11-16 — Kanäle im Impulsdiagramm nach oben und unten verschieben

- **Author:** Leegende
- **Branch:** `fabian`
- **Related:** WISH-064
- **Prompt:**

> mache das ich die kanäle im impulsdiagramm nach oben und unten verschieben kann

---

## 2026-11-16 — Fix: NOT-/Gatter-Größe bleibt bei invertiertem Eingang erhalten

- **Author:** Leegende
- **Branch:** `fabian`
- **Related:** WISH-065
- **Prompt:**

> wenn ich das not gate den eingang nochmal invertiere dann wird das kleiner

---

## 2026-11-16 — Fix: Globale Verzögerung `0` gilt durchgängig ohne Rest-Delay

- **Author:** Leegende
- **Branch:** `fabian`
- **Related:** WISH-066
- **Prompt:**

> ich hab obwohl ich die verzögerung auf 0 gesetzt hab trotzdme delay

---

## 2026-11-17 — Mehrfachauswahl: Roter Lösch-Button & Entfernen von Vertikal/Horizontal-Verteilen

- **Author:** Leegende
- **Branch:** `fabian`
- **Related:** WISH-067
- **Prompt:**

> kannst du bitte das mehrfachauswahlfenster bearbeiten. Erstmal will ich das der Auswahl löschen button nen roten hintergrund bekommt. Zudem sollst du das veritkal und horizontal anordnen generell löschen im programm

---

## 2026-11-17 — Inspector-Overflow bei `Verlegungsart` & direktes Inline-Umbenennen von Messpunkten

- **Author:** Leegende
- **Branch:** `fabian`
- **Related:** WISH-068
- **Prompt:**

> da gibt es einen overflow und mache es auch so wenn ich auf ein text button von einem messpunkt clicke das ich den namen direkt anpassen kann

---

## 2026-11-17 — Kontrastreiche Leitungs-Auswahlkreise & Zentrierung in Auswahlfenstern

- **Author:** Leegende
- **Branch:** `fabian`
- **Related:** WISH-069
- **Prompt:**

> wenn ich eine neue verbindung mache dann ist der auswahlkreis vom letzten punkt wei und es fehlt kontrast. auch in sämtlichen auswahlfenstern sind die sachen nicht zentriert und generell nicht schön. Fixe das

---

## 2026-11-17 — Alle Verbindungen bei Klick vor einer Gabelung auswählen

- **Author:** Leegende
- **Branch:** `fabian`
- **Related:** WISH-070
- **Prompt:**

> wenn ich vor eine gabelung klicke dann will ich das alle verbindungen bei der gabelung ausgewählt werden.

---

## 2026-11-17 — Leitungs-Gabelungen nativ als Verzweigung speichern (keine überlappenden Stammleitungen)

- **Author:** Leegende
- **Branch:** `fabian`
- **Related:** WISH-071
- **Prompt:**

> wenn ich an ein ende klicke dann überlappt teilweise immernoch die anderen sachen. ich will generell das du verbindung implementierst das ein gabelung gespeichert werden das ist doch optimierter?

---

## 2026-11-17 — Roter Lösch-Button im Einzelauswahl-Kontextmenü & Pin-Kreise an Modulen entfernen

- **Author:** Leegende
- **Branch:** `fabian`
- **Related:** WISH-072
- **Prompt:**

> ich will das beim selectionsmenu der bauteil löschen button roten hintergrund hat
> entferne bei modulen den kreis das man es visuell besser sieht

---

## 2026-11-17 — Verschiebbare Gabelungspunkte, exakte Zweigauswahl & Theme-Karten-Kontrast (Java Swing / Clean Light)

- **Author:** Leegende
- **Branch:** `fabian`
- **Related:** WISH-073
- **Prompt:**

> man kann nicht die verbindungspunkte (gabelungen) bewegen. fixe das. wenn ich an untere kette klicke wir die verbindungen vor der gabelung auch selektiert
> bei java swing ist der kontrast der name des anderen themes immernoch falsch

---

## 2026-11-17 — Commit und Push der Änderungen auf Branch `fabian`

- **Author:** Leegende
- **Branch:** `fabian`
- **Related:** WISH-067, WISH-068, WISH-069, WISH-070, WISH-071, WISH-072, WISH-073
- **Prompt:**

> pushe das

---

## 2026-11-17 — Konfigurierbare Verzögerung für alle Module & Sequenzbausteine

- **Author:** Leegende
- **Branch:** `fabian`
- **Related:** WISH-074
- **Prompt:**

> momentan haben module und sonstige bauteile immernoch keine verzögerung. Wie kann ich das ändern? (Antwort + Umsetzungsbestätigung: „ja“)

---

## 2026-11-26 — Umfassendes Bug-Fixing, Härtung & Code-Optimierung

- **Author:** Leegende
- **Branch:** `fabian`
- **Related:** WISH-075
- **Prompt:**

> optimiere, testen und finde sämtliche bugs und behebe sie bis das programm komplett bugfrei ist und optimiere die code basis ohne irgendeine funktion zu verändern
