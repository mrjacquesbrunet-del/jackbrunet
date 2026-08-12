import { useQuery } from '@tanstack/react-query';
import { Camera, ClipboardList, Ruler, Scale } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/src/components/ui/Card';
import { MetricCard } from '@/src/components/ui/MetricCard';
import { measurementLabel } from '@/src/lib/measurements';
import { compareMeasurements, weightDelta } from '@/src/logic/checkin';
import { calculateWeightChange } from '@/src/logic/progress';
import {
  getCheckinMeasurements,
  getInitialCheckin,
  getLatestCheckin,
  listCheckins,
} from '@/src/services/checkins';
import { getProfile } from '@/src/services/profile';
import { listPhotos, listWeights } from '@/src/services/tracking';
import { spacing, useTheme } from '@/src/lib/theme';

export default function ProgressionScreen() {
  const { colors } = useTheme();

  const profile = useQuery({ queryKey: ['profile'], queryFn: getProfile });
  const weights = useQuery({ queryKey: ['weights'], queryFn: () => listWeights(365) });
  const photos = useQuery({ queryKey: ['photos'], queryFn: listPhotos });
  const checkins = useQuery({ queryKey: ['checkins'], queryFn: listCheckins });
  const initialCheckin = useQuery({ queryKey: ['checkin-initial'], queryFn: getInitialCheckin });
  const latestCheckin = useQuery({ queryKey: ['checkin-latest'], queryFn: getLatestCheckin });

  const hasTwoCheckins =
    !!initialCheckin.data &&
    !!latestCheckin.data &&
    latestCheckin.data.id !== initialCheckin.data.id;

  const initialMeasurements = useQuery({
    queryKey: ['checkin-measurements', initialCheckin.data?.id],
    queryFn: () => getCheckinMeasurements(initialCheckin.data!.id),
    enabled: !!initialCheckin.data,
  });
  const latestMeasurements = useQuery({
    queryKey: ['checkin-measurements', latestCheckin.data?.id],
    queryFn: () => getCheckinMeasurements(latestCheckin.data!.id),
    enabled: hasTwoCheckins,
  });

  const latest = weights.data?.[0] ?? null;
  const summary =
    latest && profile.data?.starting_weight_kg && profile.data?.target_weight_kg
      ? calculateWeightChange(
          profile.data.starting_weight_kg,
          latest.weight_kg,
          profile.data.target_weight_kg,
        )
      : null;

  const deltas = hasTwoCheckins
    ? compareMeasurements(initialMeasurements.data ?? [], latestMeasurements.data ?? [])
    : [];
  const checkinWeightDelta = hasTwoCheckins
    ? weightDelta(initialCheckin.data!.weight_kg, latestCheckin.data!.weight_kg)
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
              Le bilan de départ (poids, objectif, mensurations, photos) établira ta référence.
              La courbe de poids avec moyenne mobile arrive à l'étape 7.
            </Text>
          )}
        </Card>

        {hasTwoCheckins ? (
          <Card title="Depuis ton bilan de départ">
            {checkinWeightDelta != null ? (
              <DeltaRow
                label="Poids"
                value={`${checkinWeightDelta > 0 ? '+' : ''}${checkinWeightDelta} kg`}
                improved={checkinWeightDelta < 0}
              />
            ) : null}
            {deltas.map((d) => (
              <DeltaRow
                key={d.key}
                label={measurementLabel(
                  d.measurement_type,
                  d.side,
                  d.measurement_state,
                  d.custom_label,
                )}
                value={`${d.delta_cm > 0 ? '+' : ''}${d.delta_cm} cm`}
                improved={d.delta_cm !== 0}
              />
            ))}
            {deltas.length === 0 && checkinWeightDelta == null ? (
              <Text style={{ color: colors.textMuted }}>
                Aucune mesure comparable entre les deux bilans pour l'instant.
              </Text>
            ) : null}
          </Card>
        ) : null}

        <View style={styles.row}>
          <MetricCard
            icon={ClipboardList}
            title="Bilans"
            value={String(checkins.data?.length ?? 0)}
            footer={
              latestCheckin.data
                ? `Dernier : ${latestCheckin.data.checkin_date}`
                : 'Bilan de départ à faire (onboarding, étape 2)'
            }
          />
          <MetricCard
            icon={Scale}
            title="Pesées"
            value={String(weights.data?.length ?? 0)}
            footer="entrées enregistrées"
          />
        </View>

        <View style={styles.row}>
          <MetricCard
            icon={Ruler}
            title="Mensurations"
            value={String((initialMeasurements.data?.length ?? 0) + (latestMeasurements.data?.length ?? 0))}
            footer="mesures liées aux bilans"
          />
          <MetricCard
            icon={Camera}
            title="Photos"
            value={String(photos.data?.length ?? 0)}
            footer="face, profil, dos"
          />
        </View>

        <Card title="Transformation">
          <Text style={{ color: colors.textMuted }}>
            Le comparateur photo (côte à côte, slider, chronologie) et les graphiques par
            mensuration arrivent à l'étape 7. Le stockage privé, les bilans et les comparaisons
            automatiques sont déjà en place côté données.
          </Text>
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
      <Text style={[styles.statValue, { color: highlight ? colors.accent : colors.text }]}>
        {value}
      </Text>
    </View>
  );
}

function DeltaRow({ label, value, improved }: { label: string; value: string; improved: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={styles.deltaRow}>
      <Text style={{ color: colors.text, flex: 1 }}>{label}</Text>
      <Text
        style={[styles.deltaValue, { color: improved ? colors.accent : colors.textMuted }]}
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
  deltaRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  deltaValue: { fontSize: 16, fontWeight: '700', fontVariant: ['tabular-nums'] },
});
