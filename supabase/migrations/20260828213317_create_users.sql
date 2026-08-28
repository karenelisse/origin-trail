create type public.access_level as enum (
  'owner',
  'full',
  'partial',
  'restricted',
  'unapproved'
);

create table public.users (
  id uuid primary key default gen_random_uuid(),
  supabase_user_id uuid not null unique,
  email text not null unique,
  access_level public.access_level not null default 'unapproved',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);