import { Droplets, Dumbbell, Footprints, Minus, Scale } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/src/components/ui/Card';
import { MacroProgress } from '@/src/components/ui/MacroProgress';
import { MetricCard } from '@/src/components/ui/MetricCard';
import { ProgressRing } from '@/src/components/ui/ProgressRing';
import { useToday, useWaterActions } from '@/src/hooks/useToday';
import { formatDateFR, programDayNumber } from '@/src/lib/dates';
import { remainingMacros } from '@/src/logic/nutrition';
import { progressRatio } from '@/src/logic/progress';
import { spacing, useTheme } from '@/src/lib/theme';

const SESSION_STATUS_LABELS: Record<string, string> = {
  planned: 'Prévue',
  started: 'En cours',
  completed: 'Terminée',
  skipped: 'Passée',
};

export default function TodayScreen() {
  const { colors } = useTheme();
  const today = useToday();
  const water = useWaterActions();

  const firstName = today.profile?.first_name?.trim();
  const dayNumber = today.profile?.program_start_date
    ? programDayNumber(today.profile.program_start_date)
    : null;

  const goal = today.goal;
  const remaining = goal ? remainingMacros(goal, today.consumed) : null;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* En-tête */}
        <View>
          <Text style={[styles.greeting, { color: colors.text }]}>
            Bonjour{firstName ? ` ${firstName}` : ''}
          </Text>
          <Text style={[styles.date, { color: colors.textMuted }]}>
            {formatDateFR()}
            {dayNumber && dayNumber > 0 ? `  ·  Jour ${dayNumber}` : ''}
          </Text>
        </View>

        {/* Progression globale de la journée */}
        <Card style={styles.ringCard}>
          <ProgressRing
            ratio={today.completion / 100}
            label={`${today.completion} %`}
            sublabel="de la journée"
          />
          <Text style={[styles.ringHint, { color: colors.textMuted }]}>
            Nutrition, pas, eau et entraînement combinés
          </Text>
        </Card>

        {/* Nutrition */}
        <Card title="Nutrition">
          {goal ? (
            <>
              <View style={styles.calorieRow}>
                <Text style={[styles.calorieValue, { color: colors.text }]}>
                  {Math.round(today.consumed.calories)}
                  <Text style={[styles.calorieTarget, { color: colors.textMuted }]}>
                    {' '}/ {goal.calories} kcal
                  </Text>
                </Text>
                {remaining ? (
                  <Text style={[styles.calorieRemaining, { color: colors.textMuted }]}>
                    {Math.round(remaining.calories)} kcal restantes
                  </Text>
                ) : null}
              </View>
              <MacroProgress
                label="Protéines"
                current={today.consumed.protein}
                target={goal.protein_g}
                unit="g"
                color={colors.protein}
              />
              <MacroProgress
                label="Glucides"
                current={today.consumed.carbs}
                target={goal.carbs_g}
                unit="g"
                color={colors.carbs}
              />
              <MacroProgress
                label="Lipides"
                current={today.consumed.fat}
                target={goal.fat_g}
                unit="g"
                color={colors.fat}
              />
            </>
          ) : (
            <Text style={{ color: colors.textMuted }}>
              Définis tes objectifs calories et macros dans Profil pour suivre ta journée.
            </Text>
          )}
        </Card>

        {/* Entraînement du jour */}
        <Card title="Entraînement">
          {today.session ? (
            <View style={styles.sessionRow}>
              <Dumbbell size={20} color={colors.accent} strokeWidth={2} />
              <View style={styles.sessionInfo}>
                <Text style={[styles.sessionName, { color: colors.text }]}>
                  {today.session.workout?.name ?? 'Séance du jour'}
                </Text>
                <Text style={{ color: colors.textMuted }}>
                  {SESSION_STATUS_LABELS[today.session.status] ?? today.session.status}
                </Text>
              </View>
            </View>
          ) : (
            <Text style={{ color: colors.textMuted }}>
              Aucune séance prévue aujourd'hui — jour de repos ou planning à créer dans Sport.
            </Text>
          )}
        </Card>

        {/* Pas + Poids */}
        <View style={styles.row}>
          <MetricCard
            icon={Footprints}
            title="Pas"
            value={today.stepCount.toLocaleString('fr-FR')}
            target={`/ ${today.stepGoal.toLocaleString('fr-FR')}`}
            ratio={progressRatio(today.stepCount, today.stepGoal)}
            footer={
              today.stepCount >= today.stepGoal
                ? 'Objectif atteint'
                : `${(today.stepGoal - today.stepCount).toLocaleString('fr-FR')} pas restants`
            }
          />
          <MetricCard
            icon={Scale}
            title="Poids"
            value={today.latestWeight ? `${today.latestWeight.weight_kg} kg` : '—'}
            footer={
              today.latestWeight
                ? `Dernière pesée : ${today.latestWeight.entry_date}`
                : 'Aucune pesée enregistrée'
            }
          />
        </View>

        {/* Eau */}
        <Card title="Eau">
          <View style={styles.waterRow}>
            <Droplets size={20} color={colors.water} strokeWidth={2} />
            <Text style={[styles.waterValue, { color: colors.text }]}>
              {(today.waterMl / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 2 })} L
              <Text style={{ color: colors.textMuted }}>
                {' '}/ {(today.waterGoal / 1000).toLocaleString('fr-FR')} L
              </Text>
            </Text>
          </View>
          <View style={styles.waterButtons}>
            <WaterButton label="+250 ml" onPress={() => water.add.mutate(250)} />
            <WaterButton label="+500 ml" onPress={() => water.add.mutate(500)} />
            <Pressable
              style={[styles.undoButton, { borderColor: colors.border }]}
              onPress={() => water.undo.mutate()}
              accessibilityLabel="Annuler la dernière saisie d'eau"
            >
              <Minus size={18} color={colors.textMuted} strokeWidth={2} />
            </Pressable>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function WaterButton({ label, onPress }: { label: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      style={[styles.waterButton, { backgroundColor: colors.track }]}
      onPress={onPress}
    >
      <Text style={[styles.waterButtonText, { color: colors.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  greeting: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  date: { fontSize: 15, marginTop: 2, textTransform: 'capitalize' },
  ringCard: { alignItems: 'center' },
  ringHint: { fontSize: 13 },
  calorieRow: { gap: 2 },
  calorieValue: { fontSize: 30, fontWeight: '800', fontVariant: ['tabular-nums'] },
  calorieTarget: { fontSize: 17, fontWeight: '500' },
  calorieRemaining: { fontSize: 13 },
  sessionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  sessionInfo: { flex: 1, gap: 2 },
  sessionName: { fontSize: 17, fontWeight: '600' },
  row: { flexDirection: 'row', gap: spacing.lg },
  waterRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  waterValue: { fontSize: 24, fontWeight: '700', fontVariant: ['tabular-nums'] },
  waterButtons: { flexDirection: 'row', gap: spacing.sm },
  waterButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  waterButtonText: { fontSize: 15, fontWeight: '600' },
  undoButton: {
    width: 46,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
