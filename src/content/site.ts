/**
 * The one place to change what the site says about the product at large: name, taglines, calls to action,
 * navigation, the verified release facts and the film's files. Page copy lives next to this file
 * (home.ts, features.ts, faq.ts, legal.ts, changelog.ts).
 *
 * The site's address is recorded below and the published download in release.ts. Values for one deployment
 * (an early-access endpoint, another address or another download) come from environment variables; see
 * .env.example. Everything else is checked against the Briefnest repository.
 */
import { isIndexable, resolveAvailability, resolveOrigin, httpsUrl, withPublishedRelease } from "@/lib/release";
import { publishedRelease } from "./release";

/**
 * The address the site is served at. Knowing it turns on canonical links, the sitemap, absolute social-preview
 * addresses and indexing by search engines. NEXT_PUBLIC_SITE_URL, when set, takes its place, for a copy of the
 * site that is served somewhere else.
 */
const address = "https://ability.ninja";

/** Next.js inlines NEXT_PUBLIC_* values only when they are read by name. */
const env = withPublishedRelease({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL?.trim() || address,
  NEXT_PUBLIC_DOWNLOAD_URL: process.env.NEXT_PUBLIC_DOWNLOAD_URL,
  NEXT_PUBLIC_DOWNLOAD_EXPIRES: process.env.NEXT_PUBLIC_DOWNLOAD_EXPIRES,
  NEXT_PUBLIC_DOWNLOAD_CHANNEL: process.env.NEXT_PUBLIC_DOWNLOAD_CHANNEL,
  NEXT_PUBLIC_DOWNLOAD_SHA256: process.env.NEXT_PUBLIC_DOWNLOAD_SHA256,
  NEXT_PUBLIC_DOWNLOAD_SIZE_BYTES: process.env.NEXT_PUBLIC_DOWNLOAD_SIZE_BYTES,
  NEXT_PUBLIC_DOWNLOAD_RELEASED: process.env.NEXT_PUBLIC_DOWNLOAD_RELEASED,
  NEXT_PUBLIC_RELEASE_VERSION: process.env.NEXT_PUBLIC_RELEASE_VERSION,
  NEXT_PUBLIC_WAITLIST_ENDPOINT: process.env.NEXT_PUBLIC_WAITLIST_ENDPOINT,
  NEXT_PUBLIC_CONTACT_EMAIL: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
  NEXT_PUBLIC_REPOSITORY_URL: process.env.NEXT_PUBLIC_REPOSITORY_URL,
  VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL,
  VERCEL_ENV: process.env.VERCEL_ENV,
}, publishedRelease);

export const brand = {
  name: "Briefnest",
  tagline: "Where conversations connect to the work.",
  supporting: "From conversations to progress.",
  /** One sentence for search results and link previews. */
  description:
    "Briefnest is a native macOS workspace that turns meetings into notes, decisions and action items, and keeps them connected to your code and project history.",
  /** The longer value proposition. */
  proposition:
    "Briefnest transforms meetings, decisions, notes and code context into connected project knowledge, so a team can see what happened, what matters and what needs to happen next.",
} as const;

/** Facts taken from the app itself (Config/Info.plist, docs/RELEASING.md). */
export const product = {
  /** CFBundleShortVersionString. Override per release with NEXT_PUBLIC_RELEASE_VERSION. */
  version: env.NEXT_PUBLIC_RELEASE_VERSION?.trim() || "0.1.0",
  /** LSMinimumSystemVersion 15.0 */
  minimumOSLong: "macOS 15 or later",
  /** LSArchitecturePriority arm64 */
  chip: "Apple Silicon",
  /** Needed for AI features; not bundled. */
  aiPrerequisites: "Node.js 22 or later and a signed-in agent such as Claude Code or Codex",
} as const;

export const deployment = {
  origin: resolveOrigin(env),
  indexable: isIndexable(env),
  availability: resolveAvailability(env, product.version),
  /** Shown as a source link only when set; the repository is private today. */
  repositoryUrl: httpsUrl(env, "NEXT_PUBLIC_REPOSITORY_URL"),
} as const;

/**
 * Pricing and sales. No price, plan or trial has been decided, so the site says exactly that and takes no
 * payments. When that changes, describe it here and render it on the download page (see README, "Selling Briefnest").
 */
export const commerce = {
  status: "not-announced",
  statement: "Pricing hasn’t been announced. Briefnest isn’t on sale yet, and this site takes no payments.",
} as const;

export const cta = {
  primary: { label: "Get Briefnest", href: "/download" },
  film: { hero: "Watch the Film", nav: "Watch Demo", closing: "Watch Demo" },
} as const;

export interface NavItem {
  label: string;
  href: string;
}

export const nav: readonly NavItem[] = [
  { label: "Product", href: "/#product" },
  { label: "Features", href: "/features" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Download", href: "/download" },
  { label: "FAQ", href: "/#faq" },
];

export const footerNav: readonly { title: string; links: readonly NavItem[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Overview", href: "/#product" },
      { label: "Features", href: "/features" },
      { label: "How it works", href: "/#how-it-works" },
      { label: "Product tour", href: "/#tour" },
    ],
  },
  {
    title: "Get started",
    links: [
      { label: "Download", href: "/download" },
      { label: "Changelog", href: "/changelog" },
      { label: "FAQ", href: "/#faq" },
    ],
  },
  {
    title: "Trust",
    links: [
      { label: "Privacy and control", href: "/#privacy" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

/**
 * The approved launch film. The masters stay in marketing/briefnest-product-video/dist; these are the web
 * derivatives that scripts/prepare-media.sh writes to public/videos. To serve them from a CDN, change the paths.
 */
export const film = {
  title: "Briefnest: from conversation to execution",
  description:
    "The Briefnest launch film. One payment decision travels from a meeting to approved notes, an owned action, a merged pull request and a source-backed answer.",
  durationSeconds: 60,
  /** Production date of the approved master. */
  producedOn: "2026-11-20",
  posterImage: "film-poster",
  posterFile: "/videos/briefnest-film-poster.jpg",
  /** Tried in order; the browser plays the first it supports. */
  sources: [
    { src: "/videos/briefnest-film-720p.mp4", type: "video/mp4", media: "(max-width: 767px)" },
    { src: "/videos/briefnest-film-1080p.av1.mp4", type: 'video/mp4; codecs="av01.0.08M.08, mp4a.40.2"' },
    { src: "/videos/briefnest-film-1080p.mp4", type: "video/mp4" },
  ],
  /** Silent copy for the hero's muted preview. */
  preview: [
    { src: "/videos/briefnest-preview-720p.av1.mp4", type: 'video/mp4; codecs="av01.0.05M.08"' },
    { src: "/videos/briefnest-preview-720p.mp4", type: "video/mp4" },
  ],
  captions: [{ src: "/videos/briefnest-film.en.vtt", srcLang: "en", label: "English" }],
} as const;

/** The one fictional example the whole site follows, the same one the film uses. */
export const example = {
  note: "Inknest, its people, meetings, repository and numbers are fictional. Screenshots are the real app showing that sample data.",
} as const;
