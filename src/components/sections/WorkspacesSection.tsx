import { GitBranch } from "lucide-react";
import { FeatureList } from "@/components/ui/FeatureList";
import { AppWindow, Plate } from "@/components/ui/Frame";
import { Headline } from "@/components/ui/Headline";
import { Picture } from "@/components/ui/Picture";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { workspaces } from "@/content/home";

/** Section 10. Separate workspaces, one view across them, and Git-backed sharing with a team. */
export function WorkspacesSection() {
  return (
    <section id={workspaces.id} aria-labelledby="workspaces-title" className="section">
      <div className="container-page">
        <Reveal>
          <SectionHeading id="workspaces-title" eyebrow={workspaces.eyebrow} title={<Headline {...workspaces.headline} />} className="max-w-4xl">
            <p>{workspaces.body}</p>
          </SectionHeading>
        </Reveal>

        <Reveal delay={0.1} className="mt-14 lg:mt-20">
          <AppWindow caption="All Workspaces" title="Briefnest · All Workspaces" plainWhenSmall>
            <Picture
              id="win-all-workspaces"
              small={{ id: "m-all-workspaces" }}
              alt={workspaces.images.all}
              sizes="(min-width: 1280px) 1248px, 94vw"
            />
          </AppWindow>
        </Reveal>

        <FeatureList items={workspaces.features} className="mt-16 lg:mt-20" />

        <div className="mt-16 grid gap-6 lg:mt-20 lg:grid-cols-[1.15fr_1fr] lg:items-start">
          <Reveal>
            <Plate caption="Share Workspace">
              <Picture id="sharing" alt={workspaces.images.sharing} sizes="(min-width: 1024px) 640px, 92vw" />
            </Plate>
          </Reveal>
          <div className="grid gap-8">
            <Reveal delay={0.08}>
              <Plate caption="Team">
                <Picture id="team" alt={workspaces.images.team} sizes="(min-width: 1024px) 560px, 92vw" />
              </Plate>
            </Reveal>
            <Reveal delay={0.12}>
              <div className="surface flex gap-4 p-5">
                <GitBranch className="mt-0.5 size-5 shrink-0 text-teal-400" aria-hidden="true" />
                <p className="text-[0.98rem] leading-relaxed text-fog">{workspaces.sharing}</p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
