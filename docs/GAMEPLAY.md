# Gameplay Specification

## Coordinate system

Use a fixed logical game world and scale it to the browser viewport.

Recommended starting size:

```text
Width: 400 logical pixels
Height: 600 logical pixels
```

This is a tuning recommendation, not a hard architectural dependency. All gameplay values should be defined in logical units.

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
- The character may briefly continue with death physics.
- Current and best score are displayed.
- Primary action restarts after a short input guard, preventing the death-causing tap from also restarting.

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

Obstacle gaps should be randomly positioned inside safe vertical limits. Randomness should not create impossible layouts.

Represent an obstacle pair as one gameplay object containing:

- x position
- gap center or top
- gap size
- width
- scored flag

Reuse obstacle objects or recycle them after they leave the screen.

## Collision

For the first version:

- Treat the player as a circle.
- Treat obstacle sections as axis-aligned rectangles.
- Test circle-versus-rectangle collision.
- Treat the ceiling and floor as fatal boundaries unless later design changes say otherwise.

The visible player body and collision shape should closely match. A slightly forgiving hitbox is acceptable, but document it in configuration.

## Scoring

- Add one point when the player crosses the trailing or center line of an unscored obstacle.
- Mark that obstacle as scored immediately.
- Store best score in `localStorage`.
- Handle unavailable or malformed local storage safely.

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

## Tuning rule

Do not scatter numeric gameplay constants across classes. Every tuning value belongs in a typed configuration object.
