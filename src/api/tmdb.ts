import {
  toMovieDetail,
  toPagedMovies,
  toMovieImages,
  toVideos,
  type ImagesDto,
  type MovieDetail,
  type MovieDto,
  type MovieImage,
  type MovieVideo,
  type PagedDto,
  type PagedMovies,
  type VideosDto,
} from '@/api/types';

const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export class TmdbError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'TmdbError';
  }
}

export function imageUrl(filePath: string | null, size = 'w500'): string | null {
  if (!filePath) {
    return null;
  }

  return `${IMAGE_BASE_URL}/${size}${filePath}`;
}

function apiKey(): string {
  const key = process.env.EXPO_PUBLIC_TMDB_API_KEY;

  if (!key) {
    throw new TmdbError('Missing EXPO_PUBLIC_TMDB_API_KEY', 0);
  }

  return key;
}

async function get<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set('api_key', apiKey());

  for (const [name, value] of Object.entries(params)) {
    url.searchParams.set(name, String(value));
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new TmdbError(`TMDb request failed for ${path}`, response.status);
  }

  return (await response.json()) as T;
}

export function getUpcomingMovies(page = 1): Promise<PagedMovies> {
  return get<PagedDto>('/movie/upcoming', { page }).then(toPagedMovies);
}

export function searchMovies(query: string, page = 1): Promise<PagedMovies> {
  return get<PagedDto>('/search/movie', { query, page }).then(toPagedMovies);
}

export function getMovie(id: number): Promise<MovieDetail> {
  return get<MovieDto>(`/movie/${id}`).then(toMovieDetail);
}

export function getMovieVideos(id: number): Promise<MovieVideo[]> {
  return get<VideosDto>(`/movie/${id}/videos`).then(toVideos);
}

export function getMovieImages(id: number): Promise<{ backdrops: MovieImage[]; posters: MovieImage[] }> {
  return get<ImagesDto>(`/movie/${id}/images`).then(toMovieImages);
}

export function youtubeTrailer(videos: MovieVideo[]): MovieVideo | null {
  const trailers = videos.filter((video) => video.site === 'YouTube' && video.type === 'Trailer');
  return trailers.find((video) => video.official) ?? trailers[0] ?? null;
}
