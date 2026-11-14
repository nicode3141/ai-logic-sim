---
description: Verbindlicher Projekt-Workflow, Dokumentationspflicht (WISHLIST, CHANGELOG, PROMPT_LOG) und Git/GitHub-Prozess für ai-logic-sim
alwaysApply: true
---

# AI Logic Sim – Verbindlicher Projekt-Workflow

Da KI-Agenten zwischen verschiedenen Konversationen kein automatisches Gedächtnis besitzen, dienen die Markdown-Dateien im Repository als persistentes Projekt-Gedächtnis. Halte dich bei **jeder** Aufgabe strikt an diese Regeln:

## 1. Kontext-Check bei Gesprächsbeginn
Lies vor Code-Änderungen immer den aktuellen Stand in:
- `AGENTS.md` und `CONTRIBUTING.md` (Architektur, Invarianten, Regeln)
- `WISHLIST.md` (nächste freie `WISH-NNN`-Nummer und offene/erledigte Wünsche)
- `CHANGELOG.md` (letzte Änderungen unter `[Unreleased]`)
- `docu/PROMPT_LOG.md` (bisherige Prompt-Historie)

## 2. Verbindliche Dokumentation bei jeder Änderung
Jede Benutzer-Anforderung (Feature, Fix, UI-Anpassung) **muss** im selben Arbeitsgang in allen drei Dateien dokumentiert werden:
1. **`WISHLIST.md`**: Neuen Eintrag `### WISH-NNN — <Kurztitel>` mit Status (`ERLEDIGT`), Priorität, Anforderung und Umsetzung anlegen bzw. aktualisieren.
2. **`CHANGELOG.md`**: Unter `## [Unreleased]` in der passenden Kategorie (`Added`, `Changed`, `Fixed`) mit Referenz `(WISH-NNN)` eintragen.
3. **`docu/PROMPT_LOG.md`**: Den Benutzer-Prompt im Wortlaut (oder präzise zusammengefasst) mit Datum, `WISH-NNN`-Referenz und Ergebnis dokumentieren.

## 3. Tests & Verifikation vor jedem Commit
- Erweitere `tests/comprehensive_test_suite.js` um einen `runTest('WISH-NNN', ...)`-Testfall für das neue Verhalten.
- Führe `npm test` aus (`tests/comprehensive_test_suite.js` und `tests/scenarios_test.js` müssen mit **0 Fehlern** durchlaufen).
- Die App bleibt eine **Zero-Dependency Single-File Web-App** (`index.html` ohne externe Laufzeit-Abhängigkeiten).

## 4. Git-, Branch- & GitHub-CLI-Workflow (`gh`)
- **Niemals direkt auf `main` oder `dev` committen**: Arbeite immer auf einem Feature-/Fix-Branch (z. B. `feat/wish-NNN-...` oder `fix/wish-NNN-...`), sofern der Benutzer nicht explizit einen Arbeitsbranch wie `fabian` vorgibt.
- **Conventional Commits + Co-Author-Trailer**:
  Jeder Commit nutzt das Format `<type>(<scope>): <summary>` mit `Refs: WISH-NNN` und dem Trailer:
  `Co-authored-by: opencode-agent[bot] <156322137+opencode-agent[bot]@users.noreply.github.com>`
- **GitHub CLI (`gh`) in PowerShell**:
  Falls `gh` in einer neuen PowerShell-Session nicht im `PATH` liegt, binde den System-Pfad vorab ein:
  `$env:Path = [Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User')`
