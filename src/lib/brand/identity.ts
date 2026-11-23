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

  // Referência 1 — Art of Jiu Jitsu, Adult Apparel (artofjiujitsu.com/collections/adult-apparel),
  // indicada pelo diretor criativo em 23/11/2026. Ver docs/REFERENCIAS.md.
  {
    kind: "reference",
    content:
      "Art of Jiu Jitsu (Adult Apparel): minimalismo monocromático, camiseta preta com estampa pequena no peito e a mensagem maior nas costas.",
  },
  {
    kind: "preference",
    content:
      "Tipografia como estampa: caixa-alta em sans condensada, nome ou sigla dentro de uma barra ou caixa sólida, sem ilustração.",
  },
  {
    kind: "preference",
    content:
      "Estampa traseira em blocos empilhados que contam origem: lugar, academia e ano de fundação, no estilo de etiqueta.",
  },
  {
    kind: "preference",
    content:
      "Paleta contida: preto, branco e tons terrosos (marrom); a cor da peça faz parte do design.",
  },
  {
    kind: "avoid",
    content:
      "Não copiar a Art of Jiu Jitsu: nada de nomes, siglas, logos, textos em japonês ou layouts idênticos aos dela. Absorver os princípios, criar com a identidade Progressive BJJ.",
  },

  // Aprendizados do Drop 001 "Grau por Grau" — v1 com ajustes pedidos, v2 aprovada em 23/11/2026.
  {
    kind: "learning",
    content:
      "Aprovado (Drop 001): a faixa e os graus como linguagem visual da marca. O nome Progressive conversa com a progressão de graduação.",
  },
  {
    kind: "learning",
    content:
      "Aprovado (Drop 001): uma camiseta por faixa. O atleta compra a da sua graduação; vale pensar linhas com variações por faixa.",
  },
  {
    kind: "learning",
    content:
      "Aprovado (Drop 001): cores reais das faixas (branca, azul, roxa, marrom, preta com ponteira vermelha), sempre com os 4 graus.",
  },
  {
    kind: "learning",
    content:
      "Ajuste pedido (Drop 001 v1): estampa de peito de 10 cm ficou pequena; o diretor prefere cerca de 14 cm de largura no peito.",
  },
];

export const MEMORY_KIND_LABEL: Record<MemoryKind, string> = {
  principle: "Princípio",
  preference: "Preferência",
  avoid: "Evitar",
  reference: "Referência",
  learning: "Aprendizado",
};
