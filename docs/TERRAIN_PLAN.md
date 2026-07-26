# Milestone 1.5 Terrain Implementation Plan

## Status and scope

This document is the implemented design for **Milestone 1.5 — Procedural
ascending and descending world**. The implementation follows the phases below;
completion and verification are recorded in `TASKS.md`.

Milestone 1.5 will replace independently randomized obstacle heights and fixed
vertical world boundaries with one deterministic, world-space terrain profile.
The profile will influence gameplay geometry, not only decoration.

This milestone will not add Milestone 2 feedback, persistence, audio, final art,
menus, progression, or unrelated refactoring. It will not introduce a terrain
or noise dependency.

## Coordinate and geometry contract

- `worldX` starts at zero for a run and increases in the direction of travel.
- Logical Canvas `y` still increases downward.
- `TerrainSample.height` is the logical `y` coordinate of the course centerline.
- `TerrainSample.slope` is `dy / dx`, measured in vertical logical world units
  per horizontal logical world unit.
- A negative slope appears to ascend on screen; a positive slope appears to
  descend.
- The configured `maximumSlope` applies to the absolute value of this `dy / dx`
  slope. Angles are not stored; `atan(slope)` may be used only when describing
  tuning in degrees.
- A wider continuous passage follows the centerline for world-boundary
  collision. Obstacle gaps are centered on the same profile and remain the
  narrower, axis-aligned hazards from Milestone 1.
- Milestone 1.5 will keep the camera fixed. The bounded terrain profile must
  remain readable inside the logical viewport. Any later camera must follow a
  smoothed terrain reference and must not sample separate noise.

The core read-only contract should be equivalent to:

```ts
export interface TerrainSample {
  readonly height: number;
  readonly slope: number;
}

export interface TerrainSampler {
  sampleAt(worldX: number): TerrainSample;
}
```

One `TerrainProfile` for the current run must be shared by simulation geometry
and rendering. No consumer may independently recreate, perturb, or resample a
different terrain value for the same purpose.

## Planned configuration

Extend `GameConfig` with a typed `terrain` section. Final numeric values require
playtesting, but the algorithm must be tunable through values equivalent to:

```ts
terrain: {
  seed: number;
  initialHeight: number;
  noiseFrequency: number;
  maximumSlope: number;
  slopeSmoothingDistance: number;
  integrationStep: number;
  minHeight: number;
  maxHeight: number;
  centerBiasStrength: number;
  boundaryInfluenceDistance: number;
  openingFlatDistance: number;
  openingBlendDistance: number;
  passageHalfHeight: number;
  renderSampleSpacing: number;
}
```

`noiseFrequency` must be low enough that an understandable ascent or descent
normally lasts several seconds at the configured scroll speed.
`slopeSmoothingDistance` is a world-space distance, not a time or frame count.

Configuration validation must reject:

- a non-finite or non-integer seed;
- non-positive frequency, integration step, smoothing distance, render spacing,
  or opening blend distance;
- a negative opening flat distance;
- an invalid height interval or initial height outside it;
- an invalid maximum slope;
- terrain or obstacle gaps that violate top and bottom clearance;
- a passage too narrow for the player collision circle;
- boundary-bias values that do not turn the slope inward at the configured
  limits.

## Terrain algorithm

### Seeded one-dimensional gradient noise

`GradientNoise1D` will be a small stateless implementation:

1. Hash the explicit integer seed together with each integer lattice coordinate.
2. Derive a signed gradient from that hash without calling `Math.random()`.
3. Take the dot product between each neighboring gradient and its local
   distance.
4. Blend the neighboring contributions with a smooth quintic fade curve.
5. Normalize and document the result as bounded by `[-1, 1]`.

The hash must depend only on the seed and lattice coordinate. Sampling order,
render frequency, and previously requested positions must not affect the
result.

### Noise controls slope, not independent heights

At a world position, the raw target slope is:

```ts
const noiseSlope = slopeNoise.sample(worldX * noiseFrequency) * maximumSlope;
```

The target is spatially low-pass filtered over
`slopeSmoothingDistance`. This filtering must advance across fixed world-space
integration nodes; it must never update once per animation frame.

The terrain height is derived by integrating the effective slope over
horizontal distance. It must not assign a separate random height to each
rendering sample.

### Flat opening and gradual blend

- For `worldX <= openingFlatDistance`, height equals `initialHeight` and slope
  equals zero exactly.
- Across `openingBlendDistance`, a smoothstep-style easing multiplies the
  procedural slope from zero to full strength.
- The spatial slope filter begins from zero, so neither the blend start nor end
  creates a slope discontinuity.
