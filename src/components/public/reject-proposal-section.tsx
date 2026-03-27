"use client";

import { useCallback, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

import { IconArrowLeft, IconX } from "@/components/ui/icons";
import { rejectPublicProposal } from "@/lib/public-proposal-actions";

interface RejectProposalSectionProps {
  token: string;
}

export function RejectProposalSection({ token }: RejectProposalSectionProps) {
  const [expanded, setExpanded] = useState(false);

  const collapse = useCallback(() => {
    setExpanded(false);
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
  }, []);

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

  useEffect(() => {
    if (!expanded) return undefined;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") collapse();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [expanded, collapse]);

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
              aria-label="Motivo da recusa"
              className="reject-section-textarea"
              name="rejectedReason"
              placeholder="Motivo da recusa (opcional)"
              rows={3}
            />

            <RejectButton />
          </form>

          <button
            className="button-secondary reject-section-back"
            onClick={collapse}
            type="button"
          >
            <IconArrowLeft size={16} /> Cancelar e voltar
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
      {pending ? "Registrando recusa…" : <><IconX size={16} /> Confirmar recusa</>}
    </button>
  );
}
