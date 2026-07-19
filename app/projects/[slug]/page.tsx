import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SisterProjectCta } from "../../components/SisterProjectCta";
import { WorldMap } from "../../components/WorldMap";
import { getProject, projects } from "../../data/projects";
import { siteContact } from "../../data/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() { return projects.map((project) => ({ slug: project.slug })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return { title: "Project not found" };
  const hasDuplicateName = projects.some((item) => item.slug !== project.slug && item.name === project.name);
  const title = hasDuplicateName && project.capacity ? `${project.name} (${project.capacity})` : project.name;
  const description = `${project.name} is a ${project.sector.toLowerCase()} microgrid record in ${project.region}${project.capacity ? ` with ${project.capacity} reported capacity` : ""}. View coordinates and related projects.`;
  return { title, description, alternates: { canonical: `/projects/${project.slug}` }, openGraph: { title: `${title} | Microgrid Projects`, description, url: `/projects/${project.slug}` } };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  const related = projects.filter((item) => item.region === project.region && item.slug !== project.slug).slice(0, 3);
  const correctionHref = `mailto:${siteContact.email}?subject=${encodeURIComponent(`Microgrid Projects correction: ${project.name}`)}&body=${encodeURIComponent(`Project: ${project.name}\nRecord: https://microgridprojects.com/projects/${project.slug}\n\nSuggested correction or update:\n`)}`;
  const structuredData = { "@context": "https://schema.org", "@type": "Place", "@id": `https://microgridprojects.com/projects/${project.slug}#project`, name: project.name, url: `https://microgridprojects.com/projects/${project.slug}`, geo: { "@type": "GeoCoordinates", latitude: project.latitude, longitude: project.longitude }, additionalProperty: [{ "@type": "PropertyValue", name: "System context", value: project.sector }, { "@type": "PropertyValue", name: "Region", value: project.region }, ...(project.capacity ? [{ "@type": "PropertyValue", name: "Reported capacity", value: project.capacity }] : [])] };
  return <main id="main-content" className="site-shell"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} /><section className="page-hero"><div className="container"><p className="breadcrumb"><Link href="/">Home</Link> / <Link href="/projects">Directory</Link> / {project.name}</p><p className="eyebrow"><span /> {project.region} / {project.sector}</p><h1>{project.name}</h1><p className="page-lede">A geocoded record from the original Microgrid Projects global research archive.</p></div></section><section className="content-section"><div className="container record-grid"><article className="prose"><p className="answer-copy">{project.name} is catalogued as a {project.sector.toLowerCase()} system in {project.region}. {project.capacity ? `The legacy directory reports ${project.capacity} of capacity.` : "The legacy record did not publish a total capacity."}</p><dl className="record-facts"><div><dt>Region</dt><dd>{project.region}</dd></div><div><dt>System context</dt><dd>{project.sector}</dd></div><div><dt>Reported capacity</dt><dd>{project.capacity ?? "Not published"}</dd></div><div><dt>Coordinates</dt><dd className="mono">{project.latitude.toFixed(5)}, {project.longitude.toFixed(5)}</dd></div></dl><div className="archive-note"><b>Research status:</b> This record was carried forward from the historical directory. Confirm commissioning status, ownership, technology, and capacity with a current primary source before citing it.</div><div className="record-actions"><a className="button button-ink" href={correctionHref}>Report an update</a><Link className="button" href={`/projects?region=${encodeURIComponent(project.region)}`}>More in {project.region}</Link></div></article><aside className="record-map-card"><div className="map-kicker mono">PROJECT COORDINATES</div><WorldMap points={[project]} label={`Map location of ${project.name}`} /><div className="map-signal"><span className="pulse-dot" /><span>{project.latitude.toFixed(3)}, {project.longitude.toFixed(3)}</span><span className="mono">ARCHIVE RECORD</span></div></aside></div><div className="container sister-project-block"><SisterProjectCta title="Use the precedent. Test your own assumptions." copy={`This ${project.sector.toLowerCase()} record offers historical context. MicrogridModeler lets you build a separate, site-specific PV, battery, and diesel feasibility case with transparent hourly dispatch and lifecycle economics.`} href={siteContact.modeler} linkLabel="Model a comparable system" secondaryHref={siteContact.methodology} secondaryLabel="Review the methodology" /></div><div className="container related-section"><p className="eyebrow eyebrow-dark"><span /> Continue exploring</p><h2>Related projects in {project.region}</h2><div className="project-grid">{related.map((item, index) => <article className="project-card" key={item.slug}><div className="card-topline mono"><span>0{index + 1}</span><span>{item.region}</span></div><div className="project-orbit" aria-hidden="true"><span /></div><p className="project-sector">{item.sector}</p><h3><Link href={`/projects/${item.slug}`}>{item.name}</Link></h3><dl className="project-meta"><div><dt>Reported capacity</dt><dd>{item.capacity ?? "Not published"}</dd></div></dl><Link className="card-link" href={`/projects/${item.slug}`}><span>Open record</span><span aria-hidden="true">↗</span></Link></article>)}</div></div></section></main>;
}
