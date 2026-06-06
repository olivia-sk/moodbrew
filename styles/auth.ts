/**
 * styles/auth.ts
 * Shared styles for all auth screens: Welcome, SignIn, SignUp, Name.
 * Faithfully converts the Figma design tokens to React Native StyleSheet.
 */
import { StyleSheet } from 'react-native';
import { colors, spacing, fontSize, fonts } from '../theme';

export const authStyles = StyleSheet.create({

  // ── Root ────────────────────────────────────────────────────────────────────
  safe: {
    flex:            1,
    backgroundColor: colors['light-100'],
  },

  /**
   * Main content area.
   * flex: 1 fills the safe area. paddingHorizontal matches the app's 20px grid.
   * paddingBottom gives the bottom buttons breathing room above the home bar.
   */
  content: {
    flex:              1,
    paddingHorizontal: spacing['padding-horizontal'],  // 20px
    paddingBottom:     spacing['3xl'],                 // 48px
  },

  // ── Title section ───────────────────────────────────────────────────────────
  /**
   * flex: 1 pushes the bottom section (form / buttons) to the bottom of the
   * screen. On Welcome and Sign In this centres the wordmark vertically in
   * the top ~60% of the viewport, matching the Figma.
   */
  topSection: {
    flex:           1,
    justifyContent: 'center',
    alignItems:     'center',
  },

  /** "Mood Brew" — Instrument Serif 42px, centered */
  wordmark: {
    fontFamily:    fonts.serif,
    fontSize:      fontSize.display,   // 42px
    color:         colors['brand-text-100'],
    letterSpacing: -1.26,
    textAlign:     'center',
  },

  /** "What should we call you?" — same font, left-aligned, wrapping */
  question: {
    fontFamily:    fonts.serif,
    fontSize:      fontSize.display,   // 42px
    color:         colors['brand-text-100'],
    letterSpacing: -1.26,
  },

  // ── Name screen layout ──────────────────────────────────────────────────────
  /**
   * Groups the question + input together at the top of the content area,
   * leaving the Continue button naturally at the bottom via space-between.
   */
  nameTop: {
    paddingTop: spacing['4xl'],   // 64px from top — mirrors Figma y=271
    gap:        spacing.xl,       // 24px between question and input
  },

  // ── Form ────────────────────────────────────────────────────────────────────
  /** Container for the stacked inputs + optional forgot-password row */
  form: {
    gap: spacing['stack-gap'],    // 12px between inputs
  },

  /**
   * Input field — matches Figma:
   * white bg · 1px #bdbdbd border · 4px radius · 24px padding all sides
   * Font: FFF Acid Grotesk 14px
   */
  input: {
    backgroundColor: colors['light-100'],
    borderWidth:     1,
    borderColor:     colors['brand-text-200'],
    borderRadius:    spacing.xs,   // 4px
    paddingVertical: spacing.xl,   // 24px
    paddingHorizontal: spacing.xl,
    fontFamily:      fonts.sans,
    fontSize:        fontSize['body-small'],   // 14px
    color:           colors['brand-text-100'],
  },

  /** "Forgot password" underlined text */
  forgotLink: {
    fontFamily:         fonts.sans,
    fontSize:           fontSize['body-small'],
    color:              colors['brand-text-100'],
    textDecorationLine: 'underline',
  },

  // ── Bottom section ───────────────────────────────────────────────────────────
  /**
   * Wraps form + primary button + footer.
   * gap: xl (24px) between each block.
   */
  bottomSection: {
    gap: spacing.xl,
  },

  // ── Buttons ─────────────────────────────────────────────────────────────────
  /**
   * Primary — dark fill (#121212), white text.
   * Figma: border-radius 4px · padding-vertical 24px · full width.
   */
  primaryBtn: {
    backgroundColor: colors['dark-100'],
    borderRadius:    spacing.xs,
    paddingVertical: spacing.xl,
    alignItems:      'center',
    justifyContent:  'center',
    minHeight:       64,           // consistent tap target
  },
  primaryBtnText: {
    fontFamily: fonts.sans,
    fontSize:   fontSize['body-small'],
    color:      colors['light-100'],
  },

  /**
   * Outline — white fill, #bdbdbd border.
   * Used for "Continue with Email" on the Welcome screen.
   */
  outlineBtn: {
    backgroundColor: colors['light-100'],
    borderWidth:     1,
    borderColor:     colors['brand-text-200'],
    borderRadius:    spacing.xs,
    paddingVertical: spacing.xl,
    alignItems:      'center',
    justifyContent:  'center',
    minHeight:       64,
  },
  outlineBtnText: {
    fontFamily: fonts.sans,
    fontSize:   fontSize['body-small'],
    color:      colors['brand-text-100'],
  },

  // ── Footer ──────────────────────────────────────────────────────────────────
  /** "New here?  Sign up" / "Already have an account?  Sign in" */
  footerRow: {
    flexDirection:  'row',
    justifyContent: 'center',
    alignItems:     'center',
    flexWrap:       'wrap',
    gap:            4,
  },
  footerMuted: {
    fontFamily: fonts.sans,
    fontSize:   fontSize['body-small'],
    color:      colors['light-500'],    // #5B5B5B
  },
  footerLink: {
    fontFamily:         fonts.sans,
    fontSize:           fontSize['body-small'],
    color:              colors['brand-text-100'],
    textDecorationLine: 'underline',
  },
});
