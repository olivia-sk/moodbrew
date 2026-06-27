import { StyleSheet } from 'react-native';
import { colors, fontSize, fonts, spacing } from '../../theme';

// gradient endpoints shared by every gradient slider instance, dark earthy
// brown fading to bright olive, reused for craving, bitter/sweet and
// earthy/floral so the whole app feels like one slider component
export const GRADIENT_LOW_COLOR = '#3D2B1F';
export const GRADIENT_HIGH_COLOR = '#B4E480';

export const TRACK_HEIGHT = 6;
export const THUMB_SIZE = 24;
// extra invisible padding around the track so the touch target is bigger than 6px
export const TOUCH_PADDING = 14;

export const gradientSliderStyles = StyleSheet.create({
  touchArea: {
    justifyContent: 'center',
    paddingVertical: TOUCH_PADDING,
  },
  trackWrap: {
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    overflow: 'hidden',
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 4,
    backgroundColor: colors['light-100'],
    borderWidth: 1,
    borderColor: colors['light-400'],
    top: TOUCH_PADDING + TRACK_HEIGHT / 2 - THUMB_SIZE / 2,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  label: {
    fontFamily: fonts.mono,
    fontSize: fontSize['mono-small'],
    color: colors['light-500'],
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
