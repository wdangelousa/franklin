import { notFound, redirect } from "next/navigation";

import { getPublicProposalByLegacySlug } from "@/lib/public-proposals";

interface ProposalPageProps {
  params: Promise<{
    proposalId: string;
  }>;
}

export default async function ProposalPage({
  params
}: ProposalPageProps) {
  const { proposalId } = await params;
  const proposal = await getPublicProposalByLegacySlug(proposalId);

  if (!proposal) {
    notFound();
  }

  redirect(`/p/${proposal.token}`);
}
