"use client";

import { signInAsDemoUser } from "@/lib/auth/actions";
import { AUTH_MODE, DEMO_ACCOUNTS, isDemoLoginAllowed } from "@/lib/auth/config";
import { StatusPill } from "@/components/ui/status-pill";

interface SignInFormProps {
  oidcAvailable?: boolean;
  loginError?: string | null;
}

export function SignInForm({ oidcAvailable, loginError }: SignInFormProps) {
  // --- Strict mode with OIDC provider ---
  if (AUTH_MODE === "strict" && oidcAvailable) {
    return (
      <section className="surface-card auth-card">
        <div className="section-head">
          <p className="eyebrow">Login</p>
          <h2>Acesse sua conta</h2>
          <p className="section-copy">
            A autenticação está configurada com provedor corporativo. Clique abaixo para entrar.
          </p>
        </div>

        <div className="pill-row">
          <StatusPill tone="accent">Modo strict</StatusPill>
          <StatusPill tone="neutral">Autenticação corporativa</StatusPill>
        </div>

        {loginError ? (
          <div className="builder-inline-note">
            <strong>Erro no login</strong>
            <p>{mapLoginError(loginError)}</p>
          </div>
        ) : null}

        <form action="/api/auth/login" method="GET">
          <button className="button-primary auth-demo-button" type="submit">
            <strong>Entrar com provedor corporativo</strong>
            <span className="auth-demo-meta">OAuth / OIDC</span>
          </button>
        </form>
      </section>
    );
  }

  // --- Strict mode without OIDC provider ---
  if (AUTH_MODE === "strict") {
    return (
      <section className="surface-card auth-card">
        <div className="section-head">
          <p className="eyebrow">Login</p>
          <h2>Autenticação em modo strict</h2>
          <p className="section-copy">
            O sistema está configurado com <code>FRANKLIN_AUTH_MODE=&quot;strict&quot;</code>.
            O login por perfis de demonstração está desabilitado.
          </p>
          <p className="section-copy">
            Para acessar a área interna, configure as variáveis OIDC
            (<code>FRANKLIN_OIDC_ISSUER</code>, <code>FRANKLIN_OIDC_CLIENT_ID</code>,
            <code>FRANKLIN_OIDC_CLIENT_SECRET</code>)
            ou mude o modo para <code>&quot;mock&quot;</code> em desenvolvimento.
          </p>
        </div>

        <div className="pill-row">
          <StatusPill tone="warning">Modo strict ativo</StatusPill>
          <StatusPill tone="neutral">Provedor OIDC não configurado</StatusPill>
        </div>
      </section>
    );
  }

  // --- Mock mode ---
  const demoAllowed = isDemoLoginAllowed();

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

      {loginError ? (
        <div className="builder-inline-note">
          <strong>Erro no login</strong>
          <p>{mapLoginError(loginError)}</p>
        </div>
      ) : null}

      {demoAllowed ? (
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
      ) : null}
    </section>
  );
}

function mapLoginError(code: string): string {
  switch (code) {
    case "invalid_state":
      return "Estado de autenticação inválido. Tente novamente.";
    case "token_exchange_failed":
      return "Falha na troca de token com o provedor. Tente novamente.";
    case "no_access_token":
      return "O provedor não retornou um token de acesso.";
    case "userinfo_failed":
      return "Não foi possível obter informações do usuário.";
    case "incomplete_profile":
      return "O perfil do provedor está incompleto (email obrigatório).";
    case "oidc_config":
      return "Configuração OIDC incompleta. Verifique as variáveis de ambiente.";
    case "provider_error":
      return "O provedor de autenticação retornou um erro.";
    case "missing_params":
      return "Parâmetros de callback ausentes.";
    default:
      return "Ocorreu um erro no login. Tente novamente.";
  }
}
