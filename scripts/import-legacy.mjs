import { mkdir, writeFile } from "node:fs/promises";

const chunks = [];
for await (const chunk of process.stdin) chunks.push(chunk);
const html = Buffer.concat(chunks).toString("utf8");

const markerPattern =
  /permalink:'([^']+)', title:'([^']*)', price:'([^']*)', latLng: new google\.maps\.LatLng\(([^,]+), ([^)]+)\), thumbnail: '([^']*)'/g;

function decodeEntities(value) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, code) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    )
    .replace(/&#(\d+);/g, (_, code) =>
      String.fromCodePoint(Number.parseInt(code, 10)),
    )
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'")
    .replaceAll("&nbsp;", " ")
    .replace(/\s+\|\s*$/, "")
    .trim();
}

function normalizeCapacity(value) {
  const compact = decodeEntities(value).replace(/\s+/g, "");
  const match = compact.match(/^([\d,.]+)(kW|MW)$/i);
  if (!match) return null;
  const unit = match[2].toUpperCase() === "KW" ? "kW" : "MW";
  return `${match[1]} ${unit}`;
}

function capacityInKw(value) {
  if (!value) return null;
  const match = value.match(/^([\d,.]+)\s+(kW|MW)$/);
  if (!match) return null;
  const amount = Number.parseFloat(match[1].replaceAll(",", ""));
  return match[2] === "MW" ? amount * 1_000 : amount;
}

function regionFor(latitude, longitude) {
  if (latitude < -60) return "Polar";
  if (latitude >= 25 && longitude >= -170 && longitude <= -50) {
    return "North America";
  }
  if (
    latitude < 25 &&
    longitude >= -120 &&
    longitude <= -30
  ) {
    return "Latin America & Caribbean";
  }
  if (latitude < 25 && (longitude < -120 || longitude >= 140)) {
    return "Oceania & Pacific";
  }
  if (
    latitude >= 35 &&
    longitude >= -35 &&
    longitude <= 45
  ) {
    return "Europe";
  }
  if (
    latitude >= -40 &&
    latitude < 35 &&
    longitude >= -25 &&
    longitude <= 65
  ) {
    return "Africa & Middle East";
  }
  if (longitude >= 45 && longitude <= 180) return "Asia";
  if (longitude >= 110 && latitude < 0) return "Oceania & Pacific";
  return "Global / other";
}

function sectorFor(name) {
  const value = name.toLowerCase();
  if (
    /\b(fort|afb|air force|army|navy|naval|marine|military|base|camp|coast guard|submarine)\b/.test(
      value,
    )
  ) {
    return "Defense";
  }
  if (/\b(mine|mining|copper|nickel|chromium|industrial|plant)\b/.test(value)) {
    return "Industrial & mining";
  }
  if (/\b(university|college|campus|school|institute|laboratory|research)\b/.test(value)) {
    return "Campus & research";
  }
  if (/\b(island|isle|cay|atoll|remote|village|rancheria|nation|reserve)\b/.test(value)) {
    return "Island & remote community";
  }
  if (/\b(community|housing|village|town|city|county|municipal)\b/.test(value)) {
    return "Community";
  }
  if (/\b(airport|transit|fire station|hospital|jail|water|desalination)\b/.test(value)) {
    return "Critical infrastructure";
  }
  return "Commercial & demonstration";
}

const seen = new Set();
const projects = [];
let match;

while ((match = markerPattern.exec(html))) {
  const legacyUrl = match[1];
  const slug = legacyUrl.split("/").filter(Boolean).at(-1);
  if (!slug || seen.has(slug)) continue;

  const latitude = Number.parseFloat(match[4]);
  const longitude = Number.parseFloat(match[5]);
  const capacity = normalizeCapacity(match[3]);
  const name = decodeEntities(match[2]);

  seen.add(slug);
  projects.push({
    slug,
    name,
    capacity,
    capacityKw: capacityInKw(capacity),
    latitude,
    longitude,
    region: regionFor(latitude, longitude),
    sector: sectorFor(name),
    legacyPath: new URL(legacyUrl).pathname,
  });
}

if (projects.length < 150) {
  throw new Error(`Expected at least 150 legacy projects, found ${projects.length}`);
}

projects.sort((a, b) => a.name.localeCompare(b.name));

const output = `// Generated from the legacy MicrogridProjects.com map.\n// Run: curl -kLsS https://microgridprojects.com/ | node scripts/import-legacy.mjs\n\nexport const REGIONS = ${JSON.stringify([...new Set(projects.map((project) => project.region))].sort())} as const;\nexport const SECTORS = ${JSON.stringify([...new Set(projects.map((project) => project.sector))].sort())} as const;\n\nexport type Region = (typeof REGIONS)[number];\nexport type Sector = (typeof SECTORS)[number];\n\nexport interface MicrogridProject {\n  slug: string;\n  name: string;\n  capacity: string | null;\n  capacityKw: number | null;\n  latitude: number;\n  longitude: number;\n  region: Region;\n  sector: Sector;\n  legacyPath: string;\n}\n\nexport const projects = ${JSON.stringify(projects, null, 2)} as const satisfies readonly MicrogridProject[];\n\nexport const projectCount = projects.length;\n\nexport function getProject(slug: string) {\n  return projects.find((project) => project.slug === slug);\n}\n`;

const targetDirectory = new URL("../app/data/", import.meta.url);
await mkdir(targetDirectory, { recursive: true });
await writeFile(new URL("projects.ts", targetDirectory), output, "utf8");

console.log(`Imported ${projects.length} projects.`);
