-- tracks calls to ai backed edge functions (currently just tea-story) so
-- the function itself can enforce a per user daily cap and avoid runaway
-- anthropic spend from a single compromised or scripted client
--
-- run this in the supabase sql editor

create table if not exists public.ai_call_log (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  function_name text not null,
  created_at timestamptz not null default now()
);

-- the rate limit check scans "this user, this function, last 24 hours"
create index if not exists ai_call_log_user_function_created_idx
  on public.ai_call_log (user_id, function_name, created_at);

-- row level security is enabled with no policies for anon or authenticated,
-- so ordinary clients cannot read or write this table at all. only the
-- edge function, using the service role key, can touch it, which is the
-- point: the rate limit must not be something a client can see or clear
alter table public.ai_call_log enable row level security;
