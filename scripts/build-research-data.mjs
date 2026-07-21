import fs from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const legacyPath = path.join(root, "research/legacy-recovered.json");
const overridesPath = path.join(root, "research/overrides.json");
const enrichmentPath = path.join(root, "research/enrichment");
const outputPath = path.join(root, "app/data/research.json");

const legacy = JSON.parse(await fs.readFile(legacyPath, "utf8"));
const baseOverrides = JSON.parse(await fs.readFile(overridesPath, "utf8"));

const additiveFields = ["organizations", "specifications", "equipment", "technicalDetails", "sources"];

function mergeOverrideRecord(base = {}, addition = {}) {
  const merged = { ...base, ...addition };
  for (const field of additiveFields) {
    merged[field] = [...(base[field] ?? []), ...(addition[field] ?? [])];
  }
  return merged;
}

const overrides = { ...baseOverrides };
let enrichmentFiles = [];
try {
  enrichmentFiles = (await fs.readdir(enrichmentPath))
    .filter((file) => file.endsWith(".json"))
    .sort();
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

for (const file of enrichmentFiles) {
  const fragment = JSON.parse(await fs.readFile(path.join(enrichmentPath, file), "utf8"));
  for (const [slug, addition] of Object.entries(fragment)) {
    overrides[slug] = mergeOverrideRecord(overrides[slug], addition);
  }
}

const usefulKeywords = /\b(kW|MW|kWh|MWh|Ah|battery|storage|solar|PV|wind|diesel|generator|genset|turbine|fuel cell|inverter|converter|controller|SCADA|EMS|microgrid|PowerStore|flywheel|hydro|CHP|cogeneration|biogas|module|model)\b/i;
const promotional = /\b(excellent example|crucial part|innovative microgrid|broad possibilities|environmentally friendly|ideal for|future applications)\b/i;

function cleanText(value = "") {
  return value
    .replaceAll("&middot;", "·")
    .replaceAll("accross", "across")
    .replaceAll("storagecapacity", "storage capacity")
    .replaceAll("infrastructuremoving", "infrastructure moving")
    .replace(/\s+/g, " ")
    .trim();
}

function sourcePublisher(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "Original project source";
  }
}

function archiveDate(timestamp) {
  if (!timestamp || timestamp.length < 8) return null;
  return `${timestamp.slice(0, 4)}-${timestamp.slice(4, 6)}-${timestamp.slice(6, 8)}`;
}

function historicalSources(record) {
  const sources = [];
  if (record.archiveUrl) {
    sources.push({
      id: "archive",
      title: "Recovered Microgrid Projects record",
      url: record.archiveUrl,
      publisher: "Internet Archive",
      kind: "archive",
      capturedAt: archiveDate(record.archivedAt),
    });
  }
  for (const [index, item] of (record.sourceLinks ?? []).slice(0, 4).entries()) {
    const timestamp = record.archivedAt ?? "20200101000000";
    sources.push({
      id: `original-${index + 1}`,
      title: cleanText(item.title).replace(/:\s*$/, "") || "Original project source",
      url: `https://web.archive.org/web/${timestamp}/${item.url}`,
      publisher: sourcePublisher(item.url),
      kind: "archive",
      capturedAt: archiveDate(record.archivedAt),
    });
  }
  return sources;
}

function historicalDetails(record) {
  return (record.technicalFacts ?? [])
    .map((item) => ({ category: cleanText(item.category), detail: cleanText(item.text), sourceIds: ["archive"] }))
    .filter((item) => item.detail && item.detail.split(/\s+/).length <= 28)
    .filter((item) => !/^[“”\"]/.test(item.detail) && !promotional.test(item.detail) && usefulKeywords.test(item.detail))
    .filter((item) => !/^[A-Z0-9\s&/(),.–-]+$/.test(item.detail))
    .slice(0, 8);
}

function mergeByName(base, additions) {
  const map = new Map(base.map((item) => [item.name.toLowerCase(), item]));
  for (const item of additions ?? []) {
    const key = item.name.toLowerCase();
    map.set(key, { ...(map.get(key) ?? {}), ...item });
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

function mergeSpecifications(base, additions) {
  const all = [...base, ...(additions ?? [])];
  const seen = new Set();
  return all.filter((item) => {
    const key = `${item.label}:${item.value}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function mergeTechnicalDetails(base, additions) {
  const all = [...base, ...(additions ?? [])];
  const seen = new Set();
  return all.filter((item) => {
    const key = `${item.category}:${item.detail}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function mergeEquipment(base, additions) {
  const all = [...base, ...(additions ?? [])];
  const seen = new Set();
  return all.filter((item) => {
    const key = `${item.category}:${item.manufacturer ?? ""}:${item.model ?? ""}:${item.detail}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function mergeSources(base, additions) {
  const map = new Map(base.map((item) => [item.id, item]));
  for (const item of additions ?? []) map.set(item.id, item);
  return [...map.values()];
}

const records = {};
for (const record of legacy.records) {
  const manual = overrides[record.slug] ?? {};
  const sources = mergeSources(historicalSources(record), manual.sources);
  const organizations = mergeByName(
    (record.organizations ?? []).map((name) => ({ name: cleanText(name), role: "Publicly named participant; role not specified in the recovered record", sourceIds: ["archive"] })),
    manual.organizations,
  );
  const specifications = mergeSpecifications(
    (record.specifications ?? []).map((item) => ({ label: cleanText(item.label), value: cleanText(item.value), sourceIds: ["archive"] })),
    manual.specifications,
  );
  const technicalDetails = mergeTechnicalDetails(historicalDetails(record), manual.technicalDetails);
  const evidenceCount = organizations.length + specifications.length + technicalDetails.length + (manual.equipment ?? []).length;
  const coverage = evidenceCount >= 7 && organizations.length ? "detailed" : evidenceCount > 0 ? "partial" : "limited";
  const classificationParts = cleanText(record.classification ?? "").split("·").map((item) => item.trim()).filter(Boolean);

  records[record.slug] = {
    researchedAt: manual.researchedAt ?? "2026-07-19",
    coverage,
    summary: manual.summary ?? null,
    status: manual.status ?? record.status ?? classificationParts[1] ?? null,
    classification: classificationParts[0] ?? null,
    historicalLocation: record.location ?? null,
    archiveCapturedAt: archiveDate(record.archivedAt),
    organizations,
    specifications,
    equipment: mergeEquipment([], manual.equipment),
    technicalDetails,
    sources,
  };
}

await fs.writeFile(outputPath, `${JSON.stringify({ generatedAt: "2026-07-20", records }, null, 2)}\n`);

const values = Object.values(records);
console.log(JSON.stringify({
  outputPath,
  records: values.length,
  detailed: values.filter((record) => record.coverage === "detailed").length,
  partial: values.filter((record) => record.coverage === "partial").length,
  limited: values.filter((record) => record.coverage === "limited").length,
  organizations: values.reduce((sum, record) => sum + record.organizations.length, 0),
  specifications: values.reduce((sum, record) => sum + record.specifications.length, 0),
  equipment: values.reduce((sum, record) => sum + record.equipment.length, 0),
  technicalDetails: values.reduce((sum, record) => sum + record.technicalDetails.length, 0),
  sources: values.reduce((sum, record) => sum + record.sources.length, 0),
  enrichmentFiles: enrichmentFiles.length,
}, null, 2));
