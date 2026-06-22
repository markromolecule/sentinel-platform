# Refactor AccessService into Modular Services

Refactor `app/sentinel-api/src/modules/examination/access/services/access-gatekeeper.service.ts` by breaking its methods into modular, testable service functions in the `services/` directory and establishing `app/sentinel-api/src/modules/examination/access/access.service.ts` as the main delegating entry point.

## 1-3-1 Plan Configuration

### Three Viable Options

1. **Option 1: Extract only the evaluation logic (Simple/Fast)**
    - Only extract the large `_verifyStudentExamEligibility` function to a separate service file, keeping the outer telemetry/notification orchestration in `access-gatekeeper.service.ts`.
    - _Tradeoff:_ Fast to do, but leaves the file clutter and doesn't fully migrate the entry point to `access.service.ts`.
2. **Option 2: Complete modularization with entrypoint migration (Robust/Scalable)**
    - Extract the logic into two modular services:
        - `services/verify-student-exam-eligibility.service.ts`: Handles orchestration, telemetry logs, and notifications.
        - `services/evaluate-student-exam-eligibility.service.ts`: Evaluates profile, exam policies, dates, rooms, enrollment, and override parameters.
    - Update `AccessService` in `access.service.ts` to be the main entry point class, delegating static methods to these services, and export `AccessGatekeeperService` as a deprecated alias pointing to `AccessService` / new services.
    - Delete `services/access-gatekeeper.service.ts`.
    - Update all references in controllers/tests to import from the main `access.service.ts` entrypoint.
    - _Tradeoff:_ Requires refactoring multiple controllers and tests, but provides a clean, modular structure.
3. **Option 3: Direct controller call without AccessService (Creative)**
    - Remove the `AccessService` class entirely and update controllers and integration points to import and call `verifyStudentExamEligibilityService` directly.
    - _Tradeoff:_ Simplifies the calling code by removing a layer of redirection, but increases refactoring footprint and removes backward compatibility for `AccessService`.

### Recommended Option

We recommend **Option 2 (Complete modularization with entrypoint migration)**. It maintains class-based backward compatibility at the package boundary while fully separating implementation logic.

---

## User Review Required

> [!WARNING]
> This change will delete `services/access-gatekeeper.service.ts` and update `access.service.ts` to be the main entry point exposing `AccessService` and aliasing `AccessGatekeeperService`. All controllers and tests referencing `AccessGatekeeperService` will be updated to point to the new entry point.

## Open Questions

None.

## Proposed Changes

### Examination Access Component

---

#### [NEW] [evaluate-student-exam-eligibility.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/access/services/evaluate-student-exam-eligibility.service.ts)

- Implements `evaluateStudentExamEligibilityService` (core eligibility rules: profiles, subjects, dates, room validation, subject group/section enrollment, overrides, and instructor-gated lobby state resolution).

#### [NEW] [verify-student-exam-eligibility.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/access/services/verify-student-exam-eligibility.service.ts)

- Implements `verifyStudentExamEligibilityService` (orchestrates core evaluation, logs success/failure telemetry, and triggers institution activity notifications).

#### [MODIFY] [access.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/access/access.service.ts)

- Implements `AccessService` delegating to new services and re-exports `AccessGatekeeperService` as a deprecated alias.

#### [DELETE] [access-gatekeeper.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/access/services/access-gatekeeper.service.ts)

- Deleted as all code is migrated to modular service files.

#### [MODIFY] [get-exam-access-lobby.controller.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/access/controllers/get-exam-access-lobby.controller.ts)

#### [MODIFY] [verify-exam-eligibility.controller.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/access/controllers/verify-exam-eligibility.controller.ts)

- Update imports to use `AccessService` from `../access.service`.

#### [MODIFY] [access.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/access/access.test.ts)

- Update imports to use `AccessService` instead of `AccessGatekeeperService`.

#### [MODIFY] [exam-notifications.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/tests/exam-notifications.test.ts)

#### [MODIFY] [exam-telemetry.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/tests/exam-telemetry.test.ts)

- Update imports to use `AccessService` instead of `AccessGatekeeperService`.

---

## Phases of Execution

### Phase 1: Create Modular Service Files

**Goal:** Create modular service files containing core evaluation and orchestration logic.

- [ ] Create `app/sentinel-api/src/modules/examination/access/services/evaluate-student-exam-eligibility.service.ts`
- [ ] Create `app/sentinel-api/src/modules/examination/access/services/verify-student-exam-eligibility.service.ts`

**Migration required:** No

### Phase 2: Update Entrypoint & Clean Up

**Goal:** Replace the main access service and update imports in controllers and dependent modules.

- [ ] Replace `app/sentinel-api/src/modules/examination/access/access.service.ts` with delegation methods.
- [ ] Update imports in `app/sentinel-api/src/modules/examination/access/controllers/get-exam-access-lobby.controller.ts`.
- [ ] Update imports in `app/sentinel-api/src/modules/examination/access/controllers/verify-exam-eligibility.controller.ts`.
- [ ] Delete `app/sentinel-api/src/modules/examination/access/services/access-gatekeeper.service.ts`.

**Migration required:** No

### Phase 3: Update and Run Integration Tests

**Goal:** Verify correct functionality across the refactored code.

- [ ] Update `app/sentinel-api/src/modules/examination/access/access.test.ts` to use `AccessService`.
- [ ] Update `app/sentinel-api/src/modules/examination/tests/exam-notifications.test.ts` and `app/sentinel-api/src/modules/examination/tests/exam-telemetry.test.ts` to use `AccessService`.
- [ ] Run access and general exam test suites:
    ```bash
    pnpm --dir app/sentinel-api test access exam-notifications exam-telemetry
    ```

**Migration required:** No

---

## Verification Plan

### Automated Tests

- Run tests:
    ```bash
    pnpm --dir app/sentinel-api test access exam-notifications exam-telemetry
    ```
- Run the full project test runner.

### Manual Verification

- Verify code imports compile correctly.
