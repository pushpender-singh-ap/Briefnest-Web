import { FileWarning } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import type { LegalBlock } from "@/content/legal";
import { formatDate } from "@/lib/format";

interface LegalDocumentProps {
  title: string;
  /** Shown in the banner, e.g. "Draft for legal review". */
  status: string;
  statusNote: string;
  updated: string;
  lead: string;
  blocks: LegalBlock[];
}

/** A long-form page (privacy, terms) with a visible draft banner, so nobody mistakes it for a final policy. */
export function LegalDocument({ title, status, statusNote, updated, lead, blocks }: LegalDocumentProps) {
  return (
    <>
      <PageHeader eyebrow={`Last changed ${formatDate(updated)}`} title={title}>
        <p>{lead}</p>
      </PageHeader>

      <div className="container-page pb-[clamp(5rem,10vw,9rem)]">
        <aside
          aria-label="Document status"
          className="flex max-w-[44rem] gap-4 rounded-[var(--radius-card)] bg-app-orange/[0.08] p-5 shadow-[inset_0_0_0_1px_rgb(254_145_45/0.38)]"
        >
          <FileWarning className="mt-0.5 size-5 shrink-0 text-app-orange" aria-hidden="true" />
          <div>
            <p className="font-semibold text-paper">{status}</p>
            <p className="t-small mt-1.5 text-fog">{statusNote}</p>
          </div>
        </aside>

        <article className="prose-brief">
          {blocks.map((block) => (
            <section key={block.heading} aria-label={block.heading}>
              <h2>{block.heading}</h2>
              {block.paragraphs?.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {block.list && (
                <ul>
                  {block.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
              {block.table && (
                <div className="mt-6 rounded-[var(--radius-card)] shadow-[inset_0_0_0_1px_var(--line-strong)]">
                  {/* From 640 px up this is an ordinary table. Below that each row stacks into a block and every value
                      carries its column name, so it reads correctly without the header row. */}
                  <table className="w-full border-collapse text-left text-[0.92rem] max-sm:block">
                    <thead className="max-sm:hidden">
                      <tr>
                        {block.table.head.map((cell) => (
                          <th key={cell} scope="col" className="t-mono border-b border-white/12 px-4 py-3 font-normal text-label uppercase">
                            {cell}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="max-sm:block">
                      {block.table.rows.map((row) => (
                        <tr key={row[0]} className="border-b border-white/8 last:border-0 max-sm:block max-sm:px-4 max-sm:py-4">
                          {row.map((cell, index) =>
                            index === 0 ? (
                              <th key={cell} scope="row" className="px-4 py-3.5 align-top font-semibold text-paper max-sm:block max-sm:p-0">
                                {cell}
                              </th>
                            ) : (
                              <td key={cell} className="px-4 py-3.5 align-top text-fog max-sm:mt-2 max-sm:block max-sm:p-0">
                                <span className="t-mono mb-0.5 block text-dim uppercase sm:hidden">
                                  {block.table!.head[index]}
                                </span>
                                {cell}
                              </td>
                            ),
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {block.after?.map((paragraph, index) => (
                <p key={paragraph} className={index === 0 ? "mt-5" : undefined}>
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </article>
      </div>
    </>
  );
}
