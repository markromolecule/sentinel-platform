# Implementation Plan — Instructor-to-Classroom Assignment Flow Redesign

> **Task Summary**: Deep analysis of the [issue-hole-classroom.md](../context/issue-hole-classroom.md) system design document and phased implementation plan that closes all 10 identified design gaps in the Sentinel instructor-to-classroom assignment system.

> **Status**: PENDING REVIEW

---

## Current State Assessment

### What Exists Today

The current codebase has a **functional but minimal** assignment flow:

| Capability                                     | Status     | Location                                                                                          |
| ---------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------- |
| Classroom creation (from class_group)          | ✅ Works   | `app/sentinel-api/src/modules/core/classroom/classroom.service.ts`                                |
| Instructor assignment (by head instructor)     | ✅ Works   | `app/sentinel-api/src/modules/core/classroom/services/classroom-instructor-management.service.ts` |
| Subject offerings → class_groups auto-creation | ✅ Works   | `app/sentinel-api/src/modules/core/subject-offerings/subject-offerings.service.ts`                |
| Notification on instructor assignment          | ✅ Works   | `app/sentinel-api/src/modules/general/notification/notification.service.ts`                       |
| Enrollment request flow (student side)         | ✅ Works   | `app/sentinel-api/src/modules/identity/enrollments/enrollments.service.ts`                        |
| Audit logging on classroom actions             | ✅ Works   | `LogsService.createLog()` calls in classroom.service.ts                                           |
| Admin-role bypass for classroom access         | ✅ Works   | `classroom-access-query.service.ts`                                                               |
| Subject-instructor qualification check         | ❌ Missing | No model or logic exists                                                                          |
| Instructor self-service request/preference     | ❌ Missing | No module exists                                                                                  |
| Admin smart assignment dashboard               | ❌ Missing | `sentinel-core/classrooms` is basic CRUD                                                          |
| Conflict detection (schedule/double-assign)    | ❌ Missing | No schedule data in `class_groups`                                                                |
| Assignment staging / draft mode                | ❌ Missing | No draft status on assignments                                                                    |
| Instructor accept/reject assignment            | ❌ Missing | Assignments are unilateral                                                                        |
| Bulk assignment                                | ❌ Missing | Only single instructor assignment                                                                 |
| Load balancing / max-load rules                | ❌ Missing | No load-tracking mechanism                                                                        |
| Historical assignment archive                  | ❌ Missing | No term-based archival                                                                            |

---

## Key Design Decisions Required

| Decision                     | Recommended                      | Alternatives                         | Stakeholder        |
| ---------------------------- | -------------------------------- | ------------------------------------ | ------------------ |
| Assignment model             | Hybrid (immediate + acknowledge) | Unilateral-only / Full collaborative | System Architect   |
| Subject qualification source | Derived + Override               | Admin-only / Course-derived-only     | Admin / Policy     |
| Instructor request scope     | Subject offerings                | Specific classrooms / Open text      | Product Owner      |
| Mismatch handling            | WARN (configurable)              | BLOCK / ALLOW                        | Admin / Superadmin |
| Admin scope (V1)             | Global                           | Department-scoped                    | Superadmin         |
| Assignment staging           | Per-assignment status            | Batch/session-based                  | Admin UX           |

---

## Phased Implementation

### Phase 1: Schema Foundation & Assignment Status Workflow

- [x] Add `status`, `responded_at`, `justification`, `flag_reason` to `classroom_instructor_assignments`
- [x] Create `instructor_subjects` junction table
- [x] Create `instructor_subject_requests` table
- [x] Add new enums: `assignment_status`, `instructor_request_status`
- [x] Extend `notification_action_type` and `notification_resource_type` enums
- [x] Run migration

### Phase 2: API — Assignment Status & Instructor Qualification

- [x] Update assignment service with status workflow
- [x] Add subject qualification check (derived + explicit)
- [x] Create acknowledge/flag assignment endpoints
- [x] Write tests

### Phase 3: API — Instructor Subject Request System

- [x] Create request CRUD service (submit, review, cancel, list)
- [x] Create request endpoints
- [x] Write tests

### Phase 4: API — Instructor Qualification Management

- [x] Create qualification CRUD service
- [x] Create qualified-instructors query endpoint
- [x] Write tests

### Phase 5: API — Admin Assignment Dashboard Data

- [x] Create unassigned classrooms query
- [x] Create instructor load summary query
- [x] Create smart suggestions query
- [x] Create bulk assignment endpoint
- [x] Write tests

### Phase 6: Notification & Audit Expansion

- [ ] Add notification methods for all new workflows
- [ ] Extend audit logging
- [ ] Write tests

### Phase 7: RBAC Permission Seeds

- [ ] Seed new permission keys
- [ ] Assign to default roles
- [ ] Write tests

### Phase 8: Frontend — Instructor Assignment Acknowledgment (sentinel-web)

- [ ] Add status badges and acknowledge/flag buttons
- [ ] Create mutation hooks
- [ ] Write tests

### Phase 9: Frontend — Instructor Request Flow (sentinel-web)

- [ ] Create subject request page
- [ ] Create query and mutation hooks
- [ ] Write tests

### Phase 10: Frontend — Admin Assignment Dashboard (sentinel-core)

- [ ] Create assignment dashboard with unassigned classrooms panel
- [ ] Create instructor suggestion and load panels
- [ ] Create bulk assignment UI
- [ ] Write tests
