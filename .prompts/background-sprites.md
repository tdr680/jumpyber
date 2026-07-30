# Background Sprite ImageGen Prompts

## Shared purpose and style

These assets form a restrained decorative parallax background for the Canvas
game. They follow `.prompts/style-shadowdark.md` and the selected
`art/style-explorations/selected-direction.png` study:

- medium, controlled hand-drawn ink roughness;
- near-black contours with one or two hard-edged value steps;
- muted charcoal, iron-grey, parchment-grey, and desaturated umber;
- sparse grouped hatching and mild old printed-book texture;
- broad, readable shapes that remain quieter than the player and obstacles;
- no glossy light, soft blur, text, symbols, UI, characters, or gameplay
  geometry.

All generated subjects sit on a perfectly flat `#00ff00` chroma background.
The background contains no gradient, shadow, texture, reflection, or floor
plane, and the subject never uses the key color.

## Intended layer structure

Layers render in this back-to-front order:

1. `far-mist.png` — pale distant mist, 768×128 RGBA.
2. `far-skyline.png` — distant crags and sparse ruined towers, 768×128 RGBA.
3. `midground-ruins.png` — low walls, arches, and rocky heaps, 768×144 RGBA.
4. Gameplay terrain, obstacles, player, and interface remain above every
   decorative layer.

Each strip is transparent outside its subject, repeats horizontally with zero
configured spacing, and has identical first and last pixel columns after
normalization. The sky remains a code-drawn gradient, both as the base behind
transparent sprites and as the load-error fallback.

## Selected generations

All three selected sources were generated with built-in ImageGen on 2026-07-30
using `art/style-explorations/selected-direction.png` only as a visual-style
reference.

- Far mist:
  `/home/tomas/.codex/generated_images/019f6a62-16f0-72c1-b1c9-354d8d46dbfa/call_NH2YsePFV7f9QuTAn1NTTrUB.png`
- Far skyline:
  `/home/tomas/.codex/generated_images/019f6a62-16f0-72c1-b1c9-354d8d46dbfa/call_f74iuXoWYLvkT5jrpjXDLxnL.png`
- Midground ruins:
  `/home/tomas/.codex/generated_images/019f6a62-16f0-72c1-b1c9-354d8d46dbfa/call_67jHM2qHsCDFExUrtSIoj0VP.png`

Each selected source is 2172×724. The mist was selected for its pale layered
silhouette and quiet grouped hatching. The skyline was selected for its
distributed low landmarks and compatible edge heights. The midground was
selected for its broad arches and low masonry profile, which reads as scenery
without resembling the collision-aligned obstacle columns.

## Reusable far-mist prompt

```text
Use case: stylized-concept
Asset type: modular transparent-background far-mist sprite strip for a small HTML5 Canvas side-scrolling game
Input image: use art/style-explorations/selected-direction.png only as the exact visual-style, palette, ink treatment, roughness, and old printed-book reference; do not copy its player, pillars, or terrain.
Primary request: Create one wide continuous horizontal bank of distant fantasy mist and low clouds, designed as a subtle reusable parallax strip. The forms should overlap in a restrained rhythm and continue naturally through both the left and right image edges so a central wide crop can repeat horizontally.
Scene/backdrop: perfectly flat solid #00ff00 chroma-key background for background removal. The background must be one uniform color with no shadows, gradients, texture, reflections, floor plane, or lighting variation.
Style/medium: selected study 3's balanced two-tone old-school dark-fantasy tabletop ink illustration: medium controlled hand-drawn roughness, strong but understated near-black contour fragments, one or two hard-edged value steps, sparse grouped hatching, mild parchment print texture, no soft blurry airbrush rendering.
Composition/framing: very wide landscape strip, mist concentrated in the lower half with generous green transparency space above, no single focal object, no isolated foreground object, no hard frame or border. Both horizontal edges must contain compatible continuing mist forms with similar height and density. Keep the silhouette low-contrast and readable after downscaling.
Color palette: subdued light parchment-grey, cool blue-grey, muted iron-grey, and tiny charcoal ink accents only; visibly lighter and lower contrast than gameplay sprites. Do not use #00ff00 or any green in the artwork.
Constraints: one connected/repeating atmospheric layer; crisp opaque graphic shapes suitable for chroma-key extraction; no semitransparent smoke effects; no directional lighting; no cast shadow; no text; no symbols; no characters; no obstacles; no terrain collision line.
Avoid: gradient background, scenery panel, UI, labels, letters, numbers, borders, watermark, signature, bright saturated colors, pure-white high contrast, photorealism, soft blur, glossy effects, dramatic lighting, particles, stars, rain, sci-fi, cartoon comedy, clean corporate vector art.
```

## Reusable far-skyline prompt

