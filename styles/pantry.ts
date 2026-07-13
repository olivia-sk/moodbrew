// layout constants and tailwind class strings for the pantry screen.
//
// all numbers come from the figma frame 233:327 measured at 390x844.
// the shelf image asset is cropped to its wood bounding box, and the
// design renders that wood area at 358x550 inside a frame with 16px
// side padding. slot rows sit flush on each shelf board:
// rows at y 96, 232, 354, 482 relative to the wood top, each 40 tall.
// slot columns start 43 in from the left, 50 wide with 24px gaps.
import { Dimensions, DimensionValue } from 'react-native';

// design reference sizes for the rendered wood area
const DESIGN_SHELF_W = 358;
const DESIGN_SHELF_H = 550;

// reads the actual device width so the shelf scales with the screen,
// preserving the same stretch the design applies to the image
const { width: screenWidth } = Dimensions.get('window');

export const SHELF_WIDTH  = screenWidth - 32;
export const SHELF_HEIGHT = SHELF_WIDTH * (DESIGN_SHELF_H / DESIGN_SHELF_W);

// slot geometry scaled from the design so alignment holds on any width.
// on a 375 wide screen the slot height lands near 52 which stays above
// the 40px minimum touch target
export const SLOT_W   = SHELF_WIDTH  * (50 / DESIGN_SHELF_W);
export const SLOT_H   = SHELF_HEIGHT * (40 / DESIGN_SHELF_H);
export const SLOT_GAP = SHELF_WIDTH  * (24 / DESIGN_SHELF_W);

// vertical top position for each of the 4 slot rows as a percent of the
// shelf height: 96, 232, 354 and 482 out of 550
export const SLOT_ROW_TOPS: DimensionValue[] = [
  '17.45%' as DimensionValue,
  '42.18%' as DimensionValue,
  '64.36%' as DimensionValue,
  '87.64%' as DimensionValue,
];

// left inset for slot rows: 43 out of 358
export const SLOT_INSET: DimensionValue = '12.01%' as DimensionValue;

export const pantryStyles = {
  // root content wrapper
  content: 'flex-1 px-[16px] gap-xl',

  // header: title + subtitle
  header:   'pt-lg gap-xs',
  title:    'font-serif text-h1 text-accent-olive',
  subtitle: 'font-mono text-mono-small text-brand-text-200 uppercase tracking-[1px]',

  // shelf wrapper: centred so the oversized image stays horizontally aligned
  shelfWrap: 'flex-1 items-center',

  // slot rows absolutely positioned inside the ImageBackground
  slotRow: 'absolute flex-row items-center',
  slot:    'bg-[rgba(255,255,255,0.20)]',
  slotGap: '',

  // label inside a filled slot
  slotLabel: 'font-mono text-mono-small text-brand-text-100 text-center px-[2px]',
};
