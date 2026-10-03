import { useCallback, useEffect, useRef, useState } from 'react';

import { searchMovies } from '@/api/tmdb';
import type { MovieSummary } from '@/api/types';
import { createSearchSession, takeSearchResult, type SearchTicket } from '@/features/search/search-session';

const DEBOUNCE_MS = 200;

type SearchStatus = 'idle' | 'loading' | 'success' | 'error';

export type MovieSearchState = {
  query: string;
  movies: MovieSummary[];
  total: number;
  page: number;
  totalPages: number;
  status: SearchStatus;
  error: unknown;
  isFetchingNextPage: boolean;
};

const emptyState: MovieSearchState = {
  query: '',
  movies: [],
  total: 0,
  page: 0,
  totalPages: 0,
  status: 'idle',
  error: null,
  isFetchingNextPage: false,
};

export function useMovieSearch(query: string) {
  const session = useRef(createSearchSession()).current;
  const ticketRef = useRef<SearchTicket | null>(null);
  const stateRef = useRef<MovieSearchState>(emptyState);
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<MovieSearchState>(emptyState);
  stateRef.current = state;

  useEffect(() => {
    const trimmed = query.trim();

    if (!trimmed) {
      session.begin();
      ticketRef.current = null;
      setState(emptyState);
      return;
    }

    const ticket = session.begin();
    ticketRef.current = ticket;
    setState({
      ...emptyState,
      query: trimmed,
      status: 'loading',
    });

    const timer = setTimeout(() => {
      if (!session.isCurrent(ticket.id)) {
        return;
      }

      searchMovies(trimmed, 1, ticket.signal)
        .then((page) => {
          const accepted = takeSearchResult(session, ticket.id, page);
          if (!accepted) {
            return;
          }

          setState({
            query: trimmed,
            movies: accepted.results,
            total: accepted.totalResults,
            page: accepted.page,
            totalPages: accepted.totalPages,
            status: 'success',
            error: null,
            isFetchingNextPage: false,
          });
        })
        .catch((error: unknown) => {
          if (!session.isCurrent(ticket.id) || ticket.signal.aborted) {
            return;
          }

          setState({
            ...emptyState,
            query: trimmed,
            status: 'error',
            error,
          });
        });
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
    };
  }, [attempt, query, session]);

  const fetchNextPage = useCallback(() => {
    const ticket = ticketRef.current;
    const current = stateRef.current;

    if (!ticket || !session.isCurrent(ticket.id)) {
      return;
    }

    if (
      current.status !== 'success' ||
      current.isFetchingNextPage ||
      current.page >= current.totalPages
    ) {
      return;
    }

    const nextPage = current.page + 1;
    const currentQuery = current.query;
    setState((latest) => ({ ...latest, isFetchingNextPage: true }));

    searchMovies(currentQuery, nextPage, ticket.signal)
      .then((page) => {
        const accepted = takeSearchResult(session, ticket.id, page);
        if (!accepted) {
          return;
        }

        setState((latest) => {
          if (latest.query !== currentQuery || latest.page !== nextPage - 1) {
            return { ...latest, isFetchingNextPage: false };
          }

          const seen = new Set(latest.movies.map((movie) => movie.id));
          const movies = [...latest.movies];

          for (const movie of accepted.results) {
            if (!seen.has(movie.id)) {
              seen.add(movie.id);
              movies.push(movie);
            }
          }

          return {
            ...latest,
            movies,
            page: accepted.page,
            total: accepted.totalResults,
            totalPages: accepted.totalPages,
            isFetchingNextPage: false,
          };
        });
      })
      .catch(() => {
        if (!session.isCurrent(ticket.id) || ticket.signal.aborted) {
          return;
        }

        setState((latest) => ({ ...latest, isFetchingNextPage: false }));
      });
  }, [session]);

  const retry = useCallback(() => {
    setAttempt((current) => current + 1);
  }, []);

  return { ...state, fetchNextPage, retry };
}
