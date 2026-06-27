// tailwind class strings for the kettle screen.
export const kettleStyles = {
  // full height container with horizontal padding
  content: 'flex-1 px-[20px] pb-xl',

  // back row
  backRow:   'flex-row items-center gap-xs pt-lg pb-[32px]',
  backArrow: 'font-mono text-body text-brand-text-100',
  backLabel: 'font-mono text-body-small text-brand-text-100',

  // state 1 card header: tea name + card number
  cardHeaderRow: 'flex-row justify-between items-start',
  heroTitle:     'flex-1 font-serif text-h1 text-accent-olive',
  cardNumber:    'font-mono text-mono-small text-accent-olive',

  // field rows: brew specs, caffeine level, flavour notes
  field:      'gap-xs',
  fieldLabel: 'font-mono text-mono-small text-brand-text-200 uppercase tracking-[1px]',
  fieldValue: 'font-mono text-body-small text-brand-text-100 leading-[22.4px]',

  // state 2 timer box: centred countdown, replaces the card stack
  timerBox:    'flex-1 border border-light-400 rounded-lg bg-light-100 items-center justify-center gap-lg mb-xl',
  timerHeading:'font-serif text-h2 text-accent-olive',
  timerClock:  'font-mono text-h1 text-brand-text-100 tracking-[1px]',

  // shared action button
  actionButton:     'bg-dark-100 rounded-xs py-xl items-center justify-center min-h-[64px]',
  actionButtonText: 'font-mono text-body-small text-light-100 uppercase',
};
