"use client";

import { Captions, CaptionsOff, Maximize, Minimize, Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { film } from "@/content/site";
import { cn } from "@/lib/cn";
import { formatClock, spokenClock } from "@/lib/format";

interface FilmPlayerProps {
  /** Start playing as soon as the player mounts. Only ever set after a click, so sound is allowed. */
  autoPlay?: boolean;
  className?: string;
}

/** Fullscreen on iPhone lives on the video element, not on the Fullscreen API. */
type IOSVideo = HTMLVideoElement & { webkitEnterFullscreen?: () => void };

const HIDE_AFTER_MS = 2600;
const SEEK_STEP = 5;

/**
 * Keeps the caption track loaded and firing cue events without the browser drawing it. The player draws the
 * cue text itself, above its controls, so captions look the same in every browser.
 */
function listenForCues(element: HTMLVideoElement | null, onCue: (text: string) => void): () => void {
  const track = element?.textTracks?.[0];
  if (!track) return () => {};
  track.mode = "hidden";
  const update = () => onCue((track.activeCues?.[0] as VTTCue | undefined)?.text ?? "");
  track.addEventListener("cuechange", update);
  return () => track.removeEventListener("cuechange", update);
}

/**
 * The film player: the approved launch film with its own quiet controls.
 * Play/pause, scrubbing, volume, captions and fullscreen, by pointer, touch or keyboard
 * (Space or K, ←/→, ↑/↓, M, C, F, Home, End).
 */
export function FilmPlayer({ autoPlay = false, className }: FilmPlayerProps) {
  const container = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const helpId = useId();

  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [ended, setEnded] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [failed, setFailed] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState<number>(film.durationSeconds);
  const [buffered, setBuffered] = useState(0);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [captions, setCaptions] = useState(false);
  const [cue, setCue] = useState("");
  const [fullscreen, setFullscreen] = useState(false);
  const [controls, setControls] = useState(true);

  const wake = useCallback(() => {
    setControls(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      const element = video.current;
      // Stay visible while paused, or while someone is using the controls with the keyboard.
      if (!element || element.paused || container.current?.querySelector("[data-controls]:focus-within")) return;
      setControls(false);
    }, HIDE_AFTER_MS);
  }, []);

  const play = useCallback(() => {
    // If the browser refuses (no user gesture yet), the film stays paused behind its large play button.
    video.current?.play().catch(() => {});
  }, []);

  const toggle = useCallback(() => {
    const element = video.current;
    if (!element) return;
    if (element.paused || element.ended) play();
    else element.pause();
    wake();
  }, [play, wake]);

  const seekTo = useCallback(
    (seconds: number) => {
      const element = video.current;
      if (!element) return;
      const limit = Number.isFinite(element.duration) ? element.duration : duration;
      element.currentTime = Math.min(Math.max(seconds, 0), limit);
      setTime(element.currentTime);
      wake();
    },
    [duration, wake],
  );

  const changeVolume = useCallback(
    (next: number) => {
      const element = video.current;
      if (!element) return;
      const value = Math.min(Math.max(next, 0), 1);
      element.volume = value;
      element.muted = value === 0;
      wake();
    },
    [wake],
  );

  const toggleMute = useCallback(() => {
    const element = video.current;
    if (!element) return;
    element.muted = !element.muted;
    if (!element.muted && element.volume === 0) element.volume = 0.6;
    wake();
  }, [wake]);

  const toggleFullscreen = useCallback(() => {
    const box = container.current;
    const element = video.current as IOSVideo | null;
    if (!box || !element) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else if (box.requestFullscreen) void box.requestFullscreen().catch(() => element.webkitEnterFullscreen?.());
    else element.webkitEnterFullscreen?.();
    wake();
  }, [wake]);

  // The current cue is tracked the whole time, so captions appear mid-sentence the moment they are turned on.
  useEffect(() => listenForCues(video.current, setCue), []);

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === container.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  useEffect(() => {
    const timer = hideTimer;
    return () => clearTimeout(timer.current);
  }, []);

  // Opened from a "Watch" control: put focus on the player, so Space, the arrows, C, M and F work at once.
  useEffect(() => {
    if (autoPlay) container.current?.focus({ preventScroll: true });
  }, [autoPlay]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    const target = event.target as HTMLElement;
    const onSlider = target instanceof HTMLInputElement;
    const onButton = target instanceof HTMLButtonElement || target instanceof HTMLAnchorElement;
    const key = event.key.toLowerCase();

    if (key === " " || key === "k") {
      // Space on a focused button already activates that button.
      if (key === " " && (onButton || onSlider)) return;
      event.preventDefault();
      toggle();
    } else if (key === "arrowright" && !onSlider) {
      event.preventDefault();
      seekTo((video.current?.currentTime ?? 0) + SEEK_STEP);
    } else if (key === "arrowleft" && !onSlider) {
      event.preventDefault();
      seekTo((video.current?.currentTime ?? 0) - SEEK_STEP);
    } else if (key === "arrowup" && !onSlider) {
      event.preventDefault();
      changeVolume((video.current?.volume ?? 1) + 0.1);
    } else if (key === "arrowdown" && !onSlider) {
      event.preventDefault();
      changeVolume((video.current?.volume ?? 1) - 0.1);
    } else if (key === "home" && !onSlider) {
      event.preventDefault();
      seekTo(0);
    } else if (key === "end" && !onSlider) {
      event.preventDefault();
      seekTo(duration);
    } else if (key === "m") {
      toggleMute();
    } else if (key === "c") {
      setCaptions((on) => !on);
      wake();
    } else if (key === "f") {
      toggleFullscreen();
    } else {
      return;
    }
  };

  // Touch: the first tap brings the controls back; a tap with them showing toggles playback.
  const onSurfacePointerUp = (event: PointerEvent<HTMLVideoElement>) => {
    if (event.pointerType === "touch" && playing && !controls) {
      wake();
      return;
    }
    toggle();
  };

  const retry = () => {
    setFailed(false);
    video.current?.load();
    play();
  };

  const progress = duration > 0 ? (time / duration) * 100 : 0;
  const loaded = duration > 0 ? (buffered / duration) * 100 : 0;
  const showControls = controls || !playing;
  const fallbackFile = film.sources[film.sources.length - 1].src;

  return (
    <div
      ref={container}
      role="group"
      aria-label={`Video player: ${film.title}`}
      aria-describedby={helpId}
      tabIndex={-1}
      onKeyDown={onKeyDown}
      onPointerMove={wake}
      data-controls-visible={showControls}
      className={cn(
        "film-player group/player relative isolate aspect-video w-full overflow-hidden rounded-[var(--radius-plate)] bg-black outline-none",
        !showControls && "cursor-none",
        className,
      )}
    >
      <p id={helpId} className="sr-only">
        Keyboard: Space or K plays and pauses. Left and right arrows move five seconds. Up and down arrows change the
        volume. M mutes, C turns captions on or off, F enters full screen.
      </p>

      <video
        ref={video}
        className="absolute inset-0 size-full object-contain"
        playsInline
        // Set only after a click on a "Watch" control, so the browser starts the film with sound by itself.
        autoPlay={autoPlay}
        preload={autoPlay ? "auto" : "metadata"}
        poster={film.posterFile}
        onPointerUp={onSurfacePointerUp}
        onPlay={() => {
          setPlaying(true);
          setStarted(true);
          setEnded(false);
          wake();
        }}
        onPause={() => {
          setPlaying(false);
          setControls(true);
        }}
        onEnded={() => {
          setEnded(true);
          setPlaying(false);
          setControls(true);
        }}
        onWaiting={() => setWaiting(true)}
        onPlaying={() => setWaiting(false)}
        onCanPlay={() => setWaiting(false)}
        onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
        onDurationChange={(event) => {
          if (Number.isFinite(event.currentTarget.duration)) setDuration(event.currentTarget.duration);
        }}
        onProgress={(event) => {
          const ranges = event.currentTarget.buffered;
          if (ranges.length) setBuffered(ranges.end(ranges.length - 1));
        }}
        onVolumeChange={(event) => {
          setMuted(event.currentTarget.muted);
          setVolume(event.currentTarget.volume);
        }}
        onError={() => setFailed(true)}
      >
        {film.sources.map((source) => (
          <source key={source.src} src={source.src} type={source.type} media={"media" in source ? source.media : undefined} />
        ))}
        {film.captions.map((track) => (
          <track key={track.src} kind="captions" src={track.src} srcLang={track.srcLang} label={track.label} />
        ))}
      </video>

      {/* Captions */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-x-0 z-10 flex justify-center px-6 transition-[bottom] duration-300 ease-[var(--ease-out-quint)]",
          showControls ? "bottom-[4.75rem]" : "bottom-6",
        )}
      >
        {captions && cue && (
          <p className="max-w-[46ch] whitespace-pre-line rounded-md bg-ink-950/85 px-3 py-1.5 text-center text-[clamp(0.85rem,1.6vw,1.2rem)] leading-snug font-medium text-paper">
            {cue}
          </p>
        )}
      </div>

      {/* Buffering */}
      {waiting && playing && !failed && (
        <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center" role="status">
          <span className="size-10 animate-spin rounded-full border-2 border-white/25 border-t-white" />
          <span className="sr-only">Buffering</span>
        </div>
      )}

      {/* Big play / replay, whenever the film isn't running */}
      {!playing && !failed && (
        <button
          type="button"
          onClick={toggle}
          className="absolute inset-0 z-10 grid cursor-pointer place-items-center bg-ink-950/25 transition-colors duration-300 hover:bg-ink-950/15"
          aria-label={ended ? "Replay the film" : started ? "Resume the film" : "Play the film"}
        >
          <span className="grid size-[clamp(3.75rem,8vw,5.5rem)] place-items-center rounded-full bg-paper text-ink-950 shadow-[0_18px_50px_-12px_rgb(0_0_0/0.8)] transition-transform duration-300 ease-[var(--ease-out-quint)] group-hover/player:scale-105">
            {ended ? <RotateCcw className="size-[38%]" aria-hidden="true" /> : <Play className="ml-[6%] size-[38%] fill-current" aria-hidden="true" />}
          </span>
        </button>
      )}

      {failed && (
        <div className="absolute inset-0 z-20 grid place-items-center bg-ink-950/90 p-6 text-center" role="alert">
          <div>
            <p className="t-h4 text-paper">The film didn’t load.</p>
            <p className="t-small mt-2 text-mist">Check your connection and try again, or open the video file directly.</p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <button type="button" className="btn btn-primary btn-sm" onClick={retry}>
                Try again
              </button>
              <a className="btn btn-secondary btn-sm" href={fallbackFile}>
                Open the video file
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div
        data-controls
        className={cn(
          "absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-ink-950/95 via-ink-950/60 to-transparent px-3 pt-10 pb-2.5 transition-opacity duration-300 sm:px-4",
          showControls ? "opacity-100" : "pointer-events-none opacity-0 focus-within:pointer-events-auto focus-within:opacity-100",
        )}
        onFocus={wake}
      >
        <div className="film-seek relative h-5">
          <div className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 overflow-hidden rounded-full bg-white/20">
            <div className="absolute inset-y-0 left-0 bg-white/25" style={{ width: `${loaded}%` }} />
            <div className="absolute inset-y-0 left-0 bg-teal-400" style={{ width: `${progress}%` }} />
          </div>
          <input
            type="range"
            min={0}
            max={duration}
            step={0.1}
            value={time}
            onChange={(event) => seekTo(Number(event.currentTarget.value))}
            aria-label="Seek"
            aria-valuetext={`${spokenClock(time)} of ${spokenClock(duration)}`}
            className="film-range absolute inset-0 w-full"
          />
        </div>

        <div className="mt-0.5 flex items-center gap-1 text-paper sm:gap-1.5">
          <ControlButton label={playing ? "Pause" : ended ? "Replay" : "Play"} onClick={toggle}>
            {playing ? <Pause className="size-5 fill-current" /> : ended ? <RotateCcw className="size-5" /> : <Play className="size-5 fill-current" />}
          </ControlButton>

          <ControlButton label={muted || volume === 0 ? "Unmute" : "Mute"} onClick={toggleMute}>
            {muted || volume === 0 ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
          </ControlButton>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={muted ? 0 : volume}
            onChange={(event) => changeVolume(Number(event.currentTarget.value))}
            aria-label="Volume"
            aria-valuetext={`${Math.round((muted ? 0 : volume) * 100)} percent`}
            className="film-range film-volume hidden w-20 [@media(hover:hover)]:sm:block"
            style={{ ["--fill" as string]: `${(muted ? 0 : volume) * 100}%` }}
          />

          <span className="tabular ml-1.5 text-[0.8rem] text-fog select-none" aria-hidden="true">
            {formatClock(time)} <span className="text-dim">/ {formatClock(duration)}</span>
          </span>

          <span className="flex-1" />

          <ControlButton
            label={captions ? "Turn captions off" : "Turn captions on"}
            onClick={() => {
              setCaptions((on) => !on);
              wake();
            }}
          >
            {captions ? <Captions className="size-5" /> : <CaptionsOff className="size-5" />}
          </ControlButton>
          <ControlButton label={fullscreen ? "Exit full screen" : "Full screen"} onClick={toggleFullscreen}>
            {fullscreen ? <Minimize className="size-5" /> : <Maximize className="size-5" />}
          </ControlButton>
        </div>
      </div>
    </div>
  );
}

/** Each control names what pressing it will do, so the label alone carries the state. */
function ControlButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid size-11 cursor-pointer place-items-center rounded-full text-paper/90 transition-colors duration-150 hover:bg-white/12 hover:text-paper [&>svg]:pointer-events-none"
    >
      {children}
    </button>
  );
}
