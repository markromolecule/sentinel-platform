# Implementation Plan: Sentinel Support Fixes

---

#### Phase 1 — Institution Setup Flow Alignment

**Objective:** Reorder and stabilize the institution setup flow so naming convention inputs exist before downstream department, course, and section configuration.

**Tasks:**

- [x] Audit the current `sentinel-core` institution setup stepper, forms, and persistence flow to map where `Identity`, `Academic Terms`, `Naming Conventions`, `Departments`, `Courses`, `Sections`, and `Review` are currently rendered and saved.
- [x] Reorder the institution setup UI and backing state so the step hierarchy matches the required sequence and preserves valid data when users move between steps.
- [x] Verify the institution setup submission payload persists naming convention settings early enough for section and room consumers to reuse them after setup completes.

**Outcome:** The institution setup flow renders the required step order and persists naming convention data before section and room management depends on it.

---

#### Phase 2 — Section And Room Naming Convention Propagation

**Objective:** Make section and room creation flows derive their default names from institution-level naming conventions in both setup and management dialogs.

**Tasks:**

- [x] Define the section naming rule contract for institution configuration, including course-code abbreviation, two-digit year suffix, and per-scope increment behavior needed to produce values such as `INF261`.
- [x] Build shared section and room name generation logic so `sentinel-core` institution setup, admin section dialogs, and room management dialogs resolve consistent default display names from the selected institution context.
- [x] Connect the add section and add room dialogs to fetch the institution naming convention, prefill generated names, and refresh generated values when the selected course, year, floor, or institution changes.

**Outcome:** Section and room creation surfaces generate institution-aware default names consistently across setup and management workflows.

---

#### Phase 3 — Parent And Branch Hierarchy Corrections

**Objective:** Enforce valid parent and branch relationships in support-facing institution management and remove confusing parent identifiers from the UI.

**Tasks:**

- [x] Update the parent or branch listing query and table rendering so the parent column displays `parent_name` instead of `parent_id`.
- [x] Restrict the add branch or institution flow to automatically inherit the current parent institution context and prevent users from creating a parent record while operating under a branch or institution.
- [x] Validate the backend and frontend hierarchy rules so branch creation, institution creation, and parent-level access remain consistent across the support portal.

**Outcome:** Parent tables show readable parent names and branch creation is constrained to valid hierarchy relationships.

---

#### Phase 4 — Support Course, Section, And Subject Management Fixes

**Objective:** Restore broken support management actions and remove unsupported entry points that should no longer be exposed.

**Tasks:**

- [x] Trace and fix the section creation failure inside `sentinel-support` course management so adding a new section from the dialog successfully submits and refreshes the course detail state.
- [x] Remove the standalone add buttons from support `Course Management`, `Section Management`, and `Subject Management` pages while preserving any remaining supported edit or scoped-create actions.
- [x] Align the support management page states, dialog triggers, and service calls so hidden add actions do not leave dead UI paths, broken permissions checks, or stale empty-state messaging.

**Outcome:** Support management pages expose only working actions, and section creation from course management completes successfully.

---

#### Phase 5 — Subject Classification And Table Display Parity

**Objective:** Bring support subject management into parity with core by adding subject classification support and correcting department display values.

**Tasks:**

- [x] Review the `sentinel-core` subject classification page, routes, and contracts to identify the reusable backend and frontend pieces needed in `sentinel-support`.
- [x] Implement the support-side subject classification page and navigation flow so institution-created classifications can be viewed and managed with the same inheritance expectations used by branches.
- [x] Update the support subject table mapping to display `department_code` instead of `department_name` and verify the classification and subject list views resolve the correct institution-scoped data.

**Outcome:** `sentinel-support` includes a subject classification page aligned with core behavior, and the subject table displays department codes only.

---

#### Phase 6 — Validation And Release Readiness

**Objective:** Verify the affected support and core workflows behave correctly before the fixes are released.

**Tasks:**

- [ ] Write focused tests for any extracted naming convention utilities or API handlers that compute section and room defaults, covering happy paths and invalid institution configuration inputs.
- [x] Run targeted validation for the affected workspaces, including support and core flows for institution setup, branch creation, room creation, section creation, and subject classification access.
- [x] Confirm the final UI and data behavior against the support-fix checklist in `docs/support-fix.md`, documenting any residual gaps or follow-up work before handoff.

**Outcome:** The support-fix scope is validated by targeted tests and manual workflow checks with any remaining gaps explicitly documented.
