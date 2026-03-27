import type { ReactNode } from "react";

interface StickyBottomBarProps {
  children: ReactNode;
  summary?: ReactNode;
}

export function StickyBottomBar({ children, summary }: StickyBottomBarProps) {
  return (
    <div className="sticky-bottom-bar">
      {summary ? <div className="sticky-bottom-bar-summary">{summary}</div> : null}
      <div className="sticky-bottom-bar-actions">{children}</div>
    </div>
  );
}
