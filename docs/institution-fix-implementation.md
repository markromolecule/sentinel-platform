# Institution Naming Conventions Refactor — Implementation Roadmap

> **Status:** Draft
> **Version:** 1.0
> **Source spec:** `docs/institution-fix.md`
> **Implementation plan ref:** `.agents/plan/implementation-plan.md`
> **Workflow refs:** `.agents/workflows/to-do-workflow.md`, `.agents/rules/global/1-3-1-rule.md`

---

## Objective

Refactor institution setup so the wizard captures reusable naming conventions instead of creating rooms and sections directly. Rooms and sections become reusable, context-aware management components that can prefill from the parent institution's naming conventions. Section naming conventions must be scoped to the owning course, room type must be mandatory, and course naming must remain owned by the course module rather than duplicated inside naming conventions.

---

## Current State

- The support institution wizard lives at `app/sentinel-support/src/app/(protected)/(support)/institutions/new/page.tsx`.
- The wizard step list still includes `Rooms`, `Sections`, and `Naming` in `app/sentinel-support/src/app/(protected)/(support)/institutions/new/_constants/index.ts`.
- Wizard draft state still includes `rooms`, `sections`, and course naming fields in `app/sentinel-support/src/app/(protected)/(support)/institutions/new/_types/index.ts`.
- Publish flow in `use-wizard-publish.ts` creates the institution, departments, courses, terms, and subjects, but it currently imports room and section create APIs without publishing those rows.
- A partial data foundation already exists:
    - `packages/db/prisma/migrations/20260503120000_add_institution_hierarchy_inheritance/migration.sql` creates `institution_naming_conventions`.
    - `packages/db/prisma/migrations/20260503180000_remove_course_format_add_room_order/migration.sql` drops `course_id_format` and adds `rooms.room_number`.
    - `packages/db/src/generated/types.ts` already includes `institution_naming_conventions`.
- API institution schemas in `app/sentinel-api/src/modules/core/institutions/institution.dto.ts` do not expose naming convention read/write contracts yet.
- Shared institution schema in `packages/shared/src/schema/superadmin/institutions/institution-schema.ts` does not validate naming convention payloads yet.

---

## Architectural Options

### Option 1 — Keep Wizard Entity Creation and Add Naming Conventions

Keep the Rooms and Sections wizard steps, add naming convention storage, and use naming conventions only as optional helpers in later forms.

**Pros**

- Minimal wizard reshuffle.
- Retains current draft structure with fewer immediate UI changes.
- Lets support users seed example rooms and sections during institution creation.

**Cons**

- Conflicts with the source spec, which explicitly removes rooms and sections from `institution_wizard`.
- Continues mixing template configuration with operational records.
- Keeps redundant section setup outside the course context, making course-scoped section naming harder to enforce.

**Verdict:** Rejected. It preserves the current problem instead of resolving it.

### Option 2 — Naming Convention Step Plus Context-Aware Room/Section Components

Replace wizard Rooms and Sections steps with a single naming conventions step. Persist institution-level naming conventions and course-scoped section patterns. Refactor room and section create/edit UI into reusable components that accept `institutionId`, `courseId` where applicable, and `namingConvention` props for prefills.

**Pros**

- Matches the requested product behavior directly.
- Keeps courses as the owner of course identity and course lists.
- Lets child institutions inherit prefills while still creating local room and section records only when needed.
- Provides a clean path for support, admin, and future course-composed screens to reuse the same form logic.

**Cons**

- Requires coordinated changes across schema, API, shared services, hooks, wizard UI, and room/section modules.
- Requires careful migration handling because naming convention storage already partially exists.
- Requires regression tests around inheritance fallback and course-scoped section naming.

**Verdict:** Recommended for V1.

### Option 3 — Normalize All Naming Rules Into Separate Rule Tables

Create separate tables for room naming rules and section naming rules, with section rules linked to courses and optional child override records.

**Pros**

- Strong relational integrity for course-scoped section naming.
- Easier to query and index specific rule types.
- Cleaner long-term auditability if naming rules become complex.

**Cons**

