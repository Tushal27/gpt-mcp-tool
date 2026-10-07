-- Infosys SP Tracker — Supabase schema
-- Run this once in your Supabase project: SQL Editor → New query → paste → Run.
--
-- Design: one row per user holding the whole tracker state as JSONB.
-- Rationale: the state is a single document edited by a single person, so a
-- document store needs no migrations as the plan evolves, and a last-write-wins
-- update is correct. Row Level Security means a leaked publishable key still
-- cannot read anyone's row but their own.

create table if not exists public.progress (
  user_id    uuid        primary key references auth.users (id) on delete cascade,
  state      jsonb       not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.progress enable row level security;

-- Policies are dropped first so this file is safe to re-run.
drop policy if exists "progress_select_own" on public.progress;
drop policy if exists "progress_insert_own" on public.progress;
drop policy if exists "progress_update_own" on public.progress;
drop policy if exists "progress_delete_own" on public.progress;

create policy "progress_select_own"
  on public.progress for select
  using (auth.uid() = user_id);

create policy "progress_insert_own"
  on public.progress for insert
  with check (auth.uid() = user_id);

create policy "progress_update_own"
  on public.progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "progress_delete_own"
  on public.progress for delete
  using (auth.uid() = user_id);

-- Keep updated_at honest even if a client forgets to set it. The tracker uses
-- this column to detect "the other device saved something newer than what I
-- loaded" and warn instead of silently clobbering.
create or replace function public.progress_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists progress_touch_updated_at on public.progress;
create trigger progress_touch_updated_at
  before insert or update on public.progress
  for each row execute function public.progress_touch_updated_at();
