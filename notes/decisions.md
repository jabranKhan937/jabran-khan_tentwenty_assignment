# Tell us how you decided

I used Expo SDK 55, TypeScript, Expo Router, and TanStack Query. Newer Expo needs iOS 16.4, and the brief asks for iOS 15, so I did not use it. I also skipped the template tabs. The app opens on a custom Watch tab bar that matches the design. Movies are cached on the device so the list can still open offline, and FlashList keeps long lists smooth.

Search gives every query an id and cancels the one before it. A late response is shown only if that id is still the current query. Typing "T" and then "Tim" cannot leave the old "T" results on screen. A test checks that the slower, older response is dropped.

I am not happy with the seat map. The design has curved rows. Mine is a flat grid with the same colors and prices. With more time I would draw the rows on a curve. Genre taps are also weak, because search is text only, so "Comedies" searches that word instead of the comedy genre.

At 10× the data, paging still works. The cache breaks first, because every loaded page and its images stay in memory. I would keep fewer pages saved and use smaller images while scrolling.