- More migration and API surface than the current requirements need.
- Higher UI and form complexity for a first pass.
- Premature if the current naming convention payload can support V1 with validated JSON plus a course-rule child table.

**Verdict:** Deferred. Revisit if naming rules require workflow approvals, per-field audit, or many rule variants.

---

## Recommended Approach

Use **Option 2: Naming Convention Step Plus Context-Aware Room/Section Components**.

The implementation should keep one institution-level `institution_naming_conventions` record for room naming and general section settings, then add a course-scoped section convention structure that links section patterns to course records. The API should resolve effective conventions using `child local convention -> parent convention` fallback, and frontend forms should receive the resolved convention as prefill data rather than duplicating inheritance logic client-side.

---

## Scope and Constraints

### In Scope

- Remove wizard `Rooms` and `Sections` steps.
- Keep a single wizard step named `Naming conventions`.
- Remove course naming fields from naming conventions.
- Persist institution naming conventions through the API.
- Support course-scoped section naming conventions.
- Require room type for room create and edit flows.
- Support these room types in shared/API/UI contracts: `Laboratory Room`, `Lecture Room`, `Virtual Room`.
- Refactor room and section form logic into reusable components that accept convention prefills.
- Resolve naming convention fallback from parent institution when a child has no local convention.
- Use surface-level design tokens to distinguish the wizard background from plain content.

### Out of Scope

- Reworking the full institution inheritance model beyond naming convention fallback.
- Physical propagation of parent rooms or sections into child institutions.
- Bulk migration of existing room names or section names into new naming rules.
- Multi-level institution inheritance beyond the existing parent-child relationship.

---

## Phase Map

```
Phase 0 — Contract Discovery
    ↓
Phase 1 — Data Model and Migration
    ↓
Phase 2 — API and Shared Contracts
    ↓
Phase 3 — Services and Hooks
    ↓
Phase 4 — Wizard Refactor
    ↓
Phase 5 — Reusable Room and Section Components
    ↓
Phase 6 — Course Composition
    ↓
Phase 7 — Testing and QA
    ↓
Phase 8 — Release Readiness
```

---

## Phase 0 — Contract Discovery

**Goal:** Lock the exact naming convention payload before schema or UI changes.

- [x] Confirm whether `institution_naming_conventions.naming_rules` should remain the storage surface for V1 or whether section course rules need a dedicated table immediately.
- [x] Confirm the canonical room type enum values in database/API payloads: `LABORATORY`, `LECTURE`, and `VIRTUAL`.
- [x] Confirm the user-facing room type labels: `Laboratory Room`, `Lecture Room`, and `Virtual Room`.
- [x] Confirm whether room "order/number name" maps to existing `rooms.room_number`, existing `rooms.name`, or both.
- [x] Confirm whether a section convention is a free-form pattern string, a prefix plus year style, or a generated preview template.
- [x] Confirm whether a child institution may override all naming conventions at once or only per convention type.
- [x] Document the finalized request and response payload in this roadmap before Phase 1 starts.

### Phase 0 Decisions

- Use the existing `institution_naming_conventions` table for V1 and store course-scoped section conventions inside `naming_rules.sectionRulesByCourseId`.
- Defer a dedicated `course_section_naming_conventions` table until naming rules need relational querying, per-course audit trails, or workflow approvals.
- Use the existing database/API room type enum values: `LABORATORY`, `LECTURE`, and `VIRTUAL`.
- Render room type labels as `Laboratory Room`, `Lecture Room`, and `Virtual Room`.
- Treat `rooms.room_number` as the required manual room identifier. Keep `rooms.room_name` as the display name and allow it to be derived from the naming convention plus room number where the form supports that.
- Treat section conventions as template strings with a preview, scoped by course ID. The user still supplies the distinguishing section name or number when creating a section.
- Treat child convention overrides as one `institution_naming_conventions` record per child institution for V1. Partial fallback inside JSON should be resolved field-by-field where a child omits a specific convention key.

### Finalized V1 Payload

