# Architecture

## Architectural goals

- Simple enough for a small game
- Clear boundaries between simulation, rendering, and browser integration
- Testable gameplay logic
- No dependence on frame rate
- Easy replacement of placeholder visuals

## Main layers

### Browser shell

Responsible for:

- Locating or creating the canvas
- Starting the application
- Handling resize and device pixel ratio
- Connecting input and visibility events

This layer should not contain gameplay rules.

### Game application

`GameApp` coordinates the main systems:

- Game loop
- Current game state
- Simulation update
- Rendering
- Input dispatch
- Audio and overlays

### Simulation

The simulation owns authoritative gameplay state:

- Player position and velocity
- Obstacles
- Score
- Current run state
- Timers and difficulty

Simulation code should avoid direct DOM access.

### Rendering

The renderer receives a read-only view of game state and draws it to Canvas 2D. It should not decide collisions, scoring, or spawning.

### Input

The input controller normalizes keyboard, pointer, and touch into semantic actions. The game should consume actions, not raw browser events.

### Audio

Audio is optional for the first visual milestone. The audio controller should tolerate browsers that require user interaction before playback.

## Current modules

```text
src/main.ts
  Creates the app and starts it.

src/app/GameApp.ts
  Coordinates lifecycle, input, update, render, and restart.

src/app/GameLoop.ts
  requestAnimationFrame loop, delta clamping, fixed-step accumulator.

src/app/GameState.ts
  Ready, Playing, and GameOver state constants and type.

src/config/gameConfig.ts
  Typed gameplay and rendering constants.

src/game/GameWorld.ts
  Owns the simulation state and high-level update order.

src/game/Player.ts
  Player state and movement rules.

src/game/Obstacle.ts
  Obstacle-pair data structure.

src/game/ObstacleField.ts
  World-space spawn, terrain-aligned placement, recycling, and scoring candidates.

src/game/Collision.ts
  Pure obstacle and terrain-passage collision functions.

src/game/Score.ts
  Pure one-point-per-obstacle scoring rules.

src/game/terrain/GradientNoise1D.ts
  Stateless seeded one-dimensional gradient-noise sampling.

src/game/terrain/TerrainProfile.ts
  Fixed-distance slope integration, opening blend, drift control, and cached
  arbitrary-position sampling.

src/game/terrain/TerrainTypes.ts
  Read-only terrain height/slope sampling contracts.

src/input/InputController.ts
  Browser events normalized to game actions.

src/rendering/CanvasRenderer.ts
  Composes the sky, parallax background, terrain, gameplay sprites, fallbacks,
  and interface in presentation order.

src/rendering/ParallaxBackground.ts
  Loads configured decorative strips once and renders allocation-light
  repeated layers from pure world/camera offset calculations.

src/rendering/PlayerSprite.ts
  Pure game-state/velocity-to-frame selection and stable frame ordering.

src/rendering/Viewport.ts
  Logical-to-physical scaling and coordinate conversion.

src/core/random.ts
  Injectable random number generator.

src/core/types.ts
  Shared lightweight types.
```

## Update order

For each simulation step:

1. Consume pending semantic input.
2. Apply state transitions.
3. Update player velocity and position.
4. Advance authoritative horizontal world distance.
5. Evaluate collisions and boundaries.
6. If the run is still alive, evaluate scoring.
7. Recycle off-screen world-space obstacles ahead of the player.
8. Apply any resulting state transition.

The renderer runs after zero or more simulation steps using the latest state.

## Fixed-step loop

The Milestone 1 simulation step is:

```text
1 / 120 second
```

Use `requestAnimationFrame` for presentation. Clamp incoming frame delta, for example to 100 ms, to avoid runaway updates after tab suspension.

A simple implementation:

```text
accumulator += clampedDelta
while accumulator >= step:
  update(step)
  accumulator -= step
render()
```

Interpolation is optional for the MVP. Correctness matters more than architectural sophistication.

## Viewport and scaling

- Maintain a fixed logical resolution.
- Fit the logical canvas inside the available browser area.
- Preserve aspect ratio.
- Use CSS size for display dimensions.
- Set backing-store dimensions using device pixel ratio for sharp output.
- Apply one renderer transform so drawing code uses logical coordinates.
- Convert pointer coordinates back into logical space only if position-specific input is added.

## State ownership

Use a single authoritative `GameWorld` instance for each run or reset it completely. Avoid hidden mutable module globals.

Current public snapshot fields:

- state
- player
- obstacles
- score
- worldTime
- worldDistance
- gameOverElapsed
- terrainSeed
- read-only terrain sampler

`bestScore` remains deferred until Milestone 2. The renderer receives the current
fields as a read-only snapshot.

## Terrain and world-to-screen projection

