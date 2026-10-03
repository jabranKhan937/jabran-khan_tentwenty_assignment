import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { getUpcomingMovies } from '@/api/tmdb';
import type { MovieSummary } from '@/api/types';

export function useUpcomingMovies() {
  const query = useInfiniteQuery({
    queryKey: ['movies', 'upcoming'],
    queryFn: ({ pageParam }) => getUpcomingMovies(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
  });

  const movies = useMemo(() => {
    const seen = new Set<number>();
    const list: MovieSummary[] = [];

    for (const page of query.data?.pages ?? []) {
      for (const movie of page.results) {
        if (seen.has(movie.id)) {
          continue;
        }
        seen.add(movie.id);
        list.push(movie);
      }
    }

    return list;
  }, [query.data]);

  return { ...query, movies };
}
