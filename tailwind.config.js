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
        'brand-brown':   '#312310',
      },
      fontFamily: {
        serif: ['InstrumentSerif_400Regular'],
        mono:  ['IBMPlexMono_400Regular'],
      },
      fontSize: {
        'display':    ['42px', { lineHeight: '46.2px' }],
        'h1':         ['32px', { lineHeight: '40px' }],
        'h2':         ['26px', { lineHeight: '29.9px' }],
        'h3':         ['20px', { lineHeight: '24px' }],
        'body-large': ['18px', { lineHeight: '27px' }],
        'body':       ['16px', { lineHeight: '24px' }],
        'body-small': ['14px', { lineHeight: '22.4px' }],
        'label':      ['13px', { lineHeight: '18px' }],
        'mono':       ['13px', { lineHeight: '19.5px' }],
        'mono-small': ['11px', { lineHeight: '16px' }],
      },
      spacing: {
        'xs':                 '4px',
        'sm':                 '8px',
        'md':                 '12px',
        'lg':                 '16px',
        'xl':                 '24px',
        '2xl':                '32px',
        '3xl':                '48px',
        '4xl':                '64px',
        'stack-gap':          '12px',
        'padding-horizontal': '20px',
        'card-padding':       '20px',
        'padding-vertical':   '32px',
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
