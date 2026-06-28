// ============================================================
// Court IQ — Brand Design Tokens
// Extracted from Court IQ logo
// Primary: Neon Court Green (#A8D634)
// Background: Deep Slate (#2D3142)
// ============================================================

export const courtIQTokens = {
  colors: {
    // Primary brand — neon court green from logo
    courtGreen: '#A8D634',
    courtGreenDark: '#7DAF0A',
    courtGreenLight: '#C8F04A',
    courtGreenMuted: '#A8D63433',

    // Slate — dark backgrounds
    slateDeep: '#2D3142',
    slateMid: '#3D4258',
    slateLight: '#4D5270',

    // Neutrals
    white: '#FFFFFF',
    offWhite: '#F8F9FA',
    gray50: '#F4F5F7',
    gray100: '#E8EAED',
    gray200: '#D1D5DB',
    gray400: '#9CA3AF',
    gray600: '#6B7280',
    gray800: '#1F2937',
    black: '#0A0B0F',

    // Semantic
    success: '#A8D634',   // court green doubles as success
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
  fonts: {
    display: "'Barlow Condensed', 'Impact', sans-serif",
    body: "'Barlow', 'Inter', sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
  },
  radii: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px',
  },
} as const

export type CourtIQColor = keyof typeof courtIQTokens.colors
