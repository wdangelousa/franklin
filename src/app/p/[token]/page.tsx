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
    rejectError?: string;
    rejected?: string;
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

  console.log("[DEBUG /p/token] ──────────────────────────────────");
  console.log("[DEBUG /p/token] Token recebido:", token);
  console.log("[DEBUG /p/token] Token length:", token.length);
  console.log("[DEBUG /p/token] Token starts with 'frkpub_':", token.startsWith("frkpub_"));
  console.log(
    "[DEBUG /p/token] FRANKLIN_BASE_URL:",
    process.env.FRANKLIN_BASE_URL ?? "(não definido)"
  );
  console.log("[DEBUG /p/token] VERCEL_URL:", process.env.VERCEL_URL ?? "(não definido)");
  console.log(
    "[DEBUG /p/token] VERCEL_PROJECT_PRODUCTION_URL:",
    process.env.VERCEL_PROJECT_PRODUCTION_URL ?? "(não definido)"
  );
  console.log("[DEBUG /p/token] NODE_ENV:", process.env.NODE_ENV);

  const proposal = await getResolvedPublicProposalByToken(token, {
    recordView: true
  });

  console.log("[DEBUG /p/token] Proposal resolved:", proposal !== null);
  if (!proposal) {
    console.log("[DEBUG /p/token] ⚠ Proposal is NULL — will return 404");
    console.log("[DEBUG /p/token] Possíveis causas:");
    console.log(
      "[DEBUG /p/token]   1. Token hash não encontrado no DB (token errado ou secret diferente)"
    );
    console.log("[DEBUG /p/token]   2. Token revogado (revokedAt não é null)");
    console.log("[DEBUG /p/token]   3. Token expirado (expiresAt < now)");
    console.log("[DEBUG /p/token]   4. Snapshot token decryption falhou (secret rotation?)");
    console.log("[DEBUG /p/token]   5. Erro de conexão ao banco de dados");
  } else {
    console.log("[DEBUG /p/token] ✓ Proposal found:", proposal.snapshot?.proposalNumber);
  }
  console.log("[DEBUG /p/token] ──────────────────────────────────");

  if (!proposal) {
    notFound();
  }

  return (
    <PublicProposalPage
      proposal={proposal}
      feedback={{
        acceptError: query?.acceptError,
        rejectError: query?.rejectError,
        rejected: query?.rejected
      }}
    />
  );
}
