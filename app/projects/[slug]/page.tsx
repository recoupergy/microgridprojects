import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SisterProjectCta } from "../../components/SisterProjectCta";
import { WorldMap } from "../../components/WorldMap";
import { getProject, projects } from "../../data/projects";
import { getProjectResearch, type ProjectResearch } from "../../data/research";
import { breadcrumbJsonLd, pageMetadata, projectDescription } from "../../data/seo";
import { siteContact } from "../../data/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

function citationNumber(research: ProjectResearch, sourceId: string) {
  return research.sources.findIndex((source) => source.id === sourceId) + 1;
}

function Citations({ research, sourceIds }: { research: ProjectResearch; sourceIds: string[] }) {
  const uniqueIds = [...new Set(sourceIds)];
  return (
    <span className="citation-cluster" aria-label="Sources">
      {uniqueIds.map((sourceId) => {
        const number = citationNumber(research, sourceId);
        return number > 0 ? <a key={sourceId} href={`#source-${sourceId}`} aria-label={`Source ${number}`}>[{number}]</a> : null;
      })}
    </span>
  );
}

function coverageLabel(coverage: ProjectResearch["coverage"]) {
  if (coverage === "detailed") return "Detailed public record";
  if (coverage === "partial") return "Partial public record";
  return "Limited public record";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return { title: "Project not found" };
  const hasDuplicateName = projects.some((item) => item.slug !== project.slug && item.name === project.name);
  const title = hasDuplicateName && project.capacity ? `${project.name} (${project.capacity})` : project.name;
  const description = projectDescription({ name: title, region: project.region });
  return pageMetadata({
    title,
    description,
    path: `/projects/${project.slug}`,
  });
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  const research = getProjectResearch(slug);
  if (!research) notFound();

  const related = projects.filter((item) => item.region === project.region && item.slug !== project.slug).slice(0, 3);
  const sourceWord = research.sources.length === 1 ? "source" : "sources";
  const correctionHref = `mailto:${siteContact.email}?subject=${encodeURIComponent(`Microgrid Projects correction: ${project.name}`)}&body=${encodeURIComponent(`Project: ${project.name}\nRecord: https://microgridprojects.com/projects/${project.slug}\n\nOrganization, equipment, controller, status, or specification correction:\n\nPrimary-source link:\n`)}`;
  const description = research.summary ?? `${project.name} is catalogued as a ${project.sector.toLowerCase()} system in ${project.region}.`;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Place",
        "@id": `https://microgridprojects.com/projects/${project.slug}#project`,
        name: project.name,
        url: `https://microgridprojects.com/projects/${project.slug}`,
        geo: { "@type": "GeoCoordinates", latitude: project.latitude, longitude: project.longitude },
      },
      {
        "@type": "Dataset",
        "@id": `https://microgridprojects.com/projects/${project.slug}#research`,
        name: `${project.name} project research record`,
        description,
        url: `https://microgridprojects.com/projects/${project.slug}`,
        dateModified: research.researchedAt,
        inLanguage: "en-US",
        isAccessibleForFree: true,
        license: "https://microgridprojects.com/about#data-use",
        creator: { "@type": "Organization", name: siteContact.organization, url: siteContact.website },
        spatialCoverage: { "@id": `https://microgridprojects.com/projects/${project.slug}#project` },
        citation: research.sources.map((source) => source.url),
        variableMeasured: [
          { "@type": "PropertyValue", name: "System context", value: project.sector },
          { "@type": "PropertyValue", name: "Region", value: project.region },
          ...(research.status ? [{ "@type": "PropertyValue", name: "Research status", value: research.status }] : []),
          ...research.specifications.map((item) => ({ "@type": "PropertyValue", name: item.label, value: item.value })),
        ],
      },
      breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Project directory", path: "/projects" },
        { name: project.name, path: `/projects/${project.slug}` },
      ]),
    ],
  };

  return (
    <main id="main-content" className="site-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <section className="page-hero project-research-hero">
        <div className="container">
          <p className="breadcrumb"><Link href="/">Home</Link> / <Link href="/projects">Directory</Link> / {project.name}</p>
          <p className="eyebrow"><span /> {project.region} / {project.sector}</p>
          <h1>{project.name}</h1>
          <p className="page-lede">Organizations, planners, suppliers, equipment, controls, and reported system specifications—with source-level citations.</p>
        </div>
      </section>

      <section className="research-status-band" aria-label="Research coverage">
        <div className="container research-status-grid">
          <div><span>Coverage</span><b>{coverageLabel(research.coverage)}</b></div>
          <div><span>Named organizations</span><b>{research.organizations.length}</b></div>
          <div><span>System facts</span><b>{research.specifications.length + research.equipment.length + research.technicalDetails.length}</b></div>
          <div><span>Sources reviewed</span><b>{research.sources.length}</b></div>
          <div><span>Last researched</span><b>{research.researchedAt}</b></div>
        </div>
      </section>

      <section className="content-section">
        <div className="container record-grid">
          <article className="prose project-summary">
            <p className="answer-copy">{description}</p>
            <dl className="record-facts">
              <div><dt>Research status</dt><dd>{research.status ?? "Not confirmed"}</dd></div>
              <div><dt>Historical classification</dt><dd>{research.classification ?? project.sector}</dd></div>
              <div><dt>Reported capacity</dt><dd>{project.capacity ?? "See component specifications"}</dd></div>
              <div><dt>Coordinates</dt><dd className="mono">{project.latitude.toFixed(5)}, {project.longitude.toFixed(5)}</dd></div>
            </dl>
            <div className="archive-note"><b>Evidence note:</b> “Every company” cannot be proven from public material alone. This page lists every organization found in the recovered record and reviewed sources, preserves unknown roles, and explicitly marks undisclosed controller or equipment details.</div>
            <div className="record-actions">
              <a className="button button-ink" href={correctionHref}>Report missing evidence</a>
              <Link className="button" href="/about#methodology">Research methodology</Link>
            </div>
          </article>
          <aside className="record-map-card">
            <div className="map-kicker mono">PROJECT COORDINATES</div>
            <WorldMap points={[project]} label={`Map location of ${project.name}`} />
            <div className="map-signal"><span className="pulse-dot" /><span>{project.latitude.toFixed(3)}, {project.longitude.toFixed(3)}</span><span className="mono">RESEARCHED RECORD</span></div>
          </aside>
        </div>

        <div className="container research-section" id="organizations">
          <div className="research-heading">
            <div><p className="eyebrow eyebrow-dark"><span /> Project delivery</p><h2>Who was involved in {project.name}?</h2></div>
            <p>{research.organizations.length} publicly identified organizations. Where a recovered source named a participant without explaining its work, the role remains explicitly unspecified.</p>
          </div>
          {research.organizations.length ? (
            <div className="organization-grid">
              {research.organizations.map((organization) => (
                <article className="organization-card" key={`${organization.name}-${organization.role}`}>
                  <p className="mono">Organization</p>
                  <h3>{organization.name}</h3>
                  <p>{organization.role} <Citations research={research} sourceIds={organization.sourceIds} /></p>
                </article>
              ))}
            </div>
          ) : <div className="research-empty">No organization names were disclosed in the public sources reviewed.</div>}
        </div>

        <div className="container research-section" id="specifications">
          <div className="research-heading">
            <div><p className="eyebrow eyebrow-dark"><span /> System evidence</p><h2>Reported capacity and specifications</h2></div>
            <p>Values can describe different project phases or components. Source citations are attached to each figure so discrepancies remain visible.</p>
          </div>
          {research.specifications.length ? (
            <dl className="specification-grid">
              {research.specifications.map((specification, index) => (
                <div key={`${specification.label}-${specification.value}-${index}`}>
                  <dt>{specification.label}</dt>
                  <dd>{specification.value} <Citations research={research} sourceIds={specification.sourceIds} /></dd>
                </div>
              ))}
            </dl>
          ) : <div className="research-empty">No component-level rating was published in the reviewed sources.</div>}
        </div>

        <div className="container research-section" id="equipment">
          <div className="research-heading">
            <div><p className="eyebrow eyebrow-dark"><span /> Controls and hardware</p><h2>Equipment and controller details</h2></div>
            <p>Manufacturer and model are shown only when a source names them. Generic descriptions are not converted into guessed product assignments.</p>
          </div>
          {research.equipment.length ? (
            <div className="equipment-list">
              {research.equipment.map((item, index) => (
                <article key={`${item.category}-${item.model ?? index}`}>
                  <div className="equipment-index mono">{String(index + 1).padStart(2, "0")}</div>
                  <div>
                    <p className="equipment-category mono">{item.category}</p>
                    <h3>{[item.manufacturer, item.model].filter(Boolean).join(" — ") || "Model not publicly disclosed"}</h3>
                    <p>{item.detail} <Citations research={research} sourceIds={item.sourceIds} /></p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="research-empty"><b>No controller or equipment model was found in the reviewed public sources.</b> This is a disclosure gap, not evidence that the project lacks coordinated controls.</div>
          )}
        </div>

        {research.technicalDetails.length ? (
          <div className="container research-section" id="technical-notes">
            <div className="research-heading">
              <div><p className="eyebrow eyebrow-dark"><span /> Recovered detail</p><h2>Additional technical notes</h2></div>
              <p>Concise system facts recovered from the historical project record. Treat these as historical unless a newer primary source confirms them.</p>
            </div>
            <ul className="technical-note-list">
              {research.technicalDetails.map((item, index) => <li key={`${item.detail}-${index}`}><span className="mono">{item.category}</span><p>{item.detail} <Citations research={research} sourceIds={item.sourceIds} /></p></li>)}
            </ul>
          </div>
        ) : null}

        <div className="container research-section" id="sources">
          <div className="research-heading">
            <div><p className="eyebrow eyebrow-dark"><span /> Provenance</p><h2>{research.sources.length} {sourceWord}</h2></div>
            <p>Primary owner, government, university, supplier, and engineering sources are preferred. Archived references preserve claims whose original pages moved or disappeared.</p>
          </div>
          <ol className="source-list">
            {research.sources.map((source, index) => (
              <li id={`source-${source.id}`} key={source.id}>
                <span className="source-number mono">[{index + 1}]</span>
                <div><a href={source.url} target="_blank" rel="noreferrer">{source.title} <span aria-hidden="true">↗</span></a><p>{source.publisher} · {source.kind === "primary" ? "Primary source" : source.kind === "archive" ? "Archived source" : "Secondary research"}{source.capturedAt ? ` · captured ${source.capturedAt}` : ""}</p></div>
              </li>
            ))}
          </ol>
        </div>

        <div className="container sister-project-block">
          <SisterProjectCta
            title="Use the precedent. Test your own assumptions."
            copy={`This ${project.sector.toLowerCase()} record documents public evidence and historical specifications. MicrogridModeler lets you build a separate, site-specific PV, battery, and diesel feasibility case with transparent hourly dispatch and lifecycle economics.`}
            href={siteContact.modeler}
            linkLabel="Model a comparable system"
            secondaryHref={siteContact.methodology}
            secondaryLabel="Review the methodology"
          />
        </div>

        <div className="container related-section">
          <p className="eyebrow eyebrow-dark"><span /> Continue exploring</p>
          <h2>Related projects in {project.region}</h2>
          <div className="project-grid">
            {related.map((item, index) => (
              <article className="project-card" key={item.slug}>
                <div className="card-topline mono"><span>0{index + 1}</span><span>{item.region}</span></div>
                <div className="project-orbit" aria-hidden="true"><span /></div>
                <p className="project-sector">{item.sector}</p>
                <h3><Link href={`/projects/${item.slug}`}>{item.name}</Link></h3>
                <dl className="project-meta"><div><dt>Reported capacity</dt><dd>{item.capacity ?? "See researched record"}</dd></div></dl>
                <Link className="card-link" href={`/projects/${item.slug}`}><span>Open researched record</span><span aria-hidden="true">↗</span></Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
