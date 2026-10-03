import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { imageUrl } from '@/api/tmdb';
import { colors, fonts, spacing } from '@/constants/theme';
import { formatInTheaters } from '@/features/movies/format-release';
import { MovieListError, MovieListLoading } from '@/features/movies/list-states';
import { TrailerPlayer } from '@/features/movies/trailer-player';
import { useMovieDetail } from '@/features/movies/use-movie-detail';
import { useOrientation } from '@/hooks/use-orientation';

const chipColors = [
  colors.genreAction,
  colors.genreThriller,
  colors.genreScience,
  colors.genreFiction,
] as const;

function chipColor(name: string, index: number): string {
  const normalized = name.toLowerCase();

  if (normalized.includes('action')) {
    return colors.genreAction;
  }
  if (normalized.includes('thriller')) {
    return colors.genreThriller;
  }
  if (normalized.includes('science')) {
    return colors.genreScience;
  }
  if (normalized.includes('fiction')) {
    return colors.genreFiction;
  }

  return chipColors[index % chipColors.length];
}

export default function MovieDetailScreen() {
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const id = Number(rawId);
  const insets = useSafeAreaInsets();
  const { width, height, isLandscape } = useOrientation();
  const query = useMovieDetail(id);
  const [trailerOpen, setTrailerOpen] = useState(false);

  if (!Number.isInteger(id) || id <= 0) {
    return (
      <View style={styles.plain}>
        <MovieListError error={new Error('bad id')} onRetry={() => router.back()} />
      </View>
    );
  }

  if (query.isPending && !query.data) {
    return (
      <View style={[styles.plain, { paddingTop: insets.top }]}>
        <BackHeader onBack={() => router.back()} light={false} />
        <MovieListLoading />
      </View>
    );
  }

  if (query.isError && !query.data) {
    return (
      <View style={[styles.plain, { paddingTop: insets.top }]}>
        <BackHeader onBack={() => router.back()} light={false} />
        <MovieListError error={query.error} onRetry={() => query.refetch()} />
      </View>
    );
  }

  const detail = query.data;

  if (!detail) {
    return null;
  }

  const still = imageUrl(detail.stillPath, 'w780');
  const release = formatInTheaters(detail.movie.releaseDate);
  const trailer = detail.trailer;
  const heroHeight = Math.min(Math.max(height * 0.56, 380), height * 0.68);
  const frameStyle = {
    paddingLeft: insets.left,
    paddingRight: insets.right,
  };

  const hero = (
    <View style={[styles.hero, isLandscape ? styles.heroLandscape : { height: heroHeight }]}>
      {still ? <Image source={{ uri: still }} style={StyleSheet.absoluteFill} contentFit="cover" /> : null}
      <LinearGradient
        colors={['rgba(0,0,0,0.45)', 'transparent', 'rgba(0,0,0,0.82)']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.heroActions}>
        {release ? <Text style={styles.release}>{release}</Text> : null}
        <View style={isLandscape ? styles.heroActionsRow : styles.heroActionsStack}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push({ pathname: '/movie/[id]/seats', params: { id: String(id) } })}
            style={[styles.tickets, isLandscape && styles.actionFlex]}
          >
            <Text style={styles.ticketsLabel}>Get Tickets</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityState={trailer ? {} : { disabled: true }}
            disabled={!trailer}
            onPress={() => setTrailerOpen(true)}
            style={[styles.trailer, isLandscape && styles.actionFlex, !trailer && styles.trailerDisabled]}
          >
            <Ionicons name="play" size={14} color={colors.tabActive} />
            <Text style={styles.trailerLabel}>{trailer ? 'Watch Trailer' : 'No trailer'}</Text>
          </Pressable>
        </View>
        {!trailer ? <Text style={styles.noTrailer}>This movie has no YouTube trailer yet.</Text> : null}
      </View>
    </View>
  );

  const details = (
    <View style={[styles.body, { maxWidth: isLandscape ? 420 : width }]}>
      <Text style={styles.section}>Genres</Text>
      <View style={styles.chips}>
        {detail.movie.genres.length === 0 ? (
          <Text style={styles.overview}>No genres listed.</Text>
        ) : (
          detail.movie.genres.map((genre, index) => (
            <View key={genre.id} style={[styles.chip, { backgroundColor: chipColor(genre.name, index) }]}>
              <Text style={styles.chipLabel}>{genre.name}</Text>
            </View>
          ))
        )}
      </View>
      <View style={styles.divider} />
      <Text style={styles.section}>Overview</Text>
      <Text style={styles.overview}>
        {detail.movie.overview || 'No overview has been published for this movie.'}
      </Text>
    </View>
  );

  return (
    <View style={[styles.plain, frameStyle]}>
      {isLandscape ? (
        <View style={styles.landscape}>
          {hero}
          <ScrollView style={styles.detailPane} contentContainerStyle={{ paddingBottom: insets.bottom + spacing.lg }}>
            {details}
          </ScrollView>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + spacing.lg }}>
          {hero}
          {details}
        </ScrollView>
      )}
      <View style={[styles.header, { paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right }]}>
        <BackHeader onBack={() => router.back()} light />
      </View>
      {trailerOpen && trailer ? (
        <TrailerPlayer videoId={trailer.key} onClose={() => setTrailerOpen(false)} />
      ) : null}
    </View>
  );
}

function BackHeader({ onBack, light }: { onBack: () => void; light: boolean }) {
  const color = light ? colors.tabActive : colors.text;

  return (
    <View style={styles.headerRow}>
      <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={onBack} hitSlop={8}>
        <Ionicons name="chevron-back" size={24} color={color} />
      </Pressable>
      <Text style={[styles.headerTitle, { color }]}>Watch</Text>
      <View style={styles.headerSpacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  plain: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.medium,
    fontSize: 16,
  },
  headerSpacer: {
    width: 24,
  },
  landscape: {
    flex: 1,
    flexDirection: 'row',
  },
  detailPane: {
    flex: 1,
  },
  hero: {
    justifyContent: 'flex-end',
    backgroundColor: colors.tabBar,
  },
  heroLandscape: {
    flex: 1.1,
  },
  heroActions: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  heroActionsStack: {
    gap: spacing.sm,
  },
  heroActionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionFlex: {
    flex: 1,
  },
  release: {
    color: colors.tabActive,
    fontFamily: fonts.medium,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  tickets: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ticketsLabel: {
    color: colors.tabActive,
    fontFamily: fonts.semibold,
    fontSize: 16,
  },
  trailer: {
    minHeight: 50,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.tabActive,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  trailerDisabled: {
    opacity: 0.7,
  },
  trailerLabel: {
    color: colors.tabActive,
    fontFamily: fonts.semibold,
    fontSize: 16,
  },
  noTrailer: {
    color: colors.tabActive,
    fontFamily: fonts.regular,
    fontSize: 12,
    textAlign: 'center',
  },
  body: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  section: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 16,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  chipLabel: {
    color: colors.tabActive,
    fontFamily: fonts.semibold,
    fontSize: 12,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  overview: {
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
  },
});
