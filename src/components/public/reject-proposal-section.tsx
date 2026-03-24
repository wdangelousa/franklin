"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

import { rejectPublicProposal } from "@/lib/public-proposal-actions";

interface RejectProposalSectionProps {
  token: string;
}

export function RejectProposalSection({ token }: RejectProposalSectionProps) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (window.location.hash === "#rejeitar") {
      setExpanded(true);
    }

    function onHashChange() {
      if (window.location.hash === "#rejeitar") {
        setExpanded(true);
      }
    }

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <section
      className={`reject-section${expanded ? " is-expanded" : ""}`}
      id="rejeitar"
    >
      <div className="reject-section-body">
        <div className="reject-section-inner">
          <h3 className="reject-section-heading">Recusar proposta</h3>

          <p className="reject-section-hint">
            Se preferir, compartilhe o motivo (opcional — ajuda a equipe a melhorar)
          </p>

          <form action={rejectPublicProposal} className="reject-section-form">
            <input name="token" type="hidden" value={token} />

            <textarea
              className="reject-section-textarea"
              name="rejectedReason"
              placeholder="Motivo da recusa (opcional)"
              rows={3}
            />

            <RejectButton />
          </form>

          <button
            className="reject-section-back"
            onClick={() => {
              setExpanded(false);
              window.history.replaceState(null, "", window.location.pathname + window.location.search);
            }}
            type="button"
          >
            Voltar
          </button>
        </div>
      </div>
    </section>
  );
}

function RejectButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="reject-section-confirm"
      disabled={pending}
      type="submit"
    >
      {pending ? "Registrando recusa…" : "Confirmar recusa"}
    </button>
  );
}
