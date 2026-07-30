# Shadowdark-inspired style explorations

These four 512×512 transparent PNG studies compare the same gameplay-scale
vignette: one player pose, one upper obstacle, one lower obstacle, and one short
terrain segment. They are concept references only and are not loaded by the
game.

## Variants

| Study                                             | Line roughness | Shading               | Palette                  | Texture         | Readability                                                                          |
| ------------------------------------------------- | -------------- | --------------------- | ------------------------ | --------------- | ------------------------------------------------------------------------------------ |
| [1 · Clean ink](01-clean-ink.png)                 | Low            | Minimal, one step     | Medium-dark              | Very low        | Clear on light backgrounds; quieter values lose some separation on dark backgrounds. |
| [2 · Rough ink](02-rough-ink.png)                 | High           | Minimal, one step     | Light-to-medium charcoal | Low             | Strong contrast, but the scratchier contour becomes busy as the sheet shrinks.       |
| [3 · Balanced two-tone](03-balanced-two-tone.png) | Medium         | Two clear steps       | Medium charcoal          | Low-to-moderate | Best balance of silhouette, material, and cross-background contrast.                 |
| [4 · Deep texture](04-deep-texture.png)           | Medium-high    | Heavy, two dark steps | Very dark                | High            | Atmospheric at source scale, but small forms merge into dark masses.                 |

The [comparison sheet](comparison.png) shows every study reduced to a 240×240
thumbnail on both light parchment and dark slate backgrounds.

## Selected direction

[Study 3 · Balanced two-tone](selected-direction.png) is the selected reference.
It keeps the adventurer pose, obstacle gap edges, masonry blocks, and terrain
contour readable on both test backgrounds while retaining a rough printed-book
character.

Future sprite generation should use:

- medium, controlled hand-inked line roughness;
- bold continuous outer silhouettes;
- two hard-edged value steps;
- near-black outlines with medium charcoal and muted parchment-grey fills;
- grouped crosshatching only inside broad shapes;
- quiet player limbs, obstacle gap edges, and terrain contours.

The selection does not replace current runtime assets or change collision
geometry.
