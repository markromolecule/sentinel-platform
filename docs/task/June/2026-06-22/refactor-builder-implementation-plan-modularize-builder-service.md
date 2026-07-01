# Refactor BuilderService into Modular Services

Refactor `app/sentinel-api/src/modules/examination/builder/builder.service.ts` by breaking its methods into modular, testable service functions under `services/`, and updating the main entry point to delegate to them.

## 1-3-1 Plan Configuration

### Three Viable Options

1. **Option 1: Partial refactoring (Simple/Fast)**
    - Only extract the mutation methods (`saveBuilderWorkspace` and `publishBuilderWorkspace`) to separate files, leaving query and formatting helper logic inside the original file.
    - _Tradeoff:_ Fast to implement, but leaves the original file partially cluttered and inconsistent with the modular services pattern.
2. **Option 2: Complete modularization with delegation (Robust/Scalable)**
    - Extract all methods (`getBuilderWorkspace`, `saveBuilderWorkspace`, `publishBuilderWorkspace`) and the formatting helper (`buildBuilderWorkspace`) into individual service files in the `services/` directory. Update the original `BuilderService` class to import and delegate to these new services.
    - _Tradeoff:_ Requires creating multiple files, but keeps the codebase clean, highly maintainable, and aligned with `QuestionBankService`.
3. **Option 3: Direct Controller Integration (Creative)**
    - Eliminate the `BuilderService` class entirely and update all controllers (get, save, publish) to call the modular service functions directly.
    - _Tradeoff:_ Simplifies the architecture by removing a delegation layer, but requires modifying multiple controller files and removes backward compatibility for `BuilderService`.

### Recommended Option

We recommend **Option 2 (Complete modularization with delegation)**. It maintains backward compatibility and matches the modular service pattern utilized elsewhere in the sentinel codebase (e.g. `CourseService` and `QuestionBankService`).

---

## User Review Required

> [!NOTE]
> All static methods in `BuilderService` will be marked as `@deprecated` to encourage direct imports of the individual services.

## Open Questions

None.

## Proposed Changes

### Examination Builder Component

---

#### [NEW] [build-builder-workspace.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/builder/services/build-builder-workspace.service.ts)

#### [NEW] [get-builder-workspace.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/builder/services/get-builder-workspace.service.ts)

#### [NEW] [save-builder-workspace.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/builder/services/save-builder-workspace.service.ts)

#### [NEW] [publish-builder-workspace.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/builder/services/publish-builder-workspace.service.ts)

#### [MODIFY] [builder.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/builder/builder.service.ts)

#### [NEW] [builder-services.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/builder/services/builder-services.test.ts)

---

## Phases of Execution

### Phase 1: Create Modular Service Files

**Goal:** Create individual single-purpose service files to isolate business logic and helper functions.

- [ ] Create `app/sentinel-api/src/modules/examination/builder/services/build-builder-workspace.service.ts` to format workspace payloads.
- [ ] Create `app/sentinel-api/src/modules/examination/builder/services/get-builder-workspace.service.ts` to fetch exam workspace details.
- [ ] Create `app/sentinel-api/src/modules/examination/builder/services/save-builder-workspace.service.ts` to save changes and log telemetry.
- [ ] Create `app/sentinel-api/src/modules/examination/builder/services/publish-builder-workspace.service.ts` to handle exam publication, usage updates, exposure limits, logs, and notifications.
- [ ] Create unit tests for these services at `app/sentinel-api/src/modules/examination/builder/services/builder-services.test.ts`.

**Migration required:** No

### Phase 2: Refactor BuilderService Entrypoint

**Goal:** Clean up the entrypoint class and run tests to verify correct delegation.

- [ ] Modify `app/sentinel-api/src/modules/examination/builder/builder.service.ts` to delegate all static methods to the new services and mark them as `@deprecated`.
- [ ] Run the tests for the modular services:
    ```bash
    pnpm --dir app/sentinel-api test builder-services
    ```

**Migration required:** No

---

## Verification Plan

### Automated Tests

- Run `builder-services` tests:
    ```bash
    pnpm --dir app/sentinel-api test builder-services
    ```
- Run the full project tests to ensure no regressions:
    ```bash
    pnpm --dir app/sentinel-api test
    ```

### Manual Verification

- Verify code imports compile correctly.
