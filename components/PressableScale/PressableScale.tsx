// a light touchable wrapper that springs to scale 0.96 while pressed.
// the spring is interruptible so quick taps and cancelled presses stay
// smooth. when the os reduce motion setting is on, scale is skipped and a
// gentle opacity dim substitutes for it instead, so presses still land.
import React, { useRef } from 'react';
import { Animated, Pressable, StyleProp, ViewStyle } from 'react-native';
import { motion } from '../../theme';
import { useReduceMotion } from '../../lib/useReduceMotion';

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
  const pressOpacity = useRef(new Animated.Value(1)).current;
  const reduceMotion = useReduceMotion();

  const springTo = (value: number) => {
    if (reduceMotion) {
      Animated.timing(pressOpacity, {
        toValue: value < 1 ? 0.7 : 1,
        duration: 100,
        useNativeDriver: true,
      }).start();
      return;
    }
    Animated.spring(scale, {
      toValue: value,
      ...motion.spring,
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
      <Animated.View style={[style, { opacity: pressOpacity, transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
