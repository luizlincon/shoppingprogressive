"use client";

import { usePathname } from "next/navigation";
import { findModule } from "@/lib/nav";
import { BRAND } from "@/lib/brand/identity";

export function Breadcrumb() {
  const pathname = usePathname();
  const mod = findModule(pathname.replace(/^\//, ""));
  const current = pathname === "/" ? "Visão geral" : (mod?.label ?? "Página");
  return (
    <p className="hidden text-body lg:block">
      <span className="text-muted">{BRAND.name}</span>
      <span className="px-2 text-control" aria-hidden="true">/</span>
      <span className="font-medium">{current}</span>
    </p>
  );
}
