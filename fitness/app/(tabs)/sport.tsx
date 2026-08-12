import { useQuery } from '@tanstack/react-query';
import { ChevronRight, Dumbbell } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/src/components/ui/Card';
import { getActiveProgram, getProgramDays, listWorkouts } from '@/src/services/sport';
import { spacing, useTheme } from '@/src/lib/theme';

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
      <ScrollView contentContainerStyle={styles.container}>
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
});
