// shared tailwind class strings used across multiple screens.

export const layout = {
  // full-screen white safe area
  safe: 'flex-1 bg-light-100',

  // standard scrollable page content
  scroll: 'px-[16px] pb-[48px] gap-[32px]',

  // row that fills width with space between two items
  rowBetween: 'flex-row justify-between items-start',
};

export const text = {
  // display-size serif for wordmarks and hero labels
  display: 'font-serif text-display text-brand-text-100',

  // h1 serif for section titles
  h1: 'font-serif text-h1 text-accent-olive',

  // h2 serif for card titles
  h2: 'font-serif text-h2 text-brand-text-100',

  // standard body copy
  body: 'font-mono text-body text-brand-text-100',

  // small body copy
  bodySmall: 'font-mono text-body-small text-light-500',

  // mono uppercase eyebrow / label
  monoLabel: 'font-mono text-mono-small text-brand-text-200 uppercase tracking-[1px]',

  // mono base for dates, metadata, nav labels
  mono: 'font-mono text-mono text-brand-text-100',

  // muted mono variant
  monoMuted: 'font-mono text-mono text-brand-text-200',
};

export const card = {
  // standard bordered card
  base: 'bg-light-200 border border-light-300 rounded-xs p-[20px]',

  // card with white background
  white: 'bg-light-100 border border-light-300 rounded-xl p-[20px]',
};
