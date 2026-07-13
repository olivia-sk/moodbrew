import { StyleSheet } from 'react-native';
import { colors, fonts, fontSize } from '../../theme';

export const featureCardStyles = StyleSheet.create({
  // white card with a 1px accent border, radius 4 per the design system
  card: {
    flex:            1,
    backgroundColor: colors['light-100'],
    borderWidth:     1,
    borderRadius:    4,
    overflow:        'hidden',
  },
  // mono uppercase title anchored to the top left of the card
  title: {
    position:      'absolute',
    top:           24,
    left:          20,
    fontFamily:    fonts.mono,
    fontSize:      fontSize['body-small'],
    lineHeight:    21,
    letterSpacing: 1,
    textTransform: 'uppercase',
    width:         140,
  },
  // right and width are injected per card via inline style
  image: {
    position: 'absolute',
    bottom:   20,
  },
});
