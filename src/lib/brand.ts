/**
 * Brand configuration.
 *
 * "platformName" is internal only — never shown to clients.
 * All client-facing text must use organizationName, legalName, or sender*.
 */
export const brand = {
  /** Internal system name. Never expose to clients. */
  platformName: "Franklin",
  parentName: "Onebridge",
  organizationName: "Onebridge Stalwart",
  legalName: "Onebridge Stalwart LLC",
  organizationSlug: "onebridge-stalwart",
  productLabel: "Sistema operacional consultivo",
  tagline:
    "Infraestrutura premium de workflow para equipes consultivas que gerenciam leads, desenho de serviços e entrega de propostas.",
  supportEmail: "walter@onebridgestalwart.com",
  location: "Orlando, FL",
  logoUrl: "https://onebridgestalwart.com/logo.png",

  /** Client-facing email sender identity. */
  senderName: "Samuel | Onebridge Stalwart",
  senderEmail: "samuel@onebridgestalwart.com",
  senderPersonName: "Samuel"
} as const;
