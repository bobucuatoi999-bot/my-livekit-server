-- Hosting1s payment schema (Supabase / Postgres)
-- Run in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.billing_plans (
  id text primary key,
  name text not null,
  price_vnd integer not null check (price_vnd > 0),
  description text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.payment_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id text not null references public.billing_plans(id),
  amount_vnd integer not null check (amount_vnd > 0),
  bank_name text not null default 'Cake',
  bank_account text not null default '0912863155',
  transfer_content text not null,
  contact_phone text not null,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'rejected', 'expired')),
  admin_note text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_payment_requests_updated_at on public.payment_requests;
create trigger trg_payment_requests_updated_at
before update on public.payment_requests
for each row
execute function public.set_updated_at();

create index if not exists idx_payment_requests_user_id on public.payment_requests(user_id);
create index if not exists idx_payment_requests_status on public.payment_requests(status);
create index if not exists idx_payment_requests_created_at on public.payment_requests(created_at desc);

alter table public.billing_plans enable row level security;
alter table public.payment_requests enable row level security;

drop policy if exists "billing_plans_select_all" on public.billing_plans;
create policy "billing_plans_select_all"
on public.billing_plans
for select
to authenticated
using (true);

drop policy if exists "payment_requests_select_own" on public.payment_requests;
create policy "payment_requests_select_own"
on public.payment_requests
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "payment_requests_insert_own" on public.payment_requests;
create policy "payment_requests_insert_own"
on public.payment_requests
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "payment_requests_update_none_for_client" on public.payment_requests;
create policy "payment_requests_update_none_for_client"
on public.payment_requests
for update
to authenticated
using (false)
with check (false);

insert into public.billing_plans (id, name, price_vnd, description)
values
  ('starter', 'Gói Sơ Cấp', 45000, '1GB RAM · 20GB Storage'),
  ('business', 'Gói Chuyên Nghiệp', 100000, '4GB RAM · 50GB Storage'),
  ('enterprise', 'Gói Ultra', 250000, '8GB RAM · 100GB Storage')
on conflict (id) do update
set
  name = excluded.name,
  price_vnd = excluded.price_vnd,
  description = excluded.description,
  is_active = true;
