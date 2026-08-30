from __future__ import annotations

from html import escape as h
from pathlib import Path
import colorsys
import hashlib
import importlib.util
import json
import re
import shutil
import subprocess
import tempfile
import textwrap
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
ARTICLES = ROOT / "articles"
ASSETS = ROOT / "assets"
BASE = "https://rn473147-del.github.io/downloader-x-guides"
DATE = "2026-08-30"
ENGLISH_SLUG = "how-to-download-x-twitter-videos-hd-any-device.html"
ORDER = [
    "en", "th", "es", "ja", "id", "zh", "ko", "vi", "fil", "hi",
    "ar", "fa", "fr", "de", "it", "pt", "ru", "tr", "ms", "nl",
]
ENGLISH_META = {
    "name": "English",
    "flag": "🇺🇸",
    "slug": ENGLISH_SLUG,
    "dir": "ltr",
    "og_locale": "en_US",
}


def load_data(path: Path, module_name: str) -> dict[str, dict[str, object]]:
    spec = importlib.util.spec_from_file_location(module_name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Cannot load {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module.DATA


def require(condition: bool, message: str) -> None:
    if not condition:
        raise RuntimeError(message)


def page_url(slug: str) -> str:
    return f"{BASE}/articles/{slug}"


def palette(code: str) -> tuple[str, str, str, str, str]:
    digest = hashlib.sha256(code.encode("utf-8")).digest()
    hue = digest[0] / 255
    hue2 = (hue + 0.14 + digest[1] / 1024) % 1
    hue3 = (hue + 0.52 + digest[2] / 1024) % 1

    def make(hue_value: float, saturation: float, lightness: float) -> str:
        r, g, b = colorsys.hls_to_rgb(hue_value, lightness, saturation)
        return f"#{round(r * 255):02x}{round(g * 255):02x}{round(b * 255):02x}"

    return (
        make(hue, 0.67, 0.23),
        make(hue2, 0.72, 0.43),
        make(hue3, 0.72, 0.48),
        make(hue2, 0.44, 0.91),
        make(hue3, 0.34, 0.95),
    )


def wrap_lines(value: str, width: int, limit: int) -> list[str]:
    value = " ".join(value.split())
    if not value:
        return [""]
    if " " not in value and len(value) > width:
        lines = [value[index:index + width] for index in range(0, len(value), width)]
    else:
        lines = textwrap.wrap(
            value,
            width=width,
            break_long_words=True,
            break_on_hyphens=False,
        )
    if len(lines) > limit:
        lines = lines[:limit]
        lines[-1] = lines[-1].rstrip(" .،。") + "…"
    return lines


def svg_text_lines(
    lines: list[str],
    x: int,
    y: int,
    size: int,
    fill: str,
    weight: int = 700,
    anchor: str = "start",
    gap: int | None = None,
    direction: str = "ltr",
) -> str:
    gap = gap or round(size * 1.22)
    direction_attr = "rtl" if direction == "rtl" else "ltr"
    parts = []
    for index, line in enumerate(lines):
        parts.append(
            f'<text x="{x}" y="{y + index * gap}" text-anchor="{anchor}" '
            f'direction="{direction_attr}" unicode-bidi="plaintext" fill="{fill}" '
            f'font-family="Noto Sans, Noto Sans CJK SC, Noto Sans Arabic, sans-serif" '
            f'font-size="{size}" font-weight="{weight}">{h(line)}</text>'
        )
    return "".join(parts)


def write_cover(code: str, item: dict[str, object], path: Path) -> None:
    dark, accent, accent2, pale, pale2 = palette(code)
    direction = str(item["dir"])
    title = wrap_lines(str(item["h1"]), 31 if code not in {"ja", "zh", "ko"} else 19, 3)
    steps = list(item["media_steps"])
    cards = []
    for index, label in enumerate(steps):
        x = 60 + index * 280
        cards.append(
            f'<g transform="translate({x} 380)"><rect width="245" height="175" rx="25" fill="#ffffff"/>'
            f'<circle cx="52" cy="52" r="31" fill="{accent if index % 2 == 0 else accent2}"/>'
            f'<text x="52" y="62" text-anchor="middle" fill="#fff" font-family="Noto Sans,sans-serif" font-size="28" font-weight="800">{index + 1}</text>'
            + svg_text_lines(wrap_lines(str(label), 18, 2), 25, 115, 22, dark, 800, direction=direction)
            + '</g>'
        )
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" xml:lang="{code}" viewBox="0 0 1200 630" role="img">'
        f'<title>{h(str(item["h1"]))}</title><desc>{h(str(item["subtitle"]))}</desc>'
        f'<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="{dark}"/><stop offset=".58" stop-color="{accent}"/><stop offset="1" stop-color="{accent2}"/></linearGradient>'
        '<filter id="s"><feDropShadow dx="0" dy="12" stdDeviation="15" flood-opacity=".25"/></filter></defs>'
        '<rect width="1200" height="630" rx="38" fill="url(#g)"/>'
        f'<circle cx="1080" cy="80" r="240" fill="{pale}" opacity=".16"/><circle cx="100" cy="610" r="250" fill="{pale2}" opacity=".12"/>'
        + svg_text_lines([f'{item["flag"]} {item["name"]} · DOWNLOADER-X GUIDES'], 60, 72, 22, "#dff7ff", 700, direction=direction)
        + svg_text_lines(title, 60, 145, 49 if len(title) < 3 else 43, "#ffffff", 850, direction=direction)
        + svg_text_lines(wrap_lines(str(item["subtitle"]), 72, 2), 60, 315, 22, "#e9f4ff", 500, direction=direction)
        + f'<g filter="url(#s)">{"".join(cards)}</g>'
        + svg_text_lines([f'{code.upper()} · ORIGINAL VISUAL 1/5'], 60, 605, 16, "#d7efff", 600, direction=direction)
        + '</svg>'
    )
    path.write_text(svg, encoding="utf-8")


def write_quality(code: str, item: dict[str, object], path: Path) -> None:
    dark, accent, accent2, pale, pale2 = palette(code)
    direction = str(item["dir"])
    cards = [
        ("SD", "Compact", pale, accent),
        ("720p", "Balanced HD", pale2, accent2),
        ("1080p", "High detail", "#f1eafe", "#7642cf"),
    ]
    card_markup = []
    for index, (res, label, bg, color) in enumerate(cards):
        x = 60 + index * 380
        card_markup.append(
            f'<g transform="translate({x} 230)"><rect width="330" height="340" rx="28" fill="#fff" stroke="{color}" stroke-width="{4 if index == 1 else 2}"/>'
            f'<circle cx="63" cy="65" r="38" fill="{bg}"/><text x="63" y="74" text-anchor="middle" fill="{color}" font-family="Noto Sans,sans-serif" font-size="20" font-weight="850">{res}</text>'
            + svg_text_lines(wrap_lines(label, 20, 2), 30, 145, 27, dark, 800, direction=direction)
            + svg_text_lines(wrap_lines(str(item["quality"]), 35, 5), 30, 205, 16, "#51627d", 450, direction=direction, gap=28)
            + '</g>'
        )
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" xml:lang="{code}" viewBox="0 0 1200 675" role="img">'
        f'<title>{h(str(item["quality_title"]))}</title><desc>{h(str(item["quality"]))}</desc>'
        f'<rect width="1200" height="675" rx="38" fill="{pale}"/>'
        + svg_text_lines(wrap_lines(str(item["quality_title"]), 55, 2), 60, 82, 39, dark, 850, direction=direction)
        + svg_text_lines([f'{item["flag"]} {item["name"]} · {code.upper()} · ORIGINAL VISUAL 2/5'], 60, 172, 18, accent, 750, direction=direction)
        + ''.join(card_markup)
        + '</svg>'
    )
    path.write_text(svg, encoding="utf-8")


