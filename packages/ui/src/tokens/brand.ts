/**
 * Court IQ Brand Design Tokens
 * Extracted from logo: neon green (#A8D634) on dark slate (#2D3142)
 */
export const brand = {
  green: '#A8D634',
  greenLight: '#C4E85A',
  greenDark: '#86AA28',
  slate: '#2D3142',
  slateLight: '#3D4252',
  slateDark: '#1E2030',
  white: '#FFFFFF',
  offWhite: '#F8FAFC',
} as const

export type BrandColor = keyof typeof brand
