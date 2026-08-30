from __future__ import annotations

from html import unescape
from pathlib import Path
import hashlib
import json
import re
import subprocess
import xml.etree.ElementTree as ET

ARTICLE_PATH = Path("articles/how-to-download-x-twitter-videos-hd-any-device.html")
INDEX_PATH = Path("index.html")
SITEMAP_PATH = Path("sitemap.xml")
CANONICAL = (
    "https://rn473147-del.github.io/downloader-x-guides/articles/"
    "how-to-download-x-twitter-videos-hd-any-device.html"
)
ARTICLE_HREF = "articles/how-to-download-x-twitter-videos-hd-any-device.html"

EXTRA_SECTIONS = r'''
<h2 id="source-audit">Audit the source before you save anything</h2>
<p>A strong X video workflow begins with a source audit. Record the account handle, the visible post date, a short description of the clip, the permanent post URL, and the reason you are allowed to keep a copy. This takes less than a minute and prevents a common problem: a file survives on a device while its origin and permission are forgotten. When a project involves several clips, create a simple text or spreadsheet record rather than relying on memory or an automatically generated filename.</p>
<p>Compare the post opened from the copied URL with the screen where you found it. The account, text, thumbnail, duration, and video subject should match. Be cautious when a quoted post contains one clip while the quoting account adds another; copy the URL for the specific post that actually owns the media you need. The same rule applies to replies and threads. A thread URL identifies one post, not every media item in the conversation.</p>
<p>Also check whether the creator has written usage instructions in the post, profile, linked website, or license statement. A request to credit the creator, avoid commercial use, or refrain from redistribution should remain attached to your project notes. If the permission is unclear, ask before downloading or limit yourself to viewing the public source.</p>

<h2 id="quality-audit">Read quality labels as evidence, not promises</h2>
<p>Resolution labels describe pixel dimensions, but they do not prove overall quality. A 1080p file can look soft when the original upload was heavily compressed, while a clean 720p file may look better on a phone. Bitrate, frame rate, codec, source lighting, motion, and prior edits all influence the result. Treat every returned variant as evidence from the current source, then verify it after saving.</p>
<p>For a short reference clip, a balanced HD option can reduce storage and load quickly. For text, diagrams, or a large display, the highest genuinely available resolution may preserve useful detail. Do not upscale a lower-resolution result merely to place “1080p” in the filename. Upscaling changes dimensions but cannot recreate detail that was not present.</p>
<p>Audio deserves its own check. Some media systems store video and audio separately at higher resolutions. Select an option that clearly includes sound when sound matters, and play the saved result before deleting any source notes. If the post itself is silent, the downloaded file should not be advertised as containing audio.</p>

<h2 id="repeatable-workflow">Build a repeatable device workflow</h2>
<p>Use one predictable folder for temporary downloads and a separate project folder for verified files. A practical filename can include a short topic, creator handle, source date, and quality, for example <code>event-summary_creator_2026-08-30_720p.mp4</code>. Avoid filenames that expose private information or imply ownership you do not have.</p>
<p>After verification, keep only the variants you need. Multiple quality copies consume space and make later selection confusing. Back up an authorized file only when the project requires it, and protect cloud folders that contain personal or unpublished material. On a shared computer, clear temporary copies and sign out of accounts without erasing records required for permission or attribution.</p>
<p>For editorial, classroom, or research use, keep a short log of what was checked: exact URL, public-access result, selected variant, file size, playback result, rights basis, and any credit requirement. This makes the process reviewable and helps another person understand why the file was retained.</p>

<h2 id="comparison">Why a focused X guide is more useful than a generic downloader list</h2>
<p>A generic list often repeats phrases such as “fast,” “free,” or “HD” without explaining what happens when a link points to a reply, when 1080p is absent, where an iPhone stores the file, or why an HTML response is not a video. This guide focuses on those decision points. The objective is not to promise every format for every post; it is to help a reader reach a correct, verifiable result with an authorized public source.</p>
<p>The same standard applies when the interface or extraction provider changes. The permanent checks remain stable: identify the exact post, confirm public access, use the real options returned, inspect the saved file, and retain permission information. These checks prevent false success messages from being treated as completed downloads.</p>
'''

CARD = (
    '<a class="card" href="articles/how-to-download-x-twitter-videos-hd-any-device.html">'
    '<div class="icon">𝕏</div><div><div class="tag">English · X · HD · All Devices</div>'
    '<h3>How to Download X (Twitter) Videos in HD on Any Device</h3>'
    '<p>2,000+ words, an original 14-second video, five unique SVG visuals, '
    'quality guidance, device steps, and troubleshooting.</p></div></a>'
)


