// queries the os reduce motion setting once at app start and exposes it
// synchronously via context, instead of every FadeIn/PressableScale
// instance doing its own async AccessibilityInfo round trip on mount
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

const ReduceMotionContext = createContext(false);

export function ReduceMotionProvider({ children }: { children: React.ReactNode }) {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => { if (mounted) setReduceMotion(enabled); })
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      mounted = false;
      sub?.remove();
    };
  }, []);

  return React.createElement(ReduceMotionContext.Provider, { value: reduceMotion }, children);
}

export function useReduceMotion() {
  return useContext(ReduceMotionContext);
}
