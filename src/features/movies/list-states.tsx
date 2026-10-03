import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { TmdbError } from '@/api/tmdb';
import { colors, fonts, spacing } from '@/constants/theme';

export function MovieListLoading() {
  return (
    <View style={styles.stack}>
      <View style={styles.skeleton} />
      <View style={styles.skeleton} />
      <View style={styles.skeleton} />
    </View>
  );
}

export function MovieListEmpty() {
  return (
    <View style={styles.centered}>
      <Text style={styles.title}>No upcoming movies</Text>
      <Text style={styles.body}>Nothing is scheduled right now.</Text>
    </View>
  );
}

type ErrorProps = {
  error: unknown;
  onRetry: () => void;
};

export function MovieListError({ error, onRetry }: ErrorProps) {
  const missingKey = error instanceof TmdbError && error.status === 0;

  return (
    <View style={styles.centered}>
      <Text style={styles.title}>
        {missingKey ? 'API key needed' : "Couldn't load movies"}
      </Text>
      <Text style={styles.body}>
        {missingKey
          ? 'Add your TMDb key to .env as EXPO_PUBLIC_TMDB_API_KEY, then restart the app.'
          : 'Check the connection and try again. Saved movies will show here once they have loaded before.'}
      </Text>
      <Pressable onPress={onRetry} style={styles.button} accessibilityRole="button">
        <Text style={styles.buttonLabel}>Try again</Text>
      </Pressable>
    </View>
  );
}

export function MovieListFooter({ visible }: { visible: boolean }) {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.footer}>
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.md,
  },
  skeleton: {
    aspectRatio: 16 / 9,
    borderRadius: 10,
    backgroundColor: colors.surface,
  },
  centered: {
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 18,
    textAlign: 'center',
  },
  body: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    marginTop: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
  },
  buttonLabel: {
    color: colors.tabActive,
    fontFamily: fonts.semibold,
    fontSize: 14,
  },
  footer: {
    paddingVertical: spacing.md,
  },
});
