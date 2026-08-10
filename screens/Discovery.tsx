/**
 * screens/Discovery.tsx
 * discovery mode: a swipe deck of teas from outside the drinker's
 * pantry. the deck ignores inventory entirely, surfacing unique tea
 * variations from the matching engine catalog. swiping right shelves
 * the tea on the future brews wishlist, swiping left passes on it.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  PanResponder,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, fontSize, motion, spacing } from '../theme';
import { useAuth } from '../context/AuthContext';
import PressableScale from '../components/PressableScale/PressableScale';
import FadeIn from '../components/FadeIn/FadeIn';
import { useReduceMotion } from '../lib/useReduceMotion';
import { showToast } from '../lib/toast';
import { fetchDiscoveryDeck } from '../lib/discovery';
import { formatCaffeineMg } from '../lib/format';
import { addToWishlist } from '../lib/wishlist';
import { cardNumberFor } from '../components/CardStack/CardStack';
import { Tea } from '../lib/types';

const SCREEN_WIDTH = Dimensions.get('window').width;

// horizontal drag distance that commits a swipe
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.28;

interface Props {
  onBack: () => void;
}

export default function DiscoveryScreen({ onBack }: Props) {
  const { user } = useAuth();
  const [deck, setDeck] = useState<Tea[]>([]);
  const [topIndex, setTopIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const reduceMotion = useReduceMotion();

  // drag position of the top card, rotation and like or pass hints
  // derive from its x value
  const pan = useRef(new Animated.ValueXY()).current;

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    fetchDiscoveryDeck(user.id)
      .then((teas) => {
        if (!mounted) return;
        setDeck(teas);
        setLoading(false);
      })
      .catch(() => {
        if (!mounted) return;
        setLoading(false);
        showToast('Could not load discovery teas');
      });
    return () => { mounted = false; };
  }, [user]);

  // refs mirror the state the pan responder callbacks need, since the
  // responder is created once and would otherwise close over stale values
  const deckRef = useRef(deck);
  deckRef.current = deck;
  const topIndexRef = useRef(topIndex);
  topIndexRef.current = topIndex;
  const userRef = useRef(user);
  userRef.current = user;

  const advance = () => {
    pan.setValue({ x: 0, y: 0 });
    setTopIndex((index) => index + 1);
  };

  // the part of a swipe that isn't the animation: recording the verdict
  // and moving to the next card. shared by the animated path and the
  // reduce-motion path, which skips straight to this.
  const resolveSwipe = (liked: boolean, tea: Tea, activeUser: NonNullable<typeof user>) => {
    advance();
    if (liked) {
      addToWishlist(activeUser.id, tea.Name)
        .then(() => showToast(`${tea.Name} shelved for future brews`))
        .catch(() => showToast('Could not save that tea to your wishlist'));
    }
  };

  // flings the top card off screen, records the verdict, then advances.
  // gesture carries the release velocity through the exit so a hard flick
  // leaves faster than a slow deliberate drag; button-triggered swipes have
  // no gesture, so they get a default throw velocity instead.
  const commitSwipe = (liked: boolean, gesture?: { vx: number; vy: number }) => {
    const tea = deckRef.current[topIndexRef.current];
    const activeUser = userRef.current;
    if (!tea || !activeUser) return;

    if (reduceMotion) {
      resolveSwipe(liked, tea, activeUser);
      return;
    }

    const velocity = gesture
      ? { x: gesture.vx * 1000, y: gesture.vy * 1000 }
      : { x: liked ? 900 : -900, y: 0 };

    Animated.spring(pan, {
      toValue: { x: liked ? SCREEN_WIDTH * 1.4 : -SCREEN_WIDTH * 1.4, y: 0 },
      velocity,
      stiffness: 200,
      damping: 30,
      mass: 0.8,
      overshootClamping: true,
      // the pan responder drives this value from js, so every animation
      // on it has to stay on the js driver too
      useNativeDriver: false,
    }).start(() => resolveSwipe(liked, tea, activeUser));
  };

  const springBack = (gesture?: { vx: number; vy: number }) => {
    Animated.spring(pan, {
      toValue: { x: 0, y: 0 },
      velocity: gesture ? { x: gesture.vx * 1000, y: gesture.vy * 1000 } : { x: 0, y: 0 },
      ...motion.spring,
      useNativeDriver: false,
    }).start();
  };

  const panResponderRef = useRef<ReturnType<typeof PanResponder.create> | null>(null);
  if (!panResponderRef.current) {
    panResponderRef.current = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_event, gesture) =>
        Math.abs(gesture.dx) > 6 || Math.abs(gesture.dy) > 6,
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_event, gesture) => {
        // a fast confident flick commits even if it hasn't crossed the
        // distance threshold yet, so the deck doesn't feel like it's
        // refusing a quick swipe
        const flick = Math.abs(gesture.vx) > 0.3 && Math.abs(gesture.dx) > 40;
        if (flick || Math.abs(gesture.dx) > SWIPE_THRESHOLD) {
          commitSwipe(Math.sign(gesture.dx) > 0, gesture);
        } else {
          springBack(gesture);
        }
      },
      onPanResponderTerminate: () => springBack(),
    });
  }

  const rotate = pan.x.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: ['-12deg', '0deg', '12deg'],
  });

  // how far the card has been dragged toward each verdict, used to light
  // up the matching action button instead of stamping the card itself
  const likeHighlight = pan.x.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const passHighlight = pan.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const likeBg = likeHighlight.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', colors['accent-olive']],
  });
  const likeTextColor = likeHighlight.interpolate({
    inputRange: [0, 1],
    outputRange: [colors['accent-olive'], colors['light-100']],
  });
  const passBg = passHighlight.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', colors['dark-100']],
  });
  const passTextColor = passHighlight.interpolate({
    inputRange: [0, 1],
    outputRange: [colors['dark-100'], colors['light-100']],
  });
  const topTea = deck[topIndex];
  const nextTea = deck[topIndex + 1];

  // the next card grows in from behind as the top card is dragged away,
  // the standard deck trick, using the same pan.x distance driving the
  // top card's own transform
  const nextCardScale = pan.x.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: [1, 0.96, 1],
    extrapolate: 'clamp',
  });
  const nextCardOpacity = pan.x.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: [1, 0.85, 1],
    extrapolate: 'clamp',
  });

  const renderCardBody = (tea: Tea) => (
    <>
      <View style={s.cardHeaderRow}>
        <Text style={s.cardTitle}>{tea.Name}</Text>
        <Text style={s.cardNumber}>{cardNumberFor(tea.Name)}</Text>
      </View>

      <View style={s.field}>
        <Text style={s.fieldLabel}>Origin</Text>
        <Text style={s.fieldValue}>{tea.Traditional_Origin}</Text>
      </View>

      <View style={s.field}>
        <Text style={s.fieldLabel}>Category</Text>
        <Text style={s.fieldValue}>{tea.Category}</Text>
      </View>

      <View style={s.field}>
        <Text style={s.fieldLabel}>Caffeine</Text>
        <Text style={s.fieldValue}>{formatCaffeineMg(tea.Caffeine_Level)}</Text>
      </View>

      <View style={s.field}>
        <Text style={s.fieldLabel}>Flavour notes</Text>
        <Text style={s.fieldValue}>{tea.Raw_Flavor_Notes}</Text>
      </View>
    </>
  );

  return (
    <View style={s.root}>
      <SafeAreaView style={s.safe}>
        <StatusBar barStyle="dark-content" backgroundColor={colors['light-200']} />

        <View style={s.page}>

          <TouchableOpacity
            style={s.backRow}
            activeOpacity={0.7}
            onPress={onBack}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={s.backArrow}>←</Text>
            <Text style={s.backLabel}>back</Text>
          </TouchableOpacity>

          <FadeIn>
            <View style={s.headerBlock}>
              <Text style={s.title}>Discovery Mode</Text>
              <Text style={s.subtitle}>Swipe right to shelve a future brew</Text>
            </View>
          </FadeIn>

          <View style={s.deckArea}>
            {loading ? (
              <View style={s.deckMessage}>
                <ActivityIndicator color={colors['accent-olive']} />
              </View>
            ) : !topTea ? (
              <View style={s.deckMessage}>
                <Text style={s.emptyText}>
                  {deck.length === 0
                    ? 'nothing new to discover right now'
                    : 'that is the whole catalog, check your future brews shelf'}
                </Text>
              </View>
            ) : (
              <View style={s.deck}>
                {/* blank decoy card peeking out behind the deck, matching
                    the stacked index card look used across the app */}
                <View style={s.decoyCard} />
                {nextTea && (
                  <Animated.View
                    style={[
                      s.card,
                      { opacity: nextCardOpacity, transform: [{ scale: nextCardScale }] },
                    ]}
                  >
                    {renderCardBody(nextTea)}
                  </Animated.View>
                )}
                <Animated.View
                  style={[
                    s.card,
                    {
                      transform: [
                        { translateX: pan.x },
                        { translateY: pan.y },
                        { rotate },
                      ],
                    },
                  ]}
                  {...panResponderRef.current?.panHandlers}
                >
                  {renderCardBody(topTea)}
                </Animated.View>
              </View>
            )}
          </View>

          {topTea && !loading && (
            <View style={s.actionRow}>
              <PressableScale onPress={() => commitSwipe(false)}>
                <Animated.View
                  style={[s.actionBtn, { borderColor: colors['dark-100'], backgroundColor: passBg }]}
                >
                  <Animated.Text style={[s.actionText, { color: passTextColor }]}>PASS</Animated.Text>
                </Animated.View>
              </PressableScale>
              <PressableScale onPress={() => commitSwipe(true)}>
                <Animated.View
                  style={[s.actionBtn, { borderColor: colors['accent-olive'], backgroundColor: likeBg }]}
                >
                  <Animated.Text style={[s.actionText, { color: likeTextColor }]}>WANT</Animated.Text>
                </Animated.View>
              </PressableScale>
            </View>
          )}

        </View>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors['light-200'],
  },
  safe: {
    flex: 1,
  },
  page: {
    flex: 1,
    paddingHorizontal: spacing['padding-horizontal'],
  },

  // back row at y91 in the frame, 33 of air down to the title
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingTop: spacing['2xl'],
    paddingBottom: 33,
  },
  backArrow: {
    fontFamily: fonts.mono,
    fontSize: fontSize.body,
    color: colors['brand-text-100'],
  },
  backLabel: {
    fontFamily: fonts.mono,
    fontSize: fontSize['body-small'],
    color: colors['brand-text-100'],
    letterSpacing: 0.5,
  },

  headerBlock: {
    gap: 10,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: fontSize.h1,
    color: colors['accent-olive'],
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: fonts.mono,
    fontSize: fontSize['mono-small'],
    color: colors['brand-text-200'],
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // the deck sits below the subtitle with extra breathing room, a taller
  // card on the 390 frame so the width is a ratio of the content and the
  // height is fixed
  deckArea: {
    marginTop: 68,
    height: 440,
  },
  deckMessage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deck: {
    flex: 1,
    width: '93%',
    alignSelf: 'center',
  },
  // stacked index card look shared with the match card screen: white
  // face, fine grey border, and a blank tilted decoy peeking out behind
  card: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors['light-100'],
    borderWidth: 1,
    borderColor: colors['light-400'],
    borderRadius: 4,
    padding: spacing.xl,
  },
  decoyCard: {
    position: 'absolute',
    top: -10,
    bottom: 12,
    left: -12,
    right: 18,
    borderWidth: 1,
    borderColor: colors['light-400'],
    borderRadius: 4,
    backgroundColor: colors['light-100'],
    transform: [{ rotate: '6.778deg' }],
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing['2xl'],
  },
  cardTitle: {
    flex: 1,
    fontFamily: fonts.serif,
    fontSize: fontSize.h1,
    color: colors['accent-olive'],
    letterSpacing: -0.5,
  },
  cardNumber: {
    fontFamily: fonts.mono,
    fontSize: fontSize['mono-small'],
    color: colors['accent-olive'],
    letterSpacing: 0.5,
  },
  field: {
    gap: spacing.xs,
    marginBottom: spacing['2xl'],
  },
  fieldLabel: {
    fontFamily: fonts.mono,
    fontSize: fontSize['mono-small'],
    color: colors['brand-text-200'],
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  fieldValue: {
    fontFamily: fonts.mono,
    fontSize: fontSize['body-small'],
    color: colors['brand-text-100'],
    lineHeight: fontSize['body-small'] * 1.5,
  },

  emptyText: {
    fontFamily: fonts.mono,
    fontSize: fontSize['body-small'],
    color: colors['brand-text-200'],
    textAlign: 'center',
    lineHeight: fontSize['body-small'] * 1.6,
  },

  // two bordered rectangles centered below the deck per the frame
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 26,
    marginTop: 48,
    paddingBottom: spacing.xl,
  },
  actionBtn: {
    width: 108,
    height: 46,
    borderWidth: 1,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontFamily: fonts.mono,
    fontSize: fontSize['mono-small'],
    letterSpacing: 1,
  },
});
