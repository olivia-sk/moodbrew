// shared style tokens for all auth screens: welcome, sign in, sign up, name.

export const authStyles = {
  // root
  safe: 'flex-1 bg-light-100',

  // content is anchored to the top with a fixed top padding, everything
  // stacks from there with consistent gaps, any leftover space is simply
  // left empty at the bottom rather than centred or pushed around
  content: 'flex-1 px-[20px] pt-[64px] pb-[48px] gap-xl',

  // top section: wordmark + doodle, horizontally centred, grouped together
  topSection: 'items-center gap-xl',

  // wordmark: instrument serif 42px olive
  wordmark: 'font-serif text-display text-accent-olive text-center',

  // "what should we call you?" - same font, left aligned
  question: 'font-serif text-display text-accent-olive',

  // name screen layout: question, input, and continue button grouped
  // together right under the top padding, same as the other auth screens
  nameTop: 'gap-xl',

  // form
  form:  'gap-[12px]',
  input: 'bg-light-100 border border-brand-text-200 rounded-xs py-xl px-xl font-mono text-body-small text-brand-text-100',

  // forgot password link
  forgotLink: 'font-mono text-body-small text-accent-olive uppercase underline',

  // bottom section wraps the form + primary button
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
