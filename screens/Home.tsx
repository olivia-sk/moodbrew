/**
 * screens/Home.tsx
 * UI structure and logic only — zero StyleSheet definitions.
 * All styles live in styles/home.ts.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { colors } from '../theme';
import { layout, text } from '../styles/globals';
import { homeStyles as s, SLOT_ROW_TOPS } from '../styles/home';
import { useAuth } from '../context/AuthContext';
import NavBar, { NavTab } from '../components/NavBar/NavBar';
import FeatureCard from '../components/FeatureCard/FeatureCard';
import SettingsIcon from '../components/SettingsIcon/SettingsIcon';

// ─── Assets ───────────────────────────────────────────────────────────────────
const shelfImg  = require('../assets/images/shelf.png');
const tinImg    = require('../assets/images/tin.png');
const kettleImg = require('../assets/images/kettle.png');

// ─── Helpers ──────────────────────────────────────────────────────────────────
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

// ─── Screen ───────────────────────────────────────────────────────────────────
interface Props {
  onSettingsPress: () => void;
}

export default function HomeScreen({ onSettingsPress }: Props) {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const { userName } = useAuth();
  const today = new Date();

  return (
    <SafeAreaView style={layout.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors['light-100']} />

      {/* s.content owns all horizontal padding — every child aligns to one grid */}
      <View style={s.content}>

        {/* ── Header ── */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <Text style={s.date}>{formatDate(today)}</Text>
            <Text style={s.greeting}>{greeting()}{'\n'}{userName.toUpperCase()}</Text>
          </View>
          <TouchableOpacity style={s.settingsBtn} activeOpacity={0.7} onPress={onSettingsPress}>
            <SettingsIcon size={24} color={colors['brand-text-100']} />
          </TouchableOpacity>
        </View>

        {/* ── Shelf section ── */}
        <View style={s.section}>
          <Text style={text.h1}>My Tea Collection</Text>

          {/*
            ImageBackground renders the shelf graphic as a true background layer.
            Its style drives width + aspectRatio so height is always proportional.
            resizeMode="stretch" fills the aspect-ratio box pixel-perfectly.
            Slot rows sit inside as absolute children — their % top values
            resolve against the ImageBackground's own height, always in sync.
          */}
          <ImageBackground
            source={shelfImg}
            style={s.shelf}
            resizeMode="stretch"
          >
            {SLOT_ROW_TOPS.map((top) => (
              <View key={top} style={[s.slotRow, { top }]}>
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

        {/* ── Feature cards ── */}
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
          />
        </View>

      </View>

      <NavBar activeTab={activeTab} onPress={setActiveTab} />
    </SafeAreaView>
  );
}
