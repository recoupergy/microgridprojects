import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { siteContact } from "./data/site";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://microgridprojects.com"),
  title: { default: "Microgrid Projects | Global Project Directory", template: "%s | Microgrid Projects" },
  description: "Explore 197 microgrid projects around the world. Compare locations, sectors, reported capacity, market drivers, and major microgrid types.",
  applicationName: "Microgrid Projects",
  keywords: ["microgrid projects", "microgrid map", "microgrid directory", "distributed energy", "energy resilience", "island microgrids", "community microgrids"],
  authors: [{ name: siteContact.organization, url: siteContact.website }],
  creator: siteContact.organization,
  publisher: siteContact.organization,
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://microgridprojects.com",
    siteName: "Microgrid Projects",
    title: "The world’s microgrids, mapped.",
    description: "A global research directory of 197 microgrid projects, market signals, and practical guides.",
    images: [{ url: "/og.png", width: 1536, height: 1024, alt: "Microgrid Projects global research directory" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "The world’s microgrids, mapped.",
    description: "Explore a global research directory of microgrid projects and markets.",
    images: ["/og.png"],
  },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#071b1d", colorScheme: "light" };

function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="brand" href="/" aria-label="Microgrid Projects home">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
          <span>Microgrid<br /><b>Projects</b></span>
        </Link>
        <nav className="desktop-nav" aria-label="Primary navigation">
          <Link href="/projects">Directory</Link>
          <Link href="/markets">Markets</Link>
          <Link href="/guides/types-of-microgrids">Guides</Link>
          <Link href="/about">About</Link>
        </nav>
        <Link className="header-cta" href="/contact#submit">Submit a project <span aria-hidden="true">↗</span></Link>
        <details className="mobile-nav">
          <summary aria-label="Open navigation"><span /><span /></summary>
          <nav aria-label="Mobile navigation">
            <Link href="/projects">Directory</Link><Link href="/markets">Markets</Link><Link href="/guides/types-of-microgrids">Guides</Link><Link href="/about">About</Link><Link href="/contact#submit">Submit a project</Link>
          </nav>
        </details>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Link className="brand brand-footer" href="/"><span className="brand-mark" aria-hidden="true"><i /><i /><i /></span><span>Microgrid<br /><b>Projects</b></span></Link>
          <p>A global field guide to resilient, local energy systems.</p>
        </div>
        <div><h2>Explore</h2><Link href="/projects">Project directory</Link><Link href="/markets">Market profiles</Link><Link href="/guides/types-of-microgrids">Types of microgrids</Link></div>
        <div><h2>Research</h2><Link href="/about">About the archive</Link><Link href="/about#methodology">Methodology</Link><Link href="/contact#submit">Submit or correct a record</Link></div>
        <div><h2>Contact</h2><a href={`mailto:${siteContact.email}`}>{siteContact.email}</a><a href={siteContact.website}>MicrogridModeler</a></div>
      </div>
      <div className="container footer-bottom"><span>© 2026 Microgrid Projects · Maintained by {siteContact.organization}</span><span>Historical records are provided for research and require independent verification.</span></div>
    </footer>
  );
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${geist.variable} ${geistMono.variable}`}><body><a className="skip-link" href="#main-content">Skip to content</a><SiteHeader />{children}<SiteFooter /></body></html>;
}
