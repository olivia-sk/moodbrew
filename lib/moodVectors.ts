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

export type MoodKey = 'cozy' | 'happy' | 'focused' | 'stressed' | 'lowEnergy' | 'heavy';

export interface MoodButtonConfig {
  key: MoodKey;
  label: string;
}

// order matches the quick select grid in the design, two columns of three rows
export const MOOD_BUTTONS: MoodButtonConfig[] = [
  { key: 'cozy', label: 'Cozy' },
  { key: 'happy', label: 'Happy' },
  { key: 'focused', label: 'Focused' },
  { key: 'stressed', label: 'Stressed' },
  { key: 'lowEnergy', label: 'Low Energy' },
  { key: 'heavy', label: 'Heavy' },
];

// baseline tea profile that fits each mood, in the same dimension order described above
export const MOOD_BASELINE_VECTORS: Record<MoodKey, number[]> = {
  // wants something soothing and sweet, close to chamomile or vanilla rooibos
  cozy: [0.85, 0.85, 0.3, 0.15, 0.15, 0.35],
  // wants something bright and a little fun, close to jasmine pearls or hibiscus
  happy: [0.55, 0.7, 0.7, 0.25, 0.35, 0.15],
  // wants clarity and alertness, close to matcha or gyokuro
  focused: [0.15, 0.45, 0.35, 0.9, 0.3, 0.25],
  // wants calming relief, close to peppermint or chamomile
  stressed: [0.8, 0.5, 0.4, 0.15, 0.7, 0.2],
  // wants an energizing lift, close to masala chai or english breakfast
  lowEnergy: [0.25, 0.55, 0.45, 0.65, 0.6, 0.35],
  // feeling sluggish, wants something light and grounding, close to shou puerh
  heavy: [0.4, 0.55, 0.15, 0.3, 0.3, 0.8],
};

// neutral fallback used if find my tea is pressed before picking a mood button
export const DEFAULT_MOOD_VECTOR = new Array(MOOD_VECTOR_LENGTH).fill(0.5);
