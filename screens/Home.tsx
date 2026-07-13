/**
 * screens/Home.tsx
 * figma node 300:850 "home / recent teas"
 *
 * layout from figma (390x844):
 * status bar, date and greeting block top left with the settings icon
 * top right, "recent teas" title, three flat shelf boards holding 12
 * slots of recently brewed teas, then the discovery mode and brew by
 * mood feature cards above the nav bar.
 *
 * the shelf is a recent brews history feed with one slot per unique
 * tea: slot 0 shows the most recently brewed tea and re brewing a tea
 * bumps it back to slot 0 instead of taking a second slot. slots with
 * no log stay empty grey placeholders.
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, fontSize, spacing } from '../theme';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../lib/toast';
import { fetchRecentBrews, RecentBrew, HOME_SHELF_SLOT_COUNT } from '../lib/recentBrews';
import NavBar, { NavTab } from '../components/NavBar/NavBar';
import FeatureCard from '../components/FeatureCard/FeatureCard';
import SettingsIcon from '../components/SettingsIcon/SettingsIcon';
import ShelfRow, { ShelfSlotData } from '../components/ShelfRow/ShelfRow';

// assets
const tinImg    = require('../assets/images/tin.png');
const kettleImg = require('../assets/images/kettle.png');

// the recent teas shelf is 3 boards of 4 slots
const SHELF_ROWS = 3;
const SLOTS_PER_ROW = HOME_SHELF_SLOT_COUNT / SHELF_ROWS;

function formatDate(d: Date): string {
  const day = d.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  const mon = d.toLocaleDateString('en-US', { month: 'long' }).toUpperCase();
  return `${day}, ${mon} ${d.getDate()}`;
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'GOOD MORNING,';
  if (h < 17) return 'GOOD AFTERNOON,';
  return 'GOOD EVENING,';
}

interface Props {
  onSettingsPress:  () => void;
  onPantryPress:    () => void;
  onJournalPress:   () => void;
  onMoodInputPress: () => void;
  onDiscoveryPress: () => void;
  // tea name of a brew logged just before navigating here, shown
  // optimistically in slot 0 until the fetch resolves
  seedBrew?: string | null;
}

export default function HomeScreen({
  onSettingsPress,
  onPantryPress,
  onJournalPress,
  onMoodInputPress,
  onDiscoveryPress,
  seedBrew,
}: Props) {
  const [activeTab] = useState<NavTab>('home');
  const { user, userName } = useAuth();
  const today = new Date();

  // chronological feed of unique teas, index 0 is the newest brew
  const [recentBrews, setRecentBrews] = useState<RecentBrew[]>([]);
  const [brewsLoaded, setBrewsLoaded] = useState(false);

  // the app remounts this screen on every navigation back to home, so a
  // fetch on mount doubles as a refresh on focus in this architecture
  useEffect(() => {
    if (!user) return;
    let mounted = true;
    fetchRecentBrews(user.id)
      .then((brews) => {
        if (!mounted) return;
        setRecentBrews(brews);
        setBrewsLoaded(true);
      })
      .catch(() => {
        if (!mounted) return;
        showToast('Could not load your recent brews');
      });
    return () => { mounted = false; };
  }, [user]);

  // until the fetch resolves, show the just logged brew in slot 0
  const shelfLabels: string[] = brewsLoaded
    ? recentBrews.map((brew) => brew.teaName)
    : (seedBrew ? [seedBrew] : []);

  const handleTabPress = (tab: NavTab) => {
    if (tab === 'pantry') onPantryPress();
    if (tab === 'journal') onJournalPress();
  };

  const slotsForRow = (rowIndex: number): ShelfSlotData[] =>
    Array.from({ length: SLOTS_PER_ROW }, (_, colIndex) => {
      const slotIndex = rowIndex * SLOTS_PER_ROW + colIndex;
      return {
        key: `slot-${slotIndex}`,
        label: shelfLabels[slotIndex] || undefined,
      };
    });

  return (
    <View style={s.root}>
      <SafeAreaView style={s.safe}>
        <StatusBar barStyle="dark-content" backgroundColor={colors['light-200']} />

        <View style={s.page}>

          {/* date and greeting row */}
          <View style={s.topRow}>
            <View style={s.greetingBlock}>
              <Text style={s.date}>{formatDate(today)}</Text>
              <Text style={s.greeting}>{greeting()}{'\n'}{userName.toUpperCase()}</Text>
            </View>
            <TouchableOpacity
              style={s.settingsBtn}
              activeOpacity={0.7}
              onPress={onSettingsPress}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <SettingsIcon size={24} color={colors['brand-text-200']} />
            </TouchableOpacity>
          </View>

          {/* recent teas shelf */}
          <View style={s.shelfSection}>
            <Text style={s.sectionTitle}>Recent Teas</Text>

            <View style={s.shelfStack}>
              {Array.from({ length: SHELF_ROWS }, (_, rowIndex) => (
                <ShelfRow key={rowIndex} slots={slotsForRow(rowIndex)} />
              ))}
            </View>
          </View>

          {/* feature cards */}
          <Text style={s.modeLabel}>Pick a mode</Text>
          <View style={s.featureRow}>
            <FeatureCard
              title={'Discovery'}
              image={tinImg}
              width="41.34%"
              height={200}
              accentColor={colors['brand-brown']}
              imageWidthPct="44%"
              imageHeightPct="47%"
              imageRight="16%"
              onPress={onDiscoveryPress}
            />
            <FeatureCard
              title="Brew by Mood"
              image={kettleImg}
              width="52.79%"
              height={200}
              accentColor={colors['accent-olive']}
              imageWidthPct="58%"
              imageHeightPct="45%"
              imageRight="6%"
              onPress={onMoodInputPress}
            />
          </View>

        </View>

        <NavBar activeTab={activeTab} onPress={handleTabPress} />
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  // warm paper grey behind everything including the nav bar
  root: {
    flex: 1,
    backgroundColor: colors['light-200'],
  },
  safe: {
    flex: 1,
  },

  // full page with 16px side padding per the figma frame
  page: {
    flex: 1,
    paddingHorizontal: 16,
  },

  // top row: greeting left, settings right, date lands at y77 in figma
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 18,
  },
  greetingBlock: {
    gap: 4,
  },
  date: {
    fontFamily: fonts.mono,
    fontSize: fontSize.mono,
    color: colors['brand-text-200'],
  },
  greeting: {
    fontFamily: fonts.mono,
    fontSize: fontSize.mono,
    color: colors['brand-text-100'],
    lineHeight: fontSize.mono * 1.5,
  },
  settingsBtn: {
    padding: spacing.xs,
  },

  // shelf section, measured off the figma frame: title at y160 and the
  // first slot row at y239
  shelfSection: {
    marginTop: spacing['2xl'],
    gap: 48,
  },
  sectionTitle: {
    fontFamily: fonts.serif,
    fontSize: fontSize.h1,
    color: colors['accent-olive'],
    letterSpacing: -0.5,
  },

  // vertical rhythm between the three shelf boards from the figma frame,
  // board tops sit 78 apart so the air between rows is 29
  shelfStack: {
    gap: 29,
  },

  // heading above the two mode cards, same voice as the recent teas
  // title, with a clear pocket of air between it and the shelf above
  modeLabel: {
    fontFamily: fonts.serif,
    fontSize: fontSize.h1,
    color: colors['accent-olive'],
    letterSpacing: -0.5,
    marginTop: 44,
  },

  // feature cards row, the cards keep their y508 start from the frame
  // with the heading sitting in the air above them
  featureRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 12,
  },
});
