import Link from "next/link";
import { getDashboardData, type DashboardData } from "@/lib/data/dashboard";
import { longDate } from "@/lib/dates";
import { DELIVERABLES, STATUS_LABEL, type CreationStatus } from "@/lib/types";
import { MEMORY_KIND_LABEL } from "@/lib/brand/identity";
import { Card, BlockError } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { ShirtSlot } from "./ShirtSlot";
import { DropStrip } from "./DropStrip";
import { VariantMockups } from "./VariantMockups";

/*
 * Pergunta da tela: "Qual é a camiseta de hoje e ela já tem a minha decisão?"
 * Grid da folha (1440px): 1440 − 228 (barra lateral) − 8 (recuo) − 2 (borda) = 1202px de folha;
 * − 2 × 32 de padding = 1138px de conteúdo; 12 colunas com vão de 24px.
 * Linha 1: criação do dia (8 col) + decisão/coleções (4 col). Linha 2: faixa de 30 dias (12).
 * Linha 3: memória criativa (7) + ambiente (5).
 */

function statusTone(s: CreationStatus | null) {
  if (s === "approved") return "accent" as const;
  if (s === "rejected") return "negative" as const;
  if (s === "ready_for_review" || s === "changes_requested") return "warning" as const;
  return "neutral" as const;
}

function discovery(d: DashboardData): string {
  const c = d.todayDrop.data.creation;
  if (d.todayDrop.state === "unconfigured")
    return "Nenhuma criação hoje. O banco ainda não está conectado e o pipeline de geração entra na etapa 2.";
  if (d.todayDrop.state === "error") return "O banco respondeu com erro ao buscar a criação de hoje.";
  if (d.todayDrop.state === "local" && c && c.status === "approved")
    return `Drop 001, ${c.title}, versão ${d.todayDrop.data.decision?.version ?? ""}, aprovada. Próximo passo: conferir medidas e cores com a YouDraw.`;
  if (d.todayDrop.state === "local" && c)
    return `Drop 001, ${c.title}, versão ${c.current_version_id?.split("-v").pop() ?? "1"}, aguarda a sua decisão. Criado nesta sessão, salvo em arquivos (sem banco).`;
  if (!c) return "Nenhuma criação gerada hoje ainda.";
  return `${c.title ?? "Criação sem título"}: ${STATUS_LABEL[c.status].toLowerCase()}.`;
}

