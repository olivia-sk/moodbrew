import { StyleSheet } from 'react-native';
import { colors, fonts } from '../../theme';

// board and slot colors sampled from the figma frames 300:850 and 338:563
export const BOARD_COLOR = '#9C714E';
export const SLOT_COLOR = colors['light-300'];

// slot geometry measured off the 390 wide figma frames: slots are 50x40
// resting on a 9 tall board, with the slot row inset 31 from each board end
export const SLOT_WIDTH = 50;
export const SLOT_HEIGHT = 40;
export const BOARD_HEIGHT = 9;
export const SLOT_ROW_INSET = 31;

export const shelfRowStyles = StyleSheet.create({
  row: {
    width: '100%',
  },
  // slots sit flush on top of the board, spread evenly with an inset so
  // the board reads as wider than the tins resting on it
  slotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SLOT_ROW_INSET,
  },
  slot: {
    width: SLOT_WIDTH,
    height: SLOT_HEIGHT,
    backgroundColor: SLOT_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  board: {
    width: '100%',
    height: BOARD_HEIGHT,
    backgroundColor: BOARD_COLOR,
  },
  slotLabel: {
    fontFamily: fonts.mono,
    fontSize: 8,
    color: colors['brand-text-100'],
    textAlign: 'center',
    paddingHorizontal: 2,
  },
});
