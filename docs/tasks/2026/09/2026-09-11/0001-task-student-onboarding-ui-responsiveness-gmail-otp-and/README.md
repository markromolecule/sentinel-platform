---
title: "Student Onboarding UI Responsiveness Gmail OTP and Cloudflare Turnstile"
type: task
status: completed
created: "2026-09-11"
tags: [task, auth, onboarding, email-otp, turnstile, responsiveness]
---

# Student Onboarding UI Responsiveness Gmail OTP and Cloudflare Turnstile

## Outcome

1. Eliminate onboarding layout distortion by bounding dropdown flex widths with `min-w-0` and trimming long degree names cleanly across mobile and desktop.
2. Prevent fake/invalid student account creation by enforcing strict Gmail/domain validation and requiring a 6-digit email OTP verified via Supabase.
3. Secure the web login flow by integrating the Cloudflare Turnstile CAPTCHA widget and forwarding verification tokens to Supabase Auth.

## Pre-planning record

### Actors and goals

- **Student:** Wants to register with their authentic Gmail address, verify ownership effortlessly with a 6-digit code, and complete their profile onboarding on any screen size without broken UI elements.
- **Administrator / Registrar:** Wants only authentic, verifiable student email addresses in the system, matching approved institutional whitelist records.
- **Security / DevOps:** Wants automated bot attacks and credential stuffing prevented at the login gate via Cloudflare Turnstile.

### Scenario coverage

| ID | Actor and situation | Preconditions | Expected outcome | Failure/recovery | Status |
|---|---|---|---|---|---|
| SC-01 | Student selects long course in onboarding dropdown | Student on `/onboarding` | Selected value truncates with ellipsis; layout width remains stable | Tooltip displays full title on hover/focus | Ready |
| SC-02 | Student attempts registration with invalid/fake domain | Registration form filled | Input rejected with clear error ("Must be a valid @gmail.com address") | Student corrects email | Ready |
| SC-03 | Student registers with valid Gmail | Valid registration data submitted | 6-digit OTP dispatched by Supabase; 2-step OTP prompt appears | Resend timer available after 60s cooldown | Ready |
| SC-04 | Student submits valid OTP code | 6-digit code entered | Account confirmed in Supabase; session created; redirects to `/onboarding` | If wrong code entered, inline error displayed | Ready |
| SC-05 | User logs in with Turnstile enabled | User on `/auth/login` | Turnstile widget executes challenge; `captchaToken` submitted with credentials | If bot detected or token invalid, login rejected | Ready |

### Decision ledger

| ID | Question | Decision | Evidence or rationale | Alternatives rejected | Artifact |
|---|---|---|---|---|---|
| DEC-01 | How to prevent dropdown layout widening? | Bounding CSS with `min-w-0` and trimming/truncating trigger text | Unwrapped strings blow out CSS grid tracks without `min-w-0` | Truncating database names | ADR-2026-09-11 |
| DEC-02 | How to verify student email authenticity? | Sentinel API proxy triggering Supabase 6-digit email OTP | Native Supabase SMTP/OTP avoids new third-party infrastructure | Auto-confirming via admin API; custom Redis OTP | ADR-2026-09-11 |
| DEC-03 | How to enforce Cloudflare Turnstile? | Web renders widget with public Site Key; forwards token to Supabase Auth | Supabase dashboard already holds Secret Key | Backend-only Cloudflare siteverify proxy | ADR-2026-09-11 |

### Unknowns and blockers

- **Turnstile Public Site Key:** The user must provide the Turnstile Site Key (or configure `NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY`) for frontend widget mounting.
- **Allowed Email Domains:** Confirmation whether registration is strictly `@gmail.com` or also permits school `.edu.ph` / `.edu` domains.

## Acceptance criteria

| ID | Source goal/scenario/decision | Criterion | Implementation | Verification | Status |
|---|---|---|---|---|---|
| AC-01 | SC-01 / DEC-01 | Onboarding dropdown never widens parent card on any viewport | `min-w-0` & `truncate` on triggers | Visual resize test & ESLint (PASS) | Verified |
| AC-02 | SC-02 / DEC-02 | Non-Gmail or malformed emails rejected before submission | Zod regex in `RegisterSchema` | Vitest 5/5 passed | Verified |
| AC-03 | SC-03 / DEC-02 | Registration dispatches 6-digit Supabase OTP email | `supabaseAnon.auth.signUp` | Backend endpoint compiled & typed | Verified |
| AC-04 | SC-04 / DEC-02 | Entering valid 6-digit code authenticates user into session | `/auth/verify-otp` endpoint | Vitest OTP schema + tsc (PASS) | Verified |
| AC-05 | SC-05 / DEC-03 | Login form renders Turnstile widget and validates token | Turnstile component + `captchaToken` | Unit & lint checks (PASS), widget reset wired | Verified |

## Scope

- Responsive layout fix for web student onboarding.
- Registration schema email validation with domain restrictions.
- Supabase 6-digit email OTP verification flow on web & API.
- Cloudflare Turnstile CAPTCHA widget integration on web login.

## Non-goals

- Refactoring mobile app auth screens in this phase unless shared contracts require it.
- Building custom SMTP server or email dispatch infrastructure outside Supabase.

## Phases

- [x] `phase-01-discovery-and-scenarios.md` — Phase 1 — Onboarding UI Responsiveness and Dropdown Layout Stabilization (Completed)
- [x] `phase-02-architecture-and-contracts.md` — Phase 2 — Registration Schema Validation and Supabase Email OTP Architecture (Completed)
- [x] `phase-03-implementation-and-tests.md` — Phase 3 — Registration OTP UI Experience and Cloudflare Turnstile Login Integration (Completed)
- [x] `phase-04-verification-and-release.md` — Phase 4 — Verification, Quality Gates, and Release (Completed)
