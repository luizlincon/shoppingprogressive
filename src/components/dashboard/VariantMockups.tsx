"use client";

import Image from "next/image";
import { useState } from "react";
import type { DropVariant } from "@/lib/data/local-drops";

/**
 * Frente e costas de uma criação com variações por faixa.
 * Escolher a faixa troca o mockup da frente; as costas são iguais em todas.
 */
export function VariantMockups({ variants, back }: { variants: DropVariant[]; back: string | null }) {
  const [slug, setSlug] = useState(variants.find((v) => v.featured)?.slug ?? variants[0].slug);
  const current = variants.find((v) => v.slug === slug)!;

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 md:gap-6">
        <Figure src={current.mockup} label="Frente" note={`${current.name}, estampa de 14 cm`} />
        {back ? <Figure src={back} label="Costas" note="Igual nas 5 faixas, 30 cm" /> : null}
      </div>
      <fieldset className="mt-4">
        <legend className="mb-2 text-body text-muted">Uma camiseta por faixa, todas com 4 graus</legend>
        <div className="flex flex-wrap gap-2" role="radiogroup">
          {variants.map((v) => {
            const active = v.slug === slug;
            return (
              <button
                key={v.slug}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setSlug(v.slug)}
                className={`press flex h-8 items-center gap-2 rounded-control border px-3 text-body ${
                  active ? "border-ink bg-ink text-white" : "border-control hover:bg-raised"
                }`}
              >
                <span
                  aria-hidden="true"
                  className="h-3 w-5 rounded-[2px] ring-1 ring-inset ring-black/20"
                  style={{ backgroundColor: v.color }}
                />
                {v.name.replace("Faixa ", "").replace(/^./, (c) => c.toUpperCase())}
              </button>
            );
          })}
        </div>
      </fieldset>
      <a href={current.print} target="_blank" rel="noreferrer" className="mt-3 inline-block text-body font-medium underline underline-offset-4">
        Estampa frontal da {current.name.toLowerCase()} (PNG)
      </a>
    </div>
  );
}

function Figure({ src, label, note }: { src: string; label: string; note: string }) {
  return (
    <figure className="flex min-w-0 flex-col">
      <a href={src} target="_blank" rel="noreferrer" className="press block overflow-hidden rounded-card bg-[#eef0f1]">
        <Image
          src={src}
          alt={`Mockup ${label.toLowerCase()}: ${note}`}
          width={1920}
          height={2040}
          sizes="(min-width: 1024px) 360px, 45vw"
          className="aspect-[4/5] h-auto w-full object-cover object-[50%_40%]"
        />
      </a>
      <figcaption className="mt-3 flex flex-wrap items-baseline justify-between gap-x-3">
        <span className="font-medium">{label}</span>
        <span className="text-small text-muted">{note}</span>
      </figcaption>
    </figure>
  );
}
