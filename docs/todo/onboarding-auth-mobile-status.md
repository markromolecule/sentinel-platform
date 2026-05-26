# Mobile Onboarding/Auth Implementation Status

This document tracks the work requested in [docs/onboarding-auth-mobile.md](./onboarding-auth-mobile.md) and applies the phase-based checklist from [`.agents/plan/implementation-plan.md`](../.agents/plan/implementation-plan.md).

Status reflects the codebase as of 2026-05-06.

## Phase 1: OAuth Redirect Contract

- [x] Document the mobile OAuth contract and keep the web callback bridge as the source of truth.
- [x] Define and use `EXPO_PUBLIC_WEB_URL` for the mobile callback bridge host.
- [x] Define and use `EXPO_PUBLIC_MOBILE_AUTH_CALLBACK_PATH` support through the shared mobile OAuth helper.
- [x] Keep web OAuth resolving to `/auth/callback` on web.
- [ ] Confirm Supabase hosted redirect allow-list includes deployed callback URLs such as `https://app.sentinelph.tech/auth/callback`.
- [ ] Confirm any staging or preview web callback URLs are included in Supabase Auth redirect settings.

## Phase 2: Mobile OAuth Start and Callback Handling

- [x] Extract mobile OAuth callback URL construction into shared helper logic.
- [x] Normalize OAuth redirect handling in `app/sentinel-mobile/lib/auth/oauth-callback.ts`.
- [x] Keep `skipBrowserRedirect: true` and `WebBrowser.openAuthSessionAsync(...)` for the mobile OAuth flow.
- [x] Add explicit handling for missing OAuth URL, callback errors, and cancelled browser sessions.
- [x] Add the Expo Router callback route at `app/sentinel-mobile/app/auth/callback.tsx`.
- [x] Parse both query params and hash fragments when handling mobile OAuth callbacks.
- [x] Call `supabase.auth.setSession(...)` from the shared mobile OAuth callback helper.
- [x] Redirect successful mobile OAuth callbacks to `/(tabs)/classroom`.

## Phase 3: Web Callback Bridge Hardening

- [x] Keep existing web callback behavior unchanged when `mobile` is not present.
- [x] Validate `redirect_to` for mobile callback redirects.
- [x] Allow `sentinel-mobile://auth/callback` as a valid mobile callback target.
- [x] Allow Expo Go callback URLs such as `exp://.../--/auth/callback`.
- [x] Reject invalid external callback URLs.
- [x] Centralize mobile redirect URL creation in the web callback helper.
- [x] Preserve valid mobile redirect targets for success and error callback cases.
- [x] Keep cookie/session behavior scoped to web responses that need it.

## Phase 4: Mobile Login and Registration

- [x] Keep Google OAuth login working on `app/sentinel-mobile/app/(auth)/login.tsx`.
- [x] Implement Google OAuth registration on `app/sentinel-mobile/app/(auth)/register.tsx`.
- [x] Reuse the same mobile OAuth callback helper for login and registration.
- [x] Redirect successful Google registration to `app/sentinel-mobile/app/(onboarding)`.
- [ ] Test Google registration manually on device or simulator.
- [ ] Verify the full Google registration path against Supabase hosted configuration.

## Phase 5: Mobile Onboarding Data and Whitelist Validation

- [x] Replace mock onboarding dropdown data in `app/sentinel-mobile/app/(onboarding)/setup.tsx` with real API-backed queries.
- [x] Use `useOnboardingInstitutionsQuery` for institutions.
- [x] Use `useOnboardingDepartmentsQuery` for department loading based on institution selection.
- [x] Use `useOnboardingCoursesQuery` for course loading based on institution and department selection.
- [x] Use `useOnboardingMutation` to submit onboarding from mobile.
- [x] Validate onboarding payloads with `onboardingSchema` before submission.
- [x] Prefill student name data from the authenticated Supabase user when available.
- [x] Surface whitelist-backed onboarding failures on mobile using the same backend contract as web onboarding.
- [x] Check the mobile onboarding path against student whitelist approval through backend validation.
- [ ] Test student whitelist approval flow manually on mobile.
- [ ] Verify edge cases for inactive, claimed, or mismatched whitelist records on a device run.

## Phase 6: Mobile Validation and Workspace Health

- [x] Ensure the mobile workspace type-checks after the auth and onboarding changes.
- [x] Resolve the mobile `AuthProvider` typing mismatch by adapting the mobile Supabase client usage.
- [ ] Run a repo-approved lint command for the changed mobile files.
- [ ] Run manual Expo Go QA for login callback return, registration callback return, and onboarding submission.
- [ ] Confirm the browser closes or returns cleanly to the app during OAuth on device.

## Phase 7: Web Validation and Configuration Follow-Through

- [x] Keep `packages/hooks/src/query/auth/use-google-login.ts` resolving web OAuth to `${window.location.origin}/auth/callback`.
- [x] Keep `app/sentinel-web/src/proxy.ts` exempting `/auth/callback`.
- [x] Keep web registration email callbacks targeting `/auth/callback`.
- [x] Add unit tests covering valid and invalid mobile callback redirect URLs in web auth callback helpers.
- [ ] Test web OAuth with an existing student account and verify role-based redirect behavior.
- [ ] Confirm Supabase Dashboard provider settings match the deployed callback contract.

## Phase 8: Exam Flow Parity

- [ ] Review `app/sentinel-web/src/app/(protected)/student/exam/[id]` flow end to end and map each screen/hook to mobile.
- [x] Ensure `app/sentinel-mobile/app/exam/[id]` uses live database-backed exam details.
- [x] Ensure `app/sentinel-mobile/app/exam/[id]/lobby` respects exam rules and instructor admit flow.
- [x] Ensure `app/sentinel-mobile/app/exam/[id]/instruction` mirrors the web exam instruction logic.
- [x] Ensure `app/sentinel-mobile/app/exam/[id]/checkup` uses live exam configuration and native readiness checks.
- [x] Ensure `app/sentinel-mobile/app/exam/[id]/session` uses the same exam session mutations and hooks in native form.
- [x] Ensure `app/sentinel-mobile/app/exam/[id]/result` uses live result turn-in flow.
- [x] Ensure `app/sentinel-mobile/app/exam/[id]/privacy` matches the web privacy flow.
- [ ] Align mobile mediapipe behavior with shared logic under `packages/shared/src/mediapipe`.
- [ ] Validate the full mobile exam flow against real backend data.

## Completed in This Pass

- [x] Google OAuth registration now works on mobile and redirects into onboarding.
- [x] Mobile onboarding now fetches live institutions, departments, and courses.
- [x] Mobile onboarding now submits through the shared onboarding mutation instead of mock data.
- [x] Mobile onboarding now shows whitelist-related validation feedback returned by the backend.
- [x] Mobile workspace type-check passes with `pnpm --dir app/sentinel-mobile exec tsc --noEmit`.
- [x] Mobile exam instruction, privacy, checkup, lobby, session, and result screens now use shared exam services instead of mock exam/session data.
