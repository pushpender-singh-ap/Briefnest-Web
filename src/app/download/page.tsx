import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Cpu, Laptop, Mail, Package, Play, Terminal } from "lucide-react";
import { DownloadPanel } from "@/components/download/DownloadPanel";
import { WaitlistForm } from "@/components/download/WaitlistForm";
import { Picture } from "@/components/ui/Picture";
import { Reveal } from "@/components/ui/Reveal";
import { FilmTrigger } from "@/components/video/FilmTrigger";
import { brand, commerce, cta, deployment, product } from "@/content/site";
import { formatInstant } from "@/lib/format";
import type { Availability } from "@/lib/release";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Download Briefnest for Mac",
  description: `Get Briefnest for Mac: a native meeting-notes and project-memory app for ${product.minimumOSLong} on ${product.chip}. Requirements, installation steps and current availability.`,
  path: "/download",
});

const requirements = [
  { icon: Laptop, title: product.minimumOSLong, text: "Built with SwiftUI for current macOS." },
  { icon: Cpu, title: product.chip, text: "M-series Macs. Intel Macs aren’t supported." },
  { icon: Package, title: "Direct download", text: "A signed, notarized disk image. Not on the Mac App Store." },
  { icon: Terminal, title: "For AI features", text: `${product.aiPrerequisites}, a local model, or an OpenAI-compatible API.` },
];

const steps = [
  { title: "Open the disk image", text: "Double-click the downloaded .dmg file. macOS checks that it is signed and notarized." },
  { title: "Drag Briefnest to Applications", text: "Then eject the disk image and launch Briefnest from your Applications folder." },
  {
    title: "Allow what you want to use",
    text: "The first time you record, macOS asks for Microphone and Screen & System Audio Recording access. Screen recording takes effect after reopening the app.",
  },
  {
    title: "Pick your AI and transcription",
    text: "Choose a signed-in agent or local model for notes and chat, and Apple’s on-device recognition, a local model or a cloud service for transcription.",
  },
];

/** What the site can truthfully offer right now, decided by configuration alone. */
function AvailabilityCard({ availability }: { availability: Availability }) {
  switch (availability.kind) {
    case "download":
      return <DownloadPanel release={availability.release} />;
    case "expired":
      return (
        <div className="grid gap-6">
          <div role="status">
            <h2 className="t-h3 text-paper">The last build has expired.</h2>
            <p className="mt-3 text-fog">
              Version {availability.release.version} was a {availability.release.channel === "beta" ? "beta" : "time-limited build"} that stopped working on{" "}
              {formatInstant(availability.release.expiresAt!)}. A newer build hasn’t been published yet. Anything saved with it is still on your Mac and
              will open in the next one.
            </p>
          </div>
          <AvailabilityCard availability={availability.fallback} />
        </div>
      );
    case "waitlist":
      return (
        <div className="grid gap-6">
          <div>
            <h2 className="t-h3 text-paper">Ask for early access.</h2>
            <p className="mt-3 text-fog">A public build isn’t available yet. Leave your email and we’ll write when there’s a build for you.</p>
          </div>
          <WaitlistForm endpoint={availability.endpoint} />
        </div>
      );
    case "contact":
      return (
        <div className="grid gap-6">
          <div>
            <h2 className="t-h3 text-paper">Ask for early access.</h2>
            <p className="mt-3 text-fog">
              A public build isn’t available yet. Email us and we’ll reply when there’s a build for you. This opens your own mail app; nothing is sent
              from this page.
            </p>
          </div>
          <div>
            <a href={`mailto:${availability.email}?subject=${encodeURIComponent("Briefnest early access")}`} className="btn btn-primary btn-lg">
              <Mail className="size-[1.1rem]" aria-hidden="true" />
              Email {availability.email}
            </a>
          </div>
        </div>
      );
    case "unavailable":
      return (
        <div className="grid gap-6">
          <div role="status">
            <h2 className="t-h3 text-paper">Not available to download yet.</h2>
            <p className="mt-3 text-fog">
              Briefnest {product.version} is built and packaged, but a public build hasn’t been published. When it is, this page will carry the download,
              its checksum, its release notes and, for a time-limited build, the date it expires.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <FilmTrigger className="btn btn-primary btn-lg">
              <Play className="size-4 fill-current" aria-hidden="true" />
              {cta.film.hero}
            </FilmTrigger>
            <Link href="/features" className="btn btn-secondary btn-lg">
              See what it does
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      );
  }
}

