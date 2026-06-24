import type { Config } from 'tailwindcss'

export const baseTailwindConfig: Partial<Config> = {
  darkMode: ['class'],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#A8D634',
          'green-light': '#C4E85A',
          'green-dark': '#86AA28',
          slate: '#2D3142',
          'slate-light': '#3D4252',
          'slate-dark': '#1E2030',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Cal Sans', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
}
