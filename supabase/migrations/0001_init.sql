-- Progressive BJJ Design Lab — esquema inicial
-- Aplicar no SQL Editor do Supabase (ou `supabase db push` quando a CLI estiver instalada).
-- Regras de negócio garantidas no próprio banco:
--   1. Uma criação por dia (drop_date único).
--   2. Aprovação exclusivamente humana: a criação só vira "approved" se existir um registro em
--      approvals feito por um usuário autenticado (auth.uid()), nunca pela chave de serviço.
--   3. Versões são imutáveis: cada geração cria uma nova linha em creation_versions.

-- gen_random_uuid() é nativo no Postgres 13+ (Supabase usa 15+): nenhuma extensão necessária.

-- Tipos ---------------------------------------------------------------------

create type creation_status as enum (
  'draft', 'generating', 'ready_for_review', 'approved', 'rejected', 'changes_requested', 'archived'
);

create type asset_kind as enum (
  'mockup_front', 'mockup_back', 'print_front', 'print_back', 'briefing_pdf', 'export_zip'
);

create type approval_decision as enum ('approved', 'rejected', 'changes_requested');

create type memory_kind as enum ('principle', 'preference', 'avoid', 'reference', 'learning');

create type memory_source as enum ('seed', 'approval', 'rejection', 'manual');

create type run_status as enum ('queued', 'running', 'succeeded', 'failed');

-- Utilitário de updated_at ----------------------------------------------------

create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- Coleções ------------------------------------------------------------------

create table collections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger collections_updated_at before update on collections
  for each row execute function set_updated_at();

-- Criações (uma por dia) ----------------------------------------------------

