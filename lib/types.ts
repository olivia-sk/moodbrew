// shared data types for the tea database

// number of dimensions in every mood vector, tea and user input vectors must match this
export const MOOD_VECTOR_LENGTH = 6;

// a tea record after mood_vector has been parsed into real numbers
export interface Tea {
  Name: string;
  Category: string;
  Traditional_Origin: string;
  Caffeine_Level: number;
  Primary_Compounds: string;
  Raw_Flavor_Notes: string;
  Traditional_Brew_Specs: string;
  mood_vector: number[];
}

// the raw shape returned by the supabase query, mood_vector has not been
// parsed into number[] yet. depending on the column type in postgres
// (text versus jsonb versus a native array or vector type) supabase can
// hand this back as a stringified array or as an already decoded array,
// so the type stays unknown until parseMoodVector normalizes it
export interface TeaRow {
  Name: string;
  Category: string;
  Traditional_Origin: string;
  Caffeine_Level: number;
  Primary_Compounds: string;
  Raw_Flavor_Notes: string;
  Traditional_Brew_Specs: string;
  mood_vector: unknown;
}

// the user's input from the mood input screen, carried forward so later
// screens can reference what the drinker actually asked for
export interface MoodContext {
  moodLabel: string | null;
  craving: number;
}
