// screens/MoodInput.tsx
// figma node 176:465 "mood grid (initial input)"
//
// layout from figma (390x844):
// - status bar: y=0 h=61
// - back button: x=16 y=81 h=36
// - "how are you feeling?" title: x=94 y=130 w=205 h=23 (centered serif)
// - group40 (mood section): x=16 y=220 w=358 h=204
//   - "pick the closest match" label: y=0
//   - frame38 (2-col tag grid): y=33 w=358 h=171
//     - tags: w=163 h=41, 2 columns, gap=32, 3 rows
// - group39 (slider section): x=16 y=506 w=358 h=66
//   - "what are you craving?" label: y=0
//   - slider: y=33 h=15
//   - "earthy" / "bright" labels below slider
// - find my tea button: x=16 y=654 w=358 h=57
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, fonts, fontSize, spacing } from '../theme';
import GradientSlider from '../components/GradientSlider/GradientSlider';
import { findBestTeaMatchFromPantry } from '../lib/teaMatching';
import { showToast } from '../lib/toast';
import { useAuth } from '../context/AuthContext';
import { MoodContext, Tea } from '../lib/types';
import {
  BRIGHTNESS_DIMENSION_INDEX,
  DEFAULT_MOOD_VECTOR,
  MOOD_BASELINE_VECTORS,
  MOOD_BUTTONS,
  MoodKey,
} from '../lib/moodVectors';

interface Props {
  onBack: () => void;
  // called with the matched tea and mood context so the caller can pass both to the match card
  onMatch: (tea: Tea, moodContext: MoodContext) => void;
}

export default function MoodInputScreen({ onBack, onMatch }: Props) {
  const { user } = useAuth();
  const [selectedMood, setSelectedMood] = useState<MoodKey | null>(null);
  const [craving, setCraving] = useState(0.5);
  const [loading, setLoading] = useState(false);

  const handleFindMyTea = async () => {
    if (!user) {
      Alert.alert('Sign in required', 'Please sign in again to find a match.');
      return;
    }
    // start from the selected mood's baseline, or a neutral vector if nothing is picked yet
    const baseline = selectedMood ? MOOD_BASELINE_VECTORS[selectedMood] : DEFAULT_MOOD_VECTOR;
    const userInputVector = [...baseline];
    userInputVector[BRIGHTNESS_DIMENSION_INDEX] = craving;

    setLoading(true);
    try {
      // restricts the match to the user's in-stock pantry teas, falling back
      // to the full database when their pantry is empty
      const { tea: matchedTea, usedFallback } = await findBestTeaMatchFromPantry(userInputVector, user.id);
      if (usedFallback) {
        showToast('your pantry is empty, showing matches from the full collection');
      }
      const moodLabel = MOOD_BUTTONS.find((b) => b.key === selectedMood)?.label ?? null;
      onMatch(matchedTea, { moodLabel, craving });
    } catch (error) {
      Alert.alert('Could not find a match', (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors['light-100']} />

      {/* back button: x=16 y=81 h=36 */}
      <TouchableOpacity style={s.backRow} activeOpacity={0.7} onPress={onBack}>
        <Text style={s.backArrow}>←</Text>
        <Text style={s.backLabel}>back</Text>
      </TouchableOpacity>

      {/* "how are you feeling?" centered serif title: y=130 */}
      <Text style={s.title}>How are you feeling?</Text>

      {/* mood tag section: y=220 in figma */}
      <View style={s.section}>
        <Text style={s.sectionLabel}>Pick the closest match</Text>

        {/* 2-col tag grid: tags 163px wide, gap 32px between cols */}
        <View style={s.moodGrid}>
          {MOOD_BUTTONS.map(({ key, label }) => {
            const active = selectedMood === key;
            return (
              <TouchableOpacity
                key={key}
                style={[s.moodBtn, active && s.moodBtnActive]}
                activeOpacity={0.85}
                onPress={() => setSelectedMood(key)}
              >
                <Text style={[s.moodBtnText, active && s.moodBtnTextActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* craving slider section: y=506 in figma */}
      <View style={s.sliderSection}>
        <Text style={s.sectionLabel}>What are you craving?</Text>
        <GradientSlider value={craving} onChange={setCraving} leftLabel="Earthy" rightLabel="Bright" />
      </View>

      {/* spacer pushes button to y=654 region */}
      <View style={s.spacer} />

      {/* find my tea button: y=654 h=57 */}
      <TouchableOpacity
        style={s.actionBtn}
        activeOpacity={0.85}
        onPress={handleFindMyTea}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color={colors['light-100']} />
          : <Text style={s.actionBtnText}>Find my tea</Text>
        }
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors['light-100'],
  },

  // back button row: x=16 y=81 in figma, so pt=81-61(statusbar safe)=20ish
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing['padding-horizontal'],
    paddingTop: spacing.lg,
  },
  backArrow: {
    fontFamily: fonts.mono,
    fontSize: fontSize.body,
    color: colors['brand-text-100'],
  },
  backLabel: {
    fontFamily: fonts.mono,
    fontSize: fontSize['body-small'],
    color: colors['brand-text-100'],
    letterSpacing: 0.5,
  },

  // "how are you feeling?" serif title: centered at y=130 in figma
  title: {
    fontFamily: fonts.serif,
    fontSize: fontSize.display,
    color: colors['accent-olive'],
    letterSpacing: -1.26,
    textAlign: 'center',
    paddingHorizontal: spacing['padding-horizontal'],
    marginTop: spacing.lg,
    marginBottom: spacing['2xl'],
  },

  // mood section container
  section: {
    paddingHorizontal: spacing['padding-horizontal'],
    gap: spacing.md,
  },
  sectionLabel: {
    fontFamily: fonts.mono,
    fontSize: fontSize['mono-small'],
    color: colors['brand-text-200'],
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // 2-col grid: each tag 163px wide, gap=32px = 163+32+163=358 total
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 32,
  },
  moodBtn: {
    width: 163,
    height: 41,
    borderWidth: 1,
    borderColor: colors['brand-text-200'],
    borderRadius: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors['light-100'],
  },
  moodBtnActive: {
    backgroundColor: colors['dark-100'],
    borderColor: colors['dark-100'],
  },
  moodBtnText: {
    fontFamily: fonts.mono,
    fontSize: fontSize['body-small'],
    color: colors['brand-text-100'],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  moodBtnTextActive: {
    color: colors['light-100'],
  },

  // craving slider section
  sliderSection: {
    paddingHorizontal: spacing['padding-horizontal'],
    gap: spacing.md,
    marginTop: spacing['2xl'],
  },

  // pushes action button to the bottom
  spacer: {
    flex: 1,
  },

  // "find my tea" primary button: h=57 full width
  actionBtn: {
    marginHorizontal: spacing['padding-horizontal'],
    marginBottom: spacing.xl,
    backgroundColor: colors['dark-100'],
    borderRadius: spacing.xs,
    height: 57,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    fontFamily: fonts.mono,
    fontSize: fontSize['body-small'],
    color: colors['light-100'],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
