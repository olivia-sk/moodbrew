import React from 'react';
import {
  Text,
  Image,
  View,
  ImageSourcePropType,
  DimensionValue,
} from 'react-native';
import PressableScale from '../PressableScale/PressableScale';
import { featureCardStyles as s } from './styles';

interface FeatureCardProps {
  title: string;
  image: ImageSourcePropType;
  /** card width, pass a number in px or a percentage string like '48%' */
  width: DimensionValue;
  /** fixed card height in px, omit to let the card stretch to parent height */
  height?: number;
  /** border and title color, one accent per card in the design */
  accentColor: string;
  /** illustration width as a percentage of the card */
  imageWidthPct: DimensionValue;
  /** illustration height as a percentage of the card, the image letterboxes
      inside this box via contain so it never distorts */
  imageHeightPct: DimensionValue;
  /** illustration right offset from the card edge, defaults to '8%' */
  imageRight?: DimensionValue;
  onPress?: () => void;
}

export default function FeatureCard({
  title,
  image,
  width,
  height,
  accentColor,
  imageWidthPct,
  imageHeightPct,
  imageRight = '8%',
  onPress,
}: FeatureCardProps) {
  return (
    <PressableScale
      onPress={onPress}
      containerStyle={[{ width }, height !== undefined ? { height } : undefined]}
      style={{ flex: 1 }}
    >
      <View style={[s.card, { borderColor: accentColor }]}>
        <Text style={[s.title, { color: accentColor }]}>{title}</Text>
        <Image
          source={image}
          style={[s.image, { width: imageWidthPct, height: imageHeightPct, right: imageRight }]}
          resizeMode="contain"
        />
      </View>
    </PressableScale>
  );
}
