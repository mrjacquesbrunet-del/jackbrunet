import { useColorScheme } from 'react-native';

/**
 * Charte graphique de l'app fitness : sobre, premium, neutre.
 * Une seule couleur d'accent + une couleur par macro-nutriment.
 */
export const palette = {
  accent: '#16A34A', // vert progression
  protein: '#2563EB',
  carbs: '#D97706',
  fat: '#7C3AED',
  water: '#0284C7',
  danger: '#DC2626',
};

export interface Theme {
  dark: boolean;
  colors: {
    background: string;
    card: string;
    text: string;
    textMuted: string;
    border: string;
    accent: string;
    onAccent: string;
    protein: string;
    carbs: string;
    fat: string;
    water: string;
    danger: string;
    track: string; // fond des barres/anneaux de progression
  };
}

export const lightTheme: Theme = {
  dark: false,
  colors: {
    background: '#F6F6F4',
    card: '#FFFFFF',
    text: '#171A17',
    textMuted: '#6B7069',
    border: '#E7E8E4',
    accent: palette.accent,
    onAccent: '#FFFFFF',
    protein: palette.protein,
    carbs: palette.carbs,
    fat: palette.fat,
    water: palette.water,
    danger: palette.danger,
    track: '#ECEDE9',
  },
};

export const darkTheme: Theme = {
  dark: true,
  colors: {
    background: '#101210',
    card: '#1A1D1A',
    text: '#F2F3F0',
    textMuted: '#9BA09A',
    border: '#2A2E2A',
    accent: '#22C55E',
    onAccent: '#08130B',
    protein: '#60A5FA',
    carbs: '#FBBF24',
    fat: '#A78BFA',
    water: '#38BDF8',
    danger: '#F87171',
    track: '#272B27',
  },
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const radius = { md: 12, lg: 16, xl: 24 } as const;

/**
 * Échelle typographique du design system — trois niveaux de hiérarchie
 * maximum par écran (essentiel / contexte / détail). Les grandes valeurs
 * chiffrées (« 128,4 kg ») utilisent metricLarge, jamais un style ad hoc.
 */
export const typography = {
  display: { fontSize: 34, fontWeight: '800', letterSpacing: -0.8 },
  heading1: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  heading2: { fontSize: 20, fontWeight: '700' },
  body: { fontSize: 16, fontWeight: '400' },
  caption: { fontSize: 13, fontWeight: '400' },
  metricLarge: { fontSize: 30, fontWeight: '800', fontVariant: ['tabular-nums'] },
  metricSmall: { fontSize: 18, fontWeight: '700', fontVariant: ['tabular-nums'] },
} as const;

/** Durées d'animation (micro-animations discrètes, jamais bloquantes). */
export const durations = { fast: 150, base: 250, slow: 400 } as const;

/** Ombre douce des cartes (bordure fine + ombre légère, pas de gros drop shadow). */
export const cardShadow = {
  shadowColor: '#000',
  shadowOpacity: 0.05,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
} as const;

export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? darkTheme : lightTheme;
}
