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
});
