import { StyleSheet } from 'react-native';
import { colors, fontSize, fonts, spacing } from '../../theme';

export const teaPickerSheetStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors['dark-100-o20'],
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors['light-100'],
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing['padding-horizontal'],
    paddingBottom: spacing['2xl'],
    maxHeight: '70%',
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors['light-400'],
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: fontSize.h3,
    color: colors['accent-olive'],
    marginBottom: spacing.md,
  },
  row: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors['light-300'],
  },
  rowName: {
    fontFamily: fonts.mono,
    fontSize: fontSize['body-small'],
    color: colors['brand-text-100'],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rowCategory: {
    fontFamily: fonts.mono,
    fontSize: fontSize['mono-small'],
    color: colors['brand-text-200'],
    marginTop: spacing.xs,
  },
  emptyText: {
    fontFamily: fonts.mono,
    fontSize: fontSize['body-small'],
    color: colors['brand-text-200'],
    paddingVertical: spacing.lg,
    textAlign: 'center',
  },

  // search box above the list, 16px so ios safari never zooms on focus
  searchInput: {
    fontFamily: fonts.mono,
    fontSize: fontSize.body,
    color: colors['brand-text-100'],
    borderWidth: 1,
    borderColor: colors['light-400'],
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  errorText: {
    fontFamily: fonts.mono,
    fontSize: fontSize['mono-small'],
    color: colors['brand-brown'],
    marginBottom: spacing.sm,
  },

  // "you have unique taste" prompt shown when the search finds nothing
  uniqueTasteBox: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
  },
  uniqueTasteTitle: {
    fontFamily: fonts.serif,
    fontSize: fontSize.h3,
    color: colors['accent-olive'],
  },
  uniqueTasteBody: {
    fontFamily: fonts.mono,
    fontSize: fontSize['body-small'],
    color: colors['brand-text-200'],
    textAlign: 'center',
    lineHeight: 20,
  },
  // squared off like every other primary button in the app
  uniqueTasteButton: {
    backgroundColor: colors['accent-olive'],
    borderRadius: spacing.xs,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.sm,
    alignSelf: 'center',
  },
  uniqueTasteButtonText: {
    fontFamily: fonts.mono,
    fontSize: fontSize['body-small'],
    color: colors['light-100'],
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // spinner state while haiku builds the tea profile
  enrichingBox: {
    paddingVertical: spacing['2xl'],
    alignItems: 'center',
    gap: spacing.md,
  },
  enrichingText: {
    fontFamily: fonts.mono,
    fontSize: fontSize['body-small'],
    color: colors['brand-text-200'],
    textAlign: 'center',
  },

  // preview card for a freshly enriched custom tea
  previewBox: {
    paddingVertical: spacing.lg,
    gap: spacing.xs,
  },
  previewName: {
    fontFamily: fonts.serif,
    fontSize: fontSize.h3,
    color: colors['accent-olive'],
  },
  previewMeta: {
    fontFamily: fonts.mono,
    fontSize: fontSize['mono-small'],
    color: colors['brand-text-100'],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  previewNotes: {
    fontFamily: fonts.mono,
    fontSize: fontSize['body-small'],
    color: colors['brand-text-200'],
    marginTop: spacing.xs,
  },
  previewCancel: {
    alignSelf: 'center',
    paddingVertical: spacing.sm,
  },
  previewCancelText: {
    fontFamily: fonts.mono,
    fontSize: fontSize['mono-small'],
    color: colors['brand-text-200'],
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // small tag marking a user-created tea in lists and previews
  rowNameLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  customTag: {
    fontFamily: fonts.mono,
    fontSize: 9,
    color: colors['light-100'],
    backgroundColor: colors['accent-olive'],
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
    textTransform: 'uppercase',
    letterSpacing: 1,
    overflow: 'hidden',
  },
});
