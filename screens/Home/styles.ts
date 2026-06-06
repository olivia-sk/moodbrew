import { StyleSheet } from 'react-native';
import { colors, spacing, fontSize, fonts } from '../../theme';

export const SHELF_DIMS = { width: 358, height: 267 } as const;

export const homeStyles = StyleSheet.create({
  // ── Header ──────────────────────────────────────────────────────────────
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
  settingsIcon: {
    width:  24,
    height: 24,
  },

  // ── Shelf ────────────────────────────────────────────────────────────────
  section: {
    gap: spacing.xl,
  },
  shelfContainer: {
    width:  358,
    height: 267,
  },
  shelfImage: {
    position: 'absolute',
    top:      0,
    left:     0,
    right:    0,
    bottom:   0,
  },
  slotRow: {
    position:      'absolute',
    flexDirection: 'row',
    gap:           spacing.xl,
  },
  slot: {
    width:           50,
    height:          40,
    backgroundColor: colors['light-100-o20'],
  },

  // ── Feature cards ────────────────────────────────────────────────────────
  featureRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
  },
});
