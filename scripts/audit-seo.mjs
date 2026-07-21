import { spawn } from "node:child_process";
import { once } from "node:events";
import net from "node:net";

const CANONICAL_ORIGIN = "https://microgridprojects.com";
const suppliedBaseUrl = process.env.SEO_AUDIT_BASE_URL;
let server;

async function availablePort() {
  const listener = net.createServer();
  listener.listen(0, "127.0.0.1");
  await once(listener, "listening");
  const address = listener.address();
  if (!address || typeof address === "string") throw new Error("Could not allocate an audit port");
  await new Promise((resolve, reject) => listener.close((error) => error ? reject(error) : resolve()));
  return address.port;
}

async function waitForServer(baseUrl) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`SEO audit server did not become ready at ${baseUrl}`);
}

const port = suppliedBaseUrl ? null : await availablePort();
const baseUrl = suppliedBaseUrl?.replace(/\/$/, "") ?? `http://127.0.0.1:${port}`;

if (!suppliedBaseUrl) {
  server = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", String(port)],
    { stdio: ["ignore", "pipe", "pipe"] },
  );
  server.stderr.on("data", (chunk) => process.stderr.write(chunk));
  await waitForServer(baseUrl);
}

const failures = [];
const pages = new Map();

function fail(url, message) {
  failures.push(`${url}: ${message}`);
}

function decodeHtml(value = "") {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function tags(html, name) {
  return [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, "gi"))].map((match) => match[0]);
}

