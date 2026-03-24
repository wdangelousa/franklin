import type { ReactNode } from "react";

import { AppShell } from "@/components/workspace/app-shell";
import { requireInternalSession } from "@/lib/auth/session";

export default async function WorkspaceLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  const session = await requireInternalSession();

  return <AppShell session={session}>{children}</AppShell>;
}
