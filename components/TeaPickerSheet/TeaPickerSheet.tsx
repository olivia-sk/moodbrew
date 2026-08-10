// bottom sheet overlay listing the master tea list, used to assign a tea
// to an empty pantry shelf slot. includes a search box, and when a search
// finds nothing the drinker can have their tea added as a private custom
// entry through the tea-enrich edge function
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import PressableScale from '../PressableScale/PressableScale';
import { createCustomTea, deleteCustomTea } from '../../lib/customTea';
import { formatCaffeineMg } from '../../lib/format';
import { showToast } from '../../lib/toast';
import { Tea } from '../../lib/types';
import { colors, motion } from '../../theme';
import { useReduceMotion } from '../../lib/useReduceMotion';
import { teaPickerSheetStyles as s } from './styles';

// generous fixed offscreen start for the sheet slide, well past the sheet's
// 70% maxHeight so it clears the screen at any device height
const SHEET_TRANSLATE_START = Dimensions.get('window').height;

interface TeaPickerSheetProps {
  visible: boolean;
  teas: Tea[];
  onSelect: (tea: Tea) => void;
  onClose: () => void;
  // lets the owning screen add a freshly created custom tea to its cached
  // tea list so it shows up without a refetch
  onTeaCreated?: (tea: Tea) => void;
  // fired after a custom tea is deleted so the owning screen can drop it
  // from its cache and resync the shelf (the pantry row cascades away)
  onTeaDeleted?: (tea: Tea) => void;
}

// what the sheet is currently showing: the searchable list, the haiku
// enrichment spinner, or the preview card for a freshly enriched tea
type SheetPhase = 'list' | 'enriching' | 'preview';

// which slice of the catalogue the list shows
type TeaScope = 'all' | 'moodbrew' | 'custom';

const SCOPE_OPTIONS: { key: TeaScope; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'moodbrew', label: 'MoodBrew' },
  { key: 'custom', label: 'My teas' },
];

