"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

import { acceptPublicProposal } from "@/lib/public-proposal-actions";

interface AcceptProposalFormProps {
  token: string;
  canAccept: boolean;
  status: string;
  statusMessage: string;
  acceptanceText?: string;
  compact?: boolean;
}

export function AcceptProposalForm({
  token,
  canAccept,
  status,
  statusMessage,
  acceptanceText,
  compact = false
}: AcceptProposalFormProps) {
  const [name, setName] = useState("");
  const [agreed, setAgreed] = useState(false);

  const isReady = canAccept && name.trim().length > 0 && agreed;

  const formClassName = [
    "public-accept-form",
    compact ? "compact" : "",
    compact ? "" : "is-primary-flow"
  ]
    .filter(Boolean)
    .join(" ");

  if (!canAccept) {
    return (
      <div className={formClassName}>
        <button
          className="button-primary public-accept-button"
          disabled
          type="button"
        >
          {getDisabledLabel(status)}
        </button>
        <p className="builder-actions-note">{statusMessage}</p>
      </div>
    );
  }

  return (
    <form action={acceptPublicProposal} className={formClassName}>
      <input name="token" type="hidden" value={token} />

      {acceptanceText ? (
        <p className="signature-acceptance-text">{acceptanceText}</p>
      ) : null}

      <div className="signature-field">
        <label className="signature-label" htmlFor={`name-${compact ? "compact" : "main"}`}>
          Seu nome completo
        </label>
        <input
          className="signature-input"
          id={`name-${compact ? "compact" : "main"}`}
          name="acceptedByName"
          onChange={(e) => setName(e.target.value)}
          placeholder="Digite seu nome completo"
          required
          type="text"
          value={name}
        />
      </div>

      <label className="signature-checkbox-label">
        <input
          checked={agreed}
          className="signature-checkbox"
          name="agreedToTerms"
          onChange={(e) => setAgreed(e.target.checked)}
          required
          type="checkbox"
          value="1"
        />
        <span>Li e concordo com os termos desta proposta</span>
      </label>

      <SubmitButton disabled={!isReady} />

      <a
        className="signature-reject-link"
        href="#rejeitar"
        onClick={(e) => {
          e.preventDefault();
          window.location.hash = "rejeitar";
          const target = document.getElementById("rejeitar");
          target?.scrollIntoView({ behavior: "smooth" });
        }}
      >
        Recusar esta proposta
      </a>
    </form>
  );
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      className="button-primary public-accept-button"
      disabled={disabled || pending}
      type="submit"
    >
      {pending ? "Registrando aceite…" : "Aceitar proposta"}
    </button>
  );
}

function getDisabledLabel(status: string): string {
  switch (status) {
    case "ACCEPTED":
      return "Proposta aceita";
    case "CANCELLED":
      return "Proposta cancelada";
    case "EXPIRED":
      return "Proposta expirada";
    case "DRAFT":
      return "Proposta indisponível";
    default:
      return "Aceitar proposta";
  }
}
