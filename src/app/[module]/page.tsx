import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MODULES, findModule, type ModuleStatus } from "@/lib/nav";
import { Pill } from "@/components/ui/Pill";

/**
 * Tela de cada módulo. Nesta primeira etapa só existe a descrição honesta do que o módulo
 * vai entregar e em que etapa: nada aqui finge funcionar.
 */
export function generateStaticParams() {
  return MODULES.map((m) => ({ module: m.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[module]">): Promise<Metadata> {
  const { module } = await params;
  return { title: findModule(module)?.label ?? "Módulo" };
}

const STATUS: Record<ModuleStatus, { label: string; tone: "positive" | "accent" | "neutral" }> = {
  ativo: { label: "Ativo", tone: "positive" },
  estrutura: { label: "Tabelas prontas, tela pendente", tone: "accent" },
  planejado: { label: "Planejado", tone: "neutral" },
};

export default async function ModulePage({ params }: PageProps<"/[module]">) {
  const { module } = await params;
  const mod = findModule(module);
  if (!mod) notFound();
  const status = STATUS[mod.status];

  return (
    <div className="px-4 py-6 lg:px-8 lg:py-7">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-title font-semibold">{mod.label}</h1>
        <Pill tone={status.tone}>{status.label}</Pill>
      </div>
      <p className="mt-1 max-w-[68ch] text-body text-muted">{mod.summary}</p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section aria-labelledby="entrega" className="rounded-card border border-border p-5 lg:col-span-8 lg:p-6">
          <h2 id="entrega" className="text-section font-semibold">
            O que este módulo vai entregar
          </h2>
          <ul className="mt-4 flex flex-col">
            {mod.delivers.map((item) => (
              <li key={item} className="border-b border-rule py-2.5 last:border-b-0">
                {item}
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="etapa" className="rounded-card border border-border p-5 lg:col-span-4 lg:p-6">
          <h2 id="etapa" className="text-section font-semibold">
            Etapa do roadmap
          </h2>
          <p className="tabular mt-4 text-kpi">Etapa {mod.stage}</p>
          <p className="mt-2 text-body text-muted">
            O plano completo e o estado de cada etapa estão em docs/ACOMPANHAMENTO.md.
          </p>
          <Link href="/" className="mt-4 inline-block font-medium underline underline-offset-4">
            Voltar à visão geral
          </Link>
        </section>
      </div>
    </div>
  );
}