function decidedAt(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export async function Dashboard() {
  const d = await getDashboardData();
  const creation = d.todayDrop.data.creation;
  const assets = d.todayDrop.data.assets;
  const hasAsset = (k: string) => assets.some((a) => a.kind === k);
  const variants = d.todayDrop.data.variants ?? [];
  const decision = d.todayDrop.data.decision;
  // Aprendizados primeiro (o mais recente no topo): é o que mudou na memória por causa das decisões.
  const memoryRows = [
    ...d.memory.data.rows.filter((m) => m.kind === "learning").reverse(),
    ...d.memory.data.rows.filter((m) => m.kind !== "learning"),
  ];
  const assetUrl = (k: string) => {
    const a = assets.find((x) => x.kind === k);
    return a && a.storage_bucket === "local" ? a.storage_path : null;
  };
  const briefingUrl = d.todayDrop.state === "local" && creation ? `/drops/${creation.drop_date}/briefing.md` : null;
  const generationReady = d.integrations.every((i) => i.configured);
  const configured = d.integrations.filter((i) => i.configured).length;

  return (
    <>
      {/* Linha do título */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <h1 className="text-title font-semibold">Visão geral</h1>
          <p className="mt-1 text-body text-muted">
            {longDate(d.today)} · {discovery(d)}
          </p>
        </div>
        <div className="flex flex-col items-start gap-1 md:items-end">
          <button
            type="button"
            disabled
            aria-describedby="gerar-motivo"
            className="press h-9 rounded-control bg-ink px-4 font-medium text-white disabled:cursor-not-allowed disabled:bg-control disabled:text-[#3d3f41]"
          >
            Gerar criação do dia
          </button>
          <span id="gerar-motivo" className="text-small text-muted">
            {generationReady ? "Pipeline de geração entra na etapa 2" : "Requer as integrações abaixo e o pipeline da etapa 2"}
          </span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Criação do dia */}
        <Card
          id="hoje"
          title={creation?.title ?? "Criação do dia"}
          aside={<Pill tone={statusTone(creation?.status ?? null)}>{creation ? STATUS_LABEL[creation.status] : "Não gerada"}</Pill>}
          className="lg:col-span-8"
        >
          {d.todayDrop.state === "error" ? <BlockError message={d.todayDrop.message} /> : null}
          {variants.length ? (
            <VariantMockups variants={variants} back={assetUrl("mockup_back")} />
          ) : (
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              <ShirtSlot side="front" src={assetUrl("mockup_front")} state={hasAsset("mockup_front") ? "Mockup pronto" : "Mockup frontal pendente"} />
              <ShirtSlot side="back" src={assetUrl("mockup_back")} state={hasAsset("mockup_back") ? "Mockup pronto" : "Mockup traseiro pendente"} />
            </div>
          )}
          <p className={`mt-4 text-body ${creation?.concept ? "text-ink" : "text-muted"}`}>
            {creation?.concept ??
              "Moldes de frente e costas. A área tracejada é a área de estampa provisória: as medidas finais vêm da referência técnica da YouDraw."}
          </p>
          {briefingUrl ? (
            <p className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-body">
              <a href={briefingUrl} target="_blank" rel="noreferrer" className="font-medium underline underline-offset-4">
                Briefing completo
              </a>
              {(variants.length ? (["print_back"] as const) : (["print_front", "print_back"] as const)).map((k) =>
                assetUrl(k) ? (
                  <a key={k} href={assetUrl(k)!} target="_blank" rel="noreferrer" className="font-medium underline underline-offset-4">
                    {k === "print_front" ? "Estampa frontal (PNG)" : "Estampa traseira (PNG)"}
                  </a>
                ) : null,
              )}
            </p>
          ) : null}
        </Card>

        {/* Coluna da decisão */}
        <div className="flex flex-col gap-6 lg:col-span-4">
          <Card id="decisao" title="Sua decisão" aside={decision ? "Decidida" : creation ? "Versão atual" : "Nada para decidir"}>
            <dl className="flex flex-col">
              {DELIVERABLES.map((del) => {
                const ready =
                  del.kind === "briefing"
                    ? Boolean(creation?.concept)
                    : del.kind === "youdraw"
                      ? false
                      : hasAsset(del.kind);
                // Os PNGs saem a 300 DPI, mas as medidas da YouDraw ainda não foram conferidas.
                const youdrawPending = del.kind === "youdraw" && hasAsset("print_front") && hasAsset("print_back");
                return (
                  <div key={del.kind} className="flex h-10 items-center justify-between gap-3 border-b border-rule last:border-b-0">
                    <dt>{del.label}</dt>
                    <dd className={ready ? "text-ink" : youdrawPending ? "text-warning" : "text-muted"}>
                      {ready ? "Pronto" : youdrawPending ? "Medidas a conferir" : "–"}
                    </dd>
                  </div>
                );
              })}
            </dl>
            {decision ? (
              <div className="mt-4 rounded-card bg-[var(--pill-accent-bg)] px-3 py-2.5 text-[var(--pill-accent-ink)]">
                <p className="font-medium">
                  {decision.decision === "approved" ? "Aprovada" : decision.decision === "rejected" ? "Rejeitada" : "Ajustes pedidos"}{" "}
                  · versão {decision.version}
                </p>
                <p className="text-small">
                  {decidedAt(decision.decided_at)} · {decision.decided_by}
                </p>
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button type="button" disabled className="press h-9 rounded-control border border-control font-medium disabled:cursor-not-allowed disabled:text-muted">
                  Rejeitar
                </button>
                <button type="button" disabled className="press h-9 rounded-control border border-control font-medium disabled:cursor-not-allowed disabled:text-muted">
                  Aprovar
                </button>
              </div>
            )}
          </Card>

          <Card
            id="colecoes"
            title="Coleções"
            aside={<Link href="/colecoes" className="text-muted underline-offset-4 hover:text-ink hover:underline">Ver todas</Link>}
            className="flex-1"
          >
            {d.collections.state === "error" ? <BlockError message={d.collections.message} /> : null}
            {d.collections.data.length ? (
              <ul className="flex flex-col">
                {d.collections.data.slice(0, 4).map((c) => (
                  <li key={c.id} className="flex h-10 items-center justify-between border-b border-rule last:border-b-0">
                    <span>{c.name}</span>
                    <span className="tabular text-muted">{c.creations_count} criações</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-card border border-dashed border-control px-3 py-2.5 text-muted">
                Nenhuma coleção criada. Coleções agrupam criações aprovadas.
              </p>
            )}
          </Card>
        </div>

        {/* Faixa de 30 dias */}
        <Card
          id="faixa"
          title="Últimos 30 dias"
          aside={
            d.strip.state === "unconfigured"
              ? "Sem banco conectado: histórico vazio"
              : d.strip.state === "local"
                ? "Lido dos arquivos locais"
                : "Uma criação por dia"
          }
          className="lg:col-span-12"
        >
          {d.strip.state === "error" ? <BlockError message={d.strip.message} /> : null}
          <DropStrip days={d.strip.data} />
        </Card>

        {/* Memória criativa */}
        <Card
          id="memoria"
          title="Memória criativa"
          aside={d.memory.state === "ok" ? "Lida do banco" : "Base inicial do briefing"}
          className="lg:col-span-7"
        >
          {d.memory.state === "error" ? <BlockError message={d.memory.message} /> : null}
          <ul className="flex flex-col">
            {memoryRows.slice(0, 5).map((m, i) => (
              <li key={i} className="grid grid-cols-[96px_1fr] gap-3 border-b border-rule py-2.5 last:border-b-0">
                <span className="text-muted">{MEMORY_KIND_LABEL[m.kind]}</span>
                <span>{m.content}</span>
              </li>
            ))}
          </ul>
          {d.memory.data.rows.length > 5 ? (
            <Link href="/brand-memory" className="mt-2 text-body font-medium underline-offset-4 hover:underline">
              Mais {d.memory.data.rows.length - 5} na Brand Memory
            </Link>
          ) : null}
          <p className="mt-3 text-body text-muted">
            <span className="tabular font-medium text-ink">{d.memory.data.decisions}</span> decisões registradas.
            Cada aprovação ou rejeição com motivo vira um aprendizado.
          </p>
        </Card>

        {/* Ambiente */}
        <Card
          id="ambiente"
          title="Ambiente e integrações"
          aside={<span className="tabular">{configured} de {d.integrations.length} configuradas</span>}
          className="lg:col-span-5"
        >
          <ul className="flex flex-col">
            {d.integrations.map((i) => (
              <li key={i.id} className="flex items-start justify-between gap-3 border-b border-rule py-2.5 last:border-b-0">
                <span className="min-w-0">
                  <span className="block">{i.label}</span>
                  <span className="block text-small text-muted">{i.detail}</span>
                </span>
                <Pill tone={i.configured ? "positive" : "neutral"}>{i.configured ? "Configurado" : "Ausente"}</Pill>
              </li>
            ))}
            <li className="flex items-start justify-between gap-3 py-2.5">
              <span className="min-w-0">
                <span className="block">Sharp (imagens)</span>
                <span className="block text-small text-muted">
                  {d.sharpVersion ? `Versão ${d.sharpVersion} carregada no servidor` : "Não carregou no servidor"}
                </span>
              </span>
              <Pill tone={d.sharpVersion ? "positive" : "negative"}>{d.sharpVersion ? "Instalado" : "Erro"}</Pill>
            </li>
          </ul>
        </Card>
      </div>
    </>
  );
}

/** Carregamento: o mesmo layout, valores como barras cinza no tamanho real. */
export function DashboardSkeleton() {
  const bar = "block rounded bg-raised";
  return (
    <div aria-busy="true" aria-label="Carregando visão geral">
      <h1 className="text-title font-semibold">Visão geral</h1>
      <span className={`${bar} mt-2 h-4 w-96 max-w-full`} />
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="h-[560px] rounded-card border border-border lg:col-span-8" />
        <div className="h-[560px] rounded-card border border-border lg:col-span-4" />
      </div>
    </div>
  );
}
