import { useEffect } from 'react';
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
import HomeScreen from './screens/Home';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [serifLoaded] = useSerifFonts({ InstrumentSerif_400Regular });
  const [monoLoaded] = useMonoFonts({ IBMPlexMono_400Regular });

  const [sansLoaded] = Font.useFonts({
    'FFFAcidGrotesk-Normal': require('./assets/fonts/FFFAcidGrotesk-Normal.ttf'),
    'FFFAcidGrotesk-Medium': require('./assets/fonts/FFFAcidGrotesk-Medium.otf'),
    'FFFAcidGrotesk-Bold':   require('./assets/fonts/FFFAcidGrotesk-Bold.otf'),
  });

  const fontsReady = serifLoaded && monoLoaded && sansLoaded;

  useEffect(() => {
    if (fontsReady) SplashScreen.hideAsync();
  }, [fontsReady]);

  if (!fontsReady) return <View />;

  return <HomeScreen />;
}
