// layout constants and tailwind class strings for the pantry screen.
import { Dimensions, DimensionValue } from 'react-native';

// reads the actual device dimensions so the shelf scales to the screen
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// target scale ratios pulled from the figma frame (390x844)
export const SHELF_WIDTH  = screenWidth  * 0.917;
export const SHELF_HEIGHT = screenHeight * 0.651;

// vertical top position (as % of shelf height) for each of the 4 slot rows
export const SLOT_ROW_TOPS: DimensionValue[] = [
  '10%' as DimensionValue,
  '35%' as DimensionValue,
  '60%' as DimensionValue,
  '85%' as DimensionValue,
];

// left/right inset for slot rows (mirrors home proportions)
export const SLOT_INSET: DimensionValue = `${(43 / 358 * 100).toFixed(2)}%` as DimensionValue;

export const pantryStyles = {
  // root content wrapper
  content: 'flex-1 px-[20px] gap-xl',

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
