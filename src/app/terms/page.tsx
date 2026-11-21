import type { Metadata } from "next";
import { LegalDocument } from "@/components/layout/LegalDocument";
import { termsPage } from "@/content/legal";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Terms (draft)",
  description:
    "Working notes on Briefnest’s terms: pre-release and time-limited builds, your content, connected services and your responsibilities. A draft, not yet in force.",
  path: "/terms",
});

export default function TermsPage() {
  return <LegalDocument {...termsPage} />;
}
