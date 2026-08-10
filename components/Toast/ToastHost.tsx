// mounted once near the root of the app, listens for showToast calls and
// renders a soft, auto dismissing banner above everything else
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text } from 'react-native';
import { registerToastListener } from '../../lib/toast';
import { toastStyles as s } from './styles';
import { motion } from '../../theme';
import { useReduceMotion } from '../../lib/useReduceMotion';

const VISIBLE_DURATION_MS = 3000;

export default function ToastHost() {
  const [message, setMessage] = useState<string | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(8)).current;
  const scale = useRef(new Animated.Value(0.97)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduceMotion = useReduceMotion();

  useEffect(() => {
    const unregister = registerToastListener((nextMessage) => {
      if (hideTimer.current !== null) {
        clearTimeout(hideTimer.current);
      }

      setMessage(nextMessage);

      if (reduceMotion) {
        opacity.setValue(1);
        translateY.setValue(0);
        scale.setValue(1);
      } else {
        translateY.setValue(8);
        scale.setValue(0.97);
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: motion.durationFast,
            easing: motion.easeOut,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: motion.durationFast,
            easing: motion.easeOut,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: motion.durationFast,
            easing: motion.easeOut,
            useNativeDriver: true,
          }),
        ]).start();
      }

      hideTimer.current = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: motion.durationFast,
          easing: reduceMotion ? undefined : motion.easeIn,
          useNativeDriver: true,
        }).start(() => setMessage(null));
      }, VISIBLE_DURATION_MS);
    });

    return () => {
      unregister();
      if (hideTimer.current !== null) {
        clearTimeout(hideTimer.current);
      }
    };
  }, [reduceMotion]);

  if (!message) return null;

  return (
    <Animated.View style={[s.wrap, { opacity }]} pointerEvents="none">
      <Animated.View style={[s.bubble, { transform: [{ translateY }, { scale }] }]}>
        <Text style={s.text}>{message}</Text>
      </Animated.View>
    </Animated.View>
  );
}
