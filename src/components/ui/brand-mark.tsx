import Link from "next/link";

import { brand } from "@/lib/brand";

interface BrandMarkProps {
  href?: string | null;
  compact?: boolean;
}

export function BrandMark({
  href = "/",
  compact = false
}: BrandMarkProps) {
  const className = `brand-mark${compact ? " brand-mark-compact" : ""}`;
  const content = (
    <>
      <span aria-hidden className="brand-mark-emblem" />
      <span className="brand-mark-copy">
        <strong>{brand.platformName}</strong>
        <small>{brand.parentName}</small>
      </span>
    </>
  );

  if (!href) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Link className={className} href={href}>
      {content}
    </Link>
  );
}
