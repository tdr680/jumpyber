# Shadowdark-inspired style exploration prompts

## Purpose

Compare four treatments of one fixed browser-game vignette at small scale. Each
sheet contains exactly one right-facing hooded adventurer, one rectangular
upper obstacle, one matching lower obstacle, and one short sloped terrain
segment. All sources use a removable `#00ff00` chroma background.

## Generated results

| Study                 | Built-in ImageGen result                                                                                     |
| --------------------- | ------------------------------------------------------------------------------------------------------------ |
| 1 · Clean ink         | `/home/tomas/.codex/generated_images/019f6a62-16f0-72c1-b1c9-354d8d46dbfa/call_itoIkhIfywELz37Btqzt36SU.png` |
| 2 · Rough ink         | `/home/tomas/.codex/generated_images/019f6a62-16f0-72c1-b1c9-354d8d46dbfa/call_uBDyljTM6dGxACUPBu5Pi0Cw.png` |
| 3 · Balanced two-tone | `/home/tomas/.codex/generated_images/019f6a62-16f0-72c1-b1c9-354d8d46dbfa/call_R6iTtYc9895PeHcz6RTfOHFI.png` |
| 4 · Deep texture      | `/home/tomas/.codex/generated_images/019f6a62-16f0-72c1-b1c9-354d8d46dbfa/call_qsdeYIIouoIQAZMKsyHdvzga.png` |

Studies 2–4 used study 1 as an image reference so layout and subject matter
remained comparable.

## Shared generation prompt

```text
Use case: stylized-concept
Asset type: small game-art style exploration sheet for an HTML5 Canvas browser game
Primary request: Create one compact side-view gameplay vignette containing exactly four visual elements: one small right-facing floating adventurer player pose on the left; one rectangular upper ruin-pillar obstacle descending from the top on the right; one matching rectangular lower ruin-pillar obstacle rising from the bottom on the right with a clearly readable gap; and one short gently sloped stone terrain segment beneath and connected to the lower obstacle. No other objects.
Scene/backdrop: perfectly flat solid #00ff00 chroma-key background for later transparency removal. One uniform green color with no gradients, shadows, texture, floor plane, lighting variation, or scenery.
Subject consistency: The player is a compact hooded stick-figure adventurer with simple limbs, short ragged tunic, belt, wraps, and boots, tense but not heroic. Obstacles are straight ironbound masonry pillars with exact rectangular collision silhouettes. Terrain is a short simple stone edge with a clear continuous contour. All forms must remain readable when the entire sheet is reduced to 256 by 256 pixels.
Composition/framing: square sheet, orthographic side view. Player fully isolated on the left and visually centred vertically near the obstacle gap. Upper and lower obstacle share the same width and x position on the right. Preserve a generous clear gap. Terrain occupies only a short lower-right segment. Generous green negative space separates all gameplay silhouettes. No panel divisions or labels.
Constraints: exactly one player pose, one upper obstacle, one lower obstacle, and one terrain segment; strong silhouette; consistent outline thickness; no protrusions outside collision silhouettes; no cast/contact shadows; do not use green in any art; crisp edges suitable for chroma removal.
Avoid: text, labels, numbers, symbols, borders, UI, scenery, sky, clouds, extra characters, weapons, loose accessories, extra obstacle parts, spikes, rubble outside silhouettes, blood, gore, photorealism, soft blur, anime proportions, cartoon comedy, glossy light, sci-fi design, bright saturated colors, corporate vector styling, watermark, signature.
```

## Variant clauses

### 1 · Clean sparse ink

```text
LOW line roughness: confident near-black hand-inked contours with only slight natural wobble. MINIMAL shading: flat fills plus one hard-edged shadow tone. MEDIUM-DARK palette: near-black, charcoal, muted iron grey, restrained parchment-grey and desaturated umber accents. VERY LOW texture: only a few short interior hatch marks; broad quiet shapes dominate.
```

### 2 · Scratchy rough ink

```text
HIGH line roughness with visibly scratchy, dry-brush, slightly broken old-school dungeon-zine contours, but keep the outer silhouette bold and continuous enough for tiny sprites. Keep MINIMAL shading: flat fills and at most one hard shadow tone. Keep a MEDIUM-DARK charcoal, iron-grey, parchment-grey, and restrained desaturated umber palette. Keep LOW texture inside forms: a few purposeful hatch strokes, no dense grain.
```

### 3 · Balanced readable two-tone

```text
MEDIUM line roughness: hand-drawn near-black contours with a controlled dry-brush edge, bold and continuous at silhouette boundaries. MODERATE shading: exactly two clear interior value steps, with compact shadow blocks that reinforce form without covering the silhouette. MEDIUM palette darkness: near-black outlines, dark charcoal, muted iron grey, restrained warm parchment-grey and desaturated umber highlights. LOW-TO-MODERATE texture: a few grouped crosshatch marks and sparse printed-book grain only in larger interior areas; keep the player face, limbs, gap edges, and outer contours quiet and clean.
```

### 4 · Deep dark printed texture

```text
MEDIUM-HIGH line roughness with heavy near-black old-school dungeon-book contours. HIGH shading amount: two deep shadow tones plus small muted highlights, with dramatic dark interiors. VERY DARK palette: near-black, soot charcoal, dark iron grey, deep desaturated brown, with only tiny parchment-grey accents. HIGH texture: dense crosshatching, scratchy dry-brush marks, stone grain, and visibly aged printed-book texture inside forms, while the outer silhouettes and playable gap edges remain continuous and clear.
```

## Post-processing and selection

1. Remove each chroma background with the installed ImageGen
   `remove_chroma_key.py` helper using border detection, soft matte, despill,
   and one-pixel edge contraction.
2. Normalize every transparent sheet from 1254×1254 to 512×512 using Lanczos
   resampling.
3. Compare 240×240 thumbnails on light parchment and dark slate backgrounds.
4. Select study 3 because it preserves the most information across both
   backgrounds without losing the old-school printed-book character.

Study 3 was adopted for the runtime player and obstacle sources on 2026-07-30.
The runtime generations remain documented separately in
`.prompts/player-sprites.md` and `.prompts/obstacle-sprites.md`.

The deterministic comparison command is:

```bash
python3 scripts/assets/process_style_explorations.py \
  --input-dir <alpha-source-directory> \
  --output-dir art/style-explorations \
  --contact-output art/style-explorations/comparison.png
```