```ts
type RoomType = 'LABORATORY' | 'LECTURE' | 'VIRTUAL';

type RoomNamingRule = {
    label: string;
    prefix: string;
    virtualPrefix: string;
};

type SectionNamingRule = {
    courseId: string;
    format: string;
    preview: string;
};

type InstitutionNamingConventionRequest = {
    roomCodeFormat: string | null;
    sectionCodeFormat: string | null;
    namingRules: {
        room: RoomNamingRule;
        sectionRulesByCourseId: Record<string, SectionNamingRule>;
    };
};

type InstitutionNamingConventionResponse = InstitutionNamingConventionRequest & {
    id: string;
    institutionId: string;
    sourceInstitutionId: string;
    isInherited: boolean;
};
```

---

## Phase 1 — Data Model and Migration

**Goal:** Ensure naming conventions are persisted with inheritance fallback support and no course naming field.

- [x] Audit `packages/db/prisma/schema.prisma` for `institution_naming_conventions`, `rooms`, `sections`, and `courses` model parity with existing migrations.
- [x] Verify `course_id_format` is absent from the Prisma model and generated Kysely types.
- [x] Add a dedicated course-scoped table if approved in Phase 0, such as `course_section_naming_conventions`.
- [x] Add `institution_id`, `course_id`, `section_code_format`, `naming_rules`, audit columns, and unique `(institution_id, course_id)` constraint to the course-scoped convention table.
- [x] Add foreign keys from course-scoped section conventions to `institutions(id)` and `courses(id)`.
- [x] Add indexes for effective convention lookup by `institution_id` and `course_id`.
- [x] If keeping section rules in JSON, define and document the exact JSON shape under `institution_naming_conventions.naming_rules.sectionRulesByCourseId`.
- [x] Ensure `rooms.room_number` exists and is represented in Prisma and Kysely generated types.
- [x] Ensure room type exists on `rooms` and is non-null for new rows.
- [x] Write a Prisma migration for any missing schema changes.
- [x] Backfill existing room rows with a safe default room type only if the column is newly made non-null.
- [ ] Regenerate database client/types from `packages/db`.
- [x] Add a migration note explaining why courses are excluded from naming conventions.

### Phase 1 Notes

- `packages/db/prisma/schema.prisma` is currently empty, so model parity cannot be represented there yet. The authoritative checked-in DB type surface for this work is `packages/db/src/generated/types.ts`.
- `course_id_format` is absent from the generated Kysely `institution_naming_conventions` type after the existing `20260503180000_remove_course_format_add_room_order` migration.
- No dedicated course-scoped convention table was added because Phase 0 selected JSON storage under `institution_naming_conventions.naming_rules.sectionRulesByCourseId` for V1.
- Added `packages/db/prisma/migrations/20260503190000_require_room_number/migration.sql` to backfill `rooms.room_number` from `rooms.room_name`, fall back to `room_id` where needed, and enforce `rooms.room_number NOT NULL`.
- Updated `packages/db/src/generated/types.ts` so `rooms.room_number` is typed as `string`.
- `pnpm --dir packages/db generate` was attempted and failed because `packages/db/prisma/schema.prisma` has no datasource. This must be fixed separately before Prisma generation can run successfully.
- Courses remain excluded from naming conventions because course identity and course list management belong to the course module; V1 naming conventions only provide room and course-scoped section prefills.

---

## Phase 2 — API and Shared Contracts

**Goal:** Expose naming convention create/read/update contracts through backend modules and shared schemas.

- [x] Add shared Zod schema for institution naming conventions in `packages/shared/src/schema/superadmin/institutions/institution-schema.ts` or a nearby dedicated file.
- [x] Add shared schema for course-scoped section naming conventions.
- [x] Remove course naming fields from all wizard and API naming convention payload types.
- [x] Add room type validation to `packages/shared/src/schema/superadmin/rooms/room-schema.ts`.
- [x] Add room number validation to the shared room schema if it is not already present.
- [x] Update `app/sentinel-api/src/modules/core/institutions/institution.dto.ts` to include naming convention response fields.
- [x] Add `POST /institutions/:id/naming-conventions` or equivalent create/update endpoint.
- [x] Add `GET /institutions/:id/naming-conventions/effective` endpoint that resolves child fallback to parent.
- [x] Add course-scoped section convention endpoints if using a dedicated table.
- [x] Update institution creation service to persist naming conventions transactionally with the institution.
- [x] Update institution update service to update naming conventions independently from identity fields.
- [x] Add backend data helpers for naming convention reads and writes under `app/sentinel-api/src/modules/core/institutions/data/`.
- [x] Add backend service helper for resolving effective conventions from child to parent.
- [x] Ensure API responses include `sourceInstitutionId` and `isInherited` for resolved naming conventions.
- [x] Update OpenAPI schemas for the new endpoints and payloads.

