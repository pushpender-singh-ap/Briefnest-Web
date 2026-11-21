import type { Metadata } from "next";
import type { Faq } from "@/content/faq";
import { brand, deployment, film, product } from "@/content/site";
import { isoDuration } from "@/lib/format";

interface PageMeta {
  /** Page title without the site name. Omit on the home page. */
  title?: string;
  description: string;
  /** Path from the site root, starting with "/". */
  path: string;
}

/**
 * Metadata for one page: a unique title and description, Open Graph and X cards, and a canonical URL once the
 * site's origin is configured (NEXT_PUBLIC_SITE_URL). Without an origin no canonical is emitted; none is guessed.
 */
export function pageMetadata({ title, description, path }: PageMeta): Metadata {
  const fullTitle = title ? `${title} · ${brand.name}` : defaultTitle;
  return {
    title: title ?? { absolute: defaultTitle },
    description,
    alternates: deployment.origin ? { canonical: path } : undefined,
    openGraph: {
      type: "website",
      siteName: brand.name,
      locale: "en_US",
      title: fullTitle,
      description,
      url: deployment.origin ? path : undefined,
    },
    twitter: { card: "summary_large_image", title: fullTitle, description },
  };
}

export const defaultTitle = `${brand.name}: meeting notes, decisions and project memory for Mac`;

/** Absolute URL for a path, or undefined when no origin is configured. */
export function absoluteUrl(path: string): string | undefined {
  return deployment.origin ? new URL(path, deployment.origin).toString() : undefined;
}

type JsonLd = Record<string, unknown>;

/** The app itself. No price, rating or review is stated because none exists. */
export function softwareApplicationLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: brand.name,
    description: brand.description,
    applicationCategory: "BusinessApplication",
    operatingSystem: product.minimumOSLong,
    softwareVersion: product.version,
    processorRequirements: product.chip,
    ...(deployment.origin ? { url: deployment.origin } : {}),
    ...(absoluteUrl("/opengraph-image.jpg") ? { image: absoluteUrl("/opengraph-image.jpg") } : {}),
  };
}

export function faqLd(faqs: Faq[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer.join(" ") },
    })),
  };
}

/** The film. Needs absolute URLs, so it is only emitted once an origin is configured. */
export function videoLd(): JsonLd | undefined {
  const contentUrl = absoluteUrl(film.sources[film.sources.length - 1].src);
  const thumbnailUrl = absoluteUrl(film.posterFile);
  if (!contentUrl || !thumbnailUrl) return undefined;
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: film.title,
    description: film.description,
    thumbnailUrl,
    contentUrl,
    uploadDate: film.producedOn,
    duration: isoDuration(film.durationSeconds),
    inLanguage: "en",
  };
}
