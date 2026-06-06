import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { colors } from '../theme';
import { layout, text } from '../styles/globals';
import { homeStyles as s, SHELF_DIMS } from '../styles/home';
import NavBar, { NavTab } from '../components/NavBar';
import FeatureCard from '../components/FeatureCard';

// ─── Assets ───────────────────────────────────────────────────────────────────
const shelfImg    = require('../assets/images/shelf.png');
const tinImg      = require('../assets/images/tin.png');
const kettleImg   = require('../assets/images/kettle.png');
const settingsImg = require('../assets/images/settings.png');

// ─── Shelf slot layout (from Figma) ──────────────────────────────────────────
// 3 rows × 4 slots — y positions: 51, 130, 206 — x start: 43
const SLOT_ROWS  = [51, 130, 206];
const SLOT_COUNT = 4;
const SHELF_LEFT = 43;

// ─── Date helpers ─────────────────────────────────────────────────────────────
function formatDate(d: Date) {
  const day  = d.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  const mon  = d.toLocaleDateString('en-US', { month: 'long' }).toUpperCase();
  return `${day}, ${mon} ${d.getDate()}`;
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
    <SafeAreaView style={layout.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors['light-100']} />

      <ScrollView
        contentContainerStyle={layout.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <Text style={s.date}>{formatDate(today)}</Text>
            <Text style={s.greeting}>
              {greeting()}{'\n'}[NAME]
            </Text>
          </View>
          <TouchableOpacity style={s.settingsBtn} activeOpacity={0.7}>
            <Image source={settingsImg} style={s.settingsIcon} resizeMode="contain" />
          </TouchableOpacity>
        </View>

        {/* ── Shelf section ── */}
        <View style={s.section}>
          <Text style={text.h1}>My Tea Collection</Text>

          <View style={[s.shelfContainer, SHELF_DIMS]}>
            <Image source={shelfImg} style={s.shelfImage} resizeMode="cover" />
            {SLOT_ROWS.map((rowY) => (
              <View key={rowY} style={[s.slotRow, { top: rowY, left: SHELF_LEFT }]}>
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

      <NavBar activeTab={activeTab} onPress={setActiveTab} />
    </SafeAreaView>
  );
}
