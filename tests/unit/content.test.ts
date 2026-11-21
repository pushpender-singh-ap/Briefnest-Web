import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { routes } from "@/app/sitemap";
import { changelog } from "@/content/changelog";
import { faqs } from "@/content/faq";
import { chapters } from "@/content/features";
import * as home from "@/content/home";
import { privacyPage, termsPage } from "@/content/legal";
import { brand, commerce, cta, film, footerNav, nav, product } from "@/content/site";
import { image, imageIds, imageUrl } from "@/lib/images";

const publicDir = join(process.cwd(), "public");
const homeSections = new Set([
  home.problem.id,
  home.how.id,
  home.capture.id,
  home.notes.id,
  home.actions.id,
  home.decisions.id,
  home.chat.id,
  home.integrations.id,
  home.workspaces.id,
  home.privacy.id,
  home.tour.id,
  "faq",
]);

describe("navigation", () => {
  const links = [...nav, ...footerNav.flatMap((group) => group.links), { label: cta.primary.label, href: cta.primary.href }];

  it.each(links)("$label ($href) leads to a page or section that exists", ({ href }) => {
    const [path, hash] = href.split("#");
    expect(routes as readonly string[]).toContain(path || "/");
    if (hash) {
      expect(path).toBe("/");
      expect(homeSections).toContain(hash);
    }
  });

  it("has the header items the brief asks for, in order", () => {
    expect(nav.map((item) => item.label)).toEqual(["Product", "Features", "How It Works", "Download", "FAQ"]);
  });

  it("gives every home section a unique anchor", () => {
    expect(homeSections.size).toBe(12);
  });
});

describe("media", () => {
  it.each(imageIds)("image %s has every size on disk, in both formats", (id) => {
    const record = image(id);
    expect(record.widths.length).toBeGreaterThan(0);
    for (const width of record.widths) {
      for (const format of ["avif", "webp"] as const) {
        expect(existsSync(join(publicDir, imageUrl(id, width, format))), `${id} ${width} ${format}`).toBe(true);
      }
    }
  });

  it("serves web derivatives of the film, never the 4K master", () => {
    for (const source of [...film.sources, ...film.preview]) {
      expect(existsSync(join(publicDir, source.src)), source.src).toBe(true);
      expect(source.src).not.toMatch(/4k/i);
    }
    expect(existsSync(join(publicDir, film.posterFile))).toBe(true);
  });

  it("ends the source list with a plain H.264 file every browser can play", () => {
    expect(film.sources.at(-1)).toEqual({ src: "/videos/briefnest-film-1080p.mp4", type: "video/mp4" });
    expect(film.preview.at(-1)?.type).toBe("video/mp4");
  });

  it("ships the film's captions, cue for cue", () => {
    const vtt = readFileSync(join(publicDir, film.captions[0].src), "utf8");
    expect(vtt.startsWith("WEBVTT")).toBe(true);
    expect(vtt.match(/-->/g)).toHaveLength(14);
    expect(vtt).toContain("Where conversations\nconnect to the work.");
  });
});

describe("copy", () => {
  it("uses the approved positioning", () => {
    expect(brand.tagline).toBe("Where conversations connect to the work.");
    expect(brand.supporting).toBe("From conversations to progress.");
    expect([...home.hero.headline.lines.flat(), home.hero.headline.turn].join(" ")).toBe("Your meetings. Your decisions. Your work. Connected.");
    expect(cta.primary.label).toBe("Get Briefnest");
    expect(cta.film.hero).toBe("Watch the Film");
  });

  it("states the verified requirements", () => {
    expect(product.version).toBe("0.1.0");
    expect(product.minimumOSLong).toBe("macOS 15 or later");
    expect(product.chip).toBe("Apple Silicon");
  });

  it("answers the ten questions the brief lists, in order", () => {
    expect(faqs.map((faq) => faq.question)).toEqual([
      "What is Briefnest?",
      "Which operating systems are supported?",
      "Does Briefnest work offline?",
      "Which transcription options are available?",
      "Can I use Claude Code or Codex?",
      "Can Briefnest connect to GitHub and GitLab?",
      "Can I review AI-generated changes?",
      "Can I use Briefnest with multiple projects?",
      "How does team sharing work?",
      "How do I install Briefnest?",
    ]);
    for (const faq of faqs) expect(faq.answer.join(" ").length).toBeGreaterThan(60);
  });

  it("covers the eight screens of the product tour", () => {
    expect(home.tour.items.map((item) => item.title)).toEqual([
      "Workspace overview",
      "Meeting notes",
      "Transcript",
      "Action tracking",
      "Decisions",
      "Chat",
      "Code",
      "Review",
    ]);
  });

  it("walks the workflow in the stated order", () => {
    expect(home.how.steps.map((step) => step.title)).toEqual(["Capture", "Understand", "Decide", "Act", "Remember"]);
  });

  it("makes no claim the product can't back", () => {
    const everything = JSON.stringify({ home, faqs, chapters, privacyPage, termsPage, changelog, brand, commerce });
    for (const forbidden of [
      /[$€£]\s?\d/,
      /\bper (month|year|seat|user)\b/i,
      /free trial/i,
      /zero[- ]knowledge/i,
      /end[- ]to[- ]end encrypt/i,
      /\b(SOC ?2|HIPAA|ISO ?27001|GDPR[- ]compliant)\b/i,
      /\b\d+(\.\d+)?\s?(x|×|%)\s+(faster|more productive|fewer)/i,
      /never leaves? (your|the) (device|mac)\b(?! (until|except))/i,
      /trusted by|customers love|rated \d/i,
    ]) {
      expect(everything, String(forbidden)).not.toMatch(forbidden);
    }
    expect(commerce.status).toBe("not-announced");
  });

  it("labels both legal pages as drafts", () => {
    expect(privacyPage.status).toMatch(/draft/i);
    expect(termsPage.status).toMatch(/draft/i);
  });

  it("lists only the version that exists", () => {
    expect(changelog.map((entry) => entry.version)).toEqual([product.version]);
  });
});
