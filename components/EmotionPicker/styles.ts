import { StyleSheet } from 'react-native';
import { colors, fontSize, fonts, spacing } from '../../theme';

export const emotionPickerStyles = StyleSheet.create({
  wrap: {
    gap: spacing.md,
  },

  // valence tabs, a thin segmented row
  tabRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: colors['light-300'],
    alignItems: 'center',
  },
  tabCompact: {
    paddingVertical: spacing.xs,
  },
  tabActive: {
    borderBottomColor: colors['accent-olive'],
  },
  tabText: {
    fontFamily: fonts.mono,
    fontSize: fontSize['mono-small'],
    color: colors['brand-text-200'],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tabTextActive: {
    color: colors['accent-olive'],
  },

  // emotion chips for the active valence
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors['brand-text-200'],
    // matches the 4px rounded squares used by the action buttons and the
    // old mood grid, not the pill radius of the journal tags
    borderRadius: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors['light-100'],
  },
  chipCompact: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  chipActive: {
    backgroundColor: colors['dark-100'],
    borderColor: colors['dark-100'],
  },
  chipText: {
    fontFamily: fonts.mono,
    fontSize: fontSize['body-small'],
    color: colors['brand-text-100'],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipTextActive: {
    color: colors['light-100'],
  },
});