def write_devices(code: str, item: dict[str, object], path: Path) -> None:
    dark, accent, accent2, pale, pale2 = palette(code)
    direction = str(item["dir"])
    devices = [("iPhone / iPad", "▯"), ("Android", "◉"), ("Desktop", "▰")]
    cards = []
    for index, (name, icon) in enumerate(devices):
        x = 60 + index * 380
        cards.append(
            f'<g transform="translate({x} 235)"><rect width="330" height="345" rx="28" fill="#fff"/>'
            f'<circle cx="165" cy="92" r="62" fill="{pale2 if index != 1 else pale}" stroke="{accent if index != 2 else accent2}" stroke-width="4"/>'
            f'<text x="165" y="111" text-anchor="middle" fill="{dark}" font-family="Noto Sans,sans-serif" font-size="45" font-weight="800">{icon}</text>'
            + svg_text_lines([name], 165, 196, 28, dark, 850, anchor="middle", direction=direction)
            + svg_text_lines(wrap_lines(str(item["devices"]), 35, 4), 30, 245, 16, "#53657f", 450, direction=direction, gap=27)
            + '</g>'
        )
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" xml:lang="{code}" viewBox="0 0 1200 675" role="img">'
        f'<title>{h(str(item["devices_title"]))}</title><desc>{h(str(item["devices"]))}</desc>'
        f'<rect width="1200" height="675" rx="38" fill="{dark}"/>'
        f'<circle cx="1120" cy="80" r="220" fill="{accent2}" opacity=".16"/>'
        + svg_text_lines(wrap_lines(str(item["devices_title"]), 55, 2), 60, 82, 40, "#ffffff", 850, direction=direction)
        + svg_text_lines([f'{item["flag"]} {item["name"]} · ORIGINAL VISUAL 3/5'], 60, 175, 18, "#cdeaff", 700, direction=direction)
        + ''.join(cards)
        + '</svg>'
    )
    path.write_text(svg, encoding="utf-8")


