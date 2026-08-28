alter table public.users enable row level security;

revoke all on table public.users from anon;
revoke all on table public.users from authenticated;