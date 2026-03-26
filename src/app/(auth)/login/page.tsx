import Image from "next/image";
import Link from "next/link";

import { SignInForm } from "@/components/auth/sign-in-form";
import { BrandMark } from "@/components/ui/brand-mark";
import { StatusPill } from "@/components/ui/status-pill";
import { AUTH_MODE } from "@/lib/auth/config";
import { getOidcConfig } from "@/lib/auth/oidc-config";

interface LoginPageProps {
  searchParams?: Promise<{
    error?: string;
    detail?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const query = searchParams ? await searchParams : undefined;

  // Check OIDC availability for strict mode
  let oidcAvailable = false;
  if (AUTH_MODE === "strict") {
    const { config } = await getOidcConfig();
    oidcAvailable = config !== null;
  }

  return (
    <main className="auth-grid">
      <section className="auth-copy">
        <div className="auth-brand-lockup">
          <BrandMark />
          <Image
            src="/icone-franklin.png"
            alt="Icone do Franklin"
            width={92}
            height={92}
            className="login-icon auth-brand-symbol"
            priority
          />
        </div>
        <p className="eyebrow">Acesso interno</p>
        <h1>Login da área interna protegida do Franklin.</h1>
        <p className="section-copy">
          {AUTH_MODE === "strict"
            ? "O acesso é controlado por autenticação corporativa. Clientes continuam acessando propostas por links públicos com token."
            : "No MVP, o acesso é limitado a administradores e sócios internos. Clientes não fazem login aqui e continuam acessando propostas por links públicos com token."}
        </p>

        <div className="pill-row">
          <StatusPill tone="accent">Rotas internas protegidas</StatusPill>
          <StatusPill tone="neutral">Apenas administrador e sócio</StatusPill>
          <StatusPill tone="neutral">Acesso do cliente continua público</StatusPill>
        </div>

        <div className="auth-highlights">
          <article className="note-card auth-highlight">
            <strong>Perfis internos</strong>
            <p>A área interna do Franklin suporta apenas sessões ADMIN e PARTNER.</p>
          </article>

          <article className="note-card auth-highlight">
            <strong>
              {AUTH_MODE === "strict" ? "Autenticação corporativa" : "Modo temporário"}
            </strong>
            <p>
              {AUTH_MODE === "strict"
                ? "O login usa um provedor OIDC/OAuth configurado pelo administrador."
                : "O login demo atual é provisório e não substitui um sistema definitivo de autenticação."}
            </p>
          </article>

          <article className="note-card auth-highlight">
            <strong>Limite de rota</strong>
            <p>Tudo sob /app exige uma sessão interna autenticada antes da renderização.</p>
          </article>

          <article className="note-card auth-highlight">
            <strong>Postura do cliente</strong>
            <p>A revisão de propostas continua separada do login interno e permanece na rota pública.</p>
          </article>
        </div>

        <div className="inline-actions">
          <Link className="button-secondary" href="/">
            Voltar para a visão geral
          </Link>
        </div>
      </section>

      <div className="auth-panel">
        <SignInForm
          oidcAvailable={oidcAvailable}
          loginError={query?.error ?? null}
        />
      </div>
    </main>
  );
}
