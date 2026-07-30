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

### Shared generated-sprite style

Generated gameplay sprites use an original old-school dark-fantasy tabletop
illustration treatment, following `.prompts/style-shadowdark.md`:

- Strong near-black ink outlines with a slightly rough hand-drawn character.
- Compact, iconic silhouettes that remain readable at runtime scale.
- Minimal hard-edged shading in one or two tone steps.
- Restrained dry-brush, crosshatch, or printed-book texture inside silhouettes.
- A limited palette of charcoal, muted iron grey, desaturated umber, and
  parchment-grey accents.
- Grim and tense rather than glossy, heroic, comedic, photorealistic, or
  anime-styled.

The style is applied within each asset's existing gameplay contract. It does
not add visual protrusions that contradict collision, change player anchors, or
replace the shared terrain and obstacle geometry.

### Style exploration selection

Four fixed-composition studies in `art/style-explorations/` compare clean ink,
rough ink, balanced two-tone, and deep-texture treatments at reduced game
scale. The comparison tests each transparent study against light parchment and
dark slate backgrounds.

The selected reference is **study 3 — balanced two-tone**:

- medium, controlled contour roughness;
- continuous near-black outer silhouettes;
- two hard-edged value steps;
- medium charcoal with muted parchment-grey and umber accents;
- sparse grouped crosshatching inside broad forms;
- quiet detail around limbs, obstacle gap edges, and terrain contours.

It is more consistently readable across both backgrounds than the cleaner but
quieter study 1, the busier rough study 2, or the atmospheric but overly dark
study 4. The runtime player and obstacle body now use this selected treatment.

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
- The source is the study 3 compact hooded adventurer rendered with controlled
  medium-rough ink, two value steps, muted parchment-grey separation, and
  sparse grouped hatching on a removable chroma background, then exported as
  an RGBA PNG.
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

It depicts the study 3 iron-edged masonry midsection with medium charcoal and
parchment-grey two-tone blocks, controlled ink outlines, and sparse grouped
hatching. Its first and last rows match exactly. The renderer repeats it at
native proportions through each complete 64-unit-wide collision rectangle;
there are no cap, base, crossband, damaged, mirrored, rotated, or
terrain-specific pieces. This keeps the sprite silhouette identical to the
pre-sprite rectangular obstacles while terrain still controls their height and
gap position. If the tile fails to load, the original Canvas obstacle drawing
is used.

The reusable prompt and selection notes live in
`.prompts/obstacle-sprites.md`. Deterministic extraction, normalization, seam
correction, and full-rectangle preview generation live in
`scripts/assets/process_obstacle_sprites.py`.

## Background

The first sprite-based background uses the same balanced two-tone study as the
gameplay sprites, but with deliberately lower contrast and opacity:

1. The static Canvas sky gradient supplies broad color and remains the
   load-error fallback.
2. A pale far-mist strip moves at 2.5% of world speed.
3. A distant ruined skyline moves at 7% of world speed.
4. Low midground walls and arches move at 15% of world speed.
5. Authoritative terrain, obstacles, player, and interface render above every
   decorative layer.

The three transparent strips live in
`public/assets/sprites/background/`. They are modular 768-pixel-wide assets,
repeat with zero spacing, and have normalized matching edge columns. Their
large silhouettes and sparse internal texture preserve the selected
Shadowdark-inspired print treatment without competing with the small player or
the collision-aligned obstacle openings.

The background must remain low contrast compared with hazards. Decorative
ruins should stay broad and low enough that they cannot be mistaken for
obstacles, and background motion must remain driven by scrolling rather than
unrelated animation. Reusable prompts and selected-generation notes live in
`.prompts/background-sprites.md`; deterministic alpha normalization and seam
easing live in `scripts/assets/process_background_sprites.py`.

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
