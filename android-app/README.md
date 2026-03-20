# Aura Notes — Android (Capacitor)

This folder holds the **native Android project** and Capacitor config. The UI, audio, and notation logic stay in the parent package (`../src`); Capacitor copies the built static site from `../dist` into the Android app on sync.

## Prerequisites

- [Android Studio](https://developer.android.com/studio) with Android SDK and a JDK (17+ recommended)
- From the **repository root**, a successful web build (`../dist` must exist)

## Workflow

1. **Build the web app** (from repo root):

   ```bash
   npm run build:web
   ```

2. **Copy web assets into the Android project**:

   ```bash
   cd android-app
   npx cap sync
   ```

3. **Open in Android Studio** and run on a device or emulator:

   ```bash
   npx cap open android
   ```

   Or use the root shortcut from the repo root: `npm run android:sync` (build + sync), then open `android-app/android` in Android Studio.

## Feature parity

The Android app runs the same React bundle as desktop Electron: fingerboard, scales, VexFlow staff, and Web Audio playback. **First tap** may be required on some devices before audio plays (browser/WebView autoplay policy).

## Release builds

In Android Studio: **Build → Generate Signed Bundle / APK** and follow the wizard for a Play-ready **AAB** or sideload **APK**.

## Test on an emulator (no local Android Studio)

If this PC does not have the Android SDK, use **GitHub Actions**: workflow **Android emulator smoke test** (`.github/workflows/android-emulator.yml`). It builds the web app, runs **Capacitor sync**, starts an **API 30 x86_64 AVD**, installs **debug** APK, and launches `com.aurnotes.app`.

Trigger: push to `main`, open a **pull request**, or **Actions → Android emulator smoke test → Run workflow**.
