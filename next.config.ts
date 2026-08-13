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

const canonicalProposalHost = "app.onebridgestalwart.com";
const deploymentHost = "franklin-ruddy.vercel.app";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Proposals are shared with clients under the Onebridge domain, so the
      // deployment hostname sends visitors to the canonical URL. Scoped to the
      // proposal pages on that host: every other route on the deployment
      // hostname, and the whole of app.onebridgestalwart.com, is untouched.
      // Single segment on purpose — the Open Graph card below it is served
      // directly, so scrapers never follow a redirect to reach the image.
      {
        source: "/propostas/:slug",
        has: [{ type: "host", value: deploymentHost }],
        destination: `https://${canonicalProposalHost}/propostas/:slug`,
        permanent: true,
      },
    ];
  },
  async headers() {
    // Every confidential proposal page, its generated Open Graph card and its
    // document assets stay out of search engines. Social scrapers ignore
    // X-Robots-Tag, so link previews keep working.
    return [
      {
        source: "/propostas/:path*",
        headers: confidentialProposalHeaders,
      },
      {
        source: "/proposal-assets/:path*",
        headers: confidentialProposalHeaders,
      },
    ];
  },
};

export default nextConfig;
