import { StyleSheet } from 'react-native';
import { colors, fontSize, fonts, spacing } from '../../theme';

export const toastStyles = StyleSheet.create({
  // fills the screen and centers the bubble so notices land mid-screen
  // instead of hiding down by the nav bar
  wrap: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: spacing['padding-horizontal'],
    right: spacing['padding-horizontal'],
    alignItems: 'center',
    justifyContent: 'center',
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
