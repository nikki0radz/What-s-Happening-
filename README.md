# What’s Happening?

**Make a day of it.** An Android calendar app with daily discoveries and reminders, plus a matching [web preview](https://nikki0radz.github.io/What-s-Happening-/).

Version **0.6.0** includes **215 events across November and December 2026**, with two to five events on every date. The lilac/lime design is retained, with the 28 exported review notes applied. The source research checked all 216 original entries; 215 remain in these months after one organiser-confirmed move to January.

## In the app

- **Design mode:** toggle the top slider to pause controls and animations, then tap any element to comment. Scrolling stays available. Notes are stored locally, can be edited/deleted, and export to JSON with selectors, text, styles and screen context. Turn the mode off to navigate, then on again to review another screen. Android uses the system file saver.
- **Today:** the local date, a smaller featured title, one photo bookmark, a left-aligned purple “Tell me more” action and a practical activity inside the card. The rest of today’s events appear before upcoming dates.
- **Calendar:** defaults to the month grid, with clear top-right counts, grouped list/search, all events for a selected date and month navigation at both ends.
- **Design choices:** the selected main date ribbon (7) and smaller calendar stamp count (4) are applied. Ten numbered colour/layout choices appear directly above each of Want to join in, Also happening today and Around the corner. Activity styles 4 and 6 run to the card edges. Section choices apply immediately and persist locally.
- **Daily facts:** every supported day has two sourced, event-inspired facts; one is picked randomly and saved for that date. It appears at the bottom of the day page and inside the calendar day sheet.
- **Logo:** Nicole’s supplied globe/calendar artwork is used in the header, web app icons and Android adaptive launcher.
- **Event sheets:** researched background, practical links and independently checked date sources live inside the app. Every event has a distinct image with author/source/licence credits.
- **My Days:** save individual events, including several on the same date. Original December web bookmarks are preserved.
- **Updates:** checks on launch/resume (at most once per 15 minutes), with **Check for updates** in Settings and About. New releases show a download banner. APK downloads use the browser; Android asks the user to install the update. Installed data stays in place. Offline check failures do not block the app.
- **Android reminders:** a daily round-up, plus an extra reminder for each saved event. Times are adjustable and use the phone’s time zone.
- **Offline:** Android includes its catalogue, photographs and fonts. No account, tracking or paid API is required.
- **Calendar export:** optionally save selected events as an ICS file with alarms.

Multi-day festivals appear at their start, with the range explained in the details. Informal days are labelled as such; cultural and regional observances show their scope. The catalogue covers 2026, not an automatically repeating annual calendar.

## Install and check notifications

Install the supplied signed `Whats-Happening-0.6.0.apk` (also available from the web About screen) on Android 8 or newer. In the app, press **Turn on** and allow notifications.

Open Settings and choose **Try a reminder in 10 seconds**. You can close the app before the test notification arrives. The optional **Allow precise reminder times** setting lets Android deliver scheduled reminders more precisely; without it Android may delay an alert.

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

The signed APK and `app-update.json` are published together on GitHub Pages. After changing `package.json` version and `android.versionCode`, `npm run android:build` regenerates both. Keep the existing signing key. The checker rejects other packages, unrelated download hosts/paths, and version downgrades.

See [Android build instructions](docs/ANDROID-BUILD.md). The Android shell uses a bundled WebView interface and native AlarmManager notifications. It never loads remote pages into the privileged WebView; external reference links open in the browser.

Validation includes sixteen JavaScript tests, twenty-two update-policy checks, eleven JVM scheduling checks (including time-zone and DST cases), Android compilation, packaged asset checks and APK signature verification. The interface was checked in desktop and 384px phone browser previews. **Physical-device/emulator notification delivery has not been tested in this environment**; use the in-app ten-second test after installing.

See [content sources](docs/CONTENT-SOURCES.md) and [photo/font credits](PHOTO-CREDITS.md). The descriptions are original; every event has a distinct illustrative photograph. This project is not affiliated with Days Of The Year.
