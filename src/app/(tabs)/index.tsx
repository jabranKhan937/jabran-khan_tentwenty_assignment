import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { useNetInfo } from '@react-native-community/netinfo';
import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/screen';
import { colors, fonts, spacing } from '@/constants/theme';
import { MovieCard } from '@/features/movies/movie-card';
import {
  MovieListEmpty,
  MovieListError,
  MovieListFooter,
  MovieListLoading,
} from '@/features/movies/list-states';
import { useUpcomingMovies } from '@/features/movies/use-upcoming-movies';

export default function WatchScreen() {
  const net = useNetInfo();
  const {
    movies,
    isPending,
    isError,
    error,
    isRefetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useUpcomingMovies();

  const offline = net.isConnected === false;
  const showCachedList = movies.length > 0;

  return (
    <Screen>
      <View style={styles.column}>
        <View style={styles.header}>
          <Text style={styles.title}>Watch</Text>
          <Ionicons name="search" size={22} color={colors.text} />
        </View>
        {offline && showCachedList ? (
          <Text style={styles.offline}>No connection. Showing saved movies.</Text>
        ) : null}
        {isPending && !showCachedList ? (
          <MovieListLoading />
        ) : isError && !showCachedList ? (
          <MovieListError error={error} onRetry={() => refetch()} />
        ) : (
          <FlashList
            data={movies}
            keyExtractor={(movie) => String(movie.id)}
            renderItem={({ item }) => <MovieCard movie={item} />}
            ItemSeparatorComponent={Separator}
            contentContainerStyle={styles.list}
            refreshing={isRefetching && !isFetchingNextPage}
            onRefresh={() => refetch()}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
              }
            }}
            onEndReachedThreshold={0.4}
            ListEmptyComponent={MovieListEmpty}
            ListFooterComponent={<MovieListFooter visible={isFetchingNextPage} />}
          />
        )}
      </View>
    </Screen>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  column: {
    flex: 1,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 18,
  },
  offline: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  list: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  separator: {
    height: spacing.md,
  },
});
