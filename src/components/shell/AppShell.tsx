import Link from "next/link";
import { Suspense } from "react";
import { BRAND } from "@/lib/brand/identity";
import { NavLinks } from "./NavLinks";
import { Breadcrumb } from "./Breadcrumb";
import { Logo } from "./Logo";

/**
 * Estrutura: moldura em L (barra lateral 228px + barra superior 48px, mesmo fundo, sem fio entre elas)
 * e a folha branca recuada 8px da direita e de baixo.
 * Celular (<1024px): a moldura some, a folha vira a tela, a navegação vai para um menu.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[228px_1fr] lg:grid-rows-[48px_1fr]">
      {/* Barra lateral (desktop) */}
      <aside className="hidden lg:row-span-2 lg:flex lg:flex-col lg:px-3 lg:pt-3 lg:pb-4">
        <Link href="/" className="press flex h-10 items-center gap-2.5 rounded-control px-2 hover:bg-active">
          <Logo />
          <span className="flex flex-col leading-tight">
            <span className="text-body font-semibold">{BRAND.name}</span>
            <span className="text-small text-muted">{BRAND.product}</span>
          </span>
        </Link>
        <Suspense fallback={null}>
          <NavLinks />
        </Suspense>
        <p className="mt-auto px-2 text-small text-muted">
          Aprovação exclusivamente humana. Nada é publicado ou vendido por aqui.
        </p>
      </aside>

      {/* Barra superior (desktop) e topo do celular */}
      <header className="flex h-12 items-center gap-3 px-4 lg:px-0 lg:pr-6">
        <details className="group relative lg:hidden">
          <summary className="press flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-control hover:bg-active [&::-webkit-details-marker]:hidden">
            <span className="sr-only">Abrir menu</span>
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 4.5h14M2 9h14M2 13.5h14" />
            </svg>
          </summary>
          <div className="fixed inset-x-0 top-12 bottom-0 z-20 overflow-y-auto bg-ground px-3 pb-6">
            <Suspense fallback={null}>
              <NavLinks />
            </Suspense>
          </div>
        </details>
        <Link href="/" className="flex items-center gap-2 lg:hidden">
          <Logo />
          <span className="text-body font-semibold">{BRAND.product}</span>
        </Link>
        <Suspense fallback={<span className="hidden lg:block" />}>
          <Breadcrumb />
        </Suspense>
      </header>

      {/* Folha */}
      <main className="min-w-0 bg-surface lg:mr-2 lg:mb-2 lg:rounded-sheet lg:border lg:border-border">
        {children}
      </main>
    </div>
  );
}
