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
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, fontSize, spacing } from '../theme';
import GradientSlider from '../components/GradientSlider/GradientSlider';
import PressableScale from '../components/PressableScale/PressableScale';
import { findBestTeaMatchFromPantry } from '../lib/teaMatching';
import { showToast } from '../lib/toast';
import { useAuth } from '../context/AuthContext';
import { MoodContext, Tea } from '../lib/types';
import EmotionPicker from '../components/EmotionPicker/EmotionPicker';
import {
  blendEmotionVectors,
  BRIGHTNESS_DIMENSION_INDEX,
  EmotionKey,
  moodLabelFor,
  WEIGHT_DIMENSION_INDEX,
} from '../lib/moodVectors';

interface Props {
  onBack: () => void;
  // called with the matched tea and mood context so the caller can pass both to the match card
  onMatch: (tea: Tea, moodContext: MoodContext) => void;
}

export default function MoodInputScreen({ onBack, onMatch }: Props) {
  const { user } = useAuth();
  const [selectedEmotions, setSelectedEmotions] = useState<EmotionKey[]>([]);
  const [craving, setCraving] = useState(0.5);
  const [richness, setRichness] = useState(0.5);
  const [sweetSpice, setSweetSpice] = useState(0.5);
  const [loading, setLoading] = useState(false);

  const handleFindMyTea = async () => {
    if (!user) {
      Alert.alert('Sign in required', 'Please sign in again to find a match.');
      return;
    }
    // average the selected emotions' baselines into one query vector, a
    // neutral vector falls out automatically when nothing is picked yet
    const userInputVector = blendEmotionVectors(selectedEmotions);
    userInputVector[BRIGHTNESS_DIMENSION_INDEX] = craving;
    userInputVector[WEIGHT_DIMENSION_INDEX] = richness;

    setLoading(true);
    try {
      // restricts the match to the user's in-stock pantry teas, falling back
      // to the full database when their pantry is empty. the sweet/spicy
      // slider rides along as a flavor note nudge rather than a vector dim
      const { tea: matchedTea, usedFallback } = await findBestTeaMatchFromPantry(userInputVector, user.id, sweetSpice);
      if (usedFallback) {
        showToast('your pantry is empty, showing matches from the full collection');
      }
      // roughest feeling leads the label so the story tunes to what needs care
      onMatch(matchedTea, { moodLabel: moodLabelFor(selectedEmotions), craving });
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

      {/* two tier emotion picker: valence tabs, then chips, up to 3 picks */}
      <View style={s.section}>
        <Text style={s.sectionLabel}>Pick up to three feelings</Text>
        <EmotionPicker selected={selectedEmotions} onChange={setSelectedEmotions} />
      </View>

      {/* craving slider section: y=506 in figma */}
      <View style={s.sliderSection}>
        <Text style={s.sectionLabel}>What are you craving?</Text>
        <GradientSlider
          value={craving}
          onChange={setCraving}
          leftLabel="Earthy"
          rightLabel="Bright"
          descriptors={['deep & grounding', 'balanced', 'crisp & lively']}
          info={{
            title: 'Earthy vs Bright',
            body:
              'Earthy teas taste of soil, wood, moss and smoke, think pu-erh or lapsang souchong. Bright teas lean crisp, citrusy, grassy or floral, think sencha or hibiscus.',
          }}
        />
        <GradientSlider
          value={richness}
          onChange={setRichness}
          leftLabel="Light"
          rightLabel="Rich"
          descriptors={['feather light', 'medium body', 'full & hearty']}
          info={{
            title: 'Light vs Rich',
            body:
              'Body is how heavy the tea sits on your tongue. Light teas like white tea feel airy and delicate, rich teas like shou pu-erh or masala chai feel full and warming.',
          }}
        />
        <GradientSlider
          value={sweetSpice}
          onChange={setSweetSpice}
          leftLabel="Sweet"
          rightLabel="Spicy"
          descriptors={['sweet & mellow', 'no preference', 'warm & spicy']}
          info={{
            title: 'Sweet vs Spicy',
            body:
              'Sweet leans toward honey, caramel and vanilla notes. Spicy leans toward ginger, cinnamon and clove. Leave it in the middle if you have no preference either way.',
          }}
        />
      </View>

      {/* spacer pushes button to y=654 region */}
      <View style={s.spacer} />

      {/* find my tea button: y=654 h=57 */}
      <PressableScale style={s.actionBtn} onPress={handleFindMyTea} disabled={loading}>
        {loading
          ? <ActivityIndicator color={colors['light-100']} />
          : <Text style={s.actionBtnText}>Find my tea</Text>
        }
      </PressableScale>
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

  // craving slider section, roomy gaps so three sliders with their live
  // descriptor labels never read as one dense block
  sliderSection: {
    paddingHorizontal: spacing['padding-horizontal'],
    gap: spacing.xl,
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
