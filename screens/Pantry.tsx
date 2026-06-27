/**
 * screens/Pantry.tsx
 * figma node 233:327 "home / pantry view"
 *
 * layout from figma (390x844 frame):
 * - status bar: 0,0 w=390 h=61
 * - nav: y=753 h=61
 * - frame1: x=16 y=77 w=358 h=630
 *   - header frame (frame51): y=0 h=48
 *     - "my pantry" title: h=23
 *     - "collection of teas" subtitle: y=39 h=9
 *   - shelf group (group50): y=80 w=358 h=550
 *     - shelf image fills 358x550
 *     - 4 shelf rows of 4 slots:
 *       - row1 (frame2): x=43 y=176 w=272 h=40  (relative to group50)
 *       - row2 (frame2): x=43 y=312 w=272 h=40
 *       - row3 (frame2): x=43 y=434 w=272 h=40
 *       - row4 (frame2): x=43 y=562 w=272 h=40
 *       slots: w=50 h=40, gaps at x=74,148,222 so gap=24px
 */
import React, { useEffect, useState } from 'react';
import {
  Alert,
  View,
  Text,
  ImageBackground,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { colors, fonts, fontSize, spacing } from '../theme';
import NavBar, { NavTab } from '../components/NavBar/NavBar';
import TeaPickerSheet from '../components/TeaPickerSheet/TeaPickerSheet';
import { useAuth } from '../context/AuthContext';
import {
  assignTeaToSlot,
  fetchPantrySlots,
  fetchPickerTeaOptions,
  PantrySlots,
  removeTeaFromSlot,
} from '../lib/pantrySlots';
import { Tea } from '../lib/types';
import { SHELF_HEIGHT, SHELF_WIDTH, SLOT_INSET, SLOT_ROW_TOPS } from '../styles/pantry';

const pantryShelfImg = require('../assets/images/pantry-shelf.png');

const SLOT_INDEXES_BY_ROW: number[][] = [
  [0, 1, 2, 3],
  [4, 5, 6, 7],
  [8, 9, 10, 11],
  [12, 13, 14, 15],
];

interface Props {
  onHomePress: () => void;
}

export default function PantryScreen({ onHomePress }: Props) {
  const { user } = useAuth();
  const [activeTab] = useState<NavTab>('pantry');

  // maps slot index 0 to 15 to the tea sitting there, missing keys mean empty
  const [slots, setSlots] = useState<PantrySlots>({});
  const [teaOptions, setTeaOptions] = useState<Tea[]>([]);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchPantrySlots(user.id)
      .then(setSlots)
      .catch((error: Error) => Alert.alert('Could not load your pantry', error.message));
  }, [user]);

  const handleTabPress = (tab: NavTab) => {
    if (tab === 'home') onHomePress();
  };

  // opens the tea picker for a given slot, loading the master tea list on
  // first use and reusing it after that
  const openPickerForSlot = async (slotIndex: number) => {
    setSelectedSlotIndex(slotIndex);
    if (teaOptions.length === 0) {
      try {
        const options = await fetchPickerTeaOptions();
        setTeaOptions(options);
      } catch (error) {
        Alert.alert('Could not load the tea list', (error as Error).message);
        return;
      }
    }
    setPickerVisible(true);
  };

  // removes whatever tea sits in a slot, turning it back into an empty placeholder
  const handleRemoveFromShelf = (slotIndex: number) => {
    if (!user) return;
    const previousTea = slots[slotIndex];
    setSlots((current) => {
      const next = { ...current };
      delete next[slotIndex];
      return next;
    });
    removeTeaFromSlot(user.id, slotIndex).catch((error: Error) => {
      // roll back the optimistic removal if clearing it failed
      if (previousTea) {
        setSlots((current) => ({ ...current, [slotIndex]: previousTea }));
      }
      Alert.alert('Could not remove that tea', error.message);
    });
  };

  const handleSlotPress = (slotIndex: number) => {
    const tea = slots[slotIndex];
    if (!tea) {
      openPickerForSlot(slotIndex);
      return;
    }
    Alert.alert(tea.Name, undefined, [
      { text: 'Change Tea', onPress: () => openPickerForSlot(slotIndex) },
      { text: 'Remove From Shelf', style: 'destructive', onPress: () => handleRemoveFromShelf(slotIndex) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleSelectTea = (tea: Tea) => {
    if (selectedSlotIndex === null || !user) return;
    const slotIndex = selectedSlotIndex;
    const previousTea = slots[slotIndex];
    // optimistically show the tea on the shelf right away
    setSlots((current) => ({ ...current, [slotIndex]: tea }));
    setPickerVisible(false);
    setSelectedSlotIndex(null);
    assignTeaToSlot(user.id, tea.Name, slotIndex).catch((error: Error) => {
      // roll back to whatever was there before if saving it failed
      setSlots((current) => {
        const next = { ...current };
        if (previousTea) { next[slotIndex] = previousTea; } else { delete next[slotIndex]; }
        return next;
      });
      Alert.alert('Could not save that to your pantry', error.message);
    });
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors['light-100']} />

      {/* main content frame: x=16 y=77 w=358 */}
      <View style={s.frame}>

        {/* header: "my pantry" + "collection of teas" */}
        <View style={s.header}>
          <Text style={s.title}>My Pantry</Text>
          <Text style={s.subtitle}>Collection of teas</Text>
        </View>

        {/* shelf group: y=80 relative to frame, w=358 h=550 */}
        <View style={s.shelfGroup}>
          <ImageBackground
            source={pantryShelfImg}
            style={s.shelfImage}
            resizeMode="stretch"
          >
            {SLOT_ROW_TOPS.map((rowTop, rowIndex) => {
              const rowSlotIndexes = SLOT_INDEXES_BY_ROW[rowIndex];
              return (
                <View key={rowIndex} style={[s.slotRow, { top: rowTop, left: SLOT_INSET }]}>
                  {rowSlotIndexes.map((slotIndex, colIndex) => {
                    const tea = slots[slotIndex];
                    return (
                      <React.Fragment key={slotIndex}>
                        <TouchableOpacity
                          style={s.slot}
                          activeOpacity={0.7}
                          onPress={() => handleSlotPress(slotIndex)}
                        >
                          {tea && (
                            <Text style={s.slotLabel} numberOfLines={2}>
                              {tea.Name}
                            </Text>
                          )}
                        </TouchableOpacity>
                        {colIndex < rowSlotIndexes.length - 1 && <View style={s.slotGap} />}
                      </React.Fragment>
                    );
                  })}
                </View>
              );
            })}
          </ImageBackground>
        </View>

      </View>

      <NavBar activeTab={activeTab} onPress={handleTabPress} />

      <TeaPickerSheet
        visible={pickerVisible}
        teas={teaOptions}
        onSelect={handleSelectTea}
        onClose={() => { setPickerVisible(false); setSelectedSlotIndex(null); }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors['light-100'],
  },

  // content frame matches figma: x=16 padding, flex column
  frame: {
    flex: 1,
    paddingHorizontal: spacing['padding-horizontal'],
    paddingTop: spacing.lg,
  },

  // header block: title + subtitle
  header: {
    gap: spacing.xs,
    marginBottom: spacing.lg,
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

  // shelf group fills remaining space, centres the shelf image since its
  // width is computed from the screen rather than stretched to fill
  shelfGroup: {
    flex: 1,
    alignItems: 'center',
  },

  // shelf image sized from the actual device dimensions so the slot rows
  // (positioned by percentage) land on the shelf boards at any screen size
  shelfImage: {
    width: SHELF_WIDTH,
    height: SHELF_HEIGHT,
  },

  // slot rows absolutely positioned inside the shelf image
  slotRow: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
  },
  // each slot: w=50 h=40 per figma
  slot: {
    width: 50,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotGap: {
    width: 24,
  },
  slotLabel: {
    fontFamily: fonts.mono,
    fontSize: 8,
    color: colors['brand-text-100'],
    textAlign: 'center',
    paddingHorizontal: 2,
  },
});
