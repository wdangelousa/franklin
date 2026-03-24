"use server";

import { redirect } from "next/navigation";

import { acceptProposalByToken } from "@/lib/proposal-store";

export async function acceptPublicProposal(formData: FormData): Promise<void> {
  const token = formData.get("token");

  if (typeof token !== "string" || token.trim().length === 0) {
    redirect("/?acceptError=invalid_token");
  }

  const normalizedToken = token.trim();

  try {
    await acceptProposalByToken(normalizedToken);
    redirect(`/p/${normalizedToken}/checklist`);
  } catch (error) {
    const errorCode = mapAcceptErrorCode(error);
    redirect(`/p/${normalizedToken}?acceptError=${encodeURIComponent(errorCode)}`);
  }
}

function mapAcceptErrorCode(error: unknown): string {
  if (!(error instanceof Error)) {
    return "accept_failed";
  }

  if (error.message === "Token da proposta não encontrado.") {
    return "invalid_token";
  }

  if (error.message === "A proposta não pode ser aceita.") {
    return "not_available";
  }

  return "accept_failed";
}