- Ready state keeps `worldX` fixed at zero; therefore its terrain and obstacle
  geometry remain visually stable.
- Initial obstacle positions must be validated or adjusted so the flat and
  blended opening does not create a blind or physically unreasonable first
  gap.

### Smooth boundary bias

Slope integration can otherwise drift indefinitely. `TerrainProfile` will
combine two continuous corrections before applying the maximum-slope limit:

- a weak centre-seeking term proportional to the distance from the configured
  centre height; and
- attenuation of only the outward slope component inside
  `boundaryInfluenceDistance` of the approaching height limit.

At `minHeight` and `maxHeight`, the resulting derivative must point inward or be
tangent. The profile must turn naturally before a limit rather than relying on
a hard height clamp. A defensive epsilon assertion may protect against
floating-point error, but a hard clamp must not be the mechanism that shapes
visible terrain.

The final effective slope is bounded to
`[-maximumSlope, maximumSlope]`. Boundary correction may reduce or reverse the
noise slope, but never increase it beyond the gameplay limit.

### Deterministic spatial integration and cache

`TerrainProfile` will maintain fixed control nodes indexed by world-space
segment number:

- Node positions are multiples of `integrationStep`.
- Extending the profile always computes missing nodes in ascending index order,
  independent of the caller's query order.
- Each node stores height and effective slope.
- A predictor/corrector or midpoint/trapezoidal step derives the next height
  from slopes at the segment ends.
- Inside a segment, interpolate slope linearly and analytically integrate that
  interpolation for height. Shared endpoint slopes make the profile continuous
  in both height and first derivative.
- Sampling a previously generated position is read-only and idempotent.
- Rendering more or fewer intermediate points cannot alter cached control
  nodes.

Milestone 1.5 may use a forward-growing cache because runs move forward. Its
memory use must be measured over the expected multi-minute run length. If that
budget is excessive, retain deterministic chunk anchors and regenerate old
chunks by index rather than making results stateful or frame-dependent.

## Phase 1 — Typed terrain contracts and configuration

### Files

- Modify `src/config/gameConfig.ts`.
- Modify `src/tests/gameConfig.test.ts`.
- Create `src/game/terrain/TerrainTypes.ts` if keeping the public contracts
  separate improves imports; otherwise define them beside `TerrainProfile`.

### Work

- Add the terrain configuration and validation rules described above.
- Document slope units in the type comments.
- Keep all tuning values out of the noise and terrain classes.
- Define `TerrainSample` and `TerrainSampler` as read-only public contracts.

### Tests and verification

- Test valid defaults and each important invalid relationship.
- Run unit tests, TypeScript/build, and lint.
- Manually confirm the existing game still starts before terrain is wired into
  gameplay.

### Risks

- Height ranges must leave room for obstacle gaps, the player radius, and
  continuous passage boundaries.
- Over-constraining validation could make later tuning difficult; validate
  safety relationships, not arbitrary aesthetic preferences.

## Phase 2 — Deterministic gradient noise

### Files

- Create `src/game/terrain/GradientNoise1D.ts`.
- Create `src/tests/GradientNoise1D.test.ts`.

### Work

- Implement seed-and-lattice hashing, signed gradients, quintic fade, and
  normalized output.
- Keep the sampler stateless and independent of `RandomSource` and
  `Math.random()`.
- Add concise comments for the normalization and output range.

### Tests and verification

- The same seed and position always return the same value.
- Repeated and out-of-order sampling returns identical values.
- Different seeds produce different sequences.
- A dense sample remains in `[-1, 1]` within floating-point tolerance.
- Nearby values and finite-difference slopes change smoothly at and across
  lattice boundaries.
- A small fixed-seed snapshot may protect the hash contract.
- Run unit tests, TypeScript/build, and lint.

### Risks

- A weak integer hash can create visible periodicity.
- Changing hash constants later changes every seeded course, so snapshot only
  enough values to detect accidental changes.

## Phase 3 — Terrain profile, opening, integration, and drift control

### Files

- Create `src/game/terrain/TerrainProfile.ts`.
- Create `src/tests/TerrainProfile.test.ts`.
- Modify `src/config/gameConfig.ts` only for tuning found necessary while
  validating the algorithm.

### Work

- Convert low-frequency noise into a spatially smoothed target slope.
- Apply the exact flat opening and eased transition.
- Apply centre bias and smooth boundary influence.
- Integrate at fixed world-space nodes and cache by segment index.
- Return height and slope through `sampleAt(worldX)`.
- Explicitly define behavior for `worldX <= 0` as the flat opening.

### Tests and verification

