create type public.origin_type as enum (
  'manufacturing',
  'growing'
);

create type public.confidence_level as enum (
  'high',
  'medium',
  'low',
  'unknown'
);


-- Product identifiers such as UPC, EAN and GTIN.

create table public.product_identifiers (
  id uuid primary key default gen_random_uuid(),

  product_id uuid not null
    references public.products(id)
    on delete cascade,

  identifier_type text not null,
  value text not null,
  market text,

  created_at timestamptz not null default now(),

  unique (identifier_type, value)
);


-- A product can have zero, one or many known origins.

create table public.product_origins (
  id uuid primary key default gen_random_uuid(),

  product_id uuid not null
    references public.products(id)
    on delete cascade,

  origin_type public.origin_type not null,

  producer text,

  country text,
  state_region text,
  city_town text,

  market text,

  confidence public.confidence_level not null
    default 'unknown',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  checked_at timestamptz not null default now()
);


-- Sources can either support the product generally
-- or a specific manufacturing/growing origin.

alter table public.product_sources
  add column product_origin_id uuid
    references public.product_origins(id)
    on delete cascade;


-- Existing production fields now belong in product_origins,
-- not directly on products.

alter table public.products
  drop column manufacturer,
  drop column manufacturing_country,
  drop column manufacturing_state_region,
  drop column manufacturing_city_town,
  drop column growing_country,
  drop column growing_state_region,
  drop column growing_city_town,
  drop column production_confidence;


-- Parent-company confidence is still a product-level fact for now,
-- but use the same enum rather than unrestricted text.

alter table public.products
  alter column parent_company_confidence
  type public.confidence_level
  using parent_company_confidence::public.confidence_level;


-- Indexes

create index product_identifiers_product_id_idx
  on public.product_identifiers(product_id);

create index product_identifiers_value_idx
  on public.product_identifiers(value);

create index product_origins_product_id_idx
  on public.product_origins(product_id);

create index product_origins_location_idx
  on public.product_origins(country, state_region);

create index product_sources_origin_id_idx
  on public.product_sources(product_origin_id);


-- Security

alter table public.product_identifiers enable row level security;
alter table public.product_origins enable row level security;

revoke all on table public.product_identifiers from anon;
revoke all on table public.product_identifiers from authenticated;

revoke all on table public.product_origins from anon;
revoke all on table public.product_origins from authenticated;
