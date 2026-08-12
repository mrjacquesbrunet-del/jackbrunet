import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/src/components/ui/Card';
import { todayISO } from '@/src/lib/dates';
import { calculateDailyMacros } from '@/src/logic/nutrition';
import { listMealEntries, markMealConsumed } from '@/src/services/nutrition';
import { spacing, useTheme } from '@/src/lib/theme';
import type { MealEntry } from '@/src/types/domain';

const SLOT_LABELS: Record<string, string> = {
  petit_dejeuner: 'Petit-déjeuner',
  dejeuner: 'Déjeuner',
  collation: 'Collation',
  diner: 'Dîner',
};

const SLOT_ORDER = ['petit_dejeuner', 'dejeuner', 'collation', 'diner'];

export default function NutritionScreen() {
  const { colors } = useTheme();
  const date = todayISO();
  const queryClient = useQueryClient();

  const meals = useQuery({ queryKey: ['meals', date], queryFn: () => listMealEntries(date) });
  const consume = useMutation({
    mutationFn: markMealConsumed,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['meals', date] }),
  });

  const entries = meals.data ?? [];
  const consumed = calculateDailyMacros(entries, 'consumed');
  const planned = calculateDailyMacros(entries, 'planned');

  const slots = [...SLOT_ORDER, ...entries.map((e) => e.meal_slot)].filter(
    (slot, index, all) => all.indexOf(slot) === index,
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>Nutrition</Text>

        <Card title="Journée">
          <Text style={{ color: colors.textMuted }}>
            Consommé : {Math.round(consumed.calories)} kcal · Prévu :{' '}
            {Math.round(planned.calories)} kcal
          </Text>
        </Card>

        {slots.map((slot) => {
          const slotEntries = entries.filter((e) => e.meal_slot === slot);
          return (
            <Card key={slot} title={SLOT_LABELS[slot] ?? slot}>
              {slotEntries.length > 0 ? (
                slotEntries.map((entry) => (
                  <MealRow
                    key={entry.id}
                    entry={entry}
                    onConsume={() => consume.mutate(entry.id)}
                  />
                ))
              ) : (
                <Text style={{ color: colors.textMuted }}>Rien de prévu.</Text>
              )}
            </Card>
          );
        })}

        <Text style={[styles.hint, { color: colors.textMuted }]}>
          L'ajout d'aliments, la recherche et les recettes arrivent à l'étape 4 du développement.
          La base de données (aliments, recettes, ingrédients, calculs automatiques) est déjà prête.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function MealRow({ entry, onConsume }: { entry: MealEntry; onConsume: () => void }) {
  const { colors } = useTheme();
  const name = entry.custom_name ?? entry.recipe?.name ?? entry.food?.name ?? 'Aliment';
  const isConsumed = entry.status === 'consumed';

  return (
    <View style={styles.mealRow}>
      <View style={styles.mealInfo}>
        <Text style={[styles.mealName, { color: colors.text }]}>{name}</Text>
        <Text style={{ color: colors.textMuted, fontSize: 13 }}>
          {Math.round(entry.calories)} kcal · P {Math.round(entry.protein_g)} g · G{' '}
          {Math.round(entry.carbs_g)} g · L {Math.round(entry.fat_g)} g
        </Text>
      </View>
      <Pressable
        onPress={onConsume}
        disabled={isConsumed}
        accessibilityLabel={isConsumed ? 'Repas consommé' : 'Marquer comme consommé'}
        style={[
          styles.consumeButton,
          {
            backgroundColor: isConsumed ? colors.accent : 'transparent',
            borderColor: isConsumed ? colors.accent : colors.border,
          },
        ]}
      >
        <Check size={16} color={isConsumed ? colors.onAccent : colors.textMuted} strokeWidth={2.5} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  mealRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  mealInfo: { flex: 1, gap: 2 },
  mealName: { fontSize: 16, fontWeight: '500' },
  consumeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: { fontSize: 13, lineHeight: 19 },
});
