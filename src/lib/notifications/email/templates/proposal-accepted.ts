import type { ProposalAcceptedPayload } from "@/lib/notifications/types";

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

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f4efe7;color:#201b16;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4efe7;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
        <tr><td style="padding:32px 32px 0;">
          <p style="margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;color:#2f6c55;">Proposta aceita</p>
          <h1 style="margin:0 0 16px;font-size:22px;color:#201b16;">Boa notícia</h1>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#3a3530;">
            A proposta <strong>${escapeHtml(payload.proposalNumber)}</strong> para <strong>${escapeHtml(payload.companyName)}</strong>
            foi aceita${payload.acceptedByName ? ` por <strong>${escapeHtml(payload.acceptedByName)}</strong>` : ""}.
          </p>
        </td></tr>
        <tr><td style="padding:0 32px;">
          <table cellpadding="0" cellspacing="0" style="width:100%;">
            <tr><td style="padding:16px;background:#e8f5e9;border-radius:6px;">
              <p style="margin:0;font-size:13px;color:#2f6c55;">
                <strong>Aceite registrado em:</strong> ${acceptedFormatted}
              </p>
              <p style="margin:8px 0 0;font-size:13px;color:#2f6c55;">
                O checklist pós-aceite já está disponível para o cliente.
              </p>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:24px 32px 32px;">
          <p style="margin:0;font-size:13px;color:#685d53;line-height:1.5;">
            Acesse o Franklin para revisar os próximos passos e o checklist interno.
          </p>
        </td></tr>
        <tr><td style="padding:16px 32px;background:#f9f6f2;font-size:11px;color:#8a7f74;">
          Onebridge · Notificação interna do Franklin.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
