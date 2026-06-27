// ─── Colors ────────────────────────────────────────────────────────────────
export const colors = {
  // Neutrals
  'light-100':      '#FFFFFF',
  'light-100-o20':  'rgba(255, 255, 255, 0.20)',
  'light-200':      '#F7F7F7',
  'light-300':      '#D9D9D9',
  'light-400':      '#BDBDBD',
  'light-500':      '#5B5B5B',
  'dark-100':       '#121212',
  'dark-100-o20':   'rgba(18, 18, 18, 0.20)',

  // Brand text
  'brand-text-100': '#121212',
  'brand-text-200': '#BDBDBD',

  // Accent — olive, used for the wordmark, illustration line art, and links
  'accent-olive':   '#8A9900',
} as const;

// ─── Spacing ───────────────────────────────────────────────────────────────
export const spacing = {
  xs:                 4,
  sm:                 8,
  md:                 12,
  lg:                 16,
  xl:                 24,
  '2xl':              32,
  '3xl':              48,
  '4xl':              64,
  'stack-gap':        12,
  'padding-horizontal': 20,
  'card-padding':     20,
  'padding-vertical': 32,
} as const;

// ─── Font sizes ────────────────────────────────────────────────────────────
export const fontSize = {
  display:      42,
  h1:           32,
  h2:           26,
  h3:           20,
  'body-large': 18,
  body:         16,
  'body-small': 14,
  label:        13,
  mono:         13,
  'mono-small': 11,
} as const;

// ─── Font families ─────────────────────────────────────────────────────────
// Instrument Serif  → loaded via @expo-google-fonts/instrument-serif
// IBM Plex Mono     → loaded via @expo-google-fonts/ibm-plex-mono
export const fonts = {
  serif: 'InstrumentSerif_400Regular',
  mono:  'IBMPlexMono_400Regular',
} as const;
