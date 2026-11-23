/**
 * Drop 001 — "Grau por Grau" (23/11/2026)
 * Desenha as estampas em vetor (texto convertido em curvas), exporta os PNGs de impressão
 * com fundo transparente a 300 DPI e compõe os mockups planos de frente e costas com Sharp.
 *
 * Uso: node scripts/render-drop-001-v1.mjs
 * Saída: public/drops/2026-11-23/v1/ (versão 1, guardada no histórico)
 *
 * Medidas provisórias até a conferência na YouDraw: frente 100 × 60 mm, costas 300 × 400 mm.
 */
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import opentype from "opentype.js";
import sharp from "sharp";

const require = createRequire(import.meta.url);
const OUT = path.resolve("public/drops/2026-11-23/v1");
const DPI = 300;
const MM = DPI / 25.4; // px por mm
const INK = "#ffffff"; // tinta da estampa (camiseta preta)
const SHIRT = "#141414";

const fontFile = (w) =>
  require.resolve(`@fontsource/barlow-condensed/files/barlow-condensed-latin-${w}-normal.woff`);
const loadFont = async (w) => {
  const buf = await readFile(fontFile(w));
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
};
const F800 = await loadFont(800);
const F600 = await loadFont(600);

/** Texto em curvas, ajustado a uma largura (mm), alinhado à esquerda/centro/direita. */
/**
 * Monta o texto glifo a glifo. O getPath do opentype.js devolve NaN em alguns pares de kerning
 * desta fonte (o desenho parava no meio da palavra); aqui o kerning inválido vira 0.
 */
function layout(font, text, size, tracking) {
  const glyphs = font.stringToGlyphs(text);
  const scale = size / font.unitsPerEm;
  const placed = [];
  let pen = 0;
  glyphs.forEach((g, i) => {
    placed.push({ g, x: pen });
    let kern = i < glyphs.length - 1 ? font.getKerningValue(g, glyphs[i + 1]) : 0;
    if (!Number.isFinite(kern)) kern = 0;
    pen += (g.advanceWidth + kern) * scale + (i < glyphs.length - 1 ? tracking * size : 0);
  });
  return { placed, width: pen };
}

/** Serializa os comandos do caminho (o toPathData da biblioteca gerava NaN em alguns números). */
function pathData(p) {
  const n = (v) => {
    if (!Number.isFinite(v)) throw new Error(`coordenada inválida: ${v}`);
    return (Math.round(v * 1000) / 1000).toString();
  };
  return p.commands
    .map((c) => {
      switch (c.type) {
        case "M": case "L": return `${c.type}${n(c.x)} ${n(c.y)}`;
        case "Q": return `Q${n(c.x1)} ${n(c.y1)} ${n(c.x)} ${n(c.y)}`;
        case "C": return `C${n(c.x1)} ${n(c.y1)} ${n(c.x2)} ${n(c.y2)} ${n(c.x)} ${n(c.y)}`;
        case "Z": return "Z";
        default: throw new Error(`comando desconhecido: ${c.type}`);
      }
    })
    .join("");
}

function textPath(font, text, { x, baseline, width, size, tracking = 0, align = "left" }) {
  let s = size;
  if (width && !size) s = width / layout(font, text, 1, tracking).width;
  const { placed, width: w } = layout(font, text, s, tracking);
  const x0 = align === "center" ? x - w / 2 : align === "right" ? x - w : x;
  const p = new opentype.Path();
  for (const { g, x: gx } of placed) p.extend(g.getPath(x0 + gx, baseline, s));
  // largura real do desenho (sem o espaço lateral da última letra)
  const bb = p.getBoundingBox();
  return { d: pathData(p), size: s, width: w, bbox: bb };
}

/** Uma faixa: corpo branco, ponteira vazada perto da ponta direita, quatro graus brancos. */
function belt({ x, y, length, height, tipW, endW, stripes = 4 }) {
  const r = Math.min(1.2, height / 6);
  const tipX = x + length - endW - tipW;
  const parts = [
    `<rect x="${x}" y="${y}" width="${tipX - x}" height="${height}" rx="${r}"/>`,
    `<rect x="${tipX + tipW}" y="${y}" width="${endW}" height="${height}" rx="${r}"/>`,
  ];
  const sw = tipW * 0.075; // largura do grau
  const gap = (tipW - stripes * sw) / (stripes + 1);
  for (let i = 0; i < stripes; i++) {
    parts.push(`<rect x="${tipX + gap + i * (sw + gap)}" y="${y}" width="${sw}" height="${height}"/>`);
  }
  return parts.join("");
}

