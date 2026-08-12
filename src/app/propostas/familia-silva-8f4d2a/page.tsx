import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Proposta Família Silva | Onebridge",
  description: "Proposta confidencial de arquitetura patrimonial, societária e fiscal Brasil-Estados Unidos.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function FamiliaSilvaProposalPage() {
  return (
    <main
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        background: "#e7ecf1",
      }}
    >
      <iframe
        src="/proposal-assets/familia-silva-8f4d2a.html"
        title="Proposta comercial da Família Silva"
        style={{ width: "100%", height: "100%", border: 0, display: "block" }}
      />
    </main>
  );
}
