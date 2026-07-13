// reads and writes tasting sessions in the tasting_logs table
import { supabase } from './supabase';

// a saved tasting session as shown on the journal archive screen
export interface JournalEntry {
  id: string;
  teaName: string;
  // 0 is bitter, 1 is sweet
  bitterSweet: number;
  // 0 is earthy, 1 is floral
  earthyFloral: number;
  moodTags: string[];
  notes: string;
  createdAt: string;
}

interface TastingLogRow {
  id: string;
  tea_name: string | null;
  bitter_sweet_value: number | null;
  earthy_floral_value: number | null;
  selected_tags: string[] | null;
  notes: string | null;
  created_at: string;
}

// fetches every tasting session for the user, newest first
export async function fetchJournalEntries(userId: string): Promise<JournalEntry[]> {
  const { data, error } = await supabase
    .from('tasting_logs')
    .select('id, tea_name, bitter_sweet_value, earthy_floral_value, selected_tags, notes, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`failed to load journal entries: ${error.message}`);
  }

  return ((data ?? []) as TastingLogRow[]).map((row) => ({
    id: row.id,
    teaName: row.tea_name ?? '',
    bitterSweet: row.bitter_sweet_value ?? 0.5,
    earthyFloral: row.earthy_floral_value ?? 0.5,
    moodTags: row.selected_tags ?? [],
    notes: row.notes ?? '',
    createdAt: row.created_at,
  }));
}

export interface TastingLogPayload {
  userId: string;
  teaName: string;
  // 0 is bitter, 1 is sweet
  bitterSweet: number;
  // 0 is earthy, 1 is floral
  earthyFloral: number;
  flavors: string[];
  notes: string;
}

export async function logTastingSession(payload: TastingLogPayload): Promise<void> {
  // column names here match the actual public.tasting_logs schema exactly,
  // id is left out since postgres generates it
  const { error } = await supabase.from('tasting_logs').insert({
    user_id: payload.userId,
    tea_name: payload.teaName,
    bitter_sweet_value: payload.bitterSweet,
    earthy_floral_value: payload.earthyFloral,
    selected_tags: payload.flavors,
    notes: payload.notes,
  });

  if (error) {
    throw new Error(`failed to log tasting session: ${error.message}`);
  }
}
