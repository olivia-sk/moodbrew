/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.tsx",
    "./screens/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./styles/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // neutrals
        'light-100':     '#FFFFFF',
        'light-200':     '#F7F7F7',
        'light-300':     '#D9D9D9',
        'light-400':     '#BDBDBD',
        'light-500':     '#5B5B5B',
        'dark-100':      '#121212',
        // brand text
        'brand-text-100': '#121212',
        'brand-text-200': '#BDBDBD',
        // accent
        'accent-olive':  '#8A9900',
      },
      fontFamily: {
        serif: ['InstrumentSerif_400Regular'],
        mono:  ['IBMPlexMono_400Regular'],
      },
      fontSize: {
        'display':    [42, { lineHeight: 46.2 }],
        'h1':         [32, { lineHeight: 40 }],
        'h2':         [26, { lineHeight: 29.9 }],
        'h3':         [20, { lineHeight: 24 }],
        'body-large': [18, { lineHeight: 27 }],
        'body':       [16, { lineHeight: 24 }],
        'body-small': [14, { lineHeight: 22.4 }],
        'label':      [13, { lineHeight: 18 }],
        'mono':       [13, { lineHeight: 19.5 }],
        'mono-small': [11, { lineHeight: 16 }],
      },
      spacing: {
        'xs':                 4,
        'sm':                 8,
        'md':                 12,
        'lg':                 16,
        'xl':                 24,
        '2xl':                32,
        '3xl':                48,
        '4xl':                64,
        'stack-gap':          12,
        'padding-horizontal': 20,
        'card-padding':       20,
        'padding-vertical':   32,
      },
      letterSpacing: {
        'tight-display': '-1.26px',
        'tight-h1':      '-0.96px',
        'tight-h2':      '-0.78px',
        'wide-mono':     '1px',
        'wide-btn':      '0.5px',
      },
      borderRadius: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '14px',
        'xl': '16px',
      },
    },
  },
  plugins: [],
}
