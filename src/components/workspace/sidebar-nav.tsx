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
      {workspaceNavigation.map((item) => {
        const NavIcon = item.icon;
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            className={`sidebar-link${active ? " is-active" : ""}`}
            href={item.href}
          >
            <div className="sidebar-link-heading">
              <span className={`icon-inline icon-muted${active ? " is-active" : ""}`}>
                <NavIcon size={18} />
              </span>
              <strong>{item.label}</strong>
            </div>
            <span>{item.description}</span>
          </Link>
        );
      })}
    </nav>
  );
}
