import type { SessionData, SessionUser } from "@/lib/auth/types";
import { brand } from "@/lib/brand";

export const SESSION_COOKIE_NAME = "franklin_session";

export const AUTH_MODE = process.env.FRANKLIN_AUTH_MODE === "strict" ? "strict" : "mock";

export const DEMO_ACCOUNTS: SessionUser[] = [
  {
    id: "demo-admin",
    name: "Camille Bennett",
    email: "camille@onebridge.example",
    title: "Administradora da plataforma",
    role: "ADMIN",
    organizationName: brand.organizationName
  },
  {
    id: "demo-partner",
    name: "Julian Hart",
    email: "julian@onebridge.example",
    title: "Sócio consultivo",
    role: "PARTNER",
    organizationName: brand.organizationName
  }
];

export const DEFAULT_DEMO_ACCOUNT = DEMO_ACCOUNTS[0];

export const DEMO_SESSION: SessionData = {
  mode: "mock",
  user: DEFAULT_DEMO_ACCOUNT
};

export function getDemoAccountById(accountId: string | null): SessionUser {
  return DEMO_ACCOUNTS.find((account) => account.id === accountId) ?? DEFAULT_DEMO_ACCOUNT;
}
