/**
 * Print Engine: arquivos para a gráfica com o VectorCraft (ArtCraft), rodando localmente.
 *
 * Para cada estampa em SVG da versão atual de um drop, gera em `<pasta da estampa>/grafica/`:
 *   - <nome>-cmyk.pdf  PDF em CMYK, com traços contornados (vira forma preenchida) e texto já em curvas;
 *   - <nome>.ai        Illustrator (PDF compatível), em CMYK;
 *   - <nome>.eps       EPS em CMYK (EPS não tem transparência: o VectorCraft achata, sem efeito nestas artes).
 * e registra a lista em `print_files` no drop.json.
 *
 * Uso: npm run grafica -- 2026-11-24        (ou sem data: todos os drops em public/drops)
 * Executável: VECTORCRAFT_CLI, ou o caminho padrão do instalador no Windows.
 * O perfil CMYK é o padrão do VectorCraft: conferir com a YouDraw antes de imprimir.
 */
import { execFile } from "node:child_process";
import { access, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);
const CLI = process.env.VECTORCRAFT_CLI ?? "C:\\Program Files\\ArtCraft\\VectorCraft\\vectorcraft-cli.exe";
const DROPS = path.resolve("public/drops");

try {
  await access(CLI);
} catch {
  console.error(`VectorCraft não encontrado em: ${CLI}\nInstale pelo ArtCraft Launcher ou defina VECTORCRAFT_CLI.`);
  process.exit(1);
}

const raw = async (...args) => (await run(CLI, args, { maxBuffer: 64 * 1024 * 1024 })).stdout;

/** `run` imprime um objeto JSON por linha, um por passo. */
const vc = async (...args) => {
  const stdout = await raw(...args);
  return stdout
    .split("\n")
    .filter((l) => l.trim().startsWith("{"))
    .map((l) => JSON.parse(l));
};

/** SVGs da versão atual: estampas do manifesto e das variações, sem repetir. */
function currentSvgs(drop) {
  const files = [drop.files?.print_front, drop.files?.print_back];
  for (const v of drop.variants ?? []) files.push(v.print_front, v.print_back);
  return [...new Set(files.filter((f) => f?.svg).map((f) => f.svg))];
}

async function exportDrop(date) {
  const dir = path.join(DROPS, date);
  const manifestPath = path.join(dir, "drop.json");
  const drop = JSON.parse(await readFile(manifestPath, "utf8"));
  const out = {};
  for (const svg of currentSvgs(drop)) {
    const name = path.basename(svg, ".svg");
    const relDir = path.posix.join(path.posix.dirname(svg), "grafica").replace(/^\.\//, "");
    const absDir = path.join(dir, relDir);
    await mkdir(absDir, { recursive: true });
    const rel = (ext) => path.posix.join(relDir, `${name}${ext}`);
    // Contornar traços só quando a arte tem traço (o VectorCraft recusa o comando sem nenhum).
    const hasStroke = /stroke-width="(?!0")/.test(await readFile(path.join(dir, svg), "utf8"));
    const steps = await vc(
      "run",
      "--in", path.join(dir, svg),
      ...(hasStroke ? ["--cmd", "select.all", "--cmd", "object.path.outlineStroke"] : []),
      "--cmd", "file.documentColorMode", "--params", JSON.stringify({ mode: "cmyk" }),
      "--export", path.join(dir, rel("-cmyk.pdf")),
      "--export", path.join(dir, rel(".ai")),
      "--export", path.join(dir, rel(".eps")),
    );
    const failed = steps.find((s) => s.error);
    if (failed) throw new Error(`${svg}: ${JSON.stringify(failed)}`);
    const warnings = steps.flatMap((s) => s.result?.warnings ?? []);
    const info = JSON.parse(await raw("info", path.join(dir, rel("-cmyk.pdf"))));
    const [, , w, h] = info.artboards[0].rect; // pontos
    out[svg] = {
      pdf: rel("-cmyk.pdf"),
      ai: rel(".ai"),
      eps: rel(".eps"),
      color_mode: info.info.colorMode,
      width_mm: Math.round((w / 72) * 25.4 * 10) / 10,
      height_mm: Math.round((h / 72) * 25.4 * 10) / 10,
      warnings: [...new Set(warnings)],
    };
    console.log(`${date}  ${name}: ${out[svg].color_mode}, ${out[svg].width_mm} × ${out[svg].height_mm} mm`);
  }
  drop.print_files = {
    tool: "VectorCraft (ArtCraft), local",
    color_profile: "Padrão do VectorCraft — conferir com a YouDraw",
    generated_at: new Date().toISOString(),
    files: out,
  };
  await writeFile(manifestPath, JSON.stringify(drop, null, 2));
}

const arg = process.argv[2];
const dates = arg ? [arg] : (await readdir(DROPS)).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d));
for (const d of dates) await exportDrop(d);
