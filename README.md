# Briefnest website

The public product site for Briefnest: a home page, a features page, download, changelog, privacy and terms. It is a Next.js App Router project that builds to plain static files, so it can be hosted anywhere; the repository is set up for Cloudflare Workers. Nothing here is imported by, or imports from, the Swift app.

## Run it

Needs Node.js 22.12 or later.

```sh
npm install
npm run dev        # http://localhost:3000, with hot reload
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server. |
| `npm run build` | Production build into `out/`. Also cuts the videos into pieces for Cloudflare (`out/videos/pieces/`) and refreshes `worker/videos.json`. |
| `npm run preview` | Serves `out/` on port 3000 the way Cloudflare does, with the production headers and the film handler. Runs on this machine only (`wrangler dev`). |
| `npm run deploy` | Builds, then deploys to Cloudflare. See [Deploy](#deploy). |
| `npm run lint` | ESLint. |
| `npm run typecheck` | Generates the Next.js route types and the Workers runtime types, then runs TypeScript on the site and on the film handler, with no output. |
| `npm test` | Unit tests (Vitest). |
| `npm run test:e2e` | Browser tests (Playwright) against `out/`, served the way `npm run preview` serves it. Run `npm run build` first. |
| `npm run check` | All of the above, in order. Run this before deploying. |
| `npm run lighthouse` | Measures the built site with Lighthouse and prints the scores. |
| `npm run screenshots` | Review screenshots of a running site at 375, 768, 1024, 1440 and 1920 px. |
| `npm run images` | Rebuilds responsive images after a source image or crop changes. |
| `npm run media` | Rebuilds the web video files from the film master. Needs FFmpeg. |
| `npm run captures` | Re-renders the product screenshots from the real app views. Needs the Swift toolchain. |

The browser tests use installed Google Chrome, because Playwright's own Chromium can't decode the film's H.264 and AAC. First time only: `npx playwright install chromium webkit`.

## Configure it

The site needs no configuration: its address is recorded in `src/content/site.ts` and the published download in `src/content/release.ts`. The variables below change one deployment. To try them, copy `.env.example` to `.env.local`. Every value is optional and public; there are no secrets. They are read when the site is built, so on a host they are build settings: on Cloudflare, the Worker's **Settings** > **Build** > **Build variables and secrets**.

| Variable | Effect |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | A different address than the one recorded in `src/content/site.ts` (`https://ability.ninja`), for a copy served somewhere else. The address turns on canonical URLs, the sitemap, absolute social-preview URLs and indexing. |
| `NEXT_PUBLIC_DOWNLOAD_URL` | A different file to offer than the published build (see below). Replaces everything in `src/content/release.ts`. |
| `NEXT_PUBLIC_DOWNLOAD_EXPIRES` | Required with a download URL: the instant the build stops working, or `never`. The page shows it. |
| `NEXT_PUBLIC_DOWNLOAD_CHANNEL` | `release`, `beta` or `time-limited`. Defaults from the expiry. |
| `NEXT_PUBLIC_DOWNLOAD_SHA256`, `_SIZE_BYTES`, `_RELEASED` | Shown beside the button. |
| `NEXT_PUBLIC_RELEASE_VERSION` | Version shown across the site. Defaults to `releaseVersion` in `src/content/release.ts`. |
| `NEXT_PUBLIC_WAITLIST_ENDPOINT` | An HTTPS endpoint for early-access requests. Shows a form while there is no download. |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Shown as a mailto link when there is no download and no form endpoint. |
| `NEXT_PUBLIC_REPOSITORY_URL` | Adds a Source link to the footer. Leave unset while the repository is private. |

### What the download page shows

The published build is recorded in `src/content/release.ts`: its address, the moment it stops working, its checksum, size and release date. Every build of the site reads it, so no host needs to be configured for the download to appear. From that record and the variables above, the site works out what it may truthfully offer (`src/lib/release.ts`):

| Recorded or configured | The page says |
| --- | --- |
| A published build (today) | Download button, version, channel, size, checksum and the date the build expires, with days left. |
| A published build whose expiry has passed | "The last build has expired", then whichever fallback below is configured. |
| No build, nothing configured | "Not available to download yet." No button. |
| No build, a contact email | "Ask for early access", with a mailto link. |
| No build, a waitlist endpoint | "Ask for early access", with a form that posts to the endpoint. |

A wrong value stops the build with a message naming it. A download without an expiry is refused, so a time-limited build can't be published without saying so. The download page also checks the expiry against the visitor's clock, so an old deploy never offers an expired build.

### Publish a new build

