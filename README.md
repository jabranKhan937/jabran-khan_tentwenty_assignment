# Watch

TenTwenty React Native assignment. Upcoming movies from TMDb, through to choosing a seat.

## Stack

- Expo SDK 55 and React Native 0.83, TypeScript, New Architecture only
- Expo Router
- Android `targetSdkVersion` 36, iOS deployment target 15.1

SDK 55 is the current release that still supports iOS 15. SDK 56 and later require iOS 16.4, which misses the brief.

## Run

```bash
npm install
cp .env.example .env
npm start
```

Then press `i` for iOS or `a` for Android. Portrait and landscape are both enabled.

## API key

Create a free key at [TMDb](https://www.themoviedb.org/settings/api). Put it in `.env`:

```
EXPO_PUBLIC_TMDB_API_KEY=your_key_here
```

The app reads that variable. `.env` is gitignored. Do not commit the key.

## What's here

The shell has the theme, Poppins, and the four-tab bar from the Figma. Watch is the entry screen. `src/api/tmdb.ts` is the typed TMDb client for upcoming, search, detail, and videos. The screens that use it come in later commits.
