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
