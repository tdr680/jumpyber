#!/usr/bin/env python3
"""Normalize Shadowdark style studies and build a game-scale comparison."""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageDraw

VARIANTS = (
    ("01-clean-ink.png", "1 · clean ink"),
    ("02-rough-ink.png", "2 · rough ink"),
    ("03-balanced-two-tone.png", "3 · balanced two-tone"),
    ("04-deep-texture.png", "4 · deep texture"),
)
SHEET_SIZE = 512
CONTACT_THUMBNAIL_SIZE = 240
CONTACT_CELL_SIZE = (280, 286)
CONTACT_BACKGROUNDS = ("#eee8d8", "#253034")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input-dir", required=True, type=Path)
    parser.add_argument("--output-dir", required=True, type=Path)
    parser.add_argument("--contact-output", required=True, type=Path)
    return parser.parse_args()


def normalize_sheet(source: Image.Image) -> Image.Image:
    if source.width != source.height:
        raise ValueError("Style exploration sources must be square.")

    return source.convert("RGBA").resize(
        (SHEET_SIZE, SHEET_SIZE),
        Image.Resampling.LANCZOS,
    )


def make_contact_sheet(
    sheets: list[tuple[str, Image.Image]],
    output: Path,
) -> None:
    width = CONTACT_CELL_SIZE[0] * len(sheets)
    height = CONTACT_CELL_SIZE[1] * len(CONTACT_BACKGROUNDS)
    contact = Image.new("RGBA", (width, height), "#ffffff")
    draw = ImageDraw.Draw(contact)

    for row, background in enumerate(CONTACT_BACKGROUNDS):
        row_y = row * CONTACT_CELL_SIZE[1]
        for column, (label, sheet) in enumerate(sheets):
            cell_x = column * CONTACT_CELL_SIZE[0]
            draw.rectangle(
                (
                    cell_x,
                    row_y,
                    cell_x + CONTACT_CELL_SIZE[0] - 1,
                    row_y + CONTACT_CELL_SIZE[1] - 1,
                ),
                fill=background,
                outline="#7b756c",
            )
            thumbnail = sheet.resize(
                (CONTACT_THUMBNAIL_SIZE, CONTACT_THUMBNAIL_SIZE),
                Image.Resampling.LANCZOS,
            )
            contact.alpha_composite(thumbnail, (cell_x + 20, row_y + 12))
            label_color = "#17191a" if row == 0 else "#f4eddd"
            draw.text(
                (
                    cell_x + CONTACT_CELL_SIZE[0] // 2,
                    row_y + CONTACT_CELL_SIZE[1] - 17,
                ),
                label,
                anchor="mm",
                fill=label_color,
            )

    output.parent.mkdir(parents=True, exist_ok=True)
    contact.convert("RGB").save(output, optimize=True)


def main() -> None:
    args = parse_args()
    args.output_dir.mkdir(parents=True, exist_ok=True)
    normalized: list[tuple[str, Image.Image]] = []

    for filename, label in VARIANTS:
        source = Image.open(args.input_dir / filename)
        sheet = normalize_sheet(source)
        sheet.save(args.output_dir / filename, optimize=True)
        normalized.append((label, sheet))

    make_contact_sheet(normalized, args.contact_output)


if __name__ == "__main__":
    main()
