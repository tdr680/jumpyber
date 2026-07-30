# Obstacle Body Sprite ImageGen Prompt

## Shared Shadowdark-inspired direction

This prompt applies the shared visual rules in
`.prompts/style-shadowdark.md` as an original old-school dark-fantasy tabletop
illustration treatment:

- Strong near-black ink outlines with a slightly rough hand-drawn contour.
- A grim dungeon or ruined-fortification material language: dark masonry and
  restrained iron reinforcement.
- Minimal one- or two-step shading and mild printed-book texture.
- A compact rectangular silhouette that communicates the exact collision
  width at small size.
- Interior cracks, seams, and wear remain sparse enough to survive 64×64
  normalization and vertical repetition.
- Avoid protruding spikes, rubble, caps, feet, or broken edges that would imply
  collision outside or inside the authoritative rectangle.
- Avoid sci-fi machinery, glossy rendering, bright saturated color, comedy
  styling, and clean corporate vector art.

## Selected generation

- Tool path: built-in ImageGen, followed by local chroma-key removal.
- Style reference: `art/style-explorations/selected-direction.png`
  (study 3 — balanced two-tone).
- Selected result:
  `/home/tomas/.codex/generated_images/019f6a62-16f0-72c1-b1c9-354d8d46dbfa/call_MCV8ipS9i69xpE1ggPgg06iM.png`
- Selection notes: selected on 2026-07-30 because it transfers study 3's
  balanced two-tone masonry to one uninterrupted constant-width body with no
  cap, base, crossband, protrusion, or crushed dark values.
- Raw selected dimensions: 887×1774 pixels.
- Selected region: `(259, 912, 627, 1280)`, a square central body section.
  This was the strongest central candidate for matching upper and lower texture
  bands before deterministic seam easing.
- Runtime output: one 64×64 transparent RGBA body tile.

## Reusable generation prompt

```text
Use case: stylized-concept
Asset type: repeatable 2D browser-game obstacle body tile
Input image: use art/style-explorations/selected-direction.png only as the exact visual-style, palette, line-treatment, masonry, and iron-material reference; do not include its player, terrain, obstacle caps, crossbands, gap layout, or complete pillar endings.
Primary request: Create one very tall uninterrupted midsection of a straight iron-edged dark-fantasy masonry pillar. It must have parallel outer sides and visibly continue through the top and bottom so a central section can tile vertically without a visible seam. It has no cap, base, footing, lip, flange, termination, crossband, damaged variation, symbols, or labels.
Scene/backdrop: perfectly flat solid #00ff00 chroma-key background for later removal; one uniform color with no gradients, texture, floor plane, or lighting variation.
Style/medium: match study 3's balanced readable two-tone old-school dark-fantasy tabletop ink style. Use medium controlled hand-drawn line roughness, bold continuous near-black outer edges, exactly two hard-edged interior value steps, medium charcoal stone, muted iron grey, restrained warm parchment-grey and desaturated umber accents, and sparse grouped hatching only inside broad stones. Keep the exterior silhouette quiet and unmistakable at 64 by 64 pixels.
Composition/framing: one isolated upright rectangular pillar midsection with generous green padding. Both vertical edges remain parallel and nearly straight. The upper and lower portions must visibly continue beyond the crop rather than terminate; reserve a long uninterrupted middle region suitable for deterministic extraction as a repeating tile.
Lighting/mood: flat, moody ink illustration with no directional lighting, highlights, glow, or cast shadow so the tile can be reused and mirrored without contradiction.
Color palette: near-black ink, medium charcoal stone, muted iron grey, and restrained desaturated umber or warm parchment-grey accents only; do not use #00ff00 or any green in the obstacle.
Materials/textures: broad staggered masonry joints, continuous iron edge strips, sparse hatching, and mild printed-book grain confined inside the silhouette. Details should remain quiet and isolated; no full-width horizontal decorative band may reveal the repetition seam.
Constraints: consistent bold outline thickness; full, compact rectangular collision-readable width; no protrusion or deep side indentation; no detail that creates a top/bottom termination or obvious horizontal seam; no cast shadow, contact shadow, reflection, or transparency illusion.
Avoid: caps, bases, feet, lips, flanges, damaged variants, spikes protruding beyond the sides, broken silhouette, rubble, text, labels, numbers, symbols, warning marks, borders, arrows, guide lines, scenery, characters, UI, perspective, dramatic lighting, saturated rust, debris, plants, smoke, sci-fi machinery, glossy rendering, photorealism, soft blurry rendering, cartoon-comedy styling, bright saturated color, and clean corporate vector styling.
```

## Post-processing

1. Remove the flat chroma background with the installed ImageGen
   `remove_chroma_key.py` helper using border key detection, a soft matte,
   despill, and one-pixel edge contraction.
2. Extract the documented uninterrupted square body region and remove source
   padding.
3. Normalize it to one 64×64 transparent RGBA tile.
4. Average and ease the boundary rows so the first and last rows match exactly.
5. Generate a temporary preview that tiles the body through complete top and
   bottom collision rectangles with several terrain-following gap positions.
6. Delete the preview and chroma-key intermediates after inspection.

The accepted preview covers short and tall upper and lower rectangles on
ascending, descending, and reversing terrain. The repeated seam is not visible
at runtime scale; the masonry pattern does repeat, but its low contrast keeps
that compromise secondary to the exact gameplay silhouette.

The deterministic normalization command is:

```bash
python3 scripts/assets/process_obstacle_sprites.py \
  --source <alpha-source.png> \
  --output-dir public/assets/sprites/obstacles \
  --preview-dir <temporary-preview-directory>
```
