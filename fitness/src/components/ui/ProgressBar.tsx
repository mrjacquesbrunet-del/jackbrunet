import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/src/lib/theme';

interface ProgressBarProps {
  ratio: number; // 0 à 1
  color?: string;
  height?: number;
}

/** Barre de progression simple ; passe à la couleur d'accent quand terminé. */
export function ProgressBar({ ratio, color, height = 8 }: ProgressBarProps) {
  const { colors } = useTheme();
  const clamped = Math.min(1, Math.max(0, ratio));
  const fill = clamped >= 1 ? colors.accent : (color ?? colors.accent);
  return (
    <View style={[styles.track, { backgroundColor: colors.track, height, borderRadius: height / 2 }]}>
      <View
        style={{
          width: `${clamped * 100}%`,
          backgroundColor: fill,
          height,
          borderRadius: height / 2,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: '100%', overflow: 'hidden' },
});
