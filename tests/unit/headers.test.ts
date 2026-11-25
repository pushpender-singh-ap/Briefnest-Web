import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/** Path pattern → its headers as "Name: value", sorted. */
type Rules = Record<string, string[]>;

const file = (name: string) => readFileSync(join(process.cwd(), name), "utf8");

/** public/_headers, read by Cloudflare: a path pattern on its own line, then its indented "Name: value" lines. */
function cloudflareRules(): Rules {
  const rules: Rules = {};
  let pattern = "";
  for (const line of file("public/_headers").split("\n")) {
    if (!line.trim() || line.trimStart().startsWith("#")) continue;
    if (/^\s/.test(line)) rules[pattern].push(line.trim());
    else rules[(pattern = line.trim())] = [];
  }
  for (const headers of Object.values(rules)) headers.sort();
  return rules;
}

/** vercel.json, read by Vercel. Its "/img/(.*)" is Cloudflare's "/img/*". */
function vercelRules(): Rules {
  const rules: { source: string; headers: { key: string; value: string }[] }[] = JSON.parse(file("vercel.json")).headers;
  return Object.fromEntries(rules.map((rule) => [rule.source.replace("(.*)", "*"), rule.headers.map((header) => `${header.key}: ${header.value}`).sort()]));
}

describe("response headers", () => {
  const rules = cloudflareRules();
  const value = (pattern: string, name: string) => rules[pattern]?.find((header) => header.startsWith(`${name}: `))?.slice(name.length + 2);

  it("are the same on Cloudflare (public/_headers) and on Vercel (vercel.json)", () => {
    expect(rules).toEqual(vercelRules());
  });

  it("lock the pages down without blocking what the site uses", () => {
    const csp = value("/*", "Content-Security-Policy")!;
    for (const directive of ["default-src 'self'", "frame-ancestors 'none'", "object-src 'none'", "base-uri 'self'", "media-src 'self'", "font-src 'self'"]) {
      expect(csp).toContain(directive);
    }
    // No third-party script, style, image, font or media origin is allowed anywhere.
    expect(csp).not.toMatch(/(script|style|img|font|media)-src[^;]*https?:/);
    expect(csp).not.toContain("unsafe-eval");
    expect(value("/*", "X-Content-Type-Options")).toBe("nosniff");
  });

  it("cache fingerprinted files forever and the film for a day", () => {
    expect(value("/img/*", "Cache-Control")).toBe("public, max-age=31536000, immutable");
    expect(value("/_next/static/*", "Cache-Control")).toBe("public, max-age=31536000, immutable");
    expect(value("/videos/*", "Cache-Control")).toContain("max-age=86400");
  });

  it("stay within what Cloudflare reads from a headers file", () => {
    // Up to 100 rules, and no line longer than 2,000 characters.
    expect(Object.keys(rules).length).toBeLessThanOrEqual(100);
    for (const line of file("public/_headers").split("\n")) expect(line.length, line.slice(0, 60)).toBeLessThanOrEqual(2000);
  });
});
