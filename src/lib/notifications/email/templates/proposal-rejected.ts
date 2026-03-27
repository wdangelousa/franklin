import type { ProposalRejectedPayload } from "@/lib/notifications/types";

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

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f4efe7;color:#201b16;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4efe7;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
        <tr><td style="padding:32px 32px 0;">
          <p style="margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;color:#9b2c2c;">Proposta recusada</p>
          <h1 style="margin:0 0 16px;font-size:22px;color:#201b16;">Proposta não aceita</h1>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#3a3530;">
            A proposta <strong>${escapeHtml(payload.proposalNumber)}</strong> para <strong>${escapeHtml(payload.companyName)}</strong>
            foi recusada pelo cliente.
          </p>
        </td></tr>
        <tr><td style="padding:0 32px;">
          <table cellpadding="0" cellspacing="0" style="width:100%;">
            <tr><td style="padding:16px;background:#fef2f2;border-radius:6px;">
              <p style="margin:0;font-size:13px;color:#9b2c2c;">
                <strong>Recusada em:</strong> ${rejectedFormatted}
              </p>
              ${payload.rejectedReason ? `<p style="margin:8px 0 0;font-size:13px;color:#9b2c2c;"><strong>Motivo:</strong> ${escapeHtml(payload.rejectedReason)}</p>` : ""}
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:24px 32px 32px;">
          <p style="margin:0;font-size:13px;color:#685d53;line-height:1.5;">
            Acesse o Franklin para revisar o histórico e avaliar os próximos passos.
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
