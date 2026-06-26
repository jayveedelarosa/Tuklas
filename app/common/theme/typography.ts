/** Retro display + readable body fonts — load via useAppFonts in App.tsx */
export const fonts = {
  display: 'PixelifySans_700Bold',
  body: 'PixelifySans_400Regular',
} as const;

export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 28,
} as const;

export const lineHeights = {
  tight: 1.25,
  normal: 1.5,
  relaxed: 1.65,
} as const;

/** Uniform UI spacing per design spec */
export const uiSpacing = {
  gap: 12,
  buttonPaddingV: 12,
  buttonPaddingH: 24,
  cardPadding: 16,
} as const;
