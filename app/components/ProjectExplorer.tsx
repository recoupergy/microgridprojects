"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { REGIONS, SECTORS, type MicrogridProject } from "../data/projects";

export function ProjectExplorer({ items, initialQuery = "", initialRegion = "", initialSector = "" }: { items: readonly MicrogridProject[]; initialQuery?: string; initialRegion?: string; initialSector?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [region, setRegion] = useState(initialRegion);
  const [sector, setSector] = useState(initialSector);
  const [showAll, setShowAll] = useState(false);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter((project) => {
      const matchesQuery = !needle || `${project.name} ${project.region} ${project.sector} ${project.capacity ?? ""}`.toLowerCase().includes(needle);
      return matchesQuery && (!region || project.region === region) && (!sector || project.sector === sector);
    });
  }, [items, query, region, sector]);

  const visible = showAll ? filtered : filtered.slice(0, 24);

  return (
    <div>
      <div className="directory-controls" role="search" aria-label="Filter microgrid projects">
        <div className="field"><label htmlFor="project-search">Search the directory</label><input id="project-search" type="search" value={query} onChange={(event) => { setQuery(event.target.value); setShowAll(false); }} placeholder="Project, place, sector, capacity…" /></div>
        <div className="field"><label htmlFor="region-filter">Region</label><select id="region-filter" value={region} onChange={(event) => { setRegion(event.target.value); setShowAll(false); }}><option value="">All regions</option>{REGIONS.map((item) => <option value={item} key={item}>{item}</option>)}</select></div>
        <div className="field"><label htmlFor="sector-filter">System context</label><select id="sector-filter" value={sector} onChange={(event) => { setSector(event.target.value); setShowAll(false); }}><option value="">All contexts</option>{SECTORS.map((item) => <option value={item} key={item}>{item}</option>)}</select></div>
      </div>
      <div className="results-line" aria-live="polite"><span>{filtered.length} {filtered.length === 1 ? "project" : "projects"}</span><span>{region || sector || query ? "Filtered results" : "Global archive"}</span></div>
      <div className="project-grid">
        {visible.map((project, index) => (
          <article className="project-card" key={project.slug}>
            <div className="card-topline mono"><span>{String(index + 1).padStart(2, "0")}</span><span>{project.region}</span></div>
            <div className="project-orbit" aria-hidden="true"><span /></div>
            <p className="project-sector">{project.sector}</p>
            <h3><Link href={`/projects/${project.slug}`}>{project.name}</Link></h3>
            <dl className="project-meta"><div><dt>Reported capacity</dt><dd>{project.capacity ?? "Not published"}</dd></div><div><dt>Coordinates</dt><dd className="mono">{project.latitude.toFixed(2)}, {project.longitude.toFixed(2)}</dd></div></dl>
            <Link className="card-link" href={`/projects/${project.slug}`} aria-label={`View ${project.name}`}><span>Open record</span><span aria-hidden="true">↗</span></Link>
          </article>
        ))}
        {filtered.length === 0 ? <div className="empty-state"><h2>No projects match those filters.</h2><p>Try a broader place, region, or system context.</p></div> : null}
      </div>
      {!showAll && filtered.length > 24 ? <div className="show-more-row"><button className="button button-ink" type="button" onClick={() => setShowAll(true)}>Show all {filtered.length} projects</button></div> : null}
    </div>
  );
}
