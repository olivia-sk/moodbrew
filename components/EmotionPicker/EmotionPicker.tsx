// two tier emotion picker: valence tabs on top (feeling good / in between /
// feeling rough) with the matching emotion chips underneath. multi-select
// up to MAX_SELECTED_EMOTIONS across any tabs, per inside out a mood is
// rarely one feeling. used full size on the mood input screen and compact
// on the pairings screen for the mood-after check-in
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import {
  EmotionKey,
  emotionsForValence,
  MAX_SELECTED_EMOTIONS,
  VALENCE_TABS,
  ValenceKey,
} from '../../lib/moodVectors';
import { showToast } from '../../lib/toast';
import { emotionPickerStyles as s } from './styles';

interface EmotionPickerProps {
  selected: EmotionKey[];
  onChange: (selected: EmotionKey[]) => void;
  // tighter paddings for the pairings card
  compact?: boolean;
}

export default function EmotionPicker({ selected, onChange, compact }: EmotionPickerProps) {
  const [activeValence, setActiveValence] = useState<ValenceKey>('good');

  const toggleEmotion = (key: EmotionKey) => {
    if (selected.includes(key)) {
      onChange(selected.filter((item) => item !== key));
      return;
    }
    if (selected.length >= MAX_SELECTED_EMOTIONS) {
      showToast(`pick up to ${MAX_SELECTED_EMOTIONS} feelings`);
      return;
    }
    onChange([...selected, key]);
  };

  // count per tab so a selection on another tab stays discoverable
  const selectedCountFor = (valence: ValenceKey) =>
    emotionsForValence(valence).filter((emotion) => selected.includes(emotion.key)).length;

  return (
    <View style={s.wrap}>
      <View style={s.tabRow}>
        {VALENCE_TABS.map(({ key, label }) => {
          const active = activeValence === key;
          const count = selectedCountFor(key);
          return (
            <TouchableOpacity
              key={key}
              style={[s.tab, compact && s.tabCompact, active && s.tabActive]}
              activeOpacity={0.8}
              onPress={() => setActiveValence(key)}
            >
              <Text style={[s.tabText, active && s.tabTextActive]}>
                {label}
                {count > 0 ? ` · ${count}` : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={s.chipRow}>
        {emotionsForValence(activeValence).map(({ key, label }) => {
          const active = selected.includes(key);
          return (
            <TouchableOpacity
              key={key}
              style={[s.chip, compact && s.chipCompact, active && s.chipActive]}
              activeOpacity={0.85}
              onPress={() => toggleEmotion(key)}
            >
              <Text style={[s.chipText, active && s.chipTextActive]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
