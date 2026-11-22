# What’s Happening?

**Make a day of it.** An Android calendar app with daily discoveries and reminders, plus a matching [web preview](https://nikki0radz.github.io/What-s-Happening-/).

Version **0.3.0** includes **216 events across November and December 2026**, with three to five events on every date. The approved lilac/lime design and stock-photo style are retained.

## In the app

- **Design mode:** toggle the top slider to pause controls and animations, then tap any element to comment. Scrolling stays available. Notes are stored locally, can be edited/deleted, and export to JSON with selectors, text, styles and screen context. Turn the mode off to navigate, then on again to review another screen. Android uses the system file saver.
- **Today:** the actual local date, an event picker, a featured event and everything else happening that day.
- **Calendar:** November/December navigation, month grid, grouped event list, search and all events for a selected date.
- **My Days:** save individual events, including several on the same date. Original December web bookmarks are preserved.
- **Android reminders:** a daily round-up, plus an extra reminder for each saved event. Times are adjustable and use the phone’s time zone.
- **Offline:** Android includes its catalogue, photographs and fonts. No account, tracking or paid API is required.
- **Calendar export:** optionally save selected events as an ICS file with alarms.

Multi-day festivals appear at their start, with the range explained in the details. Informal days are labelled as such; cultural and regional observances show their scope. The catalogue covers 2026, not an automatically repeating annual calendar.

## Install and check notifications

Install the supplied signed `Whats-Happening-0.3.0.apk` on Android 8 or newer. In the app, press **Turn on** and allow notifications.

Open the bell settings and choose **Try a reminder in 10 seconds**. You can close the app before the test notification arrives. The optional **Allow precise reminder times** setting lets Android deliver scheduled reminders more precisely; without it Android may delay an alert.

Normal background use does not require keeping the app open. Android **Force stop** pauses reminders until the app is reopened. The app restores schedules after a restart, update or time-zone change. Notification taps open the relevant date or saved event.

The web preview supports browser alerts while open. Background Android notifications are implemented in the APK, not in GitHub Pages.

## Run the web version

Node.js 20.11+ is required. No dependency installation or API keys are needed.

```sh
npm start
```

Open `http://localhost:3000`.

```sh
npm run build
npm run check
npm test
```

`npm run build` updates the offline cache manifest. Source changes go on `main`, which GitHub Pages publishes.

## Build Android

See [Android build instructions](docs/ANDROID-BUILD.md). The Android shell uses a bundled WebView interface and native AlarmManager notifications. It never loads remote pages into the privileged WebView; external reference links open in the browser.

Validation includes seven JavaScript tests, eleven JVM scheduling checks (including time-zone and DST cases), Android compilation, packaged asset checks and APK signature verification. The interface was checked in desktop and 390px browser previews. **Physical-device/emulator notification delivery has not been tested in this environment**; use the in-app ten-second test after installing.

See [content sources](docs/CONTENT-SOURCES.md) and [photo/font credits](PHOTO-CREDITS.md). The descriptions are original and photos are illustrative; related events sometimes share an image. This project is not affiliated with Days Of The Year.
