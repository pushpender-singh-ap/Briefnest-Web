# Briefnest website

The public product site for Briefnest: a home page, a features page, download, changelog, privacy and terms. It is a Next.js App Router project that builds to plain static files, so it can be hosted anywhere. Nothing here is imported by, or imports from, the Swift app.

## Run it

Needs Node.js 22 or later.

```sh
cd website
npm install
npm run dev        # http://localhost:3000, with hot reload
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server. |
| `npm run build` | Production build into `out/`. |
| `npm run preview` | Serves `out/` on port 3000 the way a static host would, with the production headers. |
| `npm run lint` | ESLint. |
| `npm run typecheck` | Generates Next.js route types, then runs TypeScript with no output. |
| `npm test` | Unit tests (Vitest). |
| `npm run test:e2e` | Browser tests (Playwright) against `out/`. Run `npm run build` first. |
| `npm run check` | All of the above, in order. Run this before deploying. |
| `npm run lighthouse` | Measures the built site with Lighthouse and prints the scores. |
| `npm run screenshots` | Review screenshots of a running site at 375, 768, 1024, 1440 and 1920 px. |
| `npm run images` | Rebuilds responsive images after a source image or crop changes. |
| `npm run media` | Rebuilds the web video files from the film master. Needs FFmpeg. |
| `npm run captures` | Re-renders the product screenshots from the real app views. Needs the Swift toolchain. |

The browser tests use installed Google Chrome, because Playwright's own Chromium can't decode the film's H.264 and AAC. First time only: `npx playwright install chromium webkit`.

## Configure it

Copy `.env.example` to `.env.local`. Every value is optional and public; there are no secrets.

| Variable | Effect |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | The production origin. Turns on canonical URLs, the sitemap, absolute social-preview URLs and indexing. On Vercel it is read from the project's production domain if unset. |
| `NEXT_PUBLIC_DOWNLOAD_URL` | Where a published build lives. Turns the download page into a real download. |
| `NEXT_PUBLIC_DOWNLOAD_EXPIRES` | Required with a download URL: the instant the build stops working, or `never`. The page shows it. |
| `NEXT_PUBLIC_DOWNLOAD_CHANNEL` | `release`, `beta` or `time-limited`. Defaults from the expiry. |
| `NEXT_PUBLIC_DOWNLOAD_SHA256`, `_SIZE_BYTES`, `_RELEASED` | Shown beside the button. |
| `NEXT_PUBLIC_RELEASE_VERSION` | Version shown across the site. Defaults to `0.1.0`. |
| `NEXT_PUBLIC_WAITLIST_ENDPOINT` | An HTTPS endpoint for early-access requests. Shows a form while there is no download. |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Shown as a mailto link when there is no download and no form endpoint. |
| `NEXT_PUBLIC_REPOSITORY_URL` | Adds a Source link to the footer. Leave unset while the repository is private. |

### What the download page shows

The site works out what it may truthfully offer from configuration alone (`src/lib/release.ts`):

| Configured | The page says |
| --- | --- |
| Nothing (today) | "Not available to download yet." No button. |
| Contact email | "Ask for early access", with a mailto link. |
| Waitlist endpoint | "Ask for early access", with a form that posts to the endpoint. |
| Download URL and expiry | Download button, version, channel, size, checksum and the date the build expires, with days left. |
| Download URL whose expiry has passed | "The last build has expired", then whichever fallback above is configured. |

A wrong value stops the build with a message naming the variable. A download URL without `NEXT_PUBLIC_DOWNLOAD_EXPIRES` is refused, so a time-limited build can't be published without saying so. The download page also checks the expiry against the visitor's clock, so an old deploy never offers an expired build.

Don't commit a DMG. Host it (a GitHub Release asset, object storage, a CDN) and set the URL.

The form posts JSON, `{ "email", "consent": true, "source": "briefnest-website" }`, and reports success only when the endpoint answers 2xx. Formspree, Basin, Getform or a small function of your own will accept that.

## Change the words

All copy is in `src/content`. Components hold layout, not text.

| File | Holds |
| --- | --- |
| `site.ts` | Brand, taglines, call-to-action labels, navigation, the verified version and requirements, the film's files, pricing status. Start here. |
| `home.ts` | Every homepage section, in page order. |
| `faq.ts` | Questions and answers. Also published as FAQ structured data. |
| `features.ts` | The features page, chapter by chapter. |
| `changelog.ts` | Release notes. |
| `legal.ts` | Privacy and terms. Both are drafts and say so on the page. |

Every product statement was checked against this repository's documentation and the app's own screens. Keep it that way: `tests/unit/content.test.ts` fails the build on prices, trial offers, compliance badges, quantified productivity claims and absolute privacy claims, and checks that every link has a destination and every image and video file exists.

## Media

### The film

The approved launch film is `marketing/briefnest-product-video/dist/briefnest-launch-4k.mp4`. The site never loads that file. `npm run media` reads it and writes web copies to `public/videos`, without changing the master:

| File | For | Size |
| --- | --- | --- |
| `briefnest-film-1080p.av1.mp4` | The player, where AV1 can be decoded | 7.3 MB |
| `briefnest-film-1080p.mp4` | The player, H.264 for everything else | 12.4 MB |
| `briefnest-film-720p.mp4` | The player on phones | 5.1 MB |
| `briefnest-preview-720p.av1.mp4`, `briefnest-preview-720p.mp4` | The hero's silent preview, no audio track | 2.1 MB each |
| `briefnest-film.en.vtt` | English captions, converted from the film's SRT | 1 kB |
| `briefnest-film-poster.jpg` | Poster, from the film's own thumbnail | 57 kB |

Nothing is downloaded until it is needed. The hero paints the poster. On screens 640 px and wider it then fades in the silent preview once the page has loaded, unless the visitor prefers reduced motion, has Data Saver on or is on a slow connection; phones keep the poster. The film itself loads when someone presses a Watch control. The player has play and pause, scrubbing, volume and mute, captions, full screen, and keyboard shortcuts (Space or K, arrows, M, C, F).

These files are kept in the repository so a deploy doesn't need FFmpeg. To serve them from a CDN instead, change the paths in `film` in `src/content/site.ts`.

The film's 15-second vertical cut is a social asset and isn't used on the site.

### Screenshots

Every screenshot is the real app. `npm run captures` copies the Swift package to a temporary folder, swaps only that copy's entry point for `scripts/capture/Capture.swift`, seeds temporary stores with the same fictional Inknest project the film uses, renders the app's own SwiftUI views offscreen and exits. It doesn't touch the checkout, the installed app or its data, and nothing is sent anywhere. The captures land in `assets/captures`.

Four things on the homepage are typeset rather than captured: the scattered-to-connected diagram, the action "review step" sketch, the answer-and-sources panel, and the example exchange with a coding agent. The last three say so on the page, and each sits beside the real screen it restates. The window title bar with its three controls is drawn by the site; everything below it is the app.

### Images

`npm run images` builds AVIF and WebP at several widths into `public/img`, named with a content hash, and writes `src/content/generated/images.json`. Its sources are the captures in `assets/captures` and three pieces of brand art read in place from the film project: the 1024 px Aurora icon, the film's title frame and its field artwork. `scripts/images.config.mjs` lists each image and its crop. The results are kept in the repository, so a deploy needs neither the film project nor an image tool. Pages use `<Picture id="…">`, which emits a `<picture>` with exact `srcset`s, reserved dimensions, lazy loading, and an optional narrower image for phones. This replaces the Next.js on-demand image optimizer, which needs a server and so isn't available in a static export. The script also writes the favicon, the app icons and the social preview image.

## Design system

Tokens are in `src/app/globals.css`, in the `@theme` block, and become Tailwind utilities.

- **Colour.** Charcoal stage `#0b1017` from the film. Indigo and violet lighting from the Aurora icon. Mint and teal for accents. The app's own semantic colours appear only where the page mirrors an app state.
- **Type.** Inter for statements and body, with its display optical size at headline sizes. EB Garamond Italic for the turn in a headline: write `<em>` inside any `.t-display`, `.t-h2` or `.t-h3`. JetBrains Mono for provenance labels (`.t-eyebrow`). All three are self-hosted by `next/font`.
- **Fallback fonts.** Each role has a fallback sized against the real font, so text keeps its line breaks when the web font arrives. Limit headline widths in `em`, not `ch`: a `ch` changes with the font.
- **Layout.** `.container-page` (78rem) and `.container-wide` (90rem); `.section` for vertical rhythm. Breakpoints are Tailwind's: 640, 768, 1024, 1280, 1536.
- **Surfaces.** `.plate` frames a screenshot. `<AppWindow>` adds a Mac window frame. `.surface` is a quiet panel for copy.
- **Motion.** Opacity and transform only. The hero entrance is CSS and starts with first paint. `<Reveal>` is plain markup; one observer hides only what starts below the fold and lets it in on scroll. Motion for React drives the two stateful scenes. Everything honours `prefers-reduced-motion`.

