// What the image pipeline builds. One entry per image the site shows.
//
//   id     name used by <Picture id="…"> and in the generated manifest
//   src    file under website/assets, or, with `film: true`, under the film project
//          (marketing/briefnest-product-video), whose brand art is used in place rather than copied
//   crop   [left, top, width, height] in source pixels; trims the empty margin around a captured sheet or card
//   kind   "ui" keeps full chroma for screenshots, "photo" compresses harder for artwork
//   widths optional override of the width ladder
//
// Captures come from scripts/capture/capture.sh: real Briefnest views rendered at 2× with synthetic Inknest data.

/** Bump to rebuild every file after changing encoder settings. */
export const PIPELINE_VERSION = 1;

/** Default widths, in CSS-pixel terms 320 → 1180 at 2×. Widths above an image's own size are skipped. */
export const ladder = [480, 640, 960, 1280, 1600, 1920, 2360];

/** Brand sources, relative to the film project. */
export const brand = {
  icon: "assets/branding/aurora-master.png",
  poster: "dist/briefnest-thumbnail-4k.png",
  field: "assets/media/field.jpg",
};

const capture = (id, crop, extra = {}) => ({ id, src: `captures/${extra.from ?? id}.png`, crop, kind: "ui", ...extra });

export const images = [
  // Brand, read from the film project: the 1024 px Aurora icon (extracted from Resources/AppIcon.icns),
  // the film's approved title frame, and the film's field artwork.
  { id: "icon", src: brand.icon, film: true, kind: "ui", widths: [64, 96, 128, 192, 256, 384, 512] },
  { id: "film-poster", src: brand.poster, film: true, kind: "photo", widths: [640, 960, 1280, 1600, 1920] },
  { id: "field", src: brand.field, film: true, kind: "photo", widths: [768, 1280, 1920, 2400] },

  // The whole main window, one page each (1180 × 760 pt)
  capture("win-home"),
  capture("win-meeting-summary"),
  capture("win-meeting-transcript"),
  capture("win-meeting-draft"),
  capture("win-actions"),
  capture("win-decisions"),
  capture("win-chat"),
  capture("win-code"),
  capture("win-review"),
  capture("win-all-workspaces"),

  // The same views rendered narrow, or the detail pane on its own, for small screens
  capture("m-home", [0, 0, 940, 940]),
  capture("m-notes"),
  capture("m-transcript", [0, 0, 940, 860]),
  capture("m-chat"),
  capture("m-review"),
  capture("m-all-workspaces", [0, 0, 940, 1520]),
  capture("m-actions", [1270, 140, 1090, 950], { from: "win-actions" }),
  capture("m-decisions", [1190, 150, 1170, 800], { from: "win-decisions" }),
  capture("m-code", [0, 0, 700, 420], { from: "repository" }),

  // Sheets, panes and cards
  capture("setup", [20, 104, 1160, 612]),
  capture("transcript", [0, 0, 1480, 760]),
  capture("screen"),
  capture("notes", [0, 0, 1520, 1180]),
  capture("editor"),
  capture("actions-detail", [722, 120, 1378, 900], { from: "actions" }),
  capture("history", [0, 56, 1080, 390]),
  capture("v1-detail", [642, 128, 1478, 872], { from: "v1" }),
  capture("v2-detail", [642, 128, 1478, 912], { from: "v2" }),
  capture("questions", [0, 0, 2000, 770]),
  capture("chat"),
  capture("proposal", [14, 40, 1192, 330]),
  capture("applied", [14, 40, 1192, 330]),
  capture("repository"),
  capture("sharing", [88, 190, 1264, 660]),
  capture("agents", [40, 180, 1280, 1004]),
  capture("search", [0, 0, 1280, 720]),
  capture("menubar"),
  capture("team", [0, 60, 1280, 380]),
];
