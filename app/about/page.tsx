import type { Metadata } from "next";
import Link from "next/link";
import { projectCount } from "../data/projects";
import { siteContact } from "../data/site";

export const metadata: Metadata = {
  title: "About the Directory",
  description: "Learn how the Microgrid Projects archive was migrated, structured, and presented for transparent research use.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main id="main-content" className="site-shell">
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
            <p>The modern directory was reconstructed from the original WordPress map and editorial pages. We preserved {projectCount} unique geocoded project records, normalized project names and capacity units, retained original coordinates, and organized records by broad geographic region and system context.</p>
            <p>Region and context labels are practical discovery aids inferred from the historical record. They are not engineering classifications or claims about present-day operation.</p>
            <h2>Data quality</h2>
            <p>The source archive primarily reflects research published between 2015 and 2017. Projects may have changed owners, technologies, capacity, scope, or operating status. Every record is clearly labeled as historical and invites corrections.</p>
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
              <div><dt>Source period</dt><dd>2015–2017</dd></div>
              <div><dt>Access</dt><dd>Open</dd></div>
            </dl>
          </aside>
        </div>
      </section>
    </main>
  );
}
