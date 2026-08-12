import { useQuery } from '@tanstack/react-query';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/src/components/ui/Card';
import { MetricCard } from '@/src/components/ui/MetricCard';
import { Scale, Ruler, Camera } from 'lucide-react-native';
import { calculateWeightChange } from '@/src/logic/progress';
import { getProfile } from '@/src/services/profile';
import { listMeasurements, listPhotos, listWeights } from '@/src/services/tracking';
import { spacing, useTheme } from '@/src/lib/theme';

export default function ProgressionScreen() {
  const { colors } = useTheme();

  const profile = useQuery({ queryKey: ['profile'], queryFn: getProfile });
  const weights = useQuery({ queryKey: ['weights'], queryFn: () => listWeights(365) });
  const measurements = useQuery({ queryKey: ['measurements'], queryFn: () => listMeasurements(1) });
  const photos = useQuery({ queryKey: ['photos'], queryFn: listPhotos });

  const latest = weights.data?.[0] ?? null;
  const summary =
    latest && profile.data?.starting_weight_kg && profile.data?.target_weight_kg
      ? calculateWeightChange(
          profile.data.starting_weight_kg,
          latest.weight_kg,
          profile.data.target_weight_kg,
        )
      : null;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>Progression</Text>

        <Card title="Poids">
          {summary ? (
            <View style={styles.weightGrid}>
              <WeightStat label="Départ" value={`${profile.data!.starting_weight_kg} kg`} />
              <WeightStat label="Aujourd'hui" value={`${summary.current} kg`} highlight />
              <WeightStat label="Objectif" value={`${profile.data!.target_weight_kg} kg`} />
              <WeightStat
                label={summary.lost >= 0 ? 'Perdu' : 'Pris'}
                value={`${Math.abs(summary.lost)} kg`}
              />
              <WeightStat label="Restant" value={`${summary.remaining} kg`} />
            </View>
          ) : (
            <Text style={{ color: colors.textMuted }}>
              Enregistre ton poids de départ, ton objectif (Profil) et ta première pesée pour voir
              ta progression. La courbe de poids avec moyenne mobile arrive à l'étape 7.
            </Text>
          )}
        </Card>

        <View style={styles.row}>
          <MetricCard
            icon={Scale}
            title="Pesées"
            value={String(weights.data?.length ?? 0)}
            footer="entrées enregistrées"
          />
          <MetricCard
            icon={Ruler}
            title="Mensurations"
            value={measurements.data && measurements.data.length > 0 ? measurements.data[0].entry_date : '—'}
            footer="dernière mesure"
          />
        </View>

        <Card title="Transformation">
          <View style={styles.photoRow}>
            <Camera size={20} color={colors.accent} strokeWidth={2} />
            <Text style={{ color: colors.textMuted, flex: 1 }}>
              {photos.data && photos.data.length > 0
                ? `${photos.data.length} photo(s) de progression enregistrée(s).`
                : 'Photos avant/après et comparateur : étape 7 du développement. Le stockage privé et sécurisé est déjà prêt.'}
            </Text>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function WeightStat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.stat}>
      <Text style={[styles.statLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text
        style={[
          styles.statValue,
          { color: highlight ? colors.accent : colors.text },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  weightGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg },
  stat: { minWidth: '28%', gap: 2 },
  statLabel: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.6 },
  statValue: { fontSize: 18, fontWeight: '700', fontVariant: ['tabular-nums'] },
  row: { flexDirection: 'row', gap: spacing.lg },
  photoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
});
