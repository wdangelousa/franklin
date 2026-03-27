import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="entry-shell">
      <div className="entry-content">
        <Image src="/logo.png" alt="Onebridge Stalwart" width={280} height={64} className="entry-logo" priority />
        <p className="entry-tagline">Sistema de propostas</p>
        <Link href="/login" className="button-primary entry-button">Entrar</Link>
      </div>
      <footer className="entry-footer">
        <p>Onebridge Stalwart · Orlando, Florida</p>
      </footer>
    </main>
  );
}
