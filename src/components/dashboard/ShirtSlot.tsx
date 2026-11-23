/**
 * Espaço do mockup: a silhueta-base da camiseta (frente ou costas) com a área de estampa tracejada.
 * Não é um mockup gerado: é o molde onde o Mockup Engine vai compor a estampa.
 * As medidas da área de impressão serão as da referência técnica da YouDraw, ainda a confirmar.
 */
export function ShirtSlot({ side, state }: { side: "front" | "back"; state: string }) {
  const label = side === "front" ? "Frente" : "Costas";
  // Gola: a frente desce mais que as costas.
  return (
    <figure className="flex min-w-0 flex-col">
      <div className="flex aspect-[4/5] items-center justify-center rounded-card bg-raised">
        <svg viewBox="0 0 320 340" className="h-[82%] w-auto" role="img" aria-label={`Molde da camiseta, ${label.toLowerCase()}`}>
          <path
            d={`M134 44 ${side === "front" ? "Q160 74" : "Q160 58"} 186 44 L246 66 L300 120 L262 152 L240 134 L240 318 L80 318 L80 134 L58 152 L20 120 L74 66 Z`}
            fill="#ffffff"
            stroke="#cdced1"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <rect
            x="112"
            y={side === "front" ? 104 : 92}
            width="96"
            height={side === "front" ? 120 : 150}
            fill="none"
            stroke="#9da0a4"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        </svg>
      </div>
      <figcaption className="mt-3 flex flex-wrap items-baseline justify-between gap-x-3">
        <span className="font-medium">{label}</span>
        <span className="text-small text-muted">{state}</span>
      </figcaption>
    </figure>
  );
}
