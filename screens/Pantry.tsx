/**
 * screens/Pantry.tsx
 * figma node 338:563 "home / pantry view"
 *
 * layout from figma (390x844):
 * "my pantry" title, "collection of teas" label, a cabinet of four
 * flat shelf boards holding the 16 physical inventory slots, then the
 * smaller "future brews" horizontal wishlist shelf, then the nav bar.
 *
 * the main cabinet is strictly active physical inventory. the future
 * brews shelf holds wishlist teas the drinker liked in discovery mode,
 * tapping one moves it into the first free cabinet slot, marks it in
 * stock, and clears it from the wishlist.
 */
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, fontSize, spacing } from '../theme';
import NavBar, { NavTab } from '../components/NavBar/NavBar';
import TeaPickerSheet from '../components/TeaPickerSheet/TeaPickerSheet';
import ShelfRow from '../components/ShelfRow/ShelfRow';
import {
  BOARD_COLOR,
  BOARD_HEIGHT,
  SLOT_COLOR,
  SLOT_HEIGHT,
  SLOT_ROW_INSET,
  SLOT_WIDTH,
} from '../components/ShelfRow/styles';
import PressableScale from '../components/PressableScale/PressableScale';
import { useAuth } from '../context/AuthContext';
import {
  assignTeaToSlot,
  fetchPantrySlots,
  fetchPickerTeaOptions,
  PANTRY_SLOT_COUNT,
  PantrySlots,
  removeTeaFromSlot,
} from '../lib/pantrySlots';
import {
  fetchWishlist,
  firstAvailableSlot,
  moveWishlistTeaToPantry,
  WishlistItem,
} from '../lib/wishlist';
import { fetchTeaDatabase } from '../lib/teaMatching';
import { Tea } from '../lib/types';
import { showToast } from '../lib/toast';

// the cabinet is 4 boards of 4 slots
const CABINET_ROWS = 4;
const SLOTS_PER_ROW = PANTRY_SLOT_COUNT / CABINET_ROWS;

// the future brews shelf shows one row of the same width as a cabinet
// board; it only needs to scroll once there are more wishlist teas than
// that row can hold
const WISHLIST_VISIBLE_SLOTS = SLOTS_PER_ROW;

interface Props {
  onHomePress: () => void;
  onJournalPress: () => void;
  onProfilePress: () => void;
}

