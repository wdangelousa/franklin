import Image from "next/image";
import Link from "next/link";

import { SignInForm } from "@/components/auth/sign-in-form";
import { BrandMark } from "@/components/ui/brand-mark";
import { IconArrowLeft } from "@/components/ui/icons";
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
        <h1>Login da área interna do Franklin.</h1>
        <p className="section-copy">
          {AUTH_MODE === "strict"
            ? "Acesso controlado por autenticação corporativa."
            : "Acesso restrito a administradores e sócios internos."}
        </p>

        <div className="pill-row">
          <StatusPill tone="accent">Acesso restrito</StatusPill>
          <StatusPill tone="neutral">Admin e sócio</StatusPill>
        </div>

        <div className="auth-highlights">
          <article className="note-card auth-highlight">
            <strong>Acesso restrito</strong>
            <p>Apenas membros internos com perfil ADMIN ou PARTNER podem acessar esta área.</p>
          </article>

          <article className="note-card auth-highlight">
            <strong>Propostas para clientes</strong>
            <p>Clientes acessam propostas por links privados — não precisam de login.</p>
          </article>
        </div>

        <div className="inline-actions">
          <Link className="button-secondary" href="/">
            <IconArrowLeft size={16} /> Voltar
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
