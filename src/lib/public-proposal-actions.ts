"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { getProposalErrorCode } from "@/lib/proposal-errors";
import { acceptProposalByToken, completeProposalChecklistItem, rejectProposalByToken } from "@/lib/proposal-store";
import {
  checkRateLimit,
  RATE_LIMIT_CHECKLIST,
  RATE_LIMIT_PUBLIC_ACTION
} from "@/lib/rate-limit";
import { audit, auditContext } from "@/lib/audit";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getClientIp(): Promise<string> {
  const headerStore = await headers();
  return (
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerStore.get("x-real-ip") ??
    "unknown"
  );
}

async function getRequestContext(route: string) {
  const hdrs = await headers();
  return auditContext({
    ip: hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? hdrs.get("x-real-ip") ?? undefined,
    userAgent: hdrs.get("user-agent") ?? undefined,
    route
  });
}

function tokenPrefix(token: string): string {
  return token.slice(0, 16);
}

// ---------------------------------------------------------------------------
// Accept
// ---------------------------------------------------------------------------

export async function acceptPublicProposal(formData: FormData): Promise<void> {
  const token = formData.get("token");

  if (typeof token !== "string" || token.trim().length === 0) {
    redirect("/?acceptError=invalid_token");
  }

  const normalizedToken = token.trim();
  const ip = await getClientIp();
  const ctx = await getRequestContext(`/p/${tokenPrefix(normalizedToken)}/accept`);

  const rateCheck = await checkRateLimit(`action:accept:${ip}`, RATE_LIMIT_PUBLIC_ACTION);
  if (!rateCheck.allowed) {
    audit({
      event: "ratelimit.exceeded",
      actorType: "anonymous",
      outcome: "blocked",
      tokenPrefix: tokenPrefix(normalizedToken),
      ...ctx
    });
    redirect(`/p/${normalizedToken}?acceptError=rate_limited`);
  }

  const acceptedByName = typeof formData.get("acceptedByName") === "string"
    ? (formData.get("acceptedByName") as string).trim()
    : undefined;

  const headerStore = await headers();
  const acceptedByIp = ip !== "unknown" ? ip : undefined;
  const acceptedByUserAgent = headerStore.get("user-agent") ?? undefined;

  try {
    await acceptProposalByToken(normalizedToken, {
      acceptedByName: acceptedByName || undefined,
      acceptedByIp,
      acceptedByUserAgent
    });

    audit({
      event: "public.proposal.accepted",
      actorType: "anonymous",
      outcome: "success",
      tokenPrefix: tokenPrefix(normalizedToken),
      ...ctx
    });
  } catch (error) {
    const errorCode = mapAcceptErrorCode(error);
    audit({
      event: "public.proposal.accepted",
      actorType: "anonymous",
      outcome: "error",
      reasonCode: errorCode,
      tokenPrefix: tokenPrefix(normalizedToken),
      ...ctx
    });
    redirect(`/p/${normalizedToken}?acceptError=${encodeURIComponent(errorCode)}`);
  }

  redirect(`/p/${normalizedToken}/checklist`);
}

// ---------------------------------------------------------------------------
// Reject
// ---------------------------------------------------------------------------

export async function rejectPublicProposal(formData: FormData): Promise<void> {
  const token = formData.get("token");

  if (typeof token !== "string" || token.trim().length === 0) {
    redirect("/?rejectError=invalid_token");
  }

  const normalizedToken = token.trim();
  const ip = await getClientIp();
  const ctx = await getRequestContext(`/p/${tokenPrefix(normalizedToken)}/reject`);

  const rateCheck = await checkRateLimit(`action:reject:${ip}`, RATE_LIMIT_PUBLIC_ACTION);
  if (!rateCheck.allowed) {
    audit({
      event: "ratelimit.exceeded",
      actorType: "anonymous",
      outcome: "blocked",
      tokenPrefix: tokenPrefix(normalizedToken),
      ...ctx
    });
    redirect(`/p/${normalizedToken}?rejectError=rate_limited`);
  }

  const rejectedReason = typeof formData.get("rejectedReason") === "string"
    ? (formData.get("rejectedReason") as string).trim()
    : undefined;

  try {
    await rejectProposalByToken(normalizedToken, {
      rejectedReason: rejectedReason || undefined
    });

    audit({
      event: "public.proposal.rejected",
      actorType: "anonymous",
      outcome: "success",
      tokenPrefix: tokenPrefix(normalizedToken),
      ...ctx
    });
  } catch (error) {
    const errorCode = mapRejectErrorCode(error);
    audit({
      event: "public.proposal.rejected",
      actorType: "anonymous",
      outcome: "error",
      reasonCode: errorCode,
      tokenPrefix: tokenPrefix(normalizedToken),
      ...ctx
    });
    redirect(`/p/${normalizedToken}?rejectError=${encodeURIComponent(errorCode)}`);
  }

  redirect(`/p/${normalizedToken}?rejected=1`);
}

// ---------------------------------------------------------------------------
// Checklist
// ---------------------------------------------------------------------------

export async function completeChecklistItemAction(formData: FormData): Promise<void> {
  const token = formData.get("token");
  const itemId = formData.get("itemId");
  const completedBy = formData.get("completedBy");

  if (typeof token !== "string" || token.trim().length === 0) return;
  if (typeof itemId !== "string" || itemId.trim().length === 0) return;

  const normalizedToken = token.trim();
  const ip = await getClientIp();

  const rateCheck = await checkRateLimit(`checklist:${ip}`, RATE_LIMIT_CHECKLIST);
  if (!rateCheck.allowed) return;

  try {
    await completeProposalChecklistItem({
      token: normalizedToken,
      itemId: itemId.trim(),
      completedBy: typeof completedBy === "string" ? completedBy.trim() || undefined : undefined
    });

    audit({
      event: "public.checklist.completed",
      actorType: "anonymous",
      outcome: "success",
      tokenPrefix: tokenPrefix(normalizedToken),
      ip,
      meta: { itemId: itemId.trim() }
    });
  } catch {
    // Silent fail — item may already be completed or token invalid
  }

  revalidatePath(`/p/${normalizedToken}/checklist`);
}

// ---------------------------------------------------------------------------
// Error code mapping
// ---------------------------------------------------------------------------

function mapAcceptErrorCode(error: unknown): string {
  const code = getProposalErrorCode(error);
  if (code) {
    switch (code) {
      case "TOKEN_NOT_FOUND": return "invalid_token";
      case "TOKEN_EXPIRED": return "token_expired";
      case "INVALID_STATUS_FOR_ACCEPT": return "not_available";
    }
  }
  return "accept_failed";
}

function mapRejectErrorCode(error: unknown): string {
  const code = getProposalErrorCode(error);
  if (code) {
    switch (code) {
      case "TOKEN_NOT_FOUND": return "invalid_token";
      case "TOKEN_EXPIRED": return "token_expired";
      case "INVALID_STATUS_FOR_REJECT": return "not_available";
    }
  }
  return "reject_failed";
}
