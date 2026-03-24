import type { ReactNode } from "react";

export type StatusTone = "neutral" | "accent" | "success" | "warning";

interface StatusPillProps {
  children: ReactNode;
  tone?: StatusTone;
  live?: boolean;
}

export function StatusPill({
  children,
  tone = "neutral",
  live = false
}: StatusPillProps) {
  return (
    <span
      className={`status-pill status-pill-${tone}`}
      {...(live ? { role: "status" } : {})}
    >
      {children}
    </span>
  );
}
