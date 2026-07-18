-- adds user-created custom teas to the shared "tea-database" catalog.
--
-- custom teas live in the same table as the seeded catalog so the
-- user_pantry / wishlist / tasting_logs foreign keys on "Name" keep
-- working unchanged. catalog rows have created_by null; custom rows
-- carry the creating user's id and are only visible to that user.
--
-- inserts happen exclusively through the tea-enrich edge function
-- (service role, bypasses rls), so no client-facing insert policy is
-- added here on purpose.
--
-- run this in the supabase sql editor

alter table public."tea-database"
  add column if not exists created_by uuid references auth.users (id) on delete cascade,
  add column if not exists is_custom boolean not null default false;

-- replaces the old "read everything" policy: everyone still sees the
-- shared catalog (created_by null), but a custom tea is private to the
-- user who added it
drop policy if exists "Enable read access for all users" on public."tea-database";

create policy "catalog teas are public, custom teas are private"
  on public."tea-database" for select
  using (created_by is null or created_by = auth.uid());

-- a signed in user may delete only their own custom teas (removing a
-- mistyped entry); user_pantry rows cascade via the existing fk
create policy "users can delete their own custom teas"
  on public."tea-database" for delete
  using (created_by = auth.uid() and is_custom);

-- speeds up the per-user visibility filter above
create index if not exists tea_database_created_by_idx
  on public."tea-database" (created_by)
  where created_by is not null;
