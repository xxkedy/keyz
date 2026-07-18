"""Generate the dedicated Appz launcher icon set."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


S = 1024
BLACK = "#000000"
WHITE = "#ffffff"
FONT = Path(__file__).resolve().parent.parent / "Anton.ttf"
WORDMARK_SIZE = 265
WORDMARK_TOP = 436


def draw_app_grid(draw: ImageDraw.ImageDraw, cx: int, cy: int) -> None:
    """One grouped 2x2 launcher symbol, sized for 45px Appz cards and the Dock."""
    for dx in (-58, 58):
        for dy in (-58, 58):
            draw.rounded_rectangle(
                [cx + dx - 40, cy + dy - 40, cx + dx + 40, cy + dy + 40],
                radius=18,
                fill=WHITE,
            )


def draw_wordmark(draw: ImageDraw.ImageDraw) -> None:
    text = "Appz"
    font = ImageFont.truetype(str(FONT), WORDMARK_SIZE)
    widths = []
    for char in text:
        box = draw.textbbox((0, 0), char, font=font)
        widths.append(box[2] - box[0])
    x = (S - sum(widths)) / 2
    for char, width in zip(text, widths):
        draw.text((x, WORDMARK_TOP), char, font=font, fill=WHITE)
        x += width


def make_icon() -> Image.Image:
    image = Image.new("RGB", (S, S), BLACK)
    draw = ImageDraw.Draw(image)
    draw.rectangle([132, 168, S - 132, 180], fill=WHITE)
    draw.rectangle([132, 844, S - 132, 856], fill=WHITE)
    draw_app_grid(draw, S // 2, 330)
    draw_wordmark(draw)
    return image


if __name__ == "__main__":
    icon = make_icon()
    output_dir = Path(__file__).resolve().parent
    for size in (512, 192, 180):
        icon.resize((size, size), Image.Resampling.LANCZOS).save(
            output_dir / f"icon-{size}.png"
        )
    print("Appz icons generated")
