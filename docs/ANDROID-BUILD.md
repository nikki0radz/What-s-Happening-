# Android build and signing

Package: `uk.co.nicole.whatshappening` · version 0.3.0 / code 2 · minimum API 26 · target/compile API 35.

The project builds with Python 3, Node.js, Java with the `jdk.compiler` module, and the official Android SDK 35 platform/build tools. It does not need Gradle or third-party Android dependencies.

```sh
export ANDROID_HOME=/absolute/path/to/android-sdk
npm run build
npm test
npm run android:build
```

For a nonstandard SDK layout, set `ANDROID_JAR` to the SDK platform’s `android.jar` and `ANDROID_BUILD_TOOLS` to the directory containing `aapt2`, `d8`, `zipalign` and `apksigner`.

The output is `android/build/Whats-Happening-0.3.0.apk`. The build compiles resources and Java, converts bytecode with D8, aligns the package, signs it and verifies the signature. Catalogue data is generated from the same module used by the web app, so event IDs match across native reminders and the interface.

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
