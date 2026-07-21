import type { Metadata } from "next";

export const SITE_NAME = "Microgrid Projects";
export const SITE_URL = "https://microgridprojects.com";

export const socialImage = {
  url: "/og-v2.jpg",
  width: 1734,
  height: 907,
  type: "image/jpeg",
  alt: "Microgrid Projects global research directory",
} as const;

function trimAtWord(value: string, maximumLength: number) {
  if (value.length <= maximumLength) return value;
  const slice = value.slice(0, maximumLength - 1);
  const lastSpace = slice.lastIndexOf(" ");
  return `${slice.slice(0, lastSpace > maximumLength * 0.65 ? lastSpace : undefined).trimEnd()}…`;
}

export function pageTitle(title: string) {
  const branded = `${title} | ${SITE_NAME}`;
  if (branded.length <= 60) return branded;
  return trimAtWord(title, 60);
}

export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const resolvedTitle = pageTitle(title);

  return {
    title: { absolute: resolvedTitle },
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: path,
      siteName: SITE_NAME,
      title: resolvedTitle,
      description,
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description,
      images: [socialImage.url],
    },
  };
}

export function projectDescription({
  name,
  region,
}: {
  name: string;
  region: string;
}) {
  const subject = trimAtWord(name, 40);
  return `${subject}: sources, organizations, specifications, equipment, status, citations, and map coordinates in ${region}.`;
}

export function breadcrumbJsonLd(items: readonly { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}
