"use client";

import Link from "next/link";
import { Menu, Play, X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { FilmTrigger } from "@/components/video/FilmTrigger";
import { cta, nav } from "@/content/site";

/**
 * Navigation for small screens: a menu button that opens a full-height sheet.
 * A native dialog, so focus stays inside it, Escape closes it and focus returns to the button.
 */
export function MobileMenu({ logo }: { logo: ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open]);

  // If the window grows past the breakpoint while the sheet is open, put the desktop navigation back.
  useEffect(() => {
    const wide = window.matchMedia("(min-width: 1024px)");
    const onChange = () => wide.matches && setOpen(false);
    wide.addEventListener("change", onChange);
    return () => wide.removeEventListener("change", onChange);
  }, []);

  const close = () => setOpen(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="grid size-11 cursor-pointer place-items-center rounded-full text-paper transition-colors hover:bg-white/8"
      >
        <span className="sr-only">Open menu</span>
        <Menu className="size-[1.35rem]" aria-hidden="true" />
      </button>

      <dialog
        ref={dialog}
        id="mobile-menu"
        className="menu-dialog"
        aria-label="Menu"
        onClose={close}
        onClick={(event) => event.target === event.currentTarget && close()}
      >
        <div className="menu-sheet flex h-full flex-col bg-ink-900/96 backdrop-blur-xl">
          <div className="container-page flex h-[var(--header-h)] shrink-0 items-center justify-between">
            <span onClick={close}>{logo}</span>
            <button
              type="button"
              onClick={close}
              className="grid size-11 cursor-pointer place-items-center rounded-full text-paper transition-colors hover:bg-white/8"
            >
              <span className="sr-only">Close menu</span>
              <X className="size-[1.35rem]" aria-hidden="true" />
            </button>
          </div>

          <nav aria-label="Main" className="container-page flex-1 overflow-y-auto pt-6 pb-8">
            <ul className="divide-y divide-white/8 border-y border-white/8">
              {nav.map((item, index) => (
                <li key={item.href} className="menu-item" style={{ ["--i" as string]: index }}>
                  <Link
                    href={item.href}
                    onClick={close}
                    className="flex min-h-14 items-center justify-between py-3 text-[1.6rem] font-medium tracking-[-0.035em] text-paper"
                  >
                    {item.label}
                    <span aria-hidden="true" className="t-mono text-dim">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="menu-item mt-8 grid gap-3" style={{ ["--i" as string]: nav.length }}>
              <Link href={cta.primary.href} onClick={close} className="btn btn-primary btn-lg w-full">
                {cta.primary.label}
              </Link>
              <FilmTrigger className="btn btn-secondary btn-lg w-full" onOpen={close}>
                <Play className="size-4 fill-current" aria-hidden="true" />
                {cta.film.nav}
              </FilmTrigger>
            </div>
          </nav>
        </div>
      </dialog>
    </div>
  );
}
