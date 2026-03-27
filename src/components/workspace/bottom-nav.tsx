"use client";

import Link from "next/link";
import { Fragment } from "react";
import { usePathname } from "next/navigation";

import { IconPlus } from "@/components/ui/icons";
import { workspaceNavigation } from "@/lib/navigation";

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BottomNav() {
  const pathname = usePathname();

  const items = workspaceNavigation.filter((item) => item.href !== "/app/settings");

  return (
    <nav className="bottom-nav" aria-label="Menu principal">
      {items.map((item, index) => {
        const NavIcon = item.icon;
        const active = isActive(pathname, item.href);

        return (
          <Fragment key={item.href}>
            {index === 2 && (
              <Link
                className="bottom-nav-item bottom-nav-item-primary"
                href="/app/proposals/new"
                aria-label="Nova proposta"
              >
                <span className="bottom-nav-icon-primary">
                  <IconPlus size={20} />
                </span>
                <span className="bottom-nav-label">Nova</span>
              </Link>
            )}
            <Link
              className={`bottom-nav-item${active ? " is-active" : ""}`}
              href={item.href}
              {...(active ? { "aria-current": "page" as const } : {})}
            >
              <span className="bottom-nav-icon">
                <NavIcon size={20} />
              </span>
              <span className="bottom-nav-label">{item.label}</span>
            </Link>
          </Fragment>
        );
      })}
    </nav>
  );
}
