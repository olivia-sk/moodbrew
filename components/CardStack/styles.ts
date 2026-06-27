import { Dimensions, StyleSheet } from 'react-native';
import { colors, spacing } from '../../theme';

// reads the actual device dimensions so the card scales to the screen it is
// rendered on instead of a hardcoded pixel size from the figma frame
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// target scale ratios pulled from the figma frame (390x844)
export const CARD_WIDTH = screenWidth * 0.917;
export const CARD_HEIGHT = screenHeight * 0.568;

export const cardStackStyles = StyleSheet.create({
  // the single decoy card behind sits absolutely inside this relative
  // wrapper and stretches to match the front card's own height
  wrap: {
    position: 'relative',
    width: CARD_WIDTH,
    alignSelf: 'center',
    marginBottom: spacing.xl,
  },
  decoyCard: {
    position: 'absolute',
    top: -10,
    bottom: 12,
    left: -12,
    right: 18,
    borderWidth: 1,
    borderColor: colors['light-400'],
    borderRadius: 14,
    backgroundColor: colors['light-100'],
    transform: [{ rotate: '6.778deg' }],
  },
  frontCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderWidth: 1,
    borderColor: colors['light-400'],
    borderRadius: 14,
    backgroundColor: colors['light-100'],
    padding: spacing.xl,
    gap: spacing['2xl'],
  },
});
