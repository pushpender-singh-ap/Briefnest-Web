/**
 * The build that is published for download, or `null` while there is none.
 *
 * Fill this in only when the disk image is really published at `url`, and replace it with each new build. The
 * file itself is a GitHub Release asset of this repository; never commit a DMG. The download page shows every
 * field, so take each one from the build:
 *
 *   expires     the moment the build stops working: BriefnestExpiresAt in the app's Info.plist, which
 *               scripts/build-production-dmg.sh prints. "never" for a build that doesn't expire.
 *   sha256      shasum -a 256 <file>
 *   sizeBytes   stat -f %z <file>
 *   released    the day the release was published, YYYY-MM-DD
 *
 * A wrong value stops the build with a message. A host can offer a different file by setting
 * NEXT_PUBLIC_DOWNLOAD_URL and its companions (see .env.example); those then replace everything here.
 */
import type { PublishedRelease } from "@/lib/release";

export const publishedRelease: PublishedRelease | null = {
  url: "https://github.com/pushpender-singh-ap/Briefnest-Web/releases/download/v0.1.0/Briefnest-0.1.0-arm64.dmg",
  expires: "2027-01-22T13:09:46Z",
  sha256: "70c5830a98573627081185dacf34055379f22a5ebcb81335092de4b15aab4206",
  sizeBytes: 64_337_832,
  released: "2026-11-25",
};
