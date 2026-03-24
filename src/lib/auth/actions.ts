"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getDemoAccountById, SESSION_COOKIE_NAME } from "@/lib/auth/config";
import type { SessionData } from "@/lib/auth/types";

function getStringValue(input: FormDataEntryValue | null): string | null {
  if (typeof input !== "string") {
    return null;
  }

  const trimmed = input.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function signInAsDemoUser(formData: FormData): Promise<void> {
  const accountId = getStringValue(formData.get("accountId"));
  const selectedAccount = getDemoAccountById(accountId);

  const session: SessionData = {
    mode: "mock",
    user: selectedAccount
  };

  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8
  });

  redirect("/app/dashboard");
}

export async function signOut(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect("/login");
}
