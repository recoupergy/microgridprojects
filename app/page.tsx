import Link from "next/link";
import { WorldMap } from "./components/WorldMap";
import { marketProfiles, microgridTypes } from "./data/content";
import { projectCount, projects } from "./data/projects";
import { siteContact } from "./data/site";

export const metadata = {
  alternates: { canonical: "/" },
};

const featuredProjects = [...projects]
  .filter((project) => project.capacityKw)
  .sort((a, b) => (b.capacityKw ?? 0) - (a.capacityKw ?? 0))
  .slice(0, 6);

const faq = [
  {
    question: "What is a microgrid?",
    answer:
      "A microgrid is a local energy system that coordinates generation, storage, and loads within a defined boundary. It can operate with the wider grid or disconnect and run independently.",
  },
  {
    question: "Why do organizations build microgrids?",
    answer:
      "Organizations use microgrids to improve resilience, integrate renewable energy, manage peak demand, electrify remote places, and keep critical services operating during outages.",
  },
  {
    question: "What is included in this directory?",
    answer: `The directory preserves ${projectCount} geocoded projects from the original Microgrid Projects research archive, with reported capacity where it was published. Records are historical and should be independently verified.`,
  },
];

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://microgridprojects.com/#website",
    url: "https://microgridprojects.com/",
    name: "Microgrid Projects",
    description: "A global research directory of microgrid projects and markets.",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://microgridprojects.com/projects?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "@id": "https://microgridprojects.com/#dataset",
    name: "Microgrid Projects Global Directory",
    description: `A geocoded research archive of ${projectCount} microgrid projects around the world.`,
    url: "https://microgridprojects.com/projects",
    publisher: { "@type": "Organization", name: siteContact.organization, url: siteContact.website },
    spatialCoverage: "Worldwide",
    isAccessibleForFree: true,
    license: "https://microgridprojects.com/about#data-use",
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  },
];

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />

      <main id="main-content">
        <section className="hero section-pad">
          <div className="container hero-grid">
            <div className="hero-copy">
              <p className="eyebrow"><span /> The global field guide to local power</p>
              <h1>The world&rsquo;s microgrids, mapped.</h1>
              <p className="hero-lede">
                Explore the projects, technologies, and markets reshaping how
                communities make and manage energy.
              </p>
              <div className="button-row">
                <Link className="button button-primary" href="/projects">
                  Explore the directory <span aria-hidden="true">↗</span>
                </Link>
                <Link className="button button-ghost" href="/guides/types-of-microgrids">
                  Learn the fundamentals
                </Link>
              </div>
              <dl className="hero-stats" aria-label="Directory statistics">
                <div><dt>{projectCount}</dt><dd>mapped projects</dd></div>
                <div><dt>7</dt><dd>world regions</dd></div>
                <div><dt>Open</dt><dd>research archive</dd></div>
              </dl>
            </div>

            <div className="hero-map-wrap">
              <div className="map-kicker mono">LIVE DIRECTORY / WORLD VIEW</div>
              <WorldMap points={projects.filter((_, index) => index % 3 === 0)} />
              <div className="map-signal">
                <span className="pulse-dot" />
                <span><b>{projectCount}</b> systems indexed</span>
                <span className="mono">HISTORICAL DATASET</span>
              </div>
            </div>
          </div>
        </section>

        <section className="definition-band" aria-labelledby="microgrid-definition">
          <div className="container definition-grid">
            <p className="section-index mono">01 / THE ESSENTIAL ANSWER</p>
            <div>
              <h2 id="microgrid-definition">What is a microgrid?</h2>
              <p className="answer-copy">
                A microgrid is a local energy system that coordinates power
                generation, storage, and demand inside a defined boundary. It can
                stay connected to the wider grid—or island and keep critical loads
                running on its own.
              </p>
              <Link className="text-link" href="/guides/types-of-microgrids">
                Understand the major microgrid types <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>

        <section className="section-pad directory-preview" aria-labelledby="featured-heading">
          <div className="container">
            <div className="section-heading split-heading">
              <div>
                <p className="eyebrow eyebrow-dark"><span /> Directory highlights</p>
                <h2 id="featured-heading">Big systems. Small islands. One shared idea.</h2>
              </div>
              <Link className="text-link" href="/projects">View all {projectCount} projects <span aria-hidden="true">→</span></Link>
            </div>

            <div className="project-grid project-grid-featured">
              {featuredProjects.map((project, index) => (
                <article className="project-card" key={project.slug}>
                  <div className="card-topline mono">
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <span>{project.region}</span>
                  </div>
                  <div className="project-orbit" aria-hidden="true"><span /></div>
                  <p className="project-sector">{project.sector}</p>
                  <h3><Link href={`/projects/${project.slug}`}>{project.name}</Link></h3>
                  <dl className="project-meta">
                    <div><dt>Reported capacity</dt><dd>{project.capacity ?? "Not published"}</dd></div>
                    <div><dt>Coordinates</dt><dd className="mono">{project.latitude.toFixed(2)}, {project.longitude.toFixed(2)}</dd></div>
                  </dl>
                  <Link className="card-link" href={`/projects/${project.slug}`} aria-label={`View ${project.name}`}>
                    <span>Open record</span><span aria-hidden="true">↗</span>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="markets-band section-pad" aria-labelledby="markets-heading">
          <div className="container">
            <div className="section-heading split-heading light-heading">
              <div>
                <p className="eyebrow"><span /> Market intelligence</p>
                <h2 id="markets-heading">Follow the forces shaping deployment.</h2>
              </div>
              <p>Place matters. Policy, reliability, fuel cost, and energy access create a different microgrid case in every market.</p>
            </div>
            <div className="market-grid">
              {marketProfiles.slice(0, 4).map((market, index) => (
                <Link className="market-card" href={market.href} key={market.slug}>
                  <span className="market-number mono">0{index + 1}</span>
                  <h3>{market.title}</h3>
                  <p>{market.short}</p>
                  <span className="market-arrow" aria-hidden="true">↗</span>
                </Link>
              ))}
            </div>
            <div className="band-link-row"><Link className="text-link text-link-light" href="/markets">Explore every market lens <span aria-hidden="true">→</span></Link></div>
          </div>
        </section>

        <section className="section-pad types-section" aria-labelledby="types-heading">
          <div className="container types-layout">
            <div className="types-intro">
              <p className="eyebrow eyebrow-dark"><span /> System taxonomy</p>
              <h2 id="types-heading">Microgrids are built for a job.</h2>
              <p>From a university campus to a remote island, the load, operating model, and reason for islanding shape the system.</p>
              <Link className="button button-ink" href="/guides/types-of-microgrids">Compare microgrid types</Link>
            </div>
            <ol className="type-list">
              {microgridTypes.slice(0, 5).map((type, index) => (
                <li key={type.slug}>
                  <span className="mono">{String(index + 1).padStart(2, "0")}</span>
                  <div><h3>{type.name}</h3><p>{type.summary}</p></div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="faq-section section-pad" aria-labelledby="faq-heading">
          <div className="container faq-layout">
            <div>
              <p className="eyebrow eyebrow-dark"><span /> Common questions</p>
              <h2 id="faq-heading">Microgrid answers, without the jargon.</h2>
            </div>
            <div className="faq-list">
              {faq.map((item) => (
                <details key={item.question}>
                  <summary>{item.question}<span aria-hidden="true">+</span></summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="contribute-section">
          <div className="container contribute-inner">
            <p className="eyebrow"><span /> Improve the record</p>
            <h2>Know a project we should track?</h2>
            <p>Help keep this open directory useful for developers, researchers, communities, and decision-makers.</p>
            <Link className="button button-signal" href="/contact#submit">Submit a project <span aria-hidden="true">↗</span></Link>
          </div>
        </section>
      </main>
    </>
  );
}
