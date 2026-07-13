// fades content in with a small upward rise when a screen mounts.
// the auth screens use this to soften screen changes since the app swaps
// screens with no navigator animation. when the os reduce motion setting
// is on the content renders statically instead.
import React, { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  StyleProp,
  ViewStyle,
} from 'react-native';

interface FadeInProps {
  delay?: number;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export default function FadeIn({ delay = 0, style, children }: FadeInProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(8)).current;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .catch(() => false)
      .then((reduceMotion) => {
        if (!mounted) return;
        setReady(true);
        if (reduceMotion) {
          opacity.setValue(1);
          rise.setValue(0);
          return;
        }
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 250,
            delay,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(rise, {
            toValue: 0,
            duration: 250,
            delay,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]).start();
      });
    return () => { mounted = false; };
  }, [delay, opacity, rise]);

  return (
    <Animated.View
      style={[style, { opacity: ready ? opacity : 0, transform: [{ translateY: rise }] }]}
    >
      {children}
    </Animated.View>
  );
}
