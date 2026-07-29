#!/usr/bin/env python3
"""Normalize the selected obstacle body tile and build review previews."""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageDraw

BODY_SIZE = (64, 64)
BODY_SOURCE_CROP = (588, 334, 790, 548)
RESAMPLING = Image.Resampling.LANCZOS


def alpha_bbox(image: Image.Image) -> tuple[int, int, int, int]:
    bbox = image.getchannel("A").getbbox()
    if bbox is None:
        raise ValueError("Obstacle body crop contains no visible pixels.")
    return bbox


def make_seamless_body(image: Image.Image) -> Image.Image:
    visible = image.crop(alpha_bbox(image))
    body = visible.resize(BODY_SIZE, RESAMPLING)
    pixels = body.load()
    seam_depth = 7

    # Force a common boundary row, then ease both ends toward the untouched
    # centre. The runtime can repeat the tile without a horizontal seam.
    for x in range(body.width):
        top = pixels[x, 0]
        bottom = pixels[x, body.height - 1]
        boundary = tuple(
            round((top[channel] + bottom[channel]) / 2)
            for channel in range(4)
        )

        for offset in range(seam_depth):
            amount = offset / seam_depth
            top_source = pixels[x, offset]
            bottom_source = pixels[x, body.height - 1 - offset]
            pixels[x, offset] = tuple(
                round(
                    boundary[channel] * (1 - amount)
                    + top_source[channel] * amount
                )
                for channel in range(4)
            )
            pixels[x, body.height - 1 - offset] = tuple(
                round(
                    boundary[channel] * (1 - amount)
                    + bottom_source[channel] * amount
                )
                for channel in range(4)
            )

    return body


def checkerboard(size: tuple[int, int]) -> Image.Image:
    image = Image.new("RGBA", size, "#f7f3e9")
    draw = ImageDraw.Draw(image)
    cell = 16
    for y in range(0, size[1], cell):
        for x in range(0, size[0], cell):
            if (x // cell + y // cell) % 2 == 0:
                draw.rectangle(
                    (x, y, x + cell - 1, y + cell - 1),
                    fill="#dedbd2",
                )
    return image


def draw_tiled_rectangle(
    canvas: Image.Image,
    body: Image.Image,
    box: tuple[int, int, int, int],
) -> None:
    left, top, right, bottom = box
    y = top
    while y < bottom:
        height = min(body.height, bottom - y)
        tile = body.crop((0, 0, body.width, height))
        canvas.alpha_composite(tile, (left, y))
        y += height


def draw_obstacle_pair(
    canvas: Image.Image,
    body: Image.Image,
    *,
    center_x: int,
    gap_center_y: int,
    gap_height: int,
) -> None:
    left = center_x - body.width // 2
    right = left + body.width
    gap_top = gap_center_y - gap_height // 2
    gap_bottom = gap_top + gap_height
    draw_tiled_rectangle(canvas, body, (left, 0, right, gap_top))
    draw_tiled_rectangle(
        canvas,
        body,
        (left, gap_bottom, right, canvas.height),
    )


def obstacle_preview(body: Image.Image, output_path: Path) -> None:
    canvas = checkerboard((900, 600))
    draw = ImageDraw.Draw(canvas)
    terrain = [(0, 300), (225, 235), (450, 300), (675, 365), (900, 300)]
    draw.line(terrain, fill="#315f5a", width=4, joint="curve")

    for x, gap_center_y in ((110, 270), (330, 220), (550, 320), (770, 375)):
        draw_obstacle_pair(
            canvas,
            body,
            center_x=x,
            gap_center_y=gap_center_y,
            gap_height=155,
        )

    output_path.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(output_path)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--output-dir", type=Path, required=True)
    parser.add_argument("--preview-dir", type=Path, required=True)
    args = parser.parse_args()

    source = Image.open(args.source).convert("RGBA")
    if source.size != (1774, 887):
        raise ValueError(
            f"Expected the selected 1774x887 source, got {source.size}.",
        )

    body = make_seamless_body(source.crop(BODY_SOURCE_CROP))
    args.output_dir.mkdir(parents=True, exist_ok=True)
    body.save(args.output_dir / "obstacle-body.png", optimize=True)
    obstacle_preview(body, args.preview_dir / "obstacle-body-preview.png")


if __name__ == "__main__":
    main()
