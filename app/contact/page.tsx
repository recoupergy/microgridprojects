import type { Metadata } from "next";
import Link from "next/link";
import { breadcrumbJsonLd, pageMetadata } from "../data/seo";
import { siteContact } from "../data/site";

export const metadata: Metadata = pageMetadata({
  title: "Contact and Submit a Project",
  description: `Contact Microgrid Projects, maintained by ${siteContact.organization}, to submit a project or suggest a correction.`,
  path: "/contact",
});

export default function ContactPage() {
  const submitHref = `mailto:${siteContact.email}?subject=${encodeURIComponent("Microgrid Projects submission")}&body=${encodeURIComponent("Project name:\nLocation / coordinates:\nProject owner or developer:\nCapacity and technologies:\nOperating status and commissioning date:\nPrimary-source links:\nNotes:\n")}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ContactPage",
        name: "Contact and submit a microgrid project",
        url: "https://microgridprojects.com/contact",
        about: { "@id": "https://microgridprojects.com/#dataset" },
      },
      breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Contact", path: "/contact" },
      ]),
    ],
  };

  return (
    <main id="main-content" className="site-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <section className="page-hero">
        <div className="container">
          <p className="breadcrumb"><Link href="/">Home</Link> / Contact</p>
          <p className="eyebrow"><span /> Get in touch</p>
          <h1>Contact the team</h1>
          <p className="page-lede">Help us open more microgrid knowledge and data: send a project, correct a record, discuss the research, or explore a partnership. Microgrid Projects is maintained by {siteContact.organization}.</p>
        </div>
      </section>
      <section className="content-section">
        <div className="container contact-grid">
          <div className="contact-cards">
            <article className="contact-card">
              <h2>Research and project data</h2>
              <p>Project submissions, corrections, sourcing questions, and research inquiries.</p>
              <a className="text-link" href={`mailto:${siteContact.email}`}>{siteContact.email} <span aria-hidden="true">↗</span></a>
            </article>
            <article className="contact-card">
              <h2>Organization and partnerships</h2>
              <p>Microgrid Projects uses the same contact channel as MicrogridModeler.</p>
              <a className="text-link" href={siteContact.website}>Visit MicrogridModeler <span aria-hidden="true">↗</span></a>
            </article>
          </div>
          <article className="prose" id="submit">
            <p className="eyebrow eyebrow-dark"><span /> Contribute data</p>
            <h2>Submit a microgrid</h2>
            <p>Send the essentials below. A primary source—an owner announcement, regulatory filing, technical paper, or project page—helps us verify the record.</p>
            <ol className="submission-list">
              <li><span><b>Identify the project.</b><br />Name, place, owner, developer, and operating status.</span></li>
              <li><span><b>Describe the system.</b><br />Generation, storage, controls, critical loads, and total capacity.</span></li>
              <li><span><b>Share the evidence.</b><br />Primary-source links, commissioning date, and a contact who can confirm details.</span></li>
            </ol>
            <a className="button button-ink" href={submitHref}>Start a project submission <span aria-hidden="true">↗</span></a>
          </article>
        </div>
      </section>
    </main>
  );
}
