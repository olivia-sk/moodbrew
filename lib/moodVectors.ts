// maps the mood input screen onto the same 6 dimensional space used by the tea dataset
//
// the dataset does not document what each of the 6 numbers means, so these dimensions
// were inferred by comparing teas with strongly contrasting flavor notes, for example
// chamomile and vanilla rooibos (calming, sweet, caffeine free) sit at the opposite end
// from matcha and gyokuro (stimulating, umami, high caffeine), and lapsang souchong and
// shou puerh (smoky, earthy, heavy) sit opposite hibiscus and jasmine pearls
// (light, floral, bright). this gave a consistent reading across the dataset:
//
// index 0  calm        high for soothing caffeine free teas, low for stimulating teas
// index 1  comfort     high for sweet, warm, cozy flavor notes
// index 2  brightness  low is earthy/woody, high is bright/citrus/floral, this is the
//                       dimension the craving slider controls directly
// index 3  focus       high for alert, clear, umami or high caffeine teas
// index 4  intensity   high for spicy, cooling or otherwise stimulating sensory notes
// index 5  weight      high for heavy, smoky, dark or earthy bodied teas
//
// these are a reasonable starting point, not an exact science, tune the baseline
// vectors below against real user feedback once the app has usage data

import { MOOD_VECTOR_LENGTH } from './types';

export const BRIGHTNESS_DIMENSION_INDEX = 2;

// the light/rich craving slider writes straight into the weight dimension,
// same override pattern as the brightness slider above
export const WEIGHT_DIMENSION_INDEX = 5;

// ─── two tier emotion picker ────────────────────────────────────────────────
// tier one is valence (feeling good / in between / feeling rough), tier two
// is the specific emotion chips under each valence. the drinker can pick up
// to MAX_SELECTED_EMOTIONS chips across any valences and the query vector is
// simply the average of their baseline vectors, so the tea data and the
// cosine similarity engine never change

export type ValenceKey = 'good' | 'between' | 'rough';

export interface ValenceTabConfig {
  key: ValenceKey;
  label: string;
}

export const VALENCE_TABS: ValenceTabConfig[] = [
  { key: 'good', label: 'Feeling good' },
  { key: 'between', label: 'In between' },
  { key: 'rough', label: 'Feeling rough' },
];

export type EmotionKey =
  | 'content' | 'excited' | 'cozy' | 'inspired' | 'grateful'
  | 'calm' | 'tired' | 'distracted' | 'restless'
  | 'stressed' | 'anxious' | 'sad' | 'frustrated' | 'drained';

export interface EmotionConfig {
  key: EmotionKey;
  label: string;
  valence: ValenceKey;
  // the baseline tea profile that fits this emotion, note this describes the
  // tea the drinker needs, not the emotion itself, an anxious drinker gets a
  // calm-heavy vector because a calming tea is the match
  vector: number[];
}

export const MAX_SELECTED_EMOTIONS = 3;

export const EMOTIONS: EmotionConfig[] = [
  // feeling good: lean into the mood rather than correcting it
  { key: 'content', label: 'Content', valence: 'good', vector: [0.6, 0.7, 0.55, 0.3, 0.2, 0.25] },
  { key: 'excited', label: 'Excited', valence: 'good', vector: [0.3, 0.5, 0.8, 0.4, 0.6, 0.15] },
  { key: 'cozy', label: 'Cozy', valence: 'good', vector: [0.85, 0.85, 0.3, 0.15, 0.15, 0.35] },
  { key: 'inspired', label: 'Inspired', valence: 'good', vector: [0.3, 0.4, 0.65, 0.75, 0.45, 0.2] },
  { key: 'grateful', label: 'Grateful', valence: 'good', vector: [0.7, 0.75, 0.5, 0.25, 0.2, 0.3] },

  // in between: gentle nudges in one direction or another
  { key: 'calm', label: 'Calm', valence: 'between', vector: [0.8, 0.6, 0.4, 0.3, 0.15, 0.25] },
  { key: 'tired', label: 'Tired', valence: 'between', vector: [0.25, 0.55, 0.45, 0.65, 0.6, 0.35] },
  { key: 'distracted', label: 'Distracted', valence: 'between', vector: [0.15, 0.45, 0.35, 0.9, 0.3, 0.25] },
  { key: 'restless', label: 'Restless', valence: 'between', vector: [0.7, 0.5, 0.35, 0.3, 0.4, 0.35] },

  // feeling rough: teas that soothe, comfort or lift
  { key: 'stressed', label: 'Stressed', valence: 'rough', vector: [0.8, 0.5, 0.4, 0.15, 0.7, 0.2] },
  { key: 'anxious', label: 'Anxious', valence: 'rough', vector: [0.9, 0.6, 0.35, 0.1, 0.3, 0.25] },
  { key: 'sad', label: 'Sad', valence: 'rough', vector: [0.7, 0.85, 0.35, 0.15, 0.2, 0.3] },
  { key: 'frustrated', label: 'Frustrated', valence: 'rough', vector: [0.75, 0.55, 0.3, 0.2, 0.5, 0.3] },
  { key: 'drained', label: 'Drained', valence: 'rough', vector: [0.3, 0.6, 0.4, 0.55, 0.5, 0.35] },
];

export function emotionsForValence(valence: ValenceKey): EmotionConfig[] {
  return EMOTIONS.filter((emotion) => emotion.valence === valence);
}

// neutral fallback used if find my tea is pressed before picking any emotion
export const DEFAULT_MOOD_VECTOR = new Array(MOOD_VECTOR_LENGTH).fill(0.5);

// averages the baseline vectors of every selected emotion into one query
// vector, per inside out a mood is rarely a single feeling. falls back to
// the neutral vector when nothing is selected
export function blendEmotionVectors(keys: EmotionKey[]): number[] {
  const selected = EMOTIONS.filter((emotion) => keys.includes(emotion.key));
  if (selected.length === 0) return [...DEFAULT_MOOD_VECTOR];

  const blended = new Array(MOOD_VECTOR_LENGTH).fill(0);
  for (const emotion of selected) {
    for (let i = 0; i < MOOD_VECTOR_LENGTH; i++) {
      blended[i] += emotion.vector[i];
    }
  }
  return blended.map((sum) => sum / selected.length);
}

// human readable label for the whole selection, roughest feeling first so
// the tea story and ritual prompt tune their tone to what needs care most
const VALENCE_SEVERITY: Record<ValenceKey, number> = { rough: 0, between: 1, good: 2 };

export function moodLabelFor(keys: EmotionKey[]): string | null {
  const selected = EMOTIONS.filter((emotion) => keys.includes(emotion.key)).sort(
    (a, b) => VALENCE_SEVERITY[a.valence] - VALENCE_SEVERITY[b.valence],
  );
  if (selected.length === 0) return null;
  return selected.map((emotion) => emotion.label).join(' + ');
}
