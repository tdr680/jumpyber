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

## ADR-007 — Fixed 120 Hz simulation step

**Status:** Accepted

**Decision:** Run gameplay at a fixed 120 Hz step, render with `requestAnimationFrame`, and clamp incoming frame deltas to 100 ms.

**Reasoning:** A short fixed step keeps jump response and simple collision precise while making physics, scoring, and restart behavior deterministic in unit tests. Delta clamping prevents a suspended or delayed frame from advancing the simulation uncontrollably.

**Consequences:** A normal 60 Hz presentation frame performs approximately two simulation updates. Rendering currently uses the latest state without interpolation.

## ADR-008 — Environment-driven deployment base path

**Status:** Accepted

**Decision:** Keep Vite's base path at `/` by default and allow deployment builds
to set `VITE_BASE_PATH`. The GitHub Pages workflow derives
`/<repository-name>/` from GitHub's repository context.

**Reasoning:** Local development, root-hosted builds, and existing source asset
references remain unchanged, while a GitHub Pages project site receives URLs
that include its repository path. Deriving the path avoids coupling the build
configuration to a GitHub username.

**Consequences:** Any build served below a URL prefix must set the same
`VITE_BASE_PATH` while building and preview-testing. The Pages workflow owns this
setting for automated deployments.

## ADR-009 — Seeded gradient noise controls terrain slope

**Status:** Accepted

**Decision:** Generate the terrain's target slope with deterministic, seeded
one-dimensional gradient noise. Derive terrain height continuously by
integrating that slope across fixed world-space segments. A low noise frequency
will produce long ascents and descents, and the configured maximum slope is
measured in vertical logical world units per horizontal logical world unit.

Use one run-scoped terrain profile for rendering, obstacle placement, obstacle
collision rectangles, and terrain-boundary collision. The opening remains flat
and blends gradually into procedural slope. Smooth centre and boundary bias
will turn the profile away from its vertical limits instead of shaping it with
a hard height clamp.

**Reasoning:** Gradient noise changes continuously and avoids a visible,
repeating sequence of fixed ascent, crest, and descent phases. Integrating a
bounded target slope produces coherent geometry without assigning unrelated
random heights to neighboring samples. A seed makes the course reproducible
for restart and deterministic tests.

**Consequences:** Terrain generation must be indexed by world position rather
than frames or rendering samples. The implementation needs deterministic cached
integration nodes, explicit slope units and limits, a spatial opening blend,
long-profile fairness tests, and an explicit run seed. The initial Milestone
1.5 implementation will keep the camera fixed; any later camera must follow the
shared terrain profile through slower smoothing and must not use independent
noise.

**Implementation:** `GradientNoise1D` hashes the seed and integer lattice
position without mutable random state. `TerrainProfile` generates fixed-width
control nodes in ascending world-space order, linearly interpolates endpoint
slopes, and analytically integrates within each segment. A weak centre term and
smooth boundary influence reverse outward slopes before height limits. Restart
clears the cache but retains the configured seed.

Obstacles store world x and a height sampled from the run's shared terrain
profile when spawned or recycled. Their single projected rectangle calculation
is consumed by both rendering and collision. Passage rendering and
terrain-boundary collision sample that same profile using
`worldDistance + screenX`.

## ADR template

Copy this section for future decisions:

```text
## ADR-NNN — Title

Status: Proposed | Accepted | Superseded

Decision:

Reasoning:

Consequences:
```