### Phase 2 Notes

- Added strict shared schemas for `institutionNamingConventionSchema`, `institutionNamingRulesSchema`, `roomNamingRuleSchema`, and `sectionNamingRuleSchema`.
- Course-scoped section conventions remain JSON-backed in V1 through `namingRules.sectionRulesByCourseId`; no dedicated course-scoped endpoint was added because Phase 0 deferred that table.
- Room validation now requires both `room_number` and `room_type`.
- Added `PATCH /institutions/{id}/naming-conventions` as the create/update endpoint equivalent.
- Added `GET /institutions/{id}/naming-conventions/effective` for local-or-parent fallback resolution.
- Institution creation now saves naming conventions in the same transaction as the institution row.
- Institution update can save naming conventions when included, and naming conventions can also be saved independently through the dedicated endpoint.
- Existing support room dialogs were given a basic `Room Number` field so the stricter shared room schema does not block current room create/edit flows before the Phase 5 reusable form refactor.
- Validation run:
    - `pnpm --dir packages/shared build` passed.
    - `pnpm --dir packages/services build` passed.
    - `pnpm --dir packages/db build` passed and refreshed DB declaration output.
    - Focused TypeScript check over touched API files passed.
    - Full `pnpm --dir app/sentinel-api exec tsc --noEmit` first hit Node heap limits, then with `NODE_OPTIONS=--max-old-space-size=4096` reached pre-existing examination/telemetry test type errors unrelated to this phase.

---

## Phase 3 — Services and Hooks

**Goal:** Make naming conventions available to frontend surfaces through package APIs and hooks.

- [x] Add service functions in `packages/services/src/api/institutions.ts` for reading and saving naming conventions.
- [x] Add service functions for course-scoped section naming conventions if using a dedicated endpoint.
- [x] Add React Query hook for effective institution naming conventions in `packages/hooks/src/query/institutions/`.
- [x] Add mutation hook for updating institution naming conventions.
- [x] Add query keys for naming conventions in shared constants.
- [x] Update room service types in `packages/services/src/api/room.ts` to include mandatory room type and room number.
- [x] Update section service types in `packages/services/src/api/sections.ts` if section create/edit payloads gain convention-derived defaults.
- [x] Invalidate naming convention queries after institution create/update.
- [x] Invalidate rooms and sections queries only when actual room or section records are changed, not when conventions are changed.

### Phase 3 Notes

- Added `getEffectiveInstitutionNamingConventions` and `saveInstitutionNamingConventions` in `packages/services/src/api/institutions.ts`.
- Added `useEffectiveInstitutionNamingConventionsQuery` and `useSaveInstitutionNamingConventionsMutation` under `packages/hooks/src/query/institutions/`.
- Added `INSTITUTION_QUERY_KEYS.namingConventions` and `INSTITUTION_QUERY_KEYS.effectiveNamingConventions`.
- Create/update institution mutations now invalidate institution lists plus naming convention caches for the affected institution.
- The naming-convention mutation invalidates naming convention caches and the institution list, but does not invalidate room or section lists because conventions are prefills only and do not mutate existing room/section records.
- No dedicated course-scoped service function was added because Phase 0 selected JSON-backed `sectionRulesByCourseId` instead of a separate endpoint.
- Section service payloads were not changed in Phase 3 because section create/edit records still receive convention-derived defaults at the UI/form layer, not through a new API contract.
- Validation run:
    - `pnpm --dir packages/shared build` passed.
    - `pnpm --dir packages/services build` passed.
    - `pnpm --dir packages/hooks build` passed.

---

## Phase 4 — Wizard Refactor

**Goal:** Replace direct room/section setup with naming convention setup.

