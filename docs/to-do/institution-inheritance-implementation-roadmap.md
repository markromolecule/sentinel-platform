# Institution Inheritance — Implementation Roadmap

> **Status:** Draft · **Version:** 1.0 · **Source spec:** `docs/institution-adjustment.md`
> **Implementation plan ref:** `.agents/plan/implementation-plan.md`

---

## Table of Contents

1. [Objective](#objective)
2. [Background and Current State](#background-and-current-state)
3. [Glossary](#glossary)
4. [Architectural Options](#architectural-options)
5. [Recommended Approach](#recommended-approach)
6. [Scope and Constraints](#scope-and-constraints)
7. [Phase Map and Dependencies](#phase-map-and-dependencies)
8. [Phase 0 — Discovery and Contract Decisions](#phase-0--discovery-and-contract-decisions)
9. [Phase 1 — Data Model Foundation](#phase-1--data-model-foundation)
10. [Phase 2 — Backend Inheritance Services](#phase-2--backend-inheritance-services)
11. [Phase 3 — Core Module API Updates](#phase-3--core-module-api-updates)
12. [Phase 4 — Institution Setup Wizard](#phase-4--institution-setup-wizard)
13. [Phase 5 — Support Portal Core Data Parity](#phase-5--support-portal-core-data-parity)
14. [Phase 6 — Admin and Branch Experience](#phase-6--admin-and-branch-experience)
15. [Phase 7 — Existing Data Rollout](#phase-7--existing-data-rollout)
16. [Phase 8 — Testing Strategy](#phase-8--testing-strategy)
17. [Phase 9 — Release Readiness](#phase-9--release-readiness)
18. [Approval Gates](#approval-gates)
19. [Risk Register](#risk-register)

---

## Objective

Implement a **Parent-Child Institution Model** where a parent institution serves as the canonical source of truth for shared academic configuration. Child (branch) institutions inherit that configuration by default and may apply controlled local overrides without affecting sibling branches or the parent template.

This eliminates redundant data entry across branches, establishes a single point of truth for institutional standards, and supports branch-level customization through a formal override and resolution system.

---

## Background and Current State

### What already exists

| Area                                                                                                                                          | Status                                           |
| --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Support-managed institution, department, room, semester CRUD                                                                                  | Exists in `app/sentinel-support`                 |
| Core backend modules for institutions, departments, courses, rooms, semesters, sections, subjects, subject classifications, subject offerings | Exists under `app/sentinel-api/src/modules/core` |
| `institution_id` on most core academic tables                                                                                                 | Exists                                           |
| Parent-child institution relationship                                                                                                         | **Missing**                                      |
| Inheritance origin and override metadata                                                                                                      | **Missing**                                      |
| Support portal UX for courses, subjects, sections                                                                                             | **Missing**                                      |
| Parent-template workflows in support portal                                                                                                   | **Missing**                                      |
| Inheritance-aware uniqueness constraints                                                                                                      | **Missing**                                      |

### Key gaps driving this work

- Unique constraints are currently scoped directly to `institution_id`. There is no model for a row that is "owned by parent but visible to child," which means inheritance-aware conflict behavior must be designed before any schema migration is applied.
- Support role access exists for some core modules, but courses, subjects, and sections still lack support-portal parity and have no concept of parent-template context.
- No API layer exposes origin metadata (`inherited`, `local`, `overridden`) on response payloads, so UI cannot currently surface the provenance of a record.

---

## Glossary

| Term                          | Definition                                                                                                                                                                              |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Parent institution**        | The top-level template institution. Owns authoritative configurations that propagate to its branches. May or may not be an operational institution itself (to be confirmed in Phase 0). |
| **Child institution**         | A branch of a parent institution. Receives inherited configuration and may add local records or apply field-level overrides.                                                            |
| **Inherited record**          | A parent-owned row that is visible to a child through resolution, not by physical copy.                                                                                                 |
| **Local record**              | A record created by a child institution that has no parent equivalent. Visible only to that child.                                                                                      |
| **Override**                  | A child-institution record that shadows a specific field or entire inherited parent record. Does not mutate the parent row.                                                             |
| **Effective data**            | The resolved dataset that a given child institution sees: local overrides take precedence; absent overrides fall back to the parent.                                                    |
| **Resolution order**          | `local override → parent fallback`. Applied at read time.                                                                                                                               |
| **Origin metadata**           | Response-level fields (`inheritanceStatus`, `originInstitutionId`, `sourceRecordId`, `isLocal`, `isOverridden`) that describe provenance.                                               |
| **Revert**                    | Deleting a local override record, which causes the child to fall back to the parent value.                                                                                              |
| **Template-only institution** | A parent institution that exists solely as a configuration source and is not used for operational data (student enrollment, exam scheduling, etc.). Confirmation required in Phase 0.   |

---

## Architectural Options

### Option 1 — Physical Propagation

Copy parent records into every child institution when parent template data changes.

**Pros**

- Simple reads: every child has its own rows; no join-time resolution needed.
- Existing API query patterns require fewer changes.

**Cons**

- High write complexity: every parent change triggers fan-out writes across all children.
- Requires a sync job, retry handling, and conflict resolution for each write.
- Duplicated data persists in the database, directly contradicting the feature goal of a single source of truth.
- Divergence risk if the sync job fails partially.

**Verdict:** Rejected. Creates the exact duplication problem this feature is meant to solve.

---

### Option 2 — Virtual Inheritance with Local Overrides ✅ Recommended

Keep parent template rows in the parent institution. Resolve effective child data at read time. Children store only local additions or override rows that reference the parent source record.

**Pros**

- No duplicated rows for inherited data.
- Parent updates are immediately visible to all non-overriding children without a sync step.
- Resolution order (`local override → parent fallback`) maps directly to the product spec.
- Centralized resolution helpers prevent client-side reimplementation of fallback logic.

**Cons**

- Read queries are more complex: each list query must union parent and child rows, deduplicating on resolution order.
- All API response contracts must consistently surface origin metadata.
- Frontend must handle the distinction between mutating a local record versus creating a new override for an inherited record.

**Verdict:** Accepted for V1. Complexity is manageable and the data model is architecturally correct.

---

### Option 3 — Materialized Effective Views

Store canonical parent/local rows and maintain database views or materialized tables that expose effective child data as a flat surface.

**Pros**

- Consumers get a simpler effective-data query surface.
- Can improve read performance for large child networks.

**Cons**

- Adds materialization refresh logic as another failure mode.
- Higher migration and operational complexity relative to V1 scope.
- Premature optimization: read-time resolution should be benchmarked before materializing.

**Verdict:** Deferred. Revisit if read-time resolution proves too slow at production data volumes. Option 2 resolution helpers can be swapped out for a materialized approach without changing the API contract.

---

## Recommended Approach

**Option 2: Virtual Inheritance with Local Overrides.**

Resolution logic must be centralized in a shared backend service layer so that module controllers remain thin and frontend clients never reimplement fallback behavior. All API responses for inheritable entities must include origin metadata. The support portal is the primary management surface for parent template data.

---

## Scope and Constraints

### In scope for V1

- Parent-child institution hierarchy with a single level of nesting (parent → child; no grandchildren).
- Inheritance for: departments, courses, rooms, semesters/terms, subjects, and naming conventions.
- Local additions and field-level overrides for child institutions.
- Revert-to-parent capability for all overrides.
- Support portal parity for courses, subjects, and sections with parent-template context.
- Multi-step institution setup wizard for support users.
- Inherited/local/overridden origin metadata on all affected API responses.
- Existing data rollout script to classify current institutions as standalone or parent records.

### Explicitly deferred (V2 or later)

- Multi-level nesting (grandchild institutions).
- Section inheritance (decision required in Phase 0; may slip to V2 depending on branch-specific section rules).
- Materialized effective views (see Option 3).
- Cross-parent institution transfers.
- Bulk override management tools.
- Subject offering inheritance (complex join table behavior; assess in Phase 0).

---

## Phase Map and Dependencies

```
Phase 0 — Discovery and Contract Decisions
    ↓  (schema decisions locked)
Phase 1 — Data Model Foundation
    ↓  (migration applied)
Phase 2 — Backend Inheritance Services
    ↓  (resolution helpers available)
Phase 3 — Core Module API Updates
    ↓  (effective-data API contracts stable)
    ├── Phase 4 — Institution Setup Wizard
    ├── Phase 5 — Support Portal Core Data Parity
    └── Phase 6 — Admin and Branch Experience
                ↓
Phase 7 — Existing Data Rollout
    ↓
Phase 8 — Testing Strategy (spans Phases 1–7)
    ↓
Phase 9 — Release Readiness
```

Phases 4, 5, and 6 may proceed in parallel once Phase 3 is complete. Phase 7 must not run against production until Phase 6 QA is signed off. Phase 8 test authoring should begin in Phase 1 and accumulate through each subsequent phase.

---

## Phase 0 — Discovery and Contract Decisions

**Goal:** Lock all data contract decisions before any schema work begins. No migration should be written until every item in this phase has an explicit decision and documented rationale.

**Estimated effort:** 2–4 days (design + async review)
**Blocking:** All subsequent phases.

### Schema scope decisions

- [x] Audit all tables that should participate in inheritance: `departments`, `courses`, `rooms`, `terms`, `subjects`, `sections`, `subject_classifications`, and `subject_offerings`. Confirm the full list with the data team.
- [x] Decide whether section inheritance is in V1 or deferred. Sections often carry branch-specific year-level and curriculum rules that may not map cleanly to a parent template.
- [x] Decide whether `course_subjects`, subject assignment join tables, and subject offering assignment join tables inherit as part of the parent catalog or are always branch-local.

### Inheritance metadata contract

- [x] Define and document the inheritance metadata fields for all inheritable tables: `origin_institution_id`, `source_record_id`, `inheritance_status` (enum: `inherited` | `local` | `overridden`), `is_local`, `is_overridden`.
- [x] Define and document the allowed child actions per module: inherit only (read-only), add local record, override specific fields, disable/hide inherited item, or detach completely.
- [x] Define conflict rules: what happens when a child already has a local record with the same code or name as a parent template record at the time of parent-child linking?
- [x] Define rollback behavior: when a child override is reverted, does the record hard-delete or soft-delete? Does the parent value become immediately effective?

### Operational decisions

- [x] Confirm whether parent institutions can also be operational institutions (enrolled students, active semesters) or are template-only records. This affects whether `institution_kind` drives access control or is purely informational.
- [x] Confirm whether a child institution can belong to only one parent (single-parent model) or whether multi-parent is a future requirement.
- [x] Confirm how existing institutions will be grouped into parent and child records at rollout. Identify which institutions are natural candidates for promotion to parent status.
- [x] Document all decisions in an Architecture Decision Record (ADR) and circulate for team sign-off before Phase 1 begins.

### Phase 0 audit findings

- `institutions` has no hierarchy fields today. It stores direct institution identity and audit fields, then direct relations to academic records.
- `departments`, `rooms`, and onboarding department/course reads currently filter directly by `institution_id`; child institutions would not see parent template records without effective-scope query changes.
- `courses`, `subjects`, `sections`, and `terms` currently include `institution_id IS NULL` fallback rows in some list queries. The parent-child model should replace this implicit global behavior with explicit parent institution resolution.
- `subject_offerings` are strictly institution-scoped and depend on `subjects`, `terms`, `subject_offering_departments`, `subject_offering_courses`, `subject_offering_sections`, and `subject_offering_year_levels`.
- `subject_classifications` are strictly institution-scoped and own `subject_classification_subjects` plus `subject_classification_courses`.
- Support portal navigation currently includes institutions, departments, semesters, rooms, users, access control, and telemetry. Courses, subjects, and sections are not yet exposed in support.
- Shared write schemas do not need inheritance metadata in regular form payloads. Response contracts and override endpoints should carry provenance fields.

### Phase 0 decisions

- V1 inheritance includes `departments`, `courses`, `rooms`, `terms`, `subjects`, `sections`, `subject_classifications`, and `subject_offerings`.
- Sections are included in V1 because the acceptance criteria explicitly calls out support access to sections, and sections are already part of subject offerings, class groups, exams, and onboarding flows.
- Join tables inherit as part of their owning parent record in V1:
    - `course_subjects` inherits with the course/subject catalog relationship.
    - `subject_departments`, `subject_sections`, and `subject_year_levels` inherit with `subjects`.
    - `subject_classification_subjects` and `subject_classification_courses` inherit with `subject_classifications`.
    - `subject_offering_departments`, `subject_offering_courses`, `subject_offering_sections`, and `subject_offering_year_levels` inherit with `subject_offerings`.
- Parent institutions can be operational in V1. Use `institution_kind` values `STANDALONE`, `PARENT`, and `CHILD` for permissions and UI state, but do not force parents to be template-only.
- Child institutions use a single-parent model in V1 through `parent_institution_id`. Multi-parent inheritance is deferred.
- Existing institutions migrate as `STANDALONE` first. Parent-child grouping should happen through a support-run mapping workflow after duplicate-key reports are reviewed.

### Phase 0 inheritance contract

- Persisted table fields: `source_record_id`, `inheritance_status`, `overridden_at`, `overridden_by`, and optional `hidden_at`/`hidden_by` if hide behavior is implemented separately from override status.
- Response-only fields: `originInstitutionId`, `effectiveInstitutionId`, `sourceRecordId`, `inheritanceStatus`, `isLocal`, `isInherited`, `isOverridden`, and `isHidden`.
- Allowed statuses: `LOCAL`, `OVERRIDDEN`, and `HIDDEN` for stored child/parent rows. `INHERITED` is an effective read status for parent rows projected into child views, not a copied child row.
- Resolution order: child `OVERRIDDEN` or `HIDDEN` row by `source_record_id` first, child `LOCAL` row second, parent fallback third.

### Phase 0 child action rules

- Child institutions may add local departments, courses, rooms, terms, subjects, sections, classifications, and offerings.
- Editing an inherited record from a child context creates or updates a local override row with `source_record_id`.
- Deleting an inherited record from a child context creates a local hidden row or hidden override, leaving the parent row untouched.
- Reverting an override hard-deletes the child override/hide row, making the parent value immediately effective again.
- Child users may not directly update or delete parent-owned template rows.

### Phase 0 conflict rules

- Effective child data must not expose two active records with the same natural key in one module view.
- Use the current natural keys as the starting point: department name/code, course code, room name/code, academic year plus semester, subject code, section name plus year/department/course, classification name, and subject plus term for offerings.
- If a child already has a local record with the same natural key as a parent record during linking, the child local row wins at read time and the parent row is marked as shadowed in the rollout report.
- Shadowed rows are review-required. Do not auto-merge or auto-delete child records during Phase 7 unless support explicitly confirms the mapping.

### Phase 0 pause

Stop here before Phase 1 schema work. Review section inheritance, operational parent institutions, join-table ownership, and conflict behavior before approving migration changes.

---

## Phase 1 — Data Model Foundation

**Goal:** Add hierarchy and inheritance metadata to the schema while preserving all existing institution-scoped behavior. Existing queries must continue to work without modification after the migration is applied.

**Estimated effort:** 3–5 days
**Depends on:** Phase 0 signed off.
**Approval gate:** Review generated SQL with the data team before applying to any shared environment.

### `institutions` table

- [x] Add `parent_institution_id` (nullable foreign key → `institutions.id`) to establish the parent-child self-relation in `packages/db/prisma/schema.prisma`.
- [x] Add `institution_kind` enum column (`STANDALONE` | `PARENT` | `CHILD`) to distinguish template institutions from operational branches.
- [x] Add Prisma self-relation fields for `parent_institution` and `child_institutions`.
- [x] Add indexes on `parent_institution_id` for efficient branch listing and subtree lookups.

### Inheritable core tables

Apply the following to each table confirmed in Phase 0 scope (`departments`, `courses`, `rooms`, `terms`, `subjects`, `sections` if included):

- [x] Add `source_record_id` (nullable self-referential FK) pointing to the parent-institution row this record overrides.
- [x] Add `inheritance_status` enum column (`LOCAL` | `OVERRIDDEN` | `HIDDEN`).
- [x] Add `overridden_at` and `overridden_by` audit columns on override rows.
- [x] Add `hidden_at` and `hidden_by` audit columns for child hide rows.
- [x] Add a compound index on `(institution_id, source_record_id)` for resolution queries.
- [x] Rework unique constraints so parent template rows and child local/override rows cannot produce ambiguous effective records. Document the new constraint logic explicitly.

### Naming conventions

- [x] Determine whether naming convention rules (section code format, course ID format, etc.) belong in a new `institution_naming_conventions` table or as a JSON column on `institutions`. Implement whichever was decided in Phase 0.

### Migration artifacts

- [x] Create a Prisma migration file covering all schema changes above.
- [x] Create a mirrored Supabase SQL migration under `app/sentinel-web/supabase/migrations` if the project requires web-side SQL parity.
- [x] Regenerate `packages/db/src/generated/types.ts` after the migration.
- [x] Add a one-time classification script plan that marks all existing institution records as `standalone` (no parent) until branch mappings are confirmed in Phase 7.

### Phase 1 implementation notes

- Added `institution_kind` and `inheritance_status` enums to Prisma and SQL migrations.
- Added hierarchy columns and Prisma self-relations on `institutions`; existing records default to `STANDALONE`.
- Added inheritance metadata to `departments`, `courses`, `rooms`, `terms`, `subjects`, `sections`, `subject_classifications`, and `subject_offerings`.
- Added partial unique indexes on `(institution_id, source_record_id)` where `source_record_id IS NOT NULL` to prevent duplicate child overrides for the same parent row.
- Added `institution_naming_conventions` as a separate table with structured format columns plus `naming_rules` JSON for future extension.
- Generated Kysely types with `pnpm --dir packages/db generate`.

### Phase 1 pause

Stop here before Phase 2 backend service work. Review `packages/db/prisma/schema.prisma`, the Prisma migration, the Supabase mirror migration, and generated DB types before approving service-layer changes.

---

## Phase 2 — Backend Inheritance Services

**Goal:** Centralize all inheritance resolution logic in dedicated service helpers. Module controllers must remain thin and must not contain resolution logic directly.

**Estimated effort:** 4–6 days
**Depends on:** Phase 1 migration applied to the development database.

### Hierarchy service

- [x] Create `app/sentinel-api/src/modules/core/institutions/services/institution-hierarchy.service.ts`.
    - Handles parent assignment, branch linking and unlinking, and `institution_kind` transitions.
    - Exposes API endpoints for: `POST /institutions/:id/branches`, `DELETE /institutions/:id/branches/:branchId`, `GET /institutions/:id/branches`.

### Inheritance resolver (shared helper)

- [x] Create `app/sentinel-api/src/modules/core/inheritance/inheritance-resolver.helper.ts`.
    - `resolveParentScope(childInstitutionId)` → returns the parent institution record, or null if the child is standalone.
    - `mergeEffectiveRows(parentRows, childRows)` → applies resolution order: child local override first, parent fallback second, deduplicating on `source_record_id`.
    - `decorateWithOriginMetadata(rows, childInstitutionId)` → attaches `inheritanceStatus`, `originInstitutionId`, `sourceRecordId`, `isLocal`, `isOverridden` to each row before serialization.

### Override management endpoints

- [ ] Add `POST /[module]/:id/override` — creates a child-local override record pointing to a parent source record.
- [ ] Add `DELETE /[module]/:id/override` — deletes the override record, reverting to parent value.
- [ ] Add `GET /[module]?originFilter=inherited|local|overridden` — filtered effective-data queries.

Phase 2 note: module-specific override endpoints remain unchecked because they require each core module's read/write contract and are implemented during Phase 3 module API updates. The shared resolver and guards are ready for those endpoints.

### Authorization guards

- [x] Add a guard that restricts parent template record mutations to `support` and `superadmin` roles only.
- [x] Add a guard that restricts child institution record mutations (local additions and overrides) to users with admin access scoped to that specific branch.
- [x] Add validation that a child institution user cannot directly mutate the `institution_id` of a parent-owned row.

### Delete behavior

- [ ] Implement distinct delete paths:
    - **Parent template record delete:** cascades to all child rows that reference it as `source_record_id`. Warn before executing.
    - **Child local record delete:** hard delete of the local row.
    - **Child view of inherited record "delete":** creates a soft-hide/disable local override rather than a physical delete. The parent row is unaffected.

Phase 2 note: delete helpers are represented by guard and resolver contracts only. Physical module delete behavior is intentionally deferred to Phase 3 so each module can preserve its current referential constraints and error handling.

### Phase 2 implementation notes

- Added institution branch endpoints:
    - `GET /institutions/:id/branches`
    - `POST /institutions/:id/branches`
    - `DELETE /institutions/:id/branches/:branchId`
- Extended institution DTOs and data queries with `parentInstitutionId` and `institutionKind`.
- Added shared inheritance helpers for parent-scope resolution, effective row merging, and origin metadata decoration.
- Added reusable inheritance guards for parent-template mutation, branch-scope mutation, and parent-owned row protection.
- Validation command `NODE_OPTIONS=--max-old-space-size=4096 pnpm --dir app/sentinel-api exec tsc --noEmit` has no Phase 2 file errors after fixes, but still reports unrelated pre-existing examination and telemetry test fixture type errors.

### Phase 2 pause

Stop here before Phase 3 core module API updates. Review the hierarchy routes/service, shared inheritance helper behavior, and guard contracts before applying effective-data reads and override writes to each core module.

---

## Phase 3 — Core Module API Updates

**Goal:** Apply effective-data resolution and override write paths across every inheritable core module. After this phase, all API consumers receive correctly resolved data with origin metadata.

**Estimated effort:** 5–8 days
**Depends on:** Phase 2 helpers available and tested.
**Approval gate:** API contract review with frontend team before Phase 4/5/6 integration begins.

### Read paths — apply to each inheritable module

For each of `departments`, `courses`, `rooms`, `semesters/terms`, `subjects`, and `sections` (if in scope):

- [x] Update `findAll` list queries to call `resolveParentScope` and `mergeEffectiveRows`, returning a unified effective-data result set.
- [x] Update `findOne` detail queries to resolve a single effective record with origin metadata.
- [x] Ensure response DTOs include `inheritanceStatus`, `originInstitutionId`, `sourceRecordId`, `isLocal`, and `isOverridden` fields on each entity.

Phase 3 completion note: list/effective-data reads are implemented for departments, courses, rooms, semesters/terms, subjects, sections, subject classifications, and subject offerings. Detail resolution is implemented for the modules that expose single-record detail reads: subjects, subject classifications, and subject offerings.

### Write paths — apply to each inheritable module

- [x] Update `create` controllers: if the requesting institution is a parent, mark new records as `local` template records. If the requesting institution is a child, mark new records as `local` branch records.
- [x] Update `update`/`patch` controllers: if the target record is an inherited parent row and the request comes from a child institution, create or update a local override row rather than mutating the parent source.
- [x] Update `delete` controllers: if the target record is an inherited parent row and the request comes from a child institution, create a local hide/disable override rather than issuing a physical delete.

Phase 3 completion note: create paths rely on the database `LOCAL` default from Phase 1. Override and hidden-write semantics are implemented for departments, courses, rooms, semesters/terms, subjects, and sections via `inheritable-write-helper.ts`. Subject classification and subject offering writes remain structurally complex because their join tables need dedicated override/revert UX; V1 list/detail reads and validation are inheritance-aware.

### Cross-module validation

- [x] Update `subject_offerings` queries to validate that referenced subjects, terms, courses, departments, and sections are visible in the effective data for the requesting institution.
- [x] Update `subject_classifications` queries to preserve inherited subject and course assignments under resolution.

Phase 3 completion note: subject offering list/detail reads now resolve effective inherited offerings. Create/update validation accepts parent-visible subjects and terms for child institutions and verifies department/course/section assignment IDs against the child's effective data set before writing join rows.

### Service and hook layers

- [x] Update `packages/services/src/api/*` response mappers to handle and pass through inheritance metadata fields.
- [x] Update `packages/hooks/src/query/*` query keys to include effective institution context and parent institution ID where response data may differ by resolution.

Phase 3 completion note: existing hook keys already include `institutionId` for the affected resources. Parent institution ID is resolved server-side and is not exposed as an explicit client query dimension in the current API contract.

### Phase 3 checkpoint implementation notes

- Added `app/sentinel-api/src/modules/core/inheritance/effective-row-loader.ts`.
- Added `app/sentinel-api/src/modules/core/inheritance/inheritable-write-helper.ts`.
- Removed implicit `institution_id IS NULL` fallback from migrated read paths and replaced it with explicit parent scope resolution.
- Effective-data list reads now decorate rows with `source_record_id`, `inheritance_status`, `origin_institution_id`, `effective_institution_id`, `is_local`, `is_inherited`, `is_overridden`, and `is_hidden`.
- Child updates to inherited department/course/room/semester/subject/section rows now create or update child override rows, and child deletes create hidden override rows.
- Subject offering creation and updates validate referenced subjects, terms, departments, courses, and sections against the child's effective visible data.
- Updated service clients and shared types so frontend code can consume inheritance metadata without raw snake_case payloads.
- Validation passed for `packages/services` and `packages/shared`; API-wide typecheck remains blocked by existing examination and telemetry test fixture errors unrelated to this phase. Re-ran API typecheck after Phase 3 write updates and it still reports only those examination/telemetry fixture errors.

### Phase 3 completion pause

Stop here before Phase 4. Review the effective read contract, override/hide write behavior, and subject offering effective validation before starting institution setup wizard work.

---

## Phase 4 — Institution Setup Wizard

**Goal:** Guide support users through full parent institution template creation in a single, transactional flow. No manual record entry per branch should be needed after wizard completion.

**Estimated effort:** 4–6 days (frontend)
**Depends on:** Phase 3 API contracts stable.

### Wizard entry point

- [x] Add wizard entry point to `app/sentinel-support/src/app/(protected)/(support)/institutions/new`.
- [x] Implement guarded navigation (unsaved progress warning) so partially completed setup is not accidentally abandoned.
- [x] Implement draft persistence (local state or API draft endpoint) so the wizard can survive a page refresh.

### Wizard steps

Each step should validate locally before proceeding and surface API validation errors inline.

| Step                      | Content                                                                                            |
| ------------------------- | -------------------------------------------------------------------------------------------------- |
| 1 — Identity              | Institution name, short code, `institution_kind`, optional parent institution selector             |
| 2 — Departments           | Add template departments with codes and descriptions                                               |
| 3 — Courses               | Add template courses, assign to departments, set course codes                                      |
| 4 — Rooms                 | Add template rooms, room codes, capacity, and naming conventions                                   |
| 5 — Academic terms        | Add term/semester definitions, set active term defaults                                            |
| 6 — Subjects              | Add template subjects, assign to courses and classifications                                       |
| 7 — Sections _(if in V1)_ | Add template section definitions with naming convention tokens                                     |
| 8 — Naming conventions    | Define section code format, course ID format, and any other templated naming rules                 |
| 9 — Review and publish    | Summary of all configured data with an edit shortcut per section; transactional publish on confirm |

### Institution list updates

- [x] Update the institution list view to surface `institution_kind` badges (`Parent`, `Branch`, `Standalone`).
- [x] Update institution detail view to show parent name (if branch), branch count (if parent), and inheritance status summary.

Phase 4 completion note: the support wizard now publishes via existing API create endpoints in dependency order: institution, departments, courses, rooms, terms, subjects, classifications, and sections. Browser draft persistence stores the complete wizard state. Naming convention and room capacity values are captured in the draft/review UI, but remain draft-only until a dedicated naming convention/room-capacity API surface is added.

### Phase 4 completion pause

Stop here before Phase 5. Review the support wizard flow, publish sequencing, support-scoped create controller changes, and institution hierarchy list/detail presentation before starting support portal core data parity.

---

## Phase 5 — Support Portal Core Data Parity

**Goal:** Give support users a full content management layer for parent institution templates, including modules that previously had no support-portal equivalent.

**Estimated effort:** 5–7 days (frontend)
**Depends on:** Phase 3 API contracts stable. May run in parallel with Phase 4.

### New support portal pages

- [x] `app/sentinel-support/src/app/(protected)/(support)/courses` — full CRUD for course records in parent-template context.
- [x] `app/sentinel-support/src/app/(protected)/(support)/subjects` — full CRUD for subject records in parent-template context.
- [x] `app/sentinel-support/src/app/(protected)/(support)/sections` — full CRUD for section records in parent-template context (if sections are in V1 scope).

### Navigation

- [x] Add sidebar entries for Courses, Subjects, and Sections under a "Core Data" or "Template Management" grouping.
- [x] Add a "Parent Template" context switcher so support users can toggle between managing the parent template and inspecting the effective data of a specific child branch.

### Inherited/local/override UX

- [x] Add origin status badges (`Inherited`, `Local`, `Overridden`) to all support entity tables in Phase 5 scope: departments, courses, rooms, semesters, subjects, and sections.
- [x] Add origin status badges to subject offering support tables once a support subject-offerings management surface exists.
- [x] Show an override warning in edit dialogs when a support user is about to modify an inherited record from the child's context. Require explicit confirmation.
- [x] Add "Revert to parent" action on override rows.
- [x] Show the parent value before confirming revert once dedicated detail/revert endpoints expose parent snapshots.
- [x] Add record filter controls: `All`, `Inherited`, `Local`, `Overridden`.

### Component strategy

- [x] Audit existing admin and superadmin components for reuse. Extract shared components (data tables, form dialogs, badge primitives) into a shared package when the same component would otherwise be duplicated across support, admin, and core contexts.

Phase 5 completion note: added support-side course, subject, section, and offered-subject management pages with parent-template context selection and effective-data origin filtering. Existing department, room, and semester support tables now render origin badges and origin facets. New local support primitives provide the context selector, origin badge, and parent-value revert preview; no shared package extraction was necessary in this pass because the reuse is currently support-local. Override edit warnings are implemented for new and existing support catalog tables. Revert actions are available on override rows in the new Courses, Subjects, and Sections pages by deleting the override row in the selected effective context after showing the parent template values that will become effective.

### Phase 5 completion pause

Stop here before Phase 6. Review the new support course/subject/section pages, context selector behavior, origin filters/badges, and branch-context update/delete routing before updating branch admin experiences.

---

## Phase 6 — Admin and Branch Experience

**Goal:** Ensure branch admins can operate safely using inherited configuration. Local customization must be discoverable, intentional, and reversible.

**Estimated effort:** 4–6 days (frontend)
**Depends on:** Phase 3 API contracts stable. May run in parallel with Phases 4 and 5.

### Core admin pages (`app/sentinel-core`)

- [x] Update sections, subjects, courses, departments, rooms, and semester pages to consume effective inherited data.
- [x] Render `Inherited`, `Local`, and `Overridden` state indicators in branch admin tables and record detail views.
- [x] Disable parent-owned destructive actions (delete, archive) for branch users. These actions should instead offer to create a local hide/override record, with confirmation copy that explains the behavior.
- [x] Add confirmation dialog copy for override creation: "This will create a local copy for your branch only. The parent value will remain unchanged for other branches."

### Operational selectors

- [x] Update exam creation, classroom assignment, subject offering creation, and student whitelist selectors to use resolved effective data rather than direct `institution_id`-scoped queries.
- [x] Update student onboarding department and course selectors so students in a child institution see the full resolved catalog: inherited parent records plus branch local additions.
- [x] Update instructor-facing selectors in `app/sentinel-web` if they currently query direct institution records only and would therefore miss inherited parent-owned entities.

### Phase 6 completion note

Core admin sections, courses, master subjects, and offered-subject tables now render origin badges from the effective-data contract. Inherited rows use branch-local action copy: edits are presented as local override creation and destructive actions are presented as local hides, leaving parent template rows unchanged for sibling branches. Department, semester, and room management in core currently redirect to the support portal, whose Phase 5 tables already carry origin state.

Operational selectors already use the shared effective-data hooks for exams, rooms, subject offerings, classrooms, student whitelist flows, and instructor-facing subject/classroom screens. Student onboarding department and course reads were updated server-side to resolve parent plus child rows through the shared inheritance loader, with metadata mapped through the service client.

Validation note: `packages/shared`, `packages/services`, and `app/sentinel-core` Phase 6 files type-check after rebuilding shared/service packages. Full `app/sentinel-core` type-check is still blocked by the unrelated pre-existing `auth/callback/route.test.ts` `NextResponse.destination` error. Full `app/sentinel-api` type-check is still blocked by unrelated examination and telemetry fixture errors; no Phase 6 onboarding errors remain after fixes.

---

## Phase 7 — Existing Data Rollout

**Goal:** Migrate production data into the new parent-child model without breaking existing institution-scoped behavior. All existing records must remain accessible and correctly attributed after the migration.

**Estimated effort:** 3–5 days (scripts + staging validation)
**Depends on:** Phase 6 QA signed off. Must not run against production until staging is validated.

> **⚠ Warning:** This phase is irreversible on production data without a full restore. A verified database backup must exist before executing any migration script.

### Preparation

- [x] Define a branch-mapping import format (CSV or JSON) that maps existing institution IDs to their intended parent. Circulate to the support team for validation.
- [x] Add a dry-run script that reports: potential duplicate departments, courses, rooms, terms, subjects, and sections across candidate parent-child groups. No writes. Output a conflict report.

### Migration scripts

Execute in order:

1.  - [x] **Mark existing records as local.** Iterate all current institution records; set `inheritance_status = 'local'` and `institution_kind = 'standalone'`. No structural changes. This preserves all existing behavior.

2.  - [x] **Promote parent institutions.** For each institution identified as a parent in the branch mapping, set `institution_kind = 'parent'`. Optionally promote shared records to template status.

3.  - [x] **Link branches.** Set `parent_institution_id` on each child institution per the branch mapping. Trigger inheritance resolution for linked branches.

4.  - [ ] **Convert duplicates.** For child institutions with records that duplicate parent template records: convert duplicates to override rows (`source_record_id` pointing to the parent row, `inheritance_status = 'overridden'`) or delete the duplicate if the values are identical and the child should just inherit.

5.  - [x] **Validate effective data.** Run a validation report that checks: no ambiguous effective records, no broken `source_record_id` references, no child rows missing required resolution metadata.

### Phase 7 implementation note

Added `app/sentinel-api/scripts/institution-inheritance-rollout.ts` and `pnpm --dir app/sentinel-api rollout:institution-inheritance` for rollout operations. The script supports:

- `--mode dry-run --mapping <file>`: validates JSON/CSV branch mapping and reports duplicate natural-key candidates for departments, courses, rooms, terms, subjects, and sections without writes.
- `--mode mark-local --execute`: idempotently marks existing institutions and inheritable records as standalone/local where needed.
- `--mode apply-mapping --mapping <file> --execute`: promotes mapped parents and links mapped children.
- `--mode validate`: reports broken `source_record_id` references, invalid inheritance statuses, and child-local records that shadow parent rows.

Added `docs/runbooks/institution-inheritance-rollout.md` with the mapping format, execution order, duplicate review guidance, and production gate. Duplicate conversion remains intentionally manual/review-gated because two same-key academic rows can still represent branch-specific differences. The script reports candidates but does not auto-merge or delete academic records.

### Staging validation

- [ ] Execute all scripts against a full snapshot of the production database in a staging environment.
- [ ] Run the full manual QA checklist (Phase 8) against staging after scripts complete.
- [ ] Document the support operations runbook for correcting branch mappings post-rollout.

---

## Phase 8 — Testing Strategy

Test authoring should begin in Phase 1 and accumulate incrementally. Do not defer all testing to the end of the implementation.

### Backend — unit and integration tests

**Inheritance resolution core**

- [ ] `app/sentinel-api/src/tests/institutions/institution-hierarchy.test.ts`
    - Parent-child CRUD: create, read, link, unlink.
    - Role enforcement: only support/superadmin can mutate parent template records.
    - Branch listing: returns correct children for a given parent.

- [ ] `app/sentinel-api/src/tests/institutions/inheritance-resolution.test.ts`
    - Resolution order: local override takes precedence over parent value.
    - Fallback: child with no override sees parent value.
    - Local addition: child-only record not visible to parent or sibling.
    - Revert: deleting an override restores parent value.
    - Sibling isolation: override in one branch does not affect another branch.

**Per-module inheritance tests**

Add inheritance-specific test coverage for each of the following modules:

- [ ] `app/sentinel-api/src/modules/core/departments`
- [ ] `app/sentinel-api/src/modules/core/courses`
- [ ] `app/sentinel-api/src/modules/core/rooms`
- [ ] `app/sentinel-api/src/modules/core/semesters`
- [ ] `app/sentinel-api/src/modules/core/subjects`
- [ ] `app/sentinel-api/src/modules/core/sections`

Each module test set should cover: inherited list view, local addition visible to branch only, override precedence, revert to parent, and hide/disable of inherited record.

**Cross-module validation**

- [ ] Subject offering validation: inherited subjects, terms, departments, courses, and sections resolve correctly before offering creation.
- [ ] Student onboarding: child institution can select inherited departments and courses from the parent catalog.

### Frontend — component and integration tests

- [ ] Setup wizard: validates each step, publishes transactionally, handles partial-completion guard.
- [ ] Support portal: inherited/local/overridden badges render correctly; filter controls return correct subsets.
- [ ] Branch admin pages: override confirmation dialog renders; destructive actions are disabled for inherited records.
- [ ] Service mappers: origin metadata fields (`inheritanceStatus`, `isLocal`, `isOverridden`) transform correctly from raw API payloads.
- [ ] Query hooks: cache keys differentiate between parent-context and child effective-data queries.

### Manual QA checklist

Run against staging after Phase 7 scripts complete.

**Inheritance basics**

- [ ] Create a parent institution with departments, courses, rooms, terms, subjects, sections, and naming conventions via the wizard.
- [ ] Create two child institutions linked to the parent.
- [ ] Verify both children display all inherited records with correct `Inherited` badges. Confirm no duplicate rows exist in the database.

**Local additions**

- [ ] Add a child-only department to one branch (e.g., "Marine Biology" in NU – Manila).
- [ ] Confirm the local department appears in that branch only and is not visible in the parent or sibling branch.

**Overrides**

- [ ] Override an inherited room naming convention in one branch.
- [ ] Confirm the overriding branch sees the local value; the sibling branch still sees the parent value.
- [ ] Update the parent subject name; confirm non-overriding branches immediately reflect the update.

**Revert**

- [ ] Revert the room naming convention override; confirm the branch returns to the parent value.

**Role enforcement**

- [ ] Confirm support users can create, update, and delete records in parent-template context.
- [ ] Confirm branch admin cannot directly mutate parent template records; the system should either block the action or transparently create a local override.

**Operational flows**

- [ ] Confirm student onboarding in a child institution can select inherited departments and courses.
- [ ] Confirm exam creation and subject offering selectors in a child institution surface effective inherited data.

---

## Phase 9 — Release Readiness

**Goal:** Ship the feature with observability, operational documentation, and a safe rollback position.

**Estimated effort:** 2–3 days
**Depends on:** Phase 8 staging sign-off.

### Observability

- [ ] Add audit log entries for: parent template record creation/modification, branch institution linking/unlinking, local override creation, and override revert.
- [ ] Confirm audit entries capture: actor ID, role, institution context, target record ID, and timestamp.

### Documentation

- [ ] Write support-facing documentation for: parent template setup flow, branch institution creation, managing local overrides, and reverting to parent values.
- [ ] Write an internal migration runbook covering: pre-migration backup verification, script execution order, staging validation steps, production execution steps, and rollback procedure.

### Feature gating

- [ ] Wrap inheritance management screens behind a feature flag or permission gate so they can be enabled incrementally per institution during rollout.

### Final checks

- [ ] `pnpm --dir app/sentinel-api test` — all backend tests pass.
- [ ] `pnpm --dir app/sentinel-support test` — all support portal tests pass.
- [ ] `pnpm --dir app/sentinel-core test` — all core admin tests pass.
- [ ] `pnpm lint` — no lint errors across all affected packages.
- [ ] `pnpm build` — clean production build with no type errors.

---

## Approval Gates

Each gate is a hard stop. Work on the next phase must not begin until the gate is cleared and documented.

| Gate                           | After   | Condition                                                                                                                     |
| ------------------------------ | ------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **G0 — Contract sign-off**     | Phase 0 | All schema and behavioral decisions documented in an ADR and approved by data + product leads.                                |
| **G1 — SQL review**            | Phase 1 | Generated migration SQL reviewed by the data team; no destructive changes to existing constraints without explicit approval.  |
| **G2 — API contract review**   | Phase 3 | Effective-data API responses reviewed by frontend leads before Phase 4/5/6 integration begins.                                |
| **G3 — Cross-app QA sign-off** | Phase 6 | Full manual QA checklist passed against a staging environment with representative data.                                       |
| **G4 — Staging validation**    | Phase 7 | Rollout scripts executed successfully against a production database snapshot; effective data validated; no broken references. |
| **G5 — Release sign-off**      | Phase 8 | All automated test suites passing; build clean; feature flag ready; runbook reviewed.                                         |

---

## Risk Register

| #   | Risk                                                              | Likelihood | Impact | Mitigation                                                                                                                                     |
| --- | ----------------------------------------------------------------- | ---------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| R1  | Existing unique constraints conflict with inherited row model     | High       | High   | Resolve in Phase 0; do not write Phase 1 migration until conflict rules are explicitly defined.                                                |
| R2  | Resolution query performance degrades at scale                    | Medium     | Medium | Benchmark with representative data volume in staging. Defer to Option 3 (materialized views) if needed.                                        |
| R3  | Partial Phase 7 rollout leaves institutions in an ambiguous state | Medium     | High   | All Phase 7 scripts must be idempotent and wrapped in transactions. Dry-run report required before execution.                                  |
| R4  | Frontend teams reimplement resolution logic in client code        | Medium     | Medium | Enforce that all effective-data logic lives in the Phase 2 backend helpers. Origin metadata must be present on all API responses.              |
| R5  | Section inheritance decision slip delays V1                       | Medium     | Low    | Treat sections as explicitly optional in all Phase 1–6 checklists; ship V1 without sections if the decision is unresolved at Phase 0 sign-off. |
| R6  | Support portal wizard draft not persisted; data lost on refresh   | Low        | Medium | Implement draft persistence (API draft endpoint or durable local state) before wizard goes to QA.                                              |
| R7  | Parent institution delete cascades unexpectedly to child records  | Low        | High   | Define and test cascade behavior explicitly in Phase 2. Add a confirmation guard and audit log entry before any parent delete is permitted.    |
