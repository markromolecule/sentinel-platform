# fix-001 - AI Question Generation 403 Implementation Plan

**Date:** 2026-06-10  
**Type:** Fix  
**Summary:** Fix the `/ai/generate-preview` question-generation flow so authorized instructors do not receive a 403, while keeping unauthorized callers blocked.

## 3 Viable Options

### Option A - Keep the Static Role Gate and Patch the Client
Leave the Gemini route authorization as-is and try to make the frontend resend or refresh the auth token more aggressively before calling `/ai/generate-preview`.

**Tradeoff:** Fastest to attempt, but it treats the symptom rather than the cause and will not help if the user has valid permissions but stale or missing role metadata.

### Option B - Switch the Gemini Route to Dynamic RBAC Context Checks ✅ Recommended
Update `generatePreviewRouteHandler` to use the existing Hono context permission path (`assertAssessmentAccess(c)` / `requireActivePermission`) instead of relying only on the role string, while keeping role resolution for institution scoping and logging.

**Tradeoff:** Smallest change that aligns with the repo’s current RBAC model, but it requires careful regression coverage to ensure unauthorized users still get a 403.

### Option C - Add a Dedicated AI Generation Permission
Create a new permission such as `ai:generate-preview`, seed it into the role presets, and gate Gemini preview generation on that permission instead of the assessment permission.

**Tradeoff:** Strong long-term clarity, but it adds unnecessary permission surface area and extra seed/plumbing work for a bug that appears to be an authorization mismatch.

## Best Option

**Option B** is the best fit.

The codebase already has dynamic RBAC support in `authMiddleware` and `assertAssessmentAccess(c)`, so this is the most direct way to fix the 403 without introducing new permissions or schema changes. It also keeps the Gemini route behavior aligned with the rest of the assessment-protected endpoints.

## Concrete Next Steps

1. Update `app/sentinel-api/src/modules/integrations/gemini/gemini.controller.ts` to use the context-based authorization path.
2. Add regression coverage in the Gemini and assessment access test suites.
3. Run the targeted API test suite, then smoke-test the import modal with an authorized instructor account.

## Pre-Planning Checklist

- [x] Read and summarized the task input in one sentence.
- [x] Scanned the Gemini route, auth middleware, assessment access helpers, and frontend API client to understand the existing pattern.
- [x] Identified the files and services the fix is likely to touch.
- [x] Determined that no Prisma migration is needed.

## Task Summary

- [x] Fix the AI question generation preview endpoint so authenticated users with the right assessment permissions can generate questions without hitting a 403.

## Existing Findings

- [x] `app/sentinel-api/src/modules/integrations/gemini/gemini.controller.ts` resolves a role and then calls `assertAssessmentAccess(role)` with a plain string.
- [x] `app/sentinel-api/src/middleware/auth.ts` already populates `activePermissionKeys` from the database, so the context-based RBAC path is already available.
- [x] `app/sentinel-api/src/modules/examination/assessment/assessment-access.ts` already supports both static role checks and dynamic RBAC checks through a Hono context object.
- [x] `app/sentinel-web/src/data/api/client.ts` already attaches the Supabase access token, so the most likely failure is authorization logic on the API side rather than missing transport auth.
- [x] No database tables appear to need structural changes for this fix.

## Files, Services, and DB Tables in Scope

### Backend

- [x] `app/sentinel-api/src/modules/integrations/gemini/gemini.controller.ts`
- [x] `app/sentinel-api/src/modules/examination/assessment/assessment-access.ts`
- [x] `app/sentinel-api/src/modules/examination/assessment/assessment-access.test.ts`
- [x] `app/sentinel-api/src/tests/gemini/gemini-route.test.ts`
- [x] `app/sentinel-api/src/tests/gemini/question-generator.test.ts`

### Frontend

- [x] `app/sentinel-web/src/data/api/client.ts` for validation only

### DB Tables

- [x] None

## Assumptions and Scope Guards

- [x] Treat the 403 as an authorization mismatch, not a missing route or request-shape bug.
- [x] Preserve the existing AI generation contract and response shape.
- [x] Keep the legacy `/ai/generate-review` alias working exactly the same way as `/ai/generate-preview`.
- [x] Do not introduce a new database migration or permission seed unless the investigation proves the existing assessment permission model is insufficient.

## Additional Considerations

- [x] **Breaking API changes:** No. The route, body shape, and response shape should remain unchanged.
- [x] **New env variables:** None expected.
- [x] **Migration rollback note:** Not applicable because this plan does not change schema or persistence.

## Phase 1: Align Gemini Authorization with Dynamic RBAC

**Goal:** Make the preview route honor the permissions already loaded by `authMiddleware` instead of depending only on a role string.

- [x] Modify `app/sentinel-api/src/modules/integrations/gemini/gemini.controller.ts` so `generatePreviewRouteHandler` checks access through the Hono context path (`assertAssessmentAccess(c)` or equivalent) before parsing multipart data.
- [x] Keep `resolveAssessmentActorRole(...)` in the handler for institution scoping and telemetry, but do not use the resolved role as the only authorization gate.
- [x] Confirmed no helper adjustment was needed; `app/sentinel-api/src/modules/examination/assessment/assessment-access.ts` already supported the context-based permission path used by the controller.
- [x] Write or update `app/sentinel-api/src/modules/examination/assessment/assessment-access.test.ts` to cover the context-based `assessments:manage` path and confirm it still throws 403 when the permission is missing.
      **Migration required:** No — this is an authorization-only change.

## Phase 2: Add Route-Level Regression Coverage

**Goal:** Prove the Gemini preview endpoint accepts authorized users and still blocks unauthorized callers.

- [x] Update `app/sentinel-api/src/tests/gemini/gemini-route.test.ts` to cover all three outcomes for both AI routes where appropriate:
  - unauthenticated request returns 401,
  - authenticated caller with `assessments:manage` succeeds,
  - authenticated caller without the required permission still returns 403.
- [x] If the existing route test harness is too coarse for the permission case, add a focused controller test next to the Gemini module and mock the Hono context directly instead of weakening the assertion.
<!-- NOTE: The permission regression cases were consolidated into `gemini-route.test.ts` by mounting the Gemini routes on a local OpenAPI app, which kept the coverage focused without adding a separate controller test file. -->
- [x] Confirmed no change was needed in `app/sentinel-api/src/tests/gemini/question-generator.test.ts` because the handler fix did not alter the shared preview contract or request construction path.
      **Migration required:** No — test-only validation around the auth change.

## Verification Plan

### Automated Tests

- Run `pnpm --dir app/sentinel-api test` and confirm the Gemini and assessment access suites pass.
- If the web client is touched for validation or messaging, run `pnpm --dir app/sentinel-web test` as well.

### Manual Verification

1. Log in with an instructor account that has the expected assessment permissions.
2. Open the import modal and trigger AI question generation from a PDF.
3. Confirm the request to `/ai/generate-preview` no longer returns 403 and the preview screen loads.
4. Repeat the flow with an unauthorized account and confirm the API still rejects the request.