/** `px = true` gera a versão em pixels exatos a 300 DPI para rasterizar; senão, em mm para impressão. */
function svgDoc(wMM, hMM, body, px = false) {
  const w = px ? `${Math.round(wMM * MM)}` : `${wMM}mm`;
  const h = px ? `${Math.round(hMM * MM)}` : `${hMM}mm`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${wMM} ${hMM}">
<g fill="${INK}">${body}</g>
</svg>`;
}

// ---------- Frente: 100 × 60 mm -------------------------------------------------
function front() {
  const W = 100, H = 60, M = 5;
  const inner = W - 2 * M;
  const word = textPath(F800, "PROGRESSIVE", { x: M, baseline: 0, width: inner, tracking: 0.02 });
  // posiciona pela caixa real do desenho
  const capH = -word.bbox.y1;
  const top = 14;
  const wordD = textPath(F800, "PROGRESSIVE", { x: M, baseline: top + capH, size: word.size, tracking: 0.02 });
  const beltY = top + capH + 4;
  const beltH = 7;
  const body =
    `<path d="${wordD.d}"/>` +
    belt({ x: M, y: beltY, length: inner, height: beltH, tipW: 24, endW: 6 });
  return { svg: svgDoc(W, H, body), svgPx: svgDoc(W, H, body, true), W, H };
}

// ---------- Costas: 300 × 400 mm ------------------------------------------------
function back() {
  const W = 300, M = 10; // altura final calculada pelo conteúdo (até 400 mm)
  const inner = W - 2 * M;
  const t = textPath(F800, "GRAU POR GRAU", { x: M, baseline: 0, width: inner, tracking: 0.01 });
  const capH = -t.bbox.y1;
  const titleTop = 12;
  const title = textPath(F800, "GRAU POR GRAU", { x: M, baseline: titleTop + capH, size: t.size, tracking: 0.01 });

  const rows = ["BRANCA", "AZUL", "ROXA", "MARROM", "PRETA"];
  const labelCol = 62; // largura da coluna dos rótulos
  const barX = M + labelCol;
  const maxLen = W - M - barX;
  const lens = rows.map((_, i) => maxLen * (0.6 + 0.1 * i)); // 60% → 100%
  const rowH = 20;
  const rowGap = 15;
  const blockTop = titleTop + capH + 34;
  let body = `<path d="${title.d}"/>`;
  rows.forEach((label, i) => {
    const y = blockTop + i * (rowH + rowGap);
    const lab = textPath(F600, label, { x: M, baseline: 0, size: 13, tracking: 0.08 });
    const lh = -lab.bbox.y1;
    const labD = textPath(F600, label, { x: M, baseline: y + rowH / 2 + lh / 2, size: 13, tracking: 0.08 });
    body += `<path d="${labD.d}"/>`;
    body += belt({ x: barX, y, length: lens[i], height: rowH, tipW: 52, endW: 12 });
  });
  const blockBottom = blockTop + rows.length * rowH + (rows.length - 1) * rowGap;

  const sig = textPath(F800, "PROGRESSIVE BJJ", { x: W / 2, baseline: 0, size: 30, tracking: 0.04, align: "center" });
  const sigH = -sig.bbox.y1;
  const sigBase = blockBottom + 40 + sigH;
  const sigD = textPath(F800, "PROGRESSIVE BJJ", { x: W / 2, baseline: sigBase, size: 30, tracking: 0.04, align: "center" });
  const tag = textPath(F600, "UM DIA DE CADA VEZ", { x: W / 2, baseline: sigBase + 16, size: 12, tracking: 0.3, align: "center" });
  body += `<path d="${sigD.d}"/><path d="${tag.d}"/>`;
  const usedH = sigBase + 16 + 4;
  return { svg: svgDoc(W, Math.ceil(usedH), body), svgPx: svgDoc(W, Math.ceil(usedH), body, true), W, H: Math.ceil(usedH) };
}

// ---------- Mockups planos ------------------------------------------------------
// Silhueta em unidades de 320 × 340; o corpo (80 → 240) mede 160 u ≈ 52 cm → 1 u ≈ 3,25 mm.
const UNIT_MM = 3.25;
function shirtSvg(side, scale) {
  const neck = side === "front" ? "Q160 74 186 44" : "Q160 56 186 44";
  const W = 320 * scale, H = 340 * scale;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 320 340">
<rect width="320" height="340" fill="#eef0f1"/>
<path d="M134 44 ${neck} L246 66 L300 120 L262 152 L240 134 L240 318 L80 318 L80 134 L58 152 L20 120 L74 66 Z"
 fill="${SHIRT}" stroke="#0a0a0a" stroke-width="0.8" stroke-linejoin="round"/>
<path d="M134 44 ${neck}" fill="none" stroke="#2b2b2b" stroke-width="3"/>
<path d="M74 66 L80 134 M246 66 L240 134" fill="none" stroke="#222" stroke-width="0.6"/>
<path d="M58 152 L20 120 M262 152 L300 120" fill="none" stroke="#262626" stroke-width="2.2"/>
<path d="M80 313 L240 313" fill="none" stroke="#222" stroke-width="0.6"/>
</svg>`;
}

