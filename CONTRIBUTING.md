# Contributing to AI Logic Sim

Thank you for contributing to the AI Logic Circuit Simulator! This guide documents our Git workflow, branching conventions, and quality standards for team collaboration.

---

## 🌿 Branching Model & Workflow

The project uses **two long-lived branches** plus short-lived feature branches:

```
feat/*, fix/*, chore/*, docs/* ──► PR / merge ──► dev ──► PR / release ──► main (production)
```

### 1. Branches
- **`main`**: Production branch. Always deployable and stable. Automatically deploys to GitHub Pages via GitHub Actions (`static.yml`). Only validated releases are merged here and tagged (e.g. `v1.2.0`).
- **`dev`**: Development and integration branch. All completed features, fixes, and chores are integrated and tested here before promotion to `main`.
- **Feature Branches**: Short-lived branches created from `dev` and merged back into `dev` through a pull request:
  - `feat/<name>` — new features (e.g. `feat/custom-ic-compression`)
  - `fix/<name>` — bug fixes (e.g. `fix/button-wire-stability`)
  - `chore/<name>` — maintenance, tooling, repository and process changes
  - `docs/<name>` — documentation-only changes
  - `hotfix/<name>` — urgent production fixes; branch from `main`, merge to `main`, then back-merge into `dev`
- **Retired branches**: The legacy `alpha` and `beta` tiers were migrated to `dev` in WISH-045 and must not be recreated.

### 2. Feature Workflow
1. **Branch Out**:
   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b feat/my-new-feature
   ```
2. **Develop & Test**:
   - Run tests frequently:
     ```bash
     npm test
     # or: node tests/run_all_tests.js
     ```
   - Keep 100% test pass rate across all suites.
3. **Commit with Conventional Commits**:
   - `feat(scope): add new feature`
   - `fix(scope): resolve bug`
   - `test(scope): add test cases`
   - `docs(scope): update documentation`
   - `refactor(scope): restructure code without behavior changes`
   - `chore(scope): repository, tooling, or process changes`
   - `ci(scope): CI/CD workflow changes`
4. **Push & Open Pull Request**:
   ```bash
   git push -u origin feat/my-new-feature
   ```
   - Open a Pull Request on GitHub targeting `dev` (or `main` for an approved production hotfix/release).
   - Ensure the automated CI test suite passes on GitHub Actions.
   - Request review from team members.
   - Delete the feature branch after merging.

### 3. Commit Message Standard
- Use the imperative mood in the subject: `add`, `fix`, `remove`, not `added` or `fixes`.
- Keep the subject at 72 characters or fewer and do not end it with a period.
- Use the body to explain **what** changed and **why**, not **how**.
- Reference the relevant wishlist/issue ID in the footer, e.g. `Refs: WISH-045`.
- AI-assisted commits must include the co-author trailer:
  ```
  Co-authored-by: opencode-agent[bot] <156322137+opencode-agent[bot]@users.noreply.github.com>
  ```

Generic commit format:

```
<type>(<scope>): <short summary>

<optional body>

Refs: WISH-XXX
Co-authored-by: opencode-agent[bot] <156322137+opencode-agent[bot]@users.noreply.github.com>
```

---

## 🧪 Testing & Verification

Before submitting any Pull Request:
1. Run all test suites:
   ```bash
   npm test
   ```
   Or run individual suites:
   - `npm run test:comprehensive`: Logic rules, security bounds, interaction invariants, and wishlist checks.
   - `npm run test:fuzz`: Fuzz torture and topology stress tests.
   - `npm run test:layout`: Orthogonal routing and auto-align aesthetics.
   - `npm run test:bench`: Engine execution throughput benchmark.
2. Manually test your changes in the browser (`index.html`) across different UI themes and zoom levels.

---

## 📦 Versioning Conventions

- **Development pre-releases**: Optional `-rc.N` tags created from `dev` for validation (e.g. `v1.2.0-rc.1`).
- **Stable releases**: Tagged on `main` after promotion and validation (e.g. `v1.2.0`).
- **Historical tags**: Legacy `v1.1.x-alpha` tags remain for traceability and must not be moved.
- Always document new features and fixes in `CHANGELOG.md` and `WISHLIST.md`.
