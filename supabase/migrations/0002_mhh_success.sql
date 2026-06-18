-- ===========================================================
-- KIJUN 0002 — Mental Hand History + Journal des succès
-- ===========================================================

create table if not exists public.mhh (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null default current_date,
  pattern text,
  probleme text,
  pourquoi text,
  errone text,
  correction text,
  logique text,
  created_at timestamptz default now()
);

create table if not exists public.success_journal (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null default current_date,
  palier text,
  reponses text[] default '{}',
  created_at timestamptz default now()
);

alter table public.mhh             enable row level security;
alter table public.success_journal enable row level security;

do $$
declare t text;
begin
  foreach t in array array['mhh','success_journal']
  loop
    execute format('drop policy if exists "own_select" on public.%I;', t);
    execute format('drop policy if exists "own_modify" on public.%I;', t);
    execute format($f$create policy "own_select" on public.%I for select using (auth.uid() = user_id);$f$, t);
    execute format($f$create policy "own_modify" on public.%I for all using (auth.uid() = user_id) with check (auth.uid() = user_id);$f$, t);
  end loop;
end $$;
