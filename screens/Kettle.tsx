// screens/Kettle.tsx
// figma nodes:
//   77:1168 "the kettle during brewing" (state 1: overview card)
//   218:459 "timer" (state 2: countdown)
//
// state 1 layout (77:1168, same card as match card):
// - back button: x=16 y=80
// - card01: x=16 y=150 w=358 h=480 (same stacked card as match card)
//   - tea name + #num: x=20 y=48 w=318 h=23
//   - brew specs field: y=119
//   - caffeine level: y=197
//   - flavour notes: y=275
// - "start timer" button: x=16 y=680 h=57
//
// state 2 layout (218:459):
// - back button
// - centered box: x=16 y=150 w=358 h=480 with "brewing your mood" + [timer]
// - "skip to pairings" button: y=680 h=57
import React, { useEffect, useRef, useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, fontSize, spacing } from '../theme';
import CardStack, { cardNumberFor } from '../components/CardStack/CardStack';
import PressableScale from '../components/PressableScale/PressableScale';
import { formatCountdown, parseBrewSeconds } from '../lib/brewTimer';
import { formatCaffeineMg } from '../lib/format';
import { TeaStoryResult } from '../lib/teaStory';
import { Tea } from '../lib/types';

type Phase = 'overview' | 'brewing';

interface Props {
  tea: Tea;
  story: TeaStoryResult;
  onBack: () => void;
  // called once brewing finishes or the user skips
  onSkipToPairings: (tea: Tea, story: TeaStoryResult) => void;
}

export default function KettleScreen({ tea, story, onBack, onSkipToPairings }: Props) {
  const [phase, setPhase] = useState<Phase>('overview');
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTicking = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleStartTimer = () => {
    setSecondsRemaining(parseBrewSeconds(tea.Traditional_Brew_Specs));
    setPhase('brewing');
  };

  const handleSkipToPairings = () => {
    clearTicking();
    onSkipToPairings(tea, story);
  };

  const handleBack = () => {
    if (phase === 'brewing') {
      // step back to the overview rather than leaving the kettle flow entirely
      clearTicking();
      setPhase('overview');
    } else {
      onBack();
    }
  };

  useEffect(() => {
    if (phase !== 'brewing') return;
    intervalRef.current = setInterval(() => {
      setSecondsRemaining((current) => current - 1);
    }, 1000);
    return clearTicking;
  }, [phase]);

  useEffect(() => {
    if (phase === 'brewing' && secondsRemaining <= 0) {
      clearTicking();
      onSkipToPairings(tea, story);
    }
  }, [phase, secondsRemaining]);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors['light-100']} />

      <View style={s.page}>

        {/* back button */}
        <TouchableOpacity style={s.backRow} activeOpacity={0.7} onPress={handleBack}>
          <Text style={s.backArrow}>←</Text>
          <Text style={s.backLabel}>back</Text>
        </TouchableOpacity>

        {phase === 'overview' ? (
          <>
            {/* state 1: card with brew specs */}
            <View style={s.cardSpacer} />
            <CardStack>
              <View style={s.cardHeaderRow}>
                <Text style={s.heroTitle}>{tea.Name}</Text>
                <Text style={s.cardNumber}>{cardNumberFor(tea.Name)}</Text>
              </View>

              <View style={s.field}>
                <Text style={s.fieldLabel}>Brew specs</Text>
                {tea.Traditional_Brew_Specs.split(',').map((spec, index) => (
                  <Text key={index} style={s.fieldValue}>
                    {index + 1}. {spec.trim()}
                  </Text>
                ))}
              </View>

              <View style={s.field}>
                <Text style={s.fieldLabel}>Caffeine level</Text>
                <Text style={s.fieldValue}>{formatCaffeineMg(tea.Caffeine_Level)}</Text>
              </View>

              <View style={s.field}>
                <Text style={s.fieldLabel}>Flavour notes</Text>
                <Text style={s.fieldValue}>{tea.Raw_Flavor_Notes}</Text>
              </View>
            </CardStack>

            <View style={s.buttons}>
              <PressableScale style={s.actionBtn} onPress={handleStartTimer}>
                <Text style={s.actionBtnText}>Start timer</Text>
              </PressableScale>

              {/* invisible spacer the same size as the match card shuffle row, so
                  start timer lands at the exact same spot as start brewing */}
              <View style={s.shuffleRowSpacer} pointerEvents="none">
                <Text style={s.shuffleLabelSpacer}>Shuffle</Text>
              </View>
            </View>
          </>
        ) : (
          <>
            {/* state 2: countdown timer box */}
            <View style={s.timerBox}>
              <Text style={s.timerHeading}>brewing your mood</Text>
              <Text style={s.timerClock}>{formatCountdown(secondsRemaining)}</Text>
            </View>

            <View style={s.buttonArea}>
              <PressableScale style={s.actionBtn} onPress={handleSkipToPairings}>
                <Text style={s.actionBtnText}>Skip to pairings</Text>
              </PressableScale>
            </View>
          </>
        )}

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

  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },

  // gap between back button and the card, matches the match card screen
  cardSpacer: {
    height: spacing['3xl'],
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

  // card header: tea name + card number
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

  // field rows for brew specs, caffeine, flavour notes
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
    lineHeight: fontSize['body-small'] * 1.6,
  },

  // timer box: figma frame5 at y=150 w=358 h=480, centred content
  timerBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors['light-400'],
    borderRadius: 14,
    backgroundColor: colors['light-100'],
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  timerHeading: {
    fontFamily: fonts.serif,
    fontSize: fontSize.h2,
    color: colors['accent-olive'],
    letterSpacing: -0.3,
  },
  timerClock: {
    fontFamily: fonts.mono,
    fontSize: fontSize.h1,
    color: colors['brand-text-100'],
    letterSpacing: 1,
    // digits keep a fixed width so the countdown never jitters sideways
    fontVariant: ['tabular-nums'],
  },

  // button area pinned at bottom, used by the brewing state's skip button
  buttonArea: {
    paddingBottom: spacing.xl,
    marginTop: 'auto',
  },

  // overview state buttons, matches the match card screen's buttons block
  // exactly so start timer sits at the same spot as start brewing
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

  // invisible, matches the match card shuffle row's footprint exactly
  shuffleRowSpacer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    opacity: 0,
  },
  shuffleLabelSpacer: {
    fontFamily: fonts.mono,
    fontSize: fontSize['body-small'],
    letterSpacing: 0.5,
  },
});
