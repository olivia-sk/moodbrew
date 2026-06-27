-- adds shelf placement tracking to the existing user_pantry table
-- run this in the supabase sql editor after create_user_pantry.sql

alter table public.user_pantry
  add column if not exists slot_number integer;

-- a given shelf slot can only hold one tea per user at a time, this is a
-- partial index so rows with no slot assigned yet do not collide on null
create unique index if not exists user_pantry_user_id_slot_number_idx
  on public.user_pantry (user_id, slot_number)
  where slot_number is not null;
