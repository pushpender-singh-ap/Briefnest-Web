import Link from "next/link";
import { Play } from "lucide-react";
import { FilmTrigger } from "@/components/video/FilmTrigger";
import { brand, cta, deployment, example, footerNav, product } from "@/content/site";
import { Logo } from "./Logo";

export function Footer() {
  const year = new Date().getUTCFullYear();
  return (
    <footer className="relative border-t border-white/8 bg-ink-950">
      <div className="container-page py-14 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.25fr_2fr]">
          <div>
            <Logo />
            <p className="mt-5 max-w-xs text-[1.05rem] leading-snug tracking-[-0.015em] text-fog">{brand.tagline}</p>
            <p className="t-small mt-4 max-w-xs text-mist">
              A native app for {product.minimumOSLong} on {product.chip}.
            </p>
            <FilmTrigger className="link t-small mt-6 inline-flex items-center gap-2">
              <Play className="size-3 fill-current" aria-hidden="true" />
              {cta.film.hero}
            </FilmTrigger>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3">
            {footerNav.map((group) => (
              <div key={group.title}>
                <h2 className="t-eyebrow is-plain">{group.title}</h2>
                <ul className="mt-4 grid gap-1">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="inline-flex min-h-11 items-center text-[0.95rem] text-fog transition-colors hover:text-paper sm:min-h-9">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                  {group.title === "Trust" && deployment.repositoryUrl && (
                    <li>
                      <a href={deployment.repositoryUrl} className="inline-flex min-h-11 items-center text-[0.95rem] text-fog transition-colors hover:text-paper sm:min-h-9">
                        Source
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-14 grid gap-3 border-t border-white/8 pt-8 text-[0.8125rem] leading-relaxed text-dim">
          <p>
            © {year} {brand.name}. {example.note}
          </p>
          <p>
            Mac and macOS are trademarks of Apple Inc. GitHub, GitLab, Claude Code, Codex and other product names belong to their owners;
            Briefnest is not affiliated with or endorsed by them.
          </p>
        </div>
      </div>
    </footer>
  );
}
