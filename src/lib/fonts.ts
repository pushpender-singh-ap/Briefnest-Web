import { EB_Garamond, Inter, JetBrains_Mono } from "next/font/google";

// The launch film's own trio: a tight grotesque for statements, a Garamond italic for the turn in meaning,
// and a mono for provenance labels. next/font downloads them at build time and self-hosts them, so the
// browser makes no request to Google.
//
// Fallbacks matter as much as the fonts: on a slow connection the page paints in a system font first, and
// if that font sets wider or narrower, text re-wraps when the real one arrives. Small body text uses the
// fallback next/font generates. Headlines, lead paragraphs, the italic and the mono use fallbacks defined in
// globals.css that were measured against the real fonts at the sizes they are used.

/** Statements and body. The optical-size axis gives large headlines the display cut. */
export const sans = Inter({
  subsets: ["latin"],
  axes: ["opsz"],
  display: "swap",
  variable: "--font-inter",
});

/** Emphasis only, always italic. Its fallback is "Garamond Italic Fallback" in globals.css. */
export const serif = EB_Garamond({
  subsets: ["latin"],
  style: ["italic"],
  display: "swap",
  variable: "--font-garamond",
});

/** Small provenance labels. Not needed for first paint, so it isn't preloaded; the system monospace stands in. */
export const mono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-jetbrains",
});

export const fontVariables = `${sans.variable} ${serif.variable} ${mono.variable}`;

const face = (family: string) => family.split(",")[0].trim();

/**
 * Each family on its own, without the fallback next/font appends, exposed as CSS variables on <html> so
 * globals.css can pair every role with a fallback measured for it.
 */
export const fontFaces = {
  "--face-sans": face(sans.style.fontFamily),
  "--face-serif": face(serif.style.fontFamily),
  "--face-mono": face(mono.style.fontFamily),
};
