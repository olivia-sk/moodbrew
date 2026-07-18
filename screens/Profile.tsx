/**
 * screens/Profile.tsx
 * the drinker's profile tab: name, brew stats, and the badge collection.
 * every badge is derived live from real activity (see lib/badges.ts).
 * lives on the bottom nav bar alongside home, pantry and journal.
 */
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, fontSize, spacing } from '../theme';
import { useAuth } from '../context/AuthContext';
import { fetchProfileStats, ProfileStats } from '../lib/badges';
import { formatHeaderDate, greetingForNow } from '../lib/format';
import { showToast } from '../lib/toast';
import NavBar, { NavTab } from '../components/NavBar/NavBar';
import SettingsIcon from '../components/SettingsIcon/SettingsIcon';

interface Props {
  onHomePress: () => void;
  onPantryPress: () => void;
  onJournalPress: () => void;
  onSettingsPress: () => void;
}

export default function ProfileScreen({
  onHomePress,
  onPantryPress,
  onJournalPress,
  onSettingsPress,
}: Props) {
  const { user, userName } = useAuth();
  const [activeTab] = useState<NavTab>('profile');
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchProfileStats(user.id)
      .then(setStats)
      .catch(() => showToast('Could not load your profile right now'))
      .finally(() => setLoading(false));
  }, [user]);

  const handleTabPress = (tab: NavTab) => {
    if (tab === 'home') onHomePress();
    if (tab === 'pantry') onPantryPress();
    if (tab === 'journal') onJournalPress();
  };

  const earnedCount = stats?.badges.filter((badge) => badge.earned).length ?? 0;

  return (
    <View style={s.root}>
      <SafeAreaView style={s.safe}>
        <StatusBar barStyle="dark-content" backgroundColor={colors['light-200']} />

        <View style={s.frame}>
          {/* same mono date + greeting header as the home screen */}
          <View style={s.headerRow}>
            <View style={s.header}>
              <Text style={s.date}>{formatHeaderDate()}</Text>
              <Text style={s.greeting}>
                {greetingForNow()}{'\n'}{(userName || 'tea drinker').toUpperCase()}
              </Text>
            </View>
            {/* settings lives here now instead of the home header */}
            <TouchableOpacity
              style={s.settingsBtn}
              activeOpacity={0.7}
              onPress={onSettingsPress}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <SettingsIcon size={24} color={colors['brand-text-200']} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={s.emptyState}>
              <ActivityIndicator color={colors['accent-olive']} />
            </View>
          ) : stats ? (
            <ScrollView
              style={s.scroll}
              contentContainerStyle={s.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={s.sectionLabel}>Your steeping story</Text>

              {/* steep level card with progress toward the next level */}
              <View style={s.levelCard}>
                <View style={s.levelRow}>
                  <Text style={s.levelTitle}>
                    LVL {stats.steepLevel.level} · {stats.steepLevel.title.toUpperCase()}
                  </Text>
                  <Text style={s.levelPoints}>
                    {stats.steepLevel.nextLevelPoints !== undefined
                      ? `${stats.steepLevel.points} / ${stats.steepLevel.nextLevelPoints}`
                      : `${stats.steepLevel.points} pts`}
                  </Text>
                </View>
                <View style={s.levelTrack}>
                  <View
                    style={[
                      s.levelFill,
                      { width: `${Math.round(stats.steepLevel.progress * 100)}%` },
                    ]}
                  />
                </View>
                {stats.steepLevel.nextLevelPoints !== undefined && (
                  <Text style={s.levelHint}>
                    {stats.steepLevel.nextLevelPoints - stats.steepLevel.points} points to the
                    next level — brews, custom teas and badges all count
                  </Text>
                )}
              </View>

              {/* stats strip */}
              <View style={s.statsRow}>
                <View style={s.stat}>
                  <Text style={s.statValue}>{stats.brewCount}</Text>
                  <Text style={s.statLabel}>Brews</Text>
                </View>
                <View style={s.stat}>
                  <Text style={s.statValue}>{stats.pantryCount}</Text>
                  <Text style={s.statLabel}>On shelf</Text>
                </View>
                <View style={s.stat}>
                  <Text style={s.statValue}>{stats.customTeaCount}</Text>
                  <Text style={s.statLabel}>Teas created</Text>
                </View>
              </View>

              {/* badge collection */}
              <Text style={s.sectionLabel}>
                BADGES · {earnedCount}/{stats.badges.length}
              </Text>
              <View style={s.badgeGrid}>
                {stats.badges.map((badge) => (
                  <View
                    key={badge.key}
                    style={[s.badgeCard, !badge.earned && s.badgeCardLocked]}
                  >
                    <Text style={[s.badgeTitle, !badge.earned && s.badgeTitleLocked]}>
                      {badge.title}
                    </Text>
                    <Text style={s.badgeText}>
                      {badge.earned ? badge.description : badge.hint}
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          ) : (
            <View style={s.emptyState}>
              <Text style={s.emptyText}>your profile could not be loaded</Text>
            </View>
          )}
        </View>

        <NavBar activeTab={activeTab} onPress={handleTabPress} />
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  // warm paper grey behind everything including the nav bar, matching the
  // other tab screens
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

  // generous air below the greeting so the steeping story section
  // never crowds it
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing['2xl'],
  },
  header: {
    flex: 1,
    gap: spacing.xs,
  },
  settingsBtn: {
    padding: spacing.xs,
  },
  // mono date + greeting, identical styling to the home header
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
    paddingBottom: spacing.xl,
  },

  // three number stats side by side
  statsRow: {
    flexDirection: 'row',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors['dark-100-o20'],
    borderRadius: 4,
    backgroundColor: colors['light-100'],
    marginBottom: spacing['2xl'],
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  statValue: {
    fontFamily: fonts.serif,
    fontSize: fontSize.h2,
    color: colors['brand-text-100'],
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    fontFamily: fonts.mono,
    fontSize: fontSize['mono-small'],
    color: colors['brand-text-200'],
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: spacing.xs,
  },

  sectionLabel: {
    fontFamily: fonts.mono,
    fontSize: fontSize['mono-small'],
    color: colors['brand-text-200'],
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.lg,
  },

  // steep level card with the progress bar toward the next level
  levelCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors['dark-100-o20'],
    borderRadius: 4,
    backgroundColor: colors['light-100'],
    padding: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelTitle: {
    fontFamily: fonts.mono,
    fontSize: fontSize['body-small'],
    color: colors['brand-text-100'],
    letterSpacing: 1,
  },
  levelPoints: {
    fontFamily: fonts.mono,
    fontSize: fontSize['mono-small'],
    color: colors['light-500'],
    letterSpacing: 0.5,
    fontVariant: ['tabular-nums'],
  },
  levelTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors['light-300'],
    overflow: 'hidden',
  },
  levelFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: colors['accent-olive'],
  },
  levelHint: {
    fontFamily: fonts.mono,
    fontSize: fontSize['mono-small'],
    color: colors['brand-text-200'],
    lineHeight: 16,
  },

  // two column badge grid
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  badgeCard: {
    width: '47%',
    flexGrow: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors['accent-olive'],
    borderRadius: 4,
    backgroundColor: colors['light-100'],
    padding: spacing.lg,
    gap: spacing.xs,
  },
  badgeCardLocked: {
    borderColor: colors['dark-100-o20'],
    opacity: 0.7,
  },
  badgeTitle: {
    fontFamily: fonts.serif,
    fontSize: fontSize.h3,
    color: colors['accent-olive'],
  },
  badgeTitleLocked: {
    color: colors['brand-text-200'],
  },
  badgeText: {
    fontFamily: fonts.mono,
    fontSize: fontSize['mono-small'],
    color: colors['light-500'],
    lineHeight: 16,
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
  },
});
