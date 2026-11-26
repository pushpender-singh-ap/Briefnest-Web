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

export const releaseVersion = "0.2.0";
export const releasesUrl = "https://github.com/pushpender-singh-ap/Briefnest-Web/releases";

export const publishedRelease: PublishedRelease | null = {
  url: `${releasesUrl}/download/v${releaseVersion}/Briefnest-${releaseVersion}-arm64.dmg`,
  expires: "2026-12-25T17:15:19Z",
  sha256: "b165cffacecc1f69f846cba4792f8d73cc8a342b5f8c38b6eb18d6223c4cb8af",
  sizeBytes: 70_827_519,
  released: "2026-11-26",
};
