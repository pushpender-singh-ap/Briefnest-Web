/**
 * Works out, from configuration alone, what the site may truthfully offer: a download, an early-access form,
 * an email address, or nothing yet.
 *
 * Nothing here is assumed. A download exists only when a URL is configured, and a configured download must say
 * when it expires (or that it never does), because Briefnest can be shipped as a time-limited build
 * (docs/RELEASING.md) and the site must not hide that.
 */

export type ReleaseChannel = "release" | "beta" | "time-limited";

export interface DownloadableRelease {
  version: string;
  channel: ReleaseChannel;
  url: string;
  /** File name shown beside the button, taken from the URL. */
  fileName: string;
  sha256?: string;
  sizeBytes?: number;
  /** YYYY-MM-DD */
  releasedOn?: string;
  /** ISO 8601 instant after which the build stops working. Absent means it never expires. */
  expiresAt?: string;
}

export type Availability =
  | { kind: "download"; release: DownloadableRelease }
  /** A build was configured but its lifetime has ended; it is described, never offered. */
  | { kind: "expired"; release: DownloadableRelease; fallback: Exclude<Availability, { kind: "download" | "expired" }> }
  | { kind: "waitlist"; endpoint: string }
  | { kind: "contact"; email: string }
  | { kind: "unavailable" };

export type Env = Record<string, string | undefined>;

/** A published build as it is recorded in src/content/release.ts. */
export interface PublishedRelease {
  /** Where the disk image is published. */
  url: string;
  /** The instant the build stops working (ISO 8601), a bare date for the end of that day, or "never". */
  expires: string;
  /** Defaults to time-limited when the build expires, else release. */
  channel?: ReleaseChannel;
  sha256?: string;
  sizeBytes?: number;
  /** YYYY-MM-DD */
  released?: string;
}

export class ConfigError extends Error {
  constructor(variable: string, problem: string) {
    super(`${variable} ${problem}`);
    this.name = "ConfigError";
  }
}

const read = (env: Env, key: string): string | undefined => {
  const value = env[key]?.trim();
  return value ? value : undefined;
};

export function httpsUrl(env: Env, key: string): string | undefined {
  const value = read(env, key);
  if (!value) return undefined;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new ConfigError(key, `is not a URL: "${value}"`);
  }
  if (url.protocol !== "https:") throw new ConfigError(key, `must start with https:// (got "${value}")`);
  return url.toString();
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isEmail(value: string): boolean {
  return value.length <= 254 && EMAIL.test(value);
}

function email(env: Env, key: string): string | undefined {
  const value = read(env, key);
  if (!value) return undefined;
  if (!isEmail(value)) throw new ConfigError(key, `is not an email address: "${value}"`);
  return value;
}

