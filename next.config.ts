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

const proposalPath = "/propostas/familia-silva-8f4d2a";
const canonicalProposalHost = "app.onebridgestalwart.com";
const deploymentHost = "franklin-ruddy.vercel.app";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // The proposal is shared with the client under the Onebridge domain, so the
      // deployment hostname sends visitors to the canonical URL. Scoped to this one
      // path and host: every other route on the deployment hostname, and the whole
      // of app.onebridgestalwart.com, is untouched.
      {
        source: proposalPath,
        has: [{ type: "host", value: deploymentHost }],
        destination: `https://${canonicalProposalHost}${proposalPath}`,
        permanent: true,
      },
    ];
  },
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
