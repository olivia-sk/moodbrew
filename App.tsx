import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import {
  InstrumentSerif_400Regular,
  useFonts as useSerifFonts,
} from '@expo-google-fonts/instrument-serif';
import {
  IBMPlexMono_400Regular,
  useFonts as useMonoFonts,
} from '@expo-google-fonts/ibm-plex-mono';

import { supabase } from './lib/supabase';
import { AuthProvider } from './context/AuthContext';

import WelcomeScreen  from './screens/Welcome';
import SignInScreen   from './screens/SignIn';
import SignUpScreen   from './screens/SignUp';
import NameScreen     from './screens/Name';
import HomeScreen     from './screens/Home';
import SettingsScreen from './screens/Settings';

SplashScreen.preventAutoHideAsync();

// ─── Navigation state ─────────────────────────────────────────────────────────
type AppScreen = 'welcome' | 'signIn' | 'signUp' | 'name' | 'home' | 'settings';

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  // ── Fonts ──────────────────────────────────────────────────────────────────
  const [serifLoaded] = useSerifFonts({ InstrumentSerif_400Regular });
  const [monoLoaded]  = useMonoFonts({ IBMPlexMono_400Regular });
  const [sansLoaded]  = Font.useFonts({
    'FFFAcidGrotesk-Normal': require('./assets/fonts/FFFAcidGrotesk-Normal.ttf'),
    'FFFAcidGrotesk-Medium': require('./assets/fonts/FFFAcidGrotesk-Medium.otf'),
    'FFFAcidGrotesk-Bold':   require('./assets/fonts/FFFAcidGrotesk-Bold.otf'),
  });
  const fontsReady = serifLoaded && monoLoaded && sansLoaded;

  // ── Auth / screen state ────────────────────────────────────────────────────
  const [screen,       setScreen]       = useState<AppScreen>('welcome');
  const [authChecked,  setAuthChecked]  = useState(false);

  useEffect(() => {
    // On mount: restore persisted session and decide the initial screen
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const hasName = !!session.user?.user_metadata?.name;
        setScreen(hasName ? 'home' : 'name');
      } else {
        setScreen('welcome');
      }
      setAuthChecked(true);
    });

    // Sign out when the session is invalidated externally
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) setScreen('welcome');
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  // Hide splash once fonts + auth check are both ready
  useEffect(() => {
    if (fontsReady && authChecked) SplashScreen.hideAsync();
  }, [fontsReady, authChecked]);

  if (!fontsReady || !authChecked) return <View />;

  // ── Screen router ──────────────────────────────────────────────────────────
  const renderScreen = () => {
    switch (screen) {
      case 'welcome':
        return (
          <WelcomeScreen
            onEmailPress={() => setScreen('signIn')}
          />
        );

      case 'signIn':
        return (
          <SignInScreen
            onSuccess={() => setScreen('home')}
            onSignUpPress={() => setScreen('signUp')}
          />
        );

      case 'signUp':
        return (
          <SignUpScreen
            onSuccess={() => setScreen('name')}
            onSignInPress={() => setScreen('signIn')}
          />
        );

      case 'name':
        return (
          <NameScreen
            onSuccess={() => setScreen('home')}
          />
        );

      case 'home':
        return (
          <HomeScreen
            onSettingsPress={() => setScreen('settings')}
          />
        );

      case 'settings':
        return (
          <SettingsScreen
            onBack={() => setScreen('home')}
          />
        );
    }
  };

  // AuthProvider wraps everything so useAuth() works in HomeScreen
  return (
    <AuthProvider>
      {renderScreen()}
    </AuthProvider>
  );
}
