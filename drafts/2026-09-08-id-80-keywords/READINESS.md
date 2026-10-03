# Indonesian article import — publication readiness

Status: DRAFT ONLY; production publication NOT VERIFIED.

The supplied files.zip contains 12 new article drafts and an 80-keyword mapping, not 80 finished articles. The live Guides flow was verified on an existing Indonesian article. The current guide catalog has 449 entries, including 114 Indonesian entries. No uploaded slug exactly matches an existing catalog slug; semantic/topic overlap is not fully assessed.

## Verified blockers in the uploaded files

- 65 image references, with no image binaries supplied in either ZIP.
- All 12 articles contain empty source-example fields and placeholder bylines.
- A02 and A08 have unfilled test-result tables.
- A05 contains mutually exclusive audio-support versions that have not been selected.
- A06/A07 contain unverified Instagram feature claims; the ZIP's claim that the provider is broken has NOT been independently verified and must not be treated as current production evidence.
- Supplied HTML files have no canonical tags yet; integrate through the existing guide metadata pipeline when ready.
- Existing sitemap snapshots are historical inputs, not a replacement for current production sitemap.

## Import scope

Original Markdown and HTML preserved without rewriting. Neither articles.json nor public sitemap has been changed. No downloader code, providers, APIs, authentication, schemas, DNS, or UI changes. This branch must remain a draft until missing evidence/media and mutually exclusive copy are resolved. Do not fabricate test results, authorship or screenshots.

## Next publication step

Complete media and verifiable copy, compare topics with the live Indonesian catalog, map each ready HTML file to articles/<slug>.html, add matching metadata to articles.json and sitemap through the existing format, and verify each published /id/guides/<slug>/ page. Preserve existing URLs and their canonical/hreflang behavior.
