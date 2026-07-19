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

export default async function ProjectsPage({ searchParams }: Props) {
  const { q = "", region = "", sector = "" } = await searchParams;
  const itemList = {
    "@context": "https://schema.org", "@type": "CollectionPage", name: "Global Microgrid Project Directory", url: "https://microgridprojects.com/projects",
    mainEntity: { "@type": "ItemList", numberOfItems: projectCount, itemListElement: projects.map((project, index) => ({ "@type": "ListItem", position: index + 1, name: project.name, url: `https://microgridprojects.com/projects/${project.slug}` })) },
  };
  return <main id="main-content" className="site-shell"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList).replace(/</g, "\\u003c") }} /><section className="page-hero"><div className="container"><p className="breadcrumb"><Link href="/">Home</Link> / Directory</p><p className="eyebrow"><span /> Global research archive</p><h1>Microgrid project directory</h1><p className="page-lede">Search {projectCount} mapped systems across seven regions—from campus and defense installations to island grids and remote communities.</p></div></section><section className="content-section"><div className="container"><div className="archive-note"><b>Data note:</b> These records preserve the original Microgrid Projects archive. Capacity and project status reflect historical source material and should be independently verified before use.</div><ProjectExplorer items={projects} initialQuery={q} initialRegion={region} initialSector={sector} /></div></section></main>;
}
