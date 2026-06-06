import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ImageSourcePropType,
  TouchableOpacity,
} from 'react-native';
import { colors, spacing, fontSize, fonts } from '../theme';

interface FeatureCardProps {
  title: string;
  image: ImageSourcePropType;
  width: number;
  onPress?: () => void;
  /** Absolute position of the illustration within the card */
  imageStyle?: object;
  imageWidth: number;
  imageHeight: number;
}

export default function FeatureCard({
  title,
  image,
  width,
  onPress,
  imageStyle,
  imageWidth,
  imageHeight,
}: FeatureCardProps) {
  const height = 203;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[s.card, { width, height }]}
    >
      <Text style={s.title}>{title}</Text>
      <Image
        source={image}
        style={[
          s.image,
          { width: imageWidth, height: imageHeight },
          imageStyle,
        ]}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors['light-200'],
    borderWidth:     1,
    borderColor:     colors['light-400'],
    borderRadius:    spacing.xs,          // 4px
    overflow:        'hidden',
  },
  title: {
    position:      'absolute',
    top:           31,
    left:          19,
    fontFamily:    fonts.serif,
    fontSize:      fontSize.h2,           // 26px
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
