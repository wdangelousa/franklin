import { AUTH_MODE, DEMO_ACCOUNTS } from "@/lib/auth/config";
import { getRoleDefinition } from "@/lib/auth/roles";
import { StatusPill } from "@/components/ui/status-pill";
import { signInAsDemoUser } from "@/lib/auth/actions";

export function SignInForm() {
  return (
    <section className="surface-card auth-card">
      <div className="section-head">
        <p className="eyebrow">Login</p>
        <h2>Selecione um perfil interno</h2>
        <p className="section-copy">
          Este scaffold usa uma sessão demo segura com cookie para validar perfis, redirecionamentos
          e proteção de rotas antes da entrada de um provedor real de identidade.
        </p>
      </div>

      <div className="pill-row">
        <StatusPill tone="accent">
          {AUTH_MODE === "mock" ? "Auth demo habilitada" : "Modo estrito"}
        </StatusPill>
        <StatusPill tone="neutral">Somente perfis internos</StatusPill>
      </div>

      <form action={signInAsDemoUser} className="auth-form">
        <fieldset className="account-picker">
          <legend>Identidades de demonstração</legend>
          {DEMO_ACCOUNTS.map((account, index) => {
            const roleDefinition = getRoleDefinition(account.role);

            return (
              <label key={account.id} className="auth-account">
                <input
                  defaultChecked={index === 0}
                  name="accountId"
                  type="radio"
                  value={account.id}
                />

                <span className="auth-account-panel">
                  <span className="auth-account-head">
                    <strong>{account.name}</strong>
                    <StatusPill tone={roleDefinition.tone}>{roleDefinition.label}</StatusPill>
                  </span>

                  <span className="auth-account-title">{account.title}</span>
                  <span className="auth-account-email">{account.email}</span>
                  <span className="auth-account-summary">{roleDefinition.summary}</span>
                </span>
              </label>
            );
          })}
        </fieldset>

        <div className="auth-footnote">
          <p>
            Usuários clientes não recebem credenciais internas no MVP. A revisão pública de
            propostas permanece isolada deste fluxo de login.
          </p>
        </div>

        <button className="button-primary" type="submit">
          Entrar na área interna
        </button>
      </form>
    </section>
  );
}
