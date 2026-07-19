import type { Metadata } from "next";
import Link from "next/link";
import { ProjectExplorer } from "../components/ProjectExplorer";
import { projectCount, projects } from "../data/projects";

export const metadata: Metadata = {
  title: "Global Microgrid Project Directory",
  description: `Search and filter ${projectCount} geocoded microgrid projects by region, system context, and reported capacity.`,
  alternates: { canonical: "/projects" },
};

type Props = { searchParams: Promise<{ q?: string; region?: string; sector?: string }> };

const legacyQueryAliases: Record<string, string> = {
  "new-york": "New York",
};

const legacyRegionAliases: Record<string, string> = {
  "africa-middle-east": "Africa & Middle East",
  "north-america": "North America",
};

export default async function ProjectsPage({ searchParams }: Props) {
  const { q = "", region = "", sector = "" } = await searchParams;
  const initialQuery = legacyQueryAliases[q] ?? q;
  const initialRegion = legacyRegionAliases[region] ?? region;
  const itemList = {
    "@context": "https://schema.org", "@type": "CollectionPage", name: "Global Microgrid Project Directory", url: "https://microgridprojects.com/projects",
    mainEntity: { "@type": "ItemList", numberOfItems: projectCount, itemListElement: projects.map((project, index) => ({ "@type": "ListItem", position: index + 1, name: project.name, url: `https://microgridprojects.com/projects/${project.slug}` })) },
  };
  return <main id="main-content" className="site-shell"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList).replace(/</g, "\\u003c") }} /><section className="page-hero"><div className="container"><p className="breadcrumb"><Link href="/">Home</Link> / Directory</p><p className="eyebrow"><span /> Global research directory</p><h1>Microgrid project directory</h1><p className="page-lede">Search {projectCount} sourced systems across seven regions—from campus and defense installations to island grids and remote communities.</p></div></section><section className="content-section"><div className="container"><div className="archive-note"><b>Research note:</b> Every record now includes recovered project participants, reported specifications, technical details, and source citations where publicly available. Historical claims remain labeled, and undisclosed equipment is never guessed.</div><ProjectExplorer items={projects} initialQuery={initialQuery} initialRegion={initialRegion} initialSector={sector} /></div></section></main>;
}
