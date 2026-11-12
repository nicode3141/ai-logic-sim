# Contributing to AI Logic Sim

Thank you for contributing to the AI Logic Circuit Simulator! This guide documents our Git workflow, branching conventions, changelog/wishlist duties and quality standards.

---

## 🌿 Branching Model & Workflow

```
feature branch (feat/*, fix/*, docs/*) ──► PR (squash merge) ──► alpha ──► beta ──► main (GitHub Pages)
```

### 1. Branches
- **`main`**: Production release branch. Deploys to GitHub Pages via GitHub Actions (`static.yml`). Only tested, stabilized releases land here.
- **`beta`**: Staging / release candidates.
- **`alpha`**: Active integration branch for incremental alpha updates (`v1.1.x-alpha`).
- **Feature branches (`feat/*`, `fix/*`, `docs/*`)**: always branch off `alpha` (or `main` for critical hotfixes) and use descriptive names, e.g. `feat/custom-ic-compression`, `fix/button-wire-stability`, `docs/github-workflow`.

### 2. Feature Workflow
1. **Branch out**
   ```bash
   git checkout alpha
   git pull origin alpha
   git checkout -b feat/my-new-feature
   ```
2. **Develop & test** – keep a 100% pass rate:
   ```bash
   npm test      # or: node tests/run_all_tests.js
   ```
3. **Commit with Conventional Commits**: `feat(scope): ...`, `fix(scope): ...`, `test(scope): ...`, `docs(scope): ...`
4. **Update `CHANGELOG.md` and `WISHLIST.md`** (see below) in the same branch.
5. **Push & open a Pull Request** targeting `alpha`:
   ```bash
   git push -u origin feat/my-new-feature
   ```
   CI must be green; request a review.
6. **Merge with "Squash and merge"** (see *Clean history*), then **delete the branch**.

### 3. Clean history (no merge commits)
We keep `alpha`/`main` linear so the history is not cluttered with "Merge branch …" commits:
- Merge PRs with **Squash and merge** (or *Rebase and merge*). **Never** use a plain merge commit.
  - On GitHub: *Settings → General → Pull Requests* → disable "Allow merge commits", keep "Allow squash merging".
- Locally, instead of `git merge --no-ff`, use:
  ```bash
  git checkout alpha
  git merge --squash feat/my-new-feature   # or: git merge --ff-only after a rebase
  git commit -m "feat: my new feature (v1.1.x-alpha)"
  ```
- To view history without merges: `git log --no-merges --oneline` or `git log --first-parent --oneline`.

### 4. Delete merged branches
Merged feature branches must be removed so the repository stays tidy:
```bash
git branch -d feat/my-new-feature                 # local
git push origin --delete feat/my-new-feature      # remote (or "Delete branch" button on the PR)
git fetch --prune                                 # drop stale remote-tracking refs
```
Only `main`, `beta` and `alpha` are long-lived. After a squash merge use `git branch -D` (Git cannot detect squash merges as "merged").

---

## 📝 Changelog (`CHANGELOG.md`)

Every merged change **must** be recorded in `CHANGELOG.md` under a new version heading (newest first), in the style of [Keep a Changelog](https://keepachangelog.com/):

```markdown
## [1.1.6-alpha] - 2026-11-13
### Added
- **Feature:** Short description of the new feature (WISH-048).
### Changed
- **Feature:** Behaviour that was adjusted.
### Fixed
- **Fix:** What was broken and is now fixed (WISH-049).
### Removed
- **Fix:** Something that was taken out.
```

Rules:
- Prefix each entry with **Feature:** or **Fix:**, and reference the wishlist ID when one exists.
- Bump `version` in `package.json` to match and tag the release (`git tag -a v1.1.6-alpha -m "..."`).

---

## 📋 Wishlist & Open Requests (`WISHLIST.md`)

`WISHLIST.md` tracks every user request / wish.
- **Add** every new request as a row (`WISH-0xx`) with title, branch and status (🟡 Open / 🔵 In Progress / 🟢 Completed).
- **Work through open requests**: before starting new work, check the wishlist for open items and fix them first or in the same batch.
- **Close the loop**: when a request is fixed, set its status to 🟢 **Completed**, name the branch and add short notes. Do not leave finished items marked as open.
- Link the entry to its changelog line via the same `WISH-0xx` ID.

---

## 🧪 Testing & Verification

Before opening a Pull Request:
1. Run all suites: `npm test`, or individually:
   - `npm run test:comprehensive`: logic rules, security bounds, interaction invariants, wishlist checks.
   - `npm run test:fuzz`: fuzz torture and topology stress tests.
   - `npm run test:layout`: orthogonal routing and auto-align aesthetics.
   - `npm run test:bench`: engine throughput benchmark.
2. Add a test for each new wishlist item (`runTest('WISH-0xx', ...)`).
3. Manually test in the browser (`index.html`) across themes and zoom levels.

---

## 📦 Versioning Conventions

- **Alpha**: incremented on every `alpha` integration (`v1.1.0-alpha`, `v1.1.1-alpha`, …).
- **Beta**: release candidates (`v1.1.0-beta.1`).
- **Stable**: tagged on `main` (`v1.1.0`, `v1.2.0`).
- Always document features and fixes in `CHANGELOG.md` and `WISHLIST.md`.