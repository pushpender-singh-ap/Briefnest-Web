import Link from "next/link";
import { Play } from "lucide-react";
import { FilmTrigger } from "@/components/video/FilmTrigger";
import { cta, nav } from "@/content/site";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";

/**
 * Sticky navigation. Clear at the top of the page and glass once you scroll; that change is a CSS
 * scroll-driven animation (see .site-header), so the bar itself needs no JavaScript.
 */
export function Header() {
  return (
    <header className="site-header fixed inset-x-0 top-0 z-40 border-b">
      <div className="container-wide flex h-[var(--header-h)] items-center gap-4">
        <div className="flex flex-1 items-center">
          <Logo />
        </div>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-full px-3.5 py-2 text-[0.9rem] font-medium tracking-[-0.01em] text-fog transition-colors duration-150 hover:bg-white/6 hover:text-paper"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-1 items-center justify-end gap-1.5 sm:gap-2">
          <FilmTrigger className="btn btn-ghost btn-sm hidden lg:inline-flex">
            <Play className="size-3.5 fill-current" aria-hidden="true" />
            {cta.film.nav}
          </FilmTrigger>
          <Link href={cta.primary.href} className="btn btn-primary btn-sm hidden min-[400px]:inline-flex">
            {cta.primary.label}
          </Link>
          <MobileMenu logo={<Logo />} />
        </div>
      </div>
    </header>
  );
}
