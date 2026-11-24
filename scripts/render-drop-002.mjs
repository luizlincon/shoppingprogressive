/**
 * Drop 002 — "Progressive Kids" — versão 1 (24/11/2026)
 * Ideia do diretor criativo:
 *   - linha infantil, menino e menina;
 *   - frente igual nas duas: PROGRESSIVE KIDS;
 *   - costas do menino: menino super-herói de kimono e faixa preta;
 *   - costas da menina: bailarina de kimono, bem delicada, com faixa preta.
 *
 * Uso: node scripts/render-drop-002.mjs
 * Saída: public/drops/2026-11-24/ (estampas, mockups e drop.json)
 * Medidas provisórias para camiseta infantil (tamanho 8) até a conferência na YouDraw:
 * frente 100 mm de largura, costas 220 mm.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { DPI, loadBarlow, mockup, rasterize, svgDoc, textPath } from "./lib/print-kit.mjs";

const DATE = "2026-11-24";
const ROOT = path.resolve(`public/drops/${DATE}`);
const SHIRT = "#ffffff";
const KIDS_UNIT_MM = 2.5;

// Paleta das ilustrações
const INK = "#1b1b1f";
const WHITE = "#ffffff";
const GI_SHADE = "#e4e7ec";
const SKIN = "#eab48c";
const CHEEK = "#f2928f";
const BELT = "#141414";
const RED = "#c8262c";
const BLUE = "#1f4f8f";

const F800 = await loadBarlow(800);
const F600 = await loadBarlow(600);

// ---------- Peças de desenho (unidades da ilustração: 1000 × 1100) ---------------
const OUT_W = 16; // espessura do contorno

/** Membro em tubo com contorno: traço escuro largo e traço colorido por cima. */
const tube = (d, w, fill) =>
  `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w + 2 * OUT_W}" stroke-linecap="round" stroke-linejoin="round"/>` +
  `<path d="${d}" fill="none" stroke="${fill}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;

const shape = (d, fill, sw = OUT_W) =>
  `<path d="${d}" fill="${fill}" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"/>`;

const dot = (cx, cy, r, fill, sw = OUT_W) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${INK}" stroke-width="${sw}"/>`;

const line = (d, sw = 8, color = INK) =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`;

/** Estrela de 4 pontas (brilho). */
const sparkle = (x, y, r, fill) =>
  `<path d="M${x} ${y - r} Q${x + r * 0.18} ${y - r * 0.18} ${x + r} ${y} Q${x + r * 0.18} ${y + r * 0.18} ${x} ${y + r} Q${x - r * 0.18} ${y + r * 0.18} ${x - r} ${y} Q${x - r * 0.18} ${y - r * 0.18} ${x} ${y - r} Z" fill="${fill}"/>`;

/** Estrela de 5 pontas. */
function star(cx, cy, r, fill) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.45 : r;
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * Math.sin(a)).toFixed(1)}`);
  }
  return `<path d="M${pts.join(" L")} Z" fill="${fill}" stroke-linejoin="round"/>`;
}

/** Faixa preta amarrada: faixa na cintura, nó e as duas pontas; ponteira vermelha com 4 graus. */
function tiedBelt({ x1, x2, y, h, tilt = 0 }) {
  const cx = (x1 + x2) / 2;
  const k = h * 1.3;
  const endL = `M${cx - 14} ${y + h} L${cx - 70} ${y + h + 120 + tilt} L${cx - 30} ${y + h + 132 + tilt} L${cx + 6} ${y + h + 10} Z`;
  const endR = `M${cx + 4} ${y + h} L${cx + 66} ${y + h + 112 - tilt} L${cx + 104} ${y + h + 94 - tilt} L${cx + 30} ${y + h} Z`;
  // ponteira vermelha na ponta direita, com os quatro graus brancos
  const tx1 = cx + 46, ty1 = y + h + 76 - tilt, tx2 = cx + 82, ty2 = y + h + 58 - tilt;
  const tip = `M${tx1} ${ty1} L${cx + 66} ${y + h + 112 - tilt} L${cx + 104} ${y + h + 94 - tilt} L${tx2} ${ty2} Z`;
  const stripes = [0.2, 0.4, 0.6, 0.8]
    .map((t) => {
      const ax = tx1 + (cx + 66 - tx1) * t, ay = ty1 + (y + h + 112 - tilt - ty1) * t;
      const bx = tx2 + (cx + 104 - tx2) * t, by = ty2 + (y + h + 94 - tilt - ty2) * t;
      return line(`M${ax} ${ay} L${bx} ${by}`, 5, WHITE);
    })
    .join("");
  return (
    shape(endL, BELT, 10) +
    shape(endR, BELT, 10) +
    `<path d="${tip}" fill="${RED}"/>` +
    stripes +
    shape(`M${x1} ${y} L${x2} ${y} L${x2} ${y + h} L${x1} ${y + h} Z`, BELT, 10) +
    shape(`M${cx - k / 2} ${y - 8} L${cx + k / 2} ${y - 8} L${cx + k / 2 - 6} ${y + h + 8} L${cx - k / 2 + 6} ${y + h + 8} Z`, BELT, 10)
  );
}

