# Contributing to AI Logic Sim

Thank you for contributing to the AI Logic Circuit Simulator! This guide documents our Git workflow, branching conventions, and quality standards for team collaboration.

---

## 🌿 Branching Model & Workflow

To maintain code stability and support concurrent development across the team, we follow a feature-branch workflow:

```
feature branch (feat/*, fix/*) ──► PR / merge ──► alpha ──► beta ──► main (GitHub Pages)
```

### 1. Branches
- **`main`**: Production release branch. Automatically deploys to GitHub Pages via GitHub Actions (`static.yml`). Only thoroughly tested and stabilized releases are merged here.
- **`beta`**: Staging and pre-release candidate branch.
- **`alpha`**: Active integration branch for incremental alpha updates (`v1.1.x-alpha`).
- **Feature Branches (`feat/*`, `fix/*`, `docs/*`)**:
  - Always branch off `alpha` (or `main` for critical production hotfixes).
  - Name your branch descriptively:
    - `feat/custom-ic-compression`
    - `fix/button-wire-stability`
    - `docs/github-workflow`

### 2. Feature Workflow
1. **Branch Out**:
   ```bash
   git checkout alpha
   git pull origin alpha
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
4. **Push & Open Pull Request**:
   ```bash
   git push -u origin feat/my-new-feature
   ```
   - Open a Pull Request on GitHub targeting `alpha` (or `main` when preparing a major release).
   - Ensure the automated CI test suite passes on GitHub Actions.
   - Request review from team members.

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

- **Alpha versions**: Incremented on `alpha` integration (`v1.1.0-alpha`, `v1.1.1-alpha`, `v1.1.2-alpha`).
- **Beta versions**: Incremented for release candidates (`v1.1.0-beta.1`).
- **Stable releases**: Tagged on `main` (`v1.1.0`, `v1.2.0`).
- Always document new features and fixes in `CHANGELOG.md` and `WISHLIST.md`.
