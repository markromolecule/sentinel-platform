# Refactor FlowService into Modular Services

Refactor `app/sentinel-api/src/modules/examination/flow/services/session-manager.service.ts` by breaking its methods into modular service functions in the `services/` directory and establishing `app/sentinel-api/src/modules/examination/flow/flow.service.ts` as the main delegating entry point.

## 1-3-1 Plan Configuration

### Three Viable Options

1. **Option 1: Keep SessionManagerService name and partially refactor (Simple/Fast)**
    - Keep the file name `session-manager.service.ts` and only extract `completeSession` as it has the most complex scoring/IRT logic.
    - _Tradeoff:_ Fast to do, but leaves the folder structure inconsistent with `flow.service.ts` and does not fully modularize the code.
2. **Option 2: Fully modularize under flow.service.ts and services/ (Robust/Scalable)**
    - Extract all session operations (`startSession`, `syncSession`, `completeSession`) into modular service files:
        - `services/start-session.service.ts`
        - `services/sync-session.service.ts`
        - `services/complete-session.service.ts`
    - Implement `FlowService` class in `flow.service.ts` to delegate to these services.
    - Delete the old `services/session-manager.service.ts`.
    - Update controllers and tests to import and use the new `FlowService` or the modular services directly.
    - _Tradeoff:_ Requires updating references in multiple controllers and tests, but results in a cleaner, fully consistent structure.
3. **Option 3: Direct Controller Integration and delete flow.service.ts (Creative)**
    - Update the controllers and tests to call the modular services directly and remove the delegation service file completely.
    - _Tradeoff:_ Simplifies the route handlers, but loses the consolidated service API layer and increases code churn across import statements.

### Recommended Option

We recommend **Option 2 (Fully modularize under flow.service.ts and services/)**. It maintains the service-level delegation structure consistent with the rest of the application modules.

---

## User Review Required

> [!WARNING]
> This refactoring will rename the entry point class from `SessionManagerService` to `FlowService` in `flow.service.ts` and delete `services/session-manager.service.ts`. All controllers and test files inside the `flow` module will be updated to import `FlowService` or the modular services.

## Open Questions

None.

## Proposed Changes

### Examination Flow Component

---

#### [NEW] [start-session.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/flow/services/start-session.service.ts)

- Implements `startSessionService` to verify student eligibility, initialize the exam attempt session, log telemetry, and trigger notifications.

#### [NEW] [sync-session.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/flow/services/sync-session.service.ts)

- Implements `syncSessionService` to update student sync progress (answers, time elapsed) and log telemetry.

#### [NEW] [complete-session.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/flow/services/complete-session.service.ts)

- Implements `completeSessionService` to fetch questions/config, shuffle/randomize choices, score the exam attempt, save completed progress, trigger telemetry/notifications, and trigger post-exam IRT difficulty calibration.

#### [MODIFY] [flow.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/flow/flow.service.ts)

- Declares the `FlowService` class delegating to the modular service functions.

#### [DELETE] [session-manager.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/flow/services/session-manager.service.ts)

- Removed as all methods are moved to modular service files.

#### [MODIFY] [start-session.controller.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/flow/controllers/start-session.controller.ts)

#### [MODIFY] [sync-session.controller.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/flow/controllers/sync-session.controller.ts)

#### [MODIFY] [complete-session.controller.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/flow/controllers/complete-session.controller.ts)

- Update imports to use `FlowService` from `../flow.service`.

#### [MODIFY] [flow.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/flow/flow.test.ts)

- Update imports and references to use `FlowService`.

---

## Phases of Execution

### Phase 1: Create Modular Service Files

**Goal:** Extract the session flow methods into individual single-purpose service files.

- [ ] Create `app/sentinel-api/src/modules/examination/flow/services/start-session.service.ts`
- [ ] Create `app/sentinel-api/src/modules/examination/flow/services/sync-session.service.ts`
- [ ] Create `app/sentinel-api/src/modules/examination/flow/services/complete-session.service.ts`
- [ ] Write unit tests for these services co-located in `app/sentinel-api/src/modules/examination/flow/services/` or covered by the existing integration test file `flow.test.ts`.

**Migration required:** No

### Phase 2: Update Entrypoint & Controllers

**Goal:** Modify flow.service.ts and flow controllers to point to the new modular services.

- [ ] Replace `app/sentinel-api/src/modules/examination/flow/flow.service.ts` with `FlowService` delegating to new services.
- [ ] Update imports in `app/sentinel-api/src/modules/examination/flow/controllers/start-session.controller.ts`.
- [ ] Update imports in `app/sentinel-api/src/modules/examination/flow/controllers/sync-session.controller.ts`.
- [ ] Update imports in `app/sentinel-api/src/modules/examination/flow/controllers/complete-session.controller.ts`.
- [ ] Remove the old `app/sentinel-api/src/modules/examination/flow/services/session-manager.service.ts`.

**Migration required:** No

### Phase 3: Update and Run Integration Tests

**Goal:** Verify correct functionality across the refactored code.

- [ ] Update `app/sentinel-api/src/modules/examination/flow/flow.test.ts` to reference `FlowService` instead of `SessionManagerService`.
- [ ] Run the flow integration test suite:
    ```bash
    pnpm --dir app/sentinel-api test flow
    ```

**Migration required:** No

---

## Verification Plan

### Automated Tests

- Run `flow` tests:
    ```bash
    pnpm --dir app/sentinel-api test flow
    ```
- Run the full project tests:
    ```bash
    pnpm --dir app/sentinel-api test
    ```

### Manual Verification

- Verify code imports compile correctly.