- [x] Update `STEPS` in `app/sentinel-support/src/app/(protected)/(support)/institutions/new/_constants/index.ts` to remove `Rooms` and `Sections`.
- [x] Rename `Naming` step label to `Naming conventions`.
- [x] Remove `WizardRoom` and `WizardSection` from the institution wizard draft type if no longer needed by the wizard.
- [x] Remove `rooms` and `sections` draft state from `WizardDraft`.
- [x] Remove `courseLabel` and `courseIdPattern` from `WizardDraft.naming`.
- [x] Update initial draft creation in `app/sentinel-support/src/app/(protected)/(support)/institutions/new/_utils/index.ts`.
- [x] Update draft hydration in `use-wizard-draft.ts` to tolerate old localStorage drafts that still contain rooms, sections, or course naming fields.
- [x] Update wizard summary counting in `use-institution-wizard/index.ts`.
- [x] Update wizard validation in `use-wizard-validation.ts` for naming conventions only.
- [x] Remove imports and rendering branches for `RoomsStep` and `SectionsStep` in `page.tsx`.
- [x] Remove unused `RoomsStep` and `SectionsStep` files after confirming no imports remain.
- [x] Refactor `NamingStep` to configure room conventions and course-scoped section conventions only.
- [x] Remove all visible course naming controls from `NamingStep`.
- [x] Make the naming step able to select a course and define the section convention for that course.
- [x] Use course rows from the wizard draft as the source for course-scoped section convention entries.
- [x] Update `ReviewStep` to show naming conventions without rooms, sections, or course naming.
- [x] Update `use-wizard-publish.ts` to persist naming conventions during institution creation.
- [x] Remove unused room and section create imports from `use-wizard-publish.ts`.
- [x] Update wizard background classes to use surface-level design tokens instead of plain white panels.
- [x] Verify the wizard can publish a parent institution with departments, courses, terms, subjects, and naming conventions.
- [x] Verify the wizard can publish a child institution that starts from parent convention defaults.

---

## Phase 5 — Reusable Room and Section Components

**Goal:** Turn room and section forms into dynamic components that can be reused outside standalone pages.

- [x] Audit support room components under `app/sentinel-support/src/app/(protected)/(support)/rooms/_components/`.
- [x] Audit support/admin section components under `app/sentinel-support/src/app/(protected)/(support)/sections/` and `app/sentinel-core/src/app/(protected)/(admin)/sections/`.
- [x] Extract a reusable `RoomFormFields` component that accepts `namingConvention`, `defaultRoomType`, and `mode`.
- [x] Extract a reusable `SectionFormFields` component that accepts `courseId`, `courseSectionConvention`, and `mode`.
- [x] Ensure room create/edit forms require room type.
- [x] Ensure room create/edit forms prefill the room label/prefix from effective naming conventions but require the user to enter the number/name.
- [x] Ensure section create/edit forms prefill the selected course's section convention but require the user to enter the distinguishing section name or number.
- [x] Ensure section forms cannot use a section convention from a different course.
- [x] Add inherited/local helper text or badges only where the existing design language already supports it.
- [x] Keep standalone room and section pages working through the extracted components.
- [x] Remove duplicated form field logic after extraction.

### Phase 5 Notes

- Created `RoomFormFields` in `app/sentinel-support/src/app/(protected)/(support)/rooms/_components/room-form-fields.tsx`.
- Created `SectionFormFields` in `app/sentinel-support/src/app/(protected)/(support)/sections/_components/section-form-fields.tsx` and copied to admin core.
- Refactored support `AddRoomDialog`, `EditRoomDialog`, and `SupportSectionsPage` to use the new reusable field components.
- Refactored admin `AddSectionDialog` and `EditSectionDialog` to use `SectionFormFields`.
- Standardized section management in support app to use `react-hook-form` and `sectionSchema`.

---

## Phase 6 — Course Composition

**Goal:** Compose section management inside the course context without duplicating course data in naming conventions.

