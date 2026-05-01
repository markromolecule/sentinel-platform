# Phase 5 — Configuration And Runtime Contract Alignment

## Dependencies

- The current shared schemas already exist:
    - `packages/shared/src/schema/exams/configuration-schema.ts`
    - `packages/shared/src/schema/exams/assessment-schema.ts`
- The current backend module already exists:
    - `app/sentinel-api/src/modules/examination/configuration/`
- The current instructor configuration UI already exists:
    - `app/sentinel-web/src/features/exams/_components/forms/components/exam-config-form.tsx`
    - `app/sentinel-web/src/features/exams/config/_components/`

## Goal

This phase is not about inventing exam configuration from scratch. It is about validating that the **existing** configuration model fully supports exam-proper runtime behavior and identifying only the gaps that are genuinely required.

---

## Initial Check

Before implementation:

- inspect the current shared configuration schemas
- inspect the current configuration service, normalization helpers, and lock guard
- inspect existing backend tests:
    - `configuration.test.ts`
    - `configuration.service.test.ts`
- inspect the current instructor configuration form and map its fields to the backend contract

---

## Core Rule

The current configuration system is authoritative unless there is a proven exam runtime need it cannot express. Missing behavior should be documented as a gap, not solved by casually inventing a new config model.

---

## Tasks

### Task 5.1 — Audit current fields by runtime responsibility

Review and document which existing fields control:

- readiness gating
    - `cameraRequired`
    - `micRequired`
    - `screenLock`
    - `webSecurity.full_screen_required`
- runtime enforcement
    - `maxReconnectAttempts`
    - `autoSubmitTimeoutMinutes`
    - `settings.allowReview`
    - `settings.shuffleQuestions`
    - `settings.randomizeChoices`
- telemetry gating
    - `aiRules.*`
    - `webSecurity.*`
    - `mobileSecurity.*`
- future LiveKit behavior
    - camera requirement and attempt lifecycle dependencies

### Task 5.2 — Validate normalization and fallback behavior

Ensure the documented task flow matches the current normalization behavior in:

- `build-default-exam-configuration.ts`
- `normalize-exam-configuration-state.ts`
- `resolve-exam-settings.ts`

Pay special attention to current implicit rules, such as:

- AI camera-based rules becoming ineffective when `cameraRequired` is false
- audio anomaly detection depending on microphone requirements

### Task 5.3 — Keep lock behavior aligned to the current backend

The current configuration lock rule is implemented in:

```txt
app/sentinel-api/src/modules/examination/configuration/services/assert-exam-configuration-mutable.ts
```

Document that the current contract is:

- configuration becomes locked once the exam is published

Do not rewrite the task docs to assume a different locking model unless that becomes a deliberate product change later.

### Task 5.4 — Validate instructor form coverage

Review whether the current instructor configuration UI exposes all exam-proper fields needed for:

- readiness checks
- runtime enforcement
- telemetry gating
- web-first monitoring behavior

If a required runtime capability is missing from the form, document it as a UI/configuration gap linked to the existing shared schema.

### Task 5.5 — Document only real gaps

If the existing model cannot express a required exam-proper behavior:

- document the exact missing capability
- identify the minimal schema and UI/API changes needed
- confirm it belongs in the current configuration contract

Avoid speculative fields for future proctoring ideas that are not required by the current web-first runtime.

---

## Backend Test Requirement

Any change to shared schemas, configuration normalization, lock behavior, or configuration save/read APIs must update backend tests.

Minimum expected coverage:

- `app/sentinel-api/src/modules/examination/configuration/configuration.test.ts`
- `app/sentinel-api/src/modules/examination/configuration/configuration.service.test.ts`

Tests must verify:

- default configuration behavior
- normalization behavior
- lock behavior after publish
- schema or payload validation for any changed fields

---

## Deliverables Checklist

- [ ] Existing configuration fields are mapped to readiness, runtime, telemetry, and LiveKit-adjacent behavior
- [ ] Current normalization behavior is documented and reflected in the task plan
- [ ] Current publish-lock behavior is preserved in the docs
- [ ] Instructor configuration UI coverage is assessed against exam-proper needs
- [ ] Any missing fields are documented as minimal, justified gaps instead of speculative redesign
- [ ] Backend tests are created or updated for any configuration-contract changes

---

## Exit Criteria

This phase is complete when the task docs accurately describe how the existing configuration system governs the exam runtime, and any remaining gaps are explicit, minimal, and justified.