- Opening samples have exactly constant height and zero slope.
- The blend begins with no jump and changes slope continuously.
- The same position returns the same sample repeatedly.
- Ascending, descending, sequential, sparse, and shuffled query orders agree.
- Simulated 60 Hz, 120 Hz, and irregular render query patterns agree at common
  positions.
- A long profile stays within its playable height range without flat clamped
  plateaus or abrupt corners.
- Absolute slope never exceeds `maximumSlope`.
- Adjacent segment slopes are continuous within tolerance.
- Different seeds produce different height profiles.
- A long fixed-seed sample contains ascending, descending, and nearly
  horizontal sections using tolerance bands rather than hand-authored values.
- Run unit tests, TypeScript/build, and lint.

### Risks

- A noise frequency that is too high feels twitchy; one that is too low feels
  predetermined.
- Excess centre bias can make profiles converge visibly toward the middle.
- Large integration steps can overshoot bounds or expose curvature corners.
- Slope smoothing must be spatial; temporal smoothing would make terrain depend
  on frame rate.

## Phase 4 — World-space travel, seed lifecycle, and restart

### Files

- Modify `src/game/GameWorld.ts`.
- Modify `src/app/GameApp.ts` only if construction needs an explicit
  `TerrainProfile` dependency.
- Modify `src/tests/GameWorld.test.ts`.

### Work

- Add authoritative horizontal `worldDistance` in logical world units.
- Advance it by scroll speed times elapsed seconds only while Playing.
- Derive the player's terrain query position as
  `worldDistance + player.x`.
- Give every run an explicit terrain seed and expose that seed in the
  read-only snapshot or run metadata.
- Share one run-scoped `TerrainSampler` with all geometry consumers.
- On restart, reset horizontal distance and transient terrain caches while
  keeping the same seed. A future intentional new-course action may supply a new
  seed, but is outside this milestone.

### Tests and verification

- Ready state does not move the terrain.
- World distance uses elapsed seconds rather than frame count.
- Equivalent elapsed time produces equivalent world positions.
- Restart returns to distance zero and reproduces the opening samples.
- No stale obstacle or terrain state survives restart.
- Run unit tests, TypeScript/build, and lint.
- Manually verify Ready remains motionless and restart shows the same opening.

### Risks

- Keeping both mutable screen `x` and world `x` would invite drift. World
  position should be authoritative and screen position derived.
- A renderer-owned seed or terrain instance could diverge after restart.

## Phase 5 — Terrain-aligned obstacles

### Files

- Modify `src/game/Obstacle.ts`.
- Modify `src/game/ObstacleField.ts`.
- Modify `src/tests/ObstacleField.test.ts`.
- Modify scoring tests only where they currently assume mutable screen-space
  obstacle coordinates.

### Work

- Store obstacle positions as `worldX`; derive screen `x` from
  `worldX - worldDistance`.
- Remove independent random `gapTop` generation for terrain placement.
- At the obstacle centre world position, sample the shared terrain and centre
  the configured gap on `TerrainSample.height`.
- Centralize screen projection, sampled height, gap edges, and top/bottom
  collision rectangles in one pure obstacle-geometry function.
- Use that exact geometry function for rendering and collision.
- Recycle obstacles forward by deterministic world spacing and reset `scored`.
- Keep scoring based on the projected trailing edge and preserve one point per
  obstacle.

### Tests and verification

- Obstacle gap centre equals the terrain height sampled at its world position.
- Rendering/collision geometry requests return the same rectangles.
- Safe clearances hold across a long terrain stretch.
- Recycling remains bounded, deterministic, correctly spaced, and clears only
  the recycled score flag.
- Scoring remains exactly once per obstacle.
- Opening obstacles are readable and do not violate the flat/blended approach.
- Run unit tests, TypeScript/build, and lint.
- Manually inspect several seeds for gap visibility and fair transitions.

### Risks

- Sampling only the obstacle centre while the course slopes across its width
  creates a small alignment difference at its edges. Keep maximum slope safe
  and test the worst configured width/slope combination.
- Removing random gap placement changes existing tests but must not weaken
  deterministic coverage.

## Phase 6 — Terrain-derived boundary collision

### Files

- Modify `src/game/Collision.ts`.
- Modify `src/game/GameWorld.ts`.
- Modify `src/tests/Collision.test.ts`.
- Modify `src/tests/GameWorld.test.ts`.

### Work

- Derive the continuous passage's upper and lower boundaries from the terrain
  sample at the player's world position and configured passage half-height.
- Account for local slope when comparing the player circle with the boundary;
  use the terrain tangent/normal or an equivalently conservative local segment
  test instead of treating a steep boundary as horizontal.
