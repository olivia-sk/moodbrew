/**
 * screens/SignUp.tsx
 * email + password sign-up - figma node 182:333.
 * after sign-up the user proceeds to the name screen to set their display name.
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
      // account created, move to name collection
      onSuccess();
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

          {/* wordmark + doodle */}
          <View className={s.topSection}>
            <Text className={s.wordmark}>Mood Brew</Text>
            <MoodBrewDoodle width={160} height={116} />
          </View>

          {/* form */}
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
                onSubmitEditing={handleSignUp}
              />
            </View>

            <TouchableOpacity
              className={s.primaryBtn}
              activeOpacity={0.85}
              onPress={handleSignUp}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#FFFFFF" />
                : <Text className={s.primaryBtnText}>Sign up</Text>
              }
            </TouchableOpacity>

            <View className={s.footerRow}>
              <Text className={s.footerMuted}>Already have an account?</Text>
              <TouchableOpacity onPress={onSignInPress} activeOpacity={0.7}>
                <Text className={s.footerLink}>Sign in</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
