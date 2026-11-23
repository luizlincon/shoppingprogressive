import "server-only";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { CreationStatus } from "@/lib/types";

/**
 * Criações guardadas como arquivos em public/drops/<data>/drop.json.
 * Fonte usada enquanto o Supabase não está conectado (o drop 001 foi feito assim).
 */
export type LocalDrop = {
  drop_date: string;
  number: number;
  title: string;
  version: number;
  status: CreationStatus;
  concept: string;
  garment: { type: string; color: string; ink: string[] };
  files: Record<string, { file: string; width_px?: number; height_px?: number; dpi?: number; width_mm?: number; height_mm?: number }>;
  featured_variant?: string;
  decision?: LocalDecision;
  history?: { version: number; decision?: { decision: string } }[];
  variants?: { slug: string; name: string; color: string; mockup_front: { file: string }; print_front: { file: string } }[];
};

export type LocalDecision = {
  decision: "approved" | "rejected" | "changes_requested";
  version: number;
  decided_at: string;
  decided_by: string;
  reason?: string;
};

/** Decisões registradas nos arquivos: a atual mais as das versões anteriores. */
export const countLocalDecisions = (drops: LocalDrop[]) =>
  drops.reduce((n, d) => n + (d.decision ? 1 : 0) + (d.history ?? []).filter((h) => h.decision).length, 0);

export type DropVariant = { slug: string; name: string; color: string; mockup: string; print: string; featured: boolean };

export const localVariants = (drop: LocalDrop): DropVariant[] =>
  (drop.variants ?? []).map((v) => ({
    slug: v.slug,
    name: v.name,
    color: v.color,
    mockup: `/drops/${drop.drop_date}/${v.mockup_front.file}`,
    print: `/drops/${drop.drop_date}/${v.print_front.file}`,
    featured: v.slug === drop.featured_variant,
  }));

const DIR = path.join(process.cwd(), "public", "drops");

export async function listLocalDrops(): Promise<LocalDrop[]> {
  let dates: string[] = [];
  try {
    dates = (await readdir(DIR)).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d));
  } catch {
    return [];
  }
  const drops = await Promise.all(
    dates.map(async (d) => {
      try {
        return JSON.parse(await readFile(path.join(DIR, d, "drop.json"), "utf8")) as LocalDrop;
      } catch {
        return null;
      }
    }),
  );
  return drops.filter((d): d is LocalDrop => d !== null);
}

export const localFileUrl = (drop: LocalDrop, key: string) =>
  drop.files[key] ? `/drops/${drop.drop_date}/${drop.files[key].file}` : null;
