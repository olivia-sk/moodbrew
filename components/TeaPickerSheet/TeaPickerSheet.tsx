// bottom sheet overlay listing the master tea list, used to assign a tea
// to an empty pantry shelf slot
import React from 'react';
import { FlatList, Modal, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { Tea } from '../../lib/types';
import { teaPickerSheetStyles as s } from './styles';

interface TeaPickerSheetProps {
  visible: boolean;
  teas: Tea[];
  onSelect: (tea: Tea) => void;
  onClose: () => void;
}

export default function TeaPickerSheet({ visible, teas, onSelect, onClose }: TeaPickerSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={s.backdrop}>
          <TouchableWithoutFeedback>
            <View style={s.sheet}>
              <View style={s.handle} />
              <Text style={s.title}>Choose a tea</Text>

              <FlatList
                data={teas}
                keyExtractor={(tea) => tea.Name}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={s.row}
                    activeOpacity={0.7}
                    onPress={() => onSelect(item)}
                  >
                    <Text style={s.rowName}>{item.Name}</Text>
                    <Text style={s.rowCategory}>{item.Category}</Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={<Text style={s.emptyText}>no teas found</Text>}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
