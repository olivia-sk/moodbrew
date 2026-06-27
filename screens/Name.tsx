/**
 * screens/Name.tsx
 * figma node 49:342 "name"
 *
 * collects the user's display name and writes it to supabase
 * user_metadata.name via updateUser(). after saving, onSuccess()
 * is called to navigate to the home screen.
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

interface Props {
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
    // persist name in supabase user_metadata, readable via session.user.user_metadata.name
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
    <SafeAreaView className={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View className={s.content}>

          <View className={s.nameTop}>
            <Text className={s.question}>What should{'\n'}we call you?</Text>
            <TextInput
              className={s.input}
              placeholder="NAME"
              placeholderTextColor="#BDBDBD"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleContinue}
            />
            <TouchableOpacity
              className={s.primaryBtn}
              activeOpacity={0.85}
              onPress={handleContinue}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#FFFFFF" />
                : <Text className={s.primaryBtnText}>Continue</Text>
              }
            </TouchableOpacity>
          </View>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