`GameWorld` owns one `TerrainProfile` and one monotonically increasing
`worldDistance` for the active run. The player retains a stable screen x, so its
terrain query position is `worldDistance + player.x`.

Obstacles store authoritative `worldX`, width, gap size, score state, and the
terrain height sampled at their centre when spawned or recycled. Their screen x
is `obstacle.worldX - worldDistance`. One pure rectangle function performs this
projection and derives both collision rectangles; simulation and
`CanvasRenderer` call the same function.

The renderer samples the shared terrain profile from `worldDistance` through
the visible logical width. It draws parallel upper and lower passage boundaries
from those samples. Terrain passage collision samples the same profile at the
player's world position and accounts for the local slope. Rendering can extend
the deterministic terrain cache, but cannot change any sample value.

## Deterministic terrain sampling

`GradientNoise1D` hashes the configured seed with integer lattice positions and
uses smooth gradient interpolation. It is stateless and never calls
`Math.random()`.

`TerrainProfile` converts low-frequency noise into target slope and integrates
it at fixed world-distance nodes. Missing nodes are generated in ascending index
order and cached. Within a segment, slope is interpolated linearly and height
is the analytical integral of that interpolation. Query order, frame delta,
display refresh rate, and renderer sample spacing therefore cannot change a
sample at a given `worldX`.

## Player sprite rendering

The player sprite sheet is a public static asset addressed through Vite's
`BASE_URL`, so root development and GitHub Pages project paths use the same
renderer code. `CanvasRenderer` loads the PNG once, reports load state through a
read-only canvas data attribute used by browser tests, and draws a 96×96 source
frame around the shared `(48, 48)` anchor.

`PlayerSprite` maps Ready and GameOver directly and divides Playing velocity
into jump, rise, apex, and fall bands. The apex band spans both sides of zero to
avoid rapid frame flicker. Asset loading and pose selection never modify player
physics or collision. If loading fails, the renderer uses the original
Canvas-drawn player.

## Obstacle body sprite rendering

`CanvasRenderer` loads one 64×64 public obstacle body tile through Vite's
deployment-relative `BASE_URL`. If that image does not load with its configured
dimensions, the renderer keeps the existing collision-aligned Canvas fallback.

The renderer calls `getObstacleRectangles` and repeats the same seamless body
tile directly through each complete top and bottom rectangle. It does not
construct caps, bases, variations, or terrain-specific visual geometry. The
sprite and fallback therefore share exactly the same position, width, height,
and terrain-following gap.

The opening has exactly zero slope and eases into noise. A weak centre bias plus
smooth attenuation and inward bias near vertical limits prevents unbounded
drift. Restart clears generated nodes and recreates obstacles with the same
configured seed.

## Sprite background and parallax

`gameConfig.background.layers` is an ordered, typed list of decorative layers.
Each entry owns its deployment-relative image path, expected source and draw
size, scroll factor, logical vertical offset, repeat mode, spacing, opacity,
and motion source. The initial mist, skyline, and ruin strips are all anchored
to authoritative `worldDistance`, with factors of `0.025`, `0.07`, and `0.15`
respectively.

`ParallaxBackground` loads each image once through Vite's `BASE_URL`, validates
its natural dimensions, and renders only enough repeated copies to cover the
logical viewport. Its pure wrap helpers map source travel to a stable offset,
including after any number of complete strip widths. Config order is render
order, from farthest to nearest.

The sky gradient is always painted first. A missing or dimensionally invalid
layer is skipped, so the gradient and any successfully loaded siblings remain
usable; the canvas exposes aggregate loading state for browser checks. Terrain,
obstacles, player, and interface then render above the decorative background.

Parallax layers never participate in terrain sampling, obstacle placement,
collision, scoring, camera simulation, or restart state. This is a deliberate
one-way projection:

```text
GameWorld worldDistance
  -> per-layer scroll factor and horizontal wrap
  -> decorative Canvas draw positions only
```

The configuration supports camera-anchored decorative travel later, but the
current fixed camera supplies no offset and all shipped layers are
world-anchored.

## Randomness

Define a tiny interface:

```ts
export interface RandomSource {
  next(): number;
}
```

Production may use `Math.random`; tests can use a seeded or scripted implementation.

## Persistence

Only best score and user preferences should be persisted in the MVP. Wrap `localStorage` access behind a small adapter and fail safely.

## Error handling

- Throw during initialization for missing essential DOM elements.
- Avoid throwing during the animation loop for recoverable storage or audio failures.
- Log actionable development errors.
- Do not silently swallow invalid state transitions in development.

## Dependency policy

A dependency should be added only when it clearly reduces risk or substantial implementation work. Avoid adding a full game engine, physics engine, state library, or UI framework for the MVP.
