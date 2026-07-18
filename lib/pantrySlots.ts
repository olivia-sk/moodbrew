// data access for the my pantry shelf, maps physical shelf slots to teas
import { supabase } from './supabase';
import { fetchTeaDatabase, parseTeaRow } from './teaMatching';
import { Tea, TeaRow } from './types';

const PANTRY_TABLE = 'user_pantry';

// total number of physical slots on the pantry shelf, 4 rows of 4
export const PANTRY_SLOT_COUNT = 16;

// a slot index maps to either an empty slot or the tea sitting in it
export type PantrySlots = Record<number, Tea>;

// the shape supabase returns when embedding the tea row through the
// user_pantry foreign key on tea_name
interface PantrySlotRow {
  slot_number: number | null;
  tea: TeaRow | null;
}

// fetches every slot the current user has filled, keyed by slot_number
export async function fetchPantrySlots(userId: string): Promise<PantrySlots> {
  const { data, error } = await supabase
    .from(PANTRY_TABLE)
    .select(
      'slot_number, tea:tea-database(Name, Category, Traditional_Origin, Caffeine_Level, Primary_Compounds, Raw_Flavor_Notes, Traditional_Brew_Specs, mood_vector, is_custom)',
    )
    .eq('user_id', userId)
    .eq('in_stock', true)
    .not('slot_number', 'is', null);

  if (error) {
    throw new Error(`failed to fetch pantry slots: ${error.message}`);
  }

  const slots: PantrySlots = {};
  for (const row of data as unknown as PantrySlotRow[]) {
    if (row.slot_number !== null && row.tea !== null) {
      slots[row.slot_number] = parseTeaRow(row.tea);
    }
  }
  return slots;
}

// returns the full master tea list used to populate the picker sheet
export async function fetchPickerTeaOptions(): Promise<Tea[]> {
  return fetchTeaDatabase();
}

// saves which slot a tea sits in, upserts so moving a tea to a new slot
// just overwrites its previous row instead of creating a duplicate
export async function assignTeaToSlot(
  userId: string,
  teaName: string,
  slotNumber: number,
): Promise<void> {
  // whichever tea currently sits in this slot is being swapped out, delete
  // its row outright instead of just clearing slot_number, otherwise it
  // would keep counting as an active pantry tea in the similarity engine
  // even though it no longer has a place on the shelf
  const { error: vacateError } = await supabase
    .from(PANTRY_TABLE)
    .delete()
    .eq('user_id', userId)
    .eq('slot_number', slotNumber)
    .neq('tea_name', teaName);

  if (vacateError) {
    throw new Error(`failed to clear the previous tea in that slot: ${vacateError.message}`);
  }

  const { error } = await supabase
    .from(PANTRY_TABLE)
    .upsert(
      {
        user_id: userId,
        tea_name: teaName,
        slot_number: slotNumber,
        in_stock: true,
      },
      { onConflict: 'user_id,tea_name' },
    );

  if (error) {
    throw new Error(`failed to save pantry slot: ${error.message}`);
  }
}

// deletes the pantry row sitting in this slot outright, this is the part
// that keeps the similarity engine honest, a row that only had its slot
// number cleared would still have in_stock set to true and would keep
// getting pulled into the matching pool even though it is no longer on
// the shelf, deleting the row removes it from that pool completely
export async function removeTeaFromSlot(userId: string, slotNumber: number): Promise<void> {
  const { error } = await supabase
    .from(PANTRY_TABLE)
    .delete()
    .eq('user_id', userId)
    .eq('slot_number', slotNumber);

  if (error) {
    throw new Error(`failed to remove tea from slot: ${error.message}`);
  }
}
