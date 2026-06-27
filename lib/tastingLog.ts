// writes a finished tasting session to the tasting_logs table
import { supabase } from './supabase';

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