1. Build and notarize the DMG in the app repository (`scripts/build-production-dmg.sh`). Note the expiry it prints.
2. Add it to a new GitHub Release of this repository, tagged `v<version>`. Don't commit a DMG.
3. Set `releaseVersion`, `expires`, `sha256` (`shasum -a 256 <file>`), `sizeBytes` (`stat -f %z <file>`) and the publication date in `src/content/release.ts`. The download URL uses the release version. Add the entry to `src/content/changelog.ts`.
4. Run `npm run check`, then commit and push. The site rebuilds with the new download.

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
| `briefnest-film-1080p.av1.mp4` | The player, where AV1 can be decoded | 6.8 MB |
| `briefnest-film-1080p.mp4` | The player, H.264 for everything else | 11.9 MB |
| `briefnest-film-720p.mp4` | The player on phones | 4.8 MB |
| `briefnest-preview-720p.av1.mp4`, `briefnest-preview-720p.mp4` | The hero's silent preview, no audio track | 1.9 MB and 2.0 MB |
| `briefnest-film.en.vtt` | English captions, converted from the film's SRT | 1 kB |
| `briefnest-film-poster.jpg` | Poster, from the film's own thumbnail | 57 kB |

Nothing is downloaded until it is needed. The hero paints the poster. On screens 640 px and wider it then fades in the silent preview once the page has loaded, unless the visitor prefers reduced motion, has Data Saver on or is on a slow connection; phones keep the poster. The film itself loads when someone presses a Watch control. The player has play and pause, scrubbing, volume and mute, captions, full screen, and keyboard shortcuts (Space or K, arrows, M, C, F).

These files are kept in the repository so a deploy doesn't need FFmpeg. `npm run media` also rewrites `worker/videos.json`, the list of their lengths that the film handler needs on Cloudflare; a unit test fails if the list and the files disagree. To serve the videos from a CDN instead, change the paths in `film` in `src/content/site.ts`.

The film's 15-second vertical cut is a social asset and isn't used on the site.

### Screenshots

Every screenshot is the real app. `npm run captures` copies the Swift package to a temporary folder, swaps only that copy's entry point for `scripts/capture/Capture.swift`, seeds temporary stores with the same fictional Inknest project the film uses, renders the app's own SwiftUI views offscreen and exits. It doesn't touch the checkout, the installed app or its data, and nothing is sent anywhere. The captures land in `assets/captures`.

The Jira, Multica, Mail and proposed-comment images in `assets/captures` come from the 0.2.0 film’s Inknest fixture in `marketing/briefnest-product-video/assets/ui-captures`. The site includes the four originals and their responsive crops.

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

- **Unit**, 156 tests covering release and availability rules, the published release's record, formatting, content integrity, headers, range handling, video lengths, the early-access form, the download panel, the film player and the source explorer.
- **Browser**, 132 checks across desktop Chrome, desktop Safari (WebKit) and mobile Safari, against the build served by Cloudflare's runtime on this machine: every page loads without console errors or failed requests; every internal link resolves; a missing page or file gets the not-found page; the film opens, really plays, shows captions, responds to the keyboard and closes; each video is sent in exact parts, compared byte for byte with the file; the mobile menu; tabs, tour, accordion and switches by click, key and swipe; no horizontal scrolling at 375, 768, 1024, 1440 and 1920 px; axe finds no WCAG A or AA violations on any page; the first screen keeps its layout when web fonts replace their fallbacks.

Lighthouse, measured on 21 November 2026 against the local production build with `NEXT_PUBLIC_SITE_URL` set, median of three runs:

| Page | Profile | Performance | Accessibility | Best practices | SEO | LCP | CLS |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Home | Phone | 91 | 100 | 100 | 100 | 3.5 s | 0 |
| Home | Desktop | 100 | 100 | 100 | 100 | 0.8 s | 0 |
| Features, Download, Changelog, Privacy, Terms | Phone | 100 | 100 | 100 | 100 | 0.9 s | 0 |
| Features, Download, Changelog, Privacy, Terms | Desktop | 100 | 100 | 100 | 100 | 0.2 s | 0 |

The phone profile simulates a slow 4G connection and a CPU four times slower. The home page's 3.5 s is Lighthouse's model of that connection applied to a localhost trace. With the same limits actually enforced in Chrome (`--throttling-method=devtools`), the home page measured 98 to 99, with LCP 1.8 s and CLS 0 in each of three runs. Expect different numbers on a real host: these are local measurements, not field data.

The table was measured with the local server the project used at the time. On 25 November 2026, with Cloudflare's runtime serving the same pages (`npm run lighthouse` as it is now), the home page measured 90 on the phone profile (LCP 3.7 s) and 99 on desktop (LCP 0.9 s), and the download page 100 on both.

Those measurements were taken before the site's address was recorded in the repository. A build that doesn't know its own address marks itself `noindex`, deliberately, and then scores 66 for SEO.

The same browser checks were run against the deployed site, `https://ability.ninja`, on 25 November 2026, with the first version of the film handler. Every film check passed: each video byte for byte, and playback in Chrome and WebKit. The "loads cleanly" check failed on every page, because Cloudflare's Web Analytics script, which the zone's settings add to each page, is blocked by the site's content security policy and logs an error.