def require(condition: bool, message: str) -> None:
    if not condition:
        raise SystemExit(message)


def visible_text(html: str) -> str:
    without_code = re.sub(
        r"<(script|style)\b.*?</\1>", " ", html, flags=re.DOTALL | re.IGNORECASE
    )
    return unescape(re.sub(r"<[^>]+>", " ", without_code))


def update_article() -> None:
    article = ARTICLE_PATH.read_text(encoding="utf-8")
    if 'id="source-audit"' not in article:
        needle = '<h2 id="checklist">Final 60-second checklist</h2>'
        require(needle in article, "Checklist insertion point not found")
        article = article.replace(needle, EXTRA_SECTIONS + "\n" + needle, 1)

        toc_needle = '<a href="#security">Security</a>'
        toc_insert = (
            '<a href="#source-audit">Source audit</a>'
            '<a href="#quality-audit">Quality audit</a>'
            '<a href="#repeatable-workflow">Repeatable workflow</a>'
        )
        require(toc_needle in article, "TOC insertion point not found")
        article = article.replace(toc_needle, toc_insert + toc_needle, 1)
        ARTICLE_PATH.write_text(article, encoding="utf-8")


def update_index() -> None:
    index = INDEX_PATH.read_text(encoding="utf-8")
    if ARTICLE_HREF not in index:
        grid = '<section class="grid">'
        require(grid in index, "Guides grid not found")
        index = index.replace(grid, grid + CARD, 1)
        count_match = re.search(r"(\d+) บทความ", index)
        require(count_match is not None, "Guide count not found")
        new_count = int(count_match.group(1)) + 1
        index = re.sub(r"(\d+) บทความ", f"{new_count} บทความ", index, count=1)
        INDEX_PATH.write_text(index, encoding="utf-8")


def update_sitemap() -> None:
    sitemap = SITEMAP_PATH.read_text(encoding="utf-8")
    if CANONICAL not in sitemap:
        require("</urlset>" in sitemap, "Sitemap root not found")
        entry = f"<url><loc>{CANONICAL}</loc><lastmod>2026-08-30</lastmod></url>"
        sitemap = sitemap.replace("</urlset>", entry + "</urlset>", 1)
        SITEMAP_PATH.write_text(sitemap, encoding="utf-8")


