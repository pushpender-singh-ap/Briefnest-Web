import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { changelog } from "@/content/changelog";
import { releasesUrl } from "@/content/release";
import { deployment } from "@/content/site";
import { formatDate } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Changelog",
  description: "Briefnest release notes: what each version adds, and what is still being validated. Taken from the project’s own release record.",
  path: "/changelog",
});

export default function ChangelogPage() {
  const currentDownload = deployment.availability.kind === "download" ? deployment.availability.release.version : undefined;
  return (
    <>
      <PageHeader eyebrow="Changelog" title={<>What’s <em>new.</em></>}>
        <p>Follow what changed in each Mac release and find the installer that goes with it.</p>
      </PageHeader>

      <div className="container-page grid gap-20 pb-[clamp(5rem,10vw,9rem)]">
        {changelog.map((entry) => (
          <article key={entry.version} aria-labelledby={`v${entry.version}`} className="grid gap-x-14 gap-y-8 border-t border-white/10 pt-10 lg:grid-cols-[14rem_1fr]">
            <Reveal>
              <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
                <p className="t-display text-[clamp(2.75rem,5vw,4rem)]">{entry.version}</p>
                <p className="t-mono mt-3 text-label uppercase">
                  <time dateTime={entry.date}>{formatDate(entry.date)}</time>
                </p>
                {entry.version === currentDownload && <p className="pill mt-4">Current download</p>}
              </div>
            </Reveal>

            <div className="max-w-3xl">
              <Reveal>
                <h2 id={`v${entry.version}`} className="t-h2 text-[clamp(1.8rem,1.3rem+2vw,2.75rem)]">
                  {entry.title}
                </h2>
                <p className="t-lead mt-5">{entry.summary}</p>
              </Reveal>

              <div className="mt-10 grid gap-10">
                {entry.groups.map((group) => (
                  <Reveal key={group.title}>
                    <section aria-label={group.title}>
                      <h3 className="t-eyebrow">{group.title}</h3>
                      <ul className="mt-5 grid gap-3">
                        {group.items.map((item) => (
                          <li key={item} className="relative pl-6 text-fog before:absolute before:top-[0.72em] before:left-0 before:h-px before:w-3 before:bg-thread">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </section>
                  </Reveal>
                ))}

                <Reveal>
                  <section aria-label="Known limits" className="surface p-6">
                    <h3 className="t-h4 text-paper">Known limits in this version</h3>
                    <ul className="mt-4 grid gap-3">
                      {entry.limits.map((limit) => (
                        <li key={limit} className="t-small relative pl-6 text-mist before:absolute before:top-[0.72em] before:left-0 before:h-px before:w-3 before:bg-app-orange/70">
                          {limit}
                        </li>
                      ))}
                    </ul>
                  </section>
                </Reveal>
              </div>

              <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3">
                {entry.version === currentDownload && (
                  <Link href="/download" className="link inline-flex items-center gap-1.5">
                    Download for Mac <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                )}
                <a href={`${releasesUrl}/tag/v${entry.version}`} className="link">View {entry.version} on GitHub</a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
