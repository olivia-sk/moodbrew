import { StyleSheet } from 'react-native';
import { colors, fontSize, fonts, spacing } from '../../theme';

// gradient endpoints shared by every gradient slider instance, dark earthy
// brown fading to bright olive, reused for craving, bitter/sweet and
// earthy/floral so the whole app feels like one slider component
export const GRADIENT_LOW_COLOR = '#3D2B1F';
export const GRADIENT_HIGH_COLOR = '#B4E480';

export const TRACK_HEIGHT = 6;
export const THUMB_SIZE = 18;
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
  labelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  infoIcon: {
    fontFamily: fonts.mono,
    fontSize: fontSize['mono-small'],
    color: colors['accent-olive'],
  },

  // live phrase describing where the thumb currently sits, centered
  // between the two endpoint labels
  descriptor: {
    fontFamily: fonts.mono,
    fontSize: fontSize['mono-small'],
    color: colors['accent-olive'],
    letterSpacing: 0.5,
  },

  // tooltip modal opened by the info icon
  infoBackdrop: {
    flex: 1,
    backgroundColor: colors['dark-100-o20'],
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['2xl'],
  },
  infoCard: {
    backgroundColor: colors['light-100'],
    borderRadius: 16,
    padding: spacing.xl,
    gap: spacing.md,
    width: '100%',
  },
  infoTitle: {
    fontFamily: fonts.serif,
    fontSize: fontSize.h3,
    color: colors['accent-olive'],
  },
  infoBody: {
    fontFamily: fonts.mono,
    fontSize: fontSize['body-small'],
    color: colors['brand-text-100'],
    lineHeight: 20,
  },
  infoDismiss: {
    fontFamily: fonts.mono,
    fontSize: fontSize['mono-small'],
    color: colors['light-500'],
    textTransform: 'uppercase',
    letterSpacing: 1,
    alignSelf: 'flex-end',
  },
});
