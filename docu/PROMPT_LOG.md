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