function expiry(env: Env): string | undefined {
  const key = "NEXT_PUBLIC_DOWNLOAD_EXPIRES";
  const value = read(env, key);
  if (!value) {
    throw new ConfigError(
      key,
      'is required with NEXT_PUBLIC_DOWNLOAD_URL. Set the date the build stops working (for example 2027-01-19T15:33:50Z), or "never" for a build that does not expire.',
    );
  }
  if (value.toLowerCase() === "never") return undefined;
  // A bare date means the end of that day, UTC.
  const instant = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T23:59:59Z`) : new Date(value);
  if (Number.isNaN(instant.getTime())) throw new ConfigError(key, `is not a date: "${value}"`);
  return instant.toISOString();
}

function channel(env: Env, expiresAt: string | undefined): ReleaseChannel {
  const key = "NEXT_PUBLIC_DOWNLOAD_CHANNEL";
  const value = read(env, key)?.toLowerCase();
  if (!value) return expiresAt ? "time-limited" : "release";
  if (value !== "release" && value !== "beta" && value !== "time-limited") {
    throw new ConfigError(key, `must be release, beta or time-limited (got "${value}")`);
  }
  if (value === "release" && expiresAt) {
    throw new ConfigError(key, "is release, but the build expires. Call it beta or time-limited.");
  }
  if (value === "time-limited" && !expiresAt) {
    throw new ConfigError(key, "is time-limited, but NEXT_PUBLIC_DOWNLOAD_EXPIRES is never.");
  }
  return value;
}

function download(env: Env, version: string): DownloadableRelease | undefined {
  const url = httpsUrl(env, "NEXT_PUBLIC_DOWNLOAD_URL");
  if (!url) return undefined;

  const expiresAt = expiry(env);
  const sha = read(env, "NEXT_PUBLIC_DOWNLOAD_SHA256")?.toLowerCase();
  if (sha && !/^[0-9a-f]{64}$/.test(sha)) {
    throw new ConfigError("NEXT_PUBLIC_DOWNLOAD_SHA256", "must be 64 hexadecimal characters");
  }
  const size = read(env, "NEXT_PUBLIC_DOWNLOAD_SIZE_BYTES");
  if (size && !/^[1-9]\d*$/.test(size)) {
    throw new ConfigError("NEXT_PUBLIC_DOWNLOAD_SIZE_BYTES", `must be a whole number of bytes (got "${size}")`);
  }
  const releasedOn = read(env, "NEXT_PUBLIC_DOWNLOAD_RELEASED");
  if (releasedOn && (!/^\d{4}-\d{2}-\d{2}$/.test(releasedOn) || Number.isNaN(Date.parse(releasedOn)))) {
    throw new ConfigError("NEXT_PUBLIC_DOWNLOAD_RELEASED", `must be a date like 2026-11-20 (got "${releasedOn}")`);
  }

  return {
    version,
    channel: channel(env, expiresAt),
    url,
    fileName: decodeURIComponent(new URL(url).pathname.split("/").filter(Boolean).pop() ?? "Briefnest.dmg"),
    sha256: sha,
    sizeBytes: size ? Number(size) : undefined,
    releasedOn,
    expiresAt,
  };
}

/**
 * The configuration to build with: the environment, with the published release standing in when the environment
 * names no download. A download named by the environment replaces the published one entirely, so a link is never
 * shown beside another build's deadline or checksum.
 */
export function withPublishedRelease(env: Env, release: PublishedRelease | null): Env {
  if (!release || read(env, "NEXT_PUBLIC_DOWNLOAD_URL")) return env;
  return {
    ...env,
    NEXT_PUBLIC_DOWNLOAD_URL: release.url,
    NEXT_PUBLIC_DOWNLOAD_EXPIRES: release.expires,
    NEXT_PUBLIC_DOWNLOAD_CHANNEL: release.channel,
    NEXT_PUBLIC_DOWNLOAD_SHA256: release.sha256,
    NEXT_PUBLIC_DOWNLOAD_SIZE_BYTES: release.sizeBytes === undefined ? undefined : String(release.sizeBytes),
    NEXT_PUBLIC_DOWNLOAD_RELEASED: release.released,
  };
}

/** True once a time-limited build has reached its deadline. */
export function isExpired(release: Pick<DownloadableRelease, "expiresAt">, now: Date): boolean {
  return release.expiresAt !== undefined && now.getTime() >= Date.parse(release.expiresAt);
}

/** Whole days until the build stops working; 0 on its last day, undefined if it never expires. */
export function daysLeft(release: Pick<DownloadableRelease, "expiresAt">, now: Date): number | undefined {
  if (!release.expiresAt) return undefined;
  return Math.max(0, Math.floor((Date.parse(release.expiresAt) - now.getTime()) / 86_400_000));
}

export function resolveAvailability(env: Env, version: string, now: Date = new Date()): Availability {
  const waitlist = httpsUrl(env, "NEXT_PUBLIC_WAITLIST_ENDPOINT");
  const contact = email(env, "NEXT_PUBLIC_CONTACT_EMAIL");
  const fallback: Exclude<Availability, { kind: "download" | "expired" }> = waitlist
    ? { kind: "waitlist", endpoint: waitlist }
    : contact
      ? { kind: "contact", email: contact }
      : { kind: "unavailable" };

  const release = download(env, version);
  if (!release) return fallback;
  return isExpired(release, now) ? { kind: "expired", release, fallback } : { kind: "download", release };
}

/** The site's own origin, used for canonical URLs, the sitemap and social previews. Never guessed. */
export function resolveOrigin(env: Env): string | undefined {
  const configured = httpsUrl(env, "NEXT_PUBLIC_SITE_URL");
  if (configured) return new URL(configured).origin;
  // On Vercel the production domain is known at build time.
  const vercel = read(env, "VERCEL_PROJECT_PRODUCTION_URL");
  return vercel ? `https://${vercel.replace(/^https?:\/\//, "").replace(/\/.*$/, "")}` : undefined;
}

/** Preview deployments and builds without a known origin stay out of search results. */
export function isIndexable(env: Env): boolean {
  if (!resolveOrigin(env)) return false;
  const stage = read(env, "VERCEL_ENV");
  return stage === undefined || stage === "production";
}
