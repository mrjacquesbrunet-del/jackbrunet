import { StyleSheet, Text, View, type ViewProps } from 'react-native';

import { radius, spacing, useTheme } from '@/src/lib/theme';

interface CardProps extends ViewProps {
  title?: string;
}

/** Grande carte de base du design system (fond, bord, rayon, espacement). */
export function Card({ title, style, children, ...rest }: CardProps) {
  const { colors } = useTheme();
  return (
    <View
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, style]}
      {...rest}
    >
      {title ? <Text style={[styles.title, { color: colors.textMuted }]}>{title}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});
