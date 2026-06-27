// pure vector math and data access for the tea mood matching engine
// no ai or ml libraries are used here, just plain arithmetic
import { supabase } from './supabase';
import { MOOD_VECTOR_LENGTH, Tea, TeaRow } from './types';

// supabase table name for the seeded tea dataset, rename here if your table differs
const TEA_TABLE = 'tea-database';

// supabase table name for the user's pantry join table
const PANTRY_TABLE = 'user_pantry';

// turns the mood_vector column into a real number array, throws if the
// value is not a valid vector
//
// mood_vector is a jsonb column in postgres, so postgrest and supabase js
// already decode it into a real js array of numbers before this function
// ever sees it, there is no string to parse in the normal case. the
// typeof check below only exists as a defensive fallback in case the
// column type ever changes back to text, it does not run for jsonb
export function parseMoodVector(raw: unknown): number[] {
  let parsed: unknown = raw;

  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error(`mood_vector is not valid json: ${raw}`);
    }
  }

  if (!Array.isArray(parsed) || parsed.length !== MOOD_VECTOR_LENGTH) {
    throw new Error(
      `mood_vector must be an array of length ${MOOD_VECTOR_LENGTH}: ${JSON.stringify(raw)}`,
    );
  }

  // jsonb numbers decode straight into js numbers, this just confirms
  // every element really is numeric and not a string or null that slipped
  // into the array
  if (!parsed.every((value) => typeof value === 'number' && Number.isFinite(value))) {
    throw new Error(`mood_vector contains a non numeric value: ${JSON.stringify(raw)}`);
  }

  return parsed as number[];
}

// converts a raw supabase row into a fully typed Tea, parsing mood_vector along the way
export function parseTeaRow(row: TeaRow): Tea {
  return {
    ...row,
    mood_vector: parseMoodVector(row.mood_vector),
  };
}

// fetches the tea database from supabase and parses every mood_vector
// this replaces reading the seed csv directly, the csv was only used to seed the table
export async function fetchTeaDatabase(): Promise<Tea[]> {
  const { data, error } = await supabase
    .from(TEA_TABLE)
    .select(
      'Name, Category, Traditional_Origin, Caffeine_Level, Primary_Compounds, Raw_Flavor_Notes, Traditional_Brew_Specs, mood_vector',
    );

  if (error) {
    throw new Error(`failed to fetch tea database: ${error.message}`);
  }

  return (data as TeaRow[]).map(parseTeaRow);
}

// cosine similarity between two vectors of equal length
// returns a value from -1 to 1, where 1 means the vectors point in the exact same direction
export function calculateCosineSimilarity(vectorA: number[], vectorB: number[]): number {
  if (vectorA.length !== vectorB.length) {
    throw new Error(
      `vectors must be the same length, got ${vectorA.length} and ${vectorB.length}`,
    );
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
    magnitudeA += vectorA[i] * vectorA[i];
    magnitudeB += vectorB[i] * vectorB[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  // a zero vector has no direction, treat it as having no similarity to anything
  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

// scores the user input vector against every tea in the database and
// returns the single tea with the highest cosine similarity
export function findBestTeaMatch(userInputVector: number[], teaDatabase: Tea[]): Tea {
  if (teaDatabase.length === 0) {
    throw new Error('tea database is empty, cannot find a match');
  }

  let bestTea = teaDatabase[0];
  let bestScore = calculateCosineSimilarity(userInputVector, bestTea.mood_vector);

  for (let i = 1; i < teaDatabase.length; i++) {
    const tea = teaDatabase[i];
    const score = calculateCosineSimilarity(userInputVector, tea.mood_vector);
    if (score > bestScore) {
      bestScore = score;
      bestTea = tea;
    }
  }

  return bestTea;
}

// the shape supabase returns when embedding the tea row through the
// user_pantry foreign key, the joined tea comes back as a nested object
interface PantryRow {
  tea: TeaRow | null;
}

// fetches the teas a user currently has marked in stock in their pantry
// returns an empty array if the pantry is empty, never throws for that case
export async function fetchUserPantryTeas(userId: string): Promise<Tea[]> {
  const { data, error } = await supabase
    .from(PANTRY_TABLE)
    .select(
      'tea:tea-database(Name, Category, Traditional_Origin, Caffeine_Level, Primary_Compounds, Raw_Flavor_Notes, Traditional_Brew_Specs, mood_vector)',
    )
    .eq('user_id', userId)
    .eq('in_stock', true);

  if (error) {
    throw new Error(`failed to fetch user pantry: ${error.message}`);
  }

  return (data as unknown as PantryRow[])
    .filter((row) => row.tea !== null)
    .map((row) => parseTeaRow(row.tea as TeaRow));
}

export interface PantryMatchResult {
  tea: Tea;
  // true when the pantry was empty and we matched against the full database instead
  usedFallback: boolean;
}

// picks a random tea from the pool, excluding the tea currently on screen
// where possible, used by the shuffle button on the match card
function pickRandomTea(teaDatabase: Tea[], excludeName: string): Tea {
  const candidates = teaDatabase.filter((tea) => tea.Name !== excludeName);
  const pool = candidates.length > 0 ? candidates : teaDatabase;
  return pool[Math.floor(Math.random() * pool.length)];
}

// the full matching pipeline used by the mood input screen, restricts the
// similarity search to the teas the user actually has in stock, and only
// falls back to the entire tea database when their pantry is empty
export async function findBestTeaMatchFromPantry(
  userInputVector: number[],
  userId: string,
): Promise<PantryMatchResult> {
  const pantryTeas = await fetchUserPantryTeas(userId);

  if (pantryTeas.length > 0) {
    return { tea: findBestTeaMatch(userInputVector, pantryTeas), usedFallback: false };
  }

  const fullDatabase = await fetchTeaDatabase();
  return { tea: findBestTeaMatch(userInputVector, fullDatabase), usedFallback: true };
}

// swaps the current match for a random different tea from the same pool,
// used by the shuffle button on the match card screen rather than the mood
// vector match used by find my tea
export async function shuffleTeaMatchFromPantry(
  userId: string,
  excludeTeaName: string,
): Promise<PantryMatchResult> {
  const pantryTeas = await fetchUserPantryTeas(userId);

  if (pantryTeas.length > 0) {
    return { tea: pickRandomTea(pantryTeas, excludeTeaName), usedFallback: false };
  }

  const fullDatabase = await fetchTeaDatabase();
  return { tea: pickRandomTea(fullDatabase, excludeTeaName), usedFallback: true };
}
