import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { imageUrl } from '@/api/tmdb';
import type { MovieSummary } from '@/api/types';
import { colors, fonts, spacing } from '@/constants/theme';

type MovieCardProps = {
  movie: MovieSummary;
};

export function MovieCard({ movie }: MovieCardProps) {
  const uri = imageUrl(movie.backdropPath ?? movie.posterPath, 'w780');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={movie.title}
      onPress={() => router.push({ pathname: '/movie/[id]', params: { id: String(movie.id) } })}
      style={styles.card}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          recyclingKey={String(movie.id)}
          transition={150}
        />
      ) : null}
      <LinearGradient
        colors={['transparent', 'rgba(0, 0, 0, 0.8)']}
        style={styles.shade}
      />
      <Text style={styles.title} numberOfLines={2}>
        {movie.title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    aspectRatio: 16 / 9,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    justifyContent: 'flex-end',
  },
  shade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '55%',
  },
  title: {
    color: colors.tabActive,
    fontFamily: fonts.medium,
    fontSize: 18,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
});