create table creations (
  id uuid primary key default gen_random_uuid(),
  drop_date date not null unique,             -- dia no fuso America/Sao_Paulo
  title text,
  concept text,                                -- resumo do briefing criativo
  status creation_status not null default 'draft',
  collection_id uuid references collections(id) on delete set null,
  current_version_id uuid,                     -- FK adicionada depois de creation_versions
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger creations_updated_at before update on creations
  for each row execute function set_updated_at();
create index creations_status_idx on creations(status);
create index creations_collection_idx on creations(collection_id);

-- Versões (imutáveis) -------------------------------------------------------

create table creation_versions (
  id uuid primary key default gen_random_uuid(),
  creation_id uuid not null references creations(id) on delete cascade,
  version_number int not null check (version_number > 0),
  briefing jsonb not null default '{}'::jsonb,       -- briefing criativo estruturado
  prompts jsonb not null default '{}'::jsonb,        -- prompts enviados (texto e imagem)
  text_model text,                                   -- ex.: modelo Claude usado
  image_provider text,
  image_model text,
  instruction text,                                  -- pedido do diretor criativo que gerou esta versão
  created_at timestamptz not null default now(),
  unique (creation_id, version_number)
);

alter table creations
  add constraint creations_current_version_fk
  foreign key (current_version_id) references creation_versions(id) on delete set null;

create or replace function forbid_version_update() returns trigger
language plpgsql as $$
begin
  raise exception 'creation_versions é imutável: crie uma nova versão';
end $$;
create trigger creation_versions_immutable before update on creation_versions
  for each row execute function forbid_version_update();

-- Arquivos (Storage) --------------------------------------------------------

create table assets (
  id uuid primary key default gen_random_uuid(),
  version_id uuid not null references creation_versions(id) on delete cascade,
  kind asset_kind not null,
  storage_bucket text not null,
  storage_path text not null,
  mime_type text,
  width_px int,
  height_px int,
  dpi int,
  color_mode text,               -- ex.: 'sRGB', 'RGBA'
  has_transparency boolean,
  bytes bigint,
  checksum_sha256 text,
  created_at timestamptz not null default now(),
  unique (version_id, kind),
  unique (storage_bucket, storage_path)
);

-- Aprovações (humanas) ------------------------------------------------------

create table approvals (
  id uuid primary key default gen_random_uuid(),
  creation_id uuid not null references creations(id) on delete cascade,
  version_id uuid not null references creation_versions(id) on delete cascade,
  decision approval_decision not null,
  reason text,                                   -- o porquê alimenta a Brand Memory
  tags text[] not null default '{}',
  decided_by uuid not null references auth.users(id),
  decided_at timestamptz not null default now()
);
create index approvals_creation_idx on approvals(creation_id);

-- Uma aprovação só pode ser registrada por um usuário autenticado, em nome dele mesmo.
create or replace function enforce_human_approval() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then
    raise exception 'Aprovações exigem um usuário humano autenticado';
  end if;
  if new.decided_by is distinct from auth.uid() then
    raise exception 'decided_by precisa ser o próprio usuário autenticado';
  end if;
  return new;
end $$;
create trigger approvals_human_only before insert on approvals
  for each row execute function enforce_human_approval();

-- A criação só pode virar approved/rejected com uma decisão humana correspondente.
create or replace function guard_creation_status() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status in ('approved', 'rejected', 'changes_requested')
     and new.status is distinct from old.status then
    if not exists (
      select 1 from approvals a
      where a.creation_id = new.id
        and a.version_id = new.current_version_id
        and a.decision::text = new.status::text
        and a.decided_by = auth.uid()
    ) then
      raise exception 'Status % exige uma decisão humana registrada em approvals', new.status;
    end if;
  end if;
  return new;
end $$;
create trigger creations_status_guard before update of status on creations
  for each row execute function guard_creation_status();

-- Brand Memory --------------------------------------------------------------

create table brand_memory (
  id uuid primary key default gen_random_uuid(),
  kind memory_kind not null,
  content text not null,
  weight numeric(4,2) not null default 1.0,
  source memory_source not null default 'manual',
  source_approval_id uuid references approvals(id) on delete set null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index brand_memory_active_idx on brand_memory(active, kind);

-- Execuções de geração (auditoria e custo) ----------------------------------

create table generation_runs (
  id uuid primary key default gen_random_uuid(),
  creation_id uuid references creations(id) on delete cascade,
  version_id uuid references creation_versions(id) on delete set null,
  stage text not null,             -- 'briefing' | 'print_front' | 'print_back' | 'mockup' | 'print_files'
  provider text not null,          -- 'anthropic' | provedor de imagem | 'sharp'
  status run_status not null default 'queued',
  input jsonb,
  output jsonb,
  error text,
  cost_usd numeric(10,4),
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now()
);
create index generation_runs_creation_idx on generation_runs(creation_id);

-- Especificações de impressão (referência técnica YouDraw) ------------------
-- Nenhum valor é semeado: as medidas precisam ser conferidas na documentação oficial da YouDraw
-- e cadastradas com verified = true por uma pessoa.

create table print_specs (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'youdraw',
  product text not null,           -- ex.: 'Camiseta'
  area text not null,              -- 'front' | 'back'
  width_cm numeric(6,2),
  height_cm numeric(6,2),
  min_dpi int,
  file_format text,                -- ex.: 'PNG'
  color_mode text,
  transparent_background boolean,
  source_url text,                 -- onde a medida foi conferida
  notes text,
  verified boolean not null default false,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  unique (provider, product, area)
);

-- Visão com contagem por coleção (usada no dashboard) -----------------------

create view collections_with_counts with (security_invoker = true) as
  select c.id, c.name, c.slug, count(cr.id)::int as creations_count
  from collections c
  left join creations cr on cr.collection_id = c.id
  group by c.id;

-- RLS -----------------------------------------------------------------------
-- Ferramenta interna: qualquer usuário autenticado do projeto lê e edita.
-- A chave de serviço (pipeline de geração) ignora RLS, mas não passa pelos gatilhos de aprovação,
-- porque auth.uid() é nulo para ela.

alter table collections enable row level security;
alter table creations enable row level security;
alter table creation_versions enable row level security;
alter table assets enable row level security;
alter table approvals enable row level security;
alter table brand_memory enable row level security;
alter table generation_runs enable row level security;
alter table print_specs enable row level security;

create policy "autenticados leem" on collections for select to authenticated using (true);
create policy "autenticados editam" on collections for all to authenticated using (true) with check (true);

create policy "autenticados leem" on creations for select to authenticated using (true);
create policy "autenticados editam" on creations for update to authenticated using (true) with check (true);

create policy "autenticados leem" on creation_versions for select to authenticated using (true);
create policy "autenticados leem" on assets for select to authenticated using (true);
create policy "autenticados leem" on generation_runs for select to authenticated using (true);

create policy "autenticados leem" on approvals for select to authenticated using (true);
create policy "decisão própria" on approvals for insert to authenticated
  with check (decided_by = auth.uid());

create policy "autenticados leem" on brand_memory for select to authenticated using (true);
create policy "autenticados editam" on brand_memory for all to authenticated using (true) with check (true);

create policy "autenticados leem" on print_specs for select to authenticated using (true);
create policy "autenticados editam" on print_specs for all to authenticated using (true) with check (true);

-- Storage -------------------------------------------------------------------
-- Buckets privados: o app gera URLs assinadas para exibir.

insert into storage.buckets (id, name, public)
values ('mockups', 'mockups', false), ('prints', 'prints', false), ('exports', 'exports', false)
on conflict (id) do nothing;

create policy "autenticados leem arquivos do lab" on storage.objects for select to authenticated
  using (bucket_id in ('mockups', 'prints', 'exports'));
