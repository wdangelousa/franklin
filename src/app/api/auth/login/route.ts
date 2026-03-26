import { initiateOidcLogin } from "@/lib/auth/oidc-actions";

export const dynamic = "force-dynamic";

export async function GET() {
  await initiateOidcLogin();
}
