/**
 * Drop 001 — "Grau por Grau" — versão 2 (23/11/2026)
 * Pedido do diretor criativo sobre a v1:
 *   - estampa do peito maior (10 → 14 cm);
 *   - cada faixa na sua cor, nas costas e na frente;
 *   - uma camiseta por faixa: quem é faixa marrom compra a do peito marrom; todas com 4 graus.
 *
 * Uso: node scripts/render-drop-001-v2.mjs
 * Saída: public/drops/2026-11-23/v2/ e o manifesto atual em public/drops/2026-11-23/drop.json
 * Medidas provisórias até a conferência na YouDraw: frente 140 mm de largura, costas 300 mm.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { DPI, loadBarlow, mockup, rasterize, svgDoc, textPath } from "./lib/print-kit.mjs";

const ROOT = path.resolve("public/drops/2026-11-23");
const OUT = path.join(ROOT, "v2");
const WHITE = "#ffffff";
const SHIRT = "#141414";

/**
 * Cores das faixas, escolhidas para aparecer bem em camiseta preta.
 * A faixa preta é desenhada com contorno branco (senão some na camiseta) e ponteira vermelha,
 * como a faixa de verdade. Nas outras, a ponteira é preta: fica vazada, na cor da camiseta.
 */
const BELTS = [
  { slug: "branca", label: "BRANCA", name: "Faixa branca", color: "#f2f2ee" },
  { slug: "azul", label: "AZUL", name: "Faixa azul", color: "#2f6fd0" },
  { slug: "roxa", label: "ROXA", name: "Faixa roxa", color: "#7b4bb3" },
  { slug: "marrom", label: "MARROM", name: "Faixa marrom", color: "#9a6238" },
  { slug: "preta", label: "PRETA", name: "Faixa preta", color: "#141414", outline: WHITE, tip: "#c8262c" },
];

const F800 = await loadBarlow(800);
const F600 = await loadBarlow(600);

/** Uma faixa com ponteira e quatro graus brancos. */
function belt({ x, y, length, height, tipW, endW, belt: b }) {
  const r = Math.min(1.2, height / 6);
  const tipX = x + length - endW - tipW;
  const sw = tipW * 0.075;
  const gap = (tipW - 4 * sw) / 5;
  const stripes = Array.from({ length: 4 }, (_, i) =>
    `<rect x="${tipX + gap + i * (sw + gap)}" y="${y}" width="${sw}" height="${height}" fill="${WHITE}"/>`,
  ).join("");

  if (b.tip) {
    // Faixa preta: corpo inteiro com contorno branco e ponteira vermelha por cima.
    const s = Math.max(0.5, height * 0.06); // espessura do contorno
    return (
      `<rect x="${x + s / 2}" y="${y + s / 2}" width="${length - s}" height="${height - s}" rx="${r}" fill="${b.color}" stroke="${b.outline}" stroke-width="${s}"/>` +
      `<rect x="${tipX}" y="${y + s}" width="${tipW}" height="${height - 2 * s}" fill="${b.tip}"/>` +
      stripes.replaceAll(`y="${y}" `, `y="${y + s}" `).replaceAll(`height="${height}"`, `height="${height - 2 * s}"`)
    );
  }
  return (
    `<rect x="${x}" y="${y}" width="${tipX - x}" height="${height}" rx="${r}" fill="${b.color}"/>` +
    `<rect x="${tipX + tipW}" y="${y}" width="${endW}" height="${height}" rx="${r}" fill="${b.color}"/>` +
    stripes
  );
}

// ---------- Frente: 140 mm de largura, uma por faixa ---------------------------
function front(b) {
  const W = 140, M = 5;
  const inner = W - 2 * M;
  const probe = textPath(F800, "PROGRESSIVE", { x: M, baseline: 0, width: inner, tracking: 0.02 });
  const capH = -probe.bbox.y1;
  const top = 4;
  const word = textPath(F800, "PROGRESSIVE", { x: M, baseline: top + capH, size: probe.size, tracking: 0.02 });
  const beltY = top + capH + 5;
  const beltH = 10;
  const H = Math.ceil(beltY + beltH + 4);
  const body =
    `<path d="${word.d}" fill="${WHITE}"/>` +
    belt({ x: M, y: beltY, length: inner, height: beltH, tipW: 34, endW: 8, belt: b });
  return { svg: svgDoc(W, H, body), svgPx: svgDoc(W, H, body, true), W, H };
}

