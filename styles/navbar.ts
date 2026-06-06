import { StyleSheet } from 'react-native';
import { colors, spacing, fontSize, fonts } from '../theme';

export const navStyles = StyleSheet.create({
  bar: {
    flexDirection:     'row',
    justifyContent:    'space-between',
    alignItems:        'center',
    paddingHorizontal: spacing['4xl'],
    paddingVertical:   spacing.md,
    backgroundColor:   colors['light-100'],
    borderTopWidth:    1,
    borderTopColor:    colors['dark-100-o20'],
  },
  tab: {
    alignItems: 'center',
    gap:        spacing['stack-gap'],
  },
  label: {
    fontFamily:    fonts.mono,
    fontSize:      fontSize.mono,
    letterSpacing: 0.5,
  },
});
