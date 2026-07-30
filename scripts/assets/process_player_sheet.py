#!/usr/bin/env python3
"""Normalize a six-column alpha source into Jumpyber's player sprite sheet."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from PIL import Image, ImageDraw

FRAME_NAMES = ("ready", "jump", "rise", "apex", "fall", "hit")
FRAME_SIZE = 96
ANCHOR = (48, 48)
MINIMUM_COMPONENT_PIXELS = 64


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, type=Path)
    parser.add_argument("--sheet-output", required=True, type=Path)
    parser.add_argument("--metadata-output", required=True, type=Path)
    parser.add_argument("--preview-output", type=Path)
    parser.add_argument("--content-size", type=int, default=80)
    return parser.parse_args()


def alpha_bounds(image: Image.Image) -> tuple[int, int, int, int]:
    bounds = image.getchannel("A").point(
        lambda alpha: 255 if alpha >= 16 else 0,
    ).getbbox()
    if bounds is None:
        raise ValueError("A source cell contains no opaque sprite pixels.")
    return bounds


def checkerboard(size: tuple[int, int], tile_size: int = 8) -> Image.Image:
    preview = Image.new("RGBA", size, (238, 238, 238, 255))
    draw = ImageDraw.Draw(preview)
    for y in range(0, size[1], tile_size):
        for x in range(0, size[0], tile_size):
            if (x // tile_size + y // tile_size) % 2 == 0:
                draw.rectangle(
                    (x, y, x + tile_size - 1, y + tile_size - 1),
                    fill=(204, 204, 204, 255),
                )
    return preview


def alpha_components(image: Image.Image) -> list[list[tuple[int, int]]]:
    visible = {
        (x, y)
        for y in range(image.height)
        for x in range(image.width)
        if image.getpixel((x, y))[3] > 0
    }
    components: list[list[tuple[int, int]]] = []

    while visible:
        seed = visible.pop()
        component = [seed]
        pending = [seed]

        while pending:
            x, y = pending.pop()
            for neighbor_x in range(max(0, x - 1), min(image.width, x + 2)):
                for neighbor_y in range(
                    max(0, y - 1),
                    min(image.height, y + 2),
                ):
                    neighbor = (neighbor_x, neighbor_y)
                    if neighbor in visible:
                        visible.remove(neighbor)
                        component.append(neighbor)
                        pending.append(neighbor)

        components.append(component)

    return components


def retain_largest_alpha_component(image: Image.Image) -> None:
    components = alpha_components(image)
    if not components:
        raise ValueError("A source cell contains no visible sprite pixels.")

    largest = max(components, key=len)
    for component in components:
        if component is largest:
            continue
        for point in component:
            image.putpixel(point, (0, 0, 0, 0))


def remove_small_alpha_components(image: Image.Image) -> None:
    for component in alpha_components(image):
        if len(component) < MINIMUM_COMPONENT_PIXELS:
            for point in component:
                image.putpixel(point, (0, 0, 0, 0))


def write_preview(sheet: Image.Image, output: Path) -> None:
    cell_width = 120
    preview = checkerboard((cell_width * len(FRAME_NAMES), 128))
    draw = ImageDraw.Draw(preview)

    for index, name in enumerate(FRAME_NAMES):
        frame = sheet.crop(
            (
                index * FRAME_SIZE,
                0,
                (index + 1) * FRAME_SIZE,
                FRAME_SIZE,
            ),
        )
        x = index * cell_width + (cell_width - FRAME_SIZE) // 2
        preview.alpha_composite(frame, (x, 8))
        draw.rectangle(
            (index * cell_width, 0, (index + 1) * cell_width - 1, 127),
            outline=(90, 90, 90, 255),
        )
        draw.text(
            (index * cell_width + cell_width // 2, 112),
            name,
            anchor="mm",
            fill=(20, 20, 20, 255),
        )

    output.parent.mkdir(parents=True, exist_ok=True)
    preview.save(output, optimize=True)


def main() -> None:
    args = parse_args()
    if not 1 <= args.content_size <= FRAME_SIZE:
        raise ValueError("Content size must fit inside a 96px frame.")

    source = Image.open(args.input).convert("RGBA")
    if source.width % len(FRAME_NAMES) != 0:
        raise ValueError("Source width must divide evenly into six cells.")

    source_cell_width = source.width // len(FRAME_NAMES)
    cells = [
        source.crop(
            (
                index * source_cell_width,
                0,
                (index + 1) * source_cell_width,
                source.height,
            ),
        )
        for index in range(len(FRAME_NAMES))
    ]
    for cell in cells:
        retain_largest_alpha_component(cell)

    bounds = [alpha_bounds(cell) for cell in cells]
    maximum_width = max(right - left for left, _, right, _ in bounds)
    maximum_height = max(bottom - top for _, top, _, bottom in bounds)
    shared_scale = min(
        args.content_size / maximum_width,
        args.content_size / maximum_height,
    )

    sheet = Image.new(
        "RGBA",
        (FRAME_SIZE * len(FRAME_NAMES), FRAME_SIZE),
        (0, 0, 0, 0),
    )
    frame_metadata: dict[str, object] = {}

    for index, (name, cell, box) in enumerate(
        zip(FRAME_NAMES, cells, bounds, strict=True),
    ):
        cropped = cell.crop(box)
        resized_size = (
            max(1, round(cropped.width * shared_scale)),
            max(1, round(cropped.height * shared_scale)),
        )
        resized = cropped.resize(resized_size, Image.Resampling.LANCZOS)
        frame = Image.new("RGBA", (FRAME_SIZE, FRAME_SIZE), (0, 0, 0, 0))
        destination = (
            ANCHOR[0] - resized.width // 2,
            ANCHOR[1] - resized.height // 2,
        )
        frame.alpha_composite(resized, destination)
        remove_small_alpha_components(frame)
        sheet.alpha_composite(frame, (index * FRAME_SIZE, 0))
        frame_metadata[name] = {
            "rect": {
                "x": index * FRAME_SIZE,
                "y": 0,
                "width": FRAME_SIZE,
                "height": FRAME_SIZE,
            },
            "anchor": {"x": ANCHOR[0], "y": ANCHOR[1]},
        }

    args.sheet_output.parent.mkdir(parents=True, exist_ok=True)
    args.metadata_output.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(args.sheet_output, optimize=True)
    args.metadata_output.write_text(
        json.dumps(
            {
                "image": args.sheet_output.name,
                "frameSize": {"width": FRAME_SIZE, "height": FRAME_SIZE},
                "columns": len(FRAME_NAMES),
                "rows": 1,
                "anchor": {"x": ANCHOR[0], "y": ANCHOR[1]},
                "frames": frame_metadata,
                "processing": {
                    "sourceCellSize": {
                        "width": source_cell_width,
                        "height": source.height,
                    },
                    "contentSize": args.content_size,
                    "sharedScale": round(shared_scale, 8),
                    "alphaBounds": {
                        name: {
                            "left": box[0],
                            "top": box[1],
                            "right": box[2],
                            "bottom": box[3],
                        }
                        for name, box in zip(FRAME_NAMES, bounds, strict=True)
                    },
                },
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )

    if args.preview_output is not None:
        write_preview(sheet, args.preview_output)


if __name__ == "__main__":
    main()
