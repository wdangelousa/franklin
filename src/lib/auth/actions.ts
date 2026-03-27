"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { AUTH_MODE, getDemoAccountById, SESSION_COOKIE_NAME, SESSION_COOKIE_PATH } from "@/lib/auth/config";
import { AuthError } from "@/lib/auth/errors";
import { signSessionPayload } from "@/lib/auth/session-crypto";
import type { SessionData } from "@/lib/auth/types";
import { audit, auditContext } from "@/lib/audit";

async function getRequestContext() {
  const hdrs = await headers();
  return auditContext({
    ip: hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? hdrs.get("x-real-ip") ?? undefined,
    userAgent: hdrs.get("user-agent") ?? undefined,
    route: "/login"
  });
}

function getStringValue(input: FormDataEntryValue | null): string | null {
  if (typeof input !== "string") return null;
  const trimmed = input.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function signInAsDemoUser(formData: FormData): Promise<void> {
  const ctx = await getRequestContext();

  if (AUTH_MODE === "strict") {
    audit({
      event: "auth.login.demo_blocked",
      actorType: "anonymous",
      outcome: "denied",
      reasonCode: "STRICT_MODE",
      ...ctx
    });
    throw new AuthError(
      "DEMO_LOGIN_DISABLED_IN_STRICT_MODE",
      "Demo sign-in is disabled when FRANKLIN_AUTH_MODE is set to strict."
    );
  }

  const accountId = getStringValue(formData.get("accountId"));
  const selectedAccount = getDemoAccountById(accountId);

  const session: SessionData = {
    mode: "mock",
    user: selectedAccount
  };

  const signedValue = signSessionPayload(JSON.stringify(session));
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, signedValue, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: SESSION_COOKIE_PATH,
    maxAge: 60 * 60 * 8
  });

  audit({
    event: "auth.login.success",
    actorType: "user",
    actorId: selectedAccount.id,
    outcome: "success",
    meta: { mode: "mock", role: selectedAccount.role },
    ...ctx
  });

  redirect("/app/dashboard");
}

export async function signOut(): Promise<void> {
  const ctx = await getRequestContext();

  audit({
    event: "auth.logout",
    actorType: "user",
    outcome: "success",
    ...ctx
  });

  const cookieStore = await cookies();
  cookieStore.delete({ name: SESSION_COOKIE_NAME, path: SESSION_COOKIE_PATH });
  redirect("/login");
}
