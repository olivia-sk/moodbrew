// reads the most recent tasting sessions for the home shelf history feed
import { supabase } from './supabase';

export interface RecentBrew {
  id: string;
  teaName: string;
  createdAt: string;
}

// the home shelf shows 3 rows of 4 slots, newest brew first
export const HOME_SHELF_SLOT_COUNT = 12;

export async function fetchRecentBrews(userId: string): Promise<RecentBrew[]> {
  const { data, error } = await supabase
    .from('tasting_logs')
    .select('id, tea_name, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(HOME_SHELF_SLOT_COUNT);

  if (error) {
    throw new Error(`failed to load recent brews: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    teaName: (row.tea_name as string) ?? '',
    createdAt: row.created_at as string,
  }));
}
