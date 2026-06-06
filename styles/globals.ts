import { StyleSheet } from 'react-native';
import { colors, fontSize, fonts, spacing } from '../theme';

/*
  root-level styles across entire app
 */

// ─── Layout ───────────────────────────────────────────────────────────────────
export const layout = StyleSheet.create({
  /** Full-screen white safe area root */
  safe: {
    flex:            1,
    backgroundColor: colors['light-100'],
  },
  /** Standard scrollable page content */
  scroll: {
    paddingHorizontal: 16,
    paddingBottom:     spacing['3xl'],
    gap:               spacing['2xl'],
  },
  /** Row that fills width with space between two items */
  rowBetween: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
  },
});

// ─── Typography ───────────────────────────────────────────────────────────────
export const text = StyleSheet.create({
  /** Display-size serif — wordmarks, hero labels */
  display: {
    fontFamily:    fonts.serif,
    fontSize:      fontSize.display,
    color:         colors['brand-text-100'],
    letterSpacing: -0.5,
    lineHeight:    fontSize.display * 1.1,
  },
  /** h1 serif — section titles (e.g. "My Tea Collection") */
  h1: {
    fontFamily:    fonts.serif,
    fontSize:      fontSize.h1,
    color:         colors['dark-100'],
    letterSpacing: -0.96,
    lineHeight:    fontSize.h1 * 1.25,  // extra room for serif ascenders
  },
  /** h2 serif — card titles */
  h2: {
    fontFamily:    fonts.serif,
    fontSize:      fontSize.h2,
    color:         colors['brand-text-100'],
    letterSpacing: -0.78,
    lineHeight:    fontSize.h2 * 1.15,
  },
  /** Standard body copy */
  body: {
    fontFamily: fonts.sans,
    fontSize:   fontSize.body,
    color:      colors['brand-text-100'],
    lineHeight: fontSize.body * 1.5,
  },
  /** Small body copy */
  bodySmall: {
    fontFamily: fonts.sans,
    fontSize:   fontSize['body-small'],
    color:      colors['light-500'],
    lineHeight: fontSize['body-small'] * 1.6,
  },
  /** Mono uppercase eyebrow / label */
  monoLabel: {
    fontFamily:    fonts.mono,
    fontSize:      fontSize['mono-small'],
    color:         colors['brand-text-200'],
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  /** Mono base — dates, metadata, nav labels */
  mono: {
    fontFamily:    fonts.mono,
    fontSize:      fontSize.mono,
    color:         colors['brand-text-100'],
    letterSpacing: 0.3,
    lineHeight:    fontSize.mono * 1.5,
  },
  /** Muted mono variant */
  monoMuted: {
    fontFamily:    fonts.mono,
    fontSize:      fontSize.mono,
    color:         colors['brand-text-200'],
    letterSpacing: 0.3,
  },
});

// ─── Cards ────────────────────────────────────────────────────────────────────
export const card = StyleSheet.create({
  /** Standard bordered card */
  base: {
    backgroundColor: colors['light-200'],
    borderWidth:     1,
    borderColor:     colors['light-300'],
    borderRadius:    spacing.xs,
    padding:         spacing['card-padding'],
  },
  /** Card with white background */
  white: {
    backgroundColor: colors['light-100'],
    borderWidth:     1,
    borderColor:     colors['light-300'],
    borderRadius:    16,
    padding:         spacing['card-padding'],
  },
});
