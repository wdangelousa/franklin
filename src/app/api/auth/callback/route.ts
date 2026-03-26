import { redirect } from "next/navigation";

import { handleOidcCallback } from "@/lib/auth/oidc-actions";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    redirect(`/login?error=provider_error&detail=${encodeURIComponent(error)}`);
  }

  if (!code || !state) {
    redirect("/login?error=missing_params");
  }

  await handleOidcCallback(code, state);
}
