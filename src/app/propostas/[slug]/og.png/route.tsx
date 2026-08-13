import { readFile } from "node:fs/promises";
import path from "node:path";

import { ImageResponse } from "next/og";

import {
  PROPOSAL_OG_IMAGE_SIZE,
  PROPOSAL_SHARE_LOGO_PATH,
  getProposalPage,
  proposalPages,
  type ProposalPage
} from "@/lib/proposal-share";

/**
 * Open Graph card for a confidential proposal, rendered from the proposal's own
 * data. Prerendered at build time so the URL is a plain static asset: no cold
 * start, no session, no dependency on the Vercel deployment protection.
 *
 * The composition mirrors the cover of the proposal document — paper ground,
 * hairline rules, the Onebridge lockup and a single lime accent.
 */

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return proposalPages.map((page) => ({ slug: page.slug }));
}

const PAPER = "#ffffff";
const INK = "#151923";
const MUTED = "#667080";
const FAINT = "#9aa3af";
const LINE = "#dbe1e8";
const HAIRLINE = "#eef1f4";
const LIME_DARK = "#9ab700";

async function loadLogoDataUrl(): Promise<string> {
  const file = await readFile(path.join(process.cwd(), PROPOSAL_SHARE_LOGO_PATH));
  return `data:image/png;base64,${file.toString("base64")}`;
}

function ShareCard({ page, logoSrc }: { page: ProposalPage; logoSrc: string }) {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        background: PAPER,
        padding: "54px 72px 46px",
        color: INK
      }}
    >
      {/* Concentric hairlines echoing the circle on the document cover. */}
      <div
        style={{
          position: "absolute",
          top: -286,
          right: -308,
          width: 780,
          height: 780,
          borderRadius: 390,
          border: `1px solid ${HAIRLINE}`
        }}
      />
      <div
        style={{
          position: "absolute",
          top: -168,
          right: -196,
          width: 545,
          height: 545,
          borderRadius: 273,
          border: `1px solid ${HAIRLINE}`
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          borderBottom: `1px solid ${LINE}`,
          paddingBottom: 26
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={268} height={68} alt="" />
        <span style={{ fontSize: 13, letterSpacing: "0.24em", color: FAINT }}>
          DOCUMENTO CONFIDENCIAL
        </span>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          justifyContent: "center"
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ width: 36, height: 3, background: LIME_DARK, marginRight: 18 }} />
          <span style={{ fontSize: 16, letterSpacing: "0.26em", color: LIME_DARK }}>
            {page.eyebrow}
          </span>
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 96,
            lineHeight: 1.04,
            letterSpacing: "-0.045em",
            color: INK
          }}
        >
          {page.clientName}
        </div>
        <div style={{ marginTop: 24, fontSize: 29, letterSpacing: "-0.01em", color: MUTED }}>
          {page.subtitle}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: `1px solid ${LINE}`,
          paddingTop: 26
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{ width: 8, height: 8, borderRadius: 4, background: LIME_DARK, marginRight: 14 }}
          />
          <span style={{ fontSize: 14, letterSpacing: "0.22em", color: MUTED }}>
            {page.jurisdiction}
          </span>
        </div>
        <span style={{ fontSize: 13, letterSpacing: "0.22em", color: FAINT }}>
          ONEBRIDGE STALWART · ORLANDO, FLORIDA
        </span>
      </div>
    </div>
  );
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getProposalPage(slug);

  if (!page) {
    return new Response("Not found", { status: 404 });
  }

  const logoSrc = await loadLogoDataUrl();

  return new ImageResponse(<ShareCard page={page} logoSrc={logoSrc} />, {
    ...PROPOSAL_OG_IMAGE_SIZE
  });
}
