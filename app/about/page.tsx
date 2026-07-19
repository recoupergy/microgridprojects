import type { Metadata } from "next";
import Link from "next/link";
import { SisterProjectCta } from "../components/SisterProjectCta";
import { projectCount } from "../data/projects";
import { researchStats } from "../data/research";
import { breadcrumbJsonLd, pageMetadata } from "../data/seo";
import { siteContact } from "../data/site";

export const metadata: Metadata = pageMetadata({
  title: "About the Directory",
  description: "Learn how the Microgrid Projects archive was migrated, structured, and presented for transparent research use.",
  path: "/about",
});

export default function AboutPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        name: "About Microgrid Projects",
        url: "https://microgridprojects.com/about",
        description: "How the Microgrid Projects archive was migrated, researched, sourced, and maintained.",
        mainEntity: { "@id": "https://microgridprojects.com/#dataset" },
      },
      breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "About", path: "/about" },
      ]),
    ],
  };

  return (
    <main id="main-content" className="site-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <section className="page-hero">
        <div className="container">
          <p className="breadcrumb"><Link href="/">Home</Link> / About</p>
          <p className="eyebrow"><span /> Open research infrastructure</p>
          <h1>About Microgrid Projects</h1>
          <p className="page-lede">A rebuilt, independent field guide preserving one of the early global microgrid project directories.</p>
        </div>
      </section>
      <section className="content-section">
        <div className="container record-grid">
          <article className="prose">
            <p className="answer-copy">Microgrid Projects helps people discover where local energy systems have been tested, built, and studied around the world.</p>
            <h2>Current stewardship</h2>
            <p>Microgrid Projects is maintained by <a href={siteContact.website}>{siteContact.organization}</a>. It is no longer part of or affiliated with Microgrid Media.</p>
            <h2 id="methodology">Methodology</h2>
            <p>The modern directory was reconstructed from the original WordPress map, individual project pages, and editorial sources. We preserved {projectCount} unique geocoded records, then recovered the historical detail pages and completed a primary-source enrichment pass for records with missing or ambiguous data.</p>
            <p>The current research layer contains {researchStats.organizations} organization mentions, {researchStats.specifications} specification rows, {researchStats.equipment} explicitly identified equipment or controller records, {researchStats.technicalDetails} additional technical notes, and {researchStats.sources} source references across all {researchStats.records} projects.</p>
            <h3>How claims are handled</h3>
            <p>Organization names, roles, specifications, equipment models, and status claims carry source-level citations. If a historical source named a company without identifying its role, the directory says so. If no controller model was found, the page reports that disclosure gap instead of guessing. Conflicting figures remain visible with their respective citations.</p>
            <p>Region and context labels are practical discovery aids inferred from the historical record. They are not engineering classifications or claims about present-day operation.</p>
            <h2>Data quality</h2>
            <p>The source archive primarily reflects research published between 2015 and 2017, while selected primary-source enrichments extend through 2026. Projects may have changed owners, technologies, capacity, scope, or operating status. Every record shows its research date, evidence depth, sources, and a correction path.</p>
            <h2 id="data-use">Data use</h2>
            <p>You may link to and cite individual directory pages. Before republishing data at scale or using it for commercial decisions, contact the Microgrid Projects team and independently verify the relevant records.</p>
            <h2>Who built the original directory?</h2>
            <p>The original project was created by Microgrid Media to track innovative microgrids, renewable integration, and emerging energy business models. That historical attribution does not indicate a current affiliation.</p>
            <p><Link className="button button-ink" href="/contact">Contact the research team</Link></p>
          </article>
          <aside className="record-map-card">
            <div className="map-kicker mono">ARCHIVE AT A GLANCE</div>
            <dl className="record-facts">
              <div><dt>Records</dt><dd>{projectCount}</dd></div>
              <div><dt>Coverage</dt><dd>Global</dd></div>
              <div><dt>Sources</dt><dd>{researchStats.sources}</dd></div>
              <div><dt>Access</dt><dd>Open</dd></div>
            </dl>
          </aside>
        </div>
        <div className="container sister-project-block">
          <SisterProjectCta
            title="Two sister projects, one clearer path from evidence to analysis."
            copy="Microgrid Projects is the discovery and research layer. MicrogridModeler is the modeling layer for reproducible off-grid PV, battery, and diesel feasibility studies."
            href={siteContact.website}
            linkLabel="Explore MicrogridModeler"
            secondaryHref={siteContact.methodology}
            secondaryLabel="Read its methodology"
          />
        </div>
      </section>
    </main>
  );
}
