export type AuthMode = "mock" | "strict";

export const INTERNAL_ROLES = ["ADMIN", "PARTNER"] as const;

export type InternalRole = (typeof INTERNAL_ROLES)[number];

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  title: string;
  role: InternalRole;
  organizationName: string;
}

export interface SessionData {
  mode: AuthMode;
  user: SessionUser;
}

export function isInternalRole(value: unknown): value is InternalRole {
  return typeof value === "string" && INTERNAL_ROLES.includes(value as InternalRole);
}
