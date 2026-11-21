"use client";

import type { MouseEvent, ReactNode } from "react";
import { film } from "@/content/site";
import { useFilm } from "./FilmProvider";

interface FilmTriggerProps {
  children: ReactNode;
  className?: string;
  /** Called after the dialog opens, e.g. to close a menu the trigger sits in. */
  onOpen?: () => void;
}

/**
 * Opens the film. It is a real link to the video file, so it still works without JavaScript, with a
 * modified click (new tab) and for anyone who copies the address.
 */
export function FilmTrigger({ children, className, onOpen }: FilmTriggerProps) {
  const { open, prefetch } = useFilm();
  const file = film.sources[film.sources.length - 1].src;

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    open();
    onOpen?.();
  };

  return (
    <a
      href={file}
      className={className}
      aria-haspopup="dialog"
      onClick={onClick}
      onPointerEnter={prefetch}
      onFocus={prefetch}
      onTouchStart={prefetch}
    >
      {children}
    </a>
  );
}
