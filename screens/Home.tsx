import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { colors, spacing, fontSize, fonts } from '../theme';

const MOODS = [
  { id: 'calm',      label: 'Calm',      emoji: '🌿' },
  { id: 'energized', label: 'Energized', emoji: '⚡' },
  { id: 'focused',   label: 'Focused',   emoji: '🎯' },
  { id: 'cozy',      label: 'Cozy',      emoji: '🍂' },
  { id: 'refreshed', label: 'Refreshed', emoji: '💧' },
  { id: 'joyful',    label: 'Joyful',    emoji: '☀️' },
] as const;

type MoodId = (typeof MOODS)[number]['id'];
type Mood   = (typeof MOODS)[number];

const PLACEHOLDER_TEAS: Record<MoodId, string> = {
  calm:      'Chamomile & Lavender',
  energized: 'Ginger Lemon Green',
  focused:   'Matcha Ceremonial Grade',
  cozy:      'Masala Chai',
  refreshed: 'Peppermint Spearmint',
  joyful:    'Hibiscus Rose Hip',
};

export default function HomeScreen() {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors['light-200']} />
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={s.header}>
          <Text style={s.wordmark}>MoodBrew</Text>
          <Text style={s.tagline}>Let your mood guide your cup.</Text>
        </View>

        {/* ── Mood grid ── */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>How are you feeling?</Text>
          <View style={s.moodGrid}>
            {MOODS.map((mood) => {
              const active = selectedMood?.id === mood.id;
              return (
                <TouchableOpacity
                  key={mood.id}
                  style={[s.moodChip, active && s.moodChipActive]}
                  onPress={() => setSelectedMood(active ? null : mood)}
                  activeOpacity={0.7}
                >
                  <Text style={s.moodEmoji}>{mood.emoji}</Text>
                  <Text style={[s.moodLabel, active && s.moodLabelActive]}>
                    {mood.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Recommendation ── */}
        <View style={s.section}>
          {selectedMood ? (
            <View style={s.card}>
              <Text style={s.cardEyebrow}>Your Brew</Text>
              <Text style={s.cardTitle}>{PLACEHOLDER_TEAS[selectedMood.id]}</Text>
              <View style={s.divider} />
              <Text style={s.cardBody}>
                AI-powered recommendation coming soon. Your taste profile is being
                brewed.
              </Text>
              <Text style={s.cardMono}>mood · {selectedMood.label.toLowerCase()}</Text>
            </View>
          ) : (
            <View style={[s.card, s.cardEmpty]}>
              <Text style={s.emptyText}>
                Select a mood above to discover your perfect cup.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors['light-200'],
  },
  scroll: {
    paddingHorizontal: spacing['padding-horizontal'],
    paddingBottom:     spacing['3xl'],
  },

  // Header
  header: {
    paddingTop:    spacing['padding-vertical'],
    marginBottom:  spacing['2xl'],
    gap:           spacing.sm,
  },
  wordmark: {
    fontFamily:  fonts.serif,
    fontSize:    fontSize.display,
    color:       colors['brand-text-100'],
    lineHeight:  fontSize.display * 1.1,
    letterSpacing: -0.5,
  },
  tagline: {
    fontFamily: fonts.mono,
    fontSize:   fontSize.mono,
    color:      colors['light-500'],
    letterSpacing: 0.2,
  },

  // Section
  section: {
    marginBottom: spacing.xl,
    gap:          spacing.md,
  },
  sectionLabel: {
    fontFamily:    fonts.mono,
    fontSize:      fontSize['mono-small'],
    color:         colors['brand-text-200'],
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Mood chips
  moodGrid: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           spacing.sm,
  },
  moodChip: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            spacing.xs,
    paddingVertical:  spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius:   100,
    backgroundColor: colors['light-100'],
    borderWidth:    1,
    borderColor:    colors['light-300'],
  },
  moodChipActive: {
    backgroundColor: colors['dark-100'],
    borderColor:     colors['dark-100'],
  },
  moodEmoji: {
    fontSize: 15,
  },
  moodLabel: {
    fontFamily: fonts.sans,
    fontSize:   fontSize['body-small'],
    color:      colors['brand-text-100'],
  },
  moodLabelActive: {
    color: colors['light-100'],
  },

  // Card
  card: {
    backgroundColor: colors['light-100'],
    borderRadius:    16,
    padding:         spacing['card-padding'],
    borderWidth:     1,
    borderColor:     colors['light-300'],
    gap:             spacing.sm,
  },
  cardEmpty: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  cardEyebrow: {
    fontFamily:    fonts.mono,
    fontSize:      fontSize['mono-small'],
    color:         colors['brand-text-200'],
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardTitle: {
    fontFamily:   fonts.serif,
    fontSize:     fontSize.h2,
    color:        colors['brand-text-100'],
    lineHeight:   fontSize.h2 * 1.2,
    letterSpacing: -0.3,
  },
  divider: {
    height:          1,
    backgroundColor: colors['light-300'],
    marginVertical:  spacing.xs,
  },
  cardBody: {
    fontFamily: fonts.sans,
    fontSize:   fontSize['body-small'],
    color:      colors['light-500'],
    lineHeight: fontSize['body-small'] * 1.6,
  },
  cardMono: {
    fontFamily: fonts.mono,
    fontSize:   fontSize['mono-small'],
    color:      colors['brand-text-200'],
    marginTop:  spacing.xs,
  },
  emptyText: {
    fontFamily: fonts.sans,
    fontSize:   fontSize.body,
    color:      colors['brand-text-200'],
    textAlign:  'center',
    lineHeight: fontSize.body * 1.5,
  },
});