- Keep obstacle collision circle-versus-rectangle.
- Evaluate terrain boundary and obstacle collision from the same profile and
  world distance used by rendering.

### Tests and verification

- A circle safely inside both terrain-following boundaries does not collide.
- Contact with either boundary is fatal, including on positive and negative
  slopes.
- Near-tangent cases follow one documented inclusive rule.
- Boundary collision uses the same terrain sample as obstacle geometry.
- Maximum slope and passage width leave a playable cross-section.
- Run unit tests, TypeScript/build, and lint.
- Manually verify that visible contact and death agree on ascents and descents.

### Risks

- Comparing only vertical circle extents would become inaccurate on a slope.
- Overly conservative collision can feel unfair; tests should cover the local
  normal calculation and exact tangency.

## Phase 7 — Canvas terrain rendering

### Files

- Modify `src/rendering/CanvasRenderer.ts`.
- Modify `src/game/GameWorld.ts` snapshot types if the renderer needs a
  read-only sampler and world distance.
- Modify rendering colors in `src/config/gameConfig.ts` only as required for
  placeholder readability.

### Work

- Sample the visible interval from `worldDistance` through
  `worldDistance + world.width` at fixed horizontal render spacing.
- Connect samples into a continuous Canvas path and render the terrain/passage
  boundary with simple primitives.
- Project obstacles with the shared obstacle-geometry function.
- Keep all sampling read-only; drawing frequency must never advance terrain
  generation state in a way that changes geometry.
- Remove or replace the current decorative fixed ground curve so it cannot
  disagree with collision geometry.
- Do not add camera movement in this milestone.

### Tests and verification

- Existing Playwright smoke coverage still sees the Ready and Playing states
  without console or page errors.
- Add only a stable browser assertion or development-only datum if needed to
  prove terrain is rendered; keep numerical correctness in unit tests.
- Resize the viewport and confirm the terrain, obstacles, and collision remain
  aligned.
- Manually inspect the flat opening, eased transition, long ascents, long
  descents, near-horizontal stretches, and smooth reversals.
- Run unit tests, Playwright, TypeScript/build, and lint.

### Risks

- Large render spacing can visibly facet the line; tiny spacing creates
  unnecessary work. This is a rendering value only and must not alter
  simulation samples.
- Canvas interpolation must not invent a different obstacle or collision path.

## Phase 8 — Integration, fairness, and documentation

### Files

- Modify `src/tests/GameWorld.test.ts`.
- Modify `tests/e2e/game.spec.ts` only for stable integration coverage.
- Modify `docs/ARCHITECTURE.md`.
- Modify `docs/GAMEPLAY.md`.
- Modify `docs/TESTING.md`.
- Check completed items in `docs/TASKS.md`.

### Work

- Add integration coverage connecting seed, terrain, obstacles, collision,
  rendering inputs, and restart.
- Sample multiple long seeded courses and verify all safety invariants.
- Document seed lifecycle, slope units, terrain ownership, and world-space
  projection.
- Record tuning observations without starting Milestone 2 tuning features.

### Final automated verification

```bash
npm run format:check
npm run lint
npm run test
npm run build
npm run test:e2e
npm run test:e2e:preview
```

Also run a Pages-base production build and preview smoke test so new source and
Canvas behavior remain deployment-safe.

### Final manual verification

- Ready terrain is horizontal and stable.
- The opening blends gradually with no visible corner.
- Several fixed seeds show long ascents, descents, nearly horizontal stretches,
  flattening, and smooth reversals.
- The player can read upcoming gaps and retain control at maximum slope.
- Terrain never approaches the viewport limits abruptly.
- Rendered boundaries, collision, and obstacle gaps stay aligned.
- Restart reproduces the same opening course.
- Keyboard, pointer, and touch still start and control the game.
- Scoring, game over, guarded restart, and obstacle recycling still work.

## Ordered implementation checklist

1. Add and validate typed terrain configuration and sampling contracts.
2. Implement and test stateless seeded one-dimensional gradient noise.
3. Implement and test deterministic spatial slope integration.
4. Add the flat opening, smooth blend, slope limit, and boundary bias.
5. Add authoritative world distance and explicit run seed lifecycle.
6. Convert obstacles from mutable screen positions to projected world
   positions.
7. Centralize terrain-aligned obstacle geometry for placement, rendering, and
   collision.
8. Replace fixed vertical boundary collision with terrain-derived passage
   collision.
9. Render the shared terrain profile and remove contradictory decorative
   ground.
10. Add long-profile, cross-system, restart, browser, and fairness coverage.
11. Update architecture, gameplay, testing, decisions, and task documentation.
12. Run all automated and manual acceptance checks before marking Milestone 1.5
    complete.