async function mockup(side, printPng, printWmm, topUnit) {
  const scale = 6; // 1920 × 2040 px
  const base = await sharp(Buffer.from(shirtSvg(side, scale))).png().toBuffer();
  const pxPerUnit = scale;
  const printWpx = Math.round((printWmm / UNIT_MM) * pxPerUnit);
  const print = await sharp(printPng).resize({ width: printWpx }).toBuffer();
  const meta = await sharp(print).metadata();
  const left = Math.round(160 * pxPerUnit - meta.width / 2);
  const top = Math.round(topUnit * pxPerUnit);
  return sharp(base).composite([{ input: print, left, top }]).png().toBuffer();
}

// ---------- Execução ------------------------------------------------------------
await mkdir(OUT, { recursive: true });
const f = front();
const b = back();
const files = {};
for (const [name, art] of [["front", f], ["back", b]]) {
  await writeFile(path.join(OUT, `print-${name}.svg`), art.svg);
  const png = await sharp(Buffer.from(art.svgPx))
    .png({ compressionLevel: 9 })
    .withMetadata({ density: DPI })
    .toBuffer();
  await writeFile(path.join(OUT, `print-${name}.png`), png);
  const m = await sharp(png).metadata();
  files[`print_${name}`] = {
    file: `print-${name}.png`,
    width_px: m.width,
    height_px: m.height,
    dpi: DPI,
    width_mm: art.W,
    height_mm: art.H,
    transparent: m.hasAlpha,
  };
}

const frontMock = await mockup("front", path.join(OUT, "print-front.png"), f.W, 88);
const backMock = await mockup("back", path.join(OUT, "print-back.png"), b.W, 74);
await writeFile(path.join(OUT, "mockup-front.png"), frontMock);
await writeFile(path.join(OUT, "mockup-back.png"), backMock);
files.mockup_front = { file: "mockup-front.png" };
files.mockup_back = { file: "mockup-back.png" };

const manifest = {
  drop_date: "2026-11-23",
  number: 1,
  title: "Grau por Grau",
  version: 1,
  status: "ready_for_review",
  concept:
    "Progredir no Jiu-Jitsu é ganhar um grau de cada vez. Na frente, PROGRESSIVE sobre uma faixa com quatro graus; nas costas, a escada da branca à preta.",
  garment: { type: "Camiseta", color: "Preta", ink: ["Branco"] },
  origin: "Criação assistida na sessão de desenvolvimento; pipeline automático na etapa 2.",
  provisional_specs: "Medidas provisórias até a conferência na YouDraw.",
  files,
  created_at: new Date().toISOString(),
};
await writeFile(path.join(OUT, "drop.json"), JSON.stringify(manifest, null, 2));
console.log(JSON.stringify(files, null, 2));
