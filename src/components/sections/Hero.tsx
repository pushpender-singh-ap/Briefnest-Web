import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { Picture } from "@/components/ui/Picture";
import { FilmTrigger } from "@/components/video/FilmTrigger";
import { HeroFilm } from "@/components/video/HeroFilm";
import { hero } from "@/content/home";
import { cta, product } from "@/content/site";

/**
 * Section 1. The headline, then the film as the centrepiece.
 * The entrance is CSS only (.rise, .settle), so it starts with the first paint rather than after hydration.
 */
export function Hero() {
  return (
    <section className="relative isolate overflow-hidden pt-[calc(var(--header-h)+clamp(2.75rem,6vw,6rem))] pb-[clamp(3.5rem,7vw,7rem)]">
      {/* Stage lighting: the film's own field art, drifting slowly, under two aurora washes. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="mask-fade-y absolute inset-x-0 bottom-0 h-[78%] overflow-hidden opacity-80">
          {/* The largest element in the first viewport, so it is fetched with the page rather than lazily. */}
          <Picture id="field" alt="" sizes="100vw" priority className="drift block size-full" imgClassName="size-full object-cover object-[60%_70%]" />
        </div>
        <div className="aurora absolute inset-0" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink-900 to-transparent" />
      </div>

      <div className="container-wide text-center">
        <p className="t-eyebrow is-plain rise" style={{ ["--i" as string]: 0 }}>
          {hero.eyebrow}
        </p>

        <h1
          className="rise-solid mx-auto mt-6 max-w-[12.4em] font-display text-[clamp(2.55rem,1rem+5.4vw,5.5rem)] leading-[0.98] font-[540] tracking-[-0.048em] text-paper xl:max-w-none"
          style={{ ["--i" as string]: 1 }}
        >
          {hero.headline.lines.map((line, index) => (
            <span key={line.join(" ")} className="xl:block">
              {line.map((sentence) => (
                <span key={sentence}>
                  {/* Sentences never break inside themselves, so narrow screens get one per line. */}
                  <span className="inline-block whitespace-nowrap">{sentence}</span>{" "}
                </span>
              ))}
              {index === hero.headline.lines.length - 1 && (
                <em className="inline-block font-serif text-[1.09em] font-normal tracking-[-0.03em] whitespace-nowrap text-mint italic">
                  {hero.headline.turn}
                </em>
              )}
            </span>
          ))}
        </h1>

        <p className="t-lead rise-solid mx-auto mt-7 max-w-[40rem]" style={{ ["--i" as string]: 2 }}>
          {hero.body}
        </p>

        <div className="rise mt-9 flex flex-wrap items-center justify-center gap-3" style={{ ["--i" as string]: 3 }}>
          <Link href={cta.primary.href} className="btn btn-primary btn-lg">
            {cta.primary.label}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <FilmTrigger className="btn btn-secondary btn-lg">
            <Play className="size-4 fill-current" aria-hidden="true" />
            {cta.film.hero}
          </FilmTrigger>
        </div>

        <p className="t-mono rise mt-6 text-dim" style={{ ["--i" as string]: 4 }}>
          {product.minimumOSLong} · {product.chip}
        </p>
      </div>

      <div className="container-wide mt-[clamp(2.75rem,6vw,5rem)]">
        <div className="relative mx-auto max-w-[74rem]">
          {/* Glow under the frame, from the icon's indigo and violet. */}
          <div
            aria-hidden="true"
            className="absolute -inset-x-6 -inset-y-8 -z-10 rounded-[3rem] bg-[radial-gradient(60%_60%_at_30%_40%,rgb(61_99_255/0.28),transparent_70%),radial-gradient(50%_60%_at_78%_60%,rgb(155_77_255/0.24),transparent_70%)] blur-3xl"
          />
          <HeroFilm
            className="settle"
            poster={
              <Picture
                id="film-poster"
                alt={hero.posterAlt}
                sizes="(min-width: 1280px) 1184px, 94vw"
                priority
                className="absolute inset-0 block"
                imgClassName="size-full object-cover"
              />
            }
          />
          <p className="mt-5 text-center">
            <span className="t-eyebrow is-plain text-dim">The Briefnest film · 1 minute · English captions</span>
          </p>
        </div>
      </div>
    </section>
  );
}
