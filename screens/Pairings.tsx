// screens/Pairings.tsx
// figma node 217:304 "pairings & tasting journal"
//
// layout from figma (390x1362, scrollable):
// - status bar: y=0 h=61
// - back button: x=16 y=80 h=36
// - "your brew is ready." serif title: x=98 y=130 w=195 h=23 (centered)
// - pairings card: x=16 y=203 w=358 h=360
//   - "pairings" label: x=24 y=48
//   - song row: x=24 y=91 w=310 h=96 (label + spotify embed)
//   - snack row: x=24 y=219 w=310 h=31
//   - scent row: x=24 y=282 w=310 h=31
// - tasting notes card: x=16 y=583 w=358 h=405
//   - "tasting notes" label: x=24 y=48
//   - bitter/sweet slider: y=91
//   - earthy/floral slider: y=153
//   - flavours section: y=230
//     - chips: w=95 each, 3-col
// - thoughts card: x=16 y=1007 w=358 h=168
//   - "thoughts" label: x=24 y=48
//   - text input: x=24 y=91
// - "log to my shelf" button: x=16 y=1225 w=358 h=57
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { colors, fonts, fontSize, spacing } from '../theme';
import GradientSlider from '../components/GradientSlider/GradientSlider';
import { useAuth } from '../context/AuthContext';
import { logTastingSession } from '../lib/tastingLog';
import { TeaStoryResult } from '../lib/teaStory';
import { Tea } from '../lib/types';

const FLAVOUR_OPTIONS = ['Fruity', 'Caramel', 'Nutty', 'Astringent'];

interface Props {
  tea: Tea;
  story: TeaStoryResult;
  onBack: () => void;
  // called once the tasting session is logged, navigates back to the home shelf
  onDone: () => void;
}

