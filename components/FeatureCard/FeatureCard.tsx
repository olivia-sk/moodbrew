import React from 'react';
import { View, Text, Image, TouchableOpacity, ImageSourcePropType } from 'react-native';
import { featureCardStyles as s } from './styles';

interface FeatureCardProps {
  title: string;
  image: ImageSourcePropType;
  width: number;
  imageWidth: number;
  imageHeight: number;
  onPress?: () => void;
}

export default function FeatureCard({
  title,
  image,
  width,
  imageWidth,
  imageHeight,
  onPress,
}: FeatureCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[s.card, { width, height: 203 }]}
    >
      <Text style={s.title}>{title}</Text>
      <Image
        source={image}
        style={[s.image, { width: imageWidth, height: imageHeight }]}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
}
