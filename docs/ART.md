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
