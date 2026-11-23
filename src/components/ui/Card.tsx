/** Painel do dashboard: borda de 1px, raio de 8px, sem sombra. Título sempre presente. */
export function Card({
  title,
  aside,
  children,
  className = "",
  id,
}: {
  title: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const headingId = id ? `${id}-title` : undefined;
  return (
    <section
      aria-labelledby={headingId}
      className={`flex min-w-0 flex-col rounded-card border border-border bg-surface p-5 lg:p-6 ${className}`}
    >
      <header className="mb-4 flex items-baseline justify-between gap-4">
        <h2 id={headingId} className="text-section font-semibold">
          {title}
        </h2>
        {aside ? <div className="text-small text-muted">{aside}</div> : null}
      </header>
      {children}
    </section>
  );
}

/** Mensagem de erro dentro do bloco que falhou, nunca em tela inteira. */
export function BlockError({ message }: { message: string }) {
  return (
    <p className="mb-3 text-small text-[var(--pill-negative-ink)]">
      Não foi possível ler o banco: {message}. Confira se as migrations foram aplicadas.
    </p>
  );
}
