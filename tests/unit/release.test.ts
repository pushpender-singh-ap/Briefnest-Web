import { describe, expect, it } from "vitest";
import { ConfigError, daysLeft, isExpired, isIndexable, resolveAvailability, resolveOrigin } from "@/lib/release";

const NOW = new Date("2026-11-21T00:00:00Z");
const URL_ = "https://downloads.example.com/Briefnest-0.1.0-arm64.dmg";
const availability = (env: Record<string, string>) => resolveAvailability(env, "0.1.0", NOW);

describe("what the site may offer", () => {
  it("offers nothing when nothing is configured", () => {
    expect(availability({})).toEqual({ kind: "unavailable" });
  });

  it("treats blank values as unset", () => {
    expect(availability({ NEXT_PUBLIC_DOWNLOAD_URL: "  ", NEXT_PUBLIC_CONTACT_EMAIL: "" })).toEqual({ kind: "unavailable" });
  });

  it("offers an email address when one is configured", () => {
    expect(availability({ NEXT_PUBLIC_CONTACT_EMAIL: "hello@example.com" })).toEqual({ kind: "contact", email: "hello@example.com" });
  });

  it("prefers the early-access form over the email address", () => {
    expect(
      availability({ NEXT_PUBLIC_WAITLIST_ENDPOINT: "https://formspree.io/f/abc", NEXT_PUBLIC_CONTACT_EMAIL: "hello@example.com" }),
    ).toEqual({ kind: "waitlist", endpoint: "https://formspree.io/f/abc" });
  });

  it("refuses a download that doesn't say when it expires", () => {
    expect(() => availability({ NEXT_PUBLIC_DOWNLOAD_URL: URL_ })).toThrow(ConfigError);
    expect(() => availability({ NEXT_PUBLIC_DOWNLOAD_URL: URL_ })).toThrow(/NEXT_PUBLIC_DOWNLOAD_EXPIRES is required/);
  });

  it("describes a time-limited build with its deadline", () => {
    const result = availability({
      NEXT_PUBLIC_DOWNLOAD_URL: URL_,
      NEXT_PUBLIC_DOWNLOAD_EXPIRES: "2027-01-19T15:33:50Z",
      NEXT_PUBLIC_DOWNLOAD_SHA256: "6D7564AFE5C7A9C87A87F4537E31D4A7FA0CA18E698753D7219DB32452F051DD",
      NEXT_PUBLIC_DOWNLOAD_SIZE_BYTES: "61815916",
      NEXT_PUBLIC_DOWNLOAD_RELEASED: "2026-11-20",
    });
    expect(result).toEqual({
      kind: "download",
      release: {
        version: "0.1.0",
        channel: "time-limited",
        url: URL_,
        fileName: "Briefnest-0.1.0-arm64.dmg",
        sha256: "6d7564afe5c7a9c87a87f4537e31d4a7fa0ca18e698753d7219db32452f051dd",
        sizeBytes: 61815916,
        releasedOn: "2026-11-20",
        expiresAt: "2027-01-19T15:33:50.000Z",
      },
    });
  });

  it("reads a bare date as the end of that day", () => {
    const result = availability({ NEXT_PUBLIC_DOWNLOAD_URL: URL_, NEXT_PUBLIC_DOWNLOAD_EXPIRES: "2027-01-31" });
    expect(result.kind === "download" && result.release.expiresAt).toBe("2027-01-31T23:59:59.000Z");
  });

  it("calls a build that never expires a release", () => {
    const result = availability({ NEXT_PUBLIC_DOWNLOAD_URL: URL_, NEXT_PUBLIC_DOWNLOAD_EXPIRES: "never" });
    expect(result.kind === "download" && result.release.channel).toBe("release");
    expect(result.kind === "download" && result.release.expiresAt).toBeUndefined();
  });

  it("withdraws a build whose deadline has passed and falls back to early access", () => {
    const result = availability({
      NEXT_PUBLIC_DOWNLOAD_URL: URL_,
      NEXT_PUBLIC_DOWNLOAD_EXPIRES: "2026-11-01",
      NEXT_PUBLIC_CONTACT_EMAIL: "hello@example.com",
    });
    expect(result.kind).toBe("expired");
    expect(result.kind === "expired" && result.fallback).toEqual({ kind: "contact", email: "hello@example.com" });
  });

  it.each([
    [{ NEXT_PUBLIC_DOWNLOAD_URL: "http://insecure.example.com/b.dmg", NEXT_PUBLIC_DOWNLOAD_EXPIRES: "never" }, /must start with https/],
    [{ NEXT_PUBLIC_DOWNLOAD_URL: "not a url", NEXT_PUBLIC_DOWNLOAD_EXPIRES: "never" }, /is not a URL/],
    [{ NEXT_PUBLIC_DOWNLOAD_URL: URL_, NEXT_PUBLIC_DOWNLOAD_EXPIRES: "soon" }, /is not a date/],
    [{ NEXT_PUBLIC_DOWNLOAD_URL: URL_, NEXT_PUBLIC_DOWNLOAD_EXPIRES: "never", NEXT_PUBLIC_DOWNLOAD_SHA256: "abc" }, /64 hexadecimal/],
    [{ NEXT_PUBLIC_DOWNLOAD_URL: URL_, NEXT_PUBLIC_DOWNLOAD_EXPIRES: "never", NEXT_PUBLIC_DOWNLOAD_SIZE_BYTES: "62 MB" }, /whole number of bytes/],
    [{ NEXT_PUBLIC_DOWNLOAD_URL: URL_, NEXT_PUBLIC_DOWNLOAD_EXPIRES: "2027-01-19", NEXT_PUBLIC_DOWNLOAD_CHANNEL: "release" }, /the build expires/],
    [{ NEXT_PUBLIC_DOWNLOAD_URL: URL_, NEXT_PUBLIC_DOWNLOAD_EXPIRES: "never", NEXT_PUBLIC_DOWNLOAD_CHANNEL: "time-limited" }, /is never/],
    [{ NEXT_PUBLIC_DOWNLOAD_URL: URL_, NEXT_PUBLIC_DOWNLOAD_EXPIRES: "never", NEXT_PUBLIC_DOWNLOAD_CHANNEL: "stable" }, /must be release, beta or time-limited/],
    [{ NEXT_PUBLIC_CONTACT_EMAIL: "not-an-email" }, /is not an email address/],
    [{ NEXT_PUBLIC_WAITLIST_ENDPOINT: "http://forms.example.com" }, /must start with https/],
  ])("stops the build on a bad value: %o", (env, message) => {
    expect(() => availability(env)).toThrow(message);
  });
});