// ---------- Menino super-herói ----------------------------------------------------
function heroBoy() {
  let s = "";
  // fundo: disco azul com estrelas
  s += `<circle cx="500" cy="560" r="440" fill="${BLUE}"/>`;
  s += star(170, 300, 34, WHITE) + star(840, 250, 26, WHITE) + star(880, 640, 20, WHITE) + star(130, 700, 22, WHITE);
  s += sparkle(250, 170, 22, WHITE) + sparkle(760, 860, 18, WHITE);

  // capa vermelha atrás do corpo, ao vento
  s += shape(
    "M392 452 C300 560 230 740 150 930 Q230 900 290 950 Q360 900 420 960 L580 960 Q640 900 710 950 Q770 900 850 930 C770 740 700 560 608 452 Z",
    RED,
  );
  s += line("M330 640 Q300 760 250 900", 8, "#9e1c21") + line("M680 640 Q700 760 750 900", 8, "#9e1c21");

  // pernas (calça do kimono) e pés descalços
  s += tube("M450 770 L400 880 L392 920", 120, WHITE);
  s += tube("M550 770 L600 880 L608 920", 120, WHITE);
  s += line("M425 840 Q420 880 405 905", 6, GI_SHADE) + line("M575 840 Q580 880 595 905", 6, GI_SHADE);
  s += shape("M440 1000 Q446 958 400 952 Q340 948 318 984 Q314 1004 340 1006 Z", SKIN, 12);
  s += shape("M560 1000 Q554 958 600 952 Q660 948 682 984 Q686 1004 660 1006 Z", SKIN, 12);

  // casaco do kimono
  s += shape("M388 436 L612 436 Q690 456 696 540 L688 790 L312 790 L304 540 Q310 456 388 436 Z", WHITE);
  s += `<path d="M470 436 L530 436 L500 500 Z" fill="${SKIN}"/>`;
  // golas cruzadas (a da esquerda do menino por cima)
  s += shape("M528 436 L566 436 L470 650 L434 640 Z", WHITE, 10);
  s += shape("M434 436 L472 436 L566 640 L530 650 Z", WHITE, 10);
  s += line("M500 690 L478 790", 8);

  // faixa preta amarrada
  s += tiedBelt({ x1: 306, x2: 694, y: 650, h: 52 });

  // braços: mãos na cintura (pose de herói)
  s += tube("M392 476 L292 590 L338 676", 84, WHITE);
  s += tube("M608 476 L708 590 L662 676", 84, WHITE);
  s += dot(334, 684, 38, SKIN, 12);
  s += dot(666, 684, 38, SKIN, 12);

  // cabeça
  s += shape("M470 382 L530 382 L530 440 L470 440 Z", SKIN, 12);
  s += dot(346, 296, 30, SKIN, 12) + dot(654, 296, 30, SKIN, 12);
  s += dot(500, 280, 160, SKIN);
  // cabelo arrepiado
  s += shape(
    "M346 268 C330 170 400 106 470 104 L452 64 L510 100 L530 52 L556 106 L612 74 L606 128 C660 150 670 220 656 268 C620 210 560 190 500 196 C440 190 390 210 346 268 Z",
    "#3a2a20",
  );
  // máscara de herói
  s += shape(
    "M352 246 Q360 214 410 216 Q470 220 500 240 Q530 220 590 216 Q640 214 648 246 Q652 290 610 300 Q560 306 520 282 L500 272 L480 282 Q440 306 390 300 Q348 290 352 246 Z",
    BLUE,
    12,
  );
  s += `<ellipse cx="428" cy="258" rx="30" ry="24" fill="${WHITE}"/><ellipse cx="572" cy="258" rx="30" ry="24" fill="${WHITE}"/>`;
  s += `<circle cx="434" cy="262" r="13" fill="${INK}"/><circle cx="566" cy="262" r="13" fill="${INK}"/>`;
  s += `<circle cx="439" cy="257" r="4" fill="${WHITE}"/><circle cx="571" cy="257" r="4" fill="${WHITE}"/>`;
  // bochechas e sorriso confiante
  s += `<ellipse cx="400" cy="336" rx="26" ry="16" fill="${CHEEK}" opacity="0.8"/><ellipse cx="600" cy="336" rx="26" ry="16" fill="${CHEEK}" opacity="0.8"/>`;
  s += shape("M450 330 Q500 382 556 326 Q500 350 450 330 Z", INK, 8);
  return s;
}

