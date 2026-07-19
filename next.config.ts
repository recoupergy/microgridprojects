import type { NextConfig } from "next";

type PermanentRedirect = {
  source: string;
  destination: string;
  permanent: true;
};

// These records existed in the historical WordPress archive but were not part
// of the 197-item geocoded export used to build the modern directory. Keep the
// old URLs out of the generic project redirect so they never land on a 404.
const legacyProjectAliases = [
  ["boa-vista-island", "/projects?region=africa-middle-east"],
  ["mersing-island", "/projects?region=Asia"],
  ["new-york-microgrid-prizes", "/projects?q=new-york"],
  ["philadephia-navy-yard", "/projects/philadelphia-navy-yard-microgrid"],
  ["russia-far-east-microgrid-portfolio", "/projects?q=Russia"],
  ["toyko-island", "/projects/tokyo-metropolitan-microgrid-high-reliability"],
] as const;

const legacyProjectAliasRedirects: PermanentRedirect[] = legacyProjectAliases.flatMap(
  ([slug, destination]) => [
    { source: `/microgrid/${slug}`, destination, permanent: true },
    // Preserve old comment feeds, embeds, and other WordPress descendants.
    { source: `/microgrid/${slug}/:path*`, destination, permanent: true },
  ],
);

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Content-Security-Policy", value: "default-src 'self'; base-uri 'self'; form-action 'self' mailto:; frame-ancestors 'none'; img-src 'self' data:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self'; connect-src 'self'" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Let legacy routes with a trailing slash hit their semantic redirect
  // directly, avoiding a slash-normalization hop before the real migration.
  skipTrailingSlashRedirect: true,
  async headers() { return [{ source: "/:path*", headers: securityHeaders }]; },
  async redirects() {
    return [
      // Resolve known archive-only aliases before the generic namespace rules.
      ...legacyProjectAliasRedirects,
      // Search engines and academic publications still surface both legacy
      // project namespaces. WordPress also emitted duplicate embed paths.
      { source: "/microgrid/:slug", destination: "/projects/:slug", permanent: true },
      { source: "/microgrid/:slug/:path*", destination: "/projects/:slug", permanent: true },
      { source: "/property/:slug", destination: "/projects/:slug", permanent: true },
      { source: "/property/:slug/:path*", destination: "/projects/:slug", permanent: true },
      // Retire WordPress pagination and account-only archive screens in favor
      // of the public, searchable directory.
      { source: "/page/:page", destination: "/projects", permanent: true },
      { source: "/search-results", destination: "/projects", permanent: true },
      { source: "/search-results/:path*", destination: "/projects", permanent: true },
      { source: "/login", destination: "/projects", permanent: true },
      { source: "/user-profile", destination: "/projects", permanent: true },
      { source: "/favorite-microgrids", destination: "/projects", permanent: true },
      { source: "/wp-login.php", destination: "/projects", permanent: true },
      { source: "/wp-admin/:path*", destination: "/projects", permanent: true },
      // Legacy submission flows now route to the maintained contact workflow.
      { source: "/submit-listings", destination: "/contact#submit", permanent: true },
      { source: "/submit-a-microgrid", destination: "/contact#submit", permanent: true },
      { source: "/submit", destination: "/contact#submit", permanent: true },
      { source: "/list-of-microgrid-projects", destination: "/projects", permanent: true },
      { source: "/list-of-microgrids", destination: "/projects", permanent: true },
      { source: "/microgrid-projects", destination: "/projects", permanent: true },
      { source: "/microgrid-projects-2", destination: "/projects", permanent: true },
      { source: "/microgrid-markets", destination: "/markets", permanent: true },
      { source: "/microgrid-companies", destination: "/contact", permanent: true },
      { source: "/types-of-microgrids", destination: "/guides/types-of-microgrids", permanent: true },
      { source: "/microgrid-comparison", destination: "/guides/types-of-microgrids#comparison", permanent: true },
      { source: "/dc-microgrids", destination: "/guides/types-of-microgrids#dc", permanent: true },
      { source: "/contact-2", destination: "/contact", permanent: true },
      { source: "/ucsd-updates-microgrid-management-and-control-system-developed-by-schweitzer-engineering-laboratories-sel", destination: "/projects/ucsd-microgrid-2#equipment", permanent: true },
      // Editorial and taxonomy URLs land on the closest maintained answer,
      // with an immediately adjacent link to matching directory records.
      { source: "/africa-microgrids", destination: "/projects?region=africa-middle-east", permanent: true },
      { source: "/india-microgrids", destination: "/projects?region=Asia", permanent: true },
      // This misspelling appears verbatim in an externally published citation.
      { source: "/india-rnicrogrids", destination: "/projects?region=Asia", permanent: true },
      { source: "/california-microgrid-projects", destination: "/projects?q=California", permanent: true },
      { source: "/military-microgrid-army-navy-air-force-microgrids-drivers", destination: "/guides/types-of-microgrids#military", permanent: true },
      { source: "/property-type/university", destination: "/guides/types-of-microgrids#campus", permanent: true },
      { source: "/property-type/island-microgrid", destination: "/guides/types-of-microgrids#island", permanent: true },
      { source: "/property-location/denmark", destination: "/projects?region=Europe", permanent: true },
      { source: "/property-location/india", destination: "/projects?region=Asia", permanent: true },
      { source: "/property-location/karnataka", destination: "/projects?region=Asia", permanent: true },
      { source: "/property-location/japan", destination: "/projects?region=Asia", permanent: true },
      { source: "/property-location/united-states", destination: "/projects?region=north-america", permanent: true },
      // One peer-reviewed paper dropped the hyphen from property-location.
      { source: "/propertylocation/united-states", destination: "/projects?region=north-america", permanent: true },
      { source: "/propertylocation/:location/page/:page", destination: "/projects", permanent: true },
      { source: "/propertylocation/:location", destination: "/projects", permanent: true },
      // WordPress also indexed paginated taxonomy archives. Match those before
      // the one-segment fallbacks so every historical result reaches a useful
      // maintained directory or guide.
      { source: "/property-location/:location/page/:page", destination: "/projects", permanent: true },
      { source: "/property-type/:type/page/:page", destination: "/guides/types-of-microgrids", permanent: true },
      { source: "/property-status/:status/page/:page", destination: "/projects", permanent: true },
      { source: "/property-features/:feature/page/:page", destination: "/projects", permanent: true },
      // Catch remaining legacy taxonomy archives without creating soft 404s.
      { source: "/property-location/:location", destination: "/projects", permanent: true },
      { source: "/property-type/:type", destination: "/guides/types-of-microgrids", permanent: true },
      { source: "/property-status/:status", destination: "/projects", permanent: true },
      { source: "/property-features/:feature", destination: "/projects", permanent: true },
      // A short-lived hosting suspension page was indexed by the archive. The
      // maintained home page is the only meaningful replacement.
      { source: "/cgi-sys/suspendedpage.cgi", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
