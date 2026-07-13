// reads the most recent unique teas for the home shelf history feed
import { supabase } from './supabase';

export interface RecentBrew {
  id: string;
  teaName: string;
  createdAt: string;
}

// the home shelf shows 3 rows of 4 slots, newest brew first
export const HOME_SHELF_SLOT_COUNT = 12;

// the shape returned by the recent_unique_brews postgres function
interface RecentUniqueBrewRow {
  id: string;
  tea_name: string;
  last_brewed_at: string;
}

// the dedupe happens in postgres via a distinct on reduction, so a tea
// brewed several times only ever occupies one slot and re brewing it
// simply bumps it back to slot 0 with a fresh timestamp
export async function fetchRecentBrews(_userId: string): Promise<RecentBrew[]> {
  const { data, error } = await supabase.rpc('recent_unique_brews', {
    p_limit: HOME_SHELF_SLOT_COUNT,
  });

  if (error) {
    throw new Error(`failed to load recent brews: ${error.message}`);
  }

  return ((data ?? []) as RecentUniqueBrewRow[]).map((row) => ({
    id: row.id,
    teaName: row.tea_name ?? '',
    createdAt: row.last_brewed_at,
  }));
}
