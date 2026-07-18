// bottom sheet overlay listing the master tea list, used to assign a tea
// to an empty pantry shelf slot. includes a search box, and when a search
// finds nothing the drinker can have their tea added as a private custom
// entry through the tea-enrich edge function
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
import { createCustomTea } from '../../lib/customTea';
import { formatCaffeineMg } from '../../lib/format';
import { Tea } from '../../lib/types';
import { colors } from '../../theme';
import { teaPickerSheetStyles as s } from './styles';

interface TeaPickerSheetProps {
  visible: boolean;
  teas: Tea[];
  onSelect: (tea: Tea) => void;
  onClose: () => void;
  // lets the owning screen add a freshly created custom tea to its cached
  // tea list so it shows up without a refetch
  onTeaCreated?: (tea: Tea) => void;
}

// what the sheet is currently showing: the searchable list, the haiku
// enrichment spinner, or the preview card for a freshly enriched tea
type SheetPhase = 'list' | 'enriching' | 'preview';

export default function TeaPickerSheet({
  visible,
  teas,
  onSelect,
  onClose,
  onTeaCreated,
}: TeaPickerSheetProps) {
  const [query, setQuery] = useState('');
  const [phase, setPhase] = useState<SheetPhase>('list');
  const [previewTea, setPreviewTea] = useState<Tea | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // a fresh open always starts back at the plain list
  useEffect(() => {
    if (visible) {
      setQuery('');
      setPhase('list');
      setPreviewTea(null);
      setErrorMessage(null);
    }
  }, [visible]);

  const filteredTeas = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return teas;
    return teas.filter(
      (tea) =>
        tea.Name.toLowerCase().includes(needle) ||
        tea.Category.toLowerCase().includes(needle),
    );
  }, [teas, query]);

  const trimmedQuery = query.trim();
  const showUniqueTastePrompt = phase === 'list' && trimmedQuery.length > 1 && filteredTeas.length === 0;

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
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        {/* the sheet rides up with the keyboard so the search box and the
            list stay visible while typing */}
        <KeyboardAvoidingView
          style={s.backdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableWithoutFeedback>
            <View style={s.sheet}>
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
                      )}
                      ListEmptyComponent={<Text style={s.emptyText}>no teas found</Text>}
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
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
