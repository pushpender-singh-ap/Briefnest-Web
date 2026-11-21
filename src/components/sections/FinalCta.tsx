import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { Headline } from "@/components/ui/Headline";
import { Picture } from "@/components/ui/Picture";
import { Reveal } from "@/components/ui/Reveal";
import { FilmTrigger } from "@/components/video/FilmTrigger";
import { closing } from "@/content/home";
import { brand, cta, product } from "@/content/site";

/** Section 14. The close: the icon, the line, and the two things to do next. */
export function FinalCta() {
  return (
    <section aria-labelledby="closing-title" className="relative isolate overflow-hidden py-[clamp(6rem,12vw,11rem)]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="mask-fade-y absolute inset-0 overflow-hidden opacity-75">
          <Picture id="field" alt="" sizes="100vw" className="drift block size-full" imgClassName="size-full object-cover object-[55%_65%]" />
        </div>
        <div className="aurora-low absolute inset-0" />
      </div>

      <div className="container-page text-center">
        <Reveal>
          <div className="relative mx-auto size-[clamp(6.5rem,12vw,9rem)]">
            <div aria-hidden="true" className="absolute inset-[8%] rounded-[28%] bg-[radial-gradient(circle,rgb(124_140_255/0.55),transparent_70%)] blur-2xl" />
            <Picture id="icon" alt="The Briefnest app icon" sizes="(min-width: 1024px) 144px, 104px" className="relative block" />
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mt-8">
            <span className="t-eyebrow is-plain">{brand.supporting}</span>
          </p>
          <h2 id="closing-title" className="t-h2 mx-auto mt-5 max-w-[11.2em]">
            <Headline {...closing.headline} />
          </h2>
          <p className="t-lead mx-auto mt-6 max-w-xl">{closing.line}</p>
        </Reveal>
        <Reveal delay={0.16}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link href={cta.primary.href} className="btn btn-primary btn-lg">
              {cta.primary.label}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <FilmTrigger className="btn btn-secondary btn-lg">
              <Play className="size-4 fill-current" aria-hidden="true" />
              {cta.film.closing}
            </FilmTrigger>
          </div>
          <p className="t-mono mt-6 text-dim">
            {product.minimumOSLong} · {product.chip}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
