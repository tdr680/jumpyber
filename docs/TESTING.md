# Testing Strategy

## Purpose

The game is small, but subtle bugs in time, collision, scoring, and restart behavior can make it feel unfair. Focus automated tests on deterministic gameplay logic and use browser tests for integration.

## Unit tests with Vitest

Prioritize pure logic.

### Physics

- Gravity changes vertical velocity according to elapsed time.
- Jump sets the expected upward velocity.
- Falling velocity is clamped.
- Position changes consistently for known time steps.

### Collision

- Circle outside rectangle does not collide.
- Circle overlapping each rectangle edge collides.
- Circle touching a corner behaves according to the chosen inclusive boundary rule.
- Player collision with top and bottom boundaries is detected.

### Obstacles

- Obstacle screen positions derive from world x minus elapsed-distance
  scrolling.
- Off-screen obstacles are recycled or removed.
- Spawned gap centres equal the shared terrain profile at the obstacle world
  position.
- Terrain-aligned gaps remain inside safe bounds on long ascending and
  descending sections.

### Procedural terrain

- Gradient noise is deterministic for a fixed seed and differs across seeds.
- Noise stays in its documented range and changes smoothly at lattice
  boundaries.
- The opening is exactly horizontal and blends continuously into procedural
  slope.
- Arbitrary, repeated, dense, sparse, and out-of-order world-position queries
  return the same samples.
- Long profiles stay within height and maximum-slope limits without abrupt
  boundary corners.
- A long fixed-seed profile contains ascending, descending, and nearly
  horizontal sections.
- Restart clears transient generation state while reproducing the same opening
  profile and obstacle heights.

### Scoring

- Crossing an obstacle increases score exactly once.
- A dead run cannot continue scoring.
- Restart resets current score but preserves best score.

### State transitions

- Ready plus primary action enters Playing.
- Playing plus collision enters GameOver.
- GameOver does not restart during the input guard.
- Valid restart returns a clean Ready or Playing state according to design.

## Browser tests with Playwright

Keep end-to-end tests small and stable.

Required smoke tests:

1. Page loads without console errors.
2. Canvas is visible and has non-zero dimensions.
3. Start prompt is visible or otherwise detectable.
4. Primary input transitions the game into play.
5. Restart is possible after forcing or waiting for game over.
6. Resizing the viewport keeps the canvas visible.
7. A controlled run advances beyond the flat opening and scores an obstacle.
8. Terrain collision reaches GameOver and restart restores the deterministic
   opening.

Expose a minimal development-only test seam only when visual state cannot be reliably observed. Do not expose mutable production cheats globally without a build guard.

## Manual test checklist

Before declaring a milestone complete, verify:

- Space, mouse, and touch all trigger one jump per press.
- Holding a key does not create uncontrolled repeat input unless intentionally designed.
- Mobile page does not scroll while playing.
- Canvas remains sharp on a high-DPI display.
- The first input starts and jumps in the same action.
- Score is never awarded twice for one obstacle.
- Collision looks fair near corners.
- Restart does not preserve old obstacles or velocity.
- Returning from a hidden tab does not teleport the game forward.
- Sound remains muted when the player chooses mute.
- Production build runs from a static server.

## Performance checks

- Avoid allocating large temporary arrays every frame.
- Avoid creating DOM nodes during gameplay.
- Check that the obstacle count remains bounded.
- Verify stable animation on a mobile-sized viewport.
- Use browser profiling only after a real performance issue appears.

## Acceptance command

Before completing a task that changes code, run the relevant subset and preferably all of:

```bash
npm run lint
npm run test
npm run build
npm run test:e2e
```
