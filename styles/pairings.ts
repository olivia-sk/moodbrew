// tailwind class strings for the pairings + tasting journal screen.

export const pairingsStyles = {
  safe: 'flex-1 bg-light-100',

  // back row, sits outside the scroll so it is always visible
  backRow:   'flex-row items-center gap-xs px-[20px] pt-lg',
  backArrow: 'font-mono text-body text-brand-text-100',
  backLabel: 'font-mono text-body-small text-brand-text-100',

  scroll: 'px-[20px] pt-lg pb-[32px] gap-xl',

  title: 'font-serif text-h1 text-accent-olive',

  // section card used by pairings, tasting notes, thoughts
  section:      'border border-light-400 rounded-lg bg-light-100 p-xl gap-xl',
  sectionLabel: 'font-mono text-body-small text-brand-text-100 uppercase tracking-[1px]',

  // field: label + value pairs
  field:      'gap-xs',
  fieldLabel: 'font-mono text-mono-small text-brand-text-200 uppercase tracking-[1px]',
  subLabel:   'font-mono text-mono-small text-light-500 uppercase tracking-[1px]',
  fieldValue: 'font-mono text-body-small text-brand-text-100 leading-[22.4px]',

  // spotify embed
  spotifyEmbed: 'w-full h-[80px] rounded-xl',

  // tasting notes
  sliderField:  'gap-sm',
  flavoursWrap: 'flex-row flex-wrap gap-sm',

  chip:           'border border-light-400 rounded-xs py-sm px-lg',
  chipActive:     'bg-dark-100 border-dark-100',
  chipText:       'font-mono text-body-small text-brand-text-100 uppercase',
  chipTextActive: 'text-light-100',

  addChip:      'border border-light-400 border-dashed rounded-xs py-sm px-lg',
  addChipInput: 'font-mono text-body-small text-brand-text-100 min-w-[80px] p-0',

  // notes input with dashed bottom border
  notesInput: 'font-mono text-body-small text-brand-text-100 uppercase leading-[22.4px] border-b border-light-400 border-dashed pb-md min-h-[64px]',

  // footer holds the log button above the home indicator
  footer:           'px-[20px] pb-xl pt-sm',
  actionButton:     'bg-dark-100 rounded-xs py-xl items-center justify-center min-h-[64px]',
  actionButtonText: 'font-mono text-body-small text-light-100 uppercase',
};
