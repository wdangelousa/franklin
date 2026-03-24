"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { workspaceNavigation } from "@/lib/navigation";

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="sidebar-nav" aria-label="Workspace">
      {workspaceNavigation.map((item) => (
        <Link
          key={item.href}
          className={`sidebar-link${isActive(pathname, item.href) ? " is-active" : ""}`}
          href={item.href}
        >
          <strong>{item.label}</strong>
          <span>{item.description}</span>
        </Link>
      ))}
    </nav>
  );
}
