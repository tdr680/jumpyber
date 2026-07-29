# Obstacle Body Sprite ImageGen Prompt

## Selected generation

- Tool path: built-in ImageGen, followed by local chroma-key removal.
- Selected result:
  `/home/tomas/.codex/generated_images/019f6a62-16f0-72c1-b1c9-354d8d46dbfa/call_LoM3U9tE84vVXPe25gkyLhp2.png`
- Raw selected dimensions: 1774×887 pixels.
- Selected region: the uninterrupted straight body section from the generated
  source. The cap, base, and damaged variation were intentionally removed from
  the runtime design.
- Runtime output: one 64×64 transparent RGBA body tile.

## Reusable generation prompt

```text
Use case: stylized-concept
Asset type: repeatable 2D browser-game obstacle body tile
Primary request: Create one straight vertical industrial post or pipe body section. It must have parallel sides and identical top and bottom cuts so it tiles vertically without a visible seam. It has no top cap, bottom cap, base, termination, damaged variation, symbols, or labels.
Scene/backdrop: perfectly flat solid #00ff00 chroma-key background for later removal; one uniform color with no gradients, texture, floor plane, or lighting variation.
Style/medium: minimalist hand-inked game sprite, schematic industrial pipe/post, slightly imperfect hand-drawn geometry, bold nearly-black outline, dark charcoal-gray fill, extremely limited internal detail, worn but functional, clear at small size.
Composition/framing: one isolated upright rectangular body tile with generous green padding. Both vertical edges are parallel. The top and bottom must continue seamlessly.
Lighting/mood: flat unlit graphic art with no directional lighting.
Color palette: black outline and dark neutral charcoal-gray fill only; do not use green in the obstacle.
Constraints: consistent bold outline thickness; no detail that becomes visibly stretched or creates a horizontal seam; no cast shadow, contact shadow, reflection, or transparency illusion.
Avoid: caps, bases, feet, lips, flanges, damage variants, text, labels, numbers, symbols, warning marks, borders, arrows, guide lines, scenery, characters, UI, perspective, dramatic lighting, rust colors, debris, plants, and smoke.
```

## Post-processing

1. Remove the flat chroma background with the installed ImageGen
   `remove_chroma_key.py` helper using border key detection, a soft matte, and
   despill.
2. Extract the uninterrupted body region and remove source padding.
3. Normalize it to one 64×64 transparent RGBA tile.
4. Average and ease the boundary rows so the first and last rows match exactly.
5. Generate a temporary preview that tiles the body through complete top and
   bottom collision rectangles with several terrain-following gap positions.
6. Delete the preview and chroma-key intermediates after inspection.

The deterministic normalization command is:

```bash
python3 scripts/assets/process_obstacle_sprites.py \
  --source <alpha-source.png> \
  --output-dir public/assets/sprites/obstacles \
  --preview-dir <temporary-preview-directory>
```
