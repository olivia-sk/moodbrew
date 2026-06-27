-- creates the user_pantry table, a many to many join between auth.users
-- and the tea database, tracking whether each tea is currently in stock
--
-- the tea database table is named "tea-database" (quoted because of the
-- hyphen) and has no surrogate id column, so this keys the relationship
-- off "Name" instead, which is unique in the seed dataset
--
-- run this in the supabase sql editor

-- a foreign key needs something unique to point at, "Name" has no
-- constraint on it yet so we add a unique index, safe to rerun
create unique index if not exists tea_database_name_idx
  on public."tea-database" ("Name");

create table if not exists public.user_pantry (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  tea_name text not null references public."tea-database" ("Name") on delete cascade,
  in_stock boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- a user can only have one pantry row per tea
  unique (user_id, tea_name)
);

-- speeds up the "give me this user's in stock teas" query the matching
-- engine runs on every find my tea press
create index if not exists user_pantry_user_id_in_stock_idx
  on public.user_pantry (user_id, in_stock);

-- row level security, every user can only see and edit their own pantry rows
alter table public.user_pantry enable row level security;

create policy "users can view their own pantry"
  on public.user_pantry for select
  using (auth.uid() = user_id);

create policy "users can insert into their own pantry"
  on public.user_pantry for insert
  with check (auth.uid() = user_id);

create policy "users can update their own pantry"
  on public.user_pantry for update
  using (auth.uid() = user_id);

create policy "users can delete from their own pantry"
  on public.user_pantry for delete
  using (auth.uid() = user_id);

-- keeps updated_at current whenever in_stock or anything else changes
create or replace function public.set_user_pantry_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists user_pantry_set_updated_at on public.user_pantry;

create trigger user_pantry_set_updated_at
  before update on public.user_pantry
  for each row
  execute function public.set_user_pantry_updated_at();
