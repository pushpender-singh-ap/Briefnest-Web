import type { Metadata, Viewport } from "next";
import type { CSSProperties } from "react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MotionProvider } from "@/components/ui/MotionProvider";
import { RevealController } from "@/components/ui/RevealController";
import { FilmProvider } from "@/components/video/FilmProvider";
import { brand, deployment } from "@/content/site";
import { fontFaces, fontVariables } from "@/lib/fonts";
import { defaultTitle } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: deployment.origin ? new URL(deployment.origin) : undefined,
  title: { default: defaultTitle, template: `%s · ${brand.name}` },
  description: brand.description,
  applicationName: brand.name,
  // Previews, and builds that don't know their own address, stay out of search results.
  robots: deployment.indexable ? { index: true, follow: true } : { index: false, follow: false },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#0b1017",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={fontVariables} style={fontFaces as CSSProperties}>
      <head>
        {/* The two scripted scenes start in their "before" state; without script, show their finished state. */}
        <noscript>
          <style>{`.scene-chip,.js-motion{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body className="grain">
        <a
          href="#main"
          className="btn btn-primary btn-sm fixed top-3 left-3 z-[60] -translate-y-20 focus-visible:translate-y-0"
        >
          Skip to content
        </a>
        <RevealController />
        <MotionProvider>
          <FilmProvider>
            <Header />
            <main id="main" tabIndex={-1} className="relative z-[1] outline-none">
              {children}
            </main>
            <Footer />
          </FilmProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
