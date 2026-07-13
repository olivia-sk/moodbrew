// screens/MatchCard.tsx
// figma node 21:28 "match card before brewing"
//
// layout from figma (390x844):
// - back button: x=16 y=80 h=36
// - card01: x=16 y=150 w=358 h=480
//   - tea name + #number: x=20 y=48 w=318 h=23
//   - card details: x=20 y=119 w=318 h=313
//     - origin field: y=0 h=31
//     - category field: y=78 h=31
//     - "why this tea" field: y=156 h=157
// - buttons: x=16 y=680 w=358 h=96
//   - "start brewing" btn: h=57
//   - shuffle: y=82 h=14
import React, { useEffect, useState } from 'react';
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
import Svg, { Path } from 'react-native-svg';
import { colors, fonts, fontSize, spacing } from '../theme';
import CardStack, { cardNumberFor } from '../components/CardStack/CardStack';
import { loadTeaStory, TeaStoryResult } from '../lib/teaStory';
import { shuffleTeaMatchFromPantry } from '../lib/teaMatching';
import { showToast } from '../lib/toast';
import { useAuth } from '../context/AuthContext';
import { MoodContext, Tea } from '../lib/types';

interface Props {
  tea: Tea;
  moodContext: MoodContext;
  // the story cached one level up in App, kept across navigating to the
  // kettle screen and back so popping back never refetches it
  story: TeaStoryResult | null;
  // lifts a freshly generated story up so it survives this screen unmounting
  onStoryLoaded: (story: TeaStoryResult) => void;
  // called once the shuffle button picks a new tea, the caller owns swapping
  // the matched tea and dropping the now stale cached story
  onShuffle: (tea: Tea) => void;
  onBack: () => void;
  // called once the user taps start brewing, carries everything the kettle/timer screen needs
  onStartBrewing: (story: TeaStoryResult) => void;
}

function ShuffleIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 6h4l9 12h5M3 18h4l3.5-4.5M16 6h5"
        stroke={colors['brand-text-200']}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18 3l3 3-3 3M18 15l3 3-3 3"
        stroke={colors['brand-text-200']}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default function MatchCardScreen({
  tea,
  moodContext,
  story,
  onStoryLoaded,
  onShuffle,
  onBack,
  onStartBrewing,
}: Props) {
  const { user } = useAuth();
  // only the initial generation should show a spinner, a cache hit from
  // popping back off the kettle screen renders the story immediately
  const [loading, setLoading] = useState(story === null);
  const [shuffling, setShuffling] = useState(false);

  useEffect(() => {
    // a valid story for this tea is already cached one level up, skip the network call entirely
    if (story) return;

    let cancelled = false;
    setLoading(true);
    loadTeaStory(tea, moodContext).then((result) => {
      if (!cancelled) {
        onStoryLoaded(result);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [tea, story]);

  const handleStartBrewing = () => {
    if (story) onStartBrewing(story);
  };

  const handleShuffle = async () => {
    if (!user || shuffling) return;
    setShuffling(true);
    try {
      const { tea: nextTea, usedFallback } = await shuffleTeaMatchFromPantry(user.id, tea.Name);
      if (usedFallback) {
        showToast('your pantry is empty, shuffling from the full collection');
      }
      onShuffle(nextTea);
    } catch (error) {
      Alert.alert('Could not shuffle', (error as Error).message);
    } finally {
      setShuffling(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors['light-100']} />

      <View style={s.page}>

        {/* back button: y=80 */}
        <TouchableOpacity style={s.backRow} activeOpacity={0.7} onPress={onBack}>
          <Text style={s.backArrow}>←</Text>
          <Text style={s.backLabel}>back</Text>
        </TouchableOpacity>

        {/* card01: sits at y=150 in figma, so we push it down from the back button */}
        <View style={s.cardSpacer} />
        <CardStack>
          {/* tea name row: y=48 h=23 */}
          <View style={s.cardHeaderRow}>
            <Text style={s.heroTitle}>{tea.Name}</Text>
            <Text style={s.cardNumber}>{cardNumberFor(tea.Name)}</Text>
          </View>

          {/* origin field: y=119 */}
          <View style={s.field}>
            <Text style={s.fieldLabel}>Origin</Text>
            <Text style={s.fieldValue}>{tea.Traditional_Origin}</Text>
          </View>

          {/* category field: y=197 */}
          <View style={s.field}>
            <Text style={s.fieldLabel}>Category</Text>
            <Text style={s.fieldValue}>{tea.Category}</Text>
          </View>

          {/* why this tea field: y=275 */}
          <View style={s.field}>
            <Text style={s.fieldLabel}>Why this tea</Text>
            {loading
              ? <View style={s.storyLoading}><ActivityIndicator color={colors['accent-olive']} /></View>
              : <Text style={s.storyValue}>{story?.why_this_tea}</Text>
            }
          </View>
        </CardStack>

        {/* buttons area: y=680 */}
        <View style={s.buttons}>
          <TouchableOpacity
            style={s.actionBtn}
            activeOpacity={0.85}
            onPress={handleStartBrewing}
            disabled={loading || shuffling}
          >
            {loading
              ? <ActivityIndicator color={colors['light-100']} />
              : <Text style={s.actionBtnText}>Start brewing</Text>
            }
          </TouchableOpacity>

          {/* shuffle: y=82 within buttons frame */}
          <TouchableOpacity
            style={s.shuffleRow}
            activeOpacity={0.7}
            onPress={handleShuffle}
            disabled={shuffling || loading}
          >
            {shuffling
              ? <ActivityIndicator color={colors['brand-text-200']} />
              : (
                <>
                  <ShuffleIcon />
                  <Text style={s.shuffleLabel}>Shuffle</Text>
                </>
              )
            }
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors['light-100'],
  },
  page: {
    flex: 1,
    paddingHorizontal: spacing['padding-horizontal'],
  },

  // gap between back button and the card, matches figma y=150 card start
  cardSpacer: {
    height: spacing['3xl'],
  },

  // back button
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
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

  // card header: tea name + number
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  heroTitle: {
    flex: 1,
    fontFamily: fonts.serif,
    fontSize: fontSize.h1,
    color: colors['accent-olive'],
    letterSpacing: -0.5,
  },
  cardNumber: {
    fontFamily: fonts.mono,
    fontSize: fontSize['mono-small'],
    color: colors['accent-olive'],
    letterSpacing: 0.5,
  },

  // label + value field rows
  field: {
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  fieldLabel: {
    fontFamily: fonts.mono,
    fontSize: fontSize['mono-small'],
    color: colors['brand-text-200'],
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  fieldValue: {
    fontFamily: fonts.mono,
    fontSize: fontSize['body-small'],
    color: colors['brand-text-100'],
  },
  storyValue: {
    fontFamily: fonts.mono,
    fontSize: fontSize['body-small'],
    color: colors['brand-text-100'],
    lineHeight: fontSize['body-small'] * 1.6,
  },
  storyLoading: {
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
  },

  // buttons block at the bottom
  buttons: {
    marginTop: 'auto',
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  actionBtn: {
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
  shuffleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  shuffleLabel: {
    fontFamily: fonts.mono,
    fontSize: fontSize['body-small'],
    color: colors['brand-text-200'],
    letterSpacing: 0.5,
  },
});
