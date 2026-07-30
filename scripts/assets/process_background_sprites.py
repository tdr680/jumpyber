#!/usr/bin/env python3
"""Normalize generated parallax strips and build a runtime-scale preview."""

from __future__ import annotations

import argparse
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageDraw

SOURCE_SIZE = (2172, 724)
OUTPUT_WIDTH = 768
SEAM_DEPTH = 24
RESAMPLING = Image.Resampling.LANCZOS


@dataclass(frozen=True)
class LayerSpec:
    filename: str
    output_height: int
    preview_y: int
    preview_opacity: float


LAYERS = (
    LayerSpec("far-mist.png", 128, 104, 0.24),
    LayerSpec("far-skyline.png", 128, 246, 0.22),
    LayerSpec("midground-ruins.png", 144, 352, 0.28),
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input-dir", required=True, type=Path)
    parser.add_argument("--output-dir", required=True, type=Path)
    parser.add_argument("--preview-output", required=True, type=Path)
    return parser.parse_args()


def vertical_alpha_bounds(image: Image.Image) -> tuple[int, int]:
    bounds = image.getchannel("A").getbbox()
    if bounds is None:
        raise ValueError("Generated background strip contains no visible pixels.")
    return bounds[1], bounds[3]


def mix_pixel(
    first: tuple[int, int, int, int],
    second: tuple[int, int, int, int],
    amount: float,
) -> tuple[int, int, int, int]:
    return tuple(
        round(first[channel] * (1 - amount) + second[channel] * amount)
        for channel in range(4)
    )


def ease_horizontal_seam(image: Image.Image) -> Image.Image:
    """Make opposite edges identical and ease the correction inward."""

    result = image.copy()
    source = image.load()
    pixels = result.load()

    for y in range(result.height):
        boundary = mix_pixel(source[0, y], source[result.width - 1, y], 0.5)

        for offset in range(SEAM_DEPTH):
            inward = offset / SEAM_DEPTH
            left_x = offset
            right_x = result.width - 1 - offset
            pixels[left_x, y] = mix_pixel(boundary, source[left_x, y], inward)
            pixels[right_x, y] = mix_pixel(
                boundary,
                source[right_x, y],
                inward,
            )

    return result


def clear_negligible_alpha(image: Image.Image) -> Image.Image:
    """Discard resampling remnants too faint to contribute visible edges."""

    result = image.copy()
    pixels = result.load()
    for y in range(result.height):
        for x in range(result.width):
            red, green, blue, alpha = pixels[x, y]
            if alpha < 8:
                pixels[x, y] = (0, 0, 0, 0)
            else:
                pixels[x, y] = (red, green, blue, alpha)
    return result


def normalize_strip(source: Image.Image, output_height: int) -> Image.Image:
    source = source.convert("RGBA")
    if source.size != SOURCE_SIZE:
        raise ValueError(
            f"Expected a {SOURCE_SIZE[0]}x{SOURCE_SIZE[1]} source, "
            f"got {source.size}.",
        )

    top, bottom = vertical_alpha_bounds(source)
    visible = source.crop((0, top, source.width, bottom))
    scaled_height = round(visible.height * OUTPUT_WIDTH / visible.width)
    if scaled_height > output_height:
        raise ValueError(
            f"Normalized strip needs {scaled_height}px of vertical space, "
            f"but only {output_height}px was configured.",
        )

    scaled = visible.resize((OUTPUT_WIDTH, scaled_height), RESAMPLING)
    normalized = Image.new("RGBA", (OUTPUT_WIDTH, output_height))
    normalized.alpha_composite(scaled, (0, output_height - scaled_height))
    return clear_negligible_alpha(ease_horizontal_seam(normalized))


def draw_repeated_layer(
    canvas: Image.Image,
    layer: Image.Image,
    y: int,
    opacity: float,
    offset: int,
) -> None:
    faded = layer.copy()
    alpha = faded.getchannel("A").point(lambda value: round(value * opacity))
    faded.putalpha(alpha)

    x = -offset
    while x < canvas.width:
        canvas.alpha_composite(faded, (x, y))
        x += faded.width


def make_preview(
    layers: list[tuple[LayerSpec, Image.Image]],
    output: Path,
) -> None:
    canvas = Image.new("RGBA", (800, 600), "#d8f2ff")
    draw = ImageDraw.Draw(canvas)
    for y in range(canvas.height):
        blend = y / max(1, canvas.height - 1)
        if blend < 0.62:
            amount = blend / 0.62
            start = (216, 242, 255)
            end = (247, 233, 198)
        else:
            amount = (blend - 0.62) / 0.38
            start = (247, 233, 198)
            end = (243, 201, 137)
        color = tuple(
            round(start[channel] * (1 - amount) + end[channel] * amount)
            for channel in range(3)
        )
        draw.line((0, y, canvas.width, y), fill=color)

    for index, (spec, layer) in enumerate(layers):
        draw_repeated_layer(
            canvas,
            layer,
            spec.preview_y,
            spec.preview_opacity,
            173 + index * 97,
        )

    output.parent.mkdir(parents=True, exist_ok=True)
    canvas.convert("RGB").save(output, optimize=True)


def main() -> None:
    args = parse_args()
    args.output_dir.mkdir(parents=True, exist_ok=True)
    normalized: list[tuple[LayerSpec, Image.Image]] = []

    for spec in LAYERS:
        source = Image.open(args.input_dir / spec.filename)
        strip = normalize_strip(source, spec.output_height)
        strip.save(args.output_dir / spec.filename, optimize=True)
        normalized.append((spec, strip))

    make_preview(normalized, args.preview_output)


if __name__ == "__main__":
    main()
