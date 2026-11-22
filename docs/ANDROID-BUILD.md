# Android build and signing

Package: `uk.co.nicole.whatshappening` · version 0.6.0 / code 6 · minimum API 26 · target/compile API 35.

The project builds with Python 3, Node.js, Java with the `jdk.compiler` module, and the official Android SDK 35 platform/build tools. It does not need Gradle or third-party Android dependencies.

```sh
export ANDROID_HOME=/absolute/path/to/android-sdk
npm run build
npm run android:build
npm test
```

For a nonstandard SDK layout, set `ANDROID_JAR` to the SDK platform’s `android.jar` and `ANDROID_BUILD_TOOLS` to the directory containing `aapt2`, `d8`, `zipalign` and `apksigner`.

The output is `android/build/Whats-Happening-0.6.0.apk`. The build compiles resources and Java, converts bytecode with D8, aligns the package, signs it and verifies the signature. Catalogue data is generated from the same module used by the web app, so event IDs match across native reminders and the interface.

## Keep the signing identity

The first build creates a private PKCS12 keystore and password file under the ignored `signing/` directory. `WH_SIGNING_DIR` can point to another private directory. **Restore the existing private signing backup before building future updates.** Generating a different key would prevent installation over this version without uninstalling it first.

Signing material, passwords, SDK files and APK build outputs must never be committed to this public repository. The original key has been backed up separately. The signing certificate SHA-256 fingerprint is:

`811e9e3497988fb140a4c360a28d6f93c7f722b64937c83cb4b0e2e98f4b1122`

## Native reminder design

- One upcoming AlarmManager alarm for the daily round-up and one for saved events; each schedules its next occurrence after firing.
- Exact alarms are used when the user grants precise-timing access. Otherwise the app uses an inexact idle-capable alarm.
- The receiver reads current preferences, avoids repeated deliveries, and only reschedules its own alarm type so simultaneous daily/saved alerts cannot cancel each other.
- Saved events have separate IDs, PendingIntents and notification IDs. Taps open the correct event.
- Boot, package replacement, clock and time-zone broadcasts rebuild schedules. No foreground service or polling loop is required in Android.
- Events are fixed to their actual 2026 dates. Past events are not scheduled as future reminders.

The native bridge is exposed only to bundled content under a private HTTPS asset origin. File/content URL access is disabled; external pages are not rendered in this WebView.

## Host-side scheduling tests

Compile `android/src/uk/co/nicole/whatshappening/AlarmPlan.java` and `android/tests/AlarmPlanTest.java` with Java, then run `uk.co.nicole.whatshappening.AlarmPlanTest`. These cover future occurrences, already delivered dates, time-zone conversion, the catalogue’s end, invalid times, and daylight-saving gaps/overlaps.

These host checks do not replace device tests for notification permissions, vendor battery restrictions, reboot restoration and tapping an actual notification.

## Publish an Android update

1. Increase `version` and `android.versionCode` in `package.json`; update the interface version labels and release notes.
2. Build with the existing signing key. The build writes the signed APK under `downloads/` and regenerates `app-update.json` with its versioned URL, exact byte length and SHA-256.
3. Publish both files in the same `main` commit and wait for GitHub Pages to finish. Keep older versioned downloads available.

The native checker reads the HTTPS manifest on launch/resume, throttled to 15 minutes. A manual check bypasses the throttle. Requests have timeouts, no redirects, no HTTP cache reuse and a 16 KiB response limit. Only the expected package and the repository’s exact versioned APK path are accepted. Same/older versions never offer a downgrade; incompatible Android versions get a clear status. Network failures stay out of the automatic flow and can be retried from settings.

The checker opens the approved APK URL in the system browser on **Download update**. Android handles the download and asks the user to install. It does not silently install or request privileged installer permissions. The manifest checksum supports release verification; this browser-download flow does not itself hash the downloaded APK. Android checks the signing identity when updating an existing install.

`UpdatePolicyTest.java` exercises version comparison, timing, package/URL validation and incompatible devices without requiring an emulator. Network, browser download and installation still need a real-device check.