function attribute(tag, name) {
  return decodeHtml(tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`, "i"))?.[1] ?? "");
}

function metaContent(html, attributeName, attributeValue) {
  const match = tags(html, "meta").find((tag) => attribute(tag, attributeName) === attributeValue);
  return match ? attribute(match, "content") : "";
}

function comparableUrl(value) {
  const url = new URL(value, CANONICAL_ORIGIN);
  url.hash = "";
  return url.href;
}

async function mapLimit(items, limit, worker) {
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      await worker(items[index], index);
    }
  });
  await Promise.all(workers);
}

try {
  const sitemapResponse = await fetch(`${baseUrl}/sitemap.xml`, { redirect: "manual" });
  if (sitemapResponse.status !== 200) throw new Error(`Sitemap returned ${sitemapResponse.status}`);
  const sitemap = await sitemapResponse.text();
  const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => decodeHtml(match[1]));
  const sitemapDates = [...sitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((match) => match[1]);
  const uniqueSitemapUrls = [...new Set(sitemapUrls)];

  if (uniqueSitemapUrls.length !== sitemapUrls.length) fail("/sitemap.xml", "contains duplicate URLs");
  if (uniqueSitemapUrls.length !== 203) fail("/sitemap.xml", `expected 203 canonical pages, found ${uniqueSitemapUrls.length}`);
  if (sitemapDates.length !== sitemapUrls.length) fail("/sitemap.xml", `expected a lastmod for every URL, found ${sitemapDates.length}`);
  for (const lastModified of sitemapDates) {
    const timestamp = Date.parse(lastModified);
    if (!Number.isFinite(timestamp)) fail("/sitemap.xml", `contains invalid lastmod ${lastModified}`);
    if (timestamp > Date.now() + 86_400_000) fail("/sitemap.xml", `contains future lastmod ${lastModified}`);
  }

  await mapLimit(uniqueSitemapUrls, 12, async (canonicalUrl) => {
    const canonical = new URL(canonicalUrl);
    const auditUrl = `${baseUrl}${canonical.pathname}${canonical.search}`;
    const response = await fetch(auditUrl, { redirect: "manual" });
    if (response.status !== 200) {
      fail(canonicalUrl, `sitemap page returned ${response.status}`);
      return;
    }
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) fail(canonicalUrl, `unexpected content type ${contentType}`);
    const html = await response.text();
    pages.set(canonicalUrl, html);

    const titleMatches = [...html.matchAll(/<title>([\s\S]*?)<\/title>/gi)];
    if (titleMatches.length !== 1) fail(canonicalUrl, `expected one title, found ${titleMatches.length}`);
    const title = decodeHtml(titleMatches[0]?.[1] ?? "").trim();
    if (title.length < 20 || title.length > 60) fail(canonicalUrl, `title length is ${title.length}`);

    const descriptions = tags(html, "meta").filter((tag) => attribute(tag, "name") === "description");
    if (descriptions.length !== 1) fail(canonicalUrl, `expected one meta description, found ${descriptions.length}`);
    const description = descriptions[0] ? attribute(descriptions[0], "content") : "";
    if (description.length < 70 || description.length > 160) fail(canonicalUrl, `meta description length is ${description.length}`);

    const canonicals = tags(html, "link").filter((tag) => attribute(tag, "rel") === "canonical");
    if (canonicals.length !== 1) fail(canonicalUrl, `expected one canonical, found ${canonicals.length}`);
    const canonicalHref = canonicals[0] ? attribute(canonicals[0], "href") : "";
    if (canonicalHref && comparableUrl(canonicalHref) !== comparableUrl(canonicalUrl)) fail(canonicalUrl, `canonical points to ${canonicalHref}`);

    if (!/<html\b[^>]*\blang=["']en["']/i.test(html)) fail(canonicalUrl, "missing valid English html lang attribute");
    const h1Count = [...html.matchAll(/<h1\b/gi)].length;
    if (h1Count !== 1) fail(canonicalUrl, `expected one H1, found ${h1Count}`);
    if (/<meta\b[^>]*(?:name=["']robots["'][^>]*content=["'][^"']*noindex|content=["'][^"']*noindex[^>]*name=["']robots["'])/i.test(html)) fail(canonicalUrl, "is unexpectedly noindex");

    const robots = metaContent(html, "name", "robots");
    if (!robots.includes("index") || !robots.includes("follow")) fail(canonicalUrl, `robots directives are ${robots || "missing"}`);
    const googleBot = metaContent(html, "name", "googlebot");
    for (const directive of ["max-video-preview:-1", "max-image-preview:large", "max-snippet:-1"]) {
      if (!googleBot.includes(directive)) fail(canonicalUrl, `googlebot is missing ${directive}`);
    }

    const manifestLink = tags(html, "link").find((tag) => attribute(tag, "rel") === "manifest");
    if (!manifestLink || attribute(manifestLink, "href") !== "/manifest.webmanifest") fail(canonicalUrl, "is missing the web app manifest link");
    const iconLinks = tags(html, "link").filter((tag) => ["icon", "shortcut icon", "apple-touch-icon"].includes(attribute(tag, "rel")));
    if (!iconLinks.length) fail(canonicalUrl, "is missing favicon metadata");

    const ogUrl = metaContent(html, "property", "og:url");
    if (!ogUrl || comparableUrl(ogUrl) !== comparableUrl(canonicalUrl)) fail(canonicalUrl, `Open Graph URL is ${ogUrl || "missing"}`);
    for (const property of ["og:title", "og:description", "og:image"]) {
      if (!metaContent(html, "property", property)) fail(canonicalUrl, `${property} is missing`);
    }
    for (const name of ["twitter:card", "twitter:title", "twitter:description", "twitter:image"]) {
      if (!metaContent(html, "name", name)) fail(canonicalUrl, `${name} is missing`);
    }

    const jsonLdScripts = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
    if (!jsonLdScripts.length) fail(canonicalUrl, "has no JSON-LD structured data");
    for (const script of jsonLdScripts) {
      try { JSON.parse(decodeHtml(script[1])); } catch { fail(canonicalUrl, "contains invalid JSON-LD"); }
    }
  });

  const titleValues = [...pages.entries()].map(([url, html]) => [url, decodeHtml(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "").trim()]);
  const descriptionValues = [...pages.entries()].map(([url, html]) => [url, metaContent(html, "name", "description")]);
  for (const [label, values] of [["title", titleValues], ["meta description", descriptionValues]]) {
    const grouped = Map.groupBy(values, ([, value]) => value);
    for (const [value, duplicates] of grouped) {
      if (value && duplicates.length > 1) fail(duplicates.map(([url]) => url).join(", "), `duplicate ${label}: ${value}`);
    }
  }

  const internalTargets = new Set();
  const incomingCanonicals = new Set();
  for (const [pageUrl, html] of pages) {
    for (const tag of tags(html, "a")) {
      const href = attribute(tag, "href");
      if (!href || /^(?:mailto:|tel:|#)/i.test(href)) continue;
      const target = new URL(href, pageUrl);
      if (target.origin !== CANONICAL_ORIGIN) continue;
      target.hash = "";
      internalTargets.add(target.href);
      incomingCanonicals.add(`${target.origin}${target.pathname}`);
    }
  }

  await mapLimit([...internalTargets], 12, async (targetUrl) => {
    const target = new URL(targetUrl);
    const response = await fetch(`${baseUrl}${target.pathname}${target.search}`, { redirect: "manual" });
    if (response.status !== 200) fail(targetUrl, `internal link returned ${response.status}`);
  });

  for (const sitemapUrl of uniqueSitemapUrls) {
    if (comparableUrl(sitemapUrl) === `${CANONICAL_ORIGIN}/`) continue;
    const url = new URL(sitemapUrl);
    if (!incomingCanonicals.has(`${url.origin}${url.pathname}`)) fail(sitemapUrl, "is orphaned from rendered internal links");
  }

  await mapLimit(uniqueSitemapUrls.filter((url) => new URL(url).pathname !== "/"), 12, async (canonicalUrl) => {
    const path = new URL(canonicalUrl).pathname;
    const response = await fetch(`${baseUrl}${path}/`, { redirect: "manual" });
    if (response.status !== 308) fail(`${canonicalUrl}/`, `trailing-slash duplicate returned ${response.status}, expected 308`);
    const location = response.headers.get("location");
    if (location && new URL(location, baseUrl).pathname !== path) fail(`${canonicalUrl}/`, `trailing-slash redirect points to ${location}`);
  });

  for (const [path, expectedType] of [
    ["/robots.txt", "text/plain"],
    ["/llms.txt", "text/plain"],
    ["/manifest.webmanifest", "application/manifest+json"],
    ["/favicon.ico", "image/x-icon"],
    ["/icon.svg", "image/svg+xml"],
    ["/apple-icon.png", "image/png"],
    ["/icon-192.png", "image/png"],
    ["/icon-512.png", "image/png"],
    ["/og-v3.png", "image/png"],
  ]) {
    const response = await fetch(`${baseUrl}${path}`, { redirect: "manual" });
    if (response.status !== 200) fail(path, `returned ${response.status}`);
    if (!(response.headers.get("content-type") ?? "").includes(expectedType)) fail(path, `unexpected content type ${response.headers.get("content-type")}`);
  }

  const robotsText = await (await fetch(`${baseUrl}/robots.txt`)).text();
  if (!robotsText.includes(`Sitemap: ${CANONICAL_ORIGIN}/sitemap.xml`)) fail("/robots.txt", "does not advertise the canonical sitemap");
  if (!robotsText.includes("Host: microgridprojects.com")) fail("/robots.txt", "does not declare the canonical host");

  const webManifest = await (await fetch(`${baseUrl}/manifest.webmanifest`)).json();
  const manifestSizes = new Set((webManifest.icons ?? []).map((icon) => icon.sizes));
  if (!manifestSizes.has("192x192") || !manifestSizes.has("512x512")) fail("/manifest.webmanifest", "is missing installable 192px or 512px icons");
  if (!(webManifest.icons ?? []).some((icon) => icon.purpose === "maskable")) fail("/manifest.webmanifest", "is missing a maskable icon");

  if (failures.length) {
    console.error(`SEO audit failed with ${failures.length} issue(s):\n${failures.join("\n")}`);
    process.exitCode = 1;
  } else {
    console.log(`SEO audit passed: ${uniqueSitemapUrls.length} canonical pages, ${internalTargets.size} internal targets, no orphan pages, valid metadata and structured data, complete icon and manifest coverage, and normalized trailing slashes.`);
  }
} finally {
  if (server) {
    server.kill("SIGTERM");
    const exited = await Promise.race([
      once(server, "exit").then(() => true),
      new Promise((resolve) => setTimeout(() => resolve(false), 2_000)),
    ]);
    if (!exited) {
      server.kill("SIGKILL");
      await once(server, "exit");
    }
    server.stdout.destroy();
    server.stderr.destroy();
  }
}
