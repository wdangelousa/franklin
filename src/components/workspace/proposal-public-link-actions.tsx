"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

interface ProposalPublicLinkActionsProps {
  publicLink: string;
  className?: string;
}

type CopyState = "idle" | "copied" | "error";

export function ProposalPublicLinkActions({
  publicLink,
  className
}: ProposalPublicLinkActionsProps) {
  const [copyState, setCopyState] = useState<CopyState>("idle");

  const copyLabel = useMemo(() => {
    if (copyState === "copied") {
      return "Link copiado";
    }

    if (copyState === "error") {
      return "Falha ao copiar";
    }

    return "Copiar link público";
  }, [copyState]);

  useEffect(() => {
    if (copyState === "idle") {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      setCopyState("idle");
    }, 2200);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [copyState]);

  async function handleCopy() {
    const absoluteLink = toAbsolutePublicLink(publicLink);

    if (!navigator.clipboard?.writeText) {
      setCopyState("error");
      return;
    }

    try {
      await navigator.clipboard.writeText(absoluteLink);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
  }

  const classes = ["proposal-link-actions", className].filter(Boolean).join(" ");

  return (
    <div className={classes}>
      <Link className="button-secondary" href={publicLink} rel="noreferrer noopener" target="_blank">
        Abrir proposta pública
      </Link>
      <button className="button-secondary" onClick={handleCopy} type="button">
        {copyLabel}
      </button>
    </div>
  );
}

function toAbsolutePublicLink(publicLink: string): string {
  if (/^https?:\/\//i.test(publicLink)) {
    return publicLink;
  }

  const normalizedPath = publicLink.startsWith("/") ? publicLink : `/${publicLink}`;
  // basePath is not in the stored publicLink — add it for the absolute URL
  const basePath = "/franklin";
  return `${window.location.origin}${basePath}${normalizedPath}`;
}
