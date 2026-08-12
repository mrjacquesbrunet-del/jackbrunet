import { useQuery } from '@tanstack/react-query';
import { LogOut } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/src/components/ui/Card';
import { useAuth } from '@/src/hooks/useAuth';
import { supabase } from '@/src/lib/supabase';
import { getActiveNutritionGoal, getProfile } from '@/src/services/profile';
import { radius, spacing, useTheme } from '@/src/lib/theme';

export default function ProfilScreen() {
  const { colors } = useTheme();
  const { session } = useAuth();

  const profile = useQuery({ queryKey: ['profile'], queryFn: getProfile });
  const goal = useQuery({ queryKey: ['nutrition-goal'], queryFn: getActiveNutritionGoal });

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>Profil</Text>

        <Card title="Compte">
          <Text style={[styles.name, { color: colors.text }]}>
            {profile.data?.first_name || 'Utilisateur'}
          </Text>
          <Text style={{ color: colors.textMuted }}>{session?.user.email}</Text>
        </Card>

        <Card title="Objectifs quotidiens">
          <ProfileRow label="Pas" value={`${profile.data?.daily_step_goal ?? 10000} pas`} />
          <ProfileRow
            label="Eau"
            value={`${((profile.data?.daily_water_goal_ml ?? 3000) / 1000).toLocaleString('fr-FR')} L`}
          />
          {goal.data ? (
            <>
              <ProfileRow label="Calories" value={`${goal.data.calories} kcal`} />
              <ProfileRow label="Protéines" value={`${goal.data.protein_g} g`} />
              <ProfileRow label="Glucides" value={`${goal.data.carbs_g} g`} />
              <ProfileRow label="Lipides" value={`${goal.data.fat_g} g`} />
            </>
          ) : (
            <Text style={{ color: colors.textMuted }}>
              Objectifs nutritionnels non définis. L'onboarding et l'édition du profil arrivent à
              l'étape 2 du développement (l'historique des objectifs est déjà géré côté base).
            </Text>
          )}
        </Card>

        <Card title="Poids">
          <ProfileRow
            label="Départ"
            value={profile.data?.starting_weight_kg ? `${profile.data.starting_weight_kg} kg` : '—'}
          />
          <ProfileRow
            label="Objectif"
            value={profile.data?.target_weight_kg ? `${profile.data.target_weight_kg} kg` : '—'}
          />
        </Card>

        <Pressable
          style={[styles.signOut, { borderColor: colors.border }]}
          onPress={() => supabase.auth.signOut()}
        >
          <LogOut size={18} color={colors.danger} strokeWidth={2} />
          <Text style={{ color: colors.danger, fontWeight: '600' }}>Se déconnecter</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <Text style={{ color: colors.textMuted }}>{label}</Text>
      <Text style={[styles.rowValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  name: { fontSize: 20, fontWeight: '700' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  rowValue: { fontWeight: '600', fontVariant: ['tabular-nums'] },
  signOut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 14,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
