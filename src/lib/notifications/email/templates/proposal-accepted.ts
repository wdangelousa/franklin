import { brand } from "@/lib/brand";
import type { ProposalAcceptedPayload } from "@/lib/notifications/types";
import { emailLayout, esc } from "@/lib/notifications/email/templates/layout";

export function proposalAcceptedSubject(payload: ProposalAcceptedPayload): string {
  return `Proposta ${payload.proposalNumber} aceita por ${payload.companyName}`;
}

export function proposalAcceptedHtml(payload: ProposalAcceptedPayload): string {
  const acceptedFormatted = payload.acceptedAt.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  return emailLayout({
    body: `
        <!-- Heading -->
        <tr><td style="padding:32px 40px 0;">
          <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#2f6c55;">Proposta aceita</p>
          <h1 style="margin:0 0 20px;font-size:24px;font-weight:700;color:#201b16;line-height:1.3;">
            Boa notícia
          </h1>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#3a3530;">
            A proposta <strong>${esc(payload.proposalNumber)}</strong> para
            <strong>${esc(payload.companyName)}</strong> foi aceita${payload.acceptedByName ? ` por <strong>${esc(payload.acceptedByName)}</strong>` : ""}.
          </p>
        </td></tr>

        <!-- Status card -->
        <tr><td style="padding:0 40px 24px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;background-color:#f0faf4;border:1px solid #c6e9d5;border-radius:8px;">
            <tr><td style="padding:20px 24px;">
              <p style="margin:0;font-size:14px;color:#2f6c55;">
                <strong>Aceite registrado em:</strong> ${acceptedFormatted}
              </p>
              <p style="margin:8px 0 0;font-size:13px;color:#2f6c55;">
                O checklist pós-aceite já está disponível para o cliente.
              </p>
            </td></tr>
          </table>
        </td></tr>

        <!-- Next steps -->
        <tr><td style="padding:0 40px 8px;">
          <p style="margin:0;font-size:14px;color:#685d53;line-height:1.6;">
            Revise os próximos passos e o checklist interno na área de propostas.
          </p>
        </td></tr>`,
    signature: false
  });
}
