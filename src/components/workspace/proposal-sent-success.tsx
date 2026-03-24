"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type { InternalProposalDetail } from "@/lib/proposal-store";

interface ProposalSentSuccessProps {
  proposal: InternalProposalDetail;
}

type CopyState = "idle" | "copied" | "error";

export function ProposalSentSuccess({ proposal }: ProposalSentSuccessProps) {
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const [absoluteLink, setAbsoluteLink] = useState("");

  useEffect(() => {
    if (proposal.publicLink) {
      const path = proposal.publicLink.startsWith("/")
        ? proposal.publicLink
        : `/${proposal.publicLink}`;
      setAbsoluteLink(`${window.location.origin}${path}`);
    }
  }, [proposal.publicLink]);

  useEffect(() => {
    if (copyState === "idle") {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      setCopyState("idle");
    }, 2000);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [copyState]);

  const copyLabel = useMemo(() => {
    if (copyState === "copied") {
      return "Link copiado \u2713";
    }

    if (copyState === "error") {
      return "Falha ao copiar";
    }

    return "Copiar link";
  }, [copyState]);

  async function handleCopy() {
    if (!absoluteLink || !navigator.clipboard?.writeText) {
      setCopyState("error");
      return;
    }

    try {
      await navigator.clipboard.writeText(absoluteLink);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
  }

  const whatsappMessage = buildWhatsAppMessage(proposal.contactName, absoluteLink);
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="sent-success-shell">
      <div className="sent-success-content">
        <div className="sent-success-icon" aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 className="sent-success-heading">Proposta enviada</h1>
        <p className="sent-success-subheading">para {proposal.companyName}</p>

        {proposal.contactEmail ? (
          <div className="sent-success-email-card">
            <span>Email enviado para {proposal.contactEmail} {"\u2713"}</span>
          </div>
        ) : (
          <div className="sent-success-email-card is-warning">
            <span>Nenhum email de contato cadastrado. Compartilhe o link manualmente.</span>
          </div>
        )}

        <div className="sent-success-actions">
          <a
            className="sent-success-whatsapp"
            href={whatsappHref}
            rel="noreferrer noopener"
            target="_blank"
          >
            Enviar via WhatsApp
          </a>

          <button
            className="button-secondary sent-success-copy"
            onClick={handleCopy}
            type="button"
          >
            {copyLabel}
          </button>
        </div>

        <Link
          className="sent-success-detail-link"
          href={`/app/proposals/${proposal.id}`}
        >
          Ver detalhes da proposta
        </Link>
      </div>
    </div>
  );
}

function buildWhatsAppMessage(contactName: string, publicLink: string): string {
  return `Olá ${contactName}! Conforme conversamos, segue a proposta da Onebridge:\n\n${publicLink}\n\nQualquer dúvida, estou à disposição.`;
}
