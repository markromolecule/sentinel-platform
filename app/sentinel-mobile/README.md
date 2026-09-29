# Sentinel Mobile

React Native mobile client for Sentinel, built with Expo and NativeWind. Provides student exam monitoring, real-time audio/video telemetry streaming, and biometric checkups.

---

## Getting Started

### Prerequisites
- Node.js >= 22
- pnpm >= 10
- Expo Go app or an Android physical device / emulator
- EAS CLI: `npm install -g eas-cli`

### Development
```bash
# Start Expo development server
pnpm --dir app/sentinel-mobile run start

# Run on Android emulator / connected device in dev client mode
pnpm --dir app/sentinel-mobile run android

# Run test suite
pnpm --dir app/sentinel-mobile run test
```

---

## Building Android APK for Testing and Sideloading

By default, EAS Build generates an **Android App Bundle (`.aab`)** for the `production` profile, which is required for submitting apps to the Google Play Store.

To create a standalone, installable **`.apk`** file for testing, QA verification, or direct device distribution without going through Google Play Console, use the `preview` or `preview-apk` profile.

### 1. Cloud EAS Build (Recommended)
Triggers compilation on EAS Cloud infrastructure and outputs an installable `.apk` link and QR code:

```bash
# Via package script
pnpm --dir app/sentinel-mobile run build:android:apk

# Or directly via EAS CLI
eas build --platform android --profile preview
```

### 2. Local EAS Build (Offline / No Cloud Queue)
Runs the build process locally on your development machine using local Android SDK / Docker:

```bash
# Via package script
pnpm --dir app/sentinel-mobile run build:android:apk:local

# Or directly via EAS CLI
eas build --platform android --profile preview --local
```

### 3. Installing on a Physical Android Device
Once the build completes:
1. **Direct Download:** Open the build link or scan the QR code displayed in the EAS CLI output on your Android device to download the `.apk`.
2. **Via ADB (Android Debug Bridge):**
   ```bash
   adb install -r <path-to-downloaded-apk>
   ```
3. **Permissions:** Upon opening Sentinel for the first time, allow Camera and Microphone permissions to test proctoring telemetry.

---

## Build Profiles Reference (`eas.json`)

| Profile | Target Artifact | Distribution | Purpose |
|---|---|---|---|
| `development` | `.apk` (Dev Client) | Internal | Local development with Metro bundler and hot reload. |
| `preview` | `.apk` (Standalone) | Internal | QA testing, offline field trials, and direct sideloading. |
| `preview-apk` | `.apk` (Standalone) | Internal | Explicit standalone APK distribution profile. |
| `production` | `.aab` (Bundle) | Store | Submissions to the Google Play Store console. |
