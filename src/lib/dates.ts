/** Datas sempre no fuso de São Paulo: o "dia" de um drop é o dia no Brasil. */
export const TZ = "America/Sao_Paulo";

export function isoDateInTZ(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
  return parts; // en-CA já sai como YYYY-MM-DD
}

/** Os últimos `n` dias terminando hoje, do mais antigo para o mais novo. */
export function lastNDays(today: string, n: number): string[] {
  const [y, m, d] = today.split("-").map(Number);
  const base = Date.UTC(y, m - 1, d);
  return Array.from({ length: n }, (_, i) =>
    new Date(base - (n - 1 - i) * 86_400_000).toISOString().slice(0, 10),
  );
}

export function longDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
    .format(new Date(Date.UTC(y, m - 1, d)))
    .replace(/^./, (c) => c.toUpperCase()); // só a inicial: "Segunda-feira, 23 de novembro de 2026"
}

export function shortDate(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}
