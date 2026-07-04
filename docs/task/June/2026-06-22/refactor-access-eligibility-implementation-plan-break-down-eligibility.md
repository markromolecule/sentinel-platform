# Break Down Evaluate Student Exam Eligibility Service

Break down the large `evaluateStudentExamEligibilityService` in `app/sentinel-api/src/modules/examination/access/services/evaluate-student-exam-eligibility.service.ts` into smaller, single-responsibility helpers to improve maintainability, scale, readability, and debuggability.

## 1-3-1 Plan Configuration

### Three Viable Options

1. **Option 1: Functional decomposition inside the same file (Simple/Fast)**
    - Extract the checks into private helper functions within the same file (e.g. `checkBasicPolicy`, `checkEnrollment`, `resolveRuntimeAccess`).
    - _Tradeoff:_ Fast to do, but leaves the file long and does not fully separate responsibilities into individual service files.
2. **Option 2: Extract to separate sub-service helper files (Robust/Scalable)**
    - Create separate service files under `examination/access/services/`:
        - `services/validate-basic-eligibility.ts`: Handles profile presence, matching institution IDs, publication status, date validation, and room assignments.
        - `services/resolve-lobby-runtime-access.ts`: Resolves gating logic for instructor-approved lobbies.
        - `services/evaluate-student-exam-eligibility.service.ts`: Acts as the orchestrator combining these modules.
    - _Tradeoff:_ Requires creating multiple files, but maximizes modularity, testability, and code clarity.
3. **Option 3: Extract rules into rule engines/strategy patterns (Creative)**
    - Design a rule execution chain where each check is a class implementing a `Rule` interface. The eligibility check iterates over these rules and halts at the first rejection.
    - _Tradeoff:_ Extremely extensible, but adds unnecessary complexity and overhead for the current number of validation rules.

### Recommended Option

We recommend **Option 2 (Extract to separate sub-service helper files)**. It keeps helper services lightweight, simple, and perfectly aligned with the modular service structure.

---

## User Review Required

None.

## Open Questions

None.

## Proposed Changes

### Examination Access Component

---

#### [NEW] [validate-basic-eligibility.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/access/services/validate-basic-eligibility.ts)

- Defines `validateBasicEligibility` helper verifying student profile existence, matching institution IDs, published status, scheduled date validity, and room assignments.

#### [NEW] [resolve-lobby-runtime-access.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/access/services/resolve-lobby-runtime-access.ts)

- Defines `resolveLobbyRuntimeAccess` helper verifying and building runtime access states for instructor-gated lobbies.

#### [MODIFY] [evaluate-student-exam-eligibility.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/access/services/evaluate-student-exam-eligibility.service.ts)

- Cleans up and simplifies `evaluateStudentExamEligibilityService` by calling the extracted sub-service helpers.

---

## Phases of Execution

### Phase 1: Create Helper Service Files

**Goal:** Create individual helper services for basic validations and lobby resolutions.

- [ ] Create `app/sentinel-api/src/modules/examination/access/services/validate-basic-eligibility.ts`
- [ ] Create `app/sentinel-api/src/modules/examination/access/services/resolve-lobby-runtime-access.ts`

**Migration required:** No

### Phase 2: Refactor Evaluator & Verify

**Goal:** Integrate the helpers into the main evaluator and run tests.

- [ ] Modify `app/sentinel-api/src/modules/examination/access/services/evaluate-student-exam-eligibility.service.ts` to call the helpers.
- [ ] Run access tests to verify correct logic flow:
    ```bash
    pnpm --dir app/sentinel-api test access
    ```

**Migration required:** No

---

## Verification Plan

### Automated Tests

- Run access tests:
    ```bash
    pnpm --dir app/sentinel-api test access
    ```
- Run general tests:
    ```bash
    pnpm --dir app/sentinel-api test
    ```

### Manual Verification

- Verify code imports compile correctly.
