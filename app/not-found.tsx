import Link from "next/link";

export default function NotFound() { return <main id="main-content" className="not-found"><div className="container"><p className="eyebrow eyebrow-dark"><span /> 404 / Off grid</p><h1>Signal lost.</h1><p>That page is not in the directory.</p><Link className="button button-ink" href="/projects">Explore microgrid projects</Link></div></main>; }
