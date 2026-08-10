-- lets a signed in user delete their own tasting log entries. no delete
-- policy existed before this, so client-side deletes were silently
-- blocked by rls.
--
-- run this in the supabase sql editor

create policy "users can delete their own tasting logs"
  on public.tasting_logs for delete
  using (auth.uid() = user_id);
