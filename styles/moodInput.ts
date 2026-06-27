// tailwind class strings for the mood input screen.

export const moodInputStyles = {
  content: 'flex-1 px-[20px] pb-xl gap-xl',

  // back row
  backRow:   'flex-row items-center gap-xs pt-lg',
  backArrow: 'font-mono text-body text-brand-text-100',
  backLabel: 'font-mono text-body-small text-brand-text-100',

  // heading
  title: 'font-serif text-display text-accent-olive',

  // section wrapper
  section:      'gap-md',
  sectionLabel: 'font-mono text-mono-small text-brand-text-200 uppercase tracking-[1px]',

  // 2-column mood tag grid
  // figma shows tags at w=163 in a 358px container, with a 32px gap between columns
  moodGrid:            'flex-row flex-wrap gap-md',
  moodButton:          'w-[47%] border border-brand-text-200 rounded-xs py-xl px-md bg-light-100',
  moodButtonActive:    'bg-dark-100 border-dark-100',
  moodButtonText:      'font-mono text-body-small text-brand-text-100 uppercase',
  moodButtonTextActive:'text-light-100',

  // pushes the action button toward the bottom
  spacer: 'flex-1',

  // action button (find my tea)
  actionButton:     'bg-dark-100 rounded-xs py-xl items-center justify-center min-h-[64px]',
  actionButtonText: 'font-mono text-body-small text-light-100 uppercase',
};
