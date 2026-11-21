"use client";

import { Check, Clock, Copy, Download } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { formatBytes, formatDate, formatInstant } from "@/lib/format";
import { daysLeft, isExpired, type DownloadableRelease } from "@/lib/release";

const CHANNEL_LABEL: Record<DownloadableRelease["channel"], string> = {
  release: "Release",
  beta: "Beta",
  "time-limited": "Time-limited build",
};

// The page is static, so "today" has to come from the visitor's clock, after hydration.
const subscribe = () => () => {};
const useNow = () => useSyncExternalStore(subscribe, () => Math.floor(Date.now() / 60_000), () => null);

/**
 * The download itself, for a configured release.
 * It states the build's channel and, for a time-limited build, exactly when it stops working, with the days left
 * counted on the visitor's clock. If that moment has passed since the site was built, the button is withdrawn.
 */
export function DownloadPanel({ release }: { release: DownloadableRelease }) {
  const minute = useNow();
  const now = minute === null ? null : new Date(minute * 60_000);
  const expired = now !== null && isExpired(release, now);
  const remaining = now !== null ? daysLeft(release, now) : undefined;

  return (
    <div className="grid gap-6">
      <h2 className="sr-only">Current build</h2>
      <div className="flex flex-wrap items-center gap-2">
        <span className="pill bg-teal-400/12 text-teal-300">Version {release.version}</span>
        <span className="pill">{CHANNEL_LABEL[release.channel]}</span>
        {release.releasedOn && <span className="pill">Released {formatDate(release.releasedOn)}</span>}
      </div>

      {expired ? (
        <div role="status" className="rounded-[var(--radius-card)] bg-app-orange/10 p-5 shadow-[inset_0_0_0_1px_rgb(254_145_45/0.4)]">
          <p className="font-semibold text-paper">This build has expired.</p>
          <p className="t-small mt-1.5 text-fog">
            Version {release.version} stopped working on {formatInstant(release.expiresAt!)}. A newer build hasn’t been published here yet. Anything you
            saved with it is still on your Mac and will open in the next build.
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <a href={release.url} className="btn btn-primary btn-lg" download>
            <Download className="size-[1.1rem]" aria-hidden="true" />
            Download for Mac
          </a>
          <p className="t-small text-mist">
            <span className="block text-fog">{release.fileName}</span>
            {release.sizeBytes ? `${formatBytes(release.sizeBytes)} · ` : ""}Disk image for Apple Silicon
          </p>
        </div>
      )}

      {release.expiresAt && !expired && (
        <div className="flex gap-3.5 rounded-[var(--radius-card)] bg-white/[0.045] p-5 shadow-[inset_0_0_0_1px_var(--line-strong)]">
          <Clock className="mt-0.5 size-5 shrink-0 text-app-orange" aria-hidden="true" />
          <div>
            <p className="font-semibold text-paper">
              This build works until {formatInstant(release.expiresAt)}
              {remaining !== undefined && (
                <span className="font-normal text-fog">
                  {" "}
                  ({remaining === 0 ? "its last day" : `${remaining} day${remaining === 1 ? "" : "s"} left`})
                </span>
              )}
              .
            </p>
            <p className="t-small mt-1.5 text-mist">
              The deadline is fixed when the build is made, so installing later doesn’t extend it. The app warns you during its last week. When it
              expires, your meetings, notes, actions and decisions stay on your Mac and open again in a current build.
            </p>
          </div>
        </div>
      )}

      {release.sha256 && !expired && <Checksum value={release.sha256} fileName={release.fileName} />}
    </div>
  );
}

function Checksum({ value, fileName }: { value: string; fileName: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2200);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      // Clipboard access can be refused; the value stays selectable on the page.
      setCopied(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h3 className="t-eyebrow is-plain text-dim">SHA-256 checksum</h3>
        <button type="button" onClick={copy} className="btn btn-ghost btn-sm">
          {copied ? <Check className="size-4 text-teal-300" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
          <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <p className="t-mono mt-2 rounded-xl bg-ink-950 p-4 leading-relaxed break-all text-fog shadow-[inset_0_0_0_1px_var(--line)] select-all">{value}</p>
      <p className="t-small mt-3 text-mist">
        To check your download, run <code className="t-mono rounded bg-white/8 px-1.5 py-0.5 text-fog">shasum -a 256 ~/Downloads/{fileName}</code> in Terminal and
        compare the result.
      </p>
    </div>
  );
}
