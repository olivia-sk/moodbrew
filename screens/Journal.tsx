/**
 * screens/Journal.tsx
 * the journal archive tab, a chronological feed of every tasting
 * session the drinker has logged. each card shows the tea name, the
 * mood inputs from that session, the diary scribble, and a compact
 * read only display of the two sensory sliders.
 */
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, fontSize, spacing } from '../theme';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../lib/toast';
import { fetchJournalEntries, JournalEntry } from '../lib/tastingLog';
import NavBar, { NavTab } from '../components/NavBar/NavBar';
import PressableScale from '../components/PressableScale/PressableScale';
import FadeIn from '../components/FadeIn/FadeIn';

interface Props {
  onHomePress: () => void;
  onPantryPress: () => void;
  onProfilePress: () => void;
}

function formatEntryDate(iso: string): string {
  const d = new Date(iso);
  return d
    .toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    .toUpperCase();
}

// a fixed track with a dot resting at the logged value, purely visual
function SensorySlider({
  value,
  leftLabel,
  rightLabel,
}: {
  value: number;
  leftLabel: string;
  rightLabel: string;
}) {
  const clamped = Math.min(1, Math.max(0, value));
  return (
    <View style={s.sliderBlock}>
      <View style={s.sliderTrack}>
        <View style={[s.sliderDot, { left: `${clamped * 100}%` }]} />
      </View>
      <View style={s.sliderLabels}>
        <Text style={s.sliderLabel}>{leftLabel}</Text>
        <Text style={s.sliderLabel}>{rightLabel}</Text>
      </View>
    </View>
  );
}

function JournalCard({ entry }: { entry: JournalEntry }) {
  return (
    <PressableScale style={s.card}>
      <View style={s.cardHeader}>
        <Text style={s.cardTitle}>{entry.teaName}</Text>
        <Text style={s.cardDate}>{formatEntryDate(entry.createdAt)}</Text>
      </View>

      {entry.moodTags.length > 0 && (
        <View style={s.tagRow}>
          {entry.moodTags.map((tag) => (
            <View key={tag} style={s.tag}>
              <Text style={s.tagText}>{tag.toUpperCase()}</Text>
            </View>
          ))}
        </View>
      )}

      {entry.moodAfter.length > 0 && (
        <View style={s.moodAfterBlock}>
          <Text style={s.moodAfterLabel}>MOOD AFTER TEA</Text>
          <View style={s.tagRow}>
            {entry.moodAfter.map((mood) => (
              <View key={mood} style={[s.tag, s.moodAfterTag]}>
                <Text style={[s.tagText, s.moodAfterTagText]}>{mood.toUpperCase()}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {!!entry.notes && <Text style={s.notes}>{entry.notes}</Text>}

      <View style={s.sliders}>
        <SensorySlider value={entry.bitterSweet} leftLabel="BITTER" rightLabel="SWEET" />
        <SensorySlider value={entry.earthyFloral} leftLabel="EARTHY" rightLabel="FLORAL" />
      </View>
    </PressableScale>
  );
}

export default function JournalScreen({ onHomePress, onPantryPress, onProfilePress }: Props) {
  const { user } = useAuth();
  const [activeTab] = useState<NavTab>('journal');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    fetchJournalEntries(user.id)
      .then((rows) => {
        if (!mounted) return;
        setEntries(rows);
        setLoading(false);
      })
      .catch(() => {
        if (!mounted) return;
        setLoading(false);
        showToast('Could not load your journal');
      });
    return () => { mounted = false; };
  }, [user]);

  const handleTabPress = (tab: NavTab) => {
    if (tab === 'home') onHomePress();
    if (tab === 'pantry') onPantryPress();
    if (tab === 'profile') onProfilePress();
  };

  return (
    <View style={s.root}>
      <SafeAreaView style={s.safe}>
        <StatusBar barStyle="dark-content" backgroundColor={colors['light-200']} />

        <View style={s.frame}>
          <View style={s.header}>
            <Text style={s.title}>Journal</Text>
            <Text style={s.subtitle}>Tasting archive</Text>
          </View>

          {loading ? (
            <View style={s.emptyState}>
              <ActivityIndicator color={colors['accent-olive']} />
            </View>
          ) : entries.length === 0 ? (
            <View style={s.emptyState}>
              <Text style={s.emptyText}>
                no tastings logged yet. brew something and your notes will live here.
              </Text>
            </View>
          ) : (
            <ScrollView
              style={s.scroll}
              contentContainerStyle={s.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {entries.map((entry, index) => (
                // cards rise in one after another, the stagger caps out so a
                // long archive never keeps the reader waiting
                <FadeIn key={entry.id} delay={Math.min(index, 6) * 70}>
                  <JournalCard entry={entry} />
                </FadeIn>
              ))}
            </ScrollView>
          )}
        </View>

        <NavBar activeTab={activeTab} onPress={handleTabPress} />
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors['light-200'],
  },
  safe: {
    flex: 1,
  },
  frame: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: spacing.lg,
  },

  header: {
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: fontSize.h1,
    color: colors['accent-olive'],
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: fonts.mono,
    fontSize: fontSize['mono-small'],
    color: colors['brand-text-200'],
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  scroll: {
    flex: 1,
  },
  scrollContent: {
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },

  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors['dark-100-o20'],
    backgroundColor: colors['light-100'],
    borderRadius: 4,
    padding: spacing['card-padding'],
    gap: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  cardTitle: {
    flex: 1,
    fontFamily: fonts.serif,
    fontSize: fontSize.h3,
    color: colors['brand-text-100'],
    letterSpacing: -0.3,
  },
  cardDate: {
    fontFamily: fonts.mono,
    fontSize: fontSize['mono-small'],
    color: colors['brand-text-200'],
    letterSpacing: 0.5,
    paddingTop: 4,
  },

  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  // rounded squares like every other chip and button in the app
  tag: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors['dark-100-o20'],
    borderRadius: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  tagText: {
    fontFamily: fonts.mono,
    fontSize: fontSize['mono-small'],
    color: colors['light-500'],
    letterSpacing: 1,
  },

  notes: {
    fontFamily: fonts.mono,
    fontSize: fontSize['body-small'],
    color: colors['brand-text-100'],
    lineHeight: fontSize['body-small'] * 1.6,
  },

  // the "mood after tea" check-in chips, olive to set them apart from
  // the flavour tags above
  moodAfterBlock: {
    gap: spacing.sm,
  },
  moodAfterLabel: {
    fontFamily: fonts.mono,
    fontSize: fontSize['mono-small'],
    color: colors['brand-text-200'],
    letterSpacing: 1,
  },
  moodAfterTag: {
    borderColor: colors['accent-olive'],
  },
  moodAfterTagText: {
    color: colors['accent-olive'],
  },

  sliders: {
    gap: spacing.lg,
  },
  sliderBlock: {
    gap: spacing.sm,
  },
  sliderTrack: {
    height: 2,
    backgroundColor: colors['light-300'],
    borderRadius: 1,
  },
  sliderDot: {
    position: 'absolute',
    top: -4,
    marginLeft: -5,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors['accent-olive'],
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabel: {
    fontFamily: fonts.mono,
    fontSize: fontSize['mono-small'],
    color: colors['brand-text-200'],
    letterSpacing: 1,
  },

  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['2xl'],
  },
  emptyText: {
    fontFamily: fonts.mono,
    fontSize: fontSize['body-small'],
    color: colors['brand-text-200'],
    textAlign: 'center',
    lineHeight: fontSize['body-small'] * 1.6,
  },
});
