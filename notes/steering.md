# Where the model was steered

- Latest Expo was the first suggestion. Rejected after checking the platform table. SDK 56 and 57 need iOS 16.4. The brief says iOS 15+. The project is Expo SDK 55.
- The generated template uses `NativeTabs` and a Home / Explore demo. That does not match frames 01–04. Those screens were removed. The tab bar is a custom dark bar in the Figma order, and the app opens on Watch.
- The template locked orientation to portrait and followed the system dark theme. The brief asks for portrait and landscape, and the Figma is a light UI. Orientation is unlocked and the interface style is light, so an undesigned dark theme cannot appear.
- The template's `reset-project` script restores the Expo example. Removed, so a later reset cannot wipe the assignment.
- The Watch search icon opens search on the same tab, so the tab bar stays and Watch remains selected, matching frames 02–04. Results are applied only when their request is still the latest one. The previous request is aborted.
- TMDb `/videos` returns a YouTube id, not a file URL. The trailer uses a WebView and the YouTube IFrame API so it can autoplay, report when it ends, and report a playback error. The video id is checked before it is placed in the page.
- Dates, halls, and seat prices are the values drawn in the Figma frames. They are not loaded from TMDb. Proceed to pay confirms the selection and states that nothing is booked or charged.
