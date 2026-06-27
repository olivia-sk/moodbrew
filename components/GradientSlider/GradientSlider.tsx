// fine horizontal gradient slider, reused for the mood input craving dial
// and the pairings screen tasting note sliders
// built with react-native-svg and PanResponder so it needs no extra native dependency
import React, { useRef, useState } from 'react';
import { GestureResponderEvent, LayoutChangeEvent, PanResponder, View, Text } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import {
  GRADIENT_HIGH_COLOR,
  gradientSliderStyles as s,
  GRADIENT_LOW_COLOR,
  THUMB_SIZE,
  TRACK_HEIGHT,
} from './styles';

interface GradientSliderProps {
  // 0 sits at leftLabel, 1 sits at rightLabel
  value: number;
  onChange: (value: number) => void;
  leftLabel: string;
  rightLabel: string;
}

function clampRatio(ratio: number): number {
  return Math.min(1, Math.max(0, ratio));
}

export default function GradientSlider({ value, onChange, leftLabel, rightLabel }: GradientSliderProps) {
  const [trackWidth, setTrackWidth] = useState(0);

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
    });
  }

  const thumbLeft = trackWidth > 0 ? value * trackWidth - THUMB_SIZE / 2 : -THUMB_SIZE / 2;

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
        <View style={[s.thumb, { left: thumbLeft }]} />
      </View>

      <View style={s.labelRow}>
        <Text style={s.label}>{leftLabel}</Text>
        <Text style={s.label}>{rightLabel}</Text>
      </View>
    </View>
  );
}
