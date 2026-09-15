"""Generate a 1200x630 share image for every blog post.

Output: public/og/blog/<slug>.png, used as each post's og:image. Existing
images are skipped, so run this after adding posts:

    python scripts/og-images.py            # new posts only
    python scripts/og-images.py --force    # redraw all

Needs Node (reads src/data/blog-posts.ts directly) and Pillow. The fonts are
Windows' Segoe UI; on another OS, point FONTS at any sans with bold/semibold.
If a post has no image, the prerender step falls back to /og-image.png.
"""
import json
import os
import subprocess
import sys
from datetime import date

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "og", "blog")
FONTS = "C:/Windows/Fonts/"
W, H = 1200, 630
PAD = 80
BLUE = (26, 179, 255)
PURPLE = (196, 77, 255)
WHITE = (245, 246, 250)
MUTED = (160, 168, 188)


def font(name, size):
    return ImageFont.truetype(FONTS + name, size)


def load_posts():
    js = (
        "import('./src/data/blog-posts.ts').then(m => console.log(JSON.stringify("
        "m.BLOG_POSTS.map(p => ({slug: p.slug, title: p.title, category: p.category,"
        " date: p.date, readTime: p.readTime})))))"
    )
    out = subprocess.run(["node", "-e", js], cwd=ROOT, capture_output=True, text=True, check=True)
    return json.loads(out.stdout.strip().splitlines()[-1])


def background():
    img = Image.new("RGB", (W, H), (3, 4, 8))
    glow = Image.new("RGB", (W, H), (0, 0, 0))
    g = ImageDraw.Draw(glow)
    g.ellipse((-260, -300, 520, 420), fill=tuple(int(c * 0.5) for c in BLUE))
    g.ellipse((760, 260, 1500, 940), fill=tuple(int(c * 0.45) for c in PURPLE))
    img = ImageChops.add(img, glow.filter(ImageFilter.GaussianBlur(150)))
    grid = Image.new("L", (W, H), 0)
    gd = ImageDraw.Draw(grid)
    for x in range(0, W + 1, 60):
        gd.line([(x, 0), (x, H)], fill=24)
    for y in range(0, H + 1, 60):
        gd.line([(0, y), (W, y)], fill=24)
    img.paste(Image.new("RGB", (W, H), (120, 130, 160)), (0, 0), grid)
    return img


def gradient(w, h):
    grad = Image.new("RGB", (w, h))
    px = grad.load()
    for x in range(w):
        t = x / max(1, w - 1)
        col = tuple(int(BLUE[i] + (PURPLE[i] - BLUE[i]) * t) for i in range(3))
        for y in range(h):
            px[x, y] = col
    return grad


def wrap(draw, text, fnt, max_w):
    lines, line = [], ""
    for word in text.split():
        trial = f"{line} {word}".strip()
        if draw.textlength(trial, font=fnt) <= max_w:
            line = trial
        else:
            lines.append(line)
            line = word
    lines.append(line)
    return lines


def fit_title(draw, title, max_w, max_lines=3):
    """Largest size (72 down to 46) at which the title fits in max_lines."""
    for size in range(72, 44, -2):
        fnt = font("segoeuib.ttf", size)
        lines = wrap(draw, title, fnt, max_w)
        if len(lines) <= max_lines:
            return fnt, lines, size
    fnt = font("segoeuib.ttf", 46)
    lines = wrap(draw, title, fnt, max_w)[:max_lines]
    lines[-1] = lines[-1].rstrip(".,:;") + "..."
    return fnt, lines, 46


def render(post, icon):
    img = background()
    draw = ImageDraw.Draw(img)

    # Brand row
    mask = Image.new("L", (56, 56), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, 55, 55), radius=12, fill=255)
    img.paste(icon, (PAD, 64), ImageChops.multiply(icon.split()[3], mask))
    wm = font("segoeuib.ttf", 30)
    x = PAD + 72
    draw.text((x, 72), "VORTURA", font=wm, fill=WHITE)
    x += draw.textlength("VORTURA", font=wm)
    draw.text((x, 72), ".", font=wm, fill=BLUE)
    x += draw.textlength(".", font=wm)
    draw.text((x, 72), "ai", font=wm, fill=WHITE)

    # Category pill, right-aligned on the brand row
    pill_font = font("seguisb.ttf", 20)
    label = post["category"].upper()
    tw = draw.textlength(label, font=pill_font) + 2 * len(label)  # tracking
    pw, ph = int(tw + 40), 40
    px0 = W - PAD - pw
    draw.rounded_rectangle((px0, 72, px0 + pw, 72 + ph), radius=20, fill=(12, 34, 52), outline=(30, 110, 160), width=2)
    cx = px0 + 20
    for ch in label:
        draw.text((cx, 79), ch, font=pill_font, fill=BLUE)
        cx += draw.textlength(ch, font=pill_font) + 2

    # Title, vertically centred in the space between brand row and footer
    fnt, lines, size = fit_title(draw, post["title"], W - 2 * PAD)
    line_h = int(size * 1.18)
    block_h = line_h * len(lines)
    top = 150 + (440 - 150 - block_h) // 2 + 10
    for i, line in enumerate(lines):
        draw.text((PAD, top + i * line_h), line, font=fnt, fill=WHITE)

    # Gradient rule and footer meta
    rule_y = 486
    img.paste(gradient(120, 5), (PAD, rule_y))
    meta = font("segoeui.ttf", 26)
    published = date.fromisoformat(post["date"]).strftime("%B %-d, %Y") if os.name != "nt" else date.fromisoformat(post["date"]).strftime("%B %#d, %Y")
    draw.text((PAD, 520), f"Sean Hutchinson  \u00b7  {published}  \u00b7  {post['readTime']}", font=meta, fill=MUTED)
    url_font = font("seguisb.ttf", 26)
    url = "vortura.ai/blog"
    draw.text((W - PAD - draw.textlength(url, font=url_font), 520), url, font=url_font, fill=BLUE)
    return img


def main():
    force = "--force" in sys.argv
    os.makedirs(OUT, exist_ok=True)
    icon = Image.open(os.path.join(ROOT, "public", "vortura-icon.png")).convert("RGBA").resize((56, 56), Image.LANCZOS)
    made = 0
    for post in load_posts():
        path = os.path.join(OUT, f"{post['slug']}.png")
        if os.path.exists(path) and not force:
            continue
        render(post, icon).save(path, optimize=True)
        made += 1
    print(f"og-images: wrote {made} image(s) to public/og/blog")


if __name__ == "__main__":
    main()
