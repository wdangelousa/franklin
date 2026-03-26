import Image from "next/image";
import Link from "next/link";

interface BrandMarkProps {
  href?: string | null;
  compact?: boolean;
}

export function BrandMark({ href = "/", compact = false }: BrandMarkProps) {
  const logo = compact
    ? <Image src="/logomark.png" alt="Onebridge" width={30} height={30} className="brand-logo-compact" />
    : <Image src="/logo.png" alt="Onebridge Stalwart" width={180} height={36} className="brand-logo-full" />;

  if (!href) {
    return <span className="brand-mark">{logo}</span>;
  }

  return <Link href={href} className="brand-mark">{logo}</Link>;
}
