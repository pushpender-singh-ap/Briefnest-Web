"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * One observer for every <Reveal> on the page.
 *
 * After each navigation it looks at the reveals once. Anything already on screen, or above it, is left alone,
 * so first paint is never held back. Anything below the fold is hidden (before anyone can see it) and shown
 * again as it scrolls into view.
 */
export function RevealController() {
  const pathname = usePathname();

  useEffect(() => {
    const fold = window.innerHeight;
    const waiting = new Set<HTMLElement>();
    const show = (element: HTMLElement) => {
      element.classList.remove("reveal-wait");
      waiting.delete(element);
    };
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          show(entry.target as HTMLElement);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );

    for (const element of document.querySelectorAll<HTMLElement>("[data-reveal]:not(.reveal-wait)")) {
      if (element.getBoundingClientRect().top < fold) continue;
      element.classList.add("reveal-wait");
      waiting.add(element);
      observer.observe(element);
    }

    return () => {
      observer.disconnect();
      // Never leave content hidden behind an observer that is gone.
      for (const element of [...waiting]) show(element);
    };
  }, [pathname]);

  return null;
}
