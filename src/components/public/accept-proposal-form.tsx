"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

import { IconCheck } from "@/components/ui/icons";
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
  const [confirming, setConfirming] = useState(false);

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
          aria-required="true"
          className="signature-input"
          id={`name-${compact ? "compact" : "main"}`}
          name="acceptedByName"
          onChange={(e) => { setName(e.target.value); setConfirming(false); }}
          placeholder="Digite seu nome completo"
          required
          type="text"
          value={name}
        />
      </div>

      <label className="signature-checkbox-label">
        <input
          aria-required="true"
          checked={agreed}
          className="signature-checkbox"
          name="agreedToTerms"
          onChange={(e) => { setAgreed(e.target.checked); setConfirming(false); }}
          required
          type="checkbox"
          value="1"
        />
        <span>Li e concordo com os termos desta proposta</span>
      </label>

      {confirming ? (
        <div className="accept-confirm-step">
          <div className="accept-confirm-message" role="alert">
            Ao confirmar, a proposta será aceita em nome de <strong>{name.trim()}</strong>. Esta ação não pode ser revertida.
          </div>
          <SubmitButton disabled={!isReady} />
          <button
            className="button-secondary"
            onClick={() => setConfirming(false)}
            type="button"
          >
            Voltar
          </button>
        </div>
      ) : (
        <button
          className="button-primary public-accept-button"
          disabled={!isReady}
          onClick={(e) => { e.preventDefault(); setConfirming(true); }}
          type="button"
        >
          <IconCheck size={16} /> Aceitar proposta
        </button>
      )}

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
      {pending ? "Registrando aceite…" : <><IconCheck size={16} /> Confirmar aceite definitivo</>}
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
