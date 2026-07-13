// a light touchable wrapper that springs to scale 0.96 while pressed.
// the spring is interruptible so quick taps and cancelled presses stay
// smooth, and the scale is skipped entirely when the os reduce motion
// setting is on.
import React, { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Pressable,
  StyleProp,
  ViewStyle,
} from 'react-native';

interface PressableScaleProps {
  onPress?: () => void;
  disabled?: boolean;
  /** applied to the animated inner view */
  style?: StyleProp<ViewStyle>;
  /** applied to the outer pressable, use for width and flex sizing */
  containerStyle?: StyleProp<ViewStyle>;
  hitSlop?: number;
  children: React.ReactNode;
}

export default function PressableScale({
  onPress,
  disabled,
  style,
  containerStyle,
  hitSlop,
  children,
}: PressableScaleProps) {
  const scale = useRef(new Animated.Value(1)).current;
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

  const springTo = (value: number) => {
    if (reduceMotion) return;
    Animated.spring(scale, {
      toValue: value,
      stiffness: 300,
      damping: 20,
      mass: 0.6,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={hitSlop}
      style={containerStyle}
      onPressIn={() => springTo(0.96)}
      onPressOut={() => springTo(1)}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
