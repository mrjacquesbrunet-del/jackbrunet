import { Link } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { isSupabaseConfigured, supabase } from '@/src/lib/supabase';
import { radius, spacing, useTheme } from '@/src/lib/theme';

export default function SignInScreen() {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function signIn() {
    setError(null);
    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (authError) setError('Connexion impossible. Vérifie ton email et ton mot de passe.');
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <Text style={[styles.title, { color: colors.text }]}>Fitness</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Ton cockpit de transformation physique
        </Text>

        {!isSupabaseConfigured ? (
          <Text style={[styles.warning, { color: colors.danger }]}>
            Configuration manquante : renseigne EXPO_PUBLIC_SUPABASE_URL et
            EXPO_PUBLIC_SUPABASE_ANON_KEY dans le fichier .env (voir .env.example).
          </Text>
        ) : null}

        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
          placeholder="Email"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
          placeholder="Mot de passe"
          placeholderTextColor={colors.textMuted}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {error ? <Text style={{ color: colors.danger }}>{error}</Text> : null}

        <Pressable
          style={[styles.button, { backgroundColor: colors.accent, opacity: loading ? 0.6 : 1 }]}
          onPress={signIn}
          disabled={loading || !email || !password}
        >
          {loading ? (
            <ActivityIndicator color={colors.onAccent} />
          ) : (
            <Text style={[styles.buttonText, { color: colors.onAccent }]}>Se connecter</Text>
          )}
        </Pressable>

        <View style={styles.footer}>
          <Text style={{ color: colors.textMuted }}>Pas encore de compte ?</Text>
          <Link href="/(auth)/sign-up" style={[styles.link, { color: colors.accent }]}>
            Créer un compte
          </Link>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
  title: { fontSize: 36, fontWeight: '800', letterSpacing: -1 },
  subtitle: { fontSize: 16, marginBottom: spacing.xl },
  warning: { fontSize: 13, marginBottom: spacing.md },
  input: {
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    fontSize: 16,
  },
  button: {
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  buttonText: { fontSize: 16, fontWeight: '700' },
  footer: { flexDirection: 'row', gap: spacing.sm, justifyContent: 'center', marginTop: spacing.lg },
  link: { fontWeight: '600' },
});
