import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/src/components/ui/Card';
import { ProgressBar } from '@/src/components/ui/ProgressBar';
import { spacing, useTheme } from '@/src/lib/theme';

interface MetricCardProps {
  icon: LucideIcon;
  title: string;    // « Pas »
  value: string;    // « 7 450 »
  target?: string;  // « / 10 000 »
  ratio?: number;   // barre de progression si fourni
  color?: string;
  footer?: string;  // « 2 550 pas restants »
}

/** Carte métrique compacte : icône en trait, grande valeur, progression. */
export function MetricCard({ icon: Icon, title, value, target, ratio, color, footer }: MetricCardProps) {
  const { colors } = useTheme();
  const tint = color ?? colors.accent;
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Icon size={18} color={tint} strokeWidth={2} />
        <Text style={[styles.title, { color: colors.textMuted }]}>{title}</Text>
      </View>
      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
        {target ? <Text style={[styles.target, { color: colors.textMuted }]}>{target}</Text> : null}
      </View>
      {ratio !== undefined ? <ProgressBar ratio={ratio} color={tint} height={6} /> : null}
      {footer ? <Text style={[styles.footer, { color: colors.textMuted }]}>{footer}</Text> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, gap: spacing.sm },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6 },
  valueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  value: { fontSize: 24, fontWeight: '700', fontVariant: ['tabular-nums'] },
  target: { fontSize: 14, fontVariant: ['tabular-nums'] },
  footer: { fontSize: 12 },
});
