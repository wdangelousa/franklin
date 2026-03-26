"use client";

import { signInAsDemoUser } from "@/lib/auth/actions";
import { DEMO_ACCOUNTS } from "@/lib/auth/config";
import { StatusPill } from "@/components/ui/status-pill";

export function SignInForm() {
  return (
    <section className="surface-card auth-card">
      <div className="section-head">
        <p className="eyebrow">Login</p>
        <h2>Acesse sua conta</h2>
        <p className="section-copy">
          No MVP, o acesso interno utiliza perfis de demonstração temporários. Escolha um perfil abaixo para entrar.
        </p>
      </div>

      <div className="pill-row">
        <StatusPill tone="accent">Modo mock temporário</StatusPill>
        <StatusPill tone="neutral">Somente perfis internos</StatusPill>
      </div>

      <div className="auth-demo-accounts">
        {DEMO_ACCOUNTS.map((account) => (
          <form key={account.id} action={signInAsDemoUser}>
            <input name="accountId" type="hidden" value={account.id} />
            <button className="button-primary auth-demo-button" type="submit">
              <strong>{account.name}</strong>
              <span className="auth-demo-meta">
                {account.title} &middot; {account.role}
              </span>
            </button>
          </form>
        ))}
      </div>
    </section>
  );
}
