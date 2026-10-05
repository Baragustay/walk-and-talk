-- Walk & Talk database. Paste into Supabase: SQL Editor -> New query -> Run.
-- Safe to run again: it only creates what's missing.
--
-- Every table has Row Level Security: a user can only see and change their own rows,
-- even though the app talks to the database directly with the public (anon) key.

-- ---------------------------------------------------------------------------
-- profiles: one row per user (settings, level, learning wishes, course progress)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id               uuid primary key references auth.users (id) on delete cascade,
  mother_tongue    text not null default 'en',
  target_language  text not null default 'sv' check (target_language in ('sv', 'es', 'ja')),
  level            text not null default 'unknown'
                   check (level in ('unknown', 'preA1', 'A1', 'A2', 'B1', 'B2', 'C1')),
  level_note       text not null default '',
  walk_minutes     int  not null default 20 check (walk_minutes in (10, 15, 20, 30)),
  show_romaji      boolean not null default true,
  learning_style   jsonb not null default '[]'::jsonb,   -- ["Speak slowly", ...]
  course_progress  jsonb not null default '{}'::jsonb,   -- {"es": 3, "ja": 0}
  onboarded        boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- walks: one row per call
-- ---------------------------------------------------------------------------
create table if not exists public.walks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  started_at  timestamptz not null,
  ended_at    timestamptz,
  minutes     int not null default 0,
  topic       text not null default 'free',
  had_photo   boolean not null default false
);
create index if not exists walks_user_idx on public.walks (user_id, started_at desc);

-- ---------------------------------------------------------------------------
-- words: saved words with their spaced-repetition schedule
-- ---------------------------------------------------------------------------
create table if not exists public.words (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null default auth.uid() references auth.users (id) on delete cascade,
  target_language    text not null check (target_language in ('sv', 'es', 'ja')),
  target             text not null,
  translation        text not null,
  example            text not null default '',
  reason             text not null default 'taught' check (reason in ('taught', 'asked', 'repeated_mistake')),
  kana               text,
  kanji              text,
  romaji             text,
  step               int not null default 0 check (step between 0 and 4),
  due_at             timestamptz not null,
  created_at         timestamptz not null default now(),
  last_reviewed_at   timestamptz,
  times_remembered   int not null default 0,
  times_missed       int not null default 0
);
create index if not exists words_due_idx on public.words (user_id, target_language, due_at);

-- ---------------------------------------------------------------------------
-- Row Level Security: own rows only
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.walks    enable row level security;
alter table public.words    enable row level security;

drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles
  for all to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "own walks" on public.walks;
create policy "own walks" on public.walks
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "own words" on public.words;
create policy "own words" on public.words
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Keep updated_at fresh
create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- "Delete my data": removes the account; profiles, walks and words go with it
-- (on delete cascade). Runs as the database owner, but only ever for the caller.
-- ---------------------------------------------------------------------------
create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path = '' as $$
begin
  delete from auth.users where id = auth.uid();
end $$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
