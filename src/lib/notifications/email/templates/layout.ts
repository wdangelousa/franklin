import { brand } from "@/lib/brand";
import { getPublicBaseUrl } from "@/lib/urls";

/**
 * Shared email layout for all Onebridge Stalwart transactional emails.
 *
 * Design:
 * - 600px max width, centered
 * - Logo header
 * - White card on warm paper background
 * - Personal signature from Samuel
 * - Institutional footer
 *
 * Compatibility:
 * - All layout via <table> (Outlook-safe)
 * - All styles inline (Gmail-safe)
 * - No CSS classes, no external stylesheets
 * - Absolute image URLs only
 */

interface EmailLayoutOptions {
  /** Email body content (HTML string, placed inside the main card) */
  body: string;
  /** Whether to include the personal signature. Default: true */
  signature?: boolean;
}

function getLogoUrl(): string {
  const url = `${getPublicBaseUrl()}/logo.png`;
  console.log("[DEBUG email-logo] Logo URL:", url);
  return url;
}

export function emailLayout(options: EmailLayoutOptions): string {
  const { body, signature = true } = options;
  const logoUrl = getLogoUrl();

  const signatureBlock = signature
    ? `
        <tr><td style="padding:0 40px 32px;">
          <table cellpadding="0" cellspacing="0" style="border-top:1px solid #e8e4de;width:100%;">
            <tr><td style="padding:20px 0 0;">
              <p style="margin:0;font-size:14px;font-weight:600;color:#201b16;">
                ${esc(brand.senderPersonName)}
              </p>
              <p style="margin:2px 0 0;font-size:13px;color:#685d53;">
                ${esc(brand.organizationName)}
              </p>
              <p style="margin:2px 0 0;">
                <a href="mailto:${esc(brand.senderEmail)}" style="font-size:13px;color:#1F4D3A;text-decoration:none;">
                  ${esc(brand.senderEmail)}
                </a>
              </p>
            </td></tr>
          </table>
        </td></tr>`
    : "";

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(brand.organizationName)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4efe7;color:#201b16;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <!--[if mso]><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center"><![endif]-->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4efe7;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:8px;overflow:hidden;">

        <!-- HEADER: Logo -->
        <tr><td align="center" style="padding:28px 40px 20px;border-bottom:1px solid #f0ebe4;">
          <img
            src="${esc(logoUrl)}"
            alt="${esc(brand.organizationName)}"
            height="36"
            style="display:block;height:36px;width:auto;border:0;outline:none;"
          />
        </td></tr>

        <!-- BODY -->
${body}

        <!-- SIGNATURE -->
${signatureBlock}

        <!-- FOOTER -->
        <tr><td style="padding:20px 40px;background-color:#f9f6f2;border-top:1px solid #f0ebe4;">
          <p style="margin:0;font-size:11px;color:#8a7f74;text-align:center;line-height:1.5;">
            ${esc(brand.legalName)} · ${esc(brand.location)}
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
  <!--[if mso]></td></tr></table><![endif]-->
</body>
</html>`.trim();
}

/** Escape HTML for safe embedding in templates. */
export function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
