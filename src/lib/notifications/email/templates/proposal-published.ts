import type { ProposalPublishedPayload } from "@/lib/notifications/types";

export function proposalPublishedSubject(payload: ProposalPublishedPayload): string {
  return `Proposta ${payload.proposalNumber} disponível para revisão`;
}

export function proposalPublishedHtml(payload: ProposalPublishedPayload): string {
  const expiresFormatted = payload.expiresAt.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric"
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
          <p style="margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;color:#685d53;">Proposta comercial</p>
          <h1 style="margin:0 0 16px;font-size:22px;color:#201b16;">Olá, ${escapeHtml(payload.clientName)}</h1>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#3a3530;">
            A equipe da <strong>Onebridge</strong> preparou uma proposta comercial para <strong>${escapeHtml(payload.companyName)}</strong>.
            Clique no link abaixo para revisar os termos, escopo e valores.
          </p>
        </td></tr>
        <tr><td style="padding:0 32px;">
          <table cellpadding="0" cellspacing="0" style="width:100%;">
            <tr><td style="padding:16px;background:#f9f6f2;border-radius:6px;">
              <p style="margin:0 0 8px;font-size:13px;color:#685d53;">Proposta ${escapeHtml(payload.proposalNumber)}</p>
              <a href="${escapeHtml(payload.publicLink)}" style="display:inline-block;padding:10px 24px;background:#173b34;color:#ffffff;text-decoration:none;border-radius:20px;font-size:14px;font-weight:600;">
                Revisar proposta
              </a>
              <p style="margin:12px 0 0;font-size:12px;color:#685d53;">
                Este link é válido até <strong>${expiresFormatted}</strong>.
              </p>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:24px 32px 32px;">
          <p style="margin:0;font-size:13px;color:#685d53;line-height:1.5;">
            Se você tiver dúvidas, responda diretamente a este e-mail ou entre em contato com ${escapeHtml(payload.publishedByName)}.
          </p>
        </td></tr>
        <tr><td style="padding:16px 32px;background:#f9f6f2;font-size:11px;color:#8a7f74;">
          Onebridge · Este e-mail foi enviado automaticamente pelo Franklin.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
