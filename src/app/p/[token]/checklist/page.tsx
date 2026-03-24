import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PublicProposalChecklistPage } from "@/components/public/public-proposal-checklist-page";
import { getResolvedPublicProposalByToken } from "@/lib/public-proposal-access";
import { getProposalChecklistByToken } from "@/lib/proposal-store";
import { getPublicProposalSnapshotByToken } from "@/lib/public-proposals";

export const dynamic = "force-dynamic";

interface PublicTokenChecklistPageProps {
  params: Promise<{
    token: string;
  }>;
}

export async function generateMetadata({
  params
}: PublicTokenChecklistPageProps): Promise<Metadata> {
  const { token } = await params;
  const proposal = await getPublicProposalSnapshotByToken(token, {
    recordView: false
  });

  return {
    title: proposal ? `${proposal.companyName} | Checklist privado` : "Link privado do checklist",
    description: proposal
      ? `Checklist documental de ${proposal.companyName}`
      : "Checklist privado da proposta",
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

export default async function PublicTokenChecklistPage({
  params
}: PublicTokenChecklistPageProps) {
  const { token } = await params;
  const [proposal, checklistItems] = await Promise.all([
    getResolvedPublicProposalByToken(token, { recordView: false }),
    getProposalChecklistByToken(token)
  ]);

  if (!proposal) {
    notFound();
  }

  return <PublicProposalChecklistPage checklistItems={checklistItems} proposal={proposal} />;
}
