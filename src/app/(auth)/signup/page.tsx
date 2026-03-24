import Link from "next/link";

import { SignUpForm } from "@/components/auth/sign-up-form";
import { BrandMark } from "@/components/ui/brand-mark";
import { StatusPill } from "@/components/ui/status-pill";

export default function SignUpPage() {
  return (
    <main className="auth-grid">
      <section className="auth-copy">
        <BrandMark />
        <p className="eyebrow">Acesso interno</p>
        <h1>Cadastro da área interna protegida do Franklin.</h1>
        <p className="section-copy">
          No MVP, o acesso é limitado a administradores e sócios internos.
        </p>

        <div className="pill-row">
          <StatusPill tone="accent">Rotas internas protegidas</StatusPill>
          <StatusPill tone="neutral">Apenas administrador e sócio</StatusPill>
        </div>

        <div className="inline-actions">
          <Link className="button-secondary" href="/login">
            Voltar para o login
          </Link>
        </div>
      </section>

      <SignUpForm />
    </main>
  );
}
