import { StyleSheet } from 'react-native';
import { colors, spacing, fontSize, fonts } from '../../theme';

export const featureCardStyles = StyleSheet.create({
  card: {
    backgroundColor: colors['light-200'],
    borderWidth:     1,
    borderColor:     colors['light-400'],
    borderRadius:    spacing.xs,
    overflow:        'hidden',
  },
  // Matches Figma exactly: left 19px, top 31px, width 96px
  title: {
    position:      'absolute',
    top:           31,
    left:          19,
    fontFamily:    fonts.serif,
    fontSize:      fontSize.h2,
    color:         colors['accent-olive'],
    lineHeight:    fontSize.h2 * 1.15,
    letterSpacing: -0.78,
    width:         96,
  },
  // right and width are injected per-card via inline style
  image: {
    position: 'absolute',
    bottom:   20,
  },
});
