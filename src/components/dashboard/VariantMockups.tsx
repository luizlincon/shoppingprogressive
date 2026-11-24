"use client";

import Image from "next/image";
import { useState } from "react";
import type { DropVariant, VariantText } from "@/lib/data/local-drops";

/**
 * Frente e costas de uma criação com variações (por faixa, ou menino e menina).
 * Escolher a variação troca o mockup da frente e, quando a variação tem costas próprias, o das costas.
 */
export function VariantMockups({
  variants,
  back,
  backPrint,
  backPdf,
  text,
}: {
  variants: DropVariant[];
  back: string | null;
  /** Estampa traseira comum a todas as variações (quando a variação não tem costas próprias). */
  backPrint: string | null;
  backPdf: string | null;
  text: VariantText;
}) {
  const [slug, setSlug] = useState(variants.find((v) => v.featured)?.slug ?? variants[0].slug);
  const current = variants.find((v) => v.slug === slug)!;
  const backSrc = current.mockupBack ?? back;
  const ownBack = Boolean(current.mockupBack);
  const sharedFront = variants.every((v) => v.print === variants[0].print);

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 md:gap-6">
        <Figure src={current.mockup} label="Frente" note={`${current.name}, ${text.front_note}`} />
        {backSrc ? (
          <Figure src={backSrc} label="Costas" note={ownBack ? `${current.name}, ${text.back_note}` : text.back_note} />
        ) : null}
      </div>
      <fieldset className="mt-4">
        <legend className="mb-2 text-body text-muted">{text.legend}</legend>
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
      <dl className="mt-3 flex flex-col gap-1 text-body">
        <FileRow
          label={sharedFront ? "Estampa frontal" : `Estampa frontal, ${current.name.toLowerCase()}`}
          png={current.print}
          pdf={current.pdf}
        />
        <FileRow
          label={ownBack ? `Estampa traseira, ${current.name.toLowerCase()}` : "Estampa traseira"}
          png={current.printBack ?? backPrint}
          pdf={ownBack ? current.backPdf : backPdf}
        />
      </dl>
    </div>
  );
}

/** Uma estampa: PNG 300 DPI (tela e DTF) e, quando gerado, o PDF CMYK da gráfica. */
function FileRow({ label, png, pdf }: { label: string; png: string | null; pdf: string | null }) {
  if (!png && !pdf) return null;
  const link = "font-medium underline underline-offset-4";
  return (
    <div className="flex flex-wrap items-baseline gap-x-4">
      <dt className="text-muted">{label}</dt>
      <dd className="flex gap-x-4">
        {png ? (
          <a href={png} target="_blank" rel="noreferrer" className={link}>
            PNG
          </a>
        ) : null}
        {pdf ? (
          <a href={pdf} target="_blank" rel="noreferrer" className={link}>
            PDF CMYK
          </a>
        ) : null}
      </dd>
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
