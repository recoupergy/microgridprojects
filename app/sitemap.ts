import type { MetadataRoute } from "next";
import { projects } from "./data/projects";
import { getProjectResearch } from "./data/research";
import { SITE_URL } from "./data/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    { path: "", changeFrequency: "weekly" as const, priority: 1 },
    { path: "/projects", changeFrequency: "weekly" as const, priority: 0.9 },
    { path: "/markets", changeFrequency: "weekly" as const, priority: 0.7 },
    { path: "/guides/types-of-microgrids", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "/about", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "/contact", changeFrequency: "monthly" as const, priority: 0.7 },
  ];

  return [
    ...staticRoutes.map(({ path, changeFrequency, priority }) => ({
      url: `${SITE_URL}${path}`,
      lastModified: new Date("2026-07-20"),
      changeFrequency,
      priority,
    })),
    ...projects.map((project) => ({
      url: `${SITE_URL}/projects/${project.slug}`,
      lastModified: new Date(getProjectResearch(project.slug)?.researchedAt ?? "2026-07-19"),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
