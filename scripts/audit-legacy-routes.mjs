import config from "../next.config.ts";
import { projects } from "../app/data/projects.ts";

const ARCHIVE_INDEX =
  "https://web.archive.org/cdx/search/cdx?url=microgridprojects.com/*&output=json&filter=statuscode:200&filter=mimetype:text/html&fl=original&collapse=urlkey";

// These citation URLs were found on third-party academic and technical pages,
// but do not appear in the Wayback URL inventory because the publishers used
// misspelled or noncanonical WordPress paths.
const externallyReferencedPaths = [
  "/india-rnicrogrids",
  "/propertylocation/united-states",
];

function normalizedPath(value) {
  const path = new URL(value, "https://microgridprojects.com").pathname;
  return path.replace(/\/+$/, "") || "/";
}

function matchSource(source, pathname) {
  const sourceParts = source.split("/").filter(Boolean);
  const pathParts = pathname.split("/").filter(Boolean);
  const params = {};

  for (let index = 0; index < sourceParts.length; index += 1) {
    const sourcePart = sourceParts[index];
    const pathPart = pathParts[index];

    if (sourcePart.startsWith(":")) {
      const wildcard = sourcePart.endsWith("*");
      const name = sourcePart.slice(1, wildcard ? -1 : undefined);
      if (wildcard) {
        params[name] = pathParts.slice(index).join("/");
        return { params, matched: true };
      }
      if (!pathPart) return { params: {}, matched: false };
      params[name] = pathPart;
      continue;
    }

    if (sourcePart !== pathPart) return { params: {}, matched: false };
  }

  return { params, matched: sourceParts.length === pathParts.length };
}

function resolveRedirect(pathname, redirects) {
  for (const redirect of redirects) {
    const match = matchSource(redirect.source, pathname);
    if (!match.matched) continue;
    let destination = redirect.destination;
    for (const [name, value] of Object.entries(match.params)) {
      destination = destination.replaceAll(`:${name}`, value);
    }
    return { ...redirect, destination };
  }
  return null;
}

const projectSlugs = new Set(projects.map((project) => project.slug));

function hasMaintainedContent(destination) {
  const url = new URL(destination, "https://microgridprojects.com");
  const path = normalizedPath(url.pathname);
  if (["/", "/about", "/contact", "/guides/types-of-microgrids", "/markets", "/projects"].includes(path)) {
    return true;
  }
  if (path.startsWith("/projects/")) {
    return projectSlugs.has(path.split("/")[2]);
  }
  return false;
}

function isModernPath(pathname) {
  if (["/", "/about", "/contact", "/guides/types-of-microgrids", "/markets", "/projects"].includes(pathname)) {
    return true;
  }
  return pathname.startsWith("/projects/") && projectSlugs.has(pathname.split("/")[2]);
}

const response = await fetch(ARCHIVE_INDEX, {
  headers: { "user-agent": "MicrogridProjects legacy route audit/1.0" },
});
if (!response.ok) throw new Error(`Wayback CDX request failed with ${response.status}`);

const rows = await response.json();
const archivedPaths = [
  ...new Set(rows.slice(1).map(([original]) => normalizedPath(original))),
].sort();
const auditedPaths = [...new Set([...archivedPaths, ...externallyReferencedPaths])].sort();
const redirects = await config.redirects();
const uncovered = [];
const brokenDestinations = [];

for (const pathname of auditedPaths) {
  if (isModernPath(pathname)) continue;
  const redirect = resolveRedirect(pathname, redirects);
  if (!redirect) {
    uncovered.push(pathname);
    continue;
  }
  if (!redirect.permanent || !hasMaintainedContent(redirect.destination)) {
    brokenDestinations.push(`${pathname} -> ${redirect.destination}`);
  }
}

if (uncovered.length || brokenDestinations.length) {
  if (uncovered.length) console.error(`Uncovered legacy paths:\n${uncovered.join("\n")}`);
  if (brokenDestinations.length) console.error(`Invalid legacy destinations:\n${brokenDestinations.join("\n")}`);
  process.exitCode = 1;
} else {
  console.log(
    `Legacy route audit passed: ${archivedPaths.length} archived HTML paths and ${externallyReferencedPaths.length} externally cited variants resolve to maintained content.`,
  );
}

const runtimeBaseUrl = process.env.LEGACY_AUDIT_BASE_URL?.replace(/\/$/, "");

if (runtimeBaseUrl && !process.exitCode) {
  const runtimeFailures = [];
  let cursor = 0;

  async function worker() {
    while (cursor < auditedPaths.length) {
      const pathname = auditedPaths[cursor];
      cursor += 1;
      const response = await fetch(`${runtimeBaseUrl}${pathname}`, { redirect: "manual" });

      if (isModernPath(pathname)) {
        if (response.status !== 200) runtimeFailures.push(`${pathname} returned ${response.status}, expected 200`);
        continue;
      }

      const redirect = resolveRedirect(pathname, redirects);
      if (response.status !== 308) {
        runtimeFailures.push(`${pathname} returned ${response.status}, expected permanent redirect`);
        continue;
      }

      const location = response.headers.get("location");
      if (!location) {
        runtimeFailures.push(`${pathname} did not return a Location header`);
        continue;
      }

      const actual = new URL(location, runtimeBaseUrl);
      const expected = new URL(redirect.destination, runtimeBaseUrl);
      if (`${actual.pathname}${actual.search}${actual.hash}` !== `${expected.pathname}${expected.search}${expected.hash}`) {
        runtimeFailures.push(`${pathname} redirected to ${location}, expected ${redirect.destination}`);
        continue;
      }

      actual.hash = "";
      const destinationResponse = await fetch(actual, { redirect: "manual" });
      if (destinationResponse.status !== 200) {
        runtimeFailures.push(`${pathname} -> ${location} returned ${destinationResponse.status}`);
      }
    }
  }

  await Promise.all(Array.from({ length: 12 }, worker));

  if (runtimeFailures.length) {
    console.error(`Legacy runtime audit failed:\n${runtimeFailures.join("\n")}`);
    process.exitCode = 1;
  } else {
    console.log(`Legacy runtime audit passed: all ${auditedPaths.length} historical paths resolve in one hop to a 200 response.`);
  }
}
