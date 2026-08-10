// fades content in with a small upward rise when a screen mounts.
// the auth screens use this to soften screen changes since the app swaps
// screens with no navigator animation. when the os reduce motion setting
// is on the content renders statically instead.
import React, { useEffect, useRef } from 'react';
import { Animated, StyleProp, ViewStyle } from 'react-native';
import { motion } from '../../theme';
import { useReduceMotion } from '../../lib/useReduceMotion';

interface FadeInProps {
  delay?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export default function FadeIn({ delay = 0, duration = motion.durationBase, style, children }: FadeInProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(8)).current;
  const reduceMotion = useReduceMotion();

  useEffect(() => {
    if (reduceMotion) {
      opacity.setValue(1);
      rise.setValue(0);
      return;
    }
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        easing: motion.easeOut,
        useNativeDriver: true,
      }),
      Animated.timing(rise, {
        toValue: 0,
        duration,
        delay,
        easing: motion.easeOut,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, duration, opacity, rise, reduceMotion]);

  return (
    <Animated.View style={[style, { opacity, transform: [{ translateY: rise }] }]}>
      {children}
    </Animated.View>
  );
}
