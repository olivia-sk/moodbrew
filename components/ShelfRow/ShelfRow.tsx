// one flat wooden shelf board with a row of tea slots resting on it,
// shared by the home recent teas shelf and the pantry cabinet
import React from 'react';
import { Text, View, ViewStyle } from 'react-native';
import PressableScale from '../PressableScale/PressableScale';
import { shelfRowStyles as s } from './styles';

export interface ShelfSlotData {
  key: string;
  label?: string;
  onPress?: () => void;
}

interface ShelfRowProps {
  slots: ShelfSlotData[];
  slotStyle?: ViewStyle;
}

export default function ShelfRow({ slots, slotStyle }: ShelfRowProps) {
  return (
    <View style={s.row}>
      <View style={s.slotRow}>
        {slots.map((slot) => {
          const box = (
            <View style={[s.slot, slotStyle]}>
              {!!slot.label && (
                <Text style={s.slotLabel} numberOfLines={2}>
                  {slot.label}
                </Text>
              )}
            </View>
          );
          return slot.onPress ? (
            <PressableScale key={slot.key} onPress={slot.onPress}>
              {box}
            </PressableScale>
          ) : (
            <View key={slot.key}>{box}</View>
          );
        })}
      </View>
      <View style={s.board} />
    </View>
  );
}