// ---------- Menina bailarina ------------------------------------------------------
function ballerinaGirl() {
  const PINK = "#f4a9be";
  const PINK_L = "#fad3de";
  const PINK_D = "#d9748f";
  const TIGHTS = "#f7cbd6";
  const HAIR = "#5a3a24";
  const GOLD = "#e8b64c";
  const SOFT = 12; // contorno mais fino: delicada
  const tubeSoft = (d, w, fill) =>
    `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w + 2 * SOFT}" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path d="${d}" fill="none" stroke="${fill}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const soft = (d, fill) => shape(d, fill, SOFT);

  let s = "";
  // fundo: disco rosa claro e brilhos
  s += `<circle cx="500" cy="580" r="430" fill="${PINK_L}"/>`;
  s += sparkle(190, 330, 34, WHITE) + sparkle(820, 300, 28, GOLD) + sparkle(860, 700, 24, WHITE) + sparkle(150, 760, 26, GOLD);
  s += sparkle(260, 520, 14, GOLD) + sparkle(760, 520, 14, WHITE) + sparkle(700, 900, 16, GOLD);

  // pernas: em ponta na esquerda, a direita em passé (joelho dobrado, pé no joelho)
  s += tubeSoft("M486 760 L488 960", 52, TIGHTS);
  s += tubeSoft("M518 770 L616 850 L506 884", 52, TIGHTS);
  // sapatilhas de ponta com fitas
  s += soft("M466 952 L510 952 L504 1026 Q488 1040 472 1026 Z", PINK);
  s += line("M470 968 L506 990 M506 968 L470 990", 5, PINK_D);
  s += `<ellipse cx="504" cy="884" rx="34" ry="24" fill="${PINK}" stroke="${INK}" stroke-width="${SOFT}"/>`;

  // tutu em duas camadas
  s += soft("M280 708 Q500 650 720 708 L770 760 Q740 790 700 774 Q680 808 636 788 Q612 820 566 798 Q534 826 500 800 Q466 826 434 798 Q388 820 364 788 Q320 808 300 774 Q260 790 230 760 Z", PINK);
  s += soft("M330 704 Q500 664 670 704 L700 742 Q672 764 640 748 Q616 776 580 758 Q546 784 500 764 Q454 784 420 758 Q384 776 360 748 Q328 764 300 742 Z", PINK_L);

  // casaco do kimono (mais justo)
  s += soft("M414 470 L586 470 Q640 486 644 550 L636 716 L364 716 L356 550 Q360 486 414 470 Z", WHITE);
  s += `<path d="M476 470 L524 470 L500 520 Z" fill="${SKIN}"/>`;
  s += shape("M520 470 L552 470 L474 640 L446 632 Z", WHITE, 8);
  s += shape("M448 470 L480 470 L556 632 L528 640 Z", WHITE, 8);
  // flor pequena no peito
  s += [0, 72, 144, 216, 288]
    .map((a) => {
      const r = (a * Math.PI) / 180;
      return `<circle cx="${(590 + 14 * Math.cos(r)).toFixed(1)}" cy="${(560 + 14 * Math.sin(r)).toFixed(1)}" r="11" fill="${PINK}"/>`;
    })
    .join("") + `<circle cx="590" cy="560" r="7" fill="${GOLD}"/>`;

  // faixa preta
  s += tiedBelt({ x1: 360, x2: 640, y: 652, h: 40, tilt: -6 });

  // braços em quinta posição: arco acima da cabeça
  s += tubeSoft("M424 500 C340 440 300 220 468 96", 40, WHITE);
  s += tubeSoft("M576 500 C660 440 700 220 532 96", 40, WHITE);
  s += dot(474, 92, 24, SKIN, SOFT) + dot(526, 92, 24, SKIN, SOFT);

  // cabeça: coque com laço
  s += soft("M476 420 L524 420 L524 478 L476 478 Z", SKIN);
  s += dot(500, 166, 50, HAIR, SOFT);
  s += dot(500, 330, 138, SKIN, SOFT);
  // cabelo preso, com franja lateral
  s += soft("M364 318 C356 236 420 186 500 186 C580 186 646 236 636 318 C610 260 560 238 520 246 C470 260 420 270 364 318 Z", HAIR);
  s += soft("M500 200 L454 176 Q442 200 454 224 Z", PINK) + soft("M500 200 L546 176 Q558 200 546 224 Z", PINK);
  s += `<circle cx="500" cy="200" r="11" fill="${PINK_D}"/>`;
  // olhos fechados e sorridentes, com cílios
  s += line("M410 334 Q432 312 456 334", 9) + line("M544 334 Q568 312 590 334", 9);
  s += line("M412 330 L400 320 M424 322 L418 309 M590 330 L602 320 M578 322 L584 309", 5);
  s += `<ellipse cx="412" cy="372" rx="26" ry="15" fill="${CHEEK}" opacity="0.75"/><ellipse cx="588" cy="372" rx="26" ry="15" fill="${CHEEK}" opacity="0.75"/>`;
  s += line("M474 384 Q500 404 526 384", 8);
  return s;
}

// ---------- Costas: 220 mm de largura ------------------------------------------
function back(art, caption) {
  const W = 220;
  const k = W / 1000; // unidades da ilustração → mm
  const artH = 1050 * k;
  let body = `<g transform="scale(${k})">${art}</g>`;
  const probe = textPath(F800, caption, { x: W / 2, baseline: 0, width: W * 0.86, tracking: 0.02, align: "center" });
  const capH = -probe.bbox.y1;
  const base1 = artH + 10 + capH;
  const cap = textPath(F800, caption, { x: W / 2, baseline: base1, size: probe.size, tracking: 0.02, align: "center" });
  const sub = textPath(F600, "PROGRESSIVE KIDS", { x: W / 2, baseline: base1 + 14, size: 11, tracking: 0.32, align: "center" });
  body += `<path d="${cap.d}" fill="${INK}"/><path d="${sub.d}" fill="${INK}"/>`;
  const H = Math.ceil(base1 + 18);
  return { svg: svgDoc(W, H, body), svgPx: svgDoc(W, H, body, true), W, H };
}

// ---------- Frente: 100 mm de largura, igual para menino e menina ---------------
function front() {
  const W = 100, M = 3;
  const inner = W - 2 * M;
  const probe = textPath(F800, "PROGRESSIVE", { x: M, baseline: 0, width: inner, tracking: 0.02 });
  const capH = -probe.bbox.y1;
  const top = 3;
  const word = textPath(F800, "PROGRESSIVE", { x: M, baseline: top + capH, size: probe.size, tracking: 0.02 });
  // faixa preta com KIDS vazado em branco, ponteira vermelha e 4 graus
  const y = top + capH + 4;
  const h = 13;
  const tipW = 26, endW = 6;
  const tipX = M + inner - endW - tipW;
  const kidsProbe = textPath(F800, "KIDS", { x: 0, baseline: 0, size: 10, tracking: 0.12 });
  const kh = -kidsProbe.bbox.y1;
  const kids = textPath(F800, "KIDS", { x: M + 6, baseline: y + h / 2 + kh / 2, size: 10, tracking: 0.12 });
  const sw = tipW * 0.08, gap = (tipW - 4 * sw) / 5;
  const stripes = Array.from({ length: 4 }, (_, i) =>
    `<rect x="${tipX + gap + i * (sw + gap)}" y="${y}" width="${sw}" height="${h}" fill="${WHITE}"/>`,
  ).join("");
  const body =
    `<path d="${word.d}" fill="${INK}"/>` +
    `<rect x="${M}" y="${y}" width="${inner}" height="${h}" rx="1.2" fill="${BELT}"/>` +
    `<rect x="${tipX}" y="${y}" width="${tipW}" height="${h}" fill="${RED}"/>` +
    stripes +
    `<path d="${kids.d}" fill="${WHITE}"/>`;
  const H = Math.ceil(y + h + 3);
  return { svg: svgDoc(W, H, body), svgPx: svgDoc(W, H, body, true), W, H };
}

// ---------- Execução ------------------------------------------------------------
await mkdir(ROOT, { recursive: true });

async function writePrint(name, art) {
  await writeFile(path.join(ROOT, `${name}.svg`), art.svg);
  const png = await rasterize(art.svgPx);
  await writeFile(path.join(ROOT, `${name}.png`), png);
  const m = await sharp(png).metadata();
  return {
    file: `${name}.png`,
    svg: `${name}.svg`,
    width_px: m.width,
    height_px: m.height,
    dpi: DPI,
    width_mm: art.W,
    height_mm: art.H,
    transparent: m.hasAlpha,
  };
}

const f = front();
const printFront = await writePrint("print-front", f);
await writeFile(
  path.join(ROOT, "mockup-front.png"),
  await mockup("front", path.join(ROOT, "print-front.png"), f.W, 86, SHIRT, KIDS_UNIT_MM),
);

const KIDS = [
  { slug: "menino", name: "Menino", color: BLUE, art: heroBoy(), caption: "HERÓI DO TATAME" },
  { slug: "menina", name: "Menina", color: "#f4a9be", art: ballerinaGirl(), caption: "BAILARINA DO TATAME" },
];

const variants = [];
for (const kid of KIDS) {
  const b = back(kid.art, kid.caption);
  const printBack = await writePrint(`print-back-${kid.slug}`, b);
  await writeFile(
    path.join(ROOT, `mockup-back-${kid.slug}.png`),
    await mockup("back", path.join(ROOT, `print-back-${kid.slug}.png`), b.W, 70, SHIRT, KIDS_UNIT_MM),
  );
  variants.push({
    slug: kid.slug,
    name: kid.name,
    color: kid.color,
    print_front: printFront,
    mockup_front: { file: "mockup-front.png" },
    print_back: printBack,
    mockup_back: { file: `mockup-back-${kid.slug}.png` },
  });
}

const featured = variants[0];
const manifest = {
  drop_date: DATE,
  number: 2,
  title: "Progressive Kids",
  version: 1,
  status: "ready_for_review",
  concept:
    "Linha infantil. Na frente, PROGRESSIVE sobre uma faixa preta com KIDS; nas costas, o menino super-herói e a menina bailarina, os dois de kimono e faixa preta.",
  garment: { type: "Camiseta infantil", color: "Branca", ink: ["Preto", "Vermelho", "Azul", "Rosa", "Pele", "Marrom", "Dourado"] },
  origin: "Ideia do diretor criativo; criação assistida na sessão de desenvolvimento.",
  provisional_specs: "Medidas provisórias para o tamanho 8 até a conferência na YouDraw.",
  featured_variant: featured.slug,
  variant_text: {
    legend: "Mesma frente, costas diferentes para menino e menina",
    front_note: "estampa de 10 cm (infantil)",
    back_note: "estampa de 22 cm (infantil)",
  },
  variants,
  files: {
    mockup_front: featured.mockup_front,
    mockup_back: featured.mockup_back,
    print_front: printFront,
    print_back: featured.print_back,
  },
  created_at: new Date().toISOString(),
};
await writeFile(path.join(ROOT, "drop.json"), JSON.stringify(manifest, null, 2));
console.log(`frente: ${printFront.width_px}×${printFront.height_px}`);
for (const v of variants) console.log(`${v.slug}: ${v.print_back.width_px}×${v.print_back.height_px}`);
