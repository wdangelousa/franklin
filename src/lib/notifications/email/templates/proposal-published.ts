import { brand } from "@/lib/brand";
import type { ProposalPublishedPayload } from "@/lib/notifications/types";
import { emailLayout, esc } from "@/lib/notifications/email/templates/layout";

export function proposalPublishedSubject(payload: ProposalPublishedPayload): string {
  return `Proposta ${payload.proposalNumber} — ${brand.organizationName}`;
}

export function proposalPublishedHtml(payload: ProposalPublishedPayload): string {
  const expiresFormatted = payload.expiresAt.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });

  return emailLayout({
    body: `
        <!-- Greeting -->
        <tr><td style="padding:32px 40px 0;">
          <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#8a7f74;">Proposta comercial</p>
          <h1 style="margin:0 0 20px;font-size:24px;font-weight:700;color:#201b16;line-height:1.3;">
            Sua proposta está pronta para revisão
          </h1>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#3a3530;">
            Olá, ${esc(payload.clientName)}. Preparei uma proposta comercial para a
            <strong>${esc(payload.companyName)}</strong> em nome da
            <strong>${esc(brand.organizationName)}</strong>.
            Você pode revisar os termos, escopo e valores pelo link abaixo.
          </p>
        </td></tr>

        <!-- Proposal card -->
        <tr><td style="padding:0 40px 24px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;background-color:#F9FAFB;border:1px solid #E5E7EB;border-radius:8px;">
            <tr><td style="padding:20px 24px;">
              <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#8a7f74;">
                Referência
              </p>
              <p style="margin:0 0 16px;font-size:16px;font-weight:600;color:#201b16;">
                ${esc(payload.proposalNumber)}
              </p>
              <!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${esc(payload.publicLink)}" style="height:44px;width:200px;" arcsize="18%" fillcolor="#1F4D3A" stroke="f"><v:textbox inset="0,0,0,0"><center style="color:#ffffff;font-size:14px;font-weight:600;">Revisar proposta</center></v:textbox></v:roundrect><![endif]-->
              <!--[if !mso]><!-->
              <a href="${esc(payload.publicLink)}" style="display:inline-block;padding:12px 28px;background-color:#1F4D3A;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;line-height:1;">
                Revisar proposta
              </a>
              <!--<![endif]-->
              <p style="margin:14px 0 0;font-size:12px;color:#8a7f74;">
                Este link é válido até <strong style="color:#685d53;">${expiresFormatted}</strong>.
              </p>
            </td></tr>
          </table>
        </td></tr>

        <!-- Closing -->
        <tr><td style="padding:0 40px 8px;">
          <p style="margin:0;font-size:14px;color:#685d53;line-height:1.6;">
            Caso tenha dúvidas, fique à vontade para me responder diretamente.
          </p>
        </td></tr>`,
    signature: true
  });
}
