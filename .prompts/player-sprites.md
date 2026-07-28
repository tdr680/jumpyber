# Player Sprite Sheet ImageGen Prompt

## Selected generation

- Tool path: built-in ImageGen, followed by local chroma-key removal.
- Selected result:
  `/home/tomas/.codex/generated_images/019f6a62-16f0-72c1-b1c9-354d8d46dbfa/call_nbFiQvuSIS5W4KZchKDDkEHz.png`
- Selection notes: the second result preserves the first clean six-pose layout
  while removing X-shaped eyes and impact marks from the hit pose. All poses
  face right and use the same minimal dark line-art character.
- Raw selected dimensions: 2172×724 pixels, six equal 362×724 source cells.
- Runtime output: 576×96 transparent PNG, six 96×96 frames in one row.

## Reusable generation prompt

```text
Use case: stylized-concept
Asset type: source sprite sheet for a small HTML5 Canvas browser-game player
Primary request: Create exactly six animation poses of one identical minimal side-view stick-figure character, arranged left-to-right in one horizontal row in this exact semantic order: neutral ready floating pose; compressed jump impulse pose; upward rise pose with limbs trailing; suspended apex pose; downward fall pose with reacting limbs; disrupted hit/game-over pose.
Scene/backdrop: perfectly flat solid #00ff00 chroma-key background for background removal. The background must be one uniform color with no shadows, gradients, texture, floor plane, reflections, or lighting variation.
Subject: one slightly awkward, active stick-figure person facing right in every pose. Circular head, simple torso and limbs, no realistic anatomy, no detailed face. A tiny minimal nose/profile cue is acceptable solely to establish right-facing direction. Same character identity, same head size, same limb proportions, same dark line thickness, same apparent scale, and same visual centre in all six frames.
Style/medium: crisp minimal hand-drawn 2D line art, black or very dark charcoal, consistent rounded stroke, readable when reduced into a 96 by 96 pixel game sprite. Energetic and slightly awkward, not heroic or polished.
Composition/framing: six evenly spaced equal square pose areas across a single horizontal row. One complete character centred within each area with generous, consistent padding. No overlap between poses. Keep all heads at a consistent apparent scale and all bodies centered around the same anchor location.
Constraints: exactly six characters/poses total; exact order ready, jump, rise, apex, fall, hit; fully opaque dark line art separated cleanly from the green background; do not use #00ff00 or any green in the character; no cast shadow, no contact shadow, no antialiased green interior details.
Avoid: frame labels, text, letters, numbers, borders, panel lines, grid lines, guide lines, arrows, scenery, UI, icons, extra objects, extra limbs, extra characters, color fills, detailed facial features, watermark, signature.
```

## Targeted edit prompt

```text
Edit only the sixth, rightmost hit/game-over pose. Preserve the first five poses exactly, preserve all spacing, proportions, line thickness, right-facing direction, and the perfectly flat solid #00ff00 background. On the sixth pose, remove the X-shaped eyes and remove every radiating impact/emphasis line around the head. Give the head no eyes and no detailed facial features, matching the blank minimal face style of the other five poses. Keep the sixth body clearly disrupted and awkward through limb pose alone. Do not add any text, labels, borders, symbols, scenery, shadow, or new marks.
```

## Post-processing

1. Remove the flat chroma background with the installed ImageGen
   `remove_chroma_key.py` helper using border key detection, soft matte,
   despill, and one-pixel edge contraction.
2. Divide the alpha source into six equal columns.
3. Detect each pose's alpha bounds and remove source padding.
4. Compute one shared scale from the largest pose bounds; do not independently
   scale frames.
5. Centre every pose on the shared `(48, 48)` anchor in a 96×96 transparent
   frame.
6. Export the six frames as one 576×96 optimized RGBA PNG and write matching
   rectangle/anchor metadata.
7. Generate a temporary checkerboard contact sheet for inspection, then delete
   temporary processing files after validation.

The deterministic normalization command is:

```bash
python3 scripts/assets/process_player_sheet.py \
  --input <alpha-source.png> \
  --sheet-output public/assets/sprites/player/player-sheet.png \
  --metadata-output public/assets/sprites/player/player-sheet.json \
  --preview-output <temporary-contact-sheet.png>
```
