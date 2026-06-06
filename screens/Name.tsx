/**
 * screens/Name.tsx
 * Figma node 49:342 "name"
 *
 * Collects the user's display name and writes it to Supabase
 * user_metadata.name via updateUser(). After saving, onSuccess()
 * is called to navigate to the Home screen.
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
  StyleSheet,
} from 'react-native';
import { colors, spacing } from '../theme';
import { authStyles as s } from '../styles/auth';
import { supabase } from '../lib/supabase';

interface Props {
  /** Called after name is saved — navigate to Home */
  onSuccess: () => void;
}

export default function NameScreen({ onSuccess }: Props) {
  const [name,    setName]    = useState('');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('Tell us your name', "Please enter what you'd like to be called.");
      return;
    }
    setLoading(true);
    // Persist name in Supabase user_metadata — readable via session.user.user_metadata.name
    const { error } = await supabase.auth.updateUser({
      data: { name: trimmed },
    });
    setLoading(false);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
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
        {/*
          justifyContent: 'space-between' separates the top group (question + input)
          from the Continue button, matching the Figma vertical rhythm.
        */}
        <View style={[s.content, ls.content]}>

          {/* Question + name field grouped at the top */}
          <View style={s.nameTop}>
            <Text style={s.question}>What should{'\n'}we call you?</Text>
            <TextInput
              style={s.input}
              placeholder="name"
              placeholderTextColor={colors['brand-text-200']}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleContinue}
            />
          </View>

          {/* Continue button anchored to the bottom */}
          <TouchableOpacity
            style={s.primaryBtn}
            activeOpacity={0.85}
            onPress={handleContinue}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color={colors['light-100']} />
              : <Text style={s.primaryBtnText}>Continue</Text>
            }
          </TouchableOpacity>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Local override — space-between separates top group from button
const ls = StyleSheet.create({
  content: {
    justifyContent: 'space-between',
  },
});
