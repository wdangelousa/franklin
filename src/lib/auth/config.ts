import type { SessionData, SessionUser } from "@/lib/auth/types";
import { brand } from "@/lib/brand";

export const SESSION_COOKIE_NAME = "franklin_session";

export const AUTH_MODE = process.env.FRANKLIN_AUTH_MODE === "strict" ? "strict" : "mock";

export const DEMO_ACCOUNTS: SessionUser[] = [
  {
    id: "evandro",
    name: "Professor Evandro",
    email: "pay@onebridgestalwart.com",
    title: "Sócio Fundador",
    role: "PARTNER",
    organizationName: brand.organizationName
  },
  {
    id: "samuel",
    name: "Samuel Marçal",
    email: "samuel@onebridgestalwart.com",
    title: "Sócio Operacional",
    role: "PARTNER",
    organizationName: brand.organizationName
  },
  {
    id: "walter",
    name: "Walter D'Angelo",
    email: "walter@onebridgestalwart.com",
    title: "Administrador da Plataforma",
    role: "ADMIN",
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
