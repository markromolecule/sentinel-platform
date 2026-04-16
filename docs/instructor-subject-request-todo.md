# Instructor Subject Request Redesign Plan

## 1-3-1 Framing

### 1 Core Objective

- Replace the current single-target instructor request flow with a grouped, multi-target request builder that can support `GENERAL` and `CORE` subjects without sacrificing backend validation or request traceability.

### 3 Workstreams

- Product/UI: redesign the instructor request dialog to mirror the offer-subject targeting experience.
- Backend/Data: evolve the request contract so grouped audience selections can be flattened into valid section-based enrollment requests.
- Rollout/Validation: migrate safely without breaking the current instructor workflow while we phase in the new builder.

### 1 Execution Principle

- Classification changes the request experience, but offering scope remains the source of truth.

## Why This Is Needed

The current instructor request dialog is optimized for one department, one course, one year level, and then a list of sections. That works for narrow `CORE` requests, but it falls short when a subject is classified as `GENERAL` and legitimately serves multiple departments and courses.

Today, the system still behaves as if request targeting is single-path:

- one `department_id`
- one `course_id`
- one `year_level`
- many `section_ids`

That creates friction for:

- general education subjects
- cross-program offerings
- future subject classifications with broader scope

## Target End State

The instructor request flow should:

- show term and offering details clearly
- let instructors choose multiple departments, courses, year levels, and sections
- summarize the full request before submission
- flatten the grouped selection into valid section-based requests on the backend
- dedupe already-requested/already-enrolled sections
- remain constrained by the offered subject’s actual scope

## Phase Breakdown

## Phase 0: Groundwork

### Goals

- Document the redesign clearly.
- Make the backend request contract capable of grouped audience input.
- Keep the existing UI working while the new builder is being developed.

### Checklist

- [x] Add a detailed phased plan in docs.
- [x] Expose subject classifications in subject offering responses.
- [x] Make the enroll API accept grouped request scope inputs in addition to the legacy single-target payload.
- [x] Normalize grouped scope into section-based requests in the enrollment data layer.
- [ ] Add targeted automated tests for grouped scope normalization.

### Deliverables

- Updated docs plan
- Backward-compatible request payload foundation
- Backend-ready grouped request normalization

## Phase 1: Builder Data Model

### Goals

- Create a frontend form model for grouped targeting.
- Separate the future request-builder form type from the legacy single-target request form.

### Checklist

- [x] Create a dedicated instructor request-builder form schema with:
    - `subject_offering_id`
    - `department_ids`
    - `course_ids`
    - `year_levels`
    - `section_ids`
- [x] Add a request-builder default values file.
- [x] Keep the legacy single-target form in place until migration is complete.
- [x] Add helper utilities for:
    - selected label summaries
    - stable checkbox options
    - target count badges
    - grouped request preview text

### Notes

- The grouped builder schema should be used by the new offered-subject request dialog.
- The legacy `Request Offered Subject` dialog can be removed only after the new builder is stable.

## Phase 2: Multi-Target Request Dialog UI

### Goals

- Rebuild the instructor request dialog using the offer-subject interaction model.
- Make the request UI classification-aware.

### Checklist

- [x] Build a new `RequestOfferedSubjectBuilderDialog`.
- [x] Reuse the admin offer-subject layout pattern:
    - left column: offering details + request overview
    - right area: target selection panels
- [x] Add panels for:
    - departments
    - courses
    - year levels
    - sections
- [x] Add a term / offering summary card.
- [x] Add live selection counters for each targeting group.
- [x] Add a grouped request preview before submit.
- [x] Support search and select-all actions across each target panel.

### Classification Behavior

#### `GENERAL`

- [x] Do not auto-lock to the instructor’s home department.
- [x] Allow cross-department and cross-course targeting within the offering scope.
- [x] Present supportive copy explaining that the request can target multiple programs.

#### `CORE`

- [x] Keep tighter guided defaults where appropriate.
- [x] Allow narrower defaults from the instructor profile only when they are still valid for the offering.

## Phase 3: Filtering Rules and Target Resolution

### Goals

- Make filtering behave like the offer-subject builder while preserving request integrity.

### Checklist

- [x] Department choices should filter available courses.
- [x] Department and course choices should narrow visible year levels.
- [x] Department, course, and year level choices should narrow visible sections.
- [x] Selected sections should always remain inside the offering’s actual allowed section scope.
- [x] Reset dependent selections when upstream filters change.
- [x] Add support for “select all filtered” behavior in all target panels.

### Important Rule

- Subject classification can widen the available interaction mode.
- Subject offering scope still determines what is actually selectable.

## Phase 4: Submission and Grouping

### Goals

- Submit grouped requests from the new builder.
- Keep backend processing deterministic and auditable.

### Checklist

- [x] Submit grouped payload from the new builder dialog.
- [x] Normalize grouped scope to a resolved list of section IDs.
- [x] Reject empty resolved selections with a clear error message.
- [x] Dedupe against:
    - existing pending requests
    - already assigned instructor roles
- [x] Return grouped request metadata in the API response:
    - requested target departments
    - requested target courses
    - requested target year levels
    - resolved section count
    - new / existing / skipped counts

### Stretch Goal

- [ ] Add a preview endpoint to estimate how many sections will be requested before submission.

## Phase 5: Read Models and Request History

### Goals

- Make the requested subject list reflect grouped targeting cleanly.

### Checklist

- [x] Update enrollment request query output to include grouped target summaries.
- [x] Show target department/course/year level summaries alongside selected sections.
- [x] Ensure pending and approved rows reflect the resolved request scope, not just legacy single-value fields.
- [x] Improve request list wording for grouped requests:
    - e.g. “2 departments, 4 courses, 12 sections”

## Phase 6: UX Cleanup and Migration

### Goals

- Replace the legacy request dialog completely.
- Reduce confusion for instructors.

### Checklist

- [x] Swap the offered-page request action to the new builder dialog.
- [x] Swap the `/subjects` page request button to the new builder dialog as well.
- [x] Remove no-longer-needed single-target request UI components.
- [x] Keep permission and duplicate-request protections intact.
- [x] Add empty, loading, and partial-selection states that feel intentional and informative.

## Phase 7: Validation and Testing

### Backend

- [ ] Add tests for grouped scope normalization.
- [ ] Add tests for GE multi-target requests.
- [ ] Add tests for duplicate handling when some sections are already pending/enrolled.
- [ ] Add tests for invalid grouped combinations outside the offering scope.

### Frontend

- [x] Add tests for grouped target filtering behavior.
- [x] Add tests for classification-aware defaults.
- [x] Add tests for dialog summaries and button disabled states.

### Manual QA

- [ ] `CORE` subject with one department and one course
- [ ] `GENERAL` subject serving multiple departments
- [ ] `GENERAL` subject serving one department but multiple courses
- [ ] mixed request where some sections are already pending
- [ ] mixed request where some sections are already assigned

## Immediate Implementation Order

1. Backend grouped request contract and normalization
2. Dedicated instructor request-builder form model
3. New dialog layout based on the offer-subject builder
4. Target filtering + grouped submit
5. Request list/read-model cleanup
6. Remove the legacy request dialog

## Current Status

### Completed

- [x] Documented the redesign plan
- [x] Added classification data to subject offering responses
- [x] Added grouped request contract groundwork to the enroll API
- [x] Added backend resolution of grouped audience selections into section IDs

### Next Recommended Task

- [ ] Implement Phase 6 migration cleanup by replacing the legacy request entry points and removing obsolete single-target UI
