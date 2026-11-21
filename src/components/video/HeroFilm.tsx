"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { film } from "@/content/site";
import { cn } from "@/lib/cn";
import { useFilm } from "./FilmProvider";

interface HeroFilmProps {
  /** The poster, rendered on the server so it paints with the page. */
  poster: ReactNode;
  className?: string;
}

interface NetworkInformation {
  saveData?: boolean;
  effectiveType?: string;
}

/** Below this width the frame is too small to read the film's titles, so a phone keeps the poster and its data. */
const PREVIEW_MIN_WIDTH = "(min-width: 640px)";

/**
 * The hero's film frame.
 *
 * It shows the poster at once. Once the page has loaded and the frame is on screen, a silent copy of the
 * film fades in behind the play button. That preview never starts for people who prefer reduced motion,
 * have Data Saver on or are on a slow connection, and never on phone-sized screens. It pauses when scrolled
 * away and has its own pause control. The play button opens the full film, with sound, in the dialog.
 */
export function HeroFilm({ poster, className }: HeroFilmProps) {
  const { open, isOpen, prefetch } = useFilm();
  const frame = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [allowed, setAllowed] = useState(false);
  const [inView, setInView] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [visible, setVisible] = useState(false);

  // Decide once, after load, whether a moving preview is welcome here.
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const roomy = window.matchMedia(PREVIEW_MIN_WIDTH);
    const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
    const frugal = connection?.saveData === true || /(^|-)2g$|^3g$/.test(connection?.effectiveType ?? "");
    const decide = () => setAllowed(!reduced.matches && roomy.matches && !frugal);
    const start = () => (window.requestIdleCallback ? window.requestIdleCallback(decide, { timeout: 1500 }) : setTimeout(decide, 300));

    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    reduced.addEventListener("change", decide);
    roomy.addEventListener("change", decide);
    return () => {
      window.removeEventListener("load", start);
      reduced.removeEventListener("change", decide);
      roomy.removeEventListener("change", decide);
    };
  }, []);

  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.35 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const shouldPlay = allowed && inView && !userPaused && !isOpen;

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    if (shouldPlay) element.play().catch(() => setVisible(false));
    else element.pause();
  }, [shouldPlay]);

  const file = film.sources[film.sources.length - 1].src;
  const onWatch = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    open();
  };

  return (
    <div ref={frame} className={cn("group/film relative", className)}>
      <div className="plate relative aspect-video bg-ink-950">
        {poster}

        {allowed && (
          <video
            ref={video}
            className={cn(
              "absolute inset-0 size-full object-cover transition-opacity duration-700 ease-out",
              visible ? "opacity-100" : "opacity-0",
            )}
            muted
            loop
            playsInline
            preload="none"
            aria-hidden="true"
            tabIndex={-1}
            disablePictureInPicture
            onPlaying={() => setVisible(true)}
          >
            {film.preview.map((source) => (
              <source key={source.src} src={source.src} type={source.type} />
            ))}
          </video>
        )}

        {/* Bottom shade so the controls read over any frame of the film. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent" />

        <a
          href={file}
          onClick={onWatch}
          onPointerEnter={prefetch}
          onFocus={prefetch}
          onTouchStart={prefetch}
          aria-haspopup="dialog"
          className="absolute inset-0 z-[3] flex items-end rounded-[inherit] p-3 focus-visible:outline-offset-[-6px] sm:p-5 lg:p-7"
        >
          <span className="sr-only">Watch the Briefnest film, one minute, with sound</span>
          <span
            aria-hidden="true"
            className="flex origin-bottom-left items-center gap-3 rounded-full bg-ink-950/60 py-1.5 pr-4 pl-1.5 text-paper shadow-[0_20px_60px_-15px_rgb(0_0_0/0.9)] ring-1 ring-white/15 backdrop-blur-md transition-[transform,background-color] duration-300 ease-[var(--ease-out-quint)] group-hover/film:scale-[1.04] group-hover/film:bg-ink-950/75 sm:gap-4 sm:py-2.5 sm:pr-7 sm:pl-2.5"
          >
            <span className="grid size-10 place-items-center rounded-full bg-paper text-ink-950 sm:size-14">
              <Play className="ml-0.5 size-[1.1rem] fill-current sm:size-6" />
            </span>
            <span className="text-left">
              <span className="block text-[0.95rem] leading-tight font-semibold tracking-[-0.015em] sm:text-[1.05rem]">Watch the film</span>
              <span className="t-mono mt-0.5 block text-label">1:00 · with sound</span>
            </span>
          </span>
        </a>

        {allowed && (
          <button
            type="button"
            onClick={() => setUserPaused((paused) => !paused)}
            aria-label={userPaused ? "Play the silent preview" : "Pause the silent preview"}
            title={userPaused ? "Play the silent preview" : "Pause the silent preview"}
            className="absolute right-3 bottom-3 z-[4] grid size-11 cursor-pointer place-items-center rounded-full bg-ink-950/55 text-paper ring-1 ring-white/15 backdrop-blur-md transition-colors hover:bg-ink-950/80 sm:right-4 sm:bottom-4"
          >
            {userPaused ? <Play className="ml-0.5 size-4 fill-current" aria-hidden="true" /> : <Pause className="size-4 fill-current" aria-hidden="true" />}
          </button>
        )}
      </div>
    </div>
  );
}
