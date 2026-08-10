-- the journal is a historical record and should outlive catalogue rows.
-- tasting_logs.tea_name used to cascade-delete when a tea was removed from
-- "tea-database", which would silently erase journal entries the moment a
-- drinker deleted one of their custom teas. dropping the foreign key keeps
-- the tea name as plain text in the log forever.
--
-- user_pantry keeps its cascade on purpose: deleting a tea should clear it
-- off the shelf.
--
-- run this in the supabase sql editor

alter table public.tasting_logs
  drop constraint if exists tasting_logs_tea_name_fkey;
