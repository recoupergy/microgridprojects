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
  async headers() { return [{ source: "/:path*", headers: securityHeaders }]; },
  async redirects() {
    return [
      { source: "/property/:slug", destination: "/projects/:slug", permanent: true },
      { source: "/list-of-microgrid-projects", destination: "/projects", permanent: true },
      { source: "/microgrid-projects-2", destination: "/projects", permanent: true },
      { source: "/microgrid-markets", destination: "/markets", permanent: true },
      { source: "/types-of-microgrids", destination: "/guides/types-of-microgrids", permanent: true },
      { source: "/contact-2", destination: "/contact", permanent: true },
      { source: "/africa-microgrids", destination: "/projects?region=Africa%20%26%20Middle%20East", permanent: true },
      { source: "/india-microgrids", destination: "/projects?region=Asia", permanent: true },
      { source: "/california-microgrid-projects", destination: "/projects?region=North%20America", permanent: true },
      { source: "/military-microgrid-army-navy-air-force-microgrids-drivers", destination: "/projects?sector=Defense", permanent: true },
      { source: "/submit-a-microgrid", destination: "/contact#submit", permanent: true },
      { source: "/submit", destination: "/contact#submit", permanent: true },
    ];
  },
};

export default nextConfig;
