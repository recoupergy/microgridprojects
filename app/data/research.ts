import researchData from "./research.json";

export type ResearchCoverage = "detailed" | "partial" | "limited";
export type ResearchSourceKind = "primary" | "secondary" | "archive";

export interface ResearchCitation {
  id: string;
  title: string;
  url: string;
  publisher: string;
  kind: ResearchSourceKind;
  capturedAt?: string | null;
}

export interface ResearchOrganization {
  name: string;
  role: string;
  sourceIds: string[];
}

export interface ResearchSpecification {
  label: string;
  value: string;
  sourceIds: string[];
}

export interface ResearchEquipment {
  category: string;
  manufacturer?: string;
  model?: string;
  detail: string;
  sourceIds: string[];
}

export interface ResearchTechnicalDetail {
  category: string;
  detail: string;
  sourceIds: string[];
}

export interface ProjectResearch {
  researchedAt: string;
  coverage: ResearchCoverage;
  summary: string | null;
  status: string | null;
  classification: string | null;
  historicalLocation: string | null;
  archiveCapturedAt: string | null;
  organizations: ResearchOrganization[];
  specifications: ResearchSpecification[];
  equipment: ResearchEquipment[];
  technicalDetails: ResearchTechnicalDetail[];
  sources: ResearchCitation[];
}

export const projectResearch = researchData.records as Record<string, ProjectResearch>;

export function getProjectResearch(slug: string) {
  return projectResearch[slug];
}

const allResearch = Object.values(projectResearch);

export const researchStats = {
  records: allResearch.length,
  organizations: allResearch.reduce((sum, record) => sum + record.organizations.length, 0),
  specifications: allResearch.reduce((sum, record) => sum + record.specifications.length, 0),
  equipment: allResearch.reduce((sum, record) => sum + record.equipment.length, 0),
  technicalDetails: allResearch.reduce((sum, record) => sum + record.technicalDetails.length, 0),
  sources: allResearch.reduce((sum, record) => sum + record.sources.length, 0),
};
