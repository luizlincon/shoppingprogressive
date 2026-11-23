/**
 * Base inicial da Brand Memory, transcrita do briefing do projeto.
 * É a mesma lista semeada em supabase/migrations/0002_seed_brand_memory.sql.
 * Quando o banco está configurado, o dashboard lê do banco; sem banco, mostra esta base.
 */
export type MemoryKind = "principle" | "preference" | "avoid" | "reference" | "learning";

export type BrandMemorySeed = { kind: MemoryKind; content: string };

export const BRAND = {
  name: "Progressive BJJ",
  product: "Design Lab",
  segment: "Jiu-Jitsu, streetwear, família e lifestyle",
  positioning:
    "Marca de roupas com identidade própria, contemporânea, autêntica e conectada à cultura do Jiu-Jitsu.",
} as const;

export const BRAND_MEMORY_SEED: BrandMemorySeed[] = [
  {
    kind: "principle",
    content:
      "Marca de roupas com identidade própria, contemporânea, autêntica e conectada à cultura do Jiu-Jitsu.",
  },
  { kind: "principle", content: "Segmento: Jiu-Jitsu, streetwear, família e lifestyle." },
  {
    kind: "preference",
    content:
      "Liberdade criativa: não limitar a criação a um único estilo visual, respeitando o histórico e a essência da marca.",
  },
  { kind: "principle", content: "Uma camiseta original por dia, com frente e costas." },
  { kind: "avoid", content: "Nunca aprovar, publicar ou vender automaticamente." },
];

export const MEMORY_KIND_LABEL: Record<MemoryKind, string> = {
  principle: "Princípio",
  preference: "Preferência",
  avoid: "Evitar",
  reference: "Referência",
  learning: "Aprendizado",
};
