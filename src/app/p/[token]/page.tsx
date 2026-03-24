import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PublicProposalPage } from "@/components/public/public-proposal-page";
import { getResolvedPublicProposalByToken } from "@/lib/public-proposal-access";
import { getPublicProposalSnapshotByToken } from "@/lib/public-proposals";

export const dynamic = "force-dynamic";

interface PublicTokenProposalPageProps {
  params: Promise<{
    token: string;
  }>;
  searchParams?: Promise<{
    acceptError?: string;
  }>;
}

export async function generateMetadata({
  params
}: PublicTokenProposalPageProps): Promise<Metadata> {
  const { token } = await params;
  const proposal = await getPublicProposalSnapshotByToken(token, {
    recordView: false
  });

  return {
    title: proposal ? `${proposal.companyName} | Proposta privada` : "Link privado da proposta",
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

export default async function PublicTokenProposalPage({
  params,
  searchParams
}: PublicTokenProposalPageProps) {
  const { token } = await params;
  const query = searchParams ? await searchParams : undefined;
  const proposal = await getResolvedPublicProposalByToken(token, {
    recordView: true
  });

  if (!proposal) {
    notFound();
  }

  return (
    <PublicProposalPage
      proposal={proposal}
      feedback={{
        acceptError: query?.acceptError
      }}
    />
  );
}
