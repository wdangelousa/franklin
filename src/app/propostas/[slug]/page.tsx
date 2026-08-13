import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { buildProposalMetadata, getProposalPage, proposalPages } from "@/lib/proposal-share";

interface ProposalPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return proposalPages.map((page) => ({ slug: page.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: ProposalPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getProposalPage(slug);

  if (!page) {
    return { robots: { index: false, follow: false } };
  }

  return buildProposalMetadata(page);
}

export default async function ConfidentialProposalPage({ params }: ProposalPageProps) {
  const { slug } = await params;
  const page = getProposalPage(slug);

  if (!page) {
    notFound();
  }

  return (
    <main
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        background: "#e7ecf1",
      }}
    >
      <iframe
        src={page.documentPath}
        title={page.documentTitle}
        style={{ width: "100%", height: "100%", border: 0, display: "block" }}
      />
    </main>
  );
}