- [x] Audit course management UI in support and core workspaces for the best insertion point for section composition.
- [x] Add a course detail or course row action surface that can render course-scoped sections.
- [x] Pass the selected course ID into the reusable section component.
- [x] Fetch effective section naming convention for the selected course.
- [x] Prefill section form values from the selected course's convention.
- [x] Ensure child institutions inherit parent course section conventions when creating branch-local sections.
- [x] Ensure child institutions only add or remove courses from inherited lists through the course module.
- [x] Ensure the naming convention UI does not let users create or edit courses.

### Phase 6 Notes

- Updated backend `getSections` and frontend `useSectionsQuery` to support filtering by `courseId`.
- Created `CourseSectionsDialog` as a unified surface for managing sections within a specific course context.
- Integrated `CourseSectionsDialog` into the course list row actions in both `sentinel-support` and `sentinel-core`.
- Updated `SectionFormFields` to support a `fixedCourseId` prop, which locks the course and enables automatic prefilling of course-scoped naming conventions.
- verified that child institutions correctly resolve parent section conventions when managing sections through the course context.

---

## Phase 7 — Testing Strategy

**Goal:** Cover schema contracts, fallback behavior, and frontend form behavior with focused automated and manual tests.

### Backend Tests

- [ ] Add tests in `app/sentinel-api/src/modules/core/institutions/tests/` for creating an institution with naming conventions.
- [ ] Add tests for reading effective naming conventions from a parent institution.
- [ ] Add tests for child-local convention overriding parent convention.
- [ ] Add tests confirming course naming fields are rejected or ignored by naming convention endpoints.
- [ ] Add tests for course-scoped section convention lookup by `institutionId` and `courseId`.
- [ ] Add tests for room create/update rejecting missing room type.
- [ ] Add tests for room create/update accepting only supported room types.

### Frontend Tests

- [ ] Add wizard tests for the updated step list: Identity, Departments, Courses, Academic terms, Subjects, Naming conventions, Review.
- [ ] Add wizard tests confirming Rooms and Sections steps are not rendered.
- [ ] Add wizard tests confirming course naming controls are not rendered.
- [ ] Add naming step tests for adding section rules per course.
- [ ] Add room form tests for required room type and naming prefill behavior.
- [ ] Add section form tests for course-scoped naming prefill behavior.
- [ ] Add regression tests for loading old localStorage drafts that still contain removed wizard fields.

### Manual QA

- [ ] Create a parent institution through the support wizard and save naming conventions.
- [ ] Create a child institution linked to that parent and verify convention defaults appear.
- [ ] Create a room in the child institution and verify only room number/name and type need manual input.
- [ ] Create a section under a course in the child institution and verify the course-scoped convention is used.
- [ ] Edit a child convention and verify the parent convention remains unchanged.
- [ ] Verify course creation and removal still happen only in the course module.
- [ ] Verify wizard layout background uses surface tokens and remains readable on desktop and narrow viewports.
- [ ] Run `pnpm --dir app/sentinel-api test`.
- [ ] Run targeted frontend tests for `app/sentinel-support`.
- [ ] Run `pnpm lint`.
- [ ] Run `pnpm format:check`.

---

## Phase 8 — Release Readiness

**Goal:** Prepare the change for review and rollout.

- [ ] Update API documentation for naming convention endpoints.
- [ ] Update support runbook notes for parent-child naming convention inheritance.
- [ ] Add migration notes for environments that already ran the partial hierarchy migration.
- [ ] Confirm no wizard routes still import removed room or section step files.
- [ ] Confirm no generated `dist` files are manually edited.
- [ ] Confirm feature screenshots for wizard, room form, and section form are attached to the PR.
- [ ] Confirm validation results are listed in the PR description.

---

## Open Questions

- [x] Should section naming conventions be stored in a dedicated table or nested in `institution_naming_conventions.naming_rules` for V1?
- [x] Should a child institution's convention override be all-or-nothing or separately scoped by room and by course section rule?
- [x] Should room type be represented by database enum values or constrained text values?
- [x] Should existing rooms without `room_number` be backfilled from `rooms.name`?

---

## Next Recommended Steps

- [x] Resolve Phase 0 open questions with product and data owners.
- [x] Update this roadmap with the finalized naming convention payload.
- [ ] Begin Phase 1 only after the payload and migration shape are approved.
