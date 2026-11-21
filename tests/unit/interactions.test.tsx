import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SourceExplorer } from "@/components/sections/SourceExplorer";
import { FilmPlayer } from "@/components/video/FilmPlayer";

describe("answer sources", () => {
  it("opens the source a sentence points at and closes the other", async () => {
    const user = userEvent.setup();
    render(<SourceExplorer />);

    const first = screen.getByRole("button", { name: /Sprint Planning · Mira · 00:12/ });
    const second = screen.getByRole("button", { name: /Payment retry policy · v2/ });
    expect(first).toHaveAttribute("aria-expanded", "true");
    expect(second).toHaveAttribute("aria-expanded", "false");

    await user.click(screen.getByRole("button", { name: /\[S2\]\s*show where this came from/ }));
    expect(first).toHaveAttribute("aria-expanded", "false");
    expect(second).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("region", { name: "Decision: Payment retry policy · v2" })).toHaveTextContent("Retry failed payments at most three times.");
  });
});

describe("film player", () => {
  beforeEach(() => {
    // jsdom has no media pipeline; stand in for the two calls the player makes.
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
  });

  it("labels every control and describes its keyboard shortcuts", () => {
    render(<FilmPlayer />);
    const player = screen.getByRole("group", { name: /Video player: Briefnest/ });
    expect(player).toHaveAccessibleDescription(/Space or K plays and pauses/);

    for (const name of ["Play the film", "Play", "Mute", "Turn captions on", "Full screen"]) {
      expect(within(player).getByRole("button", { name })).toBeInTheDocument();
    }
    expect(within(player).getByRole("slider", { name: "Seek" })).toHaveAttribute("aria-valuetext", "0 seconds of 1 minute");
    expect(within(player).getByRole("slider", { name: "Volume" })).toHaveAttribute("aria-valuetext", "100 percent");
  });

  it("offers the film in the configured order, with English captions", () => {
    const { container } = render(<FilmPlayer />);
    const sources = [...container.querySelectorAll("video source")].map((source) => source.getAttribute("src"));
    expect(sources).toEqual(["/videos/briefnest-film-720p.mp4", "/videos/briefnest-film-1080p.av1.mp4", "/videos/briefnest-film-1080p.mp4"]);
    expect(container.querySelector("video source")).toHaveAttribute("media", "(max-width: 767px)");
    expect(container.querySelector("track")).toHaveAttribute("srclang", "en");
    expect(container.querySelector("video")).not.toHaveAttribute("autoplay");
    expect(container.querySelector("video")).toHaveAttribute("poster", "/videos/briefnest-film-poster.jpg");
  });

  it("plays and pauses from the keyboard and reflects the video's own events", async () => {
    const user = userEvent.setup();
    const { container } = render(<FilmPlayer />);
    const video = container.querySelector("video")!;
    const player = screen.getByRole("group", { name: /Video player/ });

    player.focus();
    await user.keyboard("k");
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);

    fireEvent.play(video);
    expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Play the film" })).not.toBeInTheDocument();

    fireEvent.pause(video);
    expect(screen.getByRole("button", { name: "Resume the film" })).toBeInTheDocument();
  });

  it("toggles captions and mute with C and M", async () => {
    const user = userEvent.setup();
    const { container } = render(<FilmPlayer />);
    const video = container.querySelector("video")!;
    screen.getByRole("group", { name: /Video player/ }).focus();

    await user.keyboard("c");
    expect(screen.getByRole("button", { name: "Turn captions off" })).toBeInTheDocument();

    await user.keyboard("m");
    expect(video.muted).toBe(true);
    fireEvent.volumeChange(video);
    expect(screen.getByRole("button", { name: "Unmute" })).toBeInTheDocument();
  });

  it("explains a failed load and offers the file directly", () => {
    const { container } = render(<FilmPlayer />);
    fireEvent.error(container.querySelector("video")!);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("The film didn’t load.");
    expect(within(alert).getByRole("link", { name: "Open the video file" })).toHaveAttribute("href", "/videos/briefnest-film-1080p.mp4");
  });
});
