import { useColorScheme } from 'react-native';

/**
 * Charte graphique : premium, sombre en vitrine, accent violet.
 * Le mode sombre est la référence visuelle ; le clair reste cohérent.
 */
export const palette = {
  accent: '#8B5CF6', // violet — boutons, progressions, sélections
  success: '#22C55E',
  carbs: '#22C55E',
  fat: '#F59E0B',
  protein: '#8B5CF6',
  water: '#38BDF8',
  danger: '#EF4444',
};

export interface Theme {
  dark: boolean;
  colors: {
    background: string;
    card: string;
    cardAlt: string; // surface secondaire (pastilles, zones internes)
    text: string;
    textMuted: string;
    border: string;
    accent: string;
    accentSoft: string; // fond de pastille teinté accent
    onAccent: string;
    success: string;
    successSoft: string;
    protein: string;
    carbs: string;
    fat: string;
    water: string;
    waterSoft: string;
    danger: string;
    track: string; // fond des barres/anneaux de progression
  };
}

export const darkTheme: Theme = {
  dark: true,
  colors: {
    background: '#0C0F16',
    card: '#141926',
    cardAlt: '#1C2333',
    text: '#F4F6FB',
    textMuted: '#8A93A6',
    border: '#232B3D',
    accent: '#8B5CF6',
    accentSoft: 'rgba(139, 92, 246, 0.16)',
    onAccent: '#FFFFFF',
    success: '#22C55E',
    successSoft: 'rgba(34, 197, 94, 0.14)',
    protein: '#A78BFA',
    carbs: '#4ADE80',
    fat: '#FBBF24',
    water: '#38BDF8',
    waterSoft: 'rgba(56, 189, 248, 0.14)',
    danger: '#F87171',
    track: '#232B3D',
  },
};

export const lightTheme: Theme = {
  dark: false,
  colors: {
    background: '#F5F6FA',
    card: '#FFFFFF',
    cardAlt: '#F0F1F7',
    text: '#12141C',
    textMuted: '#626B7E',
    border: '#E5E8F0',
    accent: '#7C3AED',
    accentSoft: 'rgba(124, 58, 237, 0.10)',
    onAccent: '#FFFFFF',
    success: '#16A34A',
    successSoft: 'rgba(22, 163, 74, 0.10)',
    protein: '#7C3AED',
    carbs: '#16A34A',
    fat: '#D97706',
    water: '#0284C7',
    waterSoft: 'rgba(2, 132, 199, 0.10)',
    danger: '#DC2626',
    track: '#E8EAF2',
  },
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const radius = { md: 12, lg: 18, xl: 24 } as const;

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
  return useColorScheme() === 'light' ? lightTheme : darkTheme;
}
