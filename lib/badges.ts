// derived profile badges. there is no badges table, every badge is
// computed live from data the app already records (tasting logs, pantry
// slots, wishlist saves and custom teas), so badges can never drift out
// of sync with what the drinker actually did
import { supabase } from './supabase';
import { PANTRY_SLOT_COUNT } from './pantrySlots';

export interface Badge {
  key: string;
  title: string;
  // shown under the title once the badge is earned
  description: string;
  // nudge shown while the badge is still locked
  hint: string;
  earned: boolean;
}

// the drinker's steep level, derived from the same activity counts as the
// badges so it can never drift out of sync with real usage
export interface SteepLevel {
  level: number;
  title: string;
  points: number;
  // undefined at the top level, there is nothing left to climb
  nextLevelPoints?: number;
  // 0..1 progress toward the next level, 1 at the top level
  progress: number;
}

export interface ProfileStats {
  brewCount: number;
  pantryCount: number;
  customTeaCount: number;
  wishlistCount: number;
  badges: Badge[];
  steepLevel: SteepLevel;
}

// points thresholds for each level, tea themed and intentionally gentle at
// the start so the first few brews already feel like movement
const LEVELS: { title: string; minPoints: number }[] = [
  { title: 'Seedling', minPoints: 0 },
  { title: 'Sprout', minPoints: 50 },
  { title: 'Steeper', minPoints: 120 },
  { title: 'Brewmaster', minPoints: 250 },
  { title: 'Tea Sage', minPoints: 450 },
];

function calculateSteepLevel(
  brewCount: number,
  customTeaCount: number,
  wishlistCount: number,
  earnedBadgeCount: number,
): SteepLevel {
  const points =
    brewCount * 10 + customTeaCount * 15 + wishlistCount * 2 + earnedBadgeCount * 25;

  let index = 0;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (points >= LEVELS[i].minPoints) {
      index = i;
      break;
    }
  }

  const next = LEVELS[index + 1];
  if (!next) {
    return { level: index + 1, title: LEVELS[index].title, points, progress: 1 };
  }

  const span = next.minPoints - LEVELS[index].minPoints;
  return {
    level: index + 1,
    title: LEVELS[index].title,
    points,
    nextLevelPoints: next.minPoints,
    progress: Math.min(1, (points - LEVELS[index].minPoints) / span),
  };
}

// counts rows without pulling them down, head + exact keeps this cheap
async function countRows(
  table: string,
  applyFilters: (query: any) => any,
): Promise<number> {
  const { count, error } = await applyFilters(
    supabase.from(table).select('*', { count: 'exact', head: true }),
  );
  if (error) {
    throw new Error(`failed to count ${table}: ${error.message}`);
  }
  return count ?? 0;
}

export async function fetchProfileStats(userId: string): Promise<ProfileStats> {
  const [brewCount, pantryCount, customTeaCount, wishlistCount] = await Promise.all([
    countRows('tasting_logs', (q) => q.eq('user_id', userId)),
    countRows('user_pantry', (q) =>
      q.eq('user_id', userId).eq('in_stock', true).not('slot_number', 'is', null),
    ),
    // rls already hides other users' custom teas, the explicit filter is
    // just belt and suspenders
    countRows('tea-database', (q) => q.eq('is_custom', true).eq('created_by', userId)),
    countRows('wishlist', (q) => q.eq('user_id', userId)),
  ]);

  const badges: Badge[] = [
    {
      key: 'first-steep',
      title: 'First Steep',
      description: 'Logged your very first brew',
      hint: 'Log your first brew to earn this',
      earned: brewCount >= 1,
    },
    {
      key: 'steady-steeper',
      title: 'Steady Steeper',
      description: 'Logged ten brews and counting',
      hint: `Log ${Math.max(0, 10 - brewCount)} more brews to earn this`,
      earned: brewCount >= 10,
    },
    {
      key: 'tea-connoisseur',
      title: 'Tea Connoisseur',
      description: 'Added a tea our database had never heard of',
      hint: 'Add a custom tea to your pantry to earn this',
      earned: customTeaCount >= 1,
    },
    {
      key: 'full-shelf',
      title: 'Full Shelf',
      description: 'Filled every slot in your pantry cabinet',
      hint: `Fill ${Math.max(0, PANTRY_SLOT_COUNT - pantryCount)} more slots to earn this`,
      earned: pantryCount >= PANTRY_SLOT_COUNT,
    },
    {
      key: 'curious-cup',
      title: 'Curious Cup',
      description: 'Shelved ten future brews from discovery mode',
      hint: `Swipe right on ${Math.max(0, 10 - wishlistCount)} more discovery teas to earn this`,
      earned: wishlistCount >= 10,
    },
  ];

  const earnedBadgeCount = badges.filter((badge) => badge.earned).length;
  const steepLevel = calculateSteepLevel(
    brewCount,
    customTeaCount,
    wishlistCount,
    earnedBadgeCount,
  );

  return { brewCount, pantryCount, customTeaCount, wishlistCount, badges, steepLevel };
}