describe("build lifetime", () => {
  const release = { expiresAt: "2026-11-25T12:00:00.000Z" };

  it("counts whole days left", () => {
    expect(daysLeft(release, NOW)).toBe(4);
    expect(daysLeft(release, new Date("2026-11-25T09:00:00Z"))).toBe(0);
    expect(daysLeft({}, NOW)).toBeUndefined();
  });

  it("expires exactly at the deadline", () => {
    expect(isExpired(release, new Date("2026-11-25T11:59:59Z"))).toBe(false);
    expect(isExpired(release, new Date("2026-11-25T12:00:00Z"))).toBe(true);
    expect(isExpired({}, NOW)).toBe(false);
  });
});

describe("the site's own address", () => {
  it("is never guessed", () => {
    expect(resolveOrigin({})).toBeUndefined();
    expect(isIndexable({})).toBe(false);
  });

  it("uses the configured origin and drops any path", () => {
    expect(resolveOrigin({ NEXT_PUBLIC_SITE_URL: "https://briefnest.example/some/path" })).toBe("https://briefnest.example");
    expect(isIndexable({ NEXT_PUBLIC_SITE_URL: "https://briefnest.example" })).toBe(true);
  });

  it("falls back to the production domain Vercel reports", () => {
    expect(resolveOrigin({ VERCEL_PROJECT_PRODUCTION_URL: "briefnest.vercel.app" })).toBe("https://briefnest.vercel.app");
  });

  it("keeps preview deployments out of search results", () => {
    expect(isIndexable({ NEXT_PUBLIC_SITE_URL: "https://briefnest.example", VERCEL_ENV: "preview" })).toBe(false);
    expect(isIndexable({ NEXT_PUBLIC_SITE_URL: "https://briefnest.example", VERCEL_ENV: "production" })).toBe(true);
  });
});
