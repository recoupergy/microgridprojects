import fs from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const legacy = JSON.parse(await fs.readFile(path.join(root, "research/legacy-recovered.json"), "utf8"));
const built = JSON.parse(await fs.readFile(path.join(root, "app/data/research.json"), "utf8"));
const enrichmentDirectory = path.join(root, "research/enrichment");
const projectSlugs = new Set(legacy.records.map((record) => record.slug));
const reviewedSlugs = new Map();
const failures = [];

const files = (await fs.readdir(enrichmentDirectory))
  .filter((file) => file.endsWith(".json"))
  .sort();

for (const file of files) {
  const fragment = JSON.parse(await fs.readFile(path.join(enrichmentDirectory, file), "utf8"));
  for (const [slug, record] of Object.entries(fragment)) {
    if (!projectSlugs.has(slug)) failures.push(`${file}: unknown project slug ${slug}`);
    if (reviewedSlugs.has(slug)) failures.push(`${slug}: appears in both ${reviewedSlugs.get(slug)} and ${file}`);
    reviewedSlugs.set(slug, file);
    if (!/^2026-07-(20|21)$/.test(record.researchedAt ?? "")) failures.push(`${slug}: missing current researchedAt date`);
    if (!record.summary?.trim()) failures.push(`${slug}: missing source-backed summary`);
    if (!record.status?.trim()) failures.push(`${slug}: missing current or explicitly unknown status`);
    if (!(record.sources?.length > 0)) failures.push(`${slug}: no new reviewed sources`);
  }
}

for (const slug of projectSlugs) {
  if (!reviewedSlugs.has(slug)) failures.push(`${slug}: no 2026 enrichment review`);
  const record = built.records[slug];
  if (!record) {
    failures.push(`${slug}: absent from built research data`);
    continue;
  }
  const sourceIds = new Set(record.sources.map((source) => source.id));

  for (const organization of record.organizations) {
    if (!organization.name?.trim() || !organization.role?.trim() || !Array.isArray(organization.sourceIds)) {
      failures.push(`${slug}: invalid organization record shape`);
    }
  }
  for (const specification of record.specifications) {
    if (!specification.label?.trim() || !specification.value?.trim() || !Array.isArray(specification.sourceIds)) {
      failures.push(`${slug}: invalid specification record shape`);
    }
  }
  for (const equipment of record.equipment) {
    if (!equipment.category?.trim() || !equipment.detail?.trim() || !Array.isArray(equipment.sourceIds)) {
      failures.push(`${slug}: invalid equipment record shape`);
    }
  }
  for (const detail of record.technicalDetails) {
    if (!detail.category?.trim() || !detail.detail?.trim() || !Array.isArray(detail.sourceIds)) {
      failures.push(`${slug}: invalid technical-detail record shape`);
    }
  }
  for (const source of record.sources) {
    if (!source.id?.trim() || !source.title?.trim() || !source.url?.trim() || !source.publisher?.trim() || !["primary", "secondary", "archive"].includes(source.kind)) {
      failures.push(`${slug}: invalid source record shape`);
    }
  }

  const citedItems = [
    ...record.organizations,
    ...record.specifications,
    ...record.equipment,
    ...record.technicalDetails,
  ];
  for (const item of citedItems) {
    for (const sourceId of item.sourceIds) {
      if (!sourceIds.has(sourceId)) failures.push(`${slug}: unresolved source id ${sourceId}`);
    }
  }
}

const metrics = {
  portfolioProjects: projectSlugs.size,
  reviewedProjects: reviewedSlugs.size,
  outstandingProjects: projectSlugs.size - reviewedSlugs.size,
  enrichmentFiles: files.length,
  organizations: Object.values(built.records).reduce((sum, record) => sum + record.organizations.length, 0),
  specifications: Object.values(built.records).reduce((sum, record) => sum + record.specifications.length, 0),
  equipment: Object.values(built.records).reduce((sum, record) => sum + record.equipment.length, 0),
  technicalDetails: Object.values(built.records).reduce((sum, record) => sum + record.technicalDetails.length, 0),
  sources: Object.values(built.records).reduce((sum, record) => sum + record.sources.length, 0),
};

console.log(JSON.stringify(metrics, null, 2));

if (failures.length) {
  console.error(`\nResearch audit failed with ${failures.length} issue(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
}
