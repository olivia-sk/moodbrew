/**
 * screens/Welcome.tsx
 * landing screen - figma node 47:307 "sign up"
 *
 * layout: "mood brew" wordmark + tea-tin doodle centred in the top section,
 * three auth buttons stacked at the bottom.
 *
 * google / apple oauth stubs are ui-complete; wire them up via
 * supabase.auth.signInWithOAuth({ provider: 'google' | 'apple' })
 * once you have the oauth apps configured in your supabase dashboard.
 */
import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { authStyles as s } from '../styles/auth';
import MoodBrewDoodle from '../assets/images/mood-brew.svg';

const googleIcon = require('../assets/images/google.png');
const appleIcon  = require('../assets/images/apple.png');

interface Props {
  onEmailPress: () => void;
}

export default function WelcomeScreen({ onEmailPress }: Props) {
  const handleOAuthSoon = () =>
    Alert.alert('Coming soon', 'Google and Apple sign-in will be available in a future update.');

  return (
    <SafeAreaView className={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View className={s.content}>

        {/* wordmark + doodle centred in the top section */}
        <View className={s.topSection}>
          <Text className={s.wordmark}>Mood Brew</Text>
          <MoodBrewDoodle width={160} height={116} />
        </View>

        {/* auth options at the bottom */}
        <View className={s.bottomSection}>
          <TouchableOpacity
            className={s.primaryBtnRow}
            activeOpacity={0.85}
            onPress={handleOAuthSoon}
          >
            <Image source={googleIcon} style={{ width: 18, height: 18 }} resizeMode="contain" />
            <Text className={s.primaryBtnText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={s.primaryBtnRow}
            activeOpacity={0.85}
            onPress={handleOAuthSoon}
          >
            <Image source={appleIcon} style={{ width: 16, height: 19 }} resizeMode="contain" />
            <Text className={s.primaryBtnText}>Continue with Apple</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={s.outlineBtn}
            activeOpacity={0.85}
            onPress={onEmailPress}
          >
            <Text className={s.outlineBtnText}>Continue with Email</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}
