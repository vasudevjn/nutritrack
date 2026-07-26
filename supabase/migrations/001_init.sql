-- NutriTrack initial schema + RLS

create extension if not exists "pgcrypto";

-- Profiles (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  sex text check (sex in ('male', 'female', 'other')),
  height_cm numeric,
  birthdate date,
  activity_level numeric,
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.goals (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  calorie_target int not null default 2000,
  protein_g int not null default 150,
  carbs_g int not null default 200,
  fat_g int not null default 65,
  water_ml numeric not null default 2500,
  weight_target_kg numeric,
  updated_at timestamptz not null default now()
);

create table if not exists public.meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  raw_input text,
  logged_on date not null default (timezone('utc', now()))::date,
  logged_at timestamptz not null default now(),
  calories int not null default 0,
  protein_g numeric not null default 0,
  carbs_g numeric not null default 0,
  fat_g numeric not null default 0
);

create table if not exists public.meal_items (
  id uuid primary key default gen_random_uuid(),
  meal_id uuid not null references public.meals (id) on delete cascade,
  name text not null,
  quantity numeric not null default 1,
  unit text not null default 'serving',
  calories int not null default 0,
  protein_g numeric not null default 0,
  carbs_g numeric not null default 0,
  fat_g numeric not null default 0
);

create table if not exists public.water_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  logged_on date not null default (timezone('utc', now()))::date,
  amount_ml int not null default 250,
  created_at timestamptz not null default now()
);

create table if not exists public.weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  logged_on date not null default (timezone('utc', now()))::date,
  weight_kg numeric not null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists meals_user_date_idx on public.meals (user_id, logged_on);
create index if not exists water_user_date_idx on public.water_logs (user_id, logged_on);
create index if not exists weight_user_date_idx on public.weight_logs (user_id, logged_on desc);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.goals enable row level security;
alter table public.meals enable row level security;
alter table public.meal_items enable row level security;
alter table public.water_logs enable row level security;
alter table public.weight_logs enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

create policy "goals_all_own" on public.goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "meals_all_own" on public.meals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "meal_items_all_own" on public.meal_items
  for all using (
    exists (
      select 1 from public.meals m
      where m.id = meal_id and m.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.meals m
      where m.id = meal_id and m.user_id = auth.uid()
    )
  );

create policy "water_all_own" on public.water_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "weight_all_own" on public.weight_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
