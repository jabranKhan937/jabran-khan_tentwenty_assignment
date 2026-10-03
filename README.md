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

Watch lists upcoming movies from TMDb, pages as you scroll, and keeps the last successful list on disk so it still opens offline. A movie opens its detail, and Watch Trailer plays the YouTube trailer full screen. It starts on its own, closes when the video ends, and can be closed early. Get Tickets opens a date, hall, and seat map. That map is interface only: choosing seats updates the total, and Proceed to pay does not book anything or take payment. Search comes in a later commit.
