"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MODULES, NAV_GROUPS } from "@/lib/nav";

function Item({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      onClick={(e) => e.currentTarget.closest("details")?.removeAttribute("open")}
      className={`press flex h-11 items-center rounded-control px-2 text-body lg:h-8 ${
        active ? "bg-active font-medium text-ink" : "text-muted hover:bg-active hover:text-ink"
      }`}
    >
      {label}
    </Link>
  );
}

export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav aria-label="Módulos" className="mt-4 flex flex-col">
      <Item href="/" label="Visão geral" active={pathname === "/"} />
      {NAV_GROUPS.map((group) => (
        <div key={group} className="mt-5">
          <p className="mb-1 px-2 text-small text-muted">{group}</p>
          <ul className="flex flex-col gap-0.5">
            {MODULES.filter((m) => m.group === group).map((m) => (
              <li key={m.slug}>
                <Item href={`/${m.slug}`} label={m.label} active={pathname === `/${m.slug}`} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