```text
Use case: stylized-concept
Asset type: modular transparent-background far-skyline sprite strip for a small HTML5 Canvas side-scrolling game
Input image: use art/style-explorations/selected-direction.png only as the exact visual-style, limited palette, ink treatment, roughness, ruin language, and old printed-book reference; do not include its player or obstacle pair.
Primary request: Create one wide continuous distant dark-fantasy skyline silhouette made of low rolling crags, sparse broken dungeon towers, ruined battlements, and a few thin distant arches. It is a decorative far-background parallax strip, not gameplay geometry. The skyline must continue naturally through both the left and right edges for horizontal repetition.
Scene/backdrop: perfectly flat solid #00ff00 chroma-key background for background removal. The background must be one uniform color with no shadows, gradients, texture, reflections, floor plane, or lighting variation.
Style/medium: selected study 3's balanced two-tone old-school dark-fantasy tabletop ink illustration: medium controlled hand-drawn roughness, strong but restrained near-black ink contours, one or two hard-edged value steps, sparse grouped crosshatching, mild parchment print texture, no soft blurry rendering.
Composition/framing: very wide landscape strip. A low irregular skyline occupies approximately the lower half, with generous empty green space above. Use multiple modest landmarks distributed evenly; no dominant castle, no focal scene, no very tall tower. A continuous solid base reaches the bottom edge. Both horizontal edges should end at a compatible low hill height and texture density.
Color palette: subdued cool slate-grey, medium charcoal, muted iron-grey, restrained parchment-grey accents, and near-black ink; lighter and lower contrast than player and obstacle sprites. Do not use #00ff00 or any green in the artwork.
Constraints: one reusable continuous silhouette strip; crisp opaque graphic forms suitable for chroma-key extraction; sparse interior detail; no directional lighting; no cast shadow; no text; no symbols; no characters; no playable obstacles; no terrain collision line.
Avoid: a complete framed landscape, separate floating islands, modern city skyline, labels, letters, numbers, borders, watermark, signature, bright saturated colors, glowing windows, dramatic lighting, fire, smoke, particles, photorealism, soft blur, glossy effects, sci-fi, cartoon comedy, clean corporate vector art.
```

## Reusable midground-ruins prompt

```text
Use case: stylized-concept
Asset type: modular transparent-background midground ruin-and-hill sprite strip for a small HTML5 Canvas side-scrolling game
Input image: use art/style-explorations/selected-direction.png only as the exact visual-style, limited palette, ink treatment, roughness, masonry language, and old printed-book reference; do not include its player or obstacle pair.
Primary request: Create one wide continuous midground silhouette of low broken dungeon walls, eroded stone arches, leaning masonry fragments, and uneven rocky hills. This is a restrained decorative parallax strip behind gameplay, not collision geometry. It must continue naturally through both left and right edges for horizontal repetition.
Scene/backdrop: perfectly flat solid #00ff00 chroma-key background for background removal. The background must be one uniform color with no shadows, gradients, texture, reflections, floor plane, or lighting variation.
Style/medium: selected study 3's balanced readable two-tone old-school dark-fantasy tabletop ink illustration: medium controlled hand-drawn roughness, bold near-black outer contours, one or two hard-edged interior value steps, medium charcoal stone, muted iron-grey, restrained warm parchment-grey and desaturated umber accents, sparse grouped hatching, mild printed-book texture, no soft blurry rendering.
Composition/framing: very wide landscape strip, continuous solid base at the bottom edge, irregular silhouette occupying roughly the lower half to two-thirds. Keep landmarks low and broad: short ruined wall runs, one or two incomplete arches, occasional broken posts, and rolling stone heaps. No tall central focal object. Both horizontal edges should end at a compatible low hill/wall height and density.
Color palette: near-black ink, dark muted charcoal, slate-grey, restrained desaturated umber and parchment-grey accents; somewhat stronger than the far skyline but distinctly lower contrast than gameplay sprites. Do not use #00ff00 or any green in the artwork.
Constraints: one reusable connected silhouette strip; crisp opaque graphic forms suitable for chroma-key extraction; simple quiet exterior silhouette; sparse internal detail; no directional lighting; no cast shadow; no text; no symbols; no characters; no playable obstacle pairs; no terrain collision line.
Avoid: tall spikes or pillars that could be confused with gameplay obstacles, cap-and-body pipe forms, a complete framed landscape, labels, letters, numbers, borders, watermark, signature, bright saturated colors, glowing windows, dramatic lighting, fire, smoke, particles, vegetation, photorealism, soft blur, glossy effects, sci-fi, cartoon comedy, clean corporate vector art.
```

## Post-processing and regeneration

1. Remove the flat chroma background from each selected source with the
   installed ImageGen `remove_chroma_key.py` helper using border detection,
   soft matte, despill, and one-pixel edge contraction.
2. Retain the full generated width and crop only to each source's visible
   vertical alpha bounds.
3. Scale every strip to 768 pixels wide with one proportional scale, then
   bottom-align it inside its configured transparent output height.
4. Average the opposite edge pixels and ease that correction inward over 24
   pixels. The first and last columns then match exactly without a hard seam.
5. Clear only resampling remnants below 8/255 alpha; preserve all visible
   antialiased edges.
6. Export optimized transparent RGBA PNGs and create a temporary runtime-scale
   repeated-layer preview.
7. Inspect the normalized assets and preview, then discard raw chroma,
   intermediate alpha, and temporary preview files.

The deterministic normalization command is:

```bash
python3 scripts/assets/process_background_sprites.py \
  --input-dir <alpha-source-directory> \
  --output-dir public/assets/sprites/background \
  --preview-output <temporary-preview.png>
```
