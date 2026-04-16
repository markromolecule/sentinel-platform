# Exam Configuration Schema Refactoring TO-DO

## Phase 1: Analysis & Design 
- [x] Analyze current `exam_configurations` Prisma schema and Zod DTOs.
- [x] Analyze mobile/web proctoring requirements.
- [ ] Research specific Android/iOS proctoring capabilities (App Pinning, Guided Access).
- [ ] Propose 1-3-1 options for schema refactoring.

## Phase 2: Schema Implementation (Pending Approval)
- [ ] Update `packages/shared/src/schema/exams/assessment-schema.ts` with new `examConfigurationSchema`.
- [ ] Create Prisma migration to add `web_security` and `mobile_security` or consolidate settings.
- [ ] Update `@sentinel/db` types.

## Phase 3: API & Service Updates
- [ ] Update `configuration.dto.ts` in `sentinel-api`.
- [ ] Update `build-default-exam-configuration.ts` with new defaults.
- [ ] Update `save-exam-configuration.ts` to handle nested objects.
- [ ] Update `map-exam-configuration-state.ts` for frontend mapping.

## Phase 4: Frontend UI Updates (Web)
- [ ] Update Exam Configuration UI to support nested "Proctoring" sections (Web vs Mobile).
- [ ] Implement new toggles for `webSecurity` (Tab switching, Fullscreen).

## Phase 5: Mobile Integration
- [ ] Update mobile app to consume new configuration.
- [ ] Implement proctoring listeners based on the configuration (App Pinning check, Backgrounding detection).

## Phase 6: Verification
- [ ] Validate schema with edge cases (empty configs, partial updates).
- [ ] Test cross-platform synchronization of settings.
