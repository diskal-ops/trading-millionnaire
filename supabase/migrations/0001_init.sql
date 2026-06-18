-- ===========================================================
-- KIJUN — schéma initial
-- Mémoire longue. RLS activé : chaque user ne voit que ses données.
-- ===========================================================

-- ---------- profiles ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  lang text default 'fr',
  balance_start numeric default 711,
  previous_high numeric default 820,
  created_at timestamptz default now()
);

-- ---------- daily_log (cœur, partagé par tous les modules) ----------
create table if not exists public.daily_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  sommeil_h numeric,
  sport_fait boolean,
  nutrition_ok boolean,
  trading_resultat numeric,
  etat_mental text,
  patterns_detectes text[] default '{}',
  created_at timestamptz default now(),
  unique (user_id, date)
);

-- ---------- sessions (trading) ----------
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null default current_date,
  state_final text,
  transcript text,
  patterns text[] default '{}',
  coach text[] default '{}',
  resultat numeric,
  created_at timestamptz default now()
);

-- ---------- milestones (escalier) ----------
create table if not exists public.milestones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  marche int not null,
  label text not null,
  retrait numeric,
  atteint_at timestamptz,
  created_at timestamptz default now()
);

-- ---------- insights (snapshots du moteur de corrélations) ----------
create table if not exists public.insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  module_id text,
  severity text,
  titre text,
  detail text,
  created_at timestamptz default now()
);

-- ===========================================================
-- RLS
-- ===========================================================
alter table public.profiles   enable row level security;
alter table public.daily_log  enable row level security;
alter table public.sessions   enable row level security;
alter table public.milestones enable row level security;
alter table public.insights   enable row level security;

-- Politique générique "owner only" par table.
do $$
declare t text;
begin
  foreach t in array array['profiles','daily_log','sessions','milestones','insights']
  loop
    execute format('drop policy if exists "own_select" on public.%I;', t);
    execute format('drop policy if exists "own_modify" on public.%I;', t);

    if t = 'profiles' then
      execute format($f$create policy "own_select" on public.%I for select using (auth.uid() = id);$f$, t);
      execute format($f$create policy "own_modify" on public.%I for all using (auth.uid() = id) with check (auth.uid() = id);$f$, t);
    else
      execute format($f$create policy "own_select" on public.%I for select using (auth.uid() = user_id);$f$, t);
      execute format($f$create policy "own_modify" on public.%I for all using (auth.uid() = user_id) with check (auth.uid() = user_id);$f$, t);
    end if;
  end loop;
end $$;

-- Création auto du profil à l'inscription
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
