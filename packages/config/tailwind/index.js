/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [],
  theme: {
    extend: {
      colors: {
        // Court IQ Brand Tokens — extracted from logo
        brand: {
          green: {
            DEFAULT: '#84CC16',  // Primary neon-green (logo accent)
            50:  '#F7FEE7',
            100: '#ECFCCB',
            200: '#D9F99D',
            300: '#BEF264',
            400: '#A3E635',
            500: '#84CC16', // Main brand green
            600: '#65A30D',
            700: '#4D7C0F',
            800: '#3F6212',
            900: '#365314',
          },
          slate: {
            DEFAULT: '#1E293B', // Dark slate — logo text colour
            50:  '#F8FAFC',
            100: '#F1F5F9',
            200: '#E2E8F0',
            300: '#CBD5E1',
            400: '#94A3B8',
            500: '#64748B',
            600: '#475569',
            700: '#334155',
            800: '#1E293B', // Primary dark
            900: '#0F172A',
          },
          court: '#0A0F1E',    // Near-black court background
          surface: '#141926',  // Card/panel background
          border: '#1E2D40',   // Subtle border colour
        }
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
        display: ['var(--font-outfit)', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'court': '0.75rem',
      },
      boxShadow: {
        'court': '0 0 0 1px rgba(132, 204, 22, 0.12), 0 4px 24px rgba(0,0,0,0.4)',
        'court-glow': '0 0 20px rgba(132, 204, 22, 0.25)',
      },
      animation: {
        'score-pop': 'scorePop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'fade-up': 'fadeUp 0.4s ease-out',
        'pulse-green': 'pulseGreen 2s infinite',
      },
      keyframes: {
        scorePop: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        fadeUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGreen: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(132, 204, 22, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(132, 204, 22, 0)' },
        },
      }
    }
  },
  plugins: []
}