export default function PantryScreen({ onHomePress, onJournalPress, onProfilePress }: Props) {
  const { user } = useAuth();
  const [activeTab] = useState<NavTab>('pantry');

  // maps slot index 0 to 15 to the tea sitting there, missing keys mean empty
  const [slots, setSlots] = useState<PantrySlots>({});
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [teaOptions, setTeaOptions] = useState<Tea[]>([]);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchPantrySlots(user.id)
      .then(setSlots)
      .catch((error: Error) => Alert.alert('Could not load your pantry', error.message));
    fetchWishlist(user.id)
      .then(setWishlist)
      .catch(() => showToast('Could not load your future brews'));
  }, [user]);

  const handleTabPress = (tab: NavTab) => {
    if (tab === 'home') onHomePress();
    if (tab === 'journal') onJournalPress();
    if (tab === 'profile') onProfilePress();
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

  // moves a wishlist tea into the first empty cabinet slot, marking it in
  // stock and clearing it from the future brews shelf
  const handleWishlistPress = async (item: WishlistItem) => {
    if (!user) return;
    const slotIndex = firstAvailableSlot(slots);
    if (slotIndex === null) {
      showToast('Your pantry cabinet is full');
      return;
    }

    // optimistically pull the tea off the wishlist shelf right away
    const previousWishlist = wishlist;
    setWishlist((current) => current.filter((entry) => entry.id !== item.id));

    try {
      // the cabinet slot needs the full tea record for its label and for
      // the matching engine, so look it up from the catalog
      const catalog = teaOptions.length > 0 ? teaOptions : await fetchTeaDatabase();
      if (teaOptions.length === 0) setTeaOptions(catalog);
      const tea = catalog.find((candidate) => candidate.Name === item.teaName);
      if (!tea) {
        throw new Error(`could not find ${item.teaName} in the tea catalog`);
      }

      setSlots((current) => ({ ...current, [slotIndex]: tea }));
      await moveWishlistTeaToPantry(user.id, item, slotIndex);
      showToast(`${item.teaName} moved to your pantry`);
    } catch (error) {
      // roll back both shelves if the move failed
      setWishlist(previousWishlist);
      setSlots((current) => {
        const next = { ...current };
        delete next[slotIndex];
        return next;
      });
      Alert.alert('Could not move that tea', (error as Error).message);
    }
  };

  const cabinetSlotsForRow = (rowIndex: number) =>
    Array.from({ length: SLOTS_PER_ROW }, (_, colIndex) => {
      const slotIndex = rowIndex * SLOTS_PER_ROW + colIndex;
      return {
        key: `slot-${slotIndex}`,
        label: slots[slotIndex]?.Name,
        onPress: () => handleSlotPress(slotIndex),
      };
    });

  return (
    <View style={s.root}>
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors['light-200']} />

      {/* main content frame with 16px side padding */}
      <View style={s.frame}>

        <View style={s.header}>
          <Text style={s.title}>My Pantry</Text>
        </View>

        <Text style={s.sectionLabel}>Collection of teas</Text>

        {/* the 16 slot cabinet, strictly active physical inventory */}
        <View style={s.cabinet}>
          {Array.from({ length: CABINET_ROWS }, (_, rowIndex) => (
            <ShelfRow key={rowIndex} slots={cabinetSlotsForRow(rowIndex)} />
          ))}
        </View>

        {/* future brews: one row the same width as a cabinet board. it
            reuses ShelfRow directly so the slots always land exactly under
            the collection above regardless of device width; a fixed-gap
            ScrollView only takes over once there's genuinely too much to
            fit in a row, since that layout can't be pixel-matched to the
            cabinet's space-between rhythm */}
        <Text style={s.sectionLabel}>Future brews</Text>
        {wishlist.length > WISHLIST_VISIBLE_SLOTS ? (
          <View style={s.wishlistShelf}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.wishlistScrollContent}
            >
              {wishlist.map((item) => (
                <PressableScale key={item.id} onPress={() => handleWishlistPress(item)}>
                  <View style={s.wishlistSlot}>
                    <Text style={s.wishlistLabel} numberOfLines={2}>
                      {item.teaName}
                    </Text>
                  </View>
                </PressableScale>
              ))}
            </ScrollView>
            <View style={s.wishlistBoard} />
          </View>
        ) : (
          <ShelfRow
            slots={Array.from({ length: WISHLIST_VISIBLE_SLOTS }, (_, index) => {
              const item = wishlist[index];
              return {
                key: item ? item.id : `empty-${index}`,
                label: item?.teaName,
                onPress: item ? () => handleWishlistPress(item) : undefined,
              };
            })}
          />
        )}

      </View>

      <NavBar activeTab={activeTab} onPress={handleTabPress} />

      <TeaPickerSheet
        visible={pickerVisible}
        teas={teaOptions}
        onSelect={handleSelectTea}
        onClose={() => { setPickerVisible(false); setSelectedSlotIndex(null); }}
        onTeaCreated={(tea) => setTeaOptions((current) => [...current, tea])}
        onTeaDeleted={(tea) => {
          // drop it from the cached picker list, then resync the shelf,
          // the database cascade may have just emptied one of the slots
          setTeaOptions((current) => current.filter((option) => option.Name !== tea.Name));
          if (user) {
            fetchPantrySlots(user.id)
              .then(setSlots)
              .catch(() => showToast('Could not refresh your pantry'));
          }
        }}
      />
    </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  // warm paper grey behind everything including the nav bar
  root: {
    flex: 1,
    backgroundColor: colors['light-200'],
  },
  safe: {
    flex: 1,
  },

  // content frame matches figma: 16px side padding, title lands at y77
  frame: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 18,
  },

  header: {
    marginBottom: 37,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: fontSize.h1,
    color: colors['accent-olive'],
    letterSpacing: -0.5,
  },
  sectionLabel: {
    fontFamily: fonts.mono,
    fontSize: fontSize['mono-small'],
    color: colors['brand-text-100'],
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 30,
  },

  // the four cabinet boards, board tops sit 97 apart in the frame so the
  // air between rows is 48, and future brews starts 65 below the cabinet
  cabinet: {
    gap: 48,
    marginBottom: 65,
  },

  // overflow future brews shelf: only mounted once there are more teas
  // than fit in one row, so it's fine for its content width to run past
  // the screen and actually scroll
  wishlistShelf: {
    width: '100%',
  },
  wishlistScrollContent: {
    paddingHorizontal: SLOT_ROW_INSET,
    gap: 32,
    alignItems: 'flex-end',
  },
  wishlistSlot: {
    width: SLOT_WIDTH,
    height: SLOT_HEIGHT,
    backgroundColor: SLOT_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wishlistLabel: {
    fontFamily: fonts.mono,
    fontSize: 8,
    color: colors['brand-text-100'],
    textAlign: 'center',
    paddingHorizontal: 2,
  },
  wishlistBoard: {
    width: '100%',
    height: BOARD_HEIGHT,
    backgroundColor: BOARD_COLOR,
  },
});