export default function PairingsScreen({ tea, story, onBack, onDone }: Props) {
  const { user } = useAuth();

  const [bitterSweet, setBitterSweet] = useState(0.5);
  const [earthyFloral, setEarthyFloral] = useState(0.5);
  const [flavourOptions, setFlavourOptions] = useState(FLAVOUR_OPTIONS);
  const [selectedFlavours, setSelectedFlavours] = useState<string[]>([]);
  const [addingFlavour, setAddingFlavour] = useState(false);
  const [newFlavourText, setNewFlavourText] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // guards against the add flavour input firing its commit twice: pressing
  // done on the keyboard fires onSubmitEditing and then onBlur in the same
  // tick, both reading the same stale state, which used to add the typed
  // flavour to the list twice and crash on the duplicate key
  const hasConfirmedRef = useRef(false);

  const toggleFlavour = (flavour: string) => {
    setSelectedFlavours((current) =>
      current.includes(flavour)
        ? current.filter((item) => item !== flavour)
        : [...current, flavour],
    );
  };

  const handleOpenAddFlavour = () => {
    hasConfirmedRef.current = false;
    setNewFlavourText('');
    setAddingFlavour(true);
  };

  const handleConfirmNewFlavour = () => {
    // the first of onSubmitEditing or onBlur to run wins, the other is a no op
    if (hasConfirmedRef.current) return;
    hasConfirmedRef.current = true;
    const trimmed = newFlavourText.trim();
    if (trimmed && !flavourOptions.some((o) => o.toLowerCase() === trimmed.toLowerCase())) {
      setFlavourOptions((current) => [...current, trimmed]);
      setSelectedFlavours((current) => [...current, trimmed]);
    }
    setNewFlavourText('');
    setAddingFlavour(false);
  };

  const handleLogToShelf = async () => {
    if (!user) {
      Alert.alert('Sign in required', 'Please sign in again to log this tasting.');
      return;
    }
    setSubmitting(true);
    try {
      await logTastingSession({
        userId: user.id,
        teaName: tea.Name,
        bitterSweet,
        earthyFloral,
        flavors: selectedFlavours,
        notes: notes.trim(),
      });
      onDone();
    } catch (error) {
      Alert.alert('Could not save this tasting', (error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors['light-100']} />

      {/* back button: sits outside scroll */}
      <TouchableOpacity style={s.backRow} activeOpacity={0.7} onPress={onBack}>
        <Text style={s.backArrow}>←</Text>
        <Text style={s.backLabel}>back</Text>
      </TouchableOpacity>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled">

        {/* "your brew is ready." centered serif title */}
        <Text style={s.title}>Your Brew is Ready.</Text>

        {/* pairings card */}
        <View style={s.card}>
          <Text style={s.cardLabel}>Pairings</Text>

          <View style={s.field}>
            <Text style={s.fieldLabel}>Song</Text>
            <WebView
              style={s.spotifyEmbed}
              source={{ uri: `https://open.spotify.com/embed/track/${story.trackId}` }}
              allow="encrypted-media"
            />
          </View>

          <View style={s.field}>
            <Text style={s.fieldLabel}>Snack</Text>
            <Text style={s.fieldValue}>{story.snack_pairing}</Text>
          </View>
        </View>

        {/* tasting notes card */}
        <View style={s.card}>
          <Text style={s.cardLabel}>Tasting Notes</Text>

          <GradientSlider value={bitterSweet} onChange={setBitterSweet} leftLabel="Bitter" rightLabel="Sweet" />
          <GradientSlider value={earthyFloral} onChange={setEarthyFloral} leftLabel="Earthy" rightLabel="Floral" />

          <View style={s.field}>
            <Text style={s.subLabel}>Flavours</Text>
            <View style={s.chipsWrap}>
              {flavourOptions.map((flavour) => {
                const active = selectedFlavours.includes(flavour);
                return (
                  <TouchableOpacity
                    key={flavour}
                    style={[s.chip, active && s.chipActive]}
                    activeOpacity={0.8}
                    onPress={() => toggleFlavour(flavour)}
                  >
                    <Text style={[s.chipText, active && s.chipTextActive]}>{flavour}</Text>
                  </TouchableOpacity>
                );
              })}

              {addingFlavour ? (
                <View style={s.addChip}>
                  <TextInput
                    style={s.addChipInput}
                    value={newFlavourText}
                    onChangeText={setNewFlavourText}
                    placeholder="type a flavour"
                    placeholderTextColor={colors['brand-text-200']}
                    autoFocus
                    autoCapitalize="words"
                    returnKeyType="done"
                    onSubmitEditing={handleConfirmNewFlavour}
                    onBlur={handleConfirmNewFlavour}
                  />
                </View>
              ) : (
                <TouchableOpacity style={s.addChip} activeOpacity={0.8} onPress={handleOpenAddFlavour}>
                  <Text style={s.chipText}>+ Add</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* thoughts card */}
        <View style={s.card}>
          <Text style={s.cardLabel}>Thoughts</Text>
          <TextInput
            style={s.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Scribble down a sentence about your day so far..."
            placeholderTextColor={colors['brand-text-200']}
            multiline
          />
        </View>

        {/* log to shelf button */}
        <TouchableOpacity
          style={s.actionBtn}
          activeOpacity={0.85}
          onPress={handleLogToShelf}
          disabled={submitting}
        >
          {submitting
            ? <ActivityIndicator color={colors['light-100']} />
            : <Text style={s.actionBtnText}>Log to my shelf</Text>
          }
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors['light-100'],
  },

  // back row outside scroll
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

  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing['padding-horizontal'],
    paddingTop: spacing.lg,
    paddingBottom: spacing['2xl'],
    gap: spacing.lg,
  },

  // "your brew is ready." centered serif title
  title: {
    fontFamily: fonts.serif,
    fontSize: fontSize.h1,
    color: colors['accent-olive'],
    letterSpacing: -0.5,
    textAlign: 'center',
  },

  // section cards: bordered rounded containers
  card: {
    borderWidth: 1,
    borderColor: colors['light-400'],
    borderRadius: 14,
    backgroundColor: colors['light-100'],
    padding: spacing.xl,
    gap: spacing.xl,
  },
  cardLabel: {
    fontFamily: fonts.mono,
    fontSize: fontSize['body-small'],
    color: colors['brand-text-100'],
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // field label + value pairs
  field: {
    gap: spacing.xs,
  },
  fieldLabel: {
    fontFamily: fonts.mono,
    fontSize: fontSize['mono-small'],
    color: colors['brand-text-200'],
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  subLabel: {
    fontFamily: fonts.mono,
    fontSize: fontSize['mono-small'],
    color: colors['light-500'],
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  fieldValue: {
    fontFamily: fonts.mono,
    fontSize: fontSize['body-small'],
    color: colors['brand-text-100'],
    lineHeight: fontSize['body-small'] * 1.6,
  },

  // spotify embed
  spotifyEmbed: {
    width: '100%',
    height: 80,
    borderRadius: 12,
  },

  // flavour chips: 3 per row from figma (~95px each)
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors['light-400'],
    borderRadius: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  chipActive: {
    backgroundColor: colors['dark-100'],
    borderColor: colors['dark-100'],
  },
  chipText: {
    fontFamily: fonts.mono,
    fontSize: fontSize['body-small'],
    color: colors['brand-text-100'],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipTextActive: {
    color: colors['light-100'],
  },
  addChip: {
    borderWidth: 1,
    borderColor: colors['light-400'],
    borderStyle: 'dashed',
    borderRadius: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  addChipInput: {
    fontFamily: fonts.mono,
    fontSize: fontSize['body-small'],
    color: colors['brand-text-100'],
    minWidth: 80,
    padding: 0,
  },

  // thoughts multiline input with dashed bottom border
  notesInput: {
    fontFamily: fonts.mono,
    fontSize: fontSize['body-small'],
    color: colors['brand-text-100'],
    letterSpacing: 0.5,
    lineHeight: fontSize['body-small'] * 1.6,
    borderBottomWidth: 1,
    borderBottomColor: colors['light-400'],
    borderStyle: 'dashed',
    paddingBottom: spacing.md,
    minHeight: 64,
  },

  // log to shelf action button
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
});
