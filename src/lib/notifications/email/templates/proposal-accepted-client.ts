import { brand } from "@/lib/brand";
import type { ProposalAcceptedClientPayload } from "@/lib/notifications/types";
import { emailLayout, esc } from "@/lib/notifications/email/templates/layout";

export function proposalAcceptedClientSubject(
  payload: ProposalAcceptedClientPayload
): string {
  return `Confirmação de aceite — Proposta ${payload.proposalNumber}`;
}

export function proposalAcceptedClientHtml(payload: ProposalAcceptedClientPayload): string {
  const acceptedFormatted = payload.acceptedAt.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  return emailLayout({
    body: `
        <tr><td style="padding:32px 40px 0;">
          <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#2f6c55;">
            Confirmação de aceite
          </p>
          <h1 style="margin:0 0 20px;font-size:24px;font-weight:700;color:#201b16;line-height:1.3;">
            Proposta aceita com sucesso
          </h1>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#3a3530;">
            Olá, ${esc(payload.clientName)}. Sua proposta
            <strong>${esc(payload.proposalNumber)}</strong> para
            <strong>${esc(payload.companyName)}</strong> foi aceita com sucesso em
            <strong>${acceptedFormatted}</strong>.
          </p>
          ${
            payload.acceptedByName
              ? `<p style="margin:0 0 24px;font-size:14px;line-height:1.7;color:#685d53;">
            Aceite registrado por <strong>${esc(payload.acceptedByName)}</strong>.
          </p>`
              : `<div style="height:24px;line-height:24px;">&nbsp;</div>`
          }
        </td></tr>

        <tr><td style="padding:0 40px 24px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;background-color:#f0faf4;border:1px solid #c6e9d5;border-radius:8px;">
            <tr><td style="padding:20px 24px;">
              <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#2f6c55;">
                Resumo
              </p>
              <p style="margin:0 0 12px;font-size:15px;color:#201b16;">
                <strong>Proposta:</strong> ${esc(payload.proposalNumber)}
              </p>
              <p style="margin:0 0 12px;font-size:15px;color:#201b16;">
                <strong>Investimento total:</strong> ${esc(payload.totalFormatted)}
              </p>
              <p style="margin:0;font-size:15px;color:#201b16;">
                <strong>Data do aceite:</strong> ${acceptedFormatted}
              </p>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:0 40px 24px;">
          <!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${esc(payload.pdfLink)}" style="height:44px;width:240px;" arcsize="18%" fillcolor="#1F4D3A" stroke="f"><v:textbox inset="0,0,0,0"><center style="color:#ffffff;font-size:14px;font-weight:600;">Ver documento da proposta</center></v:textbox></v:roundrect><![endif]-->
          <!--[if !mso]><!-->
          <a href="${esc(payload.pdfLink)}" style="display:inline-block;padding:12px 28px;background-color:#1F4D3A;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;line-height:1;">
            Ver documento da proposta
          </a>
          <!--<![endif]-->
          <p style="margin:16px 0 0;font-size:14px;line-height:1.7;color:#685d53;">
            Este documento serve como confirmação formal dos termos acordados. Guarde este link para referência futura.
          </p>
        </td></tr>

        <tr><td style="padding:0 40px 8px;">
          <p style="margin:0;font-size:14px;line-height:1.7;color:#685d53;">
            A equipe da ${esc(brand.organizationName)} entrará em contato com as instruções de pagamento e os próximos passos.
          </p>
        </td></tr>`,
    signature: true
  });
}
