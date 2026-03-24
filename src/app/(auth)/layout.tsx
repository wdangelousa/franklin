import type { ReactNode } from "react";

import { redirectAuthenticatedUser } from "@/lib/auth/session";

export default async function AuthLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  await redirectAuthenticatedUser();

  return <div className="auth-shell">{children}</div>;
}
