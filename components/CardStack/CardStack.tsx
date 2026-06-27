// stacked index card visual, a front card with a single rotated decoy card
// peeking out behind it, used by the match card and kettle overview screens
import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { cardStackStyles as s } from './styles';

interface CardStackProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

// a stable, decorative card number for the deck feel, not a real id
export function cardNumberFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) % 97;
  }
  return `#${hash + 1}`;
}

export default function CardStack({ children, style }: CardStackProps) {
  return (
    <View style={s.wrap}>
      <View style={s.decoyCard} />
      <View style={[s.frontCard, style]}>{children}</View>
    </View>
  );
}
