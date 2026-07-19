import type { Metadata } from "next";
import Link from "next/link";
import { SisterProjectCta } from "../../components/SisterProjectCta";
import { microgridTypes } from "../../data/content";
import { breadcrumbJsonLd, pageMetadata } from "../../data/seo";
import { siteContact } from "../../data/site";

export const metadata: Metadata = pageMetadata({
  title: "Types of Microgrids: Definitions & Comparison",
  description: "Compare campus, community, island, remote, military, industrial, DC, and utility microgrids by boundary, purpose, and grid relationship.",
  path: "/guides/types-of-microgrids",
});

const questions = [
  {
    q: "What are the main types of microgrids?",
    a: "Common types include campus, community, island, remote, military, industrial, direct-current, and utility microgrids. A single project can fit more than one category.",
  },
  {
    q: "What is the difference between an island microgrid and islanding?",
    a: "An island microgrid serves a geographically isolated place. Islanding is an operating mode in which any grid-connected microgrid disconnects from the wider power system and runs independently.",
  },
  {
    q: "Do all microgrids use renewable energy?",
    a: "No. A microgrid is defined by coordinated local control and the ability to serve a bounded set of loads. Its resources may include solar, wind, batteries, CHP, fuel cells, diesel, or the utility grid.",
  },
  {
    q: "How should I compare microgrid types?",
    a: "Start with the electrical boundary, the loads that must be served, the operating objective, and the grid relationship. Then compare resource options, controls, reliability targets, ownership, and economics.",
  },
] as const;

const comparisonRows = [
  { type: "Campus", boundary: "One institution or multi-building site", priority: "Resilience, cost, and thermal/electric coordination", grid: "Usually grid-connected with islanding" },
  { type: "Community", boundary: "Multiple customers or public facilities", priority: "Shared resilience and local energy value", grid: "Grid-connected or intentionally islandable" },
  { type: "Island", boundary: "A geographically isolated electric system", priority: "Fuel displacement, stability, and resource balancing", grid: "Normally isolated from a larger grid" },
  { type: "Remote", boundary: "A site or settlement beyond a strong utility grid", priority: "Reliable access and lower delivered-fuel use", grid: "Often isolated; sometimes weak-grid connected" },
  { type: "Military", boundary: "A defense installation or mission-critical loads", priority: "Mission assurance, cybersecurity, and fuel resilience", grid: "Commonly grid-connected with secure islanding" },
  { type: "Industrial", boundary: "A plant, mine, data center, or commercial complex", priority: "Process continuity, power quality, and energy cost", grid: "Grid-connected, weak-grid, or remote" },
  { type: "DC", boundary: "A defined direct-current bus and connected assets", priority: "Efficient integration of native DC sources, storage, and loads", grid: "Can be grid-connected or isolated" },
  { type: "Utility", boundary: "A feeder, district, or utility-defined service area", priority: "Distribution reliability and system flexibility", grid: "Part of a larger grid with an islandable boundary" },
] as const;

const directoryLinks: Record<(typeof microgridTypes)[number]["slug"], string> = {
  campus: "/projects?sector=Campus%20%26%20research",
  community: "/projects?sector=Community",
  island: "/projects?sector=Island%20%26%20remote%20community",
  remote: "/projects?sector=Island%20%26%20remote%20community",
  military: "/projects?sector=Defense",
  industrial: "/projects?sector=Industrial%20%26%20mining",
  dc: "/projects?q=DC",
  utility: "/projects?q=Utility",
};

export default function TypesGuidePage() {
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "Types of Microgrids: Definitions and Comparison",
      description: "A practical comparison of eight common microgrid types.",
      author: { "@type": "Organization", name: siteContact.organization, url: siteContact.website },
      publisher: { "@type": "Organization", name: siteContact.organization, url: siteContact.website },
      mainEntityOfPage: "https://microgridprojects.com/guides/types-of-microgrids",
      dateModified: "2026-07-19",
      inLanguage: "en-US",
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: questions.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Types of microgrids", path: "/guides/types-of-microgrids" },
    ]),
  ];

  return (
    <main id="main-content" className="site-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <section className="page-hero">
        <div className="container">
          <p className="breadcrumb"><Link href="/">Home</Link> / Guides / Types of microgrids</p>
          <p className="eyebrow"><span /> Plain-language guide</p>
          <h1>Types of microgrids</h1>
          <p className="page-lede">Microgrids are classified by the customers they serve, the reason they exist, their grid relationship, and the technologies inside them.</p>
        </div>
      </section>
      <section className="content-section">
        <div className="container">
          <div className="definition-grid">
            <p className="section-index mono">THE SHORT ANSWER</p>
            <div><p className="answer-copy">The major microgrid types are campus, community, island, remote, military, industrial, DC, and utility systems. Categories overlap: a military island base can be both a campus and a remote microgrid.</p></div>
          </div>
          <div className="archive-note">This guide modernizes the original Microgrid Projects taxonomy while preserving its central idea: microgrids are best understood by the job they are designed to do.</div>
          <div className="guide-grid">
            {microgridTypes.map((type, index) => (
              <article className="guide-card" id={type.slug} key={type.slug}>
                <span className="mono">{String(index + 1).padStart(2, "0")}</span>
                <h2>{type.name}</h2>
                <p>{type.summary}</p>
                <Link className="text-link" href={directoryLinks[type.slug]}>Browse related records <span aria-hidden="true">→</span></Link>
              </article>
            ))}
          </div>
          <section className="comparison-section" id="comparison" aria-labelledby="comparison-heading">
            <div className="section-heading">
              <p className="eyebrow eyebrow-dark"><span /> Side-by-side</p>
              <h2 id="comparison-heading">Microgrid type comparison</h2>
              <p>Compare the boundary, operating priority, and typical grid relationship first. Generation technology alone does not define the type.</p>
            </div>
            <div className="comparison-scroll">
              <table className="comparison-table">
                <thead><tr><th scope="col">Type</th><th scope="col">Typical boundary</th><th scope="col">Primary design priority</th><th scope="col">Grid relationship</th></tr></thead>
                <tbody>
                  {comparisonRows.map((row) => <tr key={row.type}><th scope="row">{row.type}</th><td>{row.boundary}</td><td>{row.priority}</td><td>{row.grid}</td></tr>)}
                </tbody>
              </table>
            </div>
          </section>
          <div className="sister-project-block">
            <SisterProjectCta title="Know the type. Now size the system." copy="MicrogridModeler evaluates PV, battery, and diesel combinations against hourly load, lifecycle cost, and hard reliability constraints—so a category becomes a testable design case." href={siteContact.modeler} linkLabel="Launch the modeler" secondaryHref={siteContact.methodology} secondaryLabel="See how the engine works" />
          </div>
          <div className="faq-layout content-section">
            <div><p className="eyebrow eyebrow-dark"><span /> Quick answers</p><h2>Questions people ask about microgrid types</h2></div>
            <div className="faq-list">{questions.map((item) => <details key={item.q}><summary>{item.q}<span aria-hidden="true">+</span></summary><p>{item.a}</p></details>)}</div>
          </div>
        </div>
      </section>
    </main>
  );
}
