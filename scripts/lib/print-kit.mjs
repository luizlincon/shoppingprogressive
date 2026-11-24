/**
 * Ferramentas compartilhadas para desenhar estampas em vetor e gerar arquivos de impressão.
 * Texto sempre convertido em curvas (não depende de fonte instalada na gráfica).
 */
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import opentype from "opentype.js";
import sharp from "sharp";

const require = createRequire(import.meta.url);

export const DPI = 300;
export const MM = DPI / 25.4; // px por mm

export async function loadBarlow(weight) {
  const file = require.resolve(
    `@fontsource/barlow-condensed/files/barlow-condensed-latin-${weight}-normal.woff`,
  );
  const buf = await readFile(file);
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
}

/** Monta o texto glifo a glifo; kerning inválido da fonte (NaN) vira 0. */
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

/** Serializa o caminho (o toPathData da biblioteca gera NaN em alguns números). */
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

/** Texto em curvas. Com `width` e sem `size`, ajusta o tamanho para caber na largura (mm). */
export function textPath(font, text, { x, baseline, width, size, tracking = 0, align = "left" }) {
  let s = size;
  if (width && !size) s = width / layout(font, text, 1, tracking).width;
  const { placed, width: w } = layout(font, text, s, tracking);
  const x0 = align === "center" ? x - w / 2 : align === "right" ? x - w : x;
  const p = new opentype.Path();
  for (const { g, x: gx } of placed) p.extend(g.getPath(x0 + gx, baseline, s));
  return { d: pathData(p), size: s, width: w, bbox: p.getBoundingBox() };
}

/** SVG em mm (para a gráfica) ou em pixels exatos a 300 DPI (para rasterizar). */
export function svgDoc(wMM, hMM, body, px = false) {
  const w = px ? `${Math.round(wMM * MM)}` : `${wMM}mm`;
  const h = px ? `${Math.round(hMM * MM)}` : `${hMM}mm`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${wMM} ${hMM}">
${body}
</svg>`;
}

export async function rasterize(svgPx) {
  return sharp(Buffer.from(svgPx)).png({ compressionLevel: 9 }).withMetadata({ density: DPI }).toBuffer();
}

// ---------- Mockup plano -----------------------------------------------------------
// Silhueta em unidades de 320 × 340; o corpo (80 → 240) mede 160 u ≈ 52 cm → 1 u ≈ 3,25 mm.
export const UNIT_MM = 3.25;

function shirtSvg(side, scale, color) {
  const neck = side === "front" ? "Q160 74 186 44" : "Q160 56 186 44";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${320 * scale}" height="${340 * scale}" viewBox="0 0 320 340">
<rect width="320" height="340" fill="#eef0f1"/>
<path d="M134 44 ${neck} L246 66 L300 120 L262 152 L240 134 L240 318 L80 318 L80 134 L58 152 L20 120 L74 66 Z"
 fill="${color}" stroke="#0a0a0a" stroke-width="0.8" stroke-linejoin="round"/>
<path d="M134 44 ${neck}" fill="none" stroke="#2b2b2b" stroke-width="3"/>
<path d="M74 66 L80 134 M246 66 L240 134" fill="none" stroke="#222" stroke-width="0.6"/>
<path d="M58 152 L20 120 M262 152 L300 120" fill="none" stroke="#262626" stroke-width="2.2"/>
<path d="M80 313 L240 313" fill="none" stroke="#222" stroke-width="0.6"/>
</svg>`;
}

/** Compõe a estampa sobre a camiseta na escala real (largura em mm, topo em unidades da silhueta). */
export async function mockup(side, printPng, printWmm, topUnit, shirtColor = "#141414", unitMm = UNIT_MM) {
  const scale = 6; // 1920 × 2040 px
  const base = await sharp(Buffer.from(shirtSvg(side, scale, shirtColor))).png().toBuffer();
  // unitMm: adulto 3,25 (corpo ≈ 52 cm); infantil 2,5 (corpo ≈ 40 cm, tamanho 8)
  const printWpx = Math.round((printWmm / unitMm) * scale);
  const print = await sharp(printPng).resize({ width: printWpx }).toBuffer();
  const meta = await sharp(print).metadata();
  const left = Math.round(160 * scale - meta.width / 2);
  const top = Math.round(topUnit * scale);
  return sharp(base).composite([{ input: print, left, top }]).png().toBuffer();
}
