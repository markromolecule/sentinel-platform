# Refactor Import Modal To-Do Plan

The goal is to refactor the monolithic `import-modal.tsx` into a modular, scalable, and readable component by leveraging the existing structure in the `import-modal/` directory.

## Progress Overview

- [x] Phase 1: Setup & Cleanup
- [x] Phase 2: Implementation
- [x] Phase 3: Verification

## Tasks

### Phase 1: Setup & Cleanup

- [x] Review `import-modal/_types/index.ts` and ensure all necessary types are present.
- [x] Review `import-modal/_hooks/use-import-handler.ts` to ensure it covers all logic from the current `import-modal.tsx`.
- [x] Verify `AiTab` and `UploadTab` components in `import-modal/_components/` match the current UI requirements.

### Phase 2: Implementation

- [x] Update `import-modal.tsx` to use hook and modular components.
- [x] Remove redundant code from `import-modal.tsx`.

### Phase 3: Verification

- [x] Test File Upload: Ensure size validation and extension check work via the hook.
- [x] Test AI Tab: Ensure prompt state is correctly managed.
- [x] Test Continuity: Ensure successful redirect after simulation.
- [x] Verify UI: Ensure no visual regressions.
