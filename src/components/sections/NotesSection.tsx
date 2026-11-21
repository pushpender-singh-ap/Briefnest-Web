import { ShieldCheck } from "lucide-react";
import { ContainedPlate, Plate } from "@/components/ui/Frame";
import { Headline } from "@/components/ui/Headline";
import { Picture } from "@/components/ui/Picture";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { notes } from "@/content/home";
import { image } from "@/lib/images";
import { BeforeAfter } from "./BeforeAfter";

/** Section 5. A transcript becomes reviewable notes, and you approve what is kept. */
export function NotesSection() {
  const side = (item: typeof notes.before) => {
    const wide = image(item.image);
    const narrow = image(item.small);
    return (
      <ContainedPlate width={wide.width} height={wide.height} small={{ width: narrow.width, height: narrow.height }}>
        <Picture id={item.image} small={{ id: item.small }} alt={item.alt} sizes="(min-width: 1024px) 640px, 92vw" imgClassName="size-full" />
      </ContainedPlate>
    );
  };

  return (
    <section id={notes.id} aria-labelledby="notes-title" className="section border-t border-white/6 bg-ink-850/60">
      <div className="container-page grid gap-x-16 gap-y-14 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="lg:sticky lg:top-[calc(var(--header-h)+2.5rem)] lg:self-start">
          <Reveal>
            <SectionHeading id="notes-title" eyebrow={notes.eyebrow} title={<Headline {...notes.headline} />}>
              <p>{notes.body}</p>
            </SectionHeading>
          </Reveal>

          <Reveal delay={0.08} className="mt-10">
            <h3 className="t-eyebrow is-plain text-dim">Every draft has five parts</h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {notes.sections.map((section) => (
                <li key={section} className="pill">
                  {section}
                </li>
              ))}
            </ul>
          </Reveal>

          <dl className="mt-10 grid gap-7">
            {notes.points.map((point, index) => (
              <Reveal key={point.title} delay={0.05 * index} className="border-t border-white/10 pt-5">
                <dt className="t-h4 text-paper">{point.title}</dt>
                <dd className="t-small mt-2 text-mist">{point.text}</dd>
              </Reveal>
            ))}
          </dl>

          <Reveal className="mt-10">
            <div className="surface flex gap-4 p-5">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-teal-400" aria-hidden="true" />
              <div>
                <p className="text-[0.98rem] leading-relaxed text-paper">{notes.control}</p>
                <p className="t-small mt-3 text-mist">{notes.disclosure}</p>
              </div>
            </div>
          </Reveal>
        </div>

        <div>
          <Reveal delay={0.1}>
            <BeforeAfter
              before={{ label: notes.before.label, hint: "What was said, as it was said.", node: side(notes.before) }}
              after={{ label: notes.after.label, hint: "A draft, waiting for your approval.", node: side(notes.after) }}
            />
          </Reveal>
          <Reveal delay={0.05} className="mt-10">
            <Plate caption="Notes / Edit in place">
              <Picture id="editor" alt={notes.editorAlt} sizes="(min-width: 1024px) 640px, 92vw" />
            </Plate>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
