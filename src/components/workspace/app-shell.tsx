import type { ReactNode } from "react";

import { BrandMark } from "@/components/ui/brand-mark";
import { StatusPill } from "@/components/ui/status-pill";
import { signOut } from "@/lib/auth/actions";
import { getRoleDefinition } from "@/lib/auth/roles";
import type { SessionData } from "@/lib/auth/types";
import { getInitials } from "@/lib/utils";

import { SidebarNav } from "./sidebar-nav";

interface AppShellProps {
  session: SessionData;
  children: ReactNode;
}

export function AppShell({ session, children }: AppShellProps) {
  const roleDefinition = getRoleDefinition(session.user.role);

  return (
    <div className="workspace-shell">
      <aside className="workspace-sidebar">
        <BrandMark compact href="/app/dashboard" />

        <div className="sidebar-block">
          <p className="eyebrow">Área interna</p>
          <SidebarNav />
        </div>

        <div className="sidebar-card">
          <p className="eyebrow">Modelo de acesso</p>
          <h2>Área interna protegida</h2>
          <p>
            No MVP, as rotas internas do Franklin são limitadas a sessões de administrador e sócio.
            O acesso do cliente permanece apenas nos links públicos de proposta.
          </p>
        </div>
      </aside>

      <div className="workspace-stage">
        <header className="workspace-topbar">
          <div className="workspace-topbar-main">
            <p className="eyebrow">{roleDefinition.shellEyebrow}</p>
            <h1>Área interna protegida</h1>
            <p className="workspace-topbar-copy">{roleDefinition.shellSummary}</p>
          </div>

          <div className="workspace-topbar-actions">
            <StatusPill tone={session.mode === "mock" ? "accent" : "neutral"}>
              {session.mode === "mock" ? "Sessão demo" : "Protegido"}
            </StatusPill>

            <StatusPill tone={roleDefinition.tone}>
              {roleDefinition.label}
            </StatusPill>

            <div className="user-chip">
              <span className="user-avatar">{getInitials(session.user.name)}</span>
              <div>
                <strong>{session.user.name}</strong>
                <span>{session.user.title}</span>
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
    </div>
  );
}
