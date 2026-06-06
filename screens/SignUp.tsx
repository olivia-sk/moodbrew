/**
 * screens/SignUp.tsx
 * Email + password sign-up — same visual design as SignIn (Figma 51:364)
 * adapted for account creation. After sign-up the user proceeds to the
 * Name screen to set their display name.
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
  /** Called after a successful sign-up — navigate to Name screen */
  onSuccess:     () => void;
  /** Navigate back to Sign In */
  onSignInPress: () => void;
}

export default function SignUpScreen({ onSuccess, onSignInPress }: Props) {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSignUp = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email:    email.trim(),
      password,
    });
    setLoading(false);
    if (error) {
      Alert.alert('Sign up failed', error.message);
    } else {
      // Account created — move to name collection
      onSuccess();
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

          {/* Wordmark */}
          <View style={s.topSection}>
            <Text style={s.wordmark}>Mood Brew</Text>
          </View>

          {/* Form */}
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
                onSubmitEditing={handleSignUp}
              />
            </View>

            <TouchableOpacity
              style={s.primaryBtn}
              activeOpacity={0.85}
              onPress={handleSignUp}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color={colors['light-100']} />
                : <Text style={s.primaryBtnText}>Create account</Text>
              }
            </TouchableOpacity>

            <View style={s.footerRow}>
              <Text style={s.footerMuted}>Already have an account?</Text>
              <TouchableOpacity onPress={onSignInPress} activeOpacity={0.7}>
                <Text style={s.footerLink}>Sign in</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
