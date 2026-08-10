// fine horizontal gradient slider, reused for the mood input craving dial
// and the pairings screen tasting note sliders
// built with react-native-svg and PanResponder so it needs no extra native dependency
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  GestureResponderEvent,
  LayoutChangeEvent,
  Modal,
  PanResponder,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { motion } from '../../theme';
import {
  GRADIENT_HIGH_COLOR,
  gradientSliderStyles as s,
  GRADIENT_LOW_COLOR,
  THUMB_SIZE,
  TRACK_HEIGHT,
} from './styles';

// short educational blurb shown behind the info icon, for drinkers who
// don't yet know what terms like earthy or bright mean
export interface SliderInfo {
  title: string;
  body: string;
}

interface GradientSliderProps {
  // 0 sits at leftLabel, 1 sits at rightLabel
  value: number;
  onChange: (value: number) => void;
  leftLabel: string;
  rightLabel: string;
  // optional descriptive phrases spread evenly across the track, the one
  // matching the current value is shown under the slider and changes live
  // as the thumb moves (e.g. ["deep & grounding", "balanced", "crisp"])
  descriptors?: string[];
  // when set, renders a small info icon that opens an explainer tooltip
  info?: SliderInfo;
}

function clampRatio(ratio: number): number {
  return Math.min(1, Math.max(0, ratio));
}

// maps the 0-1 value onto one of the descriptor phrases, value 1 still
// lands on the last phrase rather than running off the end of the array
function descriptorFor(descriptors: string[], value: number): string {
  const index = Math.min(descriptors.length - 1, Math.floor(value * descriptors.length));
  return descriptors[index];
}

export default function GradientSlider({
  value,
  onChange,
  leftLabel,
  rightLabel,
  descriptors,
  info,
}: GradientSliderProps) {
  const [infoVisible, setInfoVisible] = useState(false);

  // the thumb grows a touch while a finger is on it, a tiny bit of
  // tactile feedback that the handle is live. the spring is interruptible
  // so quick grabs and releases stay smooth
  const thumbScale = useRef(new Animated.Value(1)).current;
  const springThumbTo = (toValue: number) => {
    Animated.spring(thumbScale, {
      toValue,
      ...motion.spring,
      useNativeDriver: true,
    }).start();
  };
  const [trackWidth, setTrackWidth] = useState(0);

  // the thumb's horizontal position lives on its own animated value driven
  // straight off the pan responder, so dragging never waits on a react
  // render of the parent's onChange to move the handle
  const thumbX = useRef(new Animated.Value(0)).current;

  // the track's own width and its absolute position on screen, kept in
  // refs so the pan responder below always reads the latest numbers
  // without needing to be rebuilt
  const widthRef = useRef(0);
  const pageXRef = useRef(0);
  const touchAreaRef = useRef<View>(null);

  // page x is absolute, it does not change depending on which nested
  // child view (the track or the thumb sitting on top of it) actually
  // received the touch, so every calculation below is done in page space
  // and then offset by the track's own page position
  const updateFromPageX = (pageX: number) => {
    const width = widthRef.current;
    if (width <= 0) return;
    const ratio = clampRatio((pageX - pageXRef.current) / width);
    thumbX.setValue(ratio * width - THUMB_SIZE / 2);
    onChange(ratio);
  };

  // measuring on layout gives the slider a usable width immediately, the
  // pan responder below re measures again on every touch start so a
  // parent scroll between renders never leaves this position stale
  const measureTrack = () => {
    touchAreaRef.current?.measure((_x, _y, measuredWidth, _height, measuredPageX) => {
      widthRef.current = measuredWidth;
      pageXRef.current = measuredPageX;
      setTrackWidth(measuredWidth);
    });
  };

  const handleLayout = (_event: LayoutChangeEvent) => {
    measureTrack();
  };

  const panResponderRef = useRef<ReturnType<typeof PanResponder.create> | null>(null);
  if (!panResponderRef.current) {
    panResponderRef.current = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      // re measure right as the touch begins, then jump straight to
      // wherever the finger landed, this is what stops the handle from
      // snapping back to the left when the touch starts directly on the
      // thumb instead of empty track space
      onPanResponderGrant: (event: GestureResponderEvent) => {
        springThumbTo(1.15);
        touchAreaRef.current?.measure((_x, _y, measuredWidth, _height, measuredPageX) => {
          widthRef.current = measuredWidth;
          pageXRef.current = measuredPageX;
          updateFromPageX(event.nativeEvent.pageX);
        });
      },

      // dragging reuses the exact same page relative formula as the grant
      // above, so the handle tracks the finger continuously with nothing
      // recalculated relative to the thumb itself
      onPanResponderMove: (event: GestureResponderEvent) => {
        updateFromPageX(event.nativeEvent.pageX);
      },

      onPanResponderRelease: () => springThumbTo(1),
      onPanResponderTerminate: () => springThumbTo(1),
    });
  }

  // keeps the thumb positioned correctly for programmatic value changes
  // (e.g. a parent resetting the slider) and once the track's width is
  // first measured
  useEffect(() => {
    if (trackWidth <= 0) return;
    thumbX.setValue(value * trackWidth - THUMB_SIZE / 2);
  }, [value, trackWidth]);

  return (
    <View>
      <View
        ref={touchAreaRef}
        style={s.touchArea}
        onLayout={handleLayout}
        {...panResponderRef.current.panHandlers}
      >
        <View style={s.trackWrap}>
          <Svg width="100%" height={TRACK_HEIGHT}>
            <Defs>
              <LinearGradient id="gradientSliderTrack" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor={GRADIENT_LOW_COLOR} />
                <Stop offset="1" stopColor={GRADIENT_HIGH_COLOR} />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height={TRACK_HEIGHT} fill="url(#gradientSliderTrack)" />
          </Svg>
        </View>
        <Animated.View
          style={[
            s.thumb,
            { left: -THUMB_SIZE / 2, transform: [{ translateX: thumbX }, { scale: thumbScale }] },
          ]}
        />
      </View>

      <View style={s.labelRow}>
        <View style={s.labelGroup}>
          <Text style={s.label}>{leftLabel}</Text>
          {info && (
            <TouchableOpacity
              onPress={() => setInfoVisible(true)}
              hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
            >
              <Text style={s.infoIcon}>ⓘ</Text>
            </TouchableOpacity>
          )}
        </View>
        {descriptors && descriptors.length > 0 && (
          <Text style={s.descriptor}>{descriptorFor(descriptors, value)}</Text>
        )}
        <Text style={s.label}>{rightLabel}</Text>
      </View>

      {info && (
        <Modal
          visible={infoVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setInfoVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setInfoVisible(false)}>
            <View style={s.infoBackdrop}>
              <TouchableWithoutFeedback>
                <View style={s.infoCard}>
                  <Text style={s.infoTitle}>{info.title}</Text>
                  <Text style={s.infoBody}>{info.body}</Text>
                  <TouchableOpacity onPress={() => setInfoVisible(false)}>
                    <Text style={s.infoDismiss}>Got it</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
    </View>
  );
}
