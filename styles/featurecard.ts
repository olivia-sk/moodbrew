import { StyleSheet } from 'react-native';
import { colors, spacing, fontSize, fonts } from '../theme';

export const featureCardStyles = StyleSheet.create({
  card: {
    backgroundColor: colors['light-200'],
    borderWidth:     1,
    borderColor:     colors['light-400'],
    borderRadius:    spacing.xs,
    overflow:        'hidden',
  },
  title: {
    position:      'absolute',
    top:           31,
    left:          19,
    fontFamily:    fonts.serif,
    fontSize:      fontSize.h2,
    color:         colors['brand-text-100'],
    lineHeight:    fontSize.h2 * 1.15,
    letterSpacing: -0.78,
    width:         110,
  },
  image: {
    position: 'absolute',
    bottom:   20,
    right:    16,
  },
});
