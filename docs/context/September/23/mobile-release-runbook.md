# Sentinel Mobile Release Runbook: Standalone APK & Google Play Store

This runbook describes how to build standalone `.apk` files for testing and how to build and submit production `.aab` bundles to the Google Play Store using Expo Application Services (EAS).

---

## 1. Prerequisites Check

Verify your active environment and EAS CLI credentials:

```bash
# 1. Check EAS authentication
eas whoami
# Expected: livadomc (livadomc@gmail.com)

# 2. Run local pre-flight environment check
cd app/sentinel-mobile
pnpm run verify:env
```

---

## 2. Building Standalone Android `.apk` Files

Use standalone APK builds when you need to install and test Sentinel directly on physical Android phones (or distribute to internal testers) without submitting to Google Play.

### Option A: Via Command Line (Recommended)

From the project root:

```bash
# Build standalone APK using production backend & credentials
pnpm --filter sentinel-mobile run build:apk
```

Or directly from `app/sentinel-mobile`:

```bash
cd app/sentinel-mobile
pnpm run build:apk
```

**What happens during the build:**

1. `pnpm run verify:env` validates all required environment variables.
2. EAS CLI packages the project and uploads it to EAS Build servers.
3. EAS automatically injects the `production` environment variables (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_API_URL`, etc.).
4. EAS generates a downloadable `.apk` file.
5. When complete, EAS CLI prints a QR code and URL (e.g. `https://expo.dev/accounts/livadomc/projects/sentinel-mobile/builds/<build-id>`). Open the URL on your Android phone to download and install.

### Option B: Via Expo Dashboard (EAS Workflows)

1. Open your browser to: [Expo Workflows](https://expo.dev/accounts/livadomc/projects/sentinel-mobile/workflows).
2. You will see the **Build Android APK** workflow (`build-apk.yaml`).
3. Click **Run workflow** in the upper right.
4. When finished, download the `.apk` directly from the build summary.

---

## 3. Building for Google Play Store (`.aab` Bundle)

Google Play Store requires an Android App Bundle (`.aab`) rather than an `.apk`.

### Step 1: Run the Production Build

```bash
cd app/sentinel-mobile
pnpm run build:playstore
```

**What happens:**

1. EAS generates a signed Android App Bundle (`.aab`).
2. EAS automatically increments the Android `versionCode` remotely (`autoIncrement: true`).
3. The build artifact is prepared for submission to Google Play Console.

### Step 2: Submitting to Google Play Store

Once the build is complete:

```bash
cd app/sentinel-mobile
pnpm run submit:playstore
```

> [!NOTE]
> **First-Time Google Play Store Setup:**
>
> - The first time you run `eas submit`, EAS will ask for your Google Play Service Account JSON key (created in Google Cloud Console with Google Play Developer API permissions).
> - Once provided, EAS securely saves the key so future submissions (and automated EAS Workflows) can submit with zero prompts.

### Option C: One-Step Automated Workflow (Tag-triggered)

When you are ready to create a release tag:

```bash
git tag v1.0.1
git push origin v1.0.1
```

The EAS Workflow `release-playstore.yaml` will trigger automatically, build the production `.aab`, and submit it to your Google Play internal testing track.

---

## 4. Environment Variables Reference

All production environment variables are managed securely via EAS and validated at app startup:

| Variable | Required | Description | Default / Production Value |
| --- | --- | --- | --- |
| `EXPO_PUBLIC_SUPABASE_URL` | **Yes** | Supabase project URL | `https://khcnxdmiyyzgbafjprff.supabase.co` |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | **Yes** | Supabase public anonymous key | (Configured in EAS Production) |
| `EXPO_PUBLIC_API_URL` | **Yes** | Sentinel NestJS API backend | `https://api.sentinelph.tech` |
| `EXPO_PUBLIC_WEB_URL` | No | Sentinel Web portal URL | `https://app.sentinelph.tech` |
| `EXPO_PUBLIC_MOBILE_AUTH_CALLBACK_PATH` | No | Deep link redirect path | `auth/callback` |
| `EXPO_PUBLIC_EXPO_AUTH_PROXY_URL` | No | Expo Auth proxy for browser OAuth | `https://auth.expo.io/@livadomc/sentinel-mobile` |

To inspect or update variables in EAS:

```bash
# List production variables
eas env:list production

# Create or update a variable
eas env:create --scope project --environment production
```
