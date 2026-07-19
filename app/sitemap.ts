import type { MetadataRoute } from "next";
import { projects } from "./data/projects";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://microgridprojects.com";
  const lastModified = new Date("2026-07-19");
  const staticRoutes = ["", "/projects", "/markets", "/guides/types-of-microgrids", "/about", "/contact"].map((path, index) => ({ url: `${base}${path}`, lastModified, changeFrequency: index < 3 ? "weekly" as const : "monthly" as const, priority: path === "" ? 1 : path === "/projects" ? .9 : .7 }));
  return [...staticRoutes, ...projects.map((project) => ({ url: `${base}/projects/${project.slug}`, lastModified, changeFrequency: "monthly" as const, priority: .6 }))];
}
