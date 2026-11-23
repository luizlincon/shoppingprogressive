import type { DayCell } from "@/lib/data/dashboard";
import type { CreationStatus } from "@/lib/types";
import { STATUS_LABEL } from "@/lib/types";
import { shortDate } from "@/lib/dates";

/**
 * Elemento-assinatura: a faixa dos últimos 30 dias.
 * Cada dia é um segmento da faixa. Aprovada = azul de faixa cheio; aguardando = contorno azul;
 * rejeitada = tinta; sem criação = tom de fundo. Hoje fica marcado no fim, como a ponteira.
 */
const CELL: Record<"approved" | "review" | "rejected" | "other" | "none", string> = {
  approved: "bg-accent",
  review: "bg-surface ring-2 ring-inset ring-accent",
  rejected: "bg-ink",
  other: "bg-control",
  none: "bg-raised ring-1 ring-inset ring-border",
};

function bucket(s: CreationStatus | null): keyof typeof CELL {
  if (!s) return "none";
  if (s === "approved") return "approved";
  if (s === "ready_for_review" || s === "changes_requested") return "review";
  if (s === "rejected") return "rejected";
  return "other";
}

export function DropStrip({ days }: { days: DayCell[] }) {
  const count = (b: keyof typeof CELL) => days.filter((d) => bucket(d.status) === b).length;
  const approved = count("approved");
  const review = count("review");
  const rejected = count("rejected");
  const none = count("none");
  const other = days.length - approved - review - rejected - none;

  return (
    <div>
      <ol className="grid grid-cols-[repeat(15,minmax(0,1fr))] gap-1 md:grid-cols-[repeat(30,minmax(0,1fr))]">
        {days.map((d, i) => {
          const isToday = i === days.length - 1;
          const label = `${shortDate(d.date)}: ${d.status ? STATUS_LABEL[d.status] : "sem criação"}`;
          return (
            <li key={d.date} className="flex flex-col items-center gap-1.5" title={label}>
              <span className="sr-only">{label}</span>
              <span
                aria-hidden="true"
                className={`block h-9 w-full rounded-[3px] ${CELL[bucket(d.status)]} ${
                  isToday ? "outline-2 outline-offset-2 outline-ink" : ""
                }`}
              />
              <span aria-hidden="true" className={`tabular text-[11px] leading-none ${isToday ? "font-semibold text-ink" : "text-muted"}`}>
                {isToday ? "Hoje" : i % 5 === 0 ? shortDate(d.date) : " "}
              </span>
            </li>
          );
        })}
      </ol>
      <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-2 text-body">
        {[
          { k: "Aprovadas", v: approved, sw: CELL.approved },
          { k: "Aguardando decisão", v: review, sw: CELL.review },
          { k: "Rejeitadas", v: rejected, sw: CELL.rejected },
          ...(other ? [{ k: "Em produção", v: other, sw: CELL.other }] : []),
          { k: "Dias sem criação", v: none, sw: CELL.none },
        ].map((row) => (
          <div key={row.k} className="flex items-center gap-2">
            <span aria-hidden="true" className={`h-3 w-3 rounded-[2px] ${row.sw}`} />
            <dt className="text-muted">{row.k}</dt>
            <dd className="tabular font-medium">{row.v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
