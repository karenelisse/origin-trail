create table public.products (
  id uuid primary key default gen_random_uuid(),

  name text not null,
  brand text,
  manufacturer text,

  manufacturing_country text,
  manufacturing_state_region text,
  manufacturing_city_town text,

  growing_country text,
  growing_state_region text,
  growing_city_town text,

  brand_hq_country text,
  brand_hq_state_region text,
  brand_hq_city_town text,

  parent_company text,
  parent_hq_country text,
  parent_hq_state_region text,
  parent_hq_city_town text,

  production_confidence text not null,
  parent_company_confidence text not null,

  notes jsonb not null default '[]'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  checked_at timestamptz not null default now()
);

create table public.product_sources (
  id uuid primary key default gen_random_uuid(),

  product_id uuid not null
    references public.products(id)
    on delete cascade,

  section text not null,
  title text,
  url text not null,
  source_type text not null,

  created_at timestamptz not null default now()
);

create index products_name_idx
  on public.products (lower(name));

create index products_brand_idx
  on public.products (lower(brand));

create index product_sources_product_id_idx
  on public.product_sources (product_id);

alter table public.products enable row level security;
alter table public.product_sources enable row level security;

revoke all on table public.products from anon;
revoke all on table public.products from authenticated;

revoke all on table public.product_sources from anon;
revoke all on table public.product_sources from authenticated;