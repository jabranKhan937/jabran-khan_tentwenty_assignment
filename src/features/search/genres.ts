export type SearchGenre = {
  name: string;
  query: string;
  imagePath: string;
};

export const searchGenres: SearchGenre[] = [
  { name: 'Comedies', query: 'Comedies', imagePath: '/aKPCZwkSZy2ASLo0QKeYmcoplfA.jpg' },
  { name: 'Crime', query: 'Crime', imagePath: '/ejdD20cdHNFAYAN2DlqPToXKyzx.jpg' },
  { name: 'Family', query: 'Family', imagePath: '/b7xQ5fuyVO4c24igizCfPgF6n7q.jpg' },
  { name: 'Documentaries', query: 'Documentaries', imagePath: '/ztEbGnKWoNmMlGDRQa2nB06GQpR.jpg' },
  { name: 'Dramas', query: 'Dramas', imagePath: '/nlPCdZlHtRNcF6C9hzUH4ebmV1w.jpg' },
  { name: 'Fantasy', query: 'Fantasy', imagePath: '/abirSHwWgKajV3hXhaIR5lcCIXe.jpg' },
  { name: 'Holidays', query: 'Holidays', imagePath: '/ih2xVgeMS8R5WUetYE8Mr9hVTlB.jpg' },
  { name: 'Horror', query: 'Horror', imagePath: '/qVGpxnjrGlHaSTCqTQI6viBDSfp.jpg' },
  { name: 'Sci-Fi', query: 'Sci-Fi', imagePath: '/gqrnQA6Xppdl8vIb2eJc58VC1tW.jpg' },
  { name: 'Thriller', query: 'Thriller', imagePath: '/iWak7wT0j6ycCc8lKr4NBz9c7n5.jpg' },
];

const GENRE_NAMES: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
};

export function genreLabel(genreIds: number[]): string | null {
  for (const id of genreIds) {
    const name = GENRE_NAMES[id];
    if (name) {
      return name;
    }
  }

  return null;
}
