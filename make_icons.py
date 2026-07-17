# make_icons.py — kedyアプリ共通アイコン一括生成
# 方針（App Hub）: 黒地×白抜きAnton・記号1つ・上下ルール線で統一
# Digz / Tagz / Keyzは先頭のみ大文字の均一サイズ表記
# 使い方: python3 make_icons.py keyz        → keyzだけ生成（icon-512.png / icon-192.png）
#         python3 make_icons.py all         → 全アプリを icons/ に一括生成＋contact sheet
import sys, math
from PIL import Image, ImageDraw, ImageFont

FONT = "Anton.ttf"
S = 1024          # 原寸
W = 26            # 記号の線幅
WHITE = "#ffffff"
BLACK = "#000000"
UNIFORM_WORDMARK_SIZE = 205


def sym_keyz(d, cx, cy):      # キーキャップ
    d.rounded_rectangle([cx-140, cy-115, cx+140, cy+115], radius=36, outline=WHITE, width=W)
    d.rounded_rectangle([cx-92, cy-78, cx+92, cy+52], radius=24, outline=WHITE, width=16)


def sym_digz(d, cx, cy):      # シャベル
    d.rounded_rectangle([cx-70, cy-125, cx+70, cy-95], radius=15, fill=WHITE)
    d.rounded_rectangle([cx-14, cy-125, cx+14, cy+15], radius=10, fill=WHITE)
    d.polygon([(cx-75, cy+15), (cx+75, cy+15), (cx+75, cy+75), (cx, cy+130), (cx-75, cy+75)], fill=WHITE)


def sym_flowz(d, cx, cy):     # 音波バー
    hs = [55, 105, 150, 105, 55]
    xs = [-140, -70, 0, 70, 140]
    for x, h in zip(xs, hs):
        d.rounded_rectangle([cx+x-17, cy-h, cx+x+17, cy+h], radius=17, fill=WHITE)


def sym_slango(d, cx, cy):    # 吹き出し
    d.rounded_rectangle([cx-140, cy-105, cx+140, cy+65], radius=42, outline=WHITE, width=W)
    d.polygon([(cx-70, cy+58), (cx-10, cy+58), (cx-85, cy+128)], fill=WHITE)


def sym_earz(d, cx, cy):      # ヘッドホン
    d.arc([cx-135, cy-115, cx+135, cy+155], start=180, end=360, fill=WHITE, width=W)
    d.rounded_rectangle([cx-158, cy+10, cx-98, cy+120], radius=22, fill=WHITE)
    d.rounded_rectangle([cx+98, cy+10, cx+158, cy+120], radius=22, fill=WHITE)


def sym_gainz(d, cx, cy):     # ダンベル
    d.rounded_rectangle([cx-95, cy-16, cx+95, cy+16], radius=14, fill=WHITE)
    for sgn in (-1, 1):
        d.rounded_rectangle([cx+sgn*95-(28 if sgn < 0 else 0), cy-85, cx+sgn*95+(0 if sgn < 0 else 28), cy+85], radius=13, fill=WHITE)
        d.rounded_rectangle([cx+sgn*135-(24 if sgn < 0 else 0), cy-58, cx+sgn*135+(0 if sgn < 0 else 24), cy+58], radius=12, fill=WHITE)


def sym_tagz(d, cx, cy):      # 価格タグ
    points = [
        (cx-155, cy-110),
        (cx+35, cy-110),
        (cx+155, cy),
        (cx+35, cy+110),
        (cx-155, cy+110),
    ]
    d.line(points + [points[0]], fill=WHITE, width=W, joint="curve")
    d.ellipse([cx+24, cy-26, cx+76, cy+26], outline=WHITE, width=14)


APPS = {
    "keyz":   sym_keyz,
    "digz":   sym_digz,
    "flowz":  sym_flowz,
    "slango": sym_slango,
    "earz":   sym_earz,
    "gainz":  sym_gainz,
    "tagz":   sym_tagz,
}


def uniform_wordmark(d, text, base_y, size):
    font = ImageFont.truetype(FONT, size)
    gap = 7
    widths = []
    for ch in text:
        b = d.textbbox((0, 0), ch, font=font)
        widths.append(b[2] - b[0])
    total = sum(widths) + gap * (len(text) - 1)
    x = (S - total) / 2
    for ch, width in zip(text, widths):
        d.text((x, base_y), ch, font=font, fill=WHITE, anchor="ls")
        x += width + gap


def wordmark(d, name, base_y):
    if name in {"digz", "tagz", "keyz"}:
        uniform_wordmark(d, name.capitalize(), base_y, UNIFORM_WORDMARK_SIZE)
        return

    # 既存アプリは従来の大小交互表記を維持
    big, small = 250, 175
    word = name.capitalize()
    fonts = [ImageFont.truetype(FONT, big if i % 2 == 0 else small) for i in range(len(word))]
    gap = 10
    widths = []
    for ch, f in zip(word, fonts):
        b = d.textbbox((0, 0), ch, font=f)
        widths.append(b[2] - b[0])
    total = sum(widths) + gap * (len(word) - 1)
    scale = min(1.0, 830 / total)
    if scale < 1.0:
        fonts = [ImageFont.truetype(FONT, int((big if i % 2 == 0 else small) * scale)) for i in range(len(word))]
        widths = []
        for ch, f in zip(word, fonts):
            b = d.textbbox((0, 0), ch, font=f)
            widths.append(b[2] - b[0])
        total = sum(widths) + gap * (len(word) - 1)
    x = (S - total) / 2
    for ch, f, width in zip(word, fonts, widths):
        d.text((x, base_y), ch, font=f, fill=WHITE, anchor="ls")
        x += width + gap


def make(name):
    img = Image.new("RGB", (S, S), BLACK)
    d = ImageDraw.Draw(img)
    d.rectangle([120, 112, S-120, 126], fill=WHITE)
    d.rectangle([120, S-126, S-120, S-112], fill=WHITE)
    APPS[name](d, S/2, 330)
    wordmark(d, name, 860)
    return img


def save_set(name, outdir="."):
    img = make(name)
    img.resize((512, 512), Image.Resampling.LANCZOS).save(f"{outdir}/icon-512.png")
    img.resize((192, 192), Image.Resampling.LANCZOS).save(f"{outdir}/icon-192.png")


if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "keyz"
    if target == "all":
        import os
        os.makedirs("icons", exist_ok=True)
        tiles = []
        for name in APPS:
            img = make(name)
            img.resize((512, 512), Image.Resampling.LANCZOS).save(f"icons/{name}-512.png")
            img.resize((192, 192), Image.Resampling.LANCZOS).save(f"icons/{name}-192.png")
            tiles.append(img.resize((300, 300), Image.Resampling.LANCZOS))
        cols, pad = 4, 22
        rows = math.ceil(len(tiles) / cols)
        sheet = Image.new("RGB", (cols*300 + pad*(cols+1), rows*300 + pad*(rows+1)), "#0e1114")
        for i, tile in enumerate(tiles):
            x = pad + (i % cols) * (300 + pad)
            y = pad + (i // cols) * (300 + pad)
            sheet.paste(tile, (x, y))
        sheet.save("icons/contact-sheet.png")
        print("all icons OK -> icons/")
    else:
        save_set(target)
        print(f"{target} OK -> icon-512.png / icon-192.png")
