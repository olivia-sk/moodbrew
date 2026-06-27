// mounted once near the root of the app, listens for showToast calls and
// renders a soft, auto dismissing banner above everything else
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text } from 'react-native';
import { registerToastListener } from '../../lib/toast';
import { toastStyles as s } from './styles';

const VISIBLE_DURATION_MS = 3000;
const FADE_DURATION_MS = 200;

export default function ToastHost() {
  const [message, setMessage] = useState<string | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unregister = registerToastListener((nextMessage) => {
      if (hideTimer.current !== null) {
        clearTimeout(hideTimer.current);
      }

      setMessage(nextMessage);
      Animated.timing(opacity, {
        toValue: 1,
        duration: FADE_DURATION_MS,
        useNativeDriver: true,
      }).start();

      hideTimer.current = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: FADE_DURATION_MS,
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
  }, []);

  if (!message) return null;

  return (
    <Animated.View style={[s.wrap, { opacity }]} pointerEvents="none">
      <Animated.View style={s.bubble}>
        <Text style={s.text}>{message}</Text>
      </Animated.View>
    </Animated.View>
  );
}
