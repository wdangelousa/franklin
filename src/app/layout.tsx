import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";

import "@/app/globals.css";
import { brand } from "@/lib/brand";

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: "#173b34"
};

export const metadata: Metadata = {
  metadataBase: new URL("https://app.onebridgestalwart.com"),
  title: {
    default: `${brand.platformName} | ${brand.productLabel}`,
    template: `%s | ${brand.platformName}`
  },
  description: brand.tagline,
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png"
  },
  openGraph: {
    title: `${brand.organizationName} — Sistema de propostas`,
    description: brand.tagline,
    url: "https://app.onebridgestalwart.com",
    siteName: brand.organizationName,
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: `${brand.organizationName} — Sistema de propostas`
      }
    ]
  },
  twitter: {
    card: "summary",
    title: `${brand.organizationName} — Sistema de propostas`,
    description: brand.tagline,
    images: ["/opengraph-image.png"]
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="app-body">{children}</body>
    </html>
  );
}
