import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { SESSION_COOKIE_NAME } from "@/lib/auth/config";
import { isInternalRole, type InternalRole, type SessionData } from "@/lib/auth/types";

function parseSession(rawValue: string): SessionData | null {
  try {
    const parsed = JSON.parse(rawValue) as Partial<SessionData>;

    if (
      typeof parsed?.user?.id === "string" &&
      typeof parsed?.user?.name === "string" &&
      typeof parsed.user.email === "string" &&
      typeof parsed.user.title === "string" &&
      isInternalRole(parsed.user.role) &&
      typeof parsed.user.organizationName === "string"
    ) {
      return {
        mode: parsed.mode === "strict" ? "strict" : "mock",
        user: {
          id: parsed.user.id,
          name: parsed.user.name,
          email: parsed.user.email,
          title: parsed.user.title,
          role: parsed.user.role,
          organizationName: parsed.user.organizationName
        }
      };
    }
  } catch {
    return null;
  }

  return null;
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (cookieValue) {
    const parsedSession = parseSession(cookieValue);

    if (parsedSession) {
      return parsedSession;
    }
  }

  return null;
}

export async function requireInternalSession(allowedRoles?: InternalRole[]): Promise<SessionData> {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (allowedRoles && !allowedRoles.includes(session.user.role)) {
    redirect("/app/dashboard");
  }

  return session;
}

export async function redirectAuthenticatedUser(): Promise<void> {
  const session = await getSession();

  if (session) {
    redirect("/app/dashboard");
  }
}
