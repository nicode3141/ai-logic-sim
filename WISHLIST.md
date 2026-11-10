# AI Logic Simulator — Wishlist & Feature Tracker

This document tracks all user requests and wishes for the **AI Logic Simulator** project.
Whenever new wishes are added, they are documented here, tracked with dedicated Git branches, and worked down sequentially.

---

## 🌿 Git Branching Model & Release Strategy

- **`main`**: **Stable releases only**. No experimental or WIP code is merged directly here. Releases are tagged (`v1.0.0`, `v1.1.0`, etc.).
- **`beta`**: **Pre-release & Staging**. Stabilized features from `alpha` are validated here before promoting to `main`.
- **`alpha`**: **Active Development & Integration**. The primary branch for integrating completed wishes and ongoing fixes.
- **`feat/<name>`**: Dedicated short-lived feature/fix branches for specific wishlist items. Branch off `alpha`, tested against the test suite, and merged back into `alpha` (no git worktrees used).

---

## 📋 Wishlist Items

| ID | Title | Git Branch | Status | Notes |
|---|---|---|---|---|
| **WISH-001** | Git Cleanup & Version Tiering (`main` = stable, `beta`, `alpha`) | `alpha` | 🟢 **Completed** | Removed external worktrees; established `main`, `beta`, `alpha` branches; tagged stable `v1.0.0-stable`. |
| **WISH-002** | GUI Declutter & Modern Desktop App Redesign | `feat/gui-rework` | 🟡 **Pending** | Reduce clutter, clean toolbar/ribbon, modern desktop aesthetic (Photoshop / Paint.NET / Explorer). |
| **WISH-003** | UI Text, Icon Polish & Multi-Language Support (i18n) | `feat/i18n-icons` | 🟡 **Pending** | Internationalization (DE / EN), clean SVG icons, polished labels and tooltips. |
| **WISH-004** | Rewiring Improvements | `feat/improve-rewiring` | 🟢 **Completed** | Strict orthogonal segment dragging (first/internal/last segments), collinear bend pruning, channel deconfliction to prevent parallel wire overlaps, right-click wire menu. |
| **WISH-005** | Slider Press-and-Hold Drag Interaction | `feat/slider-drag` | 🟢 **Completed** | Hold left mouse button on sliders/potentiometers to smoothly drag across elements without losing focus. |
| **WISH-006** | Left-Click Press-and-Drag Wire Branching (T-Junctions) | `feat/wire-branching` | 🟢 **Completed** | Pressing and holding LMB on an existing wire allows pulling out a new branch directly. |
| **WISH-007** | Floating / Terminus-Free Connections (No module required at end) | `feat/floating-connections` | 🟢 **Completed** | Connections do not strictly require a module at both ends (support stubs, test points, dangling terminals). |
| **WISH-008** | Code Quality Improvement & Comment Cleanup | `feat/code-cleanup` | 🟡 **Pending** | Streamline code, remove redundant/noisy comments, improve maintainability. |
| **WISH-009** | Realistic Gate Propagation Delay & Global Configuration | `feat/gate-delay` | 🟢 **Completed** | Global gate delay (1–20 ticks), toggleable badge display (off by default), and realistic inertial transition timing ("wie im echten Leben"). |

---

## 📝 Change Log & Completed Wishes

- **WISH-001**: 
  - Eliminated external worktrees.
  - Created `alpha` (integration/dev) and `beta` (staging) branches.
  - Tagged `main` as `v1.0.0-stable`.
  - Added `WISHLIST.md` tracker.
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
