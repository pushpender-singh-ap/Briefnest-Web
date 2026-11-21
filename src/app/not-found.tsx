import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = { title: "Page not found", robots: { index: false, follow: false } };

export default function NotFound() {
  return (
    <>
      <PageHeader eyebrow="404" title={<>Nothing <em>here.</em></>}>
        <p>That page doesn’t exist, or it moved. The links below go somewhere that does.</p>
      </PageHeader>
      <div className="container-page flex flex-wrap gap-3 pb-[clamp(6rem,14vw,12rem)]">
        <Link href="/" className="btn btn-primary btn-lg">
          Go to the home page
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
        <Link href="/features" className="btn btn-secondary btn-lg">
          See the features
        </Link>
      </div>
    </>
  );
}
