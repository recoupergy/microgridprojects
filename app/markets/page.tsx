import type { Metadata } from "next";
import Link from "next/link";
import { SisterProjectCta } from "../components/SisterProjectCta";
import { marketProfiles } from "../data/content";
import { siteContact } from "../data/site";

export const metadata: Metadata = {
  title: "Microgrid Markets",
  description: "Explore the regional, policy, resilience, energy-access, and island-market forces shaping microgrid deployment worldwide.",
  alternates: { canonical: "/markets" },
};

export default function MarketsPage() {
  return (
    <main id="main-content" className="site-shell">
      <section className="page-hero">
        <div className="container">
          <p className="breadcrumb"><Link href="/">Home</Link> / Markets</p>
          <p className="eyebrow"><span /> Deployment context</p>
          <h1>Microgrid markets</h1>
          <p className="page-lede">Microgrids solve local problems. Reliability rules, fuel prices, energy access, climate risk, and critical loads determine where—and why—they get built.</p>
        </div>
      </section>
      <section className="content-section">
        <div className="container">
          <div className="definition-grid">
            <p className="section-index mono">MARKET LENS</p>
            <p className="answer-copy">There is no single microgrid market. The business case changes with geography, policy, grid quality, customer needs, and the cost of an outage.</p>
          </div>
          <div className="market-list content-section">
            {marketProfiles.map((market, index) => (
              <article className="market-profile" key={market.slug}>
                <span className="mono">{String(index + 1).padStart(2, "0")}</span>
                <h2>{market.title}</h2>
                <p>{market.short}</p>
                <Link className="text-link" href={market.href}>View matching projects <span aria-hidden="true">→</span></Link>
              </article>
            ))}
          </div>
          <div className="archive-note">Market descriptions are editorial context, not forecasts. For investment, policy, or procurement decisions, pair the directory with current regulatory filings and primary-source project data.</div>
          <div className="sister-project-block">
            <SisterProjectCta
              title="Turn market context into a site-specific case."
              copy="Use MicrogridModeler to test how solar resource, fuel price, load shape, battery constraints, and reliability requirements change the economics for your location."
              href={siteContact.modeler}
              linkLabel="Model a microgrid"
              secondaryHref={siteContact.calculators}
              secondaryLabel="Explore energy calculators"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
