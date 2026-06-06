import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { colors, spacing, fontSize, fonts } from '../theme';
import NavBar, { NavTab } from '../components/NavBar';
import FeatureCard from '../components/FeatureCard';

// ─── Assets ───────────────────────────────────────────────────────────────────
const shelfImg   = require('../assets/images/shelf.png');
const tinImg     = require('../assets/images/tin.png');
const kettleImg  = require('../assets/images/kettle.png');
const settingsImg = require('../assets/images/settings.png');

// ─── Shelf slot rows ──────────────────────────────────────────────────────────
// 3 rows × 4 slots, slot size 50×40, gap 24, starting at x=43
// Row y positions within the 267px shelf image: 51, 130, 206
const SLOT_ROWS = [51, 130, 206];
const SLOT_COUNT = 4;
const SLOT_W = 50;
const SLOT_H = 40;
const SLOT_GAP = spacing.xl;     // 24
const SHELF_LEFT = 43;

// ─── Date helpers ─────────────────────────────────────────────────────────────
function formatDate(d: Date) {
  const day  = d.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  const mon  = d.toLocaleDateString('en-US', { month: 'long' }).toUpperCase();
  const date = d.getDate();
  return `${day}, ${mon} ${date}`;
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'GOOD MORNING,';
  if (h < 17) return 'GOOD AFTERNOON,';
  return 'GOOD EVENING,';
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const today = new Date();

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors['light-100']} />

      {/* ── Scrollable content ── */}
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <Text style={s.date}>{formatDate(today)}</Text>
            <Text style={s.greeting}>
              {greeting()}{'\n'}
              <Text style={s.name}>[NAME]</Text>
            </Text>
          </View>
          <TouchableOpacity style={s.settingsBtn} activeOpacity={0.7}>
            <Image
              source={settingsImg}
              style={s.settingsIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* ── Shelf section ── */}
        <View style={s.section}>
          <Text style={s.h1}>My Tea Collection</Text>

          {/* Shelf with slot overlays */}
          <View style={s.shelfContainer}>
            <Image source={shelfImg} style={s.shelfImage} resizeMode="cover" />
            {SLOT_ROWS.map((rowY) => (
              <View
                key={rowY}
                style={[s.slotRow, { top: rowY, left: SHELF_LEFT }]}
              >
                {Array.from({ length: SLOT_COUNT }).map((_, i) => (
                  <View key={i} style={s.slot} />
                ))}
              </View>
            ))}
          </View>
        </View>

        {/* ── Feature cards ── */}
        <View style={s.featureRow}>
          <FeatureCard
            title={'Discovery\nMode'}
            image={tinImg}
            width={148}
            imageWidth={56}
            imageHeight={72}
          />
          <FeatureCard
            title="Brew by Mood"
            image={kettleImg}
            width={189}
            imageWidth={100}
            imageHeight={77}
          />
        </View>
      </ScrollView>

      {/* ── NavBar — fixed at bottom ── */}
      <NavBar activeTab={activeTab} onPress={setActiveTab} />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const SHELF_W = 358;
const SHELF_H = 267;

const s = StyleSheet.create({
  safe: {
    flex:            1,
    backgroundColor: colors['light-100'],   // white
  },
  scroll: {
    paddingHorizontal: 16,              // matches Figma left-[16px]; keeps shelf at 358px
    paddingBottom:     spacing['3xl'],  // 48
    gap:               spacing['2xl'],  // 32
  },

  // Header
  header: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
    paddingTop:     spacing.lg,                         // 16
  },
  headerLeft: {
    gap: spacing.xs,                                    // 4
  },
  date: {
    fontFamily: fonts.mono,
    fontSize:   fontSize.mono,                          // 13
    color:      colors['brand-text-200'],               // #BDBDBD
    letterSpacing: 0.3,
  },
  greeting: {
    fontFamily: fonts.mono,
    fontSize:   fontSize.mono,                          // 13
    color:      colors['brand-text-100'],               // #121212
    letterSpacing: 0.3,
    lineHeight: fontSize.mono * 1.5,
  },
  name: {
    fontFamily: fonts.mono,
    fontSize:   fontSize.mono,
    color:      colors['brand-text-100'],
  },
  settingsBtn: {
    padding: spacing.xs,
  },
  settingsIcon: {
    width:  24,
    height: 24,
  },

  // Shelf
  section: {
    gap: spacing.xl,                                    // 24
  },
  h1: {
    fontFamily:    fonts.serif,
    fontSize:      fontSize.h1,                         // 32
    color:         colors['dark-100'],
    letterSpacing: -0.96,
    lineHeight:    fontSize.h1,
  },
  shelfContainer: {
    width:    SHELF_W,
    height:   SHELF_H,
    position: 'relative',
  },
  shelfImage: {
    position: 'absolute',
    top:      0,
    left:     0,
    right:    0,
    bottom:   0,
  },
  slotRow: {
    position:      'absolute',
    flexDirection: 'row',
    gap:           SLOT_GAP,
  },
  slot: {
    width:           SLOT_W,
    height:          SLOT_H,
    backgroundColor: colors['light-100-o20'],           // rgba(255,255,255,0.2)
  },

  // Feature cards
  featureRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
  },
});
