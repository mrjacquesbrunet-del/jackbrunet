import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronRight, Dumbbell, Search, Trophy } from 'lucide-react-native';
import { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/src/components/ui/Card';
import {
  getActiveProgram,
  getProgramDays,
  listExerciseRecords,
  listExercises,
  listWorkouts,
  upsertExerciseRecord,
} from '@/src/services/sport';
import { radius, spacing, useTheme } from '@/src/lib/theme';
import type { Exercise, ExerciseRecord } from '@/src/types/domain';

const DAY_NAMES = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

const DAY_TYPE_LABELS: Record<string, string> = {
  entrainement: 'Entraînement',
  cardio: 'Cardio',
  marche: 'Marche',
  recuperation: 'Récupération',
  repos: 'Repos',
};

export default function SportScreen() {
  const { colors } = useTheme();

  const program = useQuery({ queryKey: ['active-program'], queryFn: getActiveProgram });
  const days = useQuery({
    queryKey: ['program-days', program.data?.id],
    queryFn: () => getProgramDays(program.data!.id),
    enabled: !!program.data,
  });
  const workouts = useQuery({ queryKey: ['workouts'], queryFn: listWorkouts });

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: colors.text }]}>Sport</Text>

        <Card title="Programme actuel">
          {program.data ? (
            <View>
              <Text style={[styles.programName, { color: colors.text }]}>{program.data.name}</Text>
              {program.data.weeks ? (
                <Text style={{ color: colors.textMuted }}>
                  {program.data.weeks} semaines
                  {program.data.sessions_per_week
                    ? ` · ${program.data.sessions_per_week} séances / semaine`
                    : ''}
                </Text>
              ) : null}
            </View>
          ) : (
            <Text style={{ color: colors.textMuted }}>
              Aucun programme actif. La création de programmes arrive à l'étape 5 du développement.
            </Text>
          )}
        </Card>

        {days.data && days.data.length > 0 ? (
          <Card title="Planning de la semaine">
            {days.data.map((day) => (
              <View key={day.id} style={[styles.dayRow, { borderColor: colors.border }]}>
                <Text style={[styles.dayName, { color: colors.text }]}>
                  {DAY_NAMES[day.day_of_week]}
                </Text>
                <Text style={{ color: colors.textMuted }}>
                  {day.workout?.name ?? day.label ?? DAY_TYPE_LABELS[day.day_type]}
                </Text>
              </View>
            ))}
          </Card>
        ) : null}

        <RecordsCard />

        <Card title="Mes séances">
          {workouts.data && workouts.data.length > 0 ? (
            workouts.data.map((workout) => (
              <View key={workout.id} style={styles.workoutRow}>
                <Dumbbell size={18} color={colors.accent} strokeWidth={2} />
                <Text style={[styles.workoutName, { color: colors.text }]}>{workout.name}</Text>
                <ChevronRight size={18} color={colors.textMuted} strokeWidth={2} />
              </View>
            ))
          ) : (
            <Text style={{ color: colors.textMuted }}>
              Aucune séance créée pour l'instant. Le créateur de séances (exercices, séries,
              répétitions, charges, temps de repos) arrive à l'étape 5.
            </Text>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * Records personnels : un record de poids par exercice, saisi manuellement,
 * conservé jusqu'à modification. Recherche + saisie en deux touches.
 */
function RecordsCard() {
  const { colors } = useTheme();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftWeight, setDraftWeight] = useState('');

  const exercises = useQuery({
    queryKey: ['exercises', search],
    queryFn: () => listExercises(search),
  });
  const records = useQuery({ queryKey: ['exercise-records'], queryFn: listExerciseRecords });

  const save = useMutation({
    mutationFn: ({ exerciseId, weight }: { exerciseId: string; weight: number }) =>
      upsertExerciseRecord(exerciseId, weight),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercise-records'] });
      setEditingId(null);
      setDraftWeight('');
    },
  });

  const recordByExercise = new Map<string, ExerciseRecord>(
    (records.data ?? []).map((r) => [r.exercise_id, r]),
  );
  const shown: Exercise[] = (exercises.data ?? []).slice(0, 8);

  function startEditing(exercise: Exercise) {
    const current = recordByExercise.get(exercise.id);
    setEditingId(exercise.id);
    setDraftWeight(current ? String(current.record_weight_kg) : '');
  }

  function submit(exerciseId: string) {
    const weight = Number(draftWeight.replace(',', '.'));
    if (!Number.isFinite(weight) || weight <= 0) return;
    save.mutate({ exerciseId, weight });
  }

  return (
    <Card title="Records personnels">
      <View style={[styles.searchBox, { backgroundColor: colors.track }]}>
        <Search size={16} color={colors.textMuted} strokeWidth={2} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Chercher un exercice…"
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {shown.map((exercise) => {
        const record = recordByExercise.get(exercise.id);
        const isEditing = editingId === exercise.id;
        return (
          <View key={exercise.id}>
            <Pressable
              style={styles.recordRow}
              onPress={() => (isEditing ? setEditingId(null) : startEditing(exercise))}
              accessibilityLabel={`Modifier le record de ${exercise.name}`}
            >
              {exercise.image_url ? (
                <Image
                  source={{ uri: exercise.image_url }}
                  style={[styles.recordThumb, { backgroundColor: colors.cardAlt }]}
                  accessibilityIgnoresInvertColors
                />
              ) : (
                <View style={[styles.recordThumb, styles.recordThumbEmpty, { backgroundColor: colors.cardAlt }]}>
                  <Dumbbell size={16} color={colors.textMuted} strokeWidth={2} />
                </View>
              )}
              <View style={styles.recordInfo}>
                <Text style={[styles.recordName, { color: colors.text }]}>{exercise.name}</Text>
                {exercise.muscle_group ? (
                  <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                    {exercise.muscle_group}
                  </Text>
                ) : null}
              </View>
              {record ? (
                <View style={styles.recordValue}>
                  <Trophy size={15} color={colors.accent} strokeWidth={2} />
                  <Text style={[styles.recordText, { color: colors.accent }]}>
                    {record.record_weight_kg} kg
                  </Text>
                </View>
              ) : (
                <Text style={{ color: colors.textMuted }}>—</Text>
              )}
            </Pressable>

            {isEditing ? (
              <View style={styles.editRow}>
                <TextInput
                  style={[
                    styles.editInput,
                    { backgroundColor: colors.track, color: colors.text },
                  ]}
                  placeholder="Poids en kg"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="decimal-pad"
                  autoFocus
                  value={draftWeight}
                  onChangeText={setDraftWeight}
                  onSubmitEditing={() => submit(exercise.id)}
                />
                <Pressable
                  style={[styles.saveButton, { backgroundColor: colors.accent }]}
                  onPress={() => submit(exercise.id)}
                  disabled={save.isPending}
                >
                  <Text style={{ color: colors.onAccent, fontWeight: '700' }}>Enregistrer</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        );
      })}

      {shown.length === 0 ? (
        <Text style={{ color: colors.textMuted }}>
          Aucun exercice trouvé. Ta bibliothèque contient déjà 20 exercices de base — ajuste la
          recherche ou crée l'exercice (étape 5).
        </Text>
      ) : null}

      <Text style={{ color: colors.textMuted, fontSize: 12 }}>
        Touche un exercice pour noter ou modifier ton record — il reste enregistré tel quel
        jusqu'à ta prochaine modification.
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  programName: { fontSize: 18, fontWeight: '700', marginBottom: 2 },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dayName: { fontWeight: '600' },
  workoutRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 4 },
  workoutName: { flex: 1, fontSize: 16, fontWeight: '500' },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
  },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 15 },
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 6,
  },
  recordThumb: { width: 44, height: 44, borderRadius: 10 },
  recordThumbEmpty: { alignItems: 'center', justifyContent: 'center' },
  recordInfo: { flex: 1, gap: 1 },
  recordName: { fontSize: 15, fontWeight: '600' },
  recordValue: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  recordText: { fontSize: 15, fontWeight: '700', fontVariant: ['tabular-nums'] },
  editRow: { flexDirection: 'row', gap: spacing.sm, paddingBottom: spacing.sm },
  editInput: {
    flex: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 15,
  },
  saveButton: {
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
});
