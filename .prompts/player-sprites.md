# Player Sprite Sheet ImageGen Prompt

## Shared Shadowdark-inspired direction

This prompt applies the shared visual rules in
`.prompts/style-shadowdark.md` as an original old-school dark-fantasy tabletop
illustration treatment:

- Strong, slightly rough ink outlines and a compact adventurer silhouette.
- Stylized, tense, and mildly awkward rather than heroic, cute, or realistic.
- Minimal internal shading: one or two hard-edged tone steps plus restrained
  dry-brush or printed-book texture.
- A limited dark palette of near-black ink, charcoal, muted iron grey, and
  restrained desaturated umber or parchment-grey accents.
- Fantasy clothing may be suggested with a simple ragged tunic, belt, hood
  edge, wrist wraps, or boots, but must not obscure the stick-figure motion.
- No weapon, shield, backpack, cape, dangling equipment, or loose accessory
  that could change the apparent centre between frames.
- Preserve a readable silhouette at the final 72-logical-unit draw size.
- Avoid sci-fi styling, glossy rendering, bright saturated color, anime
  proportions, comedy-cartoon styling, and clean corporate vector art.

## Selected generation

- Tool path: built-in ImageGen, followed by local chroma-key removal.
- Style reference: `art/style-explorations/selected-direction.png`
  (study 3 — balanced two-tone).
- Selected result:
  `/home/tomas/.codex/generated_images/019f6a62-16f0-72c1-b1c9-354d8d46dbfa/call_7gFStvZe8jDAae4Vy90ULFPg.png`
- Selection notes: selected on 2026-07-30 because it transfers study 3's
  controlled medium-rough ink, two value steps, lighter parchment-grey
  separation, and sparse grouped hatching to exactly six consistent
  right-facing poses. The generated result required no pose regeneration.
- Raw selected dimensions: 2172×724 pixels, six equal 362×724 source cells.
- Runtime output: 576×96 transparent PNG, six 96×96 frames in one row.

## Reusable generation prompt

```text
Use case: stylized-concept
Asset type: source sprite sheet for a small HTML5 Canvas browser-game player
Input image: use art/style-explorations/selected-direction.png only as the exact visual-style, character-design, palette, line-treatment, and material reference; do not include its obstacles or terrain.
Primary request: Create exactly six animation poses of one identical minimal side-view stick-figure character, arranged left-to-right in one horizontal row in this exact semantic order: neutral ready floating pose; compressed jump impulse pose; upward rise pose with limbs trailing; suspended apex pose; downward fall pose with reacting limbs; disrupted hit/game-over pose.
Scene/backdrop: perfectly flat solid #00ff00 chroma-key background for background removal. The background must be one uniform color with no shadows, gradients, texture, floor plane, reflections, or lighting variation.
Subject: match the selected study's compact right-facing hooded stick-figure adventurer: blank dark face opening with only a tiny profile cue, short ragged tunic, narrow belt, wrapped forearms and lower legs, and simple boots. Keep anatomy iconic and simplified. No weapon, shield, backpack, cape, dangling equipment, or loose accessory. Preserve the same character identity, head size, limb proportions, clothing silhouette, outline thickness, apparent scale, and visual centre in all six frames.
Style/medium: match study 3's balanced readable two-tone old-school dark-fantasy tabletop ink style. Use medium controlled hand-drawn line roughness, bold continuous near-black outer silhouettes, exactly two hard-edged interior value steps, medium charcoal and muted iron-grey fills, restrained warm parchment-grey and desaturated umber accents, and sparse grouped crosshatching only inside broad forms. Keep limbs, face edge, and exterior contours quiet and readable when reduced into a 96 by 96 pixel game frame and drawn at 72 logical units.
Composition/framing: six evenly spaced equal square pose areas across a single horizontal row. One complete character centred within each area with generous, consistent padding. No overlap between poses. Keep all heads at a consistent apparent scale and all bodies centered around the same anchor location.
Constraints: exactly six characters/poses total; exact order ready, jump, rise, apex, fall, hit; every pose faces right; all character pixels separated cleanly from the green background; do not use #00ff00 or any green in the character; no cast shadow, contact shadow, reflection, floor, or antialiased green interior detail; preserve a compact collision-readable silhouette even though collision remains code-defined.
Avoid: frame labels, text, letters, numbers, borders, panel lines, grid lines, guide lines, arrows, scenery, UI, icons, extra objects, extra limbs, extra characters, detailed facial features, X-shaped eyes, impact rays, blood, gore, watermark, signature, sci-fi elements, glossy lighting, photorealism, soft blurry rendering, anime proportions, cartoon-comedy styling, bright saturated color, clean corporate vector styling.
```

## Post-processing

1. Remove the flat chroma background with the installed ImageGen
   `remove_chroma_key.py` helper using border key detection, soft matte,
   despill, and one-pixel edge contraction.
2. Divide the alpha source into six equal columns.
3. Retain the largest connected alpha component in each source cell to discard
   isolated generation debris, then detect each pose's bounds and remove source
   padding.
4. Compute one shared scale from the largest pose bounds; do not independently
   scale frames.
5. Centre every pose on the shared `(48, 48)` anchor in a 96×96 transparent
   frame.
6. Remove only isolated alpha components smaller than 64 pixels after
   normalization; this clears generated specks without changing any connected
   character silhouette.
7. Export the six frames as one 576×96 optimized RGBA PNG and write matching
   rectangle/anchor metadata.
8. Generate a temporary checkerboard contact sheet for inspection, then delete
   temporary processing files after validation.

The accepted normalization used the generated source without manual paint
edits. The normalized alpha bounds are centred within half a pixel of the
shared anchor in every frame. The widest/tallest pose uses the common 80-pixel
content envelope; smaller poses retain their relative scale instead of being
enlarged independently.

The deterministic normalization command is:

```bash
python3 scripts/assets/process_player_sheet.py \
  --input <alpha-source.png> \
  --sheet-output public/assets/sprites/player/player-sheet.png \
  --metadata-output public/assets/sprites/player/player-sheet.json \
  --preview-output <temporary-contact-sheet.png>
```
