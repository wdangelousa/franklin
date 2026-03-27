import { brand } from "@/lib/brand";
import type { ProposalRejectedPayload } from "@/lib/notifications/types";
import { emailLayout, esc } from "@/lib/notifications/email/templates/layout";

export function proposalRejectedSubject(payload: ProposalRejectedPayload): string {
  return `Proposta ${payload.proposalNumber} recusada por ${payload.companyName}`;
}

export function proposalRejectedHtml(payload: ProposalRejectedPayload): string {
  const rejectedFormatted = payload.rejectedAt.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  const reasonRow = payload.rejectedReason
    ? `<p style="margin:8px 0 0;font-size:13px;color:#9b2c2c;"><strong>Motivo:</strong> ${esc(payload.rejectedReason)}</p>`
    : "";

  return emailLayout({
    body: `
        <!-- Heading -->
        <tr><td style="padding:32px 40px 0;">
          <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#9b2c2c;">Proposta recusada</p>
          <h1 style="margin:0 0 20px;font-size:24px;font-weight:700;color:#201b16;line-height:1.3;">
            Proposta não aceita
          </h1>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#3a3530;">
            A proposta <strong>${esc(payload.proposalNumber)}</strong> para
            <strong>${esc(payload.companyName)}</strong> foi recusada pelo cliente.
          </p>
        </td></tr>

        <!-- Status card -->
        <tr><td style="padding:0 40px 24px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;background-color:#fef2f2;border:1px solid #fecaca;border-radius:8px;">
            <tr><td style="padding:20px 24px;">
              <p style="margin:0;font-size:14px;color:#9b2c2c;">
                <strong>Recusada em:</strong> ${rejectedFormatted}
              </p>
              ${reasonRow}
            </td></tr>
          </table>
        </td></tr>

        <!-- Next steps -->
        <tr><td style="padding:0 40px 8px;">
          <p style="margin:0;font-size:14px;color:#685d53;line-height:1.6;">
            Revise o histórico e avalie os próximos passos na área de propostas.
          </p>
        </td></tr>`,
    signature: false
  });
}
