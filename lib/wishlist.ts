// data access for the future brews wishlist shelf
import { supabase } from './supabase';
import { PANTRY_SLOT_COUNT, PantrySlots } from './pantrySlots';

const WISHLIST_TABLE = 'wishlist';

export interface WishlistItem {
  id: string;
  teaName: string;
  createdAt: string;
}

interface WishlistRow {
  id: string;
  tea_name: string;
  created_at: string;
}

// fetches every wishlist tea for the user, newest first
export async function fetchWishlist(userId: string): Promise<WishlistItem[]> {
  const { data, error } = await supabase
    .from(WISHLIST_TABLE)
    .select('id, tea_name, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`failed to load wishlist: ${error.message}`);
  }

  return ((data ?? []) as WishlistRow[]).map((row) => ({
    id: row.id,
    teaName: row.tea_name,
    createdAt: row.created_at,
  }));
}

// saves a liked discovery tea onto the wishlist shelf. the upsert makes a
// repeat right swipe on the same tea a no op instead of an error
export async function addToWishlist(userId: string, teaName: string): Promise<void> {
  const { error } = await supabase
    .from(WISHLIST_TABLE)
    .upsert(
      { user_id: userId, tea_name: teaName },
      { onConflict: 'user_id,tea_name', ignoreDuplicates: true },
    );

  if (error) {
    throw new Error(`failed to add to wishlist: ${error.message}`);
  }
}

export async function removeFromWishlist(userId: string, wishlistId: string): Promise<void> {
  const { error } = await supabase
    .from(WISHLIST_TABLE)
    .delete()
    .eq('user_id', userId)
    .eq('id', wishlistId);

  if (error) {
    throw new Error(`failed to remove from wishlist: ${error.message}`);
  }
}

// finds the lowest empty slot index on the pantry cabinet, or null when
// every slot is taken
export function firstAvailableSlot(slots: PantrySlots): number | null {
  for (let index = 0; index < PANTRY_SLOT_COUNT; index++) {
    if (!slots[index]) return index;
  }
  return null;
}

// promotes a wishlist tea into a physical pantry slot: the tea lands in
// the given cabinet slot marked in stock, then leaves the wishlist
export async function moveWishlistTeaToPantry(
  userId: string,
  item: WishlistItem,
  slotNumber: number,
): Promise<void> {
  const { error: pantryError } = await supabase
    .from('user_pantry')
    .upsert(
      {
        user_id: userId,
        tea_name: item.teaName,
        slot_number: slotNumber,
        in_stock: true,
      },
      { onConflict: 'user_id,tea_name' },
    );

  if (pantryError) {
    throw new Error(`failed to move tea into the pantry: ${pantryError.message}`);
  }

  await removeFromWishlist(userId, item.id);
}
