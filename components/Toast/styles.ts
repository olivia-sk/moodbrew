import { StyleSheet } from 'react-native';
import { colors, fontSize, fonts, spacing } from '../../theme';

export const toastStyles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: spacing['padding-horizontal'],
    right: spacing['padding-horizontal'],
    bottom: spacing['2xl'],
    alignItems: 'center',
  },
  bubble: {
    backgroundColor: colors['dark-100'],
    borderRadius: spacing.xs,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    maxWidth: '100%',
  },
  text: {
    fontFamily: fonts.mono,
    fontSize: fontSize['body-small'],
    color: colors['light-100'],
    textAlign: 'center',
  },
});
