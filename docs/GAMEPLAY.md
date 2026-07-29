# Gameplay Specification

## Coordinate system

Use a fixed logical game world and scale it to the browser viewport.

Recommended starting size:

```text
Width: 400 logical pixels
Height: 600 logical pixels
```

This is a tuning recommendation, not a hard architectural dependency. All gameplay values should be defined in logical units.

Horizontal travel uses world coordinates. The player remains at a stable
logical screen `x`, while `worldDistance` advances by obstacle scroll speed
multiplied by elapsed seconds. A visible screen coordinate maps to
`worldX = worldDistance + screenX`.

## Procedural terrain

The playable passage follows a deterministic procedural centreline:

- A run starts with a configured horizontal opening.
- The opening blends gradually into procedural motion.
- Seeded one-dimensional gradient noise controls target slope rather than
  assigning independent random heights.
- Integrating that low-frequency slope produces long ascending, descending,
  and nearly horizontal sections with smooth reversals.
- Slope is measured as vertical logical world units per horizontal logical
  world unit. Negative slopes rise visually and positive slopes descend because
  Canvas `y` increases downward.
- Spatial smoothing and fixed-distance integration make the result independent
  of display frame rate and render sampling density.
- Centre and boundary bias weaken outward motion near the configured height
  limits and turn the terrain inward without visible hard-clamp plateaus.

The upper and lower world boundaries are parallel offsets from this centreline.
The camera remains fixed in Milestone 1.5.

## Game states

### Ready

- Player is visible near the left third of the screen.
- Obstacles may be visible but the world is not advancing.
- A small idle animation is allowed.
- Any primary action begins the run and performs the first jump.

### Playing

- Gravity and movement are active.
- Obstacles scroll left.
- New obstacles spawn as needed.
- Passing obstacles increases score.
- Primary action applies an upward impulse.

### Game over

- Further scoring stops.
- The Milestone 1 world freezes immediately on collision.
- Current score is displayed; best score is deferred until Milestone 2.
- Primary action restarts after a 250 ms input guard, resets all transient run state, and applies the first jump of the new run.

## Controls

All of these trigger the same abstract `primaryAction`:

- Space
- Arrow Up
- W
- Left mouse button or pointer press on the canvas
- Touch press on the canvas

Optional secondary controls:

- M toggles sound
- P or Escape pauses, only after the basic game is stable

Prevent browser scrolling for gameplay keys only while the game canvas is active.

## Player physics

Suggested initial values:

```text
gravity: 1500 units/s²
jumpVelocity: -460 units/s
maxFallVelocity: 800 units/s
playerX: 110 units
playerRadius: 16 units
```

These are starting values. Keep them centralized and tune through playtesting.

Each primary action while playing sets or approaches the upward velocity. Start with directly assigning `jumpVelocity`; more advanced impulse accumulation is unnecessary for the MVP.

The visual player pose is selected independently from collision:

- Ready uses the neutral frame.
- A strong fresh upward velocity uses jump.
- Sustained upward velocity uses rise.
- A broad near-zero velocity band uses apex to prevent flicker.
- Downward velocity uses fall.
- GameOver uses hit.

The sprite is centred on the simulation position with a shared frame anchor.
Physics and the collision circle do not change with animation pose.

## Obstacles

Each obstacle is a pair of solid regions separated by a vertical gap.

Suggested starting values:

```text
obstacleWidth: 64 units
gapHeight: 155 units
scrollSpeed: 170 units/s
horizontalSpacing: 220 units
minimumTopClearance: 60 units
minimumBottomClearance: 80 units
```

Obstacle gaps are centred on the terrain sample at the obstacle's world-space
centre. They do not receive independent vertical randomness. As procedural
terrain rises and falls, the complete top and bottom obstacle rectangles and
the gap's vertical position vary with it. Terrain minimum and maximum heights
preserve the configured top and bottom clearances.

Represent an obstacle pair as one gameplay object containing:

- world-space x position
- sampled terrain height at the obstacle centre
- gap size
- width
- scored flag

Screen x is derived by subtracting `worldDistance`. Reuse obstacle objects or
recycle them forward after they leave the screen, resampling the same
deterministic terrain profile at their new world position.

The obstacle body sprite is presentation-only. One seamless 64×64 tile fills
the complete top and bottom collision rectangles. There are no separate caps,
bases, or variations, so rendering preserves the same varying heights and
terrain-following gap position as the Canvas placeholders without changing
spacing, gap size, collision, scoring, or recycling.

## Collision

For the first version:

- Treat the player as a circle.
- Treat obstacle sections as axis-aligned rectangles.
- Test circle-versus-rectangle collision.
- Treat contact with either terrain-following passage boundary as fatal.

The visible player body and collision shape should closely match. A slightly forgiving hitbox is acceptable, but document it in configuration.

Obstacle rendering and circle-versus-rectangle collision use one shared
rectangle calculation based on the stored terrain-derived gap centre. Passage
collision uses the terrain height and local slope at the player's world
position, so sloped visible boundaries do not behave like invisible horizontal
walls.

## Scoring

- Add one point when the trailing edge of an unscored obstacle passes the player's horizontal center.
- Mark that obstacle as scored immediately.
- Best-score storage and safe `localStorage` handling are scheduled for Milestone 2.

## Difficulty

The MVP should use stable difficulty. Once the basic feel is proven, difficulty may increase gradually through one or more of:

- Slightly faster scrolling
- Slightly smaller gaps
- Mild variation in obstacle spacing

Avoid changing several variables at once. Cap all difficulty changes so the game remains physically possible.

## Feedback

On jump:

- Immediate motion response
- Brief pose or rotation change
- Optional quiet sound

On score:

- Small visual pulse
- Optional sound

On collision:

- Clear impact feedback
- Stop scoring immediately
- Optional screen shake of very low magnitude
- Distinct sound

Feedback must not obscure obstacle readability.

## Pause and visibility

When the browser tab becomes hidden:

- Pause the simulation.
- Reset the frame-time accumulator on return.
- Do not allow a huge delta to advance the world.

## Seed and restart

The terrain seed is explicit in typed configuration. The gradient-noise value
and terrain sample at a given world position are functions of that seed and
position, not `Math.random()` or elapsed frames. Restart resets world distance,
the deterministic terrain cache, obstacles, score, player motion, and transient
state while retaining the configured seed. The opening course therefore
repeats exactly after restart.

## Tuning rule

Do not scatter numeric gameplay constants across classes. Every tuning value belongs in a typed configuration object.
