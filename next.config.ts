import type { NextConfig } from "next";

const confidentialProposalHeaders = [
  {
    key: "X-Robots-Tag",
    value: "noindex, nofollow, noarchive, nosnippet, noimageindex",
  },
  {
    key: "Referrer-Policy",
    value: "no-referrer",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/propostas/familia-silva-8f4d2a",
        headers: confidentialProposalHeaders,
      },
      {
        source: "/proposal-assets/familia-silva-8f4d2a.html",
        headers: confidentialProposalHeaders,
      },
      {
        source: "/proposal-assets/familia-silva-8f4d2a.pdf",
        headers: confidentialProposalHeaders,
      },
    ];
  },
};

export default nextConfig;
