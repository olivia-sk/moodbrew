/**
 * screens/Settings.tsx
 * Accessible from the gear icon on the Home screen.
 * Shows the logged-in user's info and a Sign out button.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { colors, spacing, fontSize, fonts } from '../theme';
import { useAuth } from '../context/AuthContext';

interface Props {
  onBack: () => void;
}

export default function SettingsScreen({ onBack }: Props) {
  const { user, userName, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          setSigningOut(true);
          await signOut();
          // App.tsx's onAuthStateChange listener handles redirect to Welcome
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors['light-100']} />

      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity onPress={onBack} activeOpacity={0.7} style={s.backBtn}>
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>SETTINGS</Text>
        {/* Spacer to keep title centred */}
        <View style={s.backBtn} />
      </View>

      <View style={s.content}>

        {/* ── Account info ── */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>ACCOUNT</Text>

          <View style={s.card}>
            <View style={s.row}>
              <Text style={s.rowLabel}>Name</Text>
              <Text style={s.rowValue} numberOfLines={1}>
                {userName || '—'}
              </Text>
            </View>

            <View style={s.divider} />

            <View style={s.row}>
              <Text style={s.rowLabel}>Email</Text>
              <Text style={s.rowValue} numberOfLines={1}>
                {user?.email ?? '—'}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Sign out ── */}
        <View style={s.section}>
          <TouchableOpacity
            style={s.signOutBtn}
            activeOpacity={0.85}
            onPress={handleSignOut}
            disabled={signingOut}
          >
            {signingOut
              ? <ActivityIndicator color={colors['light-100']} />
              : <Text style={s.signOutText}>Sign out</Text>
            }
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {
    flex:            1,
    backgroundColor: colors['light-100'],
  },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: spacing['padding-horizontal'],
    paddingTop:        spacing.lg,
    paddingBottom:     spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors['light-300'],
  },
  backBtn: {
    width:          40,
    alignItems:     'flex-start',
    justifyContent: 'center',
  },
  backArrow: {
    fontFamily: fonts.sans,
    fontSize:   fontSize['body-large'],
    color:      colors['brand-text-100'],
  },
  headerTitle: {
    fontFamily:    fonts.mono,
    fontSize:      fontSize.mono,
    color:         colors['brand-text-100'],
    letterSpacing: 1,
  },

  // ── Content ───────────────────────────────────────────────────────────────
  content: {
    flex:              1,
    paddingHorizontal: spacing['padding-horizontal'],
    paddingTop:        spacing['2xl'],
    gap:               spacing['2xl'],
  },

  // ── Section ───────────────────────────────────────────────────────────────
  section: {
    gap: spacing.sm,
  },
  sectionLabel: {
    fontFamily:    fonts.mono,
    fontSize:      fontSize['mono-small'],
    color:         colors['brand-text-200'],
    letterSpacing: 1,
  },

  // ── Info card ─────────────────────────────────────────────────────────────
  card: {
    borderWidth:  1,
    borderColor:  colors['light-300'],
    borderRadius: spacing.xs,
    overflow:     'hidden',
  },
  row: {
    flexDirection:     'row',
    justifyContent:    'space-between',
    alignItems:        'center',
    paddingVertical:   spacing.lg,
    paddingHorizontal: spacing.xl,
    backgroundColor:   colors['light-100'],
  },
  rowLabel: {
    fontFamily: fonts.sans,
    fontSize:   fontSize['body-small'],
    color:      colors['brand-text-200'],
  },
  rowValue: {
    fontFamily: fonts.sans,
    fontSize:   fontSize['body-small'],
    color:      colors['brand-text-100'],
    maxWidth:   '65%',
    textAlign:  'right',
  },
  divider: {
    height:          1,
    backgroundColor: colors['light-300'],
  },

  // ── Sign out button ───────────────────────────────────────────────────────
  signOutBtn: {
    backgroundColor: colors['dark-100'],
    borderRadius:    spacing.xs,
    paddingVertical: spacing.xl,
    alignItems:      'center',
    justifyContent:  'center',
  },
  signOutText: {
    fontFamily: fonts.sans,
    fontSize:   fontSize['body-small'],
    color:      colors['light-100'],
  },
});
