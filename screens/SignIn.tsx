/**
 * screens/SignIn.tsx *
 * existing users sign in with email and password.
 * "new here? sign up" navigates to the sign up flow.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authStyles as s } from '../styles/auth';
import { supabase } from '../lib/supabase';
import FadeIn from '../components/FadeIn/FadeIn';
import PressableScale from '../components/PressableScale/PressableScale';
import MoodBrewDoodle from '../assets/images/mood-brew.svg';

interface Props {
  onSuccess:     () => void;
  onSignUpPress: () => void;
}

export default function SignInScreen({ onSuccess, onSignUpPress }: Props) {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSignIn = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email:    email.trim(),
      password,
    });
    setLoading(false);
    if (error) {
      Alert.alert('Sign in failed', error.message);
    } else {
      onSuccess();
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Enter your email', 'Type your email above then tap Forgot password.');
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Check your inbox', `A reset link was sent to ${email.trim()}.`);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View className={s.content}>

          {/* wordmark and doodle */}
          <FadeIn>
            <View className={s.topSection}>
              <Text className={s.wordmark}>Mood Brew</Text>
              <View className={s.doodleWrap}>
                <MoodBrewDoodle width={160} height={116} />
              </View>
            </View>
          </FadeIn>

          {/* form and cta */}
          <FadeIn delay={80}>
            <View className={s.form}>
              <TextInput
                className={s.input}
                placeholder="EMAIL"
                placeholderTextColor="#BDBDBD"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
              <TextInput
                className={s.input}
                placeholder="PASSWORD"
                placeholderTextColor="#BDBDBD"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={handleSignIn}
              />
            </View>

            <TouchableOpacity
              className={s.forgotWrap}
              onPress={handleForgotPassword}
              activeOpacity={0.7}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text className={s.forgotLink}>Forgot password</Text>
            </TouchableOpacity>

            <View className={s.btnGapAfterLink}>
              <PressableScale onPress={handleSignIn} disabled={loading}>
                <View className={s.primaryBtn}>
                  {loading
                    ? <ActivityIndicator color="#FFFFFF" />
                    : <Text className={s.primaryBtnText}>Sign in</Text>
                  }
                </View>
              </PressableScale>
            </View>
          </FadeIn>

          {/* footer pinned near the bottom */}
          <View className={s.footerSpacer} />
          <View className={s.footerRow}>
            <Text className={s.footerMuted}>New here?</Text>
            <TouchableOpacity
              onPress={onSignUpPress}
              activeOpacity={0.7}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text className={s.footerLink}>Sign up</Text>
            </TouchableOpacity>
          </View>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
