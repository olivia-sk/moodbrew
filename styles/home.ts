// layout constants and tailwind class strings for the home screen.
import { DimensionValue } from 'react-native';

// shelf geometry
const SHELF_W = 358;
const SHELF_H = 267;

// vertical top position (as % of shelf height) for each of the 3 slot rows.
// exported so home.tsx can iterate them inside the ImageBackground.
export const SLOT_ROW_TOPS: DimensionValue[] = [
  `${(51  / SHELF_H * 100).toFixed(2)}%` as DimensionValue,  // 19.10%
  `${(130 / SHELF_H * 100).toFixed(2)}%` as DimensionValue,  // 48.69%
  `${(206 / SHELF_H * 100).toFixed(2)}%` as DimensionValue,  // 77.15%
];

// left/right inset for slot rows (12.01% of shelf width, symmetric)
export const SLOT_INSET: DimensionValue = `${(43 / SHELF_W * 100).toFixed(2)}%` as DimensionValue;

export const homeStyles = {
  // root content wrapper with horizontal padding and gap between sections
  content: 'flex-1 px-[20px] gap-xl',

  // header row: date + greeting left, settings icon right
  header:     'flex-row justify-between items-start pt-lg',
  headerLeft: 'gap-xs',
  date:       'font-mono text-mono text-brand-text-200',
  greeting:   'font-mono text-mono text-brand-text-100 leading-[19.5px]',
  settingsBtn:'p-xs',

  // shelf section
  section: 'gap-md',

  // shelf ImageBackground: full width, aspect-ratio-driven height
  shelf: 'w-full',

  // slot rows absolutely positioned inside the ImageBackground
  slotRow: 'absolute flex-row items-center',
  slot:    'bg-[rgba(255,255,255,0.20)]',
  slotGap: '',

  // feature cards row at the bottom
  featureRow: 'flex-1 flex-row justify-between items-stretch gap-sm pb-xl',
};
