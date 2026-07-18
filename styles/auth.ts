// shared style tokens for all auth screens: welcome, sign in, sign up, name.
// values come from the figma frames measured at 390x844. the ios status bar
// of roughly 59px is excluded, so paddings here are relative to the safe area.

export const authStyles = {
  // root note: nativewind does not interop SafeAreaView, so the screens
  // give it a plain style object instead of a class string
  safe: { flex: 1, backgroundColor: '#FFFFFF' } as const,
  content: 'flex-1 px-[16px]',

  // wordmark and doodle grouped at the top of sign in and sign up
  topSection: 'items-center pt-[104px]',
  // the welcome screen sits the same group a little lower
  topSectionWelcome: 'items-center pt-[125px]',
  wordmark: 'font-serif text-display text-accent-olive text-center',
  // the 56px design gap is measured from the glyph bottom, the text box
  // carries about 16px of extra leading so the margin compensates
  doodleWrap: 'mt-[40px]',

  // name screen: one centered serif question line
  nameContent: 'flex-1 px-[16px] pt-[211px]',
  question: 'font-serif text-[38px] leading-[44px] text-accent-olive text-center',
  nameInputGap: 'mt-[76px]',

  // form
  form: 'mt-[67px] gap-[13px]',
  // inputs stay at 16px so ios safari on web doesn't zoom the page on focus
  input: 'h-[56px] bg-light-100 border border-dark-100 rounded-xs px-xl font-mono text-body text-brand-text-100',
  inputCentered: 'text-center',

  // forgot password link
  forgotWrap: 'mt-[24px] self-start',
  forgotLink: 'font-mono text-body-small text-accent-olive uppercase underline',

  // buttons
  btnGap: 'mt-[49px]',
  // variant used under the forgot password link whose text box leading
  // already eats part of the 49px design gap
  btnGapAfterLink: 'mt-[39px]',
  welcomeButtons: 'mt-[128px] gap-[18px]',
  primaryBtn: 'h-[56px] bg-dark-100 rounded-xs items-center justify-center',
  primaryBtnRow: 'h-[56px] bg-dark-100 rounded-xs flex-row items-center justify-center gap-sm',
  primaryBtnText: 'font-mono text-body-small text-light-100 uppercase',
  outlineBtn: 'h-[56px] bg-light-100 border border-brand-text-200 rounded-xs items-center justify-center',
  outlineBtnText: 'font-mono text-body-small text-brand-text-100 uppercase',

  // footer row pinned near the bottom on sign in
  footerSpacer: 'flex-1',
  footerRow: 'flex-row justify-center items-center flex-wrap gap-[4px] pb-[38px]',
  footerMuted: 'font-mono text-body-small text-brand-text-100 uppercase',
  footerLink: 'font-mono text-body-small text-accent-olive uppercase',
};
