import "server-only";
import { connection } from "next/server";
import sharp from "sharp";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { integrationStatus, type IntegrationStatus } from "@/lib/env";
import { isoDateInTZ, lastNDays } from "@/lib/dates";
import { BRAND_MEMORY_SEED } from "@/lib/brand/identity";
import type { Asset, AssetKind, BrandMemoryRow, Collection, Creation, CreationStatus } from "@/lib/types";
import {
  countLocalDecisions,
  listLocalDrops,
  localFileUrl,
  localVariants,
  DEFAULT_VARIANT_TEXT,
  graficaPdf,
  type DropVariant,
  type VariantText,
  type LocalDecision,
  type LocalDrop,
} from "./local-drops";

/**
 * Cada bloco do dashboard carrega sozinho e diz o próprio estado:
 * - "ok": dados vieram do banco (podem ser zero linhas);
 * - "unconfigured": o Supabase ainda não tem credenciais;
 * - "error": o banco respondeu com erro (ex.: migrations não aplicadas).
 */
export type Block<T> =
  | { state: "ok"; data: T }
  | { state: "local"; data: T } // lido de public/drops/ (sem banco conectado)
  | { state: "unconfigured"; data: T }
  | { state: "error"; data: T; message: string };

export type DayCell = { date: string; status: CreationStatus | null };

export type DashboardData = {
  today: string;
  todayDrop: Block<{
    creation: Creation | null;
    assets: Asset[];
    number?: number;
    variants?: DropVariant[];
    variantText?: VariantText;
    decision?: LocalDecision;
    /** PDFs CMYK da gráfica: frente e costas da versão atual (sem variação). */
    grafica?: { front: string | null; back: string | null; count: number };
  }>;
  strip: Block<DayCell[]>;
  collections: Block<Collection[]>;
  memory: Block<{ rows: Pick<BrandMemoryRow, "kind" | "content" | "source">[]; decisions: number }>;
  integrations: IntegrationStatus[];
  sharpVersion: string | null;
};

const STRIP_DAYS = 30;

const LOCAL_KINDS: Record<string, AssetKind> = {
  mockup_front: "mockup_front",
  mockup_back: "mockup_back",
  print_front: "print_front",
  print_back: "print_back",
};

function localToCreation(d: LocalDrop): {
  creation: Creation;
  assets: Asset[];
  number: number;
  variants: DropVariant[];
  variantText: VariantText;
  decision?: LocalDecision;
  grafica: { front: string | null; back: string | null; count: number };
} {
  const versionId = `local-${d.drop_date}-v${d.version}`;
  return {
    creation: {
      id: `local-${d.drop_date}`,
      drop_date: d.drop_date,
      title: d.title,
      concept: d.concept,
      status: d.status,
      collection_id: null,
      current_version_id: versionId,
      created_at: d.drop_date,
    },
    assets: Object.keys(d.files)
      .filter((k) => k in LOCAL_KINDS)
      .map((k) => ({
        id: `${versionId}-${k}`,
        version_id: versionId,
        kind: LOCAL_KINDS[k],
        storage_bucket: "local",
        storage_path: localFileUrl(d, k)!,
      })),
    number: d.number,
    variants: localVariants(d),
    variantText: d.variant_text ?? DEFAULT_VARIANT_TEXT,
    decision: d.decision,
    grafica: {
      front: graficaPdf(d, d.files.print_front?.svg),
      back: graficaPdf(d, d.files.print_back?.svg),
      count: Object.keys(d.print_files?.files ?? {}).length,
    },
  };
}

export async function getDashboardData(): Promise<DashboardData> {
  await connection(); // dados de hoje: sempre no momento da requisição
  const today = isoDateInTZ(new Date());
  const days = lastNDays(today, STRIP_DAYS);
  const emptyStrip: DayCell[] = days.map((date) => ({ date, status: null }));
  const seedMemory = BRAND_MEMORY_SEED.map((m) => ({ ...m, source: "seed" as const }));

  let sharpVersion: string | null = null;
  try {
    sharpVersion = sharp.versions.sharp ?? null;
  } catch {
    sharpVersion = null;
  }

  const base = {
    today,
    integrations: integrationStatus(),
    sharpVersion,
  };

  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    // Sem banco: usa as criações guardadas como arquivo em public/drops/.
    const local = await listLocalDrops();
    const todayLocal = local.find((d) => d.drop_date === today) ?? null;
    const todayDrop: DashboardData["todayDrop"] = todayLocal
      ? { state: "local", data: localToCreation(todayLocal) }
      : { state: "unconfigured", data: { creation: null, assets: [] } };
    const strip: DashboardData["strip"] = local.length
      ? {
          state: "local",
          data: emptyStrip.map((c) => ({
            ...c,
            status: local.find((d) => d.drop_date === c.date)?.status ?? null,
          })),
        }
      : { state: "unconfigured", data: emptyStrip };
    return {
      ...base,
      todayDrop,
      strip,
      collections: { state: "unconfigured", data: [] },
      memory: { state: "unconfigured", data: { rows: seedMemory, decisions: countLocalDecisions(local) } },
    };
  }

  const [todayRes, stripRes, collRes, memRes, decRes] = await Promise.all([
    supabase.from("creations").select("*").eq("drop_date", today).maybeSingle(),
    supabase
      .from("creations")
      .select("drop_date,status")
      .gte("drop_date", days[0])
      .lte("drop_date", today),
    supabase.from("collections_with_counts").select("id,name,creations_count").order("name"),
    supabase
      .from("brand_memory")
      .select("kind,content,source")
      .eq("active", true)
      .order("created_at"),
    supabase.from("approvals").select("id", { count: "exact", head: true }),
  ]);

  // Mockups e estampas da versão atual da criação de hoje
  let todayDrop: DashboardData["todayDrop"];
  if (todayRes.error) {
    todayDrop = { state: "error", data: { creation: null, assets: [] }, message: todayRes.error.message };
  } else {
    const creation = (todayRes.data as Creation | null) ?? null;
    let assets: Asset[] = [];
    if (creation?.current_version_id) {
      const a = await supabase
        .from("assets")
        .select("id,version_id,kind,storage_bucket,storage_path")
        .eq("version_id", creation.current_version_id);
      if (!a.error) assets = (a.data as Asset[]) ?? [];
    }
    todayDrop = { state: "ok", data: { creation, assets } };
  }

  const strip: DashboardData["strip"] = stripRes.error
    ? { state: "error", data: emptyStrip, message: stripRes.error.message }
    : {
        state: "ok",
        data: emptyStrip.map((cell) => ({
          ...cell,
          status:
            (stripRes.data as { drop_date: string; status: CreationStatus }[]).find(
              (r) => r.drop_date === cell.date,
            )?.status ?? null,
        })),
      };

  const collections: DashboardData["collections"] = collRes.error
    ? { state: "error", data: [], message: collRes.error.message }
    : { state: "ok", data: (collRes.data as Collection[]) ?? [] };

  const memory: DashboardData["memory"] =
    memRes.error || decRes.error
      ? {
          state: "error",
          data: { rows: seedMemory, decisions: 0 },
          message: (memRes.error ?? decRes.error)!.message,
        }
      : {
          state: "ok",
          data: {
            rows: (memRes.data as BrandMemoryRow[]) ?? [],
            decisions: decRes.count ?? 0,
          },
        };

  return { ...base, todayDrop, strip, collections, memory };
}
