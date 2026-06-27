// tailwind class strings for the match card screen.
export const matchCardStyles = {
  // outer wrapper: full height, horizontal padding, bottom breathing room
  // figma card sits at y=150, buttons at y=680
  content: 'flex-1 px-[20px] pb-xl',

  // back row
  backRow:   'flex-row items-center gap-xs pt-lg pb-[32px]',
  backArrow: 'font-mono text-body text-brand-text-100',
  backLabel: 'font-mono text-body-small text-brand-text-100',

  // card header: tea name left, card number right
  cardHeaderRow: 'flex-row justify-between items-start',
  heroTitle:     'flex-1 font-serif text-h1 text-accent-olive',
  cardNumber:    'font-mono text-mono-small text-accent-olive',

  // label + value rows (origin, category, why this tea)
  field:      'gap-xs',
  fieldLabel: 'font-mono text-mono-small text-brand-text-200 uppercase tracking-[1px]',
  fieldValue: 'font-mono text-body-small text-brand-text-100',
  storyValue: 'font-mono text-body-small text-brand-text-100 leading-[22.4px]',

  // loading state for the story
  storyLoading: 'items-start py-sm',

  // start brewing button
  actionButton:     'bg-dark-100 rounded-xs py-xl items-center justify-center min-h-[64px]',
  actionButtonText: 'font-mono text-body-small text-light-100 uppercase',

  // shuffle row
  shuffleRow:   'flex-row items-center justify-center gap-xs pt-lg',
  shuffleLabel: 'font-mono text-body-small text-brand-text-200',
};
