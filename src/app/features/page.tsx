import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Info, Play } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { FeatureList } from "@/components/ui/FeatureList";
import { AppWindow, Plate } from "@/components/ui/Frame";
import { Headline } from "@/components/ui/Headline";
import { Picture } from "@/components/ui/Picture";
import { Reveal } from "@/components/ui/Reveal";
import { FilmTrigger } from "@/components/video/FilmTrigger";
import { chapters, featuresIntro } from "@/content/features";
import { cta } from "@/content/site";
import { cn } from "@/lib/cn";
import { image } from "@/lib/images";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Features: meeting capture, AI notes, decisions and code context",
  description:
    "Every Briefnest feature in detail: Mac meeting transcription, AI meeting notes you approve, action tracking, versioned decisions, source-backed chat, GitHub and GitLab context, and MCP for coding agents.",
  path: "/features",
});

export default function FeaturesPage() {
  return (
    <>
      <PageHeader eyebrow={featuresIntro.eyebrow} title={<Headline {...featuresIntro.headline} />}>
        <p>{featuresIntro.lead}</p>
      </PageHeader>

      {/* Chapter navigation: stays under the header while you read. */}
      <nav aria-label="Feature chapters" className="sticky top-[var(--header-h)] z-30 border-y border-white/8 bg-ink-900/85 backdrop-blur-xl">
        <ul className="no-scrollbar container-page flex gap-1 overflow-x-auto py-2">
          {chapters.map((chapter) => (
            <li key={chapter.id} className="shrink-0">
              <a
                href={`#${chapter.id}`}
                className="inline-flex min-h-10 items-center rounded-full px-3.5 text-[0.875rem] font-medium tracking-[-0.01em] text-fog transition-colors hover:bg-white/6 hover:text-paper"
              >
                {chapter.nav}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {chapters.map((chapter, index) => (
        <section
          key={chapter.id}
          id={chapter.id}
          aria-labelledby={`${chapter.id}-title`}
          className={cn("section scroll-mt-[calc(var(--header-h)+4rem)]", index % 2 === 1 && "border-y border-white/6 bg-ink-850/60")}
        >
          <div className="container-page">
            <Reveal>
              <p className="t-eyebrow">{chapter.eyebrow}</p>
              <h2 id={`${chapter.id}-title`} className="t-h2 mt-5 max-w-[12.4em]">
                <Headline {...chapter.headline} />
              </h2>
              <p className="t-lead mt-6 max-w-2xl">{chapter.lead}</p>
            </Reveal>

            <div className={cn("mt-12 grid gap-6 lg:mt-16 lg:items-end", chapter.shots.length > 1 && "lg:grid-cols-[1.35fr_1fr]")}>
              {chapter.shots.map((shot, shotIndex) => {
                const picture = (
                  <Picture
                    id={shot.image}
                    small={shot.small ? { id: shot.small } : undefined}
                    alt={shot.alt}
                    sizes={shotIndex === 0 ? "(min-width: 1024px) 720px, 92vw" : "(min-width: 1024px) 520px, 92vw"}
                  />
                );
                const { width, height } = image(shot.image);
                const tall = height / width > 0.9;
                return (
                  <Reveal key={shot.image} delay={shotIndex * 0.08} className={cn(tall && "mx-auto w-full max-w-[24rem]")}>
                    {shot.window ? (
                      <AppWindow caption={shot.caption} title={`Briefnest · ${shot.caption}`} plainWhenSmall={Boolean(shot.small)}>
                        {picture}
                      </AppWindow>
                    ) : (
                      <Plate caption={shot.caption}>{picture}</Plate>
                    )}
                  </Reveal>
                );
              })}
            </div>

            <FeatureList items={chapter.features} className="mt-14 lg:mt-20" />

            {chapter.note && (
              <Reveal className="mt-12">
                <p className="t-small flex max-w-4xl gap-3 text-mist">
                  <Info className="mt-0.5 size-4 shrink-0 text-thread" aria-hidden="true" />
                  <span>{chapter.note}</span>
                </p>
              </Reveal>
            )}
          </div>
        </section>
      ))}

      <section aria-labelledby="features-next" className="section">
        <div className="container-page text-center">
          <Reveal>
            <h2 id="features-next" className="t-h2 mx-auto max-w-[9.9em]">
              See it <em>in motion.</em>
            </h2>
            <p className="t-lead mx-auto mt-6 max-w-xl">One decision, followed from a meeting to a merged pull request, in a minute.</p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <FilmTrigger className="btn btn-primary btn-lg">
                <Play className="size-4 fill-current" aria-hidden="true" />
                {cta.film.hero}
              </FilmTrigger>
              <Link href={cta.primary.href} className="btn btn-secondary btn-lg">
                {cta.primary.label}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
