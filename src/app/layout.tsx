import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";

import "@/app/globals.css";
import { brand } from "@/lib/brand";

export const viewport: Viewport = {
  viewportFit: "cover"
};

export const metadata: Metadata = {
  title: {
    default: `${brand.platformName} | ${brand.productLabel}`,
    template: `%s | ${brand.platformName}`
  },
  description: brand.tagline
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
