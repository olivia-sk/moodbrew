/**
 * screens/Home.tsx
 * figma node 19:23 "home / shelf view"
 *
 * layout from figma:
 * - status bar: 0,0 390x61
 * - date + greeting: x=16 y=77 w=110 h=50
 * - settings icon: x=344 y=77 ~30x30
 * - frame1 (shelf + cards): x=16 y=161 w=358 h=549
 *   - shelf container: y=0 w=358 h=314
 *     - "my tea collection" label: y=0 h=23
 *     - shelf image: y=47 w=358 h=267
 *       - slot rows inside: frame2 at y=98,177,253 each w=272 x=43
 *   - feature cards row: y=346 w=358 h=203
 * - nav bar: y=753 h=61
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { colors, fonts, fontSize, spacing } from '../theme';
import { useAuth } from '../context/AuthContext';
import NavBar, { NavTab } from '../components/NavBar/NavBar';
import FeatureCard from '../components/FeatureCard/FeatureCard';
import SettingsIcon from '../components/SettingsIcon/SettingsIcon';
import { SLOT_INSET, SLOT_ROW_TOPS } from '../styles/home';

// assets
const shelfImg  = require('../assets/images/shelf.png');
const tinImg    = require('../assets/images/tin.png');
const kettleImg = require('../assets/images/kettle.png');

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
}

export default function HomeScreen({ onSettingsPress, onPantryPress, onMoodInputPress }: Props) {
  const [activeTab] = useState<NavTab>('home');
  const { userName } = useAuth();
  const today = new Date();

  const handleTabPress = (tab: NavTab) => {
    if (tab === 'pantry') onPantryPress();
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors['light-100']} />

      <View style={s.page}>

        {/* date + greeting row */}
        <View style={s.topRow}>
          <View style={s.greetingBlock}>
            <Text style={s.date}>{formatDate(today)}</Text>
            <Text style={s.greeting}>{greeting()}{'\n'}{userName.toUpperCase()}</Text>
          </View>
          <TouchableOpacity style={s.settingsBtn} activeOpacity={0.7} onPress={onSettingsPress}>
            <SettingsIcon size={24} color={colors['brand-text-100']} />
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
                <View style={s.slot} />
                <View style={s.slotGap} />
                <View style={s.slot} />
                <View style={s.slotGap} />
                <View style={s.slot} />
                <View style={s.slotGap} />
                <View style={s.slot} />
              </View>
            ))}
          </ImageBackground>
        </View>

        {/* feature cards */}
        <View style={s.featureRow}>
          <FeatureCard
            title={'Discovery\nMode'}
            image={tinImg}
            width="44%"
            imageWidthPct="45%"
            imageAspectRatio={55 / 72}
            imageRight="8%"
          />
          <FeatureCard
            title="Brew by Mood"
            image={kettleImg}
            width="50%"
            imageWidthPct="58%"
            imageAspectRatio={102 / 77}
            imageRight="4%"
            onPress={onMoodInputPress}
          />
        </View>

      </View>

      <NavBar activeTab={activeTab} onPress={handleTabPress} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors['light-100'],
  },

  // full page with 16px side padding
  page: {
    flex: 1,
    paddingHorizontal: spacing['padding-horizontal'],
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

  // shelf section
  shelfSection: {
    marginTop: spacing.xl,
    gap: spacing.md,
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

  // slot rows absolutely positioned inside shelf image
  slotRow: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
  },
  // each slot: w=50 h=40 with 24px gaps between them
  slot: {
    width: 50,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 3,
  },
  slotGap: {
    width: 24,
  },

  // feature cards row
  featureRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    marginTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
});
