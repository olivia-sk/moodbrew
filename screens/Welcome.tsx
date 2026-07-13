/**
 * screens/Welcome.tsx
 * landing screen, "sign up"
 *
 * layout: "mood brew" wordmark and tea tin doodle in the upper half,
 * three auth buttons grouped in the lower half.
 *
 * google and apple oauth stubs are ui complete; wire them up via
 * supabase.auth.signInWithOAuth({ provider: 'google' | 'apple' })
 * once the oauth apps are configured in the supabase dashboard.
 */
import React from 'react';
import {
  View,
  Text,
  Image,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authStyles as s } from '../styles/auth';
import FadeIn from '../components/FadeIn/FadeIn';
import PressableScale from '../components/PressableScale/PressableScale';
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
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View className={s.content}>

        {/* wordmark and doodle */}
        <FadeIn>
          <View className={s.topSectionWelcome}>
            <Text className={s.wordmark}>Mood Brew</Text>
            <View className={s.doodleWrap}>
              <MoodBrewDoodle width={160} height={116} />
            </View>
          </View>
        </FadeIn>

        {/* auth options grouped in the lower half */}
        <FadeIn delay={80}>
          <View className={s.welcomeButtons}>
            <PressableScale onPress={handleOAuthSoon}>
              <View className={s.primaryBtnRow}>
                <Image source={googleIcon} style={{ width: 18, height: 18 }} resizeMode="contain" />
                <Text className={s.primaryBtnText}>Continue with Google</Text>
              </View>
            </PressableScale>

            <PressableScale onPress={handleOAuthSoon}>
              <View className={s.primaryBtnRow}>
                <Image source={appleIcon} style={{ width: 16, height: 19 }} resizeMode="contain" />
                <Text className={s.primaryBtnText}>Continue with Apple</Text>
              </View>
            </PressableScale>

            <PressableScale onPress={onEmailPress}>
              <View className={s.outlineBtn}>
                <Text className={s.outlineBtnText}>Continue with Email</Text>
              </View>
            </PressableScale>
          </View>
        </FadeIn>

      </View>
    </SafeAreaView>
  );
}
