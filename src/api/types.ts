export type MovieSummary = {
  id: number;
  title: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string;
  genreIds: number[];
  voteAverage: number;
};

export type MovieGenre = {
  id: number;
  name: string;
};

export type MovieDetail = MovieSummary & {
  runtime: number | null;
  tagline: string;
  genres: MovieGenre[];
};

export type MovieVideo = {
  id: string;
  key: string;
  site: string;
  type: string;
  official: boolean;
  name: string;
};

export type MovieImage = {
  filePath: string;
  width: number;
  language: string | null;
};

export type PagedMovies = {
  page: number;
  totalPages: number;
  totalResults: number;
  results: MovieSummary[];
};

type MovieDto = {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  genre_ids?: number[];
  vote_average: number;
  runtime?: number | null;
  tagline?: string;
  genres?: MovieGenre[];
};

type PagedDto = {
  page: number;
  total_pages: number;
  total_results: number;
  results: MovieDto[];
};

type VideosDto = {
  results: Array<{
    id: string;
    key: string;
    site: string;
    type: string;
    official: boolean;
    name: string;
  }>;
};

type ImageDto = {
  file_path: string | null;
  width: number;
  iso_639_1: string | null;
};

type ImagesDto = {
  backdrops?: ImageDto[];
  posters?: ImageDto[];
};

export function toMovieSummary(dto: MovieDto): MovieSummary {
  return {
    id: dto.id,
    title: dto.title,
    overview: dto.overview,
    posterPath: dto.poster_path,
    backdropPath: dto.backdrop_path,
    releaseDate: dto.release_date,
    genreIds: dto.genre_ids ?? [],
    voteAverage: dto.vote_average,
  };
}

export function toPagedMovies(dto: PagedDto): PagedMovies {
  return {
    page: dto.page,
    totalPages: dto.total_pages,
    totalResults: dto.total_results,
    results: dto.results.map(toMovieSummary),
  };
}

export function toMovieDetail(dto: MovieDto): MovieDetail {
  return {
    ...toMovieSummary(dto),
    runtime: dto.runtime ?? null,
    tagline: dto.tagline ?? '',
    genres: dto.genres ?? [],
  };
}

export function toVideos(dto: VideosDto): MovieVideo[] {
  return dto.results.map((video) => ({
    id: video.id,
    key: video.key,
    site: video.site,
    type: video.type,
    official: video.official,
    name: video.name,
  }));
}

function toImages(items: ImageDto[] | undefined): MovieImage[] {
  return (items ?? []).flatMap((image) => {
    if (!image.file_path) {
      return [];
    }

    return [
      {
        filePath: image.file_path,
        width: image.width,
        language: image.iso_639_1,
      },
    ];
  });
}

export function toMovieImages(dto: ImagesDto): { backdrops: MovieImage[]; posters: MovieImage[] } {
  return {
    backdrops: toImages(dto.backdrops),
    posters: toImages(dto.posters),
  };
}

export function bestStill(
  images: { backdrops: MovieImage[]; posters: MovieImage[] },
  fallback: string | null,
): string | null {
  const englishOrNeutral = images.backdrops.filter(
    (image) => image.language === 'en' || image.language === null,
  );
  const pool = englishOrNeutral.length > 0 ? englishOrNeutral : images.backdrops;
  const widest = [...pool].sort((left, right) => right.width - left.width)[0];

  return widest?.filePath ?? images.posters[0]?.filePath ?? fallback;
}

export type { MovieDto, PagedDto, VideosDto, ImagesDto };
