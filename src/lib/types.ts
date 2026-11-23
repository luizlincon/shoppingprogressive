/** Tipos que espelham supabase/migrations/0001_init.sql. */

export type CreationStatus =
  | "draft"
  | "generating"
  | "ready_for_review"
  | "approved"
  | "rejected"
  | "changes_requested"
  | "archived";

export type AssetKind =
  | "mockup_front"
  | "mockup_back"
  | "print_front"
  | "print_back"
  | "briefing_pdf"
  | "export_zip";

export type Creation = {
  id: string;
  drop_date: string; // YYYY-MM-DD, fuso America/Sao_Paulo
  title: string | null;
  concept: string | null;
  status: CreationStatus;
  collection_id: string | null;
  current_version_id: string | null;
  created_at: string;
};

export type Asset = {
  id: string;
  version_id: string;
  kind: AssetKind;
  storage_bucket: string;
  storage_path: string;
};

export type Collection = {
  id: string;
  name: string;
  creations_count: number;
};

export type BrandMemoryRow = {
  id: string;
  kind: "principle" | "preference" | "avoid" | "reference" | "learning";
  content: string;
  source: "seed" | "approval" | "rejection" | "manual";
};

export const STATUS_LABEL: Record<CreationStatus, string> = {
  draft: "Rascunho",
  generating: "Gerando",
  ready_for_review: "Aguardando sua decisão",
  approved: "Aprovada",
  rejected: "Rejeitada",
  changes_requested: "Ajustes pedidos",
  archived: "Arquivada",
};

/** Os seis entregáveis de cada criação, na ordem em que aparecem na tela. */
export const DELIVERABLES: { kind: AssetKind | "briefing" | "youdraw"; label: string }[] = [
  { kind: "mockup_front", label: "Mockup frontal" },
  { kind: "mockup_back", label: "Mockup traseiro" },
  { kind: "print_front", label: "Estampa frontal isolada" },
  { kind: "print_back", label: "Estampa traseira isolada" },
  { kind: "briefing", label: "Briefing criativo" },
  { kind: "youdraw", label: "Arquivos técnicos YouDraw" },
];
