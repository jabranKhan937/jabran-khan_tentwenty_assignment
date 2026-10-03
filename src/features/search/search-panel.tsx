import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';

import { imageUrl } from '@/api/tmdb';
import type { MovieSummary } from '@/api/types';
import { colors, fonts, spacing } from '@/constants/theme';
import { MovieListError, MovieListFooter } from '@/features/movies/list-states';
import { genreLabel, searchGenres, type SearchGenre } from '@/features/search/genres';
import { useMovieSearch } from '@/features/search/use-movie-search';

type SearchPanelProps = {
  onClose: () => void;
};

export function SearchPanel({ onClose }: SearchPanelProps) {
  const inputRef = useRef<TextInput>(null);
  const returnToField = useRef(false);
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const search = useMovieSearch(query);
  const trimmed = query.trim();
  const showResultsHeader = submitted && trimmed.length > 0 && search.status === 'success';

  useEffect(() => {
    if (!returnToField.current || submitted) {
      return;
    }

    returnToField.current = false;
    inputRef.current?.focus();
  }, [submitted]);

  return (
    <View style={[styles.panel, showResultsHeader && styles.resultsBackground]}>
      {showResultsHeader ? (
        <View style={styles.resultsHeader}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to search"
            onPress={() => {
              returnToField.current = true;
              setSubmitted(false);
            }}
            hitSlop={8}
          >
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </Pressable>
          <Text style={styles.resultsTitle}>
            {search.total} {search.total === 1 ? 'Result' : 'Results'} Found
          </Text>
        </View>
      ) : (
        <View style={styles.field}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={(value) => {
              setQuery(value);
              setSubmitted(false);
            }}
            onFocus={() => {
              setFocused(true);
              setSubmitted(false);
            }}
            onBlur={() => {
              setFocused(false);
              if (query.trim()) {
                setSubmitted(true);
              }
            }}
            placeholder="TV shows, movies and more"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
            clearButtonMode="never"
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={trimmed ? 'Clear search' : 'Close search'}
            onPress={() => {
              if (trimmed) {
                setQuery('');
                return;
              }
              onClose();
            }}
            hitSlop={8}
          >
            <Ionicons name="close" size={18} color={colors.textMuted} />
          </Pressable>
        </View>
      )}
      {trimmed.length === 0 ? (
        <GenreGrid
          onSelect={(genre) => {
            setQuery(genre.query);
            setFocused(false);
            setSubmitted(true);
            inputRef.current?.blur();
          }}
        />
      ) : (
        <SearchResults
          query={trimmed}
          focused={focused}
          search={search}
        />
      )}
    </View>
  );
}

function GenreGrid({ onSelect }: { onSelect: (genre: SearchGenre) => void }) {
  const { width, height } = useWindowDimensions();
  const columns = width > height ? 4 : 2;

  return (
    <ScrollView contentContainerStyle={styles.genres} keyboardShouldPersistTaps="handled">
      {chunkGenres(searchGenres, columns).map((row) => (
        <View key={row.map((genre) => genre.name).join('-')} style={styles.genreRow}>
          {row.map((genre) => (
            <Pressable
              key={genre.name}
              accessibilityRole="button"
              accessibilityLabel={genre.name}
              onPress={() => onSelect(genre)}
              style={styles.genre}
            >
              <Image
                source={{ uri: imageUrl(genre.imagePath, 'w500') ?? undefined }}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
              />
              <LinearGradient
                colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.45)']}
                style={StyleSheet.absoluteFill}
              />
              <Text style={styles.genreName}>{genre.name}</Text>
            </Pressable>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

function SearchResults({
  query,
  focused,
  search,
}: {
  query: string;
  focused: boolean;
  search: ReturnType<typeof useMovieSearch>;
}) {
  if (search.status === 'error' && search.movies.length === 0) {
    return <MovieListError error={search.error} onRetry={search.retry} />;
  }

  if (search.status === 'loading' || search.query !== query) {
    return (
      <View style={styles.results}>
        <ResultHeading focused={focused} />
        <View style={styles.skeleton} />
        <View style={styles.skeleton} />
        <View style={styles.skeleton} />
      </View>
    );
  }

  return (
    <FlashList
      style={styles.flex}
      data={search.movies}
      keyExtractor={(movie) => String(movie.id)}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.list}
      ListHeaderComponent={
        search.movies.length === 0 ? null : <ResultHeading focused={focused} />
      }
      renderItem={({ item }) => <ResultRow movie={item} />}
      ItemSeparatorComponent={ResultGap}
      ListEmptyComponent={<EmptyResults query={query} />}
      ListFooterComponent={<MovieListFooter visible={search.isFetchingNextPage} />}
      onEndReached={() => {
        if (search.page < search.totalPages && !search.isFetchingNextPage) {
          search.fetchNextPage();
        }
      }}
      onEndReachedThreshold={0.4}
    />
  );
}

function chunkGenres(genres: SearchGenre[], columns: number): SearchGenre[][] {
  const rows: SearchGenre[][] = [];

  for (let index = 0; index < genres.length; index += columns) {
    rows.push(genres.slice(index, index + columns));
  }

  return rows;
}

function ResultHeading({ focused }: { focused: boolean }) {
  if (!focused) {
    return null;
  }

  return (
    <View style={styles.topResultsWrap}>
      <Text style={styles.topResults}>Top Results</Text>
    </View>
  );
}

function ResultRow({ movie }: { movie: MovieSummary }) {
  const uri = imageUrl(movie.backdropPath ?? movie.posterPath, 'w300');
  const genre = genreLabel(movie.genreIds);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={movie.title}
      onPress={() => router.push({ pathname: '/movie/[id]', params: { id: String(movie.id) } })}
      style={styles.row}
    >
      {uri ? (
        <Image source={{ uri }} style={styles.still} contentFit="cover" />
      ) : (
        <View style={styles.still} />
      )}
      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle} numberOfLines={2}>
          {movie.title}
        </Text>
        {genre ? <Text style={styles.rowGenre}>{genre}</Text> : null}
      </View>
      <Ionicons name="ellipsis-horizontal" size={18} color={colors.primary} />
    </Pressable>
  );
}

function EmptyResults({ query }: { query: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>No results</Text>
      <Text style={styles.emptyBody}>Nothing matched “{query}”.</Text>
    </View>
  );
}

function ResultGap() {
  return <View style={styles.gap} />;
}

const styles = StyleSheet.create({
  panel: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  resultsBackground: {
    backgroundColor: colors.surface,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    minHeight: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 14,
    paddingVertical: 10,
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  resultsTitle: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 16,
  },
  genres: {
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
  genreRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  genre: {
    flex: 1,
    aspectRatio: 1.55,
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.tabBar,
  },
  genreName: {
    color: colors.tabActive,
    fontFamily: fonts.medium,
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
  },
  results: {
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  skeleton: {
    height: 100,
    borderRadius: 10,
    backgroundColor: colors.border,
  },
  list: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
  topResultsWrap: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
  },
  topResults: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  still: {
    width: 130,
    height: 100,
    borderRadius: 10,
    backgroundColor: colors.border,
  },
  rowCopy: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 16,
  },
  rowGenre: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  gap: {
    height: spacing.md,
  },
  empty: {
    paddingTop: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyTitle: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 18,
  },
  emptyBody: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 14,
    textAlign: 'center',
  },
});