Not tested: real phones and tablets, Firefox, and screen readers with a person listening.

## Deploy

Pushing the website’s `main` branch triggers the Cloudflare Workers build for [ability.ninja](https://ability.ninja).

### Cloudflare Workers

`wrangler.jsonc` describes the deployment:

- **Files.** Everything in `out/` is served as a static file. Those requests are free and unlimited on every Cloudflare plan.
- **Headers.** `public/_headers` sets the content security policy, the other security headers, and the caching for `/img`, `/_next/static` and `/videos`.
- **The film.** Cloudflare's file serving answers a byte-range request with the whole file, and a browser needs ranges to skip ahead in a video. A small Worker, `worker/index.ts`, answers them. Only requests for `/videos/*.mp4` run it. The free plan allows 100,000 such requests a day and 10 ms of processor time for each.
- **Video pieces.** A Worker is handed a file from its first byte only, and reading past megabytes to reach a later part costs processor time. So `npm run build` also stores each video as pieces of 512 KiB in `out/videos/pieces/`, and the Worker puts a part together from the pieces that hold it.

To deploy from this machine:

```sh
npx wrangler login    # once
npm run deploy        # builds, then uploads
```

To deploy on every push instead, connect the repository in the Cloudflare dashboard (**Workers & Pages** > **Create application** > **GitHub**) with these settings:

| Setting | Value |
| --- | --- |
| Worker name | `briefnest-website`. It must match `name` in `wrangler.jsonc`, or the build fails. |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Root directory | Leave empty. |
| Build variables | None are needed. Any value from [Configure it](#configure-it) can be set to change this deployment. |

The site is first served at `briefnest-website.<your-subdomain>.workers.dev`. To use your own domain, its DNS has to be on Cloudflare; then add it under the Worker's **Settings** > **Domains & Routes** > **Add** > **Custom Domain**. The address visitors should use is recorded as `address` in `src/content/site.ts`; change it there if the domain changes. If you turn on preview builds for other branches, each gets its own `workers.dev` address, which Cloudflare marks `noindex`.

After a deploy, check the two things a local run can't:

- **The film over the real network.** `BASE_URL=https://ability.ninja npx playwright test film-ranges` asks the deployed site for parts of each video and compares them, byte for byte, with the files in `public/videos`.
- **Processor time.** Run `npx wrangler tail briefnest-website --format json` while those tests run, and read `cpuTime` for each request. Only Cloudflare's own figure counts against the 10 ms limit, and the local runtime doesn't predict it.

Measured on Cloudflare on 25 November 2026, with the first version of the handler, which read through a file to reach the part asked for: 0 ms for a whole file, about 1.2 ms for each megabyte read past and 2.4 ms for each megabyte copied, so 8 to 36 ms for a request near the end of the 12.4 MB video. No request was refused, but that is over the free plan's limit. The handler now works from pieces to keep every request to one piece read past and one copied. That version has not been measured on Cloudflare yet; from the figures above it should use 2 to 5 ms.

### Other hosts

**Vercel.** Import the repository and keep the Next.js preset. Add environment variables from the table above. `vercel.json` sets the same headers as `public/_headers`, and a unit test keeps the two in step.

**Any static host** (Netlify, S3 with a CDN, nginx). Run `npm run build` and upload `out/`. The host needs to:

- serve `/features` from `features.html` (most do; for hosts that don't, set `trailingSlash: true` in `next.config.ts`);
- answer HTTP range requests, or the film can't be scrubbed;
- send the headers in `public/_headers`.

### Before the first production deploy

1. Check the site's address in `src/content/site.ts`.
2. Check what the download page offers (`src/content/release.ts`).
3. Have the privacy and terms pages reviewed. They are labelled as drafts.
4. Run `npm run check`.

## Later

**Selling Briefnest.** No price, plan or trial exists, so the site states that and takes no payments (`commerce` in `src/content/site.ts`, shown on the download page). When pricing is decided, describe it there, render it on the download page, and link the purchase button to the checkout you choose. The content test that forbids prices will fail at that point; update it in the same change.

**Analytics.** There are none, and the privacy page says so. If you add any, update that page and the `Content-Security-Policy` in `public/_headers` and `vercel.json` together.

## Layout

```text
website/
├── assets/          app captures, the source for the screenshots (not served)
├── public/          img/ (generated), videos/ (generated), _headers (response headers on Cloudflare)
├── scripts/         media, image, capture, screenshot and Lighthouse scripts
├── src/
│   ├── app/         routes, metadata, sitemap, robots, global styles
│   ├── components/  layout/, sections/, ui/, video/, download/
│   ├── content/     all copy and configuration
│   └── lib/         release rules, formatting, images, fonts, SEO
├── tests/           unit/ and e2e/
├── worker/          the film handler that runs on Cloudflare, and its list of the videos
├── vercel.json      the same response headers, for Vercel
└── wrangler.jsonc   Cloudflare Workers configuration
```
