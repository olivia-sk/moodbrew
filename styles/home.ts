/**
 * styles/home.ts
 * All styles and layout constants for the Home screen.
 * Home.tsx imports from here and has zero StyleSheet definitions.
 */
import { StyleSheet } from 'react-native';
import { colors, spacing, fontSize, fonts } from '../theme';

// ─── Shelf geometry ───────────────────────────────────────────────────────────
const SHELF_W = 358;
const SHELF_H = 267;

/**
 * Vertical top position (as % of shelf height) for each of the 3 slot rows.
 * Exported so Home.tsx can iterate them inside the ImageBackground.
 */
export const SLOT_ROW_TOPS: string[] = [
  `${(51  / SHELF_H * 100).toFixed(2)}%`,  // 19.10%
  `${(130 / SHELF_H * 100).toFixed(2)}%`,  // 48.69%
  `${(206 / SHELF_H * 100).toFixed(2)}%`,  // 77.15%
];

// Left/right inset for slot rows (12.01% of shelf width, symmetric)
const SLOT_INSET = `${(43 / SHELF_W * 100).toFixed(2)}%`;

// ─── Styles ───────────────────────────────────────────────────────────────────
export const homeStyles = StyleSheet.create({

  // ── Root content wrapper ───────────────────────────────────────────────────
  /**
   * Single source of horizontal alignment.
   * Every child — header text, shelf asset, and card row —
   * is bound to the same left/right grid via this one paddingHorizontal.
   */
  content: {
    flex:              1,
    paddingHorizontal: spacing['padding-horizontal'],  // 20px
    gap:               spacing.xl,                     // 24px between sections
  },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
    paddingTop:     spacing.lg,
  },
  headerLeft: {
    gap: spacing.xs,
  },
  date: {
    fontFamily:    fonts.mono,
    fontSize:      fontSize.mono,
    color:         colors['brand-text-200'],
    letterSpacing: 0.3,
  },
  greeting: {
    fontFamily:    fonts.mono,
    fontSize:      fontSize.mono,
    color:         colors['brand-text-100'],
    letterSpacing: 0.3,
    lineHeight:    fontSize.mono * 1.5,
  },
  settingsBtn: {
    padding: spacing.xs,
  },

  // ── Shelf section ──────────────────────────────────────────────────────────
  section: {
    gap: spacing.md,
  },

  /**
   * ImageBackground shelf container.
   * width: '100%'        → fills the padded content area (screen − 40px).
   * aspectRatio: 358/267 → height derives from rendered width; no fixed px.
   * resizeMode="stretch" → graphic fills the aspect-ratio box exactly,
   *                        zero letterboxing, zero clipping.
   */
  shelf: {
    width:       '100%',
    aspectRatio: SHELF_W / SHELF_H,  // ≈ 1.34
  },

  // Slot rows — absolutely positioned inside the ImageBackground
  slotRow: {
    position:      'absolute',
    left:          SLOT_INSET,
    right:         SLOT_INSET,
    flexDirection: 'row',
    alignItems:    'center',
  },
  slot: {
    flex:            50,
    aspectRatio:     50 / 40,
    backgroundColor: colors['light-100-o20'],
  },
  slotGap: {
    flex: 24,
  },

  // ── Feature cards ──────────────────────────────────────────────────────────
  /**
   * flex: 1       → fills all remaining vertical space after the shelf section.
   * alignItems    → cards stretch to equal height, no overlapping text.
   * paddingBottom → keeps cards off the nav bar.
   */
  featureRow: {
    flex:           1,
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'stretch',
    gap:            spacing.sm,
    paddingBottom:  spacing.xl,
  },
});
