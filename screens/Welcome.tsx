/**
 * screens/Welcome.tsx
 * Landing screen — Figma node 47:307 "sign up"
 *
 * Layout: "Mood Brew" wordmark centred in the top section,
 * three auth buttons stacked at the bottom.
 *
 * Google / Apple OAuth stubs are UI-complete; wire them up via
 * supabase.auth.signInWithOAuth({ provider: 'google' | 'apple' })
 * once you have the OAuth apps configured in your Supabase dashboard.
 */
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { colors } from '../theme';
import { authStyles as s } from '../styles/auth';

interface Props {
  onEmailPress: () => void;
}

export default function WelcomeScreen({ onEmailPress }: Props) {
  const handleOAuthSoon = () =>
    Alert.alert('Coming soon', 'Google and Apple sign-in will be available in a future update.');

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors['light-100']} />

      <View style={s.content}>

        {/* "Mood Brew" — centred vertically in the top section */}
        <View style={s.topSection}>
          <Text style={s.wordmark}>Mood Brew</Text>
        </View>

        {/* Auth options — bottom of screen */}
        <View style={s.bottomSection}>
          <TouchableOpacity
            style={s.primaryBtn}
            activeOpacity={0.85}
            onPress={handleOAuthSoon}
          >
            <Text style={s.primaryBtnText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.primaryBtn}
            activeOpacity={0.85}
            onPress={handleOAuthSoon}
          >
            <Text style={s.primaryBtnText}>Continue with Apple</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.outlineBtn}
            activeOpacity={0.85}
            onPress={onEmailPress}
          >
            <Text style={s.outlineBtnText}>Continue with Email</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}
