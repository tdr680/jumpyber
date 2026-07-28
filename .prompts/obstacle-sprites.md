# Modular Obstacle Sprite ImageGen Prompt

## Selected generation

- Tool path: built-in ImageGen, followed by local chroma-key removal.
- Selected result:
  `/home/tomas/.codex/generated_images/019f6a62-16f0-72c1-b1c9-354d8d46dbfa/call_LoM3U9tE84vVXPe25gkyLhp2.png`
- Raw selected dimensions: 1774×887 pixels.
- Selection notes: the result has one coherent charcoal industrial style,
  consistent outline weight, neutral lighting, matching normal/damaged cap
  silhouettes, a clean central body section, and a base with a compatible
  connector. The generator combined stems with the cap and base, so the useful
  component regions were extracted instead of treating the broad columns as
  finished sprites.
- Runtime outputs: cap 96×48, body 64×64, base 96×48, and damaged cap
  96×48, all transparent RGBA PNGs.

## Reusable generation prompt

```text
Use case: stylized-concept
Asset type: high-resolution source sheet for modular 2D browser-game obstacle sprites
Primary request: Create exactly four separate industrial post / pipe barrier components arranged in one horizontal row with generous separation: (1) a gap-facing end cap for a lower obstacle, with a straight 64-unit-wide central post connection entering from the bottom and a wider sturdy lip facing upward; (2) a straight vertical repeatable body section whose top and bottom cuts are perfectly matching and tile seamlessly, same 64-unit central width, with no top or bottom termination; (3) a terrain base with the same straight central post connection entering from the top and a slightly wider, flat neutral footing at the bottom, with no terrain angle baked in; (4) a restrained damaged variation of component 1 with exactly the same outer dimensions and collision silhouette, only a few small internal scratches or dents.
Scene/backdrop: perfectly flat solid #00ff00 chroma-key background for later removal; one uniform color with no gradients, texture, floor plane, or variation.
Style/medium: minimalist hand-inked game sprite components, schematic industrial pipe/post, slightly imperfect hand-drawn geometry, bold nearly-black outline, dark charcoal-gray fill, extremely limited internal detail, worn but functional, clear silhouette at small size.
Composition/framing: four isolated components only, equal visual scale, upright, aligned along one horizontal row, generous green padding around every component, no overlap. Cap and base should be wider than the body but their central connection widths must visually match the body exactly. Keep every component fully visible.
Lighting/mood: flat unlit graphic art; no directional lighting so vertical mirroring remains visually correct.
Color palette: black outline and dark neutral charcoal-gray fills only; do not use green in the components.
Constraints: exactly four components; consistent bold outline thickness; body side edges parallel; body top edge and bottom edge must have identical pixel-ready continuation; cap 1 and damaged cap 4 must share the same silhouette; no cast shadow, no contact shadow, no reflection, no transparency illusion.
Avoid: text, labels, numbers, symbols, warning marks, borders, cell dividers, arrows, guide lines, scenery, characters, UI, perspective, dramatic lighting, bevel shine, rust colors, loose debris, plants, smoke, separate screws protruding beyond silhouette, top or bottom termination on the body tile.
```

## Post-processing

1. Remove the flat chroma background with the installed ImageGen
   `remove_chroma_key.py` helper using border key detection, a soft matte, and
   despill.
2. Extract the useful cap, uninterrupted body, base, and damaged-cap regions
   with the selected source's documented pixel crops.
3. Remove transparent source padding and normalize to the fixed runtime sizes.
4. Keep the cap's connector flush with its bottom edge and the base's connector
   flush with its top edge.
5. Average and ease the body tile's boundary rows so its top and bottom pixels
   match exactly. Runtime repeats the tile rather than stretching it.
6. Export optimized transparent RGBA PNGs.
7. Generate temporary checkerboard previews for short and tall assemblies and
   for ascending, flat, and descending terrain. Delete the previews and
   chroma-key intermediates after inspection.

The upper obstacle reuses vertically mirrored cap and base assets. The neutral
palette and lack of directional lighting make mirroring safe. The body does not
need mirroring.

The deterministic normalization command is:

```bash
python3 scripts/assets/process_obstacle_sprites.py \
  --source <alpha-source.png> \
  --output-dir public/assets/sprites/obstacles \
  --preview-dir <temporary-preview-directory>
```
