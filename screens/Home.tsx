/**
 * screens/Home.tsx
 * figma node 298:427 "home / shelf view"
 *
 * layout from figma (390x844):
 * status bar 0,0 390x59, date and greeting block at x=16 y=77,
 * settings icon top right, "my tea collection" title at y=160,
 * shelf image at y=208 sized 358x267 with 3 rows of 4 slots,
 * feature cards at y=507 h=200, nav hairline at y=753.
 *
 * the shelf doubles as a recent brews history feed: slot 0 shows the
 * most recent tasting log and older logs fill down the line. slots
 * with no log stay empty translucent placeholders.
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
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
import { SLOT_INSET, SLOT_ROW_TOPS } from '../styles/home';

// assets
const shelfImg  = require('../assets/images/shelf.png');
const paperImg  = require('../assets/images/paper-texture.jpg');
const tinImg    = require('../assets/images/tin.png');
const kettleImg = require('../assets/images/kettle.png');

// slot indexes per visual row, slot 0 is the top left corner
const SLOT_INDEXES_BY_ROW: number[][] = [
  [0, 1, 2, 3],
  [4, 5, 6, 7],
  [8, 9, 10, 11],
];

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
  onMoodInputPress: () => void;
  // tea name of a brew logged just before navigating here, shown
  // optimistically in slot 0 until the fetch resolves
  seedBrew?: string | null;
}

export default function HomeScreen({
  onSettingsPress,
  onPantryPress,
  onMoodInputPress,
  seedBrew,
}: Props) {
  const [activeTab] = useState<NavTab>('home');
  const { user, userName } = useAuth();
  const today = new Date();

  // chronological history feed, index 0 is the newest brew
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
  };

  return (
    <View style={s.paper}>
      {/* plain absolutely filled image instead of ImageBackground: on web,
          ImageBackground measures its own size before laying out the
          background image, and inside a flex chain that measurement can
          settle on the image's natural pixel size instead of the screen,
          stretching the whole page. absoluteFill is pure css and always
          resolves against this view regardless of how it was sized */}
      <Image source={paperImg} style={StyleSheet.absoluteFill} resizeMode="cover" />
      <SafeAreaView style={s.safe}>
        <StatusBar barStyle="dark-content" backgroundColor="#F9F9F9" />

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

          {/* shelf section */}
          <View style={s.shelfSection}>
            <Text style={s.sectionTitle}>My Tea Collection</Text>

            <ImageBackground
              source={shelfImg}
              style={s.shelfImage}
              resizeMode="stretch"
            >
              {SLOT_ROW_TOPS.map((rowTop, rowIndex) => (
                <View key={rowIndex} style={[s.slotRow, { top: rowTop, left: SLOT_INSET }]}>
                  {SLOT_INDEXES_BY_ROW[rowIndex].map((slotIndex, colIndex) => (
                    <React.Fragment key={slotIndex}>
                      <View style={s.slot}>
                        {slotIndex < shelfLabels.length && !!shelfLabels[slotIndex] && (
                          <Text style={s.slotLabel} numberOfLines={2}>
                            {shelfLabels[slotIndex]}
                          </Text>
                        )}
                      </View>
                      {colIndex < 3 && <View style={s.slotGap} />}
                    </React.Fragment>
                  ))}
                </View>
              ))}
            </ImageBackground>
          </View>

          {/* feature cards */}
          <View style={s.featureRow}>
            <FeatureCard
              title={'Discovery\nMode'}
              image={tinImg}
              width="41%"
              height={240}
              accentColor={colors['brand-brown']}
              imageWidthPct="44%"
              imageHeightPct="47%"
              imageRight="16%"
            />
            <FeatureCard
              title="Brew by Mood"
              image={kettleImg}
              width="52.5%"
              height={240}
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
  // full bleed paper texture behind everything including the nav bar
  paper: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  safe: {
    flex: 1,
  },

  // full page with 16px side padding per the figma frame
  page: {
    flex: 1,
    paddingHorizontal: 16,
  },

  // top row: greeting left, settings right
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: spacing.lg,
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

  // shelf section, a touch of air between the title and the shelf
  shelfSection: {
    marginTop: spacing.xl,
    gap: 18,
  },
  sectionTitle: {
    fontFamily: fonts.serif,
    fontSize: fontSize.h1,
    color: colors['accent-olive'],
    letterSpacing: -0.5,
  },

  // shelf image: full width, figma ratio 358:267
  shelfImage: {
    width: '100%',
    aspectRatio: 358 / 267,
  },

  // slot rows absolutely positioned inside the shelf image
  slotRow: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
  },
  // each slot is 50x40 with 24px gaps, matching the figma geometry
  slot: {
    width: 50,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotGap: {
    width: 24,
  },
  slotLabel: {
    fontFamily: fonts.mono,
    fontSize: 8,
    color: colors['brand-text-100'],
    textAlign: 'center',
    paddingHorizontal: 2,
  },

  // feature cards row, fixed card height keeps the cards squarish and
  // vertical centering splits the leftover space evenly above and below
  featureRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
});
