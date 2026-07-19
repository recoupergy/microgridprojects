import type { NextConfig } from "next";

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
      // Google still surfaces both legacy project namespaces.
      { source: "/microgrid/:slug", destination: "/projects/:slug", permanent: true },
      { source: "/property/:slug", destination: "/projects/:slug", permanent: true },
      // Retire WordPress pagination and account-only archive screens in favor
      // of the public, searchable directory.
      { source: "/page/:page", destination: "/projects", permanent: true },
      { source: "/login", destination: "/projects", permanent: true },
      { source: "/user-profile", destination: "/projects", permanent: true },
      { source: "/favorite-microgrids", destination: "/projects", permanent: true },
      // Legacy submission flows now route to the maintained contact workflow.
      { source: "/submit-listings", destination: "/contact#submit", permanent: true },
      { source: "/submit-a-microgrid", destination: "/contact#submit", permanent: true },
      { source: "/submit", destination: "/contact#submit", permanent: true },
      { source: "/list-of-microgrid-projects", destination: "/projects", permanent: true },
      { source: "/list-of-microgrids", destination: "/projects", permanent: true },
      { source: "/microgrid-projects", destination: "/projects", permanent: true },
      { source: "/microgrid-projects-2", destination: "/projects", permanent: true },
      { source: "/microgrid-markets", destination: "/markets", permanent: true },
      { source: "/types-of-microgrids", destination: "/guides/types-of-microgrids", permanent: true },
      { source: "/microgrid-comparison", destination: "/guides/types-of-microgrids#comparison", permanent: true },
      { source: "/dc-microgrids", destination: "/guides/types-of-microgrids#dc", permanent: true },
      { source: "/contact-2", destination: "/contact", permanent: true },
      // Editorial and taxonomy URLs land on the closest maintained answer,
      // with an immediately adjacent link to matching directory records.
      { source: "/africa-microgrids", destination: "/markets#africa", permanent: true },
      { source: "/india-microgrids", destination: "/markets#asia", permanent: true },
      { source: "/california-microgrid-projects", destination: "/markets#north-america", permanent: true },
      { source: "/military-microgrid-army-navy-air-force-microgrids-drivers", destination: "/guides/types-of-microgrids#military", permanent: true },
      { source: "/property-type/university", destination: "/guides/types-of-microgrids#campus", permanent: true },
      { source: "/property-type/island-microgrid", destination: "/guides/types-of-microgrids#island", permanent: true },
      { source: "/property-location/denmark", destination: "/markets#europe", permanent: true },
      { source: "/property-location/india", destination: "/markets#asia", permanent: true },
      { source: "/property-location/karnataka", destination: "/markets#asia", permanent: true },
      { source: "/property-location/japan", destination: "/markets#asia", permanent: true },
      { source: "/property-location/united-states", destination: "/markets#north-america", permanent: true },
      // Catch remaining legacy taxonomy archives without creating soft 404s.
      { source: "/property-location/:location", destination: "/projects", permanent: true },
      { source: "/property-type/:type", destination: "/guides/types-of-microgrids", permanent: true },
    ];
  },
};

export default nextConfig;
