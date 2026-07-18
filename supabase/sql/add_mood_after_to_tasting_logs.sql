-- adds the "mood after tea" check-in to tasting sessions. stores the
-- human readable emotion labels the drinker picked on the pairings screen
-- after finishing their cup, closing the loop on how the session landed
--
-- run this in the supabase sql editor

alter table public.tasting_logs
  add column if not exists mood_after text[] not null default '{}';
