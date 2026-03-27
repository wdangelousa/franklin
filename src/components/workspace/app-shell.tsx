import type { ReactNode } from "react";

import { BrandMark } from "@/components/ui/brand-mark";
import { StatusPill } from "@/components/ui/status-pill";
import { signOut } from "@/lib/auth/actions";
import { getRoleDefinition } from "@/lib/auth/roles";
import type { SessionData } from "@/lib/auth/types";
import { getInitials } from "@/lib/utils";

import { BottomNav } from "./bottom-nav";
import { MobileHeader } from "./mobile-header";
import { SidebarNav } from "./sidebar-nav";

interface AppShellProps {
  session: SessionData;
  children: ReactNode;
}

export function AppShell({ session, children }: AppShellProps) {
  const roleDefinition = getRoleDefinition(session.user.role);

  return (
    <div className="workspace-shell">
      <MobileHeader session={session} />

      <aside className="workspace-sidebar">
        <BrandMark compact href="/app/dashboard" />

        <div className="sidebar-block">
          <p className="eyebrow">Navegação</p>
          <SidebarNav />
        </div>
      </aside>

      <div className="workspace-stage">
        <header className="workspace-topbar">
          <div className="workspace-topbar-actions">
            <p className="eyebrow">{roleDefinition.shellEyebrow}</p>

            <StatusPill tone={roleDefinition.tone}>
              {roleDefinition.label}
            </StatusPill>

            <div className="user-chip">
              <span className="user-avatar">{getInitials(session.user.name)}</span>
              <div>
                <strong>{session.user.name}</strong>
                <small>{session.user.email}</small>
              </div>
            </div>

            <form action={signOut}>
              <button className="button-secondary" type="submit">
                Sair
              </button>
            </form>
          </div>
        </header>

        <main className="workspace-content">{children}</main>
      </div>

      <BottomNav />
    </div>
  );
}
