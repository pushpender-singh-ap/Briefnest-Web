"use client";

import dynamic from "next/dynamic";
import { X } from "lucide-react";
import { createContext, use, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { film } from "@/content/site";

interface FilmContextValue {
  /** Opens the film in the dialog and starts it. */
  open: () => void;
  isOpen: boolean;
  /** Fetches the player's code ahead of the click, so playback can start inside the user gesture. */
  prefetch: () => void;
}

const FilmContext = createContext<FilmContextValue | null>(null);

export function useFilm(): FilmContextValue {
  const value = use(FilmContext);
  if (!value) throw new Error("useFilm must be used inside <FilmProvider>");
  return value;
}

const loadPlayer = () => import("./FilmPlayer").then((module) => module.FilmPlayer);

// The player is only needed once someone asks to watch, so it stays out of the page's first load.
const FilmPlayer = dynamic(loadPlayer, {
  ssr: false,
  loading: () => (
    <div
      className="grid aspect-video w-full place-items-center rounded-[var(--radius-plate)] bg-black bg-cover bg-center"
      style={{ backgroundImage: `url(${film.posterFile})` }}
      role="status"
    >
      <span className="size-10 animate-spin rounded-full border-2 border-white/25 border-t-white" />
      <span className="sr-only">Loading the film</span>
    </div>
  ),
});

/** Provides the film dialog to the whole site. Every "Watch" control opens the same player. */
export function FilmProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);

  const open = useCallback(() => setOpen(true), []);
  const prefetch = useCallback(() => void loadPlayer(), []);
  const value = useMemo(() => ({ open, isOpen, prefetch }), [open, isOpen, prefetch]);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (isOpen && !element.open) element.showModal();
    if (!isOpen && element.open) element.close();
  }, [isOpen]);

  return (
    <FilmContext value={value}>
      {children}
      {/* A native dialog: focus is trapped and restored, Escape closes it, and the page behind is inert. */}
      <dialog
        ref={dialog}
        className="film-dialog"
        aria-labelledby="film-dialog-title"
        onClose={() => setOpen(false)}
        onClick={(event) => {
          // A click on the dimmed area, not on the player.
          if (event.target === event.currentTarget) setOpen(false);
        }}
      >
        <div className="film-dialog-panel">
          <div className="mb-3 flex items-center justify-between gap-4">
            <h2 id="film-dialog-title" className="t-eyebrow">
              The Briefnest film · 1 min
            </h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid size-11 cursor-pointer place-items-center rounded-full bg-white/8 text-paper transition-colors hover:bg-white/16"
              aria-label="Close the film"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>
          {/* Mounted only while open: closing stops playback and releases the video. */}
          {isOpen && <FilmPlayer autoPlay />}
        </div>
      </dialog>
    </FilmContext>
  );
}
