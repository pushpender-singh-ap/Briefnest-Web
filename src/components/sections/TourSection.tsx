import { AppWindow } from "@/components/ui/Frame";
import { Headline } from "@/components/ui/Headline";
import { Picture } from "@/components/ui/Picture";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { tour } from "@/content/home";
import { Tour } from "./Tour";

/** Section 12. Eight real windows: workspace, notes, transcript, actions, decisions, chat, code, review. */
export function TourSection() {
  const shots = tour.items.map((item) => (
    <AppWindow key={item.key} title={`Briefnest · ${item.title}`} plainWhenSmall>
      <Picture id={item.image} small={{ id: item.small }} alt={item.alt} sizes="(min-width: 1280px) 1248px, 94vw" />
    </AppWindow>
  ));

  return (
    <section id={tour.id} aria-labelledby="tour-title" className="section">
      <div className="container-page">
        <Reveal>
          <SectionHeading id="tour-title" eyebrow={tour.eyebrow} title={<Headline {...tour.headline} />} align="center">
            <p>{tour.body}</p>
          </SectionHeading>
        </Reveal>
        <Reveal delay={0.1} className="mt-12 lg:mt-14">
          <Tour items={tour.items} shots={shots} />
        </Reveal>
      </div>
    </section>
  );
}