## Tests and measurements

- **Unit**, 118 tests: release and availability rules, formatting, content integrity, header parity, the early-access form, the download panel, the film player, the source explorer.
- **Browser**, 118 checks across desktop Chrome, desktop Safari (WebKit) and mobile Safari: every page loads without console errors or failed requests; every internal link resolves; the film opens, really plays, shows captions, responds to the keyboard and closes; the mobile menu; tabs, tour, accordion and switches by click, key and swipe; no horizontal scrolling at 375, 768, 1024, 1440 and 1920 px; axe finds no WCAG A or AA violations on any page; the first screen keeps its layout when web fonts replace their fallbacks.

Lighthouse, measured on 21 November 2026 against the local production build with `NEXT_PUBLIC_SITE_URL` set, median of three runs:

| Page | Profile | Performance | Accessibility | Best practices | SEO | LCP | CLS |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Home | Phone | 91 | 100 | 100 | 100 | 3.5 s | 0 |
| Home | Desktop | 100 | 100 | 100 | 100 | 0.8 s | 0 |
| Features, Download, Changelog, Privacy, Terms | Phone | 100 | 100 | 100 | 100 | 0.9 s | 0 |
| Features, Download, Changelog, Privacy, Terms | Desktop | 100 | 100 | 100 | 100 | 0.2 s | 0 |

