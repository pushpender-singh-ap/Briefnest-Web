"use client";

import { LazyMotion, MotionConfig } from "motion/react";
import type { ReactNode } from "react";

// The animation engine arrives in its own chunk after hydration, so it never delays first paint.
const loadFeatures = () => import("./motion-features").then((module) => module.default);

/**
 * One motion context for the site.
 * `reducedMotion="user"` drops transforms for people who ask their system for less motion; fades stay.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user" transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}
