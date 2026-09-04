import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const articleDir = path.join(root, "articles");
const assetDir = path.join(root, "assets");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "x-keywords-300.json"), "utf8"));
const registry = JSON.parse(fs.readFileSync(path.join(root, "articles.json"), "utf8"));
const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
const hub = fs.readFileSync(path.join(root, "x-keywords-300.html"), "utf8");
const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
const expectedLocales = ["en", "th", "es", "ja", "id", "zh", "ko", "vi", "fil", "hi", "ar", "fa", "fr", "de", "it", "pt", "ru", "tr", "ms", "nl"];
const campaignVersion = "2026-09-x-keywords-v1";
const errors = [];

function fail(message) {
  errors.push(message);
}

function stripTags(value) {
  return value
    .replace(/<script[\s\S]*?<\/script>/giu, " ")
    .replace(/<style[\s\S]*?<\/style>/giu, " ")
    .replace(/<[^>]+>/gu, " ")
    .replace(/&nbsp;/gu, " ")
    .replace(/&amp;/gu, "&")
    .replace(/&lt;/gu, "<")
    .replace(/&gt;/gu, ">")
    .replace(/&#39;/gu, "'")
    .replace(/&quot;/gu, '"')
    .replace(/\s+/gu, " ")
    .trim();
}

function wordCount(value, locale) {
  const text = stripTags(value);
  const segmenter = new Intl.Segmenter(locale, { granularity: "word" });
  let count = 0;
  for (const segment of segmenter.segment(text)) if (segment.isWordLike) count += 1;
  return count;
}

function sha(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

if (manifest.count !== 300 || manifest.items.length !== 300) fail(`Manifest must contain 300 items; found ${manifest.items.length}`);
if (JSON.stringify(manifest.locales) !== JSON.stringify(expectedLocales)) fail("Manifest locale list does not match the 20 supported locales");

const keywordSet = new Set();
const slugSet = new Set();
const canonicalSet = new Set();
const bodyHashes = new Set();
const imageHashes = new Set();
const localeCounts = Object.fromEntries(expectedLocales.map((locale) => [locale, 0]));
let minimumWords = Number.POSITIVE_INFINITY;
let maximumWords = 0;

for (const item of manifest.items) {
  const label = `${item.locale}/${item.slug}`;
  localeCounts[item.locale] = (localeCounts[item.locale] || 0) + 1;
  const keywordKey = item.keyword.normalize("NFKC").toLocaleLowerCase().trim();
  if (keywordSet.has(keywordKey)) fail(`${label}: duplicate campaign keyword: ${item.keyword}`);
  keywordSet.add(keywordKey);
  if (slugSet.has(item.slug)) fail(`${label}: duplicate slug`);
  slugSet.add(item.slug);
  if (canonicalSet.has(item.canonical)) fail(`${label}: duplicate canonical`);
  canonicalSet.add(item.canonical);

  const articlePath = path.join(articleDir, `${item.slug}.html`);
  const imageName = path.basename(new URL(item.image).pathname);
  const imagePath = path.join(assetDir, imageName);
  if (!fs.existsSync(articlePath)) { fail(`${label}: article file missing`); continue; }
  if (!fs.existsSync(imagePath)) { fail(`${label}: image file missing`); continue; }

  const html = fs.readFileSync(articlePath, "utf8");
  const svg = fs.readFileSync(imagePath, "utf8");
  if (!html.startsWith("<!doctype html>")) fail(`${label}: doctype missing`);
  if (!html.includes(`<html lang="${item.locale}"`)) fail(`${label}: incorrect HTML language`);
  if (!html.includes(`<link rel="canonical" href="${item.canonical}">`)) fail(`${label}: canonical mismatch`);
  if (!html.includes(`href="https://downloader-x.com/${item.locale}/download"`)) fail(`${label}: real downloader CTA missing`);
  if (/(?:href="#"|undefined|>undefined<)/u.test(html)) fail(`${label}: placeholder or undefined value found`);
  if (/youtube|netflix|instagram|facebook|tiktok/iu.test(html)) fail(`${label}: unrelated platform name found`);

  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/giu)];
  if (h1s.length !== 1) fail(`${label}: expected one H1; found ${h1s.length}`);
  if (!stripTags(h1s[0]?.[1] || "").toLocaleLowerCase().includes(item.keyword.toLocaleLowerCase())) fail(`${label}: H1 does not contain the target keyword`);
  const visibleArticle = html.match(/<article class="article">([\s\S]*?)<\/article>/u)?.[1] || "";
  const actualWords = wordCount(visibleArticle, item.locale);
  minimumWords = Math.min(minimumWords, actualWords);
  maximumWords = Math.max(maximumWords, actualWords);
  if (actualWords < 1500 || actualWords > 2000) fail(`${label}: ${actualWords} words is outside 1500-2000`);
  if (actualWords !== item.wordCount) fail(`${label}: manifest word count ${item.wordCount} does not match ${actualWords}`);
  const bodyHash = sha(stripTags(visibleArticle).normalize("NFKC"));
  if (bodyHashes.has(bodyHash)) fail(`${label}: exact duplicate visible article body`);
  bodyHashes.add(bodyHash);

  const stepCount = (html.match(/<ol class="steps">[\s\S]*?<\/ol>/u)?.[0].match(/<li>/gu) || []).length;
  if (stepCount !== 3) fail(`${label}: expected three quick steps; found ${stepCount}`);
  const faqCount = (html.match(/<section class="faq">[\s\S]*?<\/section>/u)?.[0].match(/<details>/gu) || []).length;
  if (faqCount < 3) fail(`${label}: fewer than three visible FAQ items`);
  const relatedCount = (html.match(/<div class="related">[\s\S]*?<\/div>/u)?.[0].match(/<a /gu) || []).length;
  if (relatedCount !== 3) fail(`${label}: expected three related-guide links; found ${relatedCount}`);
  const alternates = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)"/gu)].map((match) => match[1]);
  if (alternates.length !== 21 || !expectedLocales.every((locale) => alternates.includes(locale)) || !alternates.includes("x-default")) fail(`${label}: incomplete hreflang cluster`);

  const schemaRaw = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/u)?.[1];
  try {
    const graph = JSON.parse(schemaRaw)["@graph"];
    const types = new Set(graph.map((entry) => entry["@type"]));
    for (const type of ["Article", "BreadcrumbList", "FAQPage"]) if (!types.has(type)) fail(`${label}: ${type} schema missing`);
    const faqSchema = graph.find((entry) => entry["@type"] === "FAQPage");
    if (faqSchema.mainEntity.length !== faqCount) fail(`${label}: FAQ schema and visible FAQ counts differ`);
  } catch (error) {
    fail(`${label}: invalid JSON-LD (${error.message})`);
  }

  if (!html.includes(`src="../assets/${imageName}"`)) fail(`${label}: article image reference mismatch`);
  if (!svg.includes(`<title id="title">${item.keyword.replace(/&/gu, "&amp;").replace(/</gu, "&lt;").replace(/>/gu, "&gt;").replace(/"/gu, "&quot;").replace(/'/gu, "&#39;")}</title>`)) fail(`${label}: SVG title does not match keyword`);
  if (!svg.includes(`data-topic="${item.intent}"`) || !svg.includes(`data-support="${item.toolSupport}"`)) fail(`${label}: SVG topic/support metadata mismatch`);
  const imageHash = sha(svg);
  if (imageHashes.has(imageHash)) fail(`${label}: duplicate SVG file content`);
  imageHashes.add(imageHash);
  if (!sitemap.includes(`<loc>${item.sourceUrl}</loc>`)) fail(`${label}: missing from sitemap`);
}