The phone profile simulates a slow 4G connection and a CPU four times slower. The home page's 3.5 s is Lighthouse's model of that connection applied to a localhost trace. With the same limits actually enforced in Chrome (`--throttling-method=devtools`), the home page measured 98 to 99, with LCP 1.8 s and CLS 0 in each of three runs. Expect different numbers on a real host: these are local measurements, not field data.

Without `NEXT_PUBLIC_SITE_URL`, SEO scores 66. That is deliberate: a build that doesn't know its own address marks itself `noindex`.

Not tested: real phones and tablets, Firefox, screen readers with a person listening, and a deployed host.

## Deploy

Nothing is deployed. To deploy:

**Vercel.** Import the repository, set the root directory to `website`, keep the Next.js preset. Add environment variables from the table above. `vercel.json` sets the content security policy, the other security headers, and long caching for `/img` and `/_next/static`.

**Any static host** (Netlify, Cloudflare Pages, GitHub Pages, S3 with a CDN, nginx). Run `npm run build` and upload `out/`. The host needs to:

- serve `/features` from `features.html` (most do; for hosts that don't, set `trailingSlash: true` in `next.config.ts`);
- answer HTTP range requests, or the film can't be scrubbed;
- send the headers in `vercel.json`. `serve.json` holds the same headers for the local preview, and a unit test keeps the two in step.

Before the first production deploy:

1. Set `NEXT_PUBLIC_SITE_URL`.
2. Decide what the download page offers and set those variables.
3. Have the privacy and terms pages reviewed. They are labelled as drafts.
4. Run `npm run check`.

## Later

**Selling Briefnest.** No price, plan or trial exists, so the site states that and takes no payments (`commerce` in `src/content/site.ts`, shown on the download page). When pricing is decided, describe it there, render it on the download page, and link the purchase button to the checkout you choose. The content test that forbids prices will fail at that point; update it in the same change.

**Analytics.** There are none, and the privacy page says so. If you add any, update that page and the `Content-Security-Policy` in `vercel.json` and `serve.json` together.

## Layout

```text
website/
├── assets/          app captures, the source for the screenshots (not served)
├── public/          img/ (generated), videos/ (generated)
├── scripts/         media, image, capture, screenshot and Lighthouse scripts
├── src/
│   ├── app/         routes, metadata, sitemap, robots, global styles
│   ├── components/  layout/, sections/, ui/, video/, download/
│   ├── content/     all copy and configuration
│   └── lib/         release rules, formatting, images, fonts, SEO
└── tests/           unit/ and e2e/
```
