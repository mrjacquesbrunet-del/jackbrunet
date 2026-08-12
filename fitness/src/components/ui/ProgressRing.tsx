import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { useTheme } from '@/src/lib/theme';

interface ProgressRingProps {
  ratio: number; // 0 à 1
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;    // texte central principal (ex. « 72 % »)
  sublabel?: string; // texte central secondaire
}

/** Anneau de progression SVG — utilisé pour le score global de la journée. */
export function ProgressRing({
  ratio,
  size = 140,
  strokeWidth = 12,
  color,
  label,
  sublabel,
}: ProgressRingProps) {
  const { colors } = useTheme();
  const clamped = Math.min(1, Math.max(0, ratio));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const stroke = color ?? colors.accent;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.track}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={stroke}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.center}>
        {label ? <Text style={[styles.label, { color: colors.text }]}>{label}</Text> : null}
        {sublabel ? (
          <Text style={[styles.sublabel, { color: colors.textMuted }]}>{sublabel}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: 28, fontWeight: '700', fontVariant: ['tabular-nums'] },
  sublabel: { fontSize: 13, marginTop: 2 },
});
