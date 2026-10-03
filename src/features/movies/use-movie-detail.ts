import { useQuery } from '@tanstack/react-query';

import { getMovie, getMovieImages, getMovieVideos, youtubeTrailer } from '@/api/tmdb';
import { bestStill } from '@/api/types';

export function useMovieDetail(id: number) {
  return useQuery({
    queryKey: ['movie', id],
    enabled: Number.isInteger(id) && id > 0,
    queryFn: async () => {
      const [movie, videos, images] = await Promise.all([
        getMovie(id),
        getMovieVideos(id),
        getMovieImages(id),
      ]);

      return {
        movie,
        trailer: youtubeTrailer(videos),
        stillPath: bestStill(images, movie.backdropPath ?? movie.posterPath),
      };
    },
  });
}