// ---------- Costas: 300 mm de largura, igual em todas as variações --------------
function back() {
  const W = 300, M = 10;
  const inner = W - 2 * M;
  const probe = textPath(F800, "GRAU POR GRAU", { x: M, baseline: 0, width: inner, tracking: 0.01 });
  const capH = -probe.bbox.y1;
  const titleTop = 12;
  const title = textPath(F800, "GRAU POR GRAU", { x: M, baseline: titleTop + capH, size: probe.size, tracking: 0.01 });

  const labelCol = 62;
  const barX = M + labelCol;
  const maxLen = W - M - barX;
  const rowH = 20;
  const rowGap = 15;
  const blockTop = titleTop + capH + 34;
  let body = `<path d="${title.d}" fill="${WHITE}"/>`;
  BELTS.forEach((b, i) => {
    const y = blockTop + i * (rowH + rowGap);
    const lh = -textPath(F600, b.label, { x: M, baseline: 0, size: 13, tracking: 0.08 }).bbox.y1;
    const lab = textPath(F600, b.label, { x: M, baseline: y + rowH / 2 + lh / 2, size: 13, tracking: 0.08 });
    body += `<path d="${lab.d}" fill="${WHITE}"/>`;
    body += belt({ x: barX, y, length: maxLen * (0.6 + 0.1 * i), height: rowH, tipW: 52, endW: 12, belt: b });
  });
  const blockBottom = blockTop + BELTS.length * rowH + (BELTS.length - 1) * rowGap;

  const sigH = -textPath(F800, "PROGRESSIVE BJJ", { x: W / 2, baseline: 0, size: 30, tracking: 0.04, align: "center" }).bbox.y1;
  const sigBase = blockBottom + 40 + sigH;
  const sig = textPath(F800, "PROGRESSIVE BJJ", { x: W / 2, baseline: sigBase, size: 30, tracking: 0.04, align: "center" });
  const tag = textPath(F600, "UM DIA DE CADA VEZ", { x: W / 2, baseline: sigBase + 16, size: 12, tracking: 0.3, align: "center" });
  body += `<path d="${sig.d}" fill="${WHITE}"/><path d="${tag.d}" fill="${WHITE}"/>`;
  const H = Math.ceil(sigBase + 20);
  return { svg: svgDoc(W, H, body), svgPx: svgDoc(W, H, body, true), W, H };
}

// ---------- Execução ------------------------------------------------------------
await mkdir(OUT, { recursive: true });

async function writePrint(name, art) {
  await writeFile(path.join(OUT, `${name}.svg`), art.svg);
  const png = await rasterize(art.svgPx);
  await writeFile(path.join(OUT, `${name}.png`), png);
  const m = await sharp(png).metadata();
  return {
    file: `v2/${name}.png`,
    svg: `v2/${name}.svg`,
    width_px: m.width,
    height_px: m.height,
    dpi: DPI,
    width_mm: art.W,
    height_mm: art.H,
    transparent: m.hasAlpha,
  };
}

const b = back();
const printBack = await writePrint("print-back", b);
await writeFile(path.join(OUT, "mockup-back.png"), await mockup("back", path.join(OUT, "print-back.png"), b.W, 74, SHIRT));

const variants = [];
for (const belt of BELTS) {
  const f = front(belt);
  const printFront = await writePrint(`print-front-${belt.slug}`, f);
  const mock = await mockup("front", path.join(OUT, `print-front-${belt.slug}.png`), f.W, 86, SHIRT);
  await writeFile(path.join(OUT, `mockup-front-${belt.slug}.png`), mock);
  variants.push({
    slug: belt.slug,
    name: belt.name,
    color: belt.color,
    print_front: printFront,
    mockup_front: { file: `v2/mockup-front-${belt.slug}.png` },
  });
}

// Variação mostrada por padrão no dashboard
const featured = variants.find((v) => v.slug === "marrom");

const manifest = {
  drop_date: "2026-11-23",
  number: 1,
  title: "Grau por Grau",
  version: 2,
  status: "ready_for_review",
  concept:
    "Uma camiseta para cada faixa: na frente, PROGRESSIVE sobre a sua faixa com os quatro graus; nas costas, a escada colorida da branca à preta.",
  garment: { type: "Camiseta", color: "Preta", ink: ["Branco", "Azul", "Roxo", "Marrom", "Vermelho"] },
  origin: "Criação assistida na sessão de desenvolvimento; pipeline automático na etapa 2.",
  provisional_specs: "Medidas provisórias até a conferência na YouDraw.",
  changes_from_previous: [
    "Estampa do peito de 10 cm para 14 cm de largura",
    "Faixas coloridas nas costas e na frente",
    "Cinco variações, uma por faixa, todas com quatro graus",
  ],
  featured_variant: featured.slug,
  variants,
  files: {
    mockup_front: featured.mockup_front,
    mockup_back: { file: "v2/mockup-back.png" },
    print_front: featured.print_front,
    print_back: printBack,
  },
  history: [{ version: 1, manifest: "v1/drop.json", briefing: "v1/briefing.md" }],
  created_at: new Date().toISOString(),
};
await writeFile(path.join(ROOT, "drop.json"), JSON.stringify(manifest, null, 2));
console.log(variants.map((v) => `${v.slug}: ${v.print_front.width_px}×${v.print_front.height_px}`).join("\n"));
console.log(`costas: ${printBack.width_px}×${printBack.height_px}`);
