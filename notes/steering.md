# Where the model was steered

- Latest Expo was the first suggestion. Rejected after checking the platform table. SDK 56 and 57 need iOS 16.4. The brief says iOS 15+. The project is Expo SDK 55.
- The generated template uses `NativeTabs` and a Home / Explore demo. That does not match frames 01–04. Those screens were removed. The tab bar is a custom dark bar in the Figma order, and the app opens on Watch.
- The template locked orientation to portrait and followed the system dark theme. The brief asks for portrait and landscape, and the Figma is a light UI. Orientation is unlocked and the interface style is light, so an undesigned dark theme cannot appear.
- The template's `reset-project` script restores the Expo example. Removed, so a later reset cannot wipe the assignment.
- The Watch header draws the search icon from frame 01, but it is not a button yet. A control that does nothing is a dead state. It becomes the search action in the search slice.