def validate() -> dict[str, object]:
    html = ARTICLE_PATH.read_text(encoding="utf-8")
    title_match = re.search(r"<title>(.*?)</title>", html, re.DOTALL | re.IGNORECASE)
    description_match = re.search(
        r'<meta name="description" content="([^"]+)"', html, re.IGNORECASE
    )
    canonical_match = re.search(
        r'<link rel="canonical" href="([^"]+)"', html, re.IGNORECASE
    )
    require(title_match is not None, "Missing title")
    require(description_match is not None, "Missing meta description")
    require(
        canonical_match is not None and canonical_match.group(1) == CANONICAL,
        "Canonical mismatch",
    )

    title = unescape(title_match.group(1).strip())
    description = unescape(description_match.group(1).strip())
    require(30 <= len(title) <= 75, f"Title length outside range: {len(title)}")
    require(
        100 <= len(description) <= 180,
        f"Description length outside range: {len(description)}",
    )
    require(
        len(re.findall(r"<h1\b", html, re.IGNORECASE)) == 1,
        "Expected exactly one H1",
    )

    words = re.findall(r"\b[\w'-]+\b", visible_text(html), flags=re.UNICODE)
    require(len(words) >= 2000, f"Visible word count below 2,000: {len(words)}")

    json_ld_blocks = re.findall(
        r'<script type="application/ld\+json">(.*?)</script>',
        html,
        re.DOTALL | re.IGNORECASE,
    )
    require(
        len(json_ld_blocks) == 1,
        f"Expected one JSON-LD block, found {len(json_ld_blocks)}",
    )
    graph = json.loads(json_ld_blocks[0]).get("@graph", [])
    types = {node.get("@type") for node in graph}
    expected_types = {"Article", "HowTo", "FAQPage", "BreadcrumbList"}
    require(expected_types <= types, f"Missing JSON-LD types: {types}")

    ids = re.findall(r'\bid="([^"]+)"', html)
    require(len(ids) == len(set(ids)), "Duplicate HTML id detected")

    image_sources = re.findall(
        r'<img\b[^>]*\bsrc="([^"]+)"', html, re.IGNORECASE
    )
    require(
        len(image_sources) == 4,
        f"Expected four article illustrations, found {len(image_sources)}",
    )
    require(
        len(image_sources) == len(set(image_sources)),
        "Repeated article image source detected",
    )

    poster_match = re.search(
        r'<video\b[^>]*\bposter="([^"]+)"', html, re.IGNORECASE
    )
    video_match = re.search(
        r'<source\b[^>]*\bsrc="([^"]+)"[^>]*type="video/mp4"',
        html,
        re.IGNORECASE,
    )
    require(
        poster_match is not None and video_match is not None,
        "Video poster or MP4 source missing",
    )

    media_refs = image_sources + [poster_match.group(1), video_match.group(1)]
    require(
        len(media_refs) == len(set(media_refs)),
        "Repeated media reference detected",
    )
    media_paths = [(Path("articles") / ref).resolve() for ref in media_refs]
    for path in media_paths:
        require(path.is_file(), f"Missing media file: {path}")

    own_hashes: dict[str, str] = {}
    for path in media_paths:
        digest = hashlib.sha256(path.read_bytes()).hexdigest()
        require(
            digest not in own_hashes,
            f"Duplicate new media bytes: {path.name} and {own_hashes.get(digest)}",
        )
        own_hashes[digest] = path.name
        if path.suffix.lower() == ".svg":
            ET.parse(path)

    new_names = {path.name for path in media_paths}
    for path in Path("assets").iterdir():
        if not path.is_file() or path.name in new_names:
            continue
        digest = hashlib.sha256(path.read_bytes()).hexdigest()
        require(
            digest not in own_hashes,
            f"New media duplicates existing asset: {path.name}",
        )

    video_path = next(path for path in media_paths if path.suffix.lower() == ".mp4")
    probe = json.loads(
        subprocess.check_output(
            [
                "ffprobe",
                "-v",
                "error",
                "-show_entries",
                "format=duration,size:stream=codec_name,width,height,avg_frame_rate",
                "-of",
                "json",
                str(video_path),
            ],
            text=True,
        )
    )
    stream = probe["streams"][0]
    duration = float(probe["format"]["duration"])
    require(stream.get("codec_name") == "h264", f"Unexpected codec: {stream.get('codec_name')}")
    require(
        stream.get("width") == 320 and stream.get("height") == 180,
        "Unexpected video dimensions",
    )
    require(13.5 <= duration <= 14.5, f"Unexpected video duration: {duration}")
    require(int(probe["format"]["size"]) > 1000, "Video file is too small")

    other_titles: list[str] = []
    for path in Path("articles").glob("*.html"):
        if path == ARTICLE_PATH:
            continue
        other_html = path.read_text(encoding="utf-8")
        match = re.search(r"<title>(.*?)</title>", other_html, re.DOTALL | re.IGNORECASE)
        if match:
            other_titles.append(unescape(match.group(1).strip()).casefold())
    require(title.casefold() not in other_titles, "Article title duplicates an existing guide")

    index = INDEX_PATH.read_text(encoding="utf-8")
    sitemap = SITEMAP_PATH.read_text(encoding="utf-8")
    require(
        index.count(ARTICLE_HREF) == 1,
        "Guide card missing or duplicated",
    )
    require("38 บทความ" in index, "Guide count not updated to 38")
    require(
        sitemap.count(CANONICAL) == 1,
        "Sitemap URL missing or duplicated",
    )
    ET.fromstring(sitemap)

    relative_links = re.findall(r'href="([^"]+)"', html, re.IGNORECASE)
    missing_relative_links: list[str] = []
    for ref in relative_links:
        if ref.startswith(("http://", "https://", "#", "mailto:", "tel:")):
            continue
        path = (ARTICLE_PATH.parent / ref.split("#", 1)[0]).resolve()
        if not path.is_file():
            missing_relative_links.append(ref)
    require(
        not missing_relative_links,
        f"Missing local article links: {missing_relative_links}",
    )

    return {
        "visibleWords": len(words),
        "titleLength": len(title),
        "descriptionLength": len(description),
        "articleIllustrations": len(image_sources),
        "svgFiles": sum(path.suffix.lower() == ".svg" for path in media_paths),
        "videoDurationSeconds": duration,
        "videoCodec": stream.get("codec_name"),
        "videoDimensions": [stream.get("width"), stream.get("height")],
        "uniqueMediaFiles": len(media_refs),
        "jsonLdTypes": sorted(str(item) for item in types),
        "uniqueTitle": "PASS",
        "relativeLinks": "PASS",
        "indexCard": "PASS",
        "sitemap": "PASS",
    }


def main() -> None:
    update_article()
    update_index()
    update_sitemap()
    print(json.dumps(validate(), indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
