/**
 * screens/SignIn.tsx
 * Figma node 51:364 "sign in"
 *
 * Existing users sign in with email + password.
 * "New here? Sign up" navigates to the SignUp flow.
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
import { colors } from '../theme';
import { authStyles as s } from '../styles/auth';
import { supabase } from '../lib/supabase';

interface Props {
  /** Called after a successful sign-in */
  onSuccess:     () => void;
  /** Navigate to the sign-up flow */
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
      <StatusBar barStyle="dark-content" backgroundColor={colors['light-100']} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={s.content}>

          {/* "Mood Brew" wordmark — centred in top half */}
          <View style={s.topSection}>
            <Text style={s.wordmark}>Mood Brew</Text>
          </View>

          {/* Form + CTA — bottom of screen */}
          <View style={s.bottomSection}>

            <View style={s.form}>
              <TextInput
                style={s.input}
                placeholder="Email"
                placeholderTextColor={colors['brand-text-200']}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
              <TextInput
                style={s.input}
                placeholder="Password"
                placeholderTextColor={colors['brand-text-200']}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={handleSignIn}
              />
              <TouchableOpacity onPress={handleForgotPassword} activeOpacity={0.7}>
                <Text style={s.forgotLink}>Forgot password</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={s.primaryBtn}
              activeOpacity={0.85}
              onPress={handleSignIn}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color={colors['light-100']} />
                : <Text style={s.primaryBtnText}>Sign in</Text>
              }
            </TouchableOpacity>

            <View style={s.footerRow}>
              <Text style={s.footerMuted}>New here?</Text>
              <TouchableOpacity onPress={onSignUpPress} activeOpacity={0.7}>
                <Text style={s.footerLink}>Sign up</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
