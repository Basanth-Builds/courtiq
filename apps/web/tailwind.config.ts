import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Court IQ Brand — derived from logo
        brand: {
          green:   '#8DC63F',   // neon court-green (logo accent)
          'green-light': '#A8D55A',
          'green-dark':  '#6BA32A',
          slate:   '#2C3340',   // deep slate (logo text)
          'slate-light': '#3D4759',
          charcoal:'#1A1F28',
          white:   '#FFFFFF',
        },
        court: {
          surface:  '#F4F7F0',
          line:     '#8DC63F',
          dark:     '#1A1F28',
        },
      },
      fontFamily: {
        sans:    ['Inter var', 'Inter', 'sans-serif'],
        display: ['Cal Sans', 'Inter var', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      animation: {
        'score-pop': 'scorePop 0.3s ease-out',
        'slide-up':  'slideUp 0.4s ease-out',
        'pulse-green': 'pulseGreen 2s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
      },
      keyframes: {
        scorePop: {
          '0%':   { transform: 'scale(1)' },
          '50%':  { transform: 'scale(1.25)', color: '#8DC63F' },
          '100%': { transform: 'scale(1)' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGreen: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(141,198,63,0.4)' },
          '50%':      { boxShadow: '0 0 0 12px rgba(141,198,63,0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('tailwindcss-animate'),
  ],
}

export default config
