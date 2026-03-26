"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { revalidatePath } from "next/cache";

import { acceptProposalByToken, completeProposalChecklistItem, rejectProposalByToken } from "@/lib/proposal-store";

export async function acceptPublicProposal(formData: FormData): Promise<void> {
  const token = formData.get("token");

  if (typeof token !== "string" || token.trim().length === 0) {
    redirect("/?acceptError=invalid_token");
  }

  const normalizedToken = token.trim();
  const acceptedByName = typeof formData.get("acceptedByName") === "string"
    ? (formData.get("acceptedByName") as string).trim()
    : undefined;

  const headerStore = await headers();
  const acceptedByIp =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerStore.get("x-real-ip") ??
    undefined;
  const acceptedByUserAgent = headerStore.get("user-agent") ?? undefined;

  try {
    await acceptProposalByToken(normalizedToken, {
      acceptedByName: acceptedByName || undefined,
      acceptedByIp,
      acceptedByUserAgent
    });
  } catch (error) {
    const errorCode = mapAcceptErrorCode(error);
    redirect(`/p/${normalizedToken}?acceptError=${encodeURIComponent(errorCode)}`);
  }

  redirect(`/p/${normalizedToken}/checklist`);
}

export async function rejectPublicProposal(formData: FormData): Promise<void> {
  const token = formData.get("token");

  if (typeof token !== "string" || token.trim().length === 0) {
    redirect("/?rejectError=invalid_token");
  }

  const normalizedToken = token.trim();
  const rejectedReason = typeof formData.get("rejectedReason") === "string"
    ? (formData.get("rejectedReason") as string).trim()
    : undefined;

  try {
    await rejectProposalByToken(normalizedToken, {
      rejectedReason: rejectedReason || undefined
    });
  } catch (error) {
    const errorCode = mapRejectErrorCode(error);
    redirect(`/p/${normalizedToken}?rejectError=${encodeURIComponent(errorCode)}`);
  }

  redirect(`/p/${normalizedToken}?rejected=1`);
}

export async function completeChecklistItemAction(formData: FormData): Promise<void> {
  const token = formData.get("token");
  const itemId = formData.get("itemId");
  const completedBy = formData.get("completedBy");

  if (typeof token !== "string" || token.trim().length === 0) {
    return;
  }

  if (typeof itemId !== "string" || itemId.trim().length === 0) {
    return;
  }

  const normalizedToken = token.trim();

  try {
    await completeProposalChecklistItem({
      token: normalizedToken,
      itemId: itemId.trim(),
      completedBy: typeof completedBy === "string" ? completedBy.trim() || undefined : undefined
    });
  } catch {
    // Silently fail — item may already be completed or token invalid
  }

  revalidatePath(`/p/${normalizedToken}/checklist`);
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

function mapRejectErrorCode(error: unknown): string {
  if (!(error instanceof Error)) {
    return "reject_failed";
  }

  if (error.message === "Token da proposta não encontrado.") {
    return "invalid_token";
  }

  if (error.message === "A proposta não pode ser recusada.") {
    return "not_available";
  }

  return "reject_failed";
}
