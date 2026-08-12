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

import { supabase } from '@/src/lib/supabase';
import { radius, spacing, useTheme } from '@/src/lib/theme';

export default function SignUpScreen() {
  const { colors } = useTheme();
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function signUp() {
    setError(null);
    setInfo(null);
    setLoading(true);
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { first_name: firstName } },
    });
    setLoading(false);
    if (authError) {
      setError("Inscription impossible. Vérifie l'email et un mot de passe d'au moins 6 caractères.");
      return;
    }
    if (!data.session) {
      setInfo('Compte créé. Confirme ton adresse email puis connecte-toi.');
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <Text style={[styles.title, { color: colors.text }]}>Créer un compte</Text>

        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
          placeholder="Prénom"
          placeholderTextColor={colors.textMuted}
          value={firstName}
          onChangeText={setFirstName}
        />
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
          placeholder="Mot de passe (6 caractères minimum)"
          placeholderTextColor={colors.textMuted}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {error ? <Text style={{ color: colors.danger }}>{error}</Text> : null}
        {info ? <Text style={{ color: colors.accent }}>{info}</Text> : null}

        <Pressable
          style={[styles.button, { backgroundColor: colors.accent, opacity: loading ? 0.6 : 1 }]}
          onPress={signUp}
          disabled={loading || !email || !password}
        >
          {loading ? (
            <ActivityIndicator color={colors.onAccent} />
          ) : (
            <Text style={[styles.buttonText, { color: colors.onAccent }]}>Créer mon compte</Text>
          )}
        </Pressable>

        <View style={styles.footer}>
          <Text style={{ color: colors.textMuted }}>Déjà un compte ?</Text>
          <Link href="/(auth)/sign-in" style={[styles.link, { color: colors.accent }]}>
            Se connecter
          </Link>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
  title: { fontSize: 28, fontWeight: '800', marginBottom: spacing.lg },
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
