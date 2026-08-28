create type public.product_inactive_reason as enum (
  'duplicate',
  'merged',
  'acquired',
  'discontinued',
  'replaced',
  'invalid',
  'other'
);

alter table public.products
  add column inactive_at timestamptz,
  add column inactive_reason public.product_inactive_reason,
  add column inactive_notes text,
  add column merged_into_product_id uuid
    references public.products(id)
    on delete set null;

create index products_active_idx
  on public.products (inactive_at)
  where inactive_at is null;

create index products_merged_into_product_id_idx
  on public.products (merged_into_product_id);

alter table public.products
  add constraint products_inactive_state_check
  check (
    (
      inactive_at is null
      and inactive_reason is null
      and inactive_notes is null
      and merged_into_product_id is null
    )
    or
    (
      inactive_at is not null
      and inactive_reason is not null
    )
  );

alter table public.products
  add constraint products_merge_target_check
  check (
    inactive_reason not in ('duplicate', 'merged')
    or merged_into_product_id is not null
  );

alter table public.products
  add constraint products_not_merged_into_self_check
  check (
    merged_into_product_id is null
    or merged_into_product_id <> id
  );
  