import { StyleSheet, Text, View } from 'react-native';

import { ProgressBar } from '@/src/components/ui/ProgressBar';
import { useTheme } from '@/src/lib/theme';

interface MacroProgressProps {
  label: string;   // « Protéines »
  current: number; // 145
  target: number;  // 180
  unit: string;    // « g »
  color: string;
}

/** Ligne macro : libellé, valeurs « 145 / 180 g » et barre de progression. */
export function MacroProgress({ label, current, target, unit, color }: MacroProgressProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.values, { color: colors.textMuted }]}>
          {Math.round(current)} / {Math.round(target)} {unit}
        </Text>
      </View>
      <ProgressBar ratio={target > 0 ? current / target : 0} color={color} height={6} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { gap: 6 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  label: { fontSize: 15, fontWeight: '500' },
  values: { fontSize: 14, fontVariant: ['tabular-nums'] },
});
