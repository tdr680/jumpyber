# Architecture Decision Log

Use this file for decisions that future contributors or agents should not repeatedly reconsider.

## ADR-001 — Vite and TypeScript

**Status:** Accepted

**Decision:** Use Vite for development/build tooling and TypeScript in strict mode.

**Reasoning:** The project is a small browser application. Vite provides a fast development server and simple static production output without imposing an application framework.

## ADR-002 — Canvas 2D rendering

**Status:** Accepted

**Decision:** Render the game with the HTML5 Canvas 2D API.

**Reasoning:** The game has a small number of moving objects and does not need a scene graph or GPU-specific renderer. Canvas keeps the runtime and dependency surface small.

## ADR-003 — No game engine for MVP

**Status:** Accepted

**Decision:** Do not use Phaser, PixiJS, Matter.js, or another game engine for the MVP.

**Reasoning:** The core mechanic requires only simple integration, rendering, and collision. A game engine would add concepts and dependencies before a need is demonstrated.

## ADR-004 — Fixed logical resolution

**Status:** Accepted

**Decision:** Simulate and draw in a fixed logical coordinate system, scaled to the browser viewport.

**Reasoning:** This keeps physics and layout consistent across devices while allowing responsive display sizing.

## ADR-005 — Simple collision primitives

**Status:** Accepted

**Decision:** Model the player as a circle and obstacles as axis-aligned rectangles.

**Reasoning:** This is deterministic, fast, easy to test, and visually understandable. Decorative rendering should not change collision behavior.

## ADR-006 — Tests focus on simulation

**Status:** Accepted

**Decision:** Unit-test deterministic gameplay logic with Vitest and use Playwright only for critical browser integration paths.

**Reasoning:** Frame-by-frame visual browser tests are fragile. Most game correctness can be verified faster and more reliably through pure logic tests.

## ADR template

Copy this section for future decisions:

```text
## ADR-NNN — Title

Status: Proposed | Accepted | Superseded

Decision:

Reasoning:

Consequences:
```
