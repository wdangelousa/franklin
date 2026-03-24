import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PublicProposalPdfPage } from "@/components/public/public-proposal-pdf-page";
import { getResolvedPublicProposalByToken } from "@/lib/public-proposal-access";
import { getProposalPdfPlan } from "@/lib/proposal-pdf";
import { getPublicProposalSnapshotByToken } from "@/lib/public-proposals";

export const dynamic = "force-dynamic";

interface PublicTokenProposalPdfPageProps {
  params: Promise<{
    token: string;
  }>;
}

export async function generateMetadata({
  params
}: PublicTokenProposalPdfPageProps): Promise<Metadata> {
  const { token } = await params;
  const proposal = await getPublicProposalSnapshotByToken(token, {
    recordView: false
  });

  return {
    title: proposal ? `${proposal.companyName} | PDF de entrega` : "PDF privado da proposta",
    description: proposal?.coverTagline,
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true
      }
    }
  };
}

export default async function PublicTokenProposalPdfPage({
  params
}: PublicTokenProposalPdfPageProps) {
  const { token } = await params;
  const proposal = await getResolvedPublicProposalByToken(token, {
    recordView: false
  });

  if (!proposal) {
    notFound();
  }

  const pdfPlan = getProposalPdfPlan(proposal);

  if (pdfPlan.status !== "ready") {
    notFound();
  }

  return <PublicProposalPdfPage proposal={proposal} />;
}
