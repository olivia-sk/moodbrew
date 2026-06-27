/**
 * screens/SignIn.tsx
 * figma node 51:364 "sign in"
 *
 * existing users sign in with email + password.
 * "new here? sign up" navigates to the sign up flow.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { authStyles as s } from '../styles/auth';
import { supabase } from '../lib/supabase';
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
    <SafeAreaView className={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View className={s.content}>

          {/* wordmark + doodle centred in top half */}
          <View className={s.topSection}>
            <Text className={s.wordmark}>Mood Brew</Text>
            <MoodBrewDoodle width={160} height={116} />
          </View>

          {/* form + cta at the bottom */}
          <View className={s.bottomSection}>

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
              <TouchableOpacity onPress={handleForgotPassword} activeOpacity={0.7}>
                <Text className={s.forgotLink}>Forgot password</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              className={s.primaryBtn}
              activeOpacity={0.85}
              onPress={handleSignIn}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#FFFFFF" />
                : <Text className={s.primaryBtnText}>Sign in</Text>
              }
            </TouchableOpacity>

            <View className={s.footerRow}>
              <Text className={s.footerMuted}>New here?</Text>
              <TouchableOpacity onPress={onSignUpPress} activeOpacity={0.7}>
                <Text className={s.footerLink}>Sign up</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
