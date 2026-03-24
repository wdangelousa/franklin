"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { StatusPill } from "@/components/ui/status-pill";

export function SignUpForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Update display name
      await updateProfile(userCredential.user, {
        displayName: name,
      });
      router.push("/app/dashboard");
      router.refresh();
    } catch (err: any) {
      console.error("Signup error:", err);
      // Handle generic or specific errors (optional logic for user feedback)
      if (err.code === "auth/email-already-in-use") {
        setError("Este email já está em uso.");
      } else if (err.code === "auth/weak-password") {
        setError("A senha deve ter pelo menos 6 caracteres.");
      } else {
        setError("Erro ao criar conta. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="surface-card auth-card">
      <div className="section-head">
        <p className="eyebrow">Criar conta</p>
        <h2>Bem-vindo(a) ao Franklin</h2>
        <p className="section-copy">
          Preencha seus dados para solicitar acesso interno ao sistema.
        </p>
      </div>

      <div className="pill-row">
        <StatusPill tone="accent">Acesso Restrito</StatusPill>
        <StatusPill tone="neutral">Admins & Sócios</StatusPill>
      </div>

      <form onSubmit={handleSubmit} className="auth-form" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {error && (
          <div style={{ padding: '12px', background: '#ffebee', color: '#c62828', borderRadius: '4px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label htmlFor="name" style={{ fontSize: '14px', fontWeight: 500 }}>Nome Completo</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', background: 'transparent' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label htmlFor="email" style={{ fontSize: '14px', fontWeight: 500 }}>Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', background: 'transparent' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label htmlFor="password" style={{ fontSize: '14px', fontWeight: 500 }}>Senha</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', background: 'transparent' }}
          />
        </div>

        <button 
          className="button-primary" 
          type="submit" 
          disabled={loading}
          style={{ marginTop: '8px', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "Criando conta..." : "Criar conta"}
        </button>
      </form>
    </section>
  );
}