def write_trouble(code: str, item: dict[str, object], path: Path) -> None:
    dark, accent, accent2, pale, pale2 = palette(code)
    direction = str(item["dir"])
    issues = list(item["issues"])[:4]
    boxes = []
    for index, issue in enumerate(issues):
        y = 190 + index * 112
        color = accent if index % 2 == 0 else accent2
        boxes.append(
            f'<g transform="translate(250 {y})"><rect width="700" height="88" rx="22" fill="#fff" stroke="{color}" stroke-width="3"/>'
            f'<circle cx="50" cy="44" r="28" fill="{color}"/><text x="50" y="53" text-anchor="middle" fill="#fff" font-family="Noto Sans,sans-serif" font-size="22" font-weight="850">{index + 1}</text>'
            + svg_text_lines(wrap_lines(str(issue[0]), 42, 2), 100, 39, 22, dark, 800, direction=direction, gap=27)
            + '</g>'
        )
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" xml:lang="{code}" viewBox="0 0 1200 675" role="img">'
        f'<title>{h(str(item["trouble_title"]))}</title><desc>{h(" · ".join(str(issue[0]) for issue in issues))}</desc>'
        f'<rect width="1200" height="675" rx="38" fill="{pale2}"/>'
        + svg_text_lines(wrap_lines(str(item["trouble_title"]), 55, 2), 60, 78, 40, dark, 850, direction=direction)
        + svg_text_lines([f'{item["flag"]} {item["name"]} · ORIGINAL VISUAL 4/5'], 60, 155, 18, accent, 700, direction=direction)
        + ''.join(boxes)
        + svg_text_lines([f'{code.upper()} · SOURCE → ACCESS → OPTIONS → FILE'], 600, 655, 16, "#63738c", 650, anchor="middle", direction=direction)
        + '</svg>'
    )
    path.write_text(svg, encoding="utf-8")


def write_poster(code: str, item: dict[str, object], path: Path) -> None:
    dark, accent, accent2, pale, _ = palette(code)
    direction = str(item["dir"])
    title = wrap_lines(str(item["video_title"]), 40 if code not in {"ja", "zh", "ko"} else 22, 2)
    steps = list(item["media_steps"])
    cards = []
    for index, label in enumerate(steps):
        x = 70 + index * 265
        cards.append(
            f'<g transform="translate({x} 285)"><rect width="225" height="190" rx="24" fill="#fff"/>'
            f'<circle cx="112" cy="63" r="38" fill="{accent if index % 2 == 0 else accent2}"/>'
            f'<text x="112" y="74" text-anchor="middle" fill="#fff" font-family="Noto Sans,sans-serif" font-size="30" font-weight="850">{index + 1}</text>'
            + svg_text_lines(wrap_lines(str(label), 18, 2), 112, 137, 21, dark, 800, anchor="middle", direction=direction)
            + '</g>'
        )
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" xml:lang="{code}" viewBox="0 0 1200 675" role="img">'
        f'<title>{h(str(item["video_title"]))}</title><desc>{h(str(item["video_note"]))}</desc>'
        f'<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="{dark}"/><stop offset=".64" stop-color="{accent}"/><stop offset="1" stop-color="{accent2}"/></linearGradient></defs>'
        '<rect width="1200" height="675" rx="38" fill="url(#g)"/>'
        f'<circle cx="1080" cy="80" r="220" fill="{pale}" opacity=".15"/>'
        + svg_text_lines([f'{item["flag"]} {item["name"]} · ORIGINAL VIDEO'], 70, 78, 22, "#d8f4ff", 750, direction=direction)
        + svg_text_lines(title, 70, 145, 44, "#ffffff", 850, direction=direction)
        + ''.join(cards)
        + f'<circle cx="600" cy="585" r="54" fill="#fff"/><path d="M585 555 630 585 585 615Z" fill="{accent}"/>'
        + svg_text_lines([f'{code.upper()} · UNIQUE VIDEO POSTER 5/5'], 600, 660, 16, "#dff4ff", 650, anchor="middle", direction=direction)
        + '</svg>'
    )
    path.write_text(svg, encoding="utf-8")


def create_video(code: str, svg_paths: list[Path], target: Path) -> None:
    with tempfile.TemporaryDirectory(prefix=f"x-hd-{code}-") as directory:
        temp = Path(directory)
        pngs = []
        for index, svg_path in enumerate(svg_paths):
            png = temp / f"frame-{index}.png"
            subprocess.run(
                ["rsvg-convert", "-w", "1280", "-h", "720", str(svg_path), "-o", str(png)],
                check=True,
            )
            pngs.append(png)
        concat = temp / "concat.txt"
        lines = []
        for png in pngs:
            lines.append(f"file '{png.as_posix()}'")
            lines.append("duration 3")
        lines.append(f"file '{pngs[-1].as_posix()}'")
        concat.write_text("\n".join(lines) + "\n", encoding="utf-8")
        subprocess.run(
            [
                "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
                "-f", "concat", "-safe", "0", "-i", str(concat),
                "-vf", "fps=24,scale=640:360:force_original_aspect_ratio=decrease,pad=640:360:(ow-iw)/2:(oh-ih)/2:color=black,format=yuv420p",
                "-c:v", "libx264", "-preset", "veryfast", "-crf", "31",
                "-movflags", "+faststart", "-t", "12", str(target),
            ],
            check=True,
        )


def alternate_links(meta: dict[str, dict[str, object]]) -> str:
    links = []
    for code in ORDER:
        links.append(
            f'<link rel="alternate" hreflang="{code}" href="{page_url(str(meta[code]["slug"]))}">'
        )
    links.append(
        f'<link rel="alternate" hreflang="x-default" href="{page_url(ENGLISH_SLUG)}">'
    )
    return "\n".join(links)


