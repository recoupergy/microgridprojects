import fs from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const outputPath = process.argv[2] ?? "/private/tmp/microgrid-legacy-research.json";
const projectSource = await fs.readFile(path.join(root, "app/data/projects.ts"), "utf8");
const projectMatch = projectSource.match(/export const projects = (\[[\s\S]*\]) as const satisfies/);

if (!projectMatch) throw new Error("Could not read project records");

const allProjects = JSON.parse(projectMatch[1]);
const onlySlug = process.argv[3];
const projects = onlySlug ? allProjects.filter((project) => project.slug === onlySlug) : allProjects;
if (onlySlug && projects.length === 0) throw new Error(`Unknown project slug: ${onlySlug}`);
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

function decodeHtml(value = "") {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replaceAll("&nbsp;", " ")
    .replaceAll("&middot;", "·")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function stripHtml(value = "") {
  return decodeHtml(value)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, " ")
    .replace(/<!--([\s\S]*?)-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sectionById(html, id) {
  const start = html.search(new RegExp(`<section[^>]+id=["']${id}["']`, "i"));
  if (start < 0) return "";
  const end = html.indexOf("</section>", start);
  return end < 0 ? html.slice(start) : html.slice(start, end + 10);
}

function linksFrom(html) {
  const links = [];
  for (const match of html.matchAll(/<a\s[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const url = decodeHtml(match[1]).trim();
    const title = stripHtml(match[2]);
    if (!/^https?:\/\//i.test(url)) continue;
    if (/microgridprojects\.com\/(?:property-feature|microgrid\/)/i.test(url)) continue;
    if (/(facebook|twitter|linkedin|pinterest|reddit|google\.com\/share|stumbleupon|tumblr)\./i.test(url)) continue;
    links.push({ title: title || new URL(url).hostname, url });
  }
  return [...new Map(links.map((item) => [item.url, item])).values()];
}

function cleanTechnicalLine(value) {
  return stripHtml(value)
    .replace(/^Share this:\s*.*/i, "")
    .replace(/\s+(LinkedIn|Twitter|Facebook|Google|Reddit|Email|More|Print|Digg|StumbleUpon|Tumblr|Pinterest)(\s+|$)/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function technicalFactsFrom(html, category) {
  const blocks = html
    .replace(/<br\s*\/?\s*>/gi, "</p><p>")
    .split(/<\/(?:p|li|h[1-6])>/i)
    .map(cleanTechnicalLine)
    .filter(Boolean);
  const sentences = blocks.flatMap((block) => block.split(/(?<=[.!?])\s+(?=[A-Z0-9])/));
  const keywords = /\b(kW|MW|kWh|MWh|Ah|volt|battery|storage|solar|photovoltaic|PV|wind|diesel|generator|genset|turbine|fuel cell|inverter|converter|controller|control system|SCADA|EMS|microgrid plus|powerstore|flywheel|hydro|CHP|cogeneration|biogas|Powerpack|module|model)\b/i;
  return sentences
    .map((text) => text.replace(/\s+/g, " ").trim())
    .filter((text) => text.length >= 8 && text.length <= 420 && (category !== "General" || keywords.test(text)))
    .filter((text) => !/^[“”\"]/.test(text))
    .filter((text) => category !== "Sources" && !/^https?:\/\//i.test(text))
    .map((text) => ({ category, text }));
}

function extractRecord(project, html, responseUrl) {
  const mainStart = html.indexOf('<div id="main-content">');
  const similarStart = html.indexOf('<section id="similar-properties">', mainStart);
  const main = mainStart < 0 ? "" : html.slice(mainStart, similarStart > mainStart ? similarStart : undefined);
  const locationSection = sectionById(main, "location");
  const organizationSection = sectionById(main, "property-features");
  const detailsSection = sectionById(main, "additional-details");
  const generalEndCandidates = [
    main.indexOf('<section id="property-features"'),
    main.indexOf('<section id="additional-details"'),
    main.indexOf('<section id="location"'),
  ].filter((index) => index > 0);
  const general = main.slice(0, generalEndCandidates.length ? Math.min(...generalEndCandidates) : 0);

  const organizations = [...organizationSection.matchAll(/<li[^>]*>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>[\s\S]*?<\/li>/gi)]
    .map((match) => stripHtml(match[1]))
    .filter(Boolean);

  const tabNames = new Map(
    [...detailsSection.matchAll(/href=["']#additional-(\d+)["'][^>]*>([\s\S]*?)<\/a>/gi)]
      .map((match) => [match[1], stripHtml(match[2])]),
  );
  const panels = [...detailsSection.matchAll(/<div[^>]+role=["']tabpanel["'][^>]+id=["']additional-(\d+)["'][^>]*>([\s\S]*?)<\/div>/gi)]
    .map((match) => ({ id: match[1], category: tabNames.get(match[1]) ?? `Detail ${match[1]}`, html: match[2] }));

  const metricsChunkStart = html.indexOf('<div class="property-meta container">');
  const metricsChunkEnd = html.indexOf('<div class="container">', metricsChunkStart + 10);
  const metricsChunk = metricsChunkStart < 0 ? "" : html.slice(metricsChunkStart, metricsChunkEnd > metricsChunkStart ? metricsChunkEnd : mainStart);
  const specifications = [...metricsChunk.matchAll(/<div class=["']meta-data["'][^>]+title=["']([^"']+)["'][^>]*>([\s\S]*?)<\/div>/gi)]
    .map((match) => {
      const label = stripHtml(match[1]);
      const value = stripHtml(match[2]).replace(new RegExp(`\\s*${label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "i"), "").trim();
      return { label, value };
    })
    .filter((item) => item.label && item.value);

  const headerStart = html.indexOf('<div class="property-header">');
  const headerEnd = html.indexOf("</div><!-- .property-header-container -->", headerStart);
  const header = headerStart < 0 ? "" : html.slice(headerStart, headerEnd > headerStart ? headerEnd : mainStart);
  const meta = [...header.matchAll(/<div class=["']meta["']>([\s\S]*?)<\/div>/gi)].map((match) => stripHtml(match[1])).filter(Boolean);
  const [classification = "", status = ""] = (meta[0] ?? "").split("·").map((item) => item.trim());

  const detailsLinks = panels.flatMap((panel) => linksFrom(panel.html));
  const sourceLinks = [...new Map([...linksFrom(general), ...detailsLinks].map((item) => [item.url, item])).values()];
  const technicalFacts = [
    ...technicalFactsFrom(general, "General"),
    ...panels.flatMap((panel) => technicalFactsFrom(panel.html, panel.category)),
  ];
  const uniqueFacts = [...new Map(technicalFacts.map((item) => [`${item.category}:${item.text.toLowerCase()}`, item])).values()].slice(0, 18);
  const archivedAt = responseUrl.match(/\/web\/(\d{14})id_\//)?.[1] ?? null;

  return {
    slug: project.slug,
    name: project.name,
    archiveUrl: responseUrl,
    archivedAt,
    classification: classification || null,
    status: status || null,
    location: stripHtml(locationSection.match(/<p class=["']text-muted["']>([\s\S]*?)<\/p>/i)?.[1] ?? "") || null,
    organizations: [...new Set(organizations)],
    specifications,
    technicalFacts: uniqueFacts,
    sourceLinks,
  };
}

async function fetchArchive(project) {
  const candidates = [
    `http://microgridprojects.com/microgrid/${project.slug}/`,
    `http://microgridprojects.com${project.legacyPath}`,
  ];
  const timestamps = ["20210401000000", "20200101000000", "20180101000000", "20160101000000"];

  for (const original of [...new Set(candidates)]) {
    for (const timestamp of timestamps) {
      const archiveRequest = `https://web.archive.org/web/${timestamp}id_/${original}`;
      for (let attempt = 0; attempt < 3; attempt += 1) {
        try {
          const response = await fetch(archiveRequest, { redirect: "follow", headers: { "user-agent": "MicrogridProjects research recovery/1.0" } });
          if (response.status === 429 || response.status >= 500) {
            await delay(800 * (attempt + 1));
            continue;
          }
          if (!response.ok) break;
          const html = await response.text();
          if (!html.includes('id="main-content"') || !html.toLowerCase().includes(project.name.split(" ")[0].toLowerCase())) break;
          return extractRecord(project, html, response.url);
        } catch (error) {
          if (attempt === 0) console.error(`Archive parse retry for ${project.slug}: ${error instanceof Error ? error.message : String(error)}`);
          await delay(800 * (attempt + 1));
        }
      }
    }
  }

  return { slug: project.slug, name: project.name, error: "No matching archived record recovered" };
}

const records = new Array(projects.length);
let cursor = 0;

async function worker() {
  while (cursor < projects.length) {
    const index = cursor;
    cursor += 1;
    records[index] = await fetchArchive(projects[index]);
    const record = records[index];
    console.log(`${String(index + 1).padStart(3, "0")}/${projects.length} ${projects[index].slug} ${record.error ? "MISS" : `${record.organizations.length} org / ${record.technicalFacts.length} facts`}`);
    await delay(150);
  }
}

// The Internet Archive rate-limits parallel replay requests aggressively.
// A single polite worker is slower but produces materially better coverage.
await worker();
await fs.writeFile(outputPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), records }, null, 2)}\n`);

const recovered = records.filter((record) => !record.error);
console.log(JSON.stringify({ outputPath, total: records.length, recovered: recovered.length, missing: records.length - recovered.length, withOrganizations: recovered.filter((record) => record.organizations.length).length, withTechnicalFacts: recovered.filter((record) => record.technicalFacts.length).length, withSources: recovered.filter((record) => record.sourceLinks.length).length }, null, 2));
