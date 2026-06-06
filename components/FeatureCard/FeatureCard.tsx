import React from 'react';
import {
  Text,
  Image,
  TouchableOpacity,
  ImageSourcePropType,
  DimensionValue,
} from 'react-native';
import { featureCardStyles as s } from './styles';

interface FeatureCardProps {
  title: string;
  image: ImageSourcePropType;
  /** Card width — pass a number (px) or percentage string e.g. '48%' */
  width: DimensionValue;
  /** Fixed card height in px — omit to let the card stretch to parent height */
  height?: number;
  /** Illustration width as % of card (scales naturally with card) */
  imageWidthPct: DimensionValue;
  /** Illustration w/h ratio */
  imageAspectRatio: number;
  /** Illustration right offset from card edge (default '8%') */
  imageRight?: DimensionValue;
  onPress?: () => void;
}

export default function FeatureCard({
  title,
  image,
  width,
  height,
  imageWidthPct,
  imageAspectRatio,
  imageRight = '8%',
  onPress,
}: FeatureCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[s.card, { width }, height !== undefined ? { height } : undefined]}
    >
      <Text style={s.title}>{title}</Text>
      <Image
        source={image}
        style={[s.image, { width: imageWidthPct, aspectRatio: imageAspectRatio, right: imageRight }]}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
}
