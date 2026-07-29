# Art and Animation Direction

## Visual concept

The first version should use a simple, graphic style that can be drawn directly with Canvas shapes. The presentation should feel intentional rather than like default debug graphics.

Suggested direction:

- A small, expressive jumping character
- Simple silhouette or stick-figure construction
- Strong readability at small size
- Limited visual detail
- Clear separation between player, obstacles, and background
- Smooth motion produced by animation and timing rather than many textures

## Placeholder art

The first playable milestone must work without external image files.

Use Canvas primitives for:

- Player body
- Obstacles
- Sky/background
- Ground or boundary
- Score text
- Start and game-over overlays

This allows gameplay tuning before committing to final assets.

## Player animation

The player should react to motion:

- Rising: body angled slightly upward
- Near apex: neutral pose
- Falling: body angled downward
- Jump input: brief compression or energetic limb pose
- Death: clear but simple tumble or fall

Keep collision independent from decorative limbs or pose changes.

### First player sprite sheet

The first generated player sheet is stored at
`public/assets/sprites/player/player-sheet.png` with metadata beside it in
`player-sheet.json`.

- Six horizontal 96×96 frames: ready, jump, rise, apex, fall, and hit.
- All frames use a shared `(48, 48)` anchor and one normalization scale.
- The source was generated as dark hand-drawn line art on a removable chroma
  background, then exported as an RGBA PNG.
- The reusable prompt and selection notes live in
  `.prompts/player-sprites.md`.
- `scripts/assets/process_player_sheet.py` performs deterministic cropping,
  shared scaling, centering, metadata generation, and contact-sheet output.

The runtime draws the sheet around the authoritative player position. The
16-unit collision radius remains explicit gameplay configuration and does not
expand to include decorative arms, legs, or transparent frame padding. The
Canvas primitive player remains the load-error fallback.

For a stick-figure version, define a small procedural skeleton:

- head
- torso
- two arms
- two legs

Animate joint offsets from a normalized jump phase rather than hand-authoring many bitmap frames.

## Motion guidelines

- Avoid abrupt visual snapping except on intentional impact.
- Ease decorative rotation toward a target based on vertical velocity.
- Keep physics position authoritative.
- Do not delay the visible jump response for animation anticipation.
- Use particles sparingly and only after the game is readable without them.

## Obstacles

Obstacles need a strong silhouette and consistent collision expectation. They may be abstract pillars, industrial structures, walls, branches, or another original theme.

For the MVP:

- Use rectangular collision-aligned shapes.
- Add small decorative caps or highlights only if they do not confuse the hit area.
- Keep gap boundaries visually precise.

### First obstacle body sprite

The obstacle set contains one asset:
`public/assets/sprites/obstacles/obstacle-body.png`, a 64×64 vertically
seamless transparent body tile.

It uses a dark charcoal fill, bold black hand-drawn outline, and minimal
internal wear. Its first and last rows match exactly. The renderer repeats it
at native proportions through each complete 64-unit-wide collision rectangle;
there are no cap, base, damaged, mirrored, rotated, or terrain-specific pieces.
This keeps the sprite silhouette identical to the pre-sprite rectangular
obstacles while terrain still controls their height and gap position. If the
tile fails to load, the original Canvas obstacle drawing is used.

The reusable prompt and selection notes live in
`.prompts/obstacle-sprites.md`. Deterministic extraction, normalization, seam
correction, and full-rectangle preview generation live in
`scripts/assets/process_obstacle_sprites.py`.

## Background

Use two or three depth layers at most:

1. Static or slowly changing sky/background
2. Slow parallax distant shapes
3. Gameplay obstacles and player

The background must remain low contrast compared with hazards.

## UI

- Large score at the top center
- Minimal start prompt
- Game-over panel with current score and best score
- One clear restart instruction
- Sound indicator only when necessary

Use system fonts initially. Avoid loading web fonts for the MVP.

## Asset policy

When image assets are introduced:

- Keep original source files in a documented asset source directory.
- Export browser-ready files separately.
- Record dimensions and intended rendering scale.
- Avoid copyrighted Flappy Bird art or close replicas.
- Use original character and obstacle designs.
