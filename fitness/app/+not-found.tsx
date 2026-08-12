import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { spacing, useTheme } from '@/src/lib/theme';

export default function NotFoundScreen() {
  const { colors } = useTheme();
  return (
    <>
      <Stack.Screen options={{ title: 'Page introuvable' }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>Cette page n'existe pas.</Text>
        <Link href="/" style={styles.link}>
          <Text style={{ color: colors.accent, fontWeight: '600' }}>Retour à l'accueil</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  title: { fontSize: 20, fontWeight: '700' },
  link: { marginTop: spacing.lg, paddingVertical: spacing.lg },
});
