import {
  Check,
  ChevronRight,
  Droplets,
  Dumbbell,
  Footprints,
  Minus,
  Scale,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Polyline } from 'react-native-svg';

import { Card } from '@/src/components/ui/Card';
import { MacroProgress } from '@/src/components/ui/MacroProgress';
import { ProgressBar } from '@/src/components/ui/ProgressBar';
import { ProgressRing } from '@/src/components/ui/ProgressRing';
import { useToday, useWaterActions } from '@/src/hooks/useToday';
import { formatDateFR, programDayNumber } from '@/src/lib/dates';
import { remainingMacros } from '@/src/logic/nutrition';
import { progressRatio } from '@/src/logic/progress';
import { spacing, useTheme } from '@/src/lib/theme';
import type { MealEntry } from '@/src/types/domain';

const SLOT_LABELS: Record<string, string> = {
  petit_dejeuner: 'Petit-déjeuner',
  dejeuner: 'Déjeuner',
  collation: 'Collation',
  diner: 'Dîner',
};

const DEFAULT_SLOTS = ['petit_dejeuner', 'dejeuner', 'collation', 'diner'];

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
  const calorieRatio = goal ? progressRatio(today.consumed.calories, goal.calories) : 0;
  const stepRatio = progressRatio(today.stepCount, today.stepGoal);
  const waterRatio = progressRatio(today.waterMl, today.waterGoal);

  const sparkValues = [...today.weights].reverse().map((w) => w.weight_kg);
  const weightDeltaVsPrev =
    today.weights.length >= 2
      ? Math.round((today.weights[0].weight_kg - today.weights[1].weight_kg) * 10) / 10
      : null;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* En-tête */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={[styles.greeting, { color: colors.text }]}>
              Bonjour{firstName ? ` ${firstName}` : ''}
            </Text>
            <Text style={[styles.date, { color: colors.textMuted }]}>
              {formatDateFR()}
              {dayNumber && dayNumber > 0 ? `  ·  Jour ${dayNumber}` : ''}
            </Text>
          </View>
          <View style={[styles.dayPill, { backgroundColor: colors.accentSoft }]}>
            <Text style={[styles.dayPillText, { color: colors.accent }]}>
              {today.completion} %
            </Text>
          </View>
        </View>

        {/* Calories : anneau + macros */}
        <Card>
          {goal ? (
            <>
              <View style={styles.calorieRow}>
                <ProgressRing
                  ratio={calorieRatio}
                  size={104}
                  strokeWidth={10}
                  label={`${Math.round(calorieRatio * 100)} %`}
                />
                <View style={styles.calorieInfo}>
                  <Text style={[styles.cardLabel, { color: colors.textMuted }]}>Calories</Text>
                  <Text style={[styles.calorieValue, { color: colors.text }]}>
                    {Math.round(today.consumed.calories).toLocaleString('fr-FR')}
                  </Text>
                  <Text style={[styles.calorieGoal, { color: colors.textMuted }]}>
                    / {goal.calories.toLocaleString('fr-FR')} kcal
                  </Text>
                  {remaining ? (
                    <Text style={[styles.calorieRemaining, { color: colors.textMuted }]}>
                      {Math.round(remaining.calories).toLocaleString('fr-FR')} kcal restantes
                    </Text>
                  ) : null}
                </View>
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

        {/* Prochaine séance */}
        <Card>
          <Text style={[styles.cardLabel, { color: colors.textMuted }]}>Prochaine séance</Text>
          {today.session ? (
            <>
              <Text style={[styles.sessionName, { color: colors.text }]}>
                {today.session.workout?.name ?? 'Séance du jour'}
              </Text>
              {today.session.status === 'completed' ? (
                <View style={[styles.statusPill, { backgroundColor: colors.successSoft }]}>
                  <Check size={13} color={colors.success} strokeWidth={2.5} />
                  <Text style={[styles.statusPillText, { color: colors.success }]}>Terminée</Text>
                </View>
              ) : (
                <Pressable style={[styles.startButton, { backgroundColor: colors.accent }]}>
                  <Text style={[styles.startButtonText, { color: colors.onAccent }]}>
                    Commencer
                  </Text>
                  <ChevronRight size={18} color={colors.onAccent} strokeWidth={2.5} />
                </Pressable>
              )}
            </>
          ) : (
            <Text style={{ color: colors.textMuted }}>
              Rien de prévu aujourd'hui — jour de repos ou planning à créer dans Sport.
            </Text>
          )}
        </Card>

        {/* Pas / Eau / Poids */}
        <View style={styles.trioRow}>
          <Card style={styles.trioCard}>
            <IconChip color={colors.success} background={colors.successSoft}>
              <Footprints size={17} color={colors.success} strokeWidth={2} />
            </IconChip>
            <Text style={[styles.trioTitle, { color: colors.textMuted }]}>Pas</Text>
            <Text style={[styles.trioValue, { color: colors.text }]}>
              {today.stepCount.toLocaleString('fr-FR')}
            </Text>
            <Text style={[styles.trioGoal, { color: colors.textMuted }]}>
              / {today.stepGoal.toLocaleString('fr-FR')}
            </Text>
            <ProgressBar ratio={stepRatio} color={colors.success} height={5} />
            <Text style={[styles.trioFooter, { color: colors.textMuted }]}>
              {Math.round(stepRatio * 100)} % de l'objectif
            </Text>
          </Card>

          <Card style={styles.trioCard}>
            <IconChip color={colors.water} background={colors.waterSoft}>
              <Droplets size={17} color={colors.water} strokeWidth={2} />
            </IconChip>
            <Text style={[styles.trioTitle, { color: colors.textMuted }]}>Eau</Text>
            <Text style={[styles.trioValue, { color: colors.text }]}>
              {(today.waterMl / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 1 })}
            </Text>
            <Text style={[styles.trioGoal, { color: colors.textMuted }]}>
              / {(today.waterGoal / 1000).toLocaleString('fr-FR')} L
            </Text>
            <ProgressBar ratio={waterRatio} color={colors.water} height={5} />
            <Text style={[styles.trioFooter, { color: colors.textMuted }]}>
              {Math.round(waterRatio * 100)} % de l'objectif
            </Text>
          </Card>

          <Card style={styles.trioCard}>
            <IconChip color={colors.accent} background={colors.accentSoft}>
              <Scale size={17} color={colors.accent} strokeWidth={2} />
            </IconChip>
            <Text style={[styles.trioTitle, { color: colors.textMuted }]}>Poids</Text>
            <Text style={[styles.trioValue, { color: colors.text }]}>
              {today.latestWeight ? `${today.latestWeight.weight_kg}` : '—'}
            </Text>
            <Text style={[styles.trioGoal, { color: colors.textMuted }]}>
              {today.latestWeight ? 'kg' : ' '}
            </Text>
            {sparkValues.length >= 2 ? (
              <Sparkline values={sparkValues} color={colors.accent} />
            ) : null}
            <Text
              style={[
                styles.trioFooter,
                {
                  color:
                    weightDeltaVsPrev != null && weightDeltaVsPrev < 0
                      ? colors.success
                      : colors.textMuted,
                },
              ]}
            >
              {weightDeltaVsPrev != null
                ? `${weightDeltaVsPrev > 0 ? '+' : ''}${weightDeltaVsPrev} kg vs dernière pesée`
                : 'Ajoute ta pesée'}
            </Text>
          </Card>
        </View>

        {/* Ajout d'eau rapide */}
        <Card style={styles.waterCard}>
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

        {/* Repas du jour */}
        <Card title="Aujourd'hui">
          {DEFAULT_SLOTS.map((slot) => (
            <MealSlotRow key={slot} slot={slot} entries={today.meals} />
          ))}
        </Card>

        {/* Progression */}
        <Card title="Ma progression">
          {today.profile?.starting_weight_kg && today.latestWeight ? (
            <View style={styles.progressRow}>
              <View style={styles.progressStat}>
                <Text style={[styles.progressDelta, { color: colors.success }]}>
                  {(() => {
                    const lost =
                      Math.round(
                        (today.profile.starting_weight_kg - today.latestWeight.weight_kg) * 10,
                      ) / 10;
                    return `${lost > 0 ? '−' : '+'}${Math.abs(lost)} kg`;
                  })()}
                </Text>
                <Text style={[styles.progressLabel, { color: colors.textMuted }]}>
                  depuis le départ
                </Text>
              </View>
              {today.profile.target_weight_kg ? (
                <View style={styles.progressStat}>
                  <Text style={[styles.progressDelta, { color: colors.text }]}>
                    {Math.round(
                      (today.latestWeight.weight_kg - today.profile.target_weight_kg) * 10,
                    ) / 10}{' '}
                    kg
                  </Text>
                  <Text style={[styles.progressLabel, { color: colors.textMuted }]}>
                    avant l'objectif
                  </Text>
                </View>
              ) : null}
            </View>
          ) : (
            <View style={styles.sessionRow}>
              <Dumbbell size={18} color={colors.accent} strokeWidth={2} />
              <Text style={{ color: colors.textMuted, flex: 1 }}>
                Ton bilan de départ (étape 2) affichera ici poids perdu, ventre et bras.
              </Text>
            </View>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

/** Pastille circulaire teintée qui porte l'icône d'une métrique. */
function IconChip({
  color,
  background,
  children,
}: {
  color: string;
  background: string;
  children: React.ReactNode;
}) {
  return <View style={[styles.iconChip, { backgroundColor: background, borderColor: color }]}>{children}</View>;
}

/** Mini-courbe de tendance (poids) — décorative, la vraie courbe est dans Progression. */
function Sparkline({ values, color }: { values: number[]; color: string }) {
  const width = 84;
  const height = 24;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - 3 - ((v - min) / range) * (height - 6);
      return `${x},${y}`;
    })
    .join(' ');
  return (
    <Svg width={width} height={height}>
      <Polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Ligne repas avec statut : Terminé / À valider / À venir. */
function MealSlotRow({ slot, entries }: { slot: string; entries: MealEntry[] }) {
  const { colors } = useTheme();
  const slotEntries = entries.filter((e) => e.meal_slot === slot);
  const allConsumed = slotEntries.length > 0 && slotEntries.every((e) => e.status === 'consumed');
  const hasPlanned = slotEntries.length > 0;
  const kcal = slotEntries.reduce((sum, e) => sum + e.calories, 0);

  return (
    <View style={styles.mealRow}>
      <View style={styles.mealInfo}>
        <Text style={[styles.mealName, { color: colors.text }]}>
          {SLOT_LABELS[slot] ?? slot}
        </Text>
        {hasPlanned ? (
          <Text style={{ color: colors.textMuted, fontSize: 12 }}>
            {Math.round(kcal)} kcal
          </Text>
        ) : null}
      </View>
      {allConsumed ? (
        <View style={[styles.statusPill, { backgroundColor: colors.successSoft }]}>
          <Check size={13} color={colors.success} strokeWidth={2.5} />
          <Text style={[styles.statusPillText, { color: colors.success }]}>Terminé</Text>
        </View>
      ) : (
        <View style={[styles.statusPill, styles.statusPillOutline, { borderColor: colors.border }]}>
          <Text style={[styles.statusPillText, { color: colors.textMuted }]}>
            {hasPlanned ? 'À valider' : 'À venir'}
          </Text>
        </View>
      )}
    </View>
  );
}

function WaterButton({ label, onPress }: { label: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable style={[styles.waterButton, { backgroundColor: colors.cardAlt }]} onPress={onPress}>
      <Text style={[styles.waterButtonText, { color: colors.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  header: { flexDirection: 'row', alignItems: 'center' },
  headerText: { flex: 1 },
  greeting: { fontSize: 27, fontWeight: '800', letterSpacing: -0.5 },
  date: { fontSize: 14, marginTop: 2, textTransform: 'capitalize' },
  dayPill: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  dayPillText: { fontSize: 14, fontWeight: '700', fontVariant: ['tabular-nums'] },
  cardLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  calorieRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xl },
  calorieInfo: { flex: 1, gap: 1 },
  calorieValue: { fontSize: 32, fontWeight: '800', fontVariant: ['tabular-nums'] },
  calorieGoal: { fontSize: 15, fontWeight: '500' },
  calorieRemaining: { fontSize: 12, marginTop: 4 },
  sessionName: { fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  sessionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: 12,
    paddingVertical: 13,
    marginTop: 4,
  },
  startButtonText: { fontSize: 15, fontWeight: '700' },
  trioRow: { flexDirection: 'row', gap: spacing.md },
  trioCard: { flex: 1, paddingHorizontal: 12, paddingVertical: 14, gap: 3 },
  iconChip: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  trioTitle: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  trioValue: { fontSize: 19, fontWeight: '800', fontVariant: ['tabular-nums'] },
  trioGoal: { fontSize: 11, fontVariant: ['tabular-nums'], marginBottom: 4 },
  trioFooter: { fontSize: 10, marginTop: 4 },
  waterCard: { paddingVertical: 12 },
  waterButtons: { flexDirection: 'row', gap: spacing.sm },
  waterButton: { flex: 1, paddingVertical: 11, borderRadius: 10, alignItems: 'center' },
  waterButtonText: { fontSize: 14, fontWeight: '600' },
  undoButton: {
    width: 44,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 6 },
  mealInfo: { flex: 1, gap: 1 },
  mealName: { fontSize: 15, fontWeight: '600' },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  statusPillOutline: { borderWidth: 1 },
  statusPillText: { fontSize: 12, fontWeight: '600' },
  progressRow: { flexDirection: 'row', gap: spacing.xxl },
  progressStat: { gap: 2 },
  progressDelta: { fontSize: 20, fontWeight: '800', fontVariant: ['tabular-nums'] },
  progressLabel: { fontSize: 12 },
});
