export function formatInTheaters(releaseDate: string): string | null {
  if (!releaseDate) {
    return null;
  }

  const date = new Date(`${releaseDate}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const formatted = date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return `In Theaters ${formatted}`;
}
