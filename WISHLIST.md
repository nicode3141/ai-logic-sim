# AI Logic Simulator — Wishlist & Feature Tracker

This document tracks all user requests and wishes for the **AI Logic Simulator** project.
Whenever new wishes are added, they are documented here, tracked with dedicated Git branches, and worked down sequentially.

---

## 🌿 Git Branching Model & Release Strategy

- **`main`**: **Stable releases only**. No experimental or WIP code is merged directly here. Releases are tagged (`v1.0.0`, `v1.1.0`, etc.).
- **`beta`**: **Pre-release & Staging**. Stabilized features from `alpha` are validated here before promoting to `main`.
- **`alpha`**: **Active Development & Integration**. The primary branch for integrating completed wishes and ongoing fixes.
- **`alpha/<feature-name>`**: Dedicated short-lived feature/fix branches for specific wishlist items. Branch off `alpha`, tested against the test suite, and merged back into `alpha` (no git worktrees used).

---

## 📋 Wishlist Items

| ID | Title | Git Branch | Status | Notes |
|---|---|---|---|---|
| **WISH-001** | Git Cleanup & Version Tiering (`main` = stable, `beta`, `alpha`) | `alpha` | 🟢 **Completed** | Removed external worktrees; established `main`, `beta`, `alpha` branches; tagged stable `v1.0.0-stable`. |
| **WISH-002** | GUI Declutter & Modern Desktop App Redesign | `alpha/gui-rework` | 🟡 **Pending** | Reduce clutter, clean toolbar/ribbon, modern desktop aesthetic (Photoshop / Paint.NET / Explorer). |
| **WISH-003** | UI Text, Icon Polish & Multi-Language Support (i18n) | `alpha/i18n-icons` | 🟡 **Pending** | Internationalization (DE / EN), clean SVG icons, polished labels and tooltips. |
| **WISH-004** | Rewiring Improvements | `alpha/improve-rewiring` | 🟡 **Pending** | Smarter orthogonal path routing, clean corner bends, intuitive re-routing when components move. |
| **WISH-005** | Slider Press-and-Hold Drag Interaction | `alpha/slider-drag` | 🟡 **Pending** | Allow holding the left mouse button on sliders/potentiometers and smoothly moving without losing focus. |
| **WISH-006** | Left-Click Press-and-Drag Wire Branching (T-Junctions) | `alpha/wire-branching` | 🟡 **Pending** | Pressing and holding LMB on an existing wire allows pulling out a new branch directly. |
| **WISH-007** | Floating / Terminus-Free Connections (No module required at end) | `alpha/floating-connections` | 🟡 **Pending** | Connections do not strictly require a module at both ends (support stubs, test points, dangling terminals). |
| **WISH-008** | Code Quality Improvement & Comment Cleanup | `alpha/code-cleanup` | 🟡 **Pending** | Streamline code, remove redundant/noisy comments, improve maintainability. |

---

## 📝 Change Log & Completed Wishes

- **WISH-001**: 
  - Eliminated external worktree directory `C:/Users/leqit/.gemini/antigravity/worktrees/ai-logic-sim/fix_digital_simulator_bugs`.
  - Preserved wire-bridge rendering feature and test suite in `ea2759f`.
  - Created `alpha` (integration/dev) and `beta` (staging) branches.
  - Tagged `main` as `v1.0.0-stable`.
  - Added `WISHLIST.md` tracker.
