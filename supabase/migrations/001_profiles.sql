-- One profile per signed-in user. Run once in Supabase Dashboard → SQL Editor.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 2 and 80),
  level text not null check (level in ('Mid', 'Senior')),
  linkedin text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Each user can only see and change their own row.
create policy "own profile: read" on public.profiles
  for select using (auth.uid() = id);
create policy "own profile: insert" on public.profiles
  for insert with check (auth.uid() = id);
create policy "own profile: update" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);