def render_list(items: list[str]) -> str:
    return "".join(f"<li>{h(str(item))}</li>" for item in items)


def render_faq(items: list[list[str]]) -> str:
    return "".join(
        f"<details><summary>{h(str(question))}</summary><p>{h(str(answer))}</p></details>"
        for question, answer in items
    )


def render_issues(items: list[list[str]]) -> str:
    return "".join(
        f'<section class="issue"><h3>{h(str(title))}</h3><p>{h(str(answer))}</p></section>'
        for title, answer in items
    )


def language_links(item: dict[str, object], meta: dict[str, dict[str, object]]) -> str:
    label = h(str(item["related_title"]))
    links = "".join(
        f'<a href="{h(str(meta[code]["slug"]))}" hreflang="{code}">{h(str(meta[code]["flag"]))} {h(str(meta[code]["name"]))}</a>'
        for code in ORDER
    )
    return f'<section class="languages"><h2>{label}</h2><div>{links}</div></section>'


def article_html(code: str, item: dict[str, object], meta: dict[str, dict[str, object]]) -> str:
    slug = str(item["slug"])
    canonical = page_url(slug)
    dark, accent, accent2, pale, pale2 = palette(code)
    direction = str(item["dir"])
    prefix = f"x-hd-{code}"
    tool_url = f"https://downloader-x.com/{code}/download"
    how_to_steps = [
        {"@type": "HowToStep", "position": index + 1, "name": str(step), "text": str(step)}
        for index, step in enumerate(item["steps"])
    ]
    faq_nodes = [
        {
            "@type": "Question",
            "name": str(question),
            "acceptedAnswer": {"@type": "Answer", "text": str(answer)},
        }
        for question, answer in item["faq"]
    ]
    json_ld = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Article",
                "headline": str(item["h1"]),
                "description": str(item["meta"]),
                "image": f"{BASE}/assets/{prefix}-cover.svg",
                "datePublished": DATE,
                "dateModified": DATE,
                "author": {"@type": "Organization", "name": "Downloader-X Guides"},
                "publisher": {"@type": "Organization", "name": "Downloader-X Guides"},
                "mainEntityOfPage": canonical,
                "inLanguage": code,
            },
            {
                "@type": "HowTo",
                "name": str(item["h1"]),
                "totalTime": "PT3M",
                "step": how_to_steps,
            },
            {"@type": "FAQPage", "mainEntity": faq_nodes},
            {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {"@type": "ListItem", "position": 1, "name": "Downloader-X Guides", "item": f"{BASE}/"},
                    {"@type": "ListItem", "position": 2, "name": str(item["h1"]), "item": canonical},
                ],
            },
            {
                "@type": "VideoObject",
                "name": str(item["video_title"]),
                "description": str(item["video_note"]),
                "thumbnailUrl": f"{BASE}/assets/{prefix}-video-poster.svg",
                "contentUrl": f"{BASE}/assets/{prefix}-walkthrough.mp4",
                "uploadDate": DATE,
                "duration": "PT12S",
                "inLanguage": code,
            },
        ],
    }
    structured = json.dumps(json_ld, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    language_nav = language_links(item, meta)
    return f'''<!doctype html>
<html lang="{code}" dir="{direction}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{h(str(item["title"]))}</title>
<meta name="description" content="{h(str(item["meta"]))}">
<meta name="robots" content="index,follow,max-image-preview:large,max-video-preview:-1">
<meta name="author" content="Downloader-X Guides">
<link rel="canonical" href="{canonical}">
{alternate_links(meta)}
<meta property="og:type" content="article">
<meta property="og:title" content="{h(str(item["h1"]))}">
<meta property="og:description" content="{h(str(item["meta"]))}">
<meta property="og:url" content="{canonical}">
<meta property="og:locale" content="{h(str(item["og_locale"]))}">
<meta property="og:image" content="{BASE}/assets/{prefix}-cover.svg">
<meta property="og:image:alt" content="{h(str(item["h1"]))}">
<meta property="article:published_time" content="2026-08-30T00:00:00+07:00">
<meta property="article:modified_time" content="2026-08-30T00:00:00+07:00">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{h(str(item["h1"]))}">
<meta name="twitter:description" content="{h(str(item["meta"]))}">
<meta name="twitter:image" content="{BASE}/assets/{prefix}-cover.svg">
<script type="application/ld+json">{structured}</script>
<style>
:root{{--ink:{dark};--accent:{accent};--accent2:{accent2};--pale:{pale};--pale2:{pale2};--line:#d7e3f1;--muted:#5c6e88}}*{{box-sizing:border-box}}html{{scroll-behavior:smooth}}body{{margin:0;background:#f6f8fc;color:var(--ink);font:17px/1.78 "Noto Sans","Noto Sans CJK SC","Noto Sans Arabic",system-ui,sans-serif}}a{{color:var(--accent)}}.wrap{{max-width:1120px;margin:auto;padding:24px 22px 72px}}.nav{{display:flex;justify-content:space-between;align-items:center;gap:20px;margin-bottom:28px;font-weight:800}}.nav a{{text-decoration:none}}.hero{{padding:56px;border-radius:30px;color:#fff;background:linear-gradient(135deg,var(--ink),var(--accent) 64%,var(--accent2));box-shadow:0 24px 65px #102a5526}}.eyebrow{{font-size:13px;letter-spacing:.09em;text-transform:uppercase;font-weight:800;color:#d8f4ff}}.hero h1{{font-size:clamp(39px,6vw,66px);line-height:1.08;margin:14px 0 18px;max-width:930px}}.hero p{{font-size:20px;max-width:820px;margin:0;color:#edf7ff}}.meta{{margin-top:18px;font-size:14px;color:#d7eaff}}.cta{{display:inline-block;margin-top:25px;padding:14px 22px;border-radius:12px;background:#fff;color:var(--accent)!important;text-decoration:none;font-weight:850}}.layout{{display:grid;grid-template-columns:minmax(0,820px) 240px;gap:34px;align-items:start;margin-top:34px}}article{{min-width:0;background:#fff;border:1px solid var(--line);border-radius:24px;padding:38px 46px 58px}}article h2{{font-size:31px;line-height:1.25;margin:46px 0 14px}}article h3{{font-size:21px;line-height:1.32;margin:18px 0 7px}}article p{{margin:0 0 19px}}article li{{margin:8px 0}}.toc{{position:sticky;top:20px;background:#fff;border:1px solid var(--line);border-radius:18px;padding:20px}}.toc strong{{display:block;margin-bottom:10px}}.toc a{{display:block;padding:6px 0;font-size:14px;text-decoration:none;color:#53657f}}.answer,.note,.rights{{padding:23px 25px;border-radius:17px;margin:24px 0}}.answer{{background:#eafaf4;border-inline-start:5px solid #16a36f}}.note{{background:var(--pale);border-inline-start:5px solid var(--accent)}}.rights{{background:#fff7dd;border-inline-start:5px solid #d59c12}}.answer h2,.note h3,.rights h3{{margin-top:0}}.steps{{counter-reset:s;list-style:none;padding:0}}.steps li{{position:relative;padding:18px 20px 18px 68px;border:1px solid var(--line);border-radius:15px;margin:13px 0;background:#fbfdff}}[dir="rtl"] .steps li{{padding:18px 68px 18px 20px}}.steps li:before{{counter-increment:s;content:counter(s);position:absolute;inset-inline-start:18px;top:18px;width:34px;height:34px;border-radius:11px;background:var(--accent);color:#fff;display:grid;place-items:center;font-weight:850}}figure{{margin:30px 0}}figure img{{display:block;width:100%;height:auto;border:1px solid var(--line);border-radius:20px;background:#fff}}figcaption{{margin-top:10px;color:#65758e;font-size:14px}}.video-card{{margin:30px 0;padding:18px;border-radius:20px;background:var(--ink);color:#fff}}.video-card video{{display:block;width:100%;aspect-ratio:16/9;border-radius:13px;background:#020617}}.video-card h2{{margin:18px 4px 8px;color:#fff;font-size:26px}}.video-card p{{margin:0 4px 7px;color:#d7e8ff}}.checks{{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;padding:0;list-style:none}}.checks li{{border:1px solid var(--line);border-radius:14px;padding:15px;background:#fbfdff}}.issues{{display:grid;grid-template-columns:repeat(2,1fr);gap:13px}}.issue{{border:1px solid var(--line);border-radius:15px;padding:18px;background:#fbfdff}}.issue h3{{margin-top:0}}details{{border:1px solid var(--line);border-radius:14px;padding:16px 18px;margin:11px 0}}summary{{cursor:pointer;font-weight:850}}.languages{{margin-top:44px;padding-top:10px;border-top:1px solid var(--line)}}.languages div{{display:flex;flex-wrap:wrap;gap:8px}}.languages a{{padding:8px 11px;border:1px solid var(--line);border-radius:999px;text-decoration:none;font-size:14px}}.final{{margin-top:40px;padding:34px;border-radius:20px;background:var(--ink);color:#fff;text-align:center}}.final h2{{color:#fff;margin-top:0}}.final p{{color:#d7e8ff}}.foot{{margin-top:34px;padding-top:20px;border-top:1px solid var(--line);color:#65758e;font-size:14px}}@media(max-width:920px){{.layout{{grid-template-columns:1fr}}.toc{{position:static;order:-1}}}}@media(max-width:650px){{.wrap{{padding:16px}}.hero{{padding:37px 24px}}.hero h1{{font-size:40px}}article{{padding:27px 20px}}article h2{{font-size:27px}}.nav{{align-items:flex-start}}.checks,.issues{{grid-template-columns:1fr}}}}
</style>
</head>
<body><main class="wrap">
<nav class="nav"><a href="../index.html"><strong>Downloader-X Guides</strong></a><a href="{tool_url}">{h(str(item["tool"]))} ↗</a></nav>
<header class="hero"><div class="eyebrow">{h(str(item["flag"]))} {h(str(item["name"]))} · X / Twitter · HD</div><h1>{h(str(item["h1"]))}</h1><p>{h(str(item["subtitle"]))}</p><div class="meta">{DATE} · 5 original SVG visuals · 1 original video · 20-language series</div><a class="cta" href="{tool_url}">{h(str(item["tool"]))}</a></header>
<div class="layout"><article>
<section class="answer" id="quick"><h2>{h(str(item["quick_title"]))}</h2><p>{h(str(item["quick"]))}</p></section>
<figure><img src="../assets/{prefix}-cover.svg" width="1200" height="630" alt="{h(str(item["h1"]))}" loading="eager"><figcaption>{h(str(item["video_note"]))}</figcaption></figure>
<h2 id="public">{h(str(item["public_title"]))}</h2><p>{h(str(item["public"]))}</p><div class="rights"><h3>{h(str(item["rights_title"]))}</h3><p>{h(str(item["rights"]))}</p></div>
<h2 id="copy">{h(str(item["copy_title"]))}</h2><p>{h(str(item["copy_intro"]))}</p><ol class="steps">{render_list(list(item["steps"]))}</ol>
<h2 id="process">{h(str(item["process_title"]))}</h2><p>{h(str(item["process"]))}</p>
<section class="video-card" id="video"><video controls playsinline preload="metadata" poster="../assets/{prefix}-video-poster.svg"><source src="../assets/{prefix}-walkthrough.mp4" type="video/mp4">Video unavailable.</video><h2>{h(str(item["video_title"]))}</h2><p>{h(str(item["video_note"]))}</p></section>
<h2 id="quality">{h(str(item["quality_title"]))}</h2><p>{h(str(item["quality"]))}</p><figure><img src="../assets/{prefix}-quality.svg" width="1200" height="675" alt="{h(str(item["quality_title"]))}" loading="lazy"><figcaption>{h(str(item["quality_title"]))}</figcaption></figure>
<h2 id="devices">{h(str(item["devices_title"]))}</h2><p>{h(str(item["devices"]))}</p><figure><img src="../assets/{prefix}-devices.svg" width="1200" height="675" alt="{h(str(item["devices_title"]))}" loading="lazy"><figcaption>{h(str(item["devices_title"]))}</figcaption></figure>
<h2 id="verify">{h(str(item["verify_title"]))}</h2><p>{h(str(item["verify_intro"]))}</p><ul class="checks">{render_list(list(item["verify_items"]))}</ul>
<h2 id="audit">{h(str(item["audit_title"]))}</h2><p>{h(str(item["audit"]))}</p>
<h2 id="trouble">{h(str(item["trouble_title"]))}</h2><figure><img src="../assets/{prefix}-trouble.svg" width="1200" height="675" alt="{h(str(item["trouble_title"]))}" loading="lazy"><figcaption>{h(str(item["trouble_title"]))}</figcaption></figure><div class="issues">{render_issues(list(item["issues"]))}</div>
<h2 id="security">{h(str(item["security_title"]))}</h2><p>{h(str(item["security"]))}</p>
<h2 id="organization">{h(str(item["organization_title"]))}</h2><p>{h(str(item["organization"]))}</p>
<h2 id="checklist">{h(str(item["checklist_title"]))}</h2><ol>{render_list(list(item["checklist"]))}</ol>
<h2 id="faq">{h(str(item["faq_title"]))}</h2>{render_faq(list(item["faq"]))}
{language_nav}
<section class="final"><h2>{h(str(item["final_title"]))}</h2><p>{h(str(item["final_text"]))}</p><a class="cta" href="{tool_url}">{h(str(item["button"]))}</a></section>
</article><aside class="toc"><strong>{h(str(item["name"]))}</strong><a href="#quick">{h(str(item["quick_title"]))}</a><a href="#public">{h(str(item["public_title"]))}</a><a href="#copy">{h(str(item["copy_title"]))}</a><a href="#process">{h(str(item["process_title"]))}</a><a href="#video">{h(str(item["video_title"]))}</a><a href="#quality">{h(str(item["quality_title"]))}</a><a href="#devices">{h(str(item["devices_title"]))}</a><a href="#verify">{h(str(item["verify_title"]))}</a><a href="#trouble">{h(str(item["trouble_title"]))}</a><a href="#faq">{h(str(item["faq_title"]))}</a></aside></div>
<footer class="foot">Downloader-X Guides · {h(str(item["name"]))} · Original article, images and video for this locale · Public media you own or are authorized to save</footer>
</main></body></html>'''


def update_english(meta: dict[str, dict[str, object]]) -> None:
    path = ARTICLES / ENGLISH_SLUG
    html = path.read_text(encoding="utf-8")
    html = re.sub(r'\n?<link rel="alternate" hreflang="[^"]+" href="[^"]+">', "", html)
    canonical = f'<link rel="canonical" href="{page_url(ENGLISH_SLUG)}">'
    require(canonical in html, "English canonical not found")
    html = html.replace(canonical, canonical + "\n" + alternate_links(meta), 1)
    path.write_text(html, encoding="utf-8")


def update_index(data: dict[str, dict[str, object]]) -> None:
    path = ROOT / "index.html"
    html = path.read_text(encoding="utf-8")
    start = "<!-- X_HD_20_LOCALES_START -->"
    end = "<!-- X_HD_20_LOCALES_END -->"
    html = re.sub(re.escape(start) + r".*?" + re.escape(end), "", html, flags=re.DOTALL)
    cards = []
    for code in ORDER[1:]:
        item = data[code]
        summary = str(item["meta"])
        if len(summary) > 170:
            summary = summary[:167].rstrip() + "…"
        cards.append(
            f'<a class="card" href="articles/{h(str(item["slug"]))}"><div class="icon">{h(str(item["flag"]))}</div><div><div class="tag">{h(str(item["name"]))} · X · HD</div><h3>{h(str(item["h1"]))}</h3><p>{h(summary)}</p></div></a>'
        )
    block = start + "".join(cards) + end
    marker = '<section class="grid">'
    require(marker in html, "Index grid not found")
    html = html.replace(marker, marker + block, 1)
    html = re.sub(r'<span>\d+ บทความ</span>', '<span>57 บทความ</span>', html, count=1)
    path.write_text(html, encoding="utf-8")


def update_sitemap(meta: dict[str, dict[str, object]]) -> None:
    path = ROOT / "sitemap.xml"
    xml = path.read_text(encoding="utf-8")
    for code in ORDER[1:]:
        canonical = page_url(str(meta[code]["slug"]))
        if canonical not in xml:
            entry = f'<url><loc>{canonical}</loc><lastmod>{DATE}</lastmod></url>'
            xml = xml.replace("</urlset>", entry + "</urlset>", 1)
    path.write_text(xml, encoding="utf-8")


def visible_text(html: str) -> str:
    no_code = re.sub(r"<(script|style)\b.*?</\1>", " ", html, flags=re.DOTALL | re.IGNORECASE)
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", no_code)).strip()


def validate_article(code: str, item: dict[str, object], meta: dict[str, dict[str, object]]) -> dict[str, object]:
    path = ARTICLES / str(item["slug"])
    html = path.read_text(encoding="utf-8")
    canonical = page_url(str(item["slug"]))
    require(f'<link rel="canonical" href="{canonical}">' in html, f"{code}: canonical mismatch")
    hreflangs = re.findall(r'<link rel="alternate" hreflang="([^"]+)"', html)
    require(set(hreflangs) == set(ORDER + ["x-default"]), f"{code}: hreflang set mismatch")
    require(len(re.findall(r"<h1\b", html, re.IGNORECASE)) == 1, f"{code}: H1 count")
    title_match = re.search(r"<title>(.*?)</title>", html, re.DOTALL)
    meta_match = re.search(r'<meta name="description" content="([^"]+)"', html)
    require(title_match is not None and meta_match is not None, f"{code}: metadata missing")
    require(len(meta_match.group(1)) >= 60, f"{code}: meta too short")
    text = visible_text(html)
    words = re.findall(r"\b[\w’'-]+\b", text, flags=re.UNICODE)
    chars = len(re.sub(r"\s+", "", text))
    if code in {"th", "ja", "zh", "ko"}:
        require(chars >= 3000, f"{code}: article too short ({chars} chars)")
    else:
        require(len(words) >= 650, f"{code}: article too short ({len(words)} words)")
    images = re.findall(r'<img\b[^>]*src="([^"]+)"', html)
    poster = re.search(r'<video\b[^>]*poster="([^"]+)"', html)
    video = re.search(r'<source\b[^>]*src="([^"]+)"[^>]*type="video/mp4"', html)
    require(len(images) == 4, f"{code}: expected 4 illustrations")
    require(poster is not None and video is not None, f"{code}: video media missing")
    refs = images + [poster.group(1), video.group(1)]
    require(len(refs) == len(set(refs)) == 6, f"{code}: repeated media ref")
    for ref in refs:
        target = (path.parent / ref).resolve()
        require(target.is_file(), f"{code}: missing media {ref}")
    json_blocks = re.findall(r'<script type="application/ld\+json">(.*?)</script>', html, flags=re.DOTALL)
    require(len(json_blocks) == 1, f"{code}: JSON-LD count")
    graph = json.loads(json_blocks[0])["@graph"]
    types = {node.get("@type") for node in graph}
    require({"Article", "HowTo", "FAQPage", "BreadcrumbList", "VideoObject"} <= types, f"{code}: schema types")
    return {"code": code, "words": len(words), "chars": chars, "media": len(refs)}


def validate_english(meta: dict[str, dict[str, object]]) -> dict[str, object]:
    path = ARTICLES / ENGLISH_SLUG
    html = path.read_text(encoding="utf-8")
    hreflangs = re.findall(r'<link rel="alternate" hreflang="([^"]+)"', html)
    require(set(hreflangs) == set(ORDER + ["x-default"]), "en: hreflang set mismatch")
    images = re.findall(r'<img\b[^>]*src="([^"]+)"', html)
    poster = re.search(r'<video\b[^>]*poster="([^"]+)"', html)
    video = re.search(r'<source\b[^>]*src="([^"]+)"[^>]*type="video/mp4"', html)
    require(len(images) == 4 and poster and video, "en: media missing")
    return {"code": "en", "words": len(re.findall(r"\b[\w’'-]+\b", visible_text(html))), "media": 6}


def validate_media(meta: dict[str, dict[str, object]]) -> dict[str, object]:
    paths = [
        ASSETS / "how-to-download-x-twitter-videos-hd-any-device-cover.svg",
        ASSETS / "how-to-download-x-twitter-videos-hd-any-device-quality-map.svg",
        ASSETS / "how-to-download-x-twitter-videos-hd-any-device-device-flow.svg",
        ASSETS / "how-to-download-x-twitter-videos-hd-any-device-troubleshooting.svg",
        ASSETS / "how-to-download-x-twitter-videos-hd-any-device-video-poster.svg",
        ASSETS / "how-to-download-x-twitter-videos-hd-any-device-walkthrough.mp4",
    ]
    for code in ORDER[1:]:
        prefix = f"x-hd-{code}"
        paths.extend([
            ASSETS / f"{prefix}-cover.svg",
            ASSETS / f"{prefix}-quality.svg",
            ASSETS / f"{prefix}-devices.svg",
            ASSETS / f"{prefix}-trouble.svg",
            ASSETS / f"{prefix}-video-poster.svg",
            ASSETS / f"{prefix}-walkthrough.mp4",
        ])
    require(len(paths) == 120, f"Expected 120 locale media files, found {len(paths)}")
    hashes: dict[str, str] = {}
    videos = []
    for path in paths:
        require(path.is_file(), f"Missing media {path.name}")
        digest = hashlib.sha256(path.read_bytes()).hexdigest()
        require(digest not in hashes, f"Duplicate media bytes: {path.name} == {hashes.get(digest)}")
        hashes[digest] = path.name
        if path.suffix == ".svg":
            ET.parse(path)
        else:
            probe = json.loads(subprocess.check_output([
                "ffprobe", "-v", "error", "-show_entries",
                "format=duration,size:stream=codec_name,width,height", "-of", "json", str(path)
            ], text=True))
            stream = probe["streams"][0]
            duration = float(probe["format"]["duration"])
            require(stream.get("codec_name") == "h264", f"{path.name}: codec")
            require(duration >= 10, f"{path.name}: duration")
            require(int(probe["format"]["size"]) > 1000, f"{path.name}: size")
            videos.append({"file": path.name, "duration": duration, "width": stream.get("width"), "height": stream.get("height")})
    return {"files": len(paths), "uniqueHashes": len(hashes), "videos": len(videos)}


def validate_index_and_sitemap(meta: dict[str, dict[str, object]]) -> dict[str, object]:
    index = (ROOT / "index.html").read_text(encoding="utf-8")
    require("57 บทความ" in index, "Index article count is not 57")
    for code in ORDER:
        slug = str(meta[code]["slug"])
        require(index.count(f'articles/{slug}') == 1, f"Index card count for {code}")
    sitemap = (ROOT / "sitemap.xml").read_text(encoding="utf-8")
    ET.fromstring(sitemap)
    for code in ORDER:
        require(sitemap.count(page_url(str(meta[code]["slug"]))) == 1, f"Sitemap count for {code}")
    return {"indexCards": 20, "sitemapUrls": 20, "articleCount": 57}


def main() -> None:
    data: dict[str, dict[str, object]] = {}
    for index in range(1, 4):
        data.update(load_data(ROOT / "scripts" / f"x_hd_locale_data_{index}.py", f"x_hd_locale_data_{index}"))
    require(set(data) == set(ORDER[1:]), f"Locale data mismatch: {sorted(data)}")
    meta = {"en": ENGLISH_META, **data}
    require(len({str(meta[code]["slug"]) for code in ORDER}) == 20, "Duplicate locale slug")
    ARTICLES.mkdir(exist_ok=True)
    ASSETS.mkdir(exist_ok=True)

    for code in ORDER[1:]:
        item = data[code]
        prefix = f"x-hd-{code}"
        cover = ASSETS / f"{prefix}-cover.svg"
        quality = ASSETS / f"{prefix}-quality.svg"
        devices = ASSETS / f"{prefix}-devices.svg"
        trouble = ASSETS / f"{prefix}-trouble.svg"
        poster = ASSETS / f"{prefix}-video-poster.svg"
        video = ASSETS / f"{prefix}-walkthrough.mp4"
        write_cover(code, item, cover)
        write_quality(code, item, quality)
        write_devices(code, item, devices)
        write_trouble(code, item, trouble)
        write_poster(code, item, poster)
        create_video(code, [cover, quality, devices, trouble], video)
        (ARTICLES / str(item["slug"])).write_text(article_html(code, item, meta), encoding="utf-8")

    update_english(meta)
    update_index(data)
    update_sitemap(meta)

    article_results = [validate_english(meta)]
    article_results.extend(validate_article(code, data[code], meta) for code in ORDER[1:])
    media_result = validate_media(meta)
    navigation_result = validate_index_and_sitemap(meta)
    print(json.dumps({
        "locales": ORDER,
        "localeCount": len(ORDER),
        "articles": article_results,
        "media": media_result,
        "navigation": navigation_result,
        "status": "PASS",
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
