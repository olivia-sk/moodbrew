// candidate feed for discovery mode. discovery deliberately bypasses the
// pantry inventory constraint the mood match flow enforces: instead of
// restricting the pool to teas in stock, it pulls the full engine catalog
// and surfaces teas the drinker does not already own or want
import { fetchTeaDatabase, fetchUserPantryTeas } from './teaMatching';
import { fetchWishlist } from './wishlist';
import { Tea } from './types';

// fisher yates shuffle so the deck order changes every visit
function shuffle<T>(items: T[]): T[] {
  const deck = [...items];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

// builds the swipe deck: every unique tea variation from the engine,
// minus teas already sitting in the pantry or on the wishlist
export async function fetchDiscoveryDeck(userId: string): Promise<Tea[]> {
  const [catalog, pantryTeas, wishlist] = await Promise.all([
    fetchTeaDatabase(),
    fetchUserPantryTeas(userId),
    fetchWishlist(userId),
  ]);

  const excluded = new Set<string>([
    ...pantryTeas.map((tea) => tea.Name),
    ...wishlist.map((item) => item.teaName),
  ]);

  const seen = new Set<string>();
  const candidates = catalog.filter((tea) => {
    if (excluded.has(tea.Name) || seen.has(tea.Name)) return false;
    seen.add(tea.Name);
    return true;
  });

  return shuffle(candidates);
}
