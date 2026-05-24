export const colors = {
  // Primary brand
  primary: '#42DCA3',
  primaryDark: '#2ABF88',
  primarySoft: '#D4F7E7',

  // Surfaces
  background: '#FFFFFF',
  surface: '#F1FFF8',
  surfaceAlt: '#F7FBF9',
  border: '#E1F4EA',
  divider: '#EDF5F0',

  // Text
  text: '#12382B',
  textSecondary: '#3D5C4F',
  textMuted: '#6B8178',
  textOnPrimary: '#FFFFFF',
  textInverse: '#FFFFFF',

  // Semantic
  danger: '#E5484D',
  dangerSoft: '#FDEAEA',
  warning: '#F5A524',
  warningSoft: '#FFF4DD',
  info: '#5DADE2',
  success: '#42DCA3',

  // Interactions
  like: '#FF6B81',
  likeSoft: '#FFE6EA',
  save: '#42DCA3',

  // Overlays
  overlay: 'rgba(18, 56, 43, 0.4)',
  shadow: 'rgba(18, 56, 43, 0.08)',
} as const;

export type ColorKey = keyof typeof colors;