for (const locale of expectedLocales) if (localeCounts[locale] !== 15) fail(`${locale}: expected 15 campaign articles; found ${localeCounts[locale]}`);
const registryCampaign = registry.items.filter((item) => item.standardVersion === campaignVersion);
if (registry.count !== 449 || registryCampaign.length !== 300) fail(`Registry expected 449 total / 300 campaign items; found ${registry.count} / ${registryCampaign.length}`);
if ((hub.match(/class="card" data-locale=/gu) || []).length !== 300) fail("Campaign hub does not contain 300 cards");
if (!sitemap.includes("<loc>https://rn473147-del.github.io/downloader-x-guides/x-keywords-300.html</loc>")) fail("Campaign hub missing from sitemap");
if ((index.match(/x-keywords-300\.html/gu) || []).length !== 1) fail("Main index must link to the campaign hub exactly once");
if (/href="#"|undefined/u.test(hub)) fail("Campaign hub contains a placeholder or undefined value");

const result = {
  status: errors.length ? "FAIL" : "PASS",
  articles: manifest.items.length,
  images: imageHashes.size,
  uniqueKeywords: keywordSet.size,
  uniqueBodies: bodyHashes.size,
  locales: expectedLocales.length,
  perLocale: localeCounts,
  wordRange: [minimumWords, maximumWords],
  registryItems: registry.count,
  errors,
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (errors.length) process.exitCode = 1;
