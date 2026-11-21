import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DownloadPanel } from "@/components/download/DownloadPanel";
import type { DownloadableRelease } from "@/lib/release";

const release: DownloadableRelease = {
  version: "0.1.0",
  channel: "time-limited",
  url: "https://downloads.example.com/Briefnest-0.1.0-arm64.dmg",
  fileName: "Briefnest-0.1.0-arm64.dmg",
  sha256: "6d7564afe5c7a9c87a87f4537e31d4a7fa0ca18e698753d7219db32452f051dd",
  sizeBytes: 61_815_916,
  releasedOn: "2026-11-20",
  expiresAt: "2027-01-19T15:33:50.000Z",
};

describe("download panel", () => {
  beforeEach(() => vi.useFakeTimers({ toFake: ["Date"] }));
  afterEach(() => vi.useRealTimers());

  it("offers the build with its channel, size, checksum and expiry date", () => {
    vi.setSystemTime(new Date("2026-11-21T10:00:00Z"));
    render(<DownloadPanel release={release} />);

    expect(screen.getByRole("link", { name: "Download for Mac" })).toHaveAttribute("href", release.url);
    expect(screen.getByText("Time-limited build")).toBeVisible();
    expect(screen.getByText(/61\.8 MB/)).toBeVisible();
    expect(screen.getByText(/This build works until 19 January 2027, 15:33 UTC/)).toBeVisible();
    expect(screen.getByText(/59 days left/)).toBeVisible();
    expect(screen.getByText(release.sha256!)).toBeVisible();
  });

  it("withdraws the button once the build has expired, even on an older page", () => {
    vi.setSystemTime(new Date("2027-02-01T00:00:00Z"));
    render(<DownloadPanel release={release} />);

    expect(screen.queryByRole("link", { name: "Download for Mac" })).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("This build has expired.");
    expect(screen.queryByText(release.sha256!)).not.toBeInTheDocument();
  });

  it("doesn't mention an expiry for a build that never expires", () => {
    vi.setSystemTime(new Date("2026-11-21T10:00:00Z"));
    render(<DownloadPanel release={{ ...release, channel: "release", expiresAt: undefined }} />);

    expect(screen.getByRole("link", { name: "Download for Mac" })).toBeVisible();
    expect(screen.queryByText(/works until/)).not.toBeInTheDocument();
  });
});
