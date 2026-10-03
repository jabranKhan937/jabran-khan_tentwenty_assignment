# Planning notes

Left as written while the work was being planned. The second version is the correction, not a replacement that deletes the first.

## Version 1 — before looking up current Expo releases

Build feature by feature, one commit per slice.

1. Project shell. Current Expo with TypeScript and the New Architecture. Android target API 36, iOS 15+. Theme from the Figma guide (Poppins, blue buttons, genre chip colors). Navigation skeleton. API key from an env variable, listed in `.env.example`, documented in the README, never committed.
2. TMDb client. Typed fetch wrapper for upcoming, detail, videos, images, and search. Image URLs from `https://image.tmdb.org/t/p/{size}/{file_path}`.
3. Movie list. `GET /movie/upcoming` with pagination. Loading, empty, and error. Cache the list so it still opens offline, refetch when the connection returns.
4. Movie detail. `GET /movie/{id}`, plus videos and images. Get Tickets goes to the date screen.
5. Trailer. Videos endpoint returns a site and a key, usually YouTube. Full screen, starts on its own, returns to detail when it ends, can be closed early. If there is no trailer, say so. No blank screen.
6. Search. Genre grid, then a query that feels immediate. Request id plus cancel the previous request so a slow response for an old query cannot replace the current one. Test that.
7. Seats. Frames 06 and 07 as local UI state only. Date, hall, and seats update the legend, count, and total. Nothing is saved, booked, or paid.
8. Portrait and landscape, and a pass so cached movies still render with no connection.
9. Tests for list states, stale search, trailer end, and seat total.
10. Jabran writes the half-page note himself.

Stack I was going to reach for: latest Expo, React Navigation or Expo Router, TanStack Query with a persisted cache, FlashList.

Figma frames, 375 x 812, Poppins:

- 01 Watch — upcoming list, search icon, bottom tabs
- 02–04 search — genre grid, live results, "N Results Found"
- 05 detail — hero, Get Tickets, Watch Trailer, genres, overview
- 06 date and hall, then Select Seats
- 07 seat map, UI only

Dashboard, Media Library, and More are in the tab bar and are not part of the assignment. Draw the bar. Do not build those tabs.

## Version 2 — after checking Expo SDK 55, 56, and 57

SDK 56 and 57 target Android API 36 but their minimum iOS is 16.4. The brief says iOS 15+. SDK 55 is New Architecture only (the legacy architecture is gone, and `newArchEnabled` is no longer a flag), targets Android API 36, and the minimum iOS is 15.1. Use SDK 55. Do not take the latest SDK.

The default template ships native tabs (Home / Explore) and a demo. That bar does not match the Figma. Replace it with the dark custom tab bar: Dashboard, Watch, Media Library, More. Watch is the screen the app opens on.

Detail, trailer, and seats will be stack screens outside the tabs, because frames 05–07 do not show the tab bar.

Colors below are read off the Figma guide and the frames. Check them again when each screen is built, and correct the token if a frame disagrees.

- background #FFFFFF
- text #202C43
- muted #8F8F8F
- primary #61C3F2
- tab bar #2E2739
- inactive tab #827D88
- chips: action #15D2BC, thriller #E26CA5, science #564CA3, fiction #CD9D0F

The search icon on Watch stays off this slice. A button that does nothing is a dead control. It lands with the search slice.
