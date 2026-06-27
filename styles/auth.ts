// shared style tokens for all auth screens: welcome, sign in, sign up, name.

export const authStyles = {
  // root
  safe:    'flex-1 bg-light-100',
  content: 'flex-1 px-[20px] pb-[48px]',

  // top section - wordmark + doodle centred in the upper half
  topSection: 'flex-1 justify-center items-center gap-xl',

  // wordmark: instrument serif 42px olive
  wordmark: 'font-serif text-display text-accent-olive text-center',

  // "what should we call you?" - same font, left aligned
  question: 'font-serif text-display text-accent-olive',

  // name screen layout
  nameTop: 'pt-[64px] gap-xl',

  // form
  form:  'gap-[12px]',
  input: 'bg-light-100 border border-brand-text-200 rounded-xs py-xl px-xl font-mono text-body-small text-brand-text-100',

  // forgot password link
  forgotLink: 'font-mono text-body-small text-accent-olive uppercase underline',

  // bottom section wraps buttons + footer
  bottomSection: 'gap-xl',

  // buttons
  primaryBtn:    'bg-dark-100 rounded-xs py-xl items-center justify-center min-h-[64px]',
  primaryBtnRow: 'bg-dark-100 rounded-xs py-xl flex-row items-center justify-center gap-sm min-h-[64px]',
  primaryBtnText:'font-mono text-body-small text-light-100 uppercase',

  outlineBtn:     'bg-light-100 border border-brand-text-200 rounded-xs py-xl items-center justify-center min-h-[64px]',
  outlineBtnText: 'font-mono text-body-small text-brand-text-100 uppercase',

  // footer row
  footerRow:  'flex-row justify-center items-center flex-wrap gap-[4px]',
  footerMuted:'font-mono text-body-small text-brand-text-100 uppercase',
  footerLink: 'font-mono text-body-small text-accent-olive uppercase underline',
};