export default function TeaPickerSheet({
  visible,
  teas,
  onSelect,
  onClose,
  onTeaCreated,
  onTeaDeleted,
}: TeaPickerSheetProps) {
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<TeaScope>('all');
  const [phase, setPhase] = useState<SheetPhase>('list');
  const [previewTea, setPreviewTea] = useState<Tea | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // the modal stays mounted through the close animation, a beat after the
  // owning screen has already flipped `visible` back to false
  const [modalVisible, setModalVisible] = useState(visible);
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslate = useRef(new Animated.Value(SHEET_TRANSLATE_START)).current;
  const reduceMotion = useReduceMotion();

  // a fresh open always starts back at the plain unfiltered list
  useEffect(() => {
    if (visible) {
      setQuery('');
      setScope('all');
      setPhase('list');
      setPreviewTea(null);
      setErrorMessage(null);
      setModalVisible(true);

      if (reduceMotion) {
        backdropOpacity.setValue(1);
        sheetTranslate.setValue(0);
      } else {
        backdropOpacity.setValue(0);
        sheetTranslate.setValue(SHEET_TRANSLATE_START);
        Animated.parallel([
          Animated.timing(backdropOpacity, {
            toValue: 1,
            duration: motion.durationFast,
            easing: motion.easeOut,
            useNativeDriver: true,
          }),
          Animated.timing(sheetTranslate, {
            toValue: 0,
            duration: motion.durationSlow,
            easing: motion.easeDrawer,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
  }, [visible]);

  // fades the scrim and slides the sheet back down before actually closing,
  // so the sheet is never yanked away mid gesture
  const handleClose = () => {
    if (reduceMotion) {
      setModalVisible(false);
      onClose();
      return;
    }
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: motion.durationFast,
        easing: motion.easeIn,
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslate, {
        toValue: SHEET_TRANSLATE_START,
        duration: motion.durationFast,
        easing: motion.easeIn,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false);
      onClose();
    });
  };

  const filteredTeas = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return teas.filter((tea) => {
      if (scope === 'custom' && !tea.is_custom) return false;
      if (scope === 'moodbrew' && tea.is_custom) return false;
      if (!needle) return true;
      return (
        tea.Name.toLowerCase().includes(needle) ||
        tea.Category.toLowerCase().includes(needle)
      );
    });
  }, [teas, query, scope]);

  const trimmedQuery = query.trim();
  // the "add it to moodbrew" prompt never fires while browsing only your
  // own teas, an empty result there just means you haven't made one yet
  const showUniqueTastePrompt =
    phase === 'list' && scope !== 'custom' && trimmedQuery.length > 1 && filteredTeas.length === 0;

  const handleDeleteCustomTea = (tea: Tea) => {
    Alert.alert(
      `Delete ${tea.Name}?`,
      'It comes off your shelf too. Journal entries keep the name.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCustomTea(tea.Name);
              onTeaDeleted?.(tea);
              showToast(`${tea.Name} deleted`);
            } catch (error) {
              showToast((error as Error).message);
            }
          },
        },
      ],
    );
  };

  const handleAddCustomTea = async () => {
    setPhase('enriching');
    setErrorMessage(null);
    try {
      const result = await createCustomTea(trimmedQuery);
      if (!result.alreadyExisted) {
        onTeaCreated?.(result.tea);
      }
      setPreviewTea(result.tea);
      setPhase('preview');
    } catch (error) {
      setErrorMessage((error as Error).message);
      setPhase('list');
    }
  };

  const handleConfirmPreview = () => {
    if (previewTea) onSelect(previewTea);
  };

  return (
    <Modal visible={modalVisible} transparent animationType="none" onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View style={[s.backdrop, { opacity: backdropOpacity }]}>
          {/* the sheet rides up with the keyboard so the search box and the
              list stay visible while typing */}
          <KeyboardAvoidingView
            style={s.backdropKeyboard}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <TouchableWithoutFeedback>
              <Animated.View style={[s.sheet, { transform: [{ translateY: sheetTranslate }] }]}>
                <View style={s.handle} />
              <Text style={s.title}>Choose a tea</Text>

              {phase === 'list' && (
                <>
                  <TextInput
                    style={s.searchInput}
                    value={query}
                    onChangeText={(text) => {
                      setQuery(text);
                      setErrorMessage(null);
                    }}
                    placeholder="Search your tea..."
                    placeholderTextColor={colors['brand-text-200']}
                    autoCorrect={false}
                    autoCapitalize="words"
                  />

                  {/* scope filter: everything, the built in catalogue, or
                      only the drinker's own custom teas */}
                  <View style={s.scopeRow}>
                    {SCOPE_OPTIONS.map(({ key, label }) => {
                      const active = scope === key;
                      return (
                        <TouchableOpacity
                          key={key}
                          style={[s.scopeChip, active && s.scopeChipActive]}
                          activeOpacity={0.8}
                          onPress={() => setScope(key)}
                        >
                          <Text style={[s.scopeChipText, active && s.scopeChipTextActive]}>
                            {label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {errorMessage && <Text style={s.errorText}>{errorMessage}</Text>}

                  {showUniqueTastePrompt ? (
                    <View style={s.uniqueTasteBox}>
                      <Text style={s.uniqueTasteTitle}>You have unique taste</Text>
                      <Text style={s.uniqueTasteBody}>
                        “{trimmedQuery}” isn’t in our database yet. Want us to steep up its
                        profile and add it to your collection?
                      </Text>
                      <PressableScale style={s.uniqueTasteButton} onPress={handleAddCustomTea}>
                        <Text style={s.uniqueTasteButtonText}>Add it to MoodBrew</Text>
                      </PressableScale>
                    </View>
                  ) : (
                    <FlatList
                      data={filteredTeas}
                      keyExtractor={(tea) => tea.Name}
                      keyboardShouldPersistTaps="handled"
                      renderItem={({ item }) => (
                        <View style={s.rowWrap}>
                          <TouchableOpacity
                            style={s.row}
                            activeOpacity={0.7}
                            onPress={() => onSelect(item)}
                          >
                            <View style={s.rowNameLine}>
                              <Text style={s.rowName}>{item.Name}</Text>
                              {item.is_custom && <Text style={s.customTag}>custom</Text>}
                            </View>
                            <Text style={s.rowCategory}>{item.Category}</Text>
                          </TouchableOpacity>
                          {item.is_custom && (
                            <TouchableOpacity
                              style={s.deleteBtn}
                              activeOpacity={0.7}
                              onPress={() => handleDeleteCustomTea(item)}
                              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                              <Text style={s.deleteBtnText}>remove</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      )}
                      ListEmptyComponent={
                        <Text style={s.emptyText}>
                          {scope === 'custom' ? 'no custom teas yet' : 'no teas found'}
                        </Text>
                      }
                    />
                  )}
                </>
              )}

              {phase === 'enriching' && (
                <View style={s.enrichingBox}>
                  <ActivityIndicator color={colors['accent-olive']} />
                  <Text style={s.enrichingText}>
                    Steeping up a profile for “{trimmedQuery}”...
                  </Text>
                </View>
              )}

              {phase === 'preview' && previewTea && (
                <View style={s.previewBox}>
                  <View style={s.rowNameLine}>
                    <Text style={s.previewName}>{previewTea.Name}</Text>
                    {previewTea.is_custom && <Text style={s.customTag}>custom</Text>}
                  </View>
                  <Text style={s.previewMeta}>{previewTea.Category}</Text>
                  <Text style={s.previewMeta}>
                    {formatCaffeineMg(previewTea.Caffeine_Level)}
                  </Text>
                  <Text style={s.previewMeta}>{previewTea.Traditional_Brew_Specs}</Text>
                  <Text style={s.previewNotes}>{previewTea.Raw_Flavor_Notes}</Text>

                  <PressableScale style={s.uniqueTasteButton} onPress={handleConfirmPreview}>
                    <Text style={s.uniqueTasteButtonText}>Add to my shelf</Text>
                  </PressableScale>
                  <TouchableOpacity
                    style={s.previewCancel}
                    activeOpacity={0.7}
                    onPress={() => {
                      setPhase('list');
                      setQuery('');
                    }}
                  >
                    <Text style={s.previewCancelText}>Back to the list</Text>
                  </TouchableOpacity>
                </View>
              )}
              </Animated.View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
