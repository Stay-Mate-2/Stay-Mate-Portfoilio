"""Generate optimized, transparent web logo assets from the approved StayMate logo.

Usage (from StayMate-Website root):  python3 scripts/make-brand-assets.py
Requires Pillow only. Source: assets/brand-source/light-mode-logo.jpeg.
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "assets" / "brand-source" / "light-mode-logo.jpeg"
OUT = ROOT / "public" / "brand"
APP = ROOT / "src" / "app"
OUT.mkdir(parents=True, exist_ok=True)


def white_to_alpha(img: Image.Image) -> Image.Image:
    """Un-blend colours from a white background so the mark sits on any surface."""
    rgb = img.convert("RGB")
    pixels = rgb.get_flattened_data() if hasattr(rgb, "get_flattened_data") else rgb.getdata()
    out = []
    for r, g, b in pixels:
        alpha = 1.0 - min(r, g, b) / 255.0
        alpha = min(1.0, max(0.0, (alpha - 0.04) / 0.5))
        if alpha <= 0.0:
            out.append((0, 0, 0, 0))
            continue
        inv = 1.0 - alpha
        out.append(
            tuple(
                int(min(255, max(0, (c - 255.0 * inv) / alpha)))
                for c in (r, g, b)
            )
            + (int(alpha * 255),)
        )
    result = Image.new("RGBA", rgb.size)
    result.putdata(out)
    return result


src = Image.open(SRC)
mark = src.crop((250, 150, 990, 820))  # symbol only (house + S ribbon + people)
mark_rgba = white_to_alpha(mark)
mark_rgba = mark_rgba.crop(mark_rgba.getbbox())
side = max(mark_rgba.size)
canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
canvas.paste(mark_rgba, ((side - mark_rgba.width) // 2, (side - mark_rgba.height) // 2))

for size, name in [(512, "mark-512.png"), (192, "mark-192.png")]:
    canvas.resize((size, size), Image.LANCZOS).save(OUT / name, optimize=True)
canvas.resize((512, 512), Image.LANCZOS).save(OUT / "mark.webp", quality=88, method=6)

# Full lockup (opaque, white background) for documents
full = src.crop((90, 130, 1170, 1130)).resize((720, 667), Image.LANCZOS)
full.convert("RGB").save(OUT / "logo-lockup.webp", quality=86, method=6)

# App icons (Next.js file conventions): transparent favicon + opaque Apple touch icon
canvas.resize((512, 512), Image.LANCZOS).save(APP / "icon.png", optimize=True)
apple = Image.new("RGB", (180, 180), (255, 255, 255))
m = canvas.resize((148, 148), Image.LANCZOS)
apple.paste(m, (16, 16), m)
apple.save(APP / "apple-icon.png", optimize=True)
print("wrote", sorted(p.name for p in OUT.iterdir()))
