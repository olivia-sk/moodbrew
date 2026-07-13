/**
 * screens/SignUp.tsx
 * email and password sign up
 * after sign up the user proceeds to the name screen to set their display name.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
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
  onSuccess: () => void;
}

export default function SignUpScreen({ onSuccess }: Props) {
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

          {/* form */}
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
                onSubmitEditing={handleSignUp}
              />
            </View>

            <View className={s.btnGap}>
              <PressableScale onPress={handleSignUp} disabled={loading}>
                <View className={s.primaryBtn}>
                  {loading
                    ? <ActivityIndicator color="#FFFFFF" />
                    : <Text className={s.primaryBtnText}>Sign up</Text>
                  }
                </View>
              </PressableScale>
            </View>
          </FadeIn>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
