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

## ADR-010 — Player sprite is presentation-only with a Canvas fallback

**Status:** Accepted

**Decision:** Render the player from a six-frame 96×96 transparent sprite sheet
loaded from Vite's deployment-relative public asset path. Select frames through
pure game-state and velocity bands, use the common centre anchor for every
frame, and retain the original Canvas primitive player if the image cannot
load.

**Reasoning:** A small fixed sheet adds readable motion without coupling
animation timing to simulation or adding an asset framework. Broad rise, apex,
and fall thresholds avoid rapid flicker. A deployment-relative URL works for
both local root hosting and the GitHub Pages project base.

**Consequences:** The generated image, frame metadata, prompt, and deterministic
normalization script are versioned together. The visual frame rectangle and
decorative limbs do not change the explicit player collision radius. Browser
tests must confirm the sheet loads in root and Pages-path production previews.

## ADR-011 — One obstacle body tile fills shared gameplay geometry

**Status:** Accepted

**Decision:** Render both obstacle rectangles with one vertically seamless
64×64 transparent body tile. Repeat the tile directly through the complete
rectangles returned by `getObstacleRectangles`, and retain the original Canvas
rectangles as the image-load fallback. Do not construct caps, bases, damaged
variations, mirrored pieces, or terrain-specific visual attachments.

**Reasoning:** The multi-piece assembly added presentation geometry that made
it harder to preserve the simple pre-sprite obstacle silhouette. One tile maps
directly to the authoritative rectangles, keeps varying heights and
terrain-following gap positions obvious, and removes unnecessary asset-loading
and assembly code.

**Consequences:** Typed configuration contains one deployment-relative image
path, one 64×64 source size, and one tile height. The generated source prompt,
deterministic crop and seam correction, and transparent body PNG are versioned
together. Browser tests verify deployment-relative loading. The fixed-size gap
remains centred directly on the shared terrain sample; no separate
obstacle-height randomness is introduced.

## ADR-012 — Shared old-school dark-fantasy ink treatment for gameplay sprites

**Status:** Accepted

**Decision:** Apply the visual rules in `.prompts/style-shadowdark.md` to the
generated player and obstacle assets as an original old-school dark-fantasy
tabletop ink treatment. Use strong rough outlines, compact silhouettes,
minimal one- or two-step shading, restrained printed-book texture, and a muted
charcoal, iron-grey, umber, and parchment-grey palette.

Preserve the existing runtime contracts while applying that treatment: the
player remains six centred 96×96 frames with one `(48, 48)` anchor, and
obstacles remain one seamless 64×64 body tile filling the authoritative
collision rectangles. Decorative detail stays inside those silhouettes and
does not change simulation, collision, terrain projection, or asset paths.

**Reasoning:** One shared treatment makes separately generated assets feel
coherent while keeping them readable over the current light background at
small size. Explicit silhouette and detail limits prevent the richer dungeon
theme from weakening gameplay clarity.

**Consequences:** Reusable generation prompts inherit the shared style brief
and retain asset-specific layout, chroma, and normalization constraints.
Generated sources are chroma-keyed and normalized deterministically. The Canvas
fallbacks remain intentionally simpler and continue to protect runtime
availability; changing the rest of the background or interface theme is
outside this asset refresh.

## ADR-013 — Balanced two-tone is the small-sprite reference treatment

**Status:** Accepted

**Decision:** Use style exploration 3, the balanced two-tone study in
`art/style-explorations/`, as the reference for future small gameplay sprites.
It combines medium controlled line roughness, continuous near-black
silhouettes, two hard-edged value steps, medium charcoal fills, muted
parchment-grey accents, and sparse grouped texture.

**Reasoning:** The four studies were reduced to 240×240 complete-vignette
thumbnails and compared on both light and dark backgrounds. Study 3 preserved
the player pose, obstacle gap, masonry blocks, and terrain contour most
consistently. Cleaner treatment lost some separation on dark fields, rougher
lines became busy, and the darkest textured treatment merged at small scale.

**Consequences:** Future generation prompts should treat texture as an interior
accent and keep gameplay edges quiet. The selected study is a visual reference,
and its treatment is now applied to the runtime player sheet and obstacle body.
The adoption changes only raster presentation; it does not change rendering
contracts, anchors, collision, or terrain geometry.

## ADR-014 — Modular sprite strips use a presentation-only parallax renderer

**Status:** Accepted

**Decision:** Build the background from three transparent, horizontally
repeatable sprite strips rather than one viewport-sized illustration. Define
their path, source and draw size, scroll factor, vertical offset, repeat mode,
spacing, opacity, and world/camera motion source in ordered typed
configuration. Render them through a dedicated parallax module after the
Canvas sky gradient and before all authoritative gameplay geometry.

Use `worldDistance` as the initial layers' only travel source. Keep the
gradient as a permanent base and fallback, and skip any missing or
dimensionally invalid sprite without interrupting the render loop.

**Reasoning:** Modular strips support screens and run lengths beyond one fixed
composition, while three modestly different world-scroll factors communicate
depth with little runtime work. Pure wrap calculations are deterministic and
unit-testable. Loading each image once and drawing only the copies needed to
cover the viewport keeps the system lightweight.

Keeping decorative art behind a stable fallback avoids turning a presentation
failure into a broken game. Separating it from the terrain profile also
prevents background silhouettes from becoming accidental collision or
obstacle-placement inputs.

**Consequences:** Background assets require transparent extraction,
deployment-relative paths, known dimensions, and horizontally compatible
edges. The generated strips and their deterministic seam-normalization script
are versioned with a reusable prompt. Layer opacity and vertical placement are
visual tuning values; changing them does not alter simulation, restart,
scoring, terrain, or collision. A future camera can provide decorative travel
through the existing motion-source field without changing the current
fixed-camera simulation.

## ADR template

Copy this section for future decisions:

```text
## ADR-NNN — Title

Status: Proposed | Accepted | Superseded

Decision:

Reasoning:

Consequences:
```
