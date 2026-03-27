"use client";

import { useCallback, useState } from "react";

import { IconCopy, IconExternalLink } from "@/components/ui/icons";

interface PaymentInstructionsProps {
  totalFormatted: string;
  proposalNumber: string;
  clientName: string;
}

const ZELLE_EMAIL = "pay@onebridgestalwart.com";
const WHATSAPP_NUMBER = "14078219738";

export function PaymentInstructions({
  totalFormatted,
  proposalNumber,
  clientName
}: PaymentInstructionsProps) {
  const whatsappMessage = `Olá! Aceitei a proposta ${proposalNumber} no valor de ${totalFormatted} e gostaria de receber o link de pagamento do Parcelado USA. Meu nome: ${clientName}`;
  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <article className="surface-card">
      <div className="section-head">
        <p className="eyebrow">Próximo passo</p>
        <h2>Instruções de pagamento</h2>
      </div>

      <p className="section-copy">
        Obrigado por aceitar a proposta! Para dar início ao trabalho, escolha a forma de pagamento:
      </p>

      <div className="payment-section">
        <div className="payment-option">
          <p className="payment-option-title">Pagamento via Zelle (EUA)</p>
          <p className="payment-option-detail">Envie para:</p>
          <span className="payment-email">{ZELLE_EMAIL}</span>
          <p className="payment-meta">
            Valor: <strong>{totalFormatted}</strong>
          </p>
          <p className="payment-meta">
            Referência: <strong>{proposalNumber}</strong>
          </p>
          <CopyZelleButton />
        </div>

        <div className="payment-option">
          <p className="payment-option-title">Pagamento pelo Brasil</p>
          <p className="payment-option-detail">
            Parcele em até 12x pelo Parcelado USA.
          </p>
          <a
            className="payment-brazil-button"
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconExternalLink size={16} /> Solicitar link de pagamento
          </a>
        </div>
      </div>
    </article>
  );
}

function CopyZelleButton() {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!navigator.clipboard?.writeText) {
      return;
    }

    try {
      await navigator.clipboard.writeText(ZELLE_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silently fail
    }
  }, []);

  return (
    <button className="button-secondary" type="button" onClick={handleCopy}>
      <IconCopy size={16} /> {copied ? "Copiado" : "Copiar email do Zelle"}
    </button>
  );
}
