import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

interface Rule {
  source: string;
  headers: { key: string; value: string }[];
}
const read = (file: string): Rule[] => JSON.parse(readFileSync(join(process.cwd(), file), "utf8")).headers;
const flatten = (rules: Rule[]) => rules.map((rule) => rule.headers.map((header) => `${header.key}: ${header.value}`).sort());

describe("response headers", () => {
  const production = read("vercel.json");
  const preview = read("serve.json");

  it("are the same in production (vercel.json) and in the local preview (serve.json)", () => {
    expect(flatten(preview)).toEqual(flatten(production));
  });

  it("lock the pages down without blocking what the site uses", () => {
    const csp = production[0].headers.find((header) => header.key === "Content-Security-Policy")!.value;
    for (const directive of ["default-src 'self'", "frame-ancestors 'none'", "object-src 'none'", "base-uri 'self'", "media-src 'self'", "font-src 'self'"]) {
      expect(csp).toContain(directive);
    }
    // No third-party script, style, image, font or media origin is allowed anywhere.
    expect(csp).not.toMatch(/(script|style|img|font|media)-src[^;]*https?:/);
    expect(csp).not.toContain("unsafe-eval");
  });

  it("cache fingerprinted files forever and the film for a day", () => {
    const cache = Object.fromEntries(production.map((rule) => [rule.source, rule.headers.find((header) => header.key === "Cache-Control")?.value]));
    expect(cache["/img/(.*)"]).toBe("public, max-age=31536000, immutable");
    expect(cache["/_next/static/(.*)"]).toBe("public, max-age=31536000, immutable");
    expect(cache["/videos/(.*)"]).toContain("max-age=86400");
  });
});
