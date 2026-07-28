#!/usr/bin/env python3
"""Normalize the selected obstacle source sheet and build review previews."""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageDraw

CAP_SIZE = (96, 48)
BODY_SIZE = (64, 64)
BASE_SIZE = (96, 48)

# Pixel crops for ImageGen result 019f6a62-16f0-72c1-b1c9-354d8d46dbfa.
# The source must have already had its flat chroma background removed.
SOURCE_CROPS = {
    "cap": (100, 194, 458, 348),
    "body": (588, 334, 790, 548),
    "base": (908, 526, 1252, 706),
    "cap-damaged": (1314, 194, 1674, 348),
}

RESAMPLING = Image.Resampling.LANCZOS


def alpha_bbox(image: Image.Image) -> tuple[int, int, int, int]:
    bbox = image.getchannel("A").getbbox()
    if bbox is None:
        raise ValueError("Component crop contains no visible pixels.")
    return bbox


def fit_component(
    image: Image.Image,
    target_size: tuple[int, int],
    *,
    vertical_anchor: str,
) -> Image.Image:
    visible = image.crop(alpha_bbox(image))
    available_width = target_size[0] - 4
    available_height = target_size[1] - 4
    scale = min(
        available_width / visible.width,
        available_height / visible.height,
    )
    resized = visible.resize(
        (
            max(1, round(visible.width * scale)),
            max(1, round(visible.height * scale)),
        ),
        RESAMPLING,
    )
    result = Image.new("RGBA", target_size)
    x = (target_size[0] - resized.width) // 2

    if vertical_anchor == "top":
        y = 0
    elif vertical_anchor == "bottom":
        y = target_size[1] - resized.height
    else:
        y = (target_size[1] - resized.height) // 2

    result.alpha_composite(resized, (x, y))
    return result


def make_seamless_body(image: Image.Image) -> Image.Image:
    visible = image.crop(alpha_bbox(image))
    body = visible.resize(BODY_SIZE, RESAMPLING)
    pixels = body.load()
    seam_depth = 7

    # Force a common boundary row, then ease both ends toward the untouched
    # centre. This removes the generated crop seam without stretching detail.
    for x in range(body.width):
        top = pixels[x, 0]
        bottom = pixels[x, body.height - 1]
        boundary = tuple(round((top[channel] + bottom[channel]) / 2) for channel in range(4))

        for offset in range(seam_depth):
            amount = offset / seam_depth
            top_source = pixels[x, offset]
            bottom_source = pixels[x, body.height - 1 - offset]
            pixels[x, offset] = tuple(
                round(boundary[channel] * (1 - amount) + top_source[channel] * amount)
                for channel in range(4)
            )
            pixels[x, body.height - 1 - offset] = tuple(
                round(boundary[channel] * (1 - amount) + bottom_source[channel] * amount)
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
                draw.rectangle((x, y, x + cell - 1, y + cell - 1), fill="#dedbd2")
    return image


def paste_scaled(
    canvas: Image.Image,
    sprite: Image.Image,
    box: tuple[int, int, int, int],
    *,
    flip_y: bool = False,
) -> None:
    width = box[2] - box[0]
    height = box[3] - box[1]
    rendered = sprite.resize((width, height), RESAMPLING)
    if flip_y:
        rendered = rendered.transpose(Image.Transpose.FLIP_TOP_BOTTOM)
    canvas.alpha_composite(rendered, (box[0], box[1]))


def draw_post(
    canvas: Image.Image,
    assets: dict[str, Image.Image],
    *,
    center_x: int,
    gap_y: int,
    terrain_y: int,
    upper: bool = False,
    damaged: bool = False,
) -> None:
    body_width = 64
    cap_width = 96
    cap_height = 48
    base_height = 48
    body_left = center_x - body_width // 2
    cap_left = center_x - cap_width // 2
    cap_name = "cap-damaged" if damaged else "cap"

    if upper:
        body_top = 0
        body_bottom = gap_y - cap_height
        y = body_top
        while y < body_bottom:
            tile_height = min(body_width, body_bottom - y)
            paste_scaled(
                canvas,
                assets["body"].crop((0, 0, body_width, tile_height)),
                (body_left, y, body_left + body_width, y + tile_height),
            )
            y += tile_height
        base_top = terrain_y
        paste_scaled(
            canvas,
            assets["base"],
            (cap_left, base_top, cap_left + cap_width, base_top + base_height),
            flip_y=True,
        )
        paste_scaled(
            canvas,
            assets[cap_name],
            (cap_left, gap_y - cap_height, cap_left + cap_width, gap_y),
            flip_y=True,
        )
        return

    paste_scaled(
        canvas,
        assets[cap_name],
        (cap_left, gap_y, cap_left + cap_width, gap_y + cap_height),
    )
    body_top = gap_y + cap_height
    body_bottom = canvas.height
    y = body_top
    while y < body_bottom:
        tile_height = min(body_width, body_bottom - y)
        paste_scaled(
            canvas,
            assets["body"].crop((0, 0, body_width, tile_height)),
            (body_left, y, body_left + body_width, y + tile_height),
        )
        y += tile_height
    paste_scaled(
        canvas,
        assets["base"],
        (cap_left, terrain_y - base_height, cap_left + cap_width, terrain_y),
    )


def assembly_preview(
    assets: dict[str, Image.Image],
    output_path: Path,
) -> None:
    canvas = checkerboard((900, 560))
    draw = ImageDraw.Draw(canvas)
    draw.line((0, 470, 900, 470), fill="#315f5a", width=4)
    for index, (x, gap_y) in enumerate(((130, 330), (350, 245), (570, 170), (790, 290))):
        draw_post(
            canvas,
            assets,
            center_x=x,
            gap_y=gap_y,
            terrain_y=470,
            damaged=index == 3,
        )
    draw_post(
        canvas,
        assets,
        center_x=350,
        gap_y=155,
        terrain_y=55,
        upper=True,
    )
    output_path.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(output_path)


def terrain_preview(
    assets: dict[str, Image.Image],
    output_path: Path,
) -> None:
    canvas = checkerboard((1000, 600))
    draw = ImageDraw.Draw(canvas)
    terrain = [(0, 430), (250, 365), (500, 365), (750, 430), (1000, 350)]
    draw.line(terrain, fill="#315f5a", width=5, joint="curve")

    placements = ((130, 396), (375, 365), (625, 398), (875, 390))
    for index, (x, terrain_y) in enumerate(placements):
        draw_post(
            canvas,
            assets,
            center_x=x,
            gap_y=180 + index * 12,
            terrain_y=terrain_y,
            damaged=index == 2,
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
        raise ValueError(f"Expected the selected 1774x887 source, got {source.size}.")

    components = {
        name: source.crop(crop)
        for name, crop in SOURCE_CROPS.items()
    }
    assets = {
        "cap": fit_component(components["cap"], CAP_SIZE, vertical_anchor="bottom"),
        "body": make_seamless_body(components["body"]),
        "base": fit_component(components["base"], BASE_SIZE, vertical_anchor="top"),
        "cap-damaged": fit_component(
            components["cap-damaged"],
            CAP_SIZE,
            vertical_anchor="bottom",
        ),
    }

    args.output_dir.mkdir(parents=True, exist_ok=True)
    for name, asset in assets.items():
        asset.save(args.output_dir / f"obstacle-{name}.png", optimize=True)

    assembly_preview(assets, args.preview_dir / "obstacle-assemblies.png")
    terrain_preview(assets, args.preview_dir / "obstacle-terrain.png")


if __name__ == "__main__":
    main()
