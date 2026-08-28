create table public.production_sites (
  id uuid primary key default gen_random_uuid(),

  product_id uuid not null
    references public.products(id)
    on delete cascade,

  manufacturer text,

  country text,
  state_region text,
  city_town text,

  market text,

  confidence text not null default 'unknown',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  checked_at timestamptz not null default now()
);

create index production_sites_product_id_idx
  on public.production_sites (product_id);

alter table public.production_sites enable row level security;

revoke all on table public.production_sites from anon;
revoke all on table public.production_sites from authenticated;
