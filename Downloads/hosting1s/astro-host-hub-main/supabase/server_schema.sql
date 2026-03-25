-- Hosting1s server data schema (Supabase / Postgres)
-- Run in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.servers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  ip_address inet not null,
  tailscale_url text,
  status text not null default 'offline'
    check (status in ('online', 'offline', 'starting', 'stopping', 'restarting')),
  os_name text not null default 'Ubuntu 24.04',
  ram_mb integer not null default 1024 check (ram_mb > 0),
  cpu_cores numeric(4,2) not null default 1 check (cpu_cores > 0),
  disk_gb integer not null default 20 check (disk_gb > 0),
  plan_id text references public.billing_plans(id),
  location text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.servers
add column if not exists tailscale_url text;

create or replace function public.set_servers_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_servers_updated_at on public.servers;
create trigger trg_servers_updated_at
before update on public.servers
for each row
execute function public.set_servers_updated_at();

create index if not exists idx_servers_owner_id on public.servers(owner_id);
create index if not exists idx_servers_status on public.servers(status);
create unique index if not exists uq_servers_owner_ip on public.servers(owner_id, ip_address);

alter table public.servers enable row level security;

drop policy if exists "servers_select_own" on public.servers;
create policy "servers_select_own"
on public.servers
for select
to authenticated
using (auth.uid() = owner_id);

drop policy if exists "servers_insert_none_client" on public.servers;
create policy "servers_insert_none_client"
on public.servers
for insert
to authenticated
with check (false);

drop policy if exists "servers_update_none_client" on public.servers;
create policy "servers_update_none_client"
on public.servers
for update
to authenticated
using (false)
with check (false);

drop policy if exists "servers_delete_none_client" on public.servers;
create policy "servers_delete_none_client"
on public.servers
for delete
to authenticated
using (false);

-- Optional sample rows for manual testing.
-- Replace OWNER_UUID_1 with real auth.users.id before running these inserts.
-- insert into public.servers (owner_id, name, ip_address, status, os_name, ram_mb, cpu_cores, disk_gb, plan_id, location)
-- values
--   ('OWNER_UUID_1', 'VPS Ubuntu 24.04', '103.80.150.32', 'https://login.tailscale.com/admin/machines', 'online', 'Ubuntu 24.04', 4096, 2, 80, 'business', 'VN-HCM'),
--   ('OWNER_UUID_1', 'Minecraft Server', '103.80.150.45', 'https://login.tailscale.com/admin/machines', 'online', 'Ubuntu 24.04', 8192, 4, 100, 'enterprise', 'VN-HCM'),
--   ('OWNER_UUID_1', 'Database Replica', '103.80.150.67', 'https://login.tailscale.com/admin/machines', 'offline', 'Ubuntu 24.04', 2048, 1, 40, 'starter', 'VN-HN');