export default function DownloadPage() {
  const { availability } = deployment;
  const live = availability.kind === "download";

  return (
    <>
      <section aria-labelledby="download-title" className="relative isolate overflow-hidden pt-[calc(var(--header-h)+clamp(3rem,7vw,6rem))] pb-[clamp(3rem,6vw,5rem)]">
        <div aria-hidden="true" className="aurora pointer-events-none absolute inset-x-0 top-0 -z-10 h-[40rem] mask-fade-b" />

        <div className="container-page grid gap-x-16 gap-y-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <div className="rise relative size-[clamp(7rem,13vw,10rem)]" style={{ ["--i" as string]: 0 }}>
              <div aria-hidden="true" className="absolute inset-[10%] rounded-[28%] bg-[radial-gradient(circle,rgb(124_140_255/0.5),transparent_70%)] blur-2xl" />
              <Picture id="icon" alt="The Briefnest app icon" sizes="(min-width: 1024px) 160px, 112px" eager className="relative block" />
            </div>
            <p className="t-eyebrow rise mt-8" style={{ ["--i" as string]: 1 }}>
              Download
            </p>
            <h1 id="download-title" className="t-display rise-solid mt-5 text-[clamp(2.5rem,1.2rem+5vw,4.75rem)]" style={{ ["--i" as string]: 2 }}>
              {brand.name} <em className="lg:block">for Mac.</em>
            </h1>
            <p className="t-lead rise mt-6 max-w-md" style={{ ["--i" as string]: 3 }}>
              {brand.tagline}
            </p>
            <dl className="t-mono rise mt-8 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-fog" style={{ ["--i" as string]: 4 }}>
              <dt className="text-dim uppercase">Version</dt>
              <dd>{product.version}</dd>
              <dt className="text-dim uppercase">Requires</dt>
              <dd>
                {product.minimumOSLong} · {product.chip}
              </dd>
              <dt className="text-dim uppercase">Status</dt>
              <dd>{live ? "Available" : availability.kind === "expired" ? "Last build expired" : "Not yet public"}</dd>
            </dl>
          </div>

          <div className="surface rise-solid p-6 sm:p-9" style={{ ["--i" as string]: 3 }}>
            <AvailabilityCard availability={availability} />
          </div>
        </div>
      </section>

      <section aria-labelledby="requirements-title" className="section border-t border-white/6 bg-ink-850/60">
        <div className="container-page">
          <Reveal>
            <p className="t-eyebrow">Before you install</p>
            <h2 id="requirements-title" className="t-h2 mt-5">
              What you’ll <em>need.</em>
            </h2>
          </Reveal>
          <ul className="mt-12 grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
            {requirements.map((requirement, index) => (
              <li key={requirement.title}>
                <Reveal delay={index * 0.06} className="border-t border-white/10 pt-5">
                  <requirement.icon className="size-5 text-teal-400" aria-hidden="true" />
                  <h3 className="t-h4 mt-4 text-paper">{requirement.title}</h3>
                  <p className="t-small mt-2 text-mist">{requirement.text}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="install-title" className="section">
        <div className="container-page grid gap-x-16 gap-y-12 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <p className="t-eyebrow">Installation</p>
            <h2 id="install-title" className="t-h2 mt-5">
              Four steps, <em>then record.</em>
            </h2>
            <p className="t-lead mt-6">Briefnest installs like any Mac app distributed outside the App Store.</p>
          </Reveal>
          <ol className="relative grid gap-8 pl-12">
            <span aria-hidden="true" className="absolute top-2 bottom-2 left-[0.9375rem] w-px bg-gradient-to-b from-thread via-thread/40 to-thread/5" />
            {steps.map((step, index) => (
              <li key={step.title} className="relative">
                <Reveal delay={index * 0.06}>
                  <span
                    aria-hidden="true"
                    className="t-mono absolute top-0 -left-12 grid size-8 place-items-center rounded-full bg-ink-900 text-mint shadow-[inset_0_0_0_1px_var(--color-thread)]"
                  >
                    {index + 1}
                  </span>
                  <h3 className="t-h3">{step.title}</h3>
                  <p className="mt-2 max-w-xl text-fog">{step.text}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="more-title" className="section border-t border-white/6 bg-ink-850/60">
        <div className="container-page grid gap-10 md:grid-cols-2">
          <Reveal>
            <h2 id="more-title" className="t-h3">
              Release notes
            </h2>
            <p className="mt-3 max-w-md text-fog">What’s in version {product.version}, and what is still being validated.</p>
            <Link href="/changelog" className="link mt-5 inline-flex items-center gap-1.5">
              Read the changelog
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="t-h3">Pricing</h2>
            <p className="mt-3 max-w-md text-fog">{commerce.statement}</p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
