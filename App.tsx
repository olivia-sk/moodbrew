import './global.css';
import React, { useEffect, useState } from 'react';
import { Platform, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
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
import { MoodContext, Tea } from './lib/types';
import { TeaStoryResult } from './lib/teaStory';
import ToastHost from './components/Toast/ToastHost';

import WelcomeScreen   from './screens/Welcome';
import SignInScreen    from './screens/SignIn';
import SignUpScreen    from './screens/SignUp';
import NameScreen      from './screens/Name';
import HomeScreen      from './screens/Home';
import PantryScreen    from './screens/Pantry';
import MoodInputScreen from './screens/MoodInput';
import MatchCardScreen from './screens/MatchCard';
import KettleScreen    from './screens/Kettle';
import PairingsScreen  from './screens/Pairings';
import SettingsScreen  from './screens/Settings';

SplashScreen.preventAutoHideAsync();

// ─── Navigation state ─────────────────────────────────────────────────────────
type AppScreen =
  | 'welcome' | 'signIn' | 'signUp' | 'name' | 'home' | 'pantry'
  | 'moodInput' | 'matchCard' | 'kettle' | 'pairings' | 'settings';

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  // ── Fonts ──────────────────────────────────────────────────────────────────
  const [serifLoaded] = useSerifFonts({ InstrumentSerif_400Regular });
  const [monoLoaded]  = useMonoFonts({ IBMPlexMono_400Regular });
  const fontsReady = serifLoaded && monoLoaded;

  // ── Auth / screen state ────────────────────────────────────────────────────
  const [screen,       setScreen]       = useState<AppScreen>('welcome');
  const [authChecked,  setAuthChecked]  = useState(false);

  // carries the result of the mood match forward to the match card and kettle screens
  const [matchedTea,   setMatchedTea]   = useState<Tea | null>(null);
  const [moodContext,  setMoodContext]  = useState<MoodContext | null>(null);
  const [teaStory,     setTeaStory]     = useState<TeaStoryResult | null>(null);

  // tea name of the brew logged on the pairings screen just before coming
  // home, shown optimistically in shelf slot 0 while the feed refetches
  const [lastBrewTeaName, setLastBrewTeaName] = useState<string | null>(null);

  useEffect(() => {
    // on mount: restore persisted session and decide the initial screen
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const hasName = !!session.user?.user_metadata?.name;
        setScreen(hasName ? 'home' : 'name');
      } else {
        setScreen('welcome');
      }
      setAuthChecked(true);
    });

    // sign out when the session is invalidated externally
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) setScreen('welcome');
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  // hide splash once fonts + auth check are both ready
  useEffect(() => {
    if (fontsReady && authChecked) SplashScreen.hideAsync();
  }, [fontsReady, authChecked]);

  if (!fontsReady || !authChecked) return <View />;

  // clears the mood match flow state and returns to the home shelf, this is
  // our equivalent of clearing the navigation stack since the app has no
  // history to unwind in the first place
  const goHomeAndResetFlow = () => {
    setMatchedTea(null);
    setMoodContext(null);
    setTeaStory(null);
    setScreen('home');
  };

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
            onPantryPress={() => setScreen('pantry')}
            onMoodInputPress={() => setScreen('moodInput')}
            seedBrew={lastBrewTeaName}
          />
        );

      case 'pantry':
        return (
          <PantryScreen
            onHomePress={() => setScreen('home')}
          />
        );

      case 'moodInput':
        return (
          <MoodInputScreen
            onBack={() => setScreen('home')}
            onMatch={(tea, context) => {
              setMatchedTea(tea);
              setMoodContext(context);
              // a fresh mood match means any previously cached story is stale
              setTeaStory(null);
              setScreen('matchCard');
            }}
          />
        );

      case 'matchCard':
        // matchedTea/moodContext are always set before this screen is reachable
        return (
          <MatchCardScreen
            tea={matchedTea!}
            moodContext={moodContext!}
            story={teaStory}
            onStoryLoaded={setTeaStory}
            onShuffle={(tea) => {
              setMatchedTea(tea);
              // the new tea needs its own story, drop the cached one for the old tea
              setTeaStory(null);
            }}
            onBack={() => setScreen('moodInput')}
            onStartBrewing={(story) => {
              setTeaStory(story);
              setScreen('kettle');
            }}
          />
        );

      case 'kettle':
        // matchedTea/teaStory are always set before this screen is reachable
        return (
          <KettleScreen
            tea={matchedTea!}
            story={teaStory!}
            onBack={() => setScreen('matchCard')}
            onSkipToPairings={(tea, story) => {
              setMatchedTea(tea);
              setTeaStory(story);
              setScreen('pairings');
            }}
          />
        );

      case 'pairings':
        // matchedTea/teaStory are always set before this screen is reachable
        return (
          <PairingsScreen
            tea={matchedTea!}
            story={teaStory!}
            onBack={() => setScreen('kettle')}
            onDone={() => {
              // remember the brew that was just logged so the home shelf
              // can show it in slot 0 before the feed query resolves
              setLastBrewTeaName(matchedTea!.Name);
              goHomeAndResetFlow();
            }}
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

  // SafeAreaProvider feeds real device insets to every screen so content
  // clears the status bar and the ios home indicator on all platforms.
  // authprovider wraps everything so useAuth() works in HomeScreen.
  // toasthost sits on top of whatever screen is active.
  const app = (
    <SafeAreaProvider>
      <AuthProvider>
        {renderScreen()}
        <ToastHost />
      </AuthProvider>
    </SafeAreaProvider>
  );

  // every layout in this app is built for a phone sized screen. on native
  // that is automatically what the app gets, but a browser tab can be any
  // width, so on web the app is pinned inside a phone sized frame instead
  // of stretching edge to edge and looking like a completely different
  // design at wide widths
  if (Platform.OS === 'web') {
    return (
      <View style={{ flex: 1, minHeight: 0, alignItems: 'center', backgroundColor: '#E5E5E5' }}>
        <View style={{ width: 430, maxWidth: '100%', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {app}
        </View>
      </View>
    );
  }

  return app;
}
