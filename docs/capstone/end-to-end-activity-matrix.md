# Sentinel End-to-End Telemetry, Audit, and Event-Tracking Matrix

This matrix documents the complete telemetry, audit logging, and operational event-tracking mapping for the `@app/sentinel-api` backend modules. It serves as the single source of truth for downstream systems including Audit Logs, Activity Feeds, Notifications, Reports, Analytics, and Operational Dashboards.

---

## 1. Identity & Access Control Domain (`/modules/identity/`)

### Module: `/modules/identity/auth/`

- **Core Responsibilities:** User authentication, portal registration, OAuth proxying, rate limiting, and session verification via Supabase.
- **Granular Traceability Mapping:**
    - **Controllers scanned:** `auth.controller.ts`
    - **Services scanned:** `auth.service.ts`
    - **Data Layer / Models scanned:** Direct Supabase Client Ingress
    - **Matrix:**
      | Layer | Operation / Activity | Sub-Activity / Lifecycle State | Triggered Event | Required Payload Metadata |
      | :--- | :--- | :--- | :--- | :--- |
      | _Controller_ | User Authentication | Login Attempt Success (Credentials) | `auth.login` | `userId`, `actorId`, `activeInstitutionId`, `details: { email, success: true, method: 'credentials' }`, `ipAddress` |
      | _Controller_ | User Authentication | Login Attempt Failure | `auth.failed_login` | `userId`, `details: { email, success: false, reason: string }`, `ipAddress` |
      | _Controller_ | User Authentication | OAuth login event tracking | `auth.login` | `userId`, `actorId`, `activeInstitutionId`, `details: { email, success: true, method: provider }`, `ipAddress` |
      | _Service_ | User Registration | Client SignUp via Supabase | `auth.register` | `details: { email, role: 'student', firstName, lastName }` |
- **Traceability Notes:** User logouts are handled on the client-side (Supabase token clearing) and do not hit backend ingress controllers, creating an auditing gap.

### Module: `/modules/identity/users/`

- **Core Responsibilities:** Student, instructor, and admin profile configurations, role resolution, and synchronization with parent school domains.
- **Granular Traceability Mapping:**
    - **Controllers scanned:** `create-user.controller.ts`, `delete-user.controller.ts`, `invite-user.controller.ts`, `update-user.controller.ts`, `get-user.controller.ts`, `get-users.controller.ts`, `get-student-enrollment-detail.controller.ts`
    - **Services scanned:** `user-crud.service.ts`, `user-invite.service.ts`, `user-auth.service.ts`
    - **Data Layer / Models scanned:** `create-user.ts`, `delete-user.ts`, `update-user.ts`, `get-users.query.ts`
    - **Matrix:**
      | Layer | Operation / Activity | Sub-Activity / Lifecycle State | Triggered Event | Required Payload Metadata |
      | :--- | :--- | :--- | :--- | :--- |
      | _Controller / Service_| User Management | Invite New User | `user.invited` | `actorId`, `details: { email, role, inviteToken, expiresAt }` |
      | _Controller / Service_| Profile Setup | Complete User Ingress | `user.created` | `userId`, `actorId`, `details: { email, role, firstName, lastName, departmentId, courseId }` |
      | _Controller / Service_| Profile Setup | Update Profile Info | `user.updated` | `userId`, `actorId`, `details: { updatedFields }` |
      | _Controller / Service_| Profile Setup | Purge/Delete User Profile | `user.deleted` | `userId`, `actorId`, `details: { reason }` |
- **Traceability Notes:** User modifications are silent at the service layer; no unified `LogsService.createLog` hooks are active.

### Module: `/modules/identity/enrollments/`

- **Core Responsibilities:** Processing classroom and subject enrollments, instructor assignments, and administrative approval requests.
- **Granular Traceability Mapping:**
    - **Controllers scanned:** `approve-enrollment-request.controller.ts`, `reject-enrollment-request.controller.ts`, `unapprove-enrollment-request.controller.ts`, `delete-enrollment-requests.controller.ts`, `enroll-students.controller.ts`, `unenroll-student.controller.ts`, `enroll-subject.controller.ts`, `unenroll-instructor-subject.controller.ts`
    - **Services scanned:** `enrollments.service.ts`
    - **Data Layer / Models scanned:** `approve-enrollment-request.ts`, `unenroll-student.ts`, `enroll-students.ts`
    - **Matrix:**
      | Layer | Operation / Activity | Sub-Activity / Lifecycle State | Triggered Event | Required Payload Metadata |
      | :--- | :--- | :--- | :--- | :--- |
      | _Controller_ | Subject Mapping | Request Enrollment | `enrollment.requested` | `studentId`, `subjectOfferingId`, `details: { academicYear, semester }` |
      | _Controller / Service_| Enrollment Approval | Approve Request | `enrollment.approved` | `requestId`, `actorId`, `details: { studentId, subjectOfferingId }` |
      | _Controller / Service_| Enrollment Approval | Reject Request | `enrollment.rejected` | `requestId`, `actorId`, `details: { reason }` |
      | _Controller / Service_| Subject Mapping | Assign Instructor to Course | `instructor.enrolled` | `instructorId`, `subjectOfferingId`, `actorId` |
      | _Controller / Service_| Enrollment Purge | Unenroll Student | `enrollment.deleted` | `studentId`, `subjectOfferingId`, `actorId`, `details: { reason }` |
- **Traceability Notes:** Critical enrollment transitions lack logging coverage.

### Module: `/modules/identity/student-whitelist/`

- **Core Responsibilities:** Restricting student registrations to pre-approved student numbers linked to specific academic departments.
- **Granular Traceability Mapping:**
    - **Controllers scanned:** `create-student-whitelist.controller.ts`, `bulk-import-student-whitelist.controller.ts`, `update-student-whitelist.controller.ts`, `delete-student-whitelist.controller.ts`, `purge-student-whitelist.controller.ts`
    - **Services scanned:** `student-whitelist.service.ts`
    - **Data Layer / Models scanned:** `create-student-whitelist.ts`, `bulk-import-student-whitelist.ts`, `purge-student-whitelist.ts`
    - **Matrix:**
      | Layer | Operation / Activity | Sub-Activity / Lifecycle State | Triggered Event | Required Payload Metadata |
      | :--- | :--- | :--- | :--- | :--- |
      | _Controller / Service_| Whitelist Access | Create Whitelist Item | `whitelist.created` | `whitelistId`, `actorId`, `details: { studentNumber, departmentId }` |
      | _Controller / Service_| Whitelist Access | Bulk Import Items | `whitelist.imported` | `actorId`, `details: { importedCount, departmentId }` |
      | _Controller / Service_| Whitelist Access | Update Whitelist Item | `whitelist.updated` | `whitelistId`, `actorId`, `details: { studentNumber, newDepartmentId }` |
      | _Controller / Service_| Whitelist Access | Purge Whitelist | `whitelist.purged` | `actorId`, `details: { departmentId, deletedCount }` |
- **Traceability Notes:** Whitelist imports can change candidate registration eligibility; these require strict auditing.

### Module: `/modules/identity/onboarding/`

- **Core Responsibilities:** Academic context resolving, profile mapping, and onboarding completions.
- **Granular Traceability Mapping:**
    - **Controllers scanned:** `create-student.controller.ts`, `get-institutions.controller.ts`
    - **Services scanned:** `complete-student-onboarding.ts`, `assert-student-onboarding-eligibility.ts`
    - **Data Layer / Models scanned:** `create-student.ts`, `get-departments.ts`
    - **Matrix:**
      | Layer | Operation / Activity | Sub-Activity / Lifecycle State | Triggered Event | Required Payload Metadata |
      | :--- | :--- | :--- | :--- | :--- |
      | _Controller / Service_| User Onboarding | Complete Onboarding | `onboarding.completed` | `userId`, `institutionId`, `details: { studentNumber, courseId, departmentId }` |
- **Traceability Notes:** Failed eligibility onboarding attempts occur silently at the HTTP gateway layer.

---

## 2. Core Academic Setup Domain (`/modules/core/`)

### Module: `/modules/core/classroom/`

- **Core Responsibilities:** Instantiating school classrooms, assigning instructors, and tracking classroom rosters.
- **Granular Traceability Mapping:**
    - **Controllers scanned:** `create-classroom.controller.ts`, `update-classroom.controller.ts`, `assign-classroom-instructor.controller.ts`, `delete-classroom-student.controller.ts`
    - **Services scanned:** `classroom-write.service.ts`, `classroom-instructor-management.service.ts`
    - **Data Layer / Models scanned:** Kysely inserts to `classrooms`, `classroom_instructors`, `classroom_students`
    - **Matrix:**
      | Layer | Operation / Activity | Sub-Activity / Lifecycle State | Triggered Event | Required Payload Metadata |
      | :--- | :--- | :--- | :--- | :--- |
      | _Controller / Service_| Classroom Config | Create Classroom | `classroom.created` | `classroomId`, `actorId`, `details: { name, subjectOfferingId }` |
      | _Controller / Service_| Classroom Config | Update Classroom Settings | `classroom.updated` | `classroomId`, `actorId`, `details: { updatedFields }` |
      | _Controller / Service_| Roster Assign | Assign Instructor | `classroom.instructor_assigned` | `classroomId`, `instructorId`, `actorId` |
      | _Controller / Service_| Roster Assign | Remove Student from Class | `classroom.student_removed` | `classroomId`, `studentId`, `actorId` |
- **Traceability Notes:** Roster modifications directly affect who can access examinations.

### Module: `/modules/core/courses/`

- **Core Responsibilities:** Defining programs, program classifications, and mapping courses to institutions.
- **Granular Traceability Mapping:**
    - **Controllers scanned:** `create-course.controller.ts`, `update-course.controller.ts`
    - **Services scanned:** Internal CRUD helpers
    - **Data Layer / Models scanned:** `create-course.ts`, `delete-course.ts`, `update-course.ts`
      | Layer | Operation / Activity | Sub-Activity / Lifecycle State | Triggered Event | Required Payload Metadata |
      | :--- | :--- | :--- | :--- | :--- |
      | _Controller / Data_ | Program Setup | Create Program Course | `course.created` | `courseId`, `actorId`, `details: { courseCode, courseName, departmentId }` |
      | _Controller / Data_ | Program Setup | Update Program Details | `course.updated` | `courseId`, `actorId`, `details: { changedFields }` |
      | _Data Layer_ | Program Setup | Purge Course | `course.deleted` | `courseId`, `actorId` |

### Module: `/modules/core/departments/`

- **Core Responsibilities:** Faculty division setup and bulk imports.
- **Granular Traceability Mapping:**
    - **Controllers scanned:** `create-department.controller.ts`, `update-department.controller.ts`, `delete-department.controller.ts`, `create-bulk-departments.controller.ts`
    - **Services scanned:** `departments.service.ts`
    - **Data Layer / Models scanned:** `create-department.ts`, `delete-department.ts`, `create-bulk-departments.ts`
      | Layer | Operation / Activity | Sub-Activity / Lifecycle State | Triggered Event | Required Payload Metadata |
      | :--- | :--- | :--- | :--- | :--- |
      | _Controller / Service_| Division Setup | Create Department | `department.created` | `departmentId`, `actorId`, `details: { code, name }` |
      | _Controller / Service_| Division Setup | Bulk Import Departments | `department.imported` | `actorId`, `details: { count }` |
      | _Controller / Service_| Division Setup | Update Department | `department.updated` | `departmentId`, `actorId`, `details: { name }` |
      | _Controller / Service_| Division Setup | Delete Department | `department.deleted` | `departmentId`, `actorId` |

### Module: `/modules/core/inheritance/`

- **Core Responsibilities:** Applying configuration values (like timing rules) from parent institutions down to sub-branches.
- **Granular Traceability Mapping:**
    - **Controllers scanned:** None (Internal Business Helpers)
    - **Services scanned:** `effective-row-loader.ts`, `inheritance-resolver.helper.ts`
    - **Data Layer / Models scanned:** Recursive database scoping queries.
      | Layer | Operation / Activity | Sub-Activity / Lifecycle State | Triggered Event | Required Payload Metadata |
      | :--- | :--- | :--- | :--- | :--- |
      | _Service Layer_ | Configuration Scoping | Resolve Inherited Settings | `inheritance.resolved` | `targetId`, `resolvedSourceId`, `details: { key, value }` |

### Module: `/modules/core/institutions/`

- **Core Responsibilities:** Establishing schools, sub-branches, hierarchy permissions, and defining naming formats.
- **Granular Traceability Mapping:**
    - **Controllers scanned:** `create-institution.controller.ts`, `update-institution.controller.ts`, `delete-institution.controller.ts`, `link-institution-branch.controller.ts`, `unlink-institution-branch.controller.ts`, `save-institution-naming-convention.controller.ts`
    - **Services scanned:** `institution-hierarchy.service.ts`
    - **Data Layer / Models scanned:** `create-institution.ts`, `delete-institution.ts`, `save-naming-convention.ts`
      | Layer | Operation / Activity | Sub-Activity / Lifecycle State | Triggered Event | Required Payload Metadata |
      | :--- | :--- | :--- | :--- | :--- |
      | _Controller / Service_| Campus Setup | Create Institution | `institution.created` | `institutionId`, `actorId`, `details: { name, kind: 'PARENT'\|'CHILD' }` |
      | _Controller / Service_| Hierarchy Link | Link Branch Campus | `institution.branch_linked` | `parentId`, `childId`, `actorId` |
      | _Controller / Service_| Hierarchy Link | Unlink Branch Campus | `institution.branch_unlinked` | `parentId`, `childId`, `actorId` |
      | _Controller / Service_| Metadata Custom | Save Naming Convention | `institution.naming_convention_saved`| `institutionId`, `actorId`, `details: { structureSchema }` |

### Module: `/modules/core/rooms/`

- **Core Responsibilities:** Mapping physical examination rooms, testing facilities, and handling bulk imports.
- **Granular Traceability Mapping:**
    - **Controllers scanned:** `create-room.controller.ts`, `update-room.controller.ts`, `delete-room.controller.ts`, `bulk-create-rooms.controller.ts`
    - **Services scanned:** `create-room.service.ts`, `update-room.service.ts`, `delete-room.service.ts`, `bulk-create-rooms.service.ts`
    - **Data Layer / Models scanned:** `create-room.ts`, `update-room.ts`, `delete-room.ts`
      | Layer | Operation / Activity | Sub-Activity / Lifecycle State | Triggered Event | Required Payload Metadata |
      | :--- | :--- | :--- | :--- | :--- |
      | _Controller / Service_| Facility Setup | Create Testing Room | `room.created` | `roomId`, `actorId`, `details: { roomName, capacity }` |
      | _Controller / Service_| Facility Setup | Bulk Create Rooms | `room.imported` | `actorId`, `details: { count }` |
      | _Controller / Service_| Facility Setup | Update Room Specs | `room.updated` | `roomId`, `actorId`, `details: { changedFields }` |
      | _Controller / Service_| Facility Setup | Delete Testing Room | `room.deleted` | `roomId`, `actorId` |

### Module: `/modules/core/sections/`

- **Core Responsibilities:** Establishing section terms and bulk imports.
- **Granular Traceability Mapping:**
    - **Controllers scanned:** `create-section.controller.ts`, `update-section.controller.ts`, `delete-section.controller.ts`, `create-bulk-sections.controller.ts`
    - **Services scanned:** `sections.service.ts`
    - **Data Layer / Models scanned:** `create-section.ts`, `update-section.ts`, `delete-section.ts`
      | Layer | Operation / Activity | Sub-Activity / Lifecycle State | Triggered Event | Required Payload Metadata |
      | :--- | :--- | :--- | :--- | :--- |
      | _Controller / Service_| Roster Group | Create Section | `section.created` | `sectionId`, `actorId`, `details: { code, courseId }` |
      | _Controller / Service_| Roster Group | Bulk Import Sections | `section.imported` | `actorId`, `details: { count }` |
      | _Controller / Service_| Roster Group | Delete Section | `section.deleted` | `sectionId`, `actorId` |

### Module: `/modules/core/semesters/`

- **Core Responsibilities:** Term boundaries and active semester declarations.
- **Granular Traceability Mapping:**
    - **Controllers scanned:** `create-semester.controller.ts`, `update-semester.controller.ts`, `delete-semester.controller.ts`
    - **Services scanned:** `semesters.service.ts`
    - **Data Layer / Models scanned:** `create-semester.ts`, `update-semester.ts`, `deactivate-institution-semesters.ts`
      | Layer | Operation / Activity | Sub-Activity / Lifecycle State | Triggered Event | Required Payload Metadata |
      | :--- | :--- | :--- | :--- | :--- |
      | _Controller / Service_| Term Setup | Create Semester | `semester.created` | `semesterId`, `actorId`, `details: { termName, startAt, endAt }` |
      | _Controller / Service_| Term Setup | Update Term details | `semester.updated` | `semesterId`, `actorId`, `details: { changedFields }` |
      | _Data Layer_ | Term Setup | Deactivate other Semesters | `semester.deactivated` | `institutionId`, `details: { activeSemesterId }` |

### Module: `/modules/core/subject-classification/`

- **Core Responsibilities:** Classifying categories (e.g., General Education, Technical Core).
- **Granular Traceability Mapping:**
    - **Controllers scanned:** None (Controlled under database seeding)
    - **Services and Models scanned:** Classified mappings.
      | Layer | Operation / Activity | Sub-Activity / Lifecycle State | Triggered Event | Required Payload Metadata |
      | :--- | :--- | :--- | :--- | :--- |
      | _Data Layer_ | Catalog Class | Seed/Modify Classification | `classification.saved`| `classificationId`, `details: { categoryName }` |

### Module: `/modules/core/subject-offerings/`

- **Core Responsibilities:** Offering maps creation, mappings modifications, and bulk mapping configurations.
- **Granular Traceability Mapping:**
    - **Controllers scanned:** `create-subject-offering.controller.ts`, `create-subject-offerings-from-classification.controller.ts`, `update-subject-offering.controller.ts`, `delete-subject-offering.controller.ts`
    - **Services scanned:** `subject-offering-payload.service.ts`, `subject-offering-assignments.service.ts`
    - **Data Layer / Models scanned:** `create-subject-offering.ts`, `update-subject-offering.ts`, `delete-subject-offering.ts`
      | Layer | Operation / Activity | Sub-Activity / Lifecycle State | Triggered Event | Required Payload Metadata |
      | :--- | :--- | :--- | :--- | :--- |
      | _Controller / Service_| Course Catalog | Map Course Offering | `subject_offering.created`| `offeringId`, `actorId`, `details: { subjectId, semesterId }` |
      | _Controller / Service_| Course Catalog | Bulk Map Offerings | `subject_offering.imported`| `actorId`, `details: { count }` |
      | _Controller / Service_| Course Catalog | Update Map Details | `subject_offering.updated`| `offeringId`, `actorId`, `details: { yearLevels, sectionsCount }` |

### Module: `/modules/core/subjects/`

- **Core Responsibilities:** Setting up subject entities, credits mapping, and prerequisite relationships.
- **Granular Traceability Mapping:**
    - **Controllers scanned:** `create-subject.controller.ts`, `update-subject.controller.ts`, `delete-subject.controller.ts`, `delete-selected-subjects.controller.ts`
    - **Services scanned:** `subject-crud.service.ts`, `subject-assignments.service.ts`
    - **Data Layer / Models scanned:** `create-subject.ts`, `update-subject.ts`, `delete-subject.ts`
      | Layer | Operation / Activity | Sub-Activity / Lifecycle State | Triggered Event | Required Payload Metadata |
      | :--- | :--- | :--- | :--- | :--- |
      | _Controller / Service_| Catalog Setup | Create Course Subject | `subject.created` | `subjectId`, `actorId`, `details: { code, name, units }` |
      | _Controller / Service_| Catalog Setup | Update Subject Specs | `subject.updated` | `subjectId`, `actorId`, `details: { changedFields }` |
      | _Controller / Service_| Catalog Setup | Delete Subject | `subject.deleted` | `subjectId`, `actorId` |

---

## 3. Examination & Academic Management Domain (`/modules/examination/`)

### Module: `/modules/examination/access/`

- **Core Responsibilities:** Evaluating candidate eligibility factors before granting test ingress.
- **Granular Traceability Mapping:**
    - **Controllers scanned:** `verify-eligibility.controller.ts`
    - **Services scanned:** `access-gatekeeper.service.ts`
    - **Data Layer / Models scanned:** `entitlements.repository.ts`
      | Layer | Operation / Activity | Sub-Activity / Lifecycle State | Triggered Event | Required Payload Metadata |
      | :--- | :--- | :--- | :--- | :--- |
      | _Controller / Service_| Eligibility | Verify Student Access | `exam_access.eligibility_verified`| `studentId`, `examId`, `details: { isEligible, rejectionReasons: [] }` |

### Module: `/modules/examination/assessment/`

- **Core Responsibilities:** Main API check for candidate test bounds.
- **Granular Traceability Mapping:**
    - **Controllers/Services scanned:** `assessment-access.ts`
      | Layer | Operation / Activity | Sub-Activity / Lifecycle State | Triggered Event | Required Payload Metadata |
      | :--- | :--- | :--- | :--- | :--- |
      | _Service Layer_ | Assessment Ingress| Fetch Test Structure | `assessment.accessed` | `studentId`, `examId`, `details: { sectionsLoaded, durationAllowed }` |

### Module: `/modules/examination/assign/`

- **Core Responsibilities:** Dispatching examinations assignments to proctors and collecting feedback confirmations.
- **Granular Traceability Mapping:**
    - **Controllers/Services scanned:** `create-exam-assignment.ts`, `respond-to-exam-assignment.ts`, `get-exam-assignments.ts`
    - **Data Layer / Models scanned:** `close-other-pending-exam-assignments.ts`, `find-assignee-instructor.ts`
      | Layer | Operation / Activity | Sub-Activity / Lifecycle State | Triggered Event | Required Payload Metadata |
      | :--- | :--- | :--- | :--- | :--- |
      | _Service Layer_ | Roster Assignment | Assign Proctor to Exam | `exam_assign.created` | `examId`, `instructorId`, `actorId`, `details: { role: 'PROCTOR' }` |
      | _Service Layer_ | Proctor Feedback | Accept/Deny Assignment | `exam_assign.responded` | `examId`, `instructorId`, `details: { response: 'ACCEPTED'\|'DECLINED' }` |

### Module: `/modules/examination/builder/`

- **Core Responsibilities:** Working with proctor templates and drafts inside a modular playground workspace.
- **Granular Traceability Mapping:**
    - **Controllers scanned:** `save-builder-workspace.controller.ts`, `publish-builder-workspace.controller.ts`
    - **Services scanned:** `builder.service.ts`
      | Layer | Operation / Activity | Sub-Activity / Lifecycle State | Triggered Event | Required Payload Metadata |
      | :--- | :--- | :--- | :--- | :--- |
      | _Controller / Service_| Build Workspace | Save Builder Draft | `builder.draft_saved` | `examId`, `actorId`, `details: { changesSavedCount }` |
      | _Controller / Service_| Build Workspace | Publish Workspace Builder | `builder.published` | `examId`, `actorId`, `details: { activeQuestionsCount, activeSectionsCount }` |

### Module: `/modules/examination/configuration/`

- **Core Responsibilities:** Setting up proctoring configuration parameters, face detection sensitivity, eye tracking, copy-paste blockages, and window thresholds.
- **Granular Traceability Mapping:**
    - **Controllers scanned:** `update-exam-configuration.controller.ts`
    - **Services scanned:** `save-exam-configuration.ts`, `assert-exam-configuration-mutable.ts`
    - **Data Layer / Models scanned:** `get-global-settings.ts`
      | Layer | Operation / Activity | Sub-Activity / Lifecycle State | Triggered Event | Required Payload Metadata |
      | :--- | :--- | :--- | :--- | :--- |
      | _Controller / Service_| Security Specs | Update Exam Configuration | `exam_config.updated` | `examId`, `actorId`, `details: { blockCopyPaste, faceDetectionThreshold, limitDevicesCount }` |

### Module: `/modules/examination/flow/`

- **Core Responsibilities:** Processing start, progress heartbeats, and exam submissions.
- **Granular Traceability Mapping:**
    - **Controllers scanned:** `start-session.controller.ts`, `sync-session.controller.ts`, `complete-session.controller.ts`
    - **Services scanned:** `session-manager.service.ts`
    - **Data Layer / Models scanned:** `session.repository.ts` (writes to `exam_attempts` and `exam_responses`)
      | Layer | Operation / Activity | Sub-Activity / Lifecycle State | Triggered Event | Required Payload Metadata |
      | :--- | :--- | :--- | :--- | :--- |
      | _Controller / Service_| Attempt Session | Start Exam Session | `exam_flow.started` | `studentId`, `examId`, `attemptId`, `details: { ipAddress, browserAgent }` |
      | _Controller / Service_| Ingress Sync | Heartbeat / Answer Sync | `exam_flow.sync` | `attemptId`, `studentId`, `details: { elapsedSeconds, questionsCompletedCount }` |
      | _Controller / Service_| Attempt Session | Submit Exam Session | `exam_flow.completed` | `attemptId`, `studentId`, `details: { totalDuration, submissionType: 'TIMEOUT'\|'MANUAL' }` |

### Module: `/modules/examination/grading/`

- **Core Responsibilities:** Handling automated grading evaluations and proctor overrides.
- **Granular Traceability Mapping:**
    - **Controllers scanned:** `get-grading-students.controller.ts`
    - **Services scanned:** `grading.service.ts`
      | Layer | Operation / Activity | Sub-Activity / Lifecycle State | Triggered Event | Required Payload Metadata |
      | :--- | :--- | :--- | :--- | :--- |
      | _Service Layer_ | Score Process | Auto-Grade Submission | `grading.auto_complete` | `attemptId`, `details: { rawScore, percentage, integrityFlagsCount }` |

### Module: `/modules/examination/history/`

- **Core Responsibilities:** Returning historical exam lists and answer sheets details.
- **Granular Traceability Mapping:**
    - **Controllers scanned:** `get-exam-history.controller.ts`, `get-exam-history-detail.controller.ts`
    - **Services scanned:** `get-student-exam-history.ts`, `get-student-exam-history-detail.ts`
      | Layer | Operation / Activity | Sub-Activity / Lifecycle State | Triggered Event | Required Payload Metadata |
      | :--- | :--- | :--- | :--- | :--- |
      | _Controller / Service_| Catalog View | Read Answer Sheet History | `history.viewed` | `attemptId`, `actorId` (student/instructor) |

### Module: `/modules/examination/lobby/`

- **Core Responsibilities:** Tracking wait queue admissions and checks.
- **Granular Traceability Mapping:**
    - **Controllers scanned:** `check-in-lobby.controller.ts`, `update-admissions.controller.ts`
    - **Services scanned:** `check-in-lobby.ts`, `update-admissions.ts`
      | Layer | Operation / Activity | Sub-Activity / Lifecycle State | Triggered Event | Required Payload Metadata |
      | :--- | :--- | :--- | :--- | :--- |
      | _Controller / Service_| Queue Entrance | Lobby Entrance Check-in | `lobby.check_in` | `studentId`, `examId`, `details: { deviceApproved, integrityToken }` |
      | _Controller / Service_| Queue Admission | Proctor Approve Admittance | `lobby.admitted` | `examId`, `studentId`, `actorId`, `details: { decision: 'APPROVED'\|'REJECTED' }` |

### Module: `/modules/examination/monitoring/`

- **Core Responsibilities:** Surveillance pipelines for supervisors.
- **Granular Traceability Mapping:**
    - **Controllers scanned:** `get-exam-monitoring-overview.controller.ts`, `get-exam-monitoring-student.controller.ts`
    - **Services scanned:** `get-exam-monitoring-overview.ts`, `get-exam-monitoring-student-detail.ts`
      | Layer | Operation / Activity | Sub-Activity / Lifecycle State | Triggered Event | Required Payload Metadata |
      | :--- | :--- | :--- | :--- | :--- |
      | _Controller / Service_| Live Monitor | View Active Room Stream | `monitoring.stream_viewed` | `examId`, `actorId` (proctor), `details: { activeWebcamsCount }` |

### Module: `/modules/examination/reporting/`

- **Core Responsibilities:** Exporting exam outcomes and compilations.
- **Granular Traceability Mapping:**
    - **Controllers scanned:** `get-exam-report.controller.ts`
    - **Services scanned:** `get-exam-report.ts`
      | Layer | Operation / Activity | Sub-Activity / Lifecycle State | Triggered Event | Required Payload Metadata |
      | :--- | :--- | :--- | :--- | :--- |
      | _Controller / Service_| Reporting Output | Generate Exam Report | `reporting.exported` | `examId`, `actorId`, `details: { exportFormat: 'PDF'\|'CSV' }` |

### Module: `/modules/examination/runtime-access/`

- **Core Responsibilities:** Real-time access tokens adjustments.
- **Granular Traceability Mapping:**
    - **Controllers scanned:** `update-exam-runtime-access.controller.ts`
      | Layer | Operation / Activity | Sub-Activity / Lifecycle State | Triggered Event | Required Payload Metadata |
      | :--- | :--- | :--- | :--- | :--- |
      | _Controller Layer_ | Proctor Override | Update Session Runtime Token| `exam_runtime.access_updated`| `examId`, `studentId`, `actorId`, `details: { bypassKeyGranted }` |

### Module: `/modules/examination/student-overrides/`

- **Core Responsibilities:** Providing exception configurations for specific candidates.
- **Granular Traceability Mapping:**
    - **Controllers scanned:** `create-student-exam-access-override.controller.ts`, `override-reconnect-limit.controller.ts`
    - **Services scanned:** `student-overrides.service.ts`
      | Layer | Operation / Activity | Sub-Activity / Lifecycle State | Triggered Event | Required Payload Metadata |
      | :--- | :--- | :--- | :--- | :--- |
      | _Controller / Service_| Exception Assign | Grant Extra Time Override | `override.time_granted` | `examId`, `studentId`, `actorId`, `details: { extraMinutes }` |
      | _Controller / Service_| Exception Assign | Adjust Reconnect Attempts | `override.reconnect_adjusted` | `examId`, `studentId`, `actorId`, `details: { allowedAttempts }` |

### Module: `/modules/examination/exams/`

- **Core Responsibilities:** Creating, modifying, deleting exams, mapping sections, and writing audit logs.
- **Granular Traceability Mapping:**
    - **Controllers scanned:** `create-exam.controller.ts`, `update-exam.controller.ts`, `delete-exam.controller.ts`, `update-exam-status.controller.ts`
    - **Services scanned:** `create-exam.ts`, `update-exam.ts`, `delete-exam.ts`, `update-exam-status.ts`
    - **Data Layer / Models scanned:** `create-exam.ts`, `update-exam.ts`, `delete-exam.ts`, `replace-exam-questions.ts`, `replace-exam-sections.ts`
      | Layer | Operation / Activity | Sub-Activity / Lifecycle State | Triggered Event | Required Payload Metadata |
      | :--- | :--- | :--- | :--- | :--- |
      | _Service Layer_ | Exam Control | Create Exam | `exam.create` | `userId`, `actorId`, `resourceId` (exam*id), `activeInstitutionId`, `details: { title, questions, duration }` |
      | \_Service Layer* | Exam Control | Update Exam Settings | `exam.update` | `userId`, `actorId`, `resourceId` (exam*id), `activeInstitutionId`, `details: { changedFields }` |
      | \_Service Layer* | Exam Control | Delete Exam | `exam.delete` | `userId`, `actorId`, `resourceId` (exam*id), `activeInstitutionId` |
      | \_Service Layer* | Exam Control | Toggle Exam Active Status | `exam.status_updated` | `examId`, `actorId`, `details: { newStatus: 'ACTIVE'\|'INACTIVE' }` |

---

## 4. Content Creation & Banking Domain (`/modules/content/`)

### Module: `/modules/content/question/`

- **Core Responsibilities:** Question drafting, formatting validations, and archival actions.
- **Granular Traceability Mapping:**
    - **Controllers scanned:** `create-question.controller.ts`, `update-question.controller.ts`, `delete-question.controller.ts`
    - **Services scanned:** `question.service.ts`
    - **Data Layer / Models scanned:** `create-question.ts`, `update-question.ts`, `delete-question.ts`, `archive-questions.ts`
      | Layer | Operation / Activity | Sub-Activity / Lifecycle State | Triggered Event | Required Payload Metadata |
      | :--- | :--- | :--- | :--- | :--- |
      | _Controller / Service_| Question Drafting | Create Test Item Question | `question.created` | `questionId`, `actorId`, `details: { type, difficulty }` |
      | _Controller / Service_| Question Drafting | Update Question Content | `question.updated` | `questionId`, `actorId`, `details: { updatedFields }` |
      | _Data Layer_ | Question Drafting | Archive Question | `question.archived` | `questionId`, `actorId` |

### Module: `/modules/content/question-bank/`

- **Core Responsibilities:** Aggregating collections, usage counters, exposure limits, and difficulty calibrations.
- **Granular Traceability Mapping:**
    - **Controllers scanned:** `create-question-bank-collection.controller.ts`, `add-question-bank-collection-questions.controller.ts`, `remove-question-bank-collection-questions.controller.ts`, `update-question-bank-collection.controller.ts`, `delete-question-bank-collection.controller.ts`
    - **Services scanned:** `calibrate-question-difficulty.ts`, `check-exposure-threshold.ts`
    - **Data Layer / Models scanned:** `increment-question-usage.ts`, `update-question-actual-difficulty.ts`
      | Layer | Operation / Activity | Sub-Activity / Lifecycle State | Triggered Event | Required Payload Metadata |
      | :--- | :--- | :--- | :--- | :--- |
      | _Controller / Service_| Bank Management | Create Bank Collection | `bank.collection_created` | `bankCollectionId`, `actorId`, `details: { name }` |
      | _Controller / Service_| Roster Assign | Add Questions to Bank | `bank.questions_added` | `bankCollectionId`, `actorId`, `details: { questionsCount }` |
      | _Service Layer_ | exposure Control | Calibrate Item Difficulty | `question.calibrated` | `questionId`, `details: { previousDiff, rawSuccessRate, newDiff }` |

### Module: `/modules/content/question-collection/`

- **Core Responsibilities:** Mapping re-usable folders and questions sets.
- **Granular Traceability Mapping:**
    - **Controllers scanned:** `create-question-collection.controller.ts`, `add-question-collection-questions.controller.ts`, `remove-question-collection-questions.controller.ts`, `update-question-collection.controller.ts`, `delete-question-collection.controller.ts`
    - **Services scanned:** `create-question-collection.ts`, `add-questions-to-collection.ts`, `remove-questions-from-collection.ts`
      | Layer | Operation / Activity | Sub-Activity / Lifecycle State | Triggered Event | Required Payload Metadata |
      | :--- | :--- | :--- | :--- | :--- |
      | _Controller / Service_| Set Management | Create Question Collection | `collection.created` | `collectionId`, `actorId`, `details: { folderName }` |
      | _Controller / Service_| Set Management | Link Questions to Set | `collection.questions_added` | `collectionId`, `actorId`, `details: { questionsCount }` |

### Module: `/modules/content/question-type/`

- **Core Responsibilities:** Validating specific formats (Multiple Choice, Code execution, Essay).
- **Granular Traceability Mapping:**
    - **Controllers scanned:** `validate-question-type-content.controller.ts`
    - **Services scanned:** `question-type.service.ts`
      | Layer | Operation / Activity | Sub-Activity / Lifecycle State | Triggered Event | Required Payload Metadata |
      | :--- | :--- | :--- | :--- | :--- |
      | _Controller Layer_ | Schema Validate | Validate Question Content | `question_type.validated` | `actorId`, `details: { format: 'ESSAY'\|'CODE', isValid: true }` |

---

## 5. Telemetry & Observation Domain (`/modules/telemetry/`)

### Module: `/modules/telemetry/settings/`

- **Core Responsibilities:** Managing security rules configurations and active surveillance settings.
- **Granular Traceability Mapping:**
    - **Controllers scanned:** `update-telemetry-settings.controller.ts`, `get-telemetry-settings.controller.ts`
    - **Services scanned:** `telemetry-settings.service.ts`, `telemetry-settings-authorization.service.ts`
    - **Data Layer / Models scanned:** `upsert-telemetry-settings.ts`, `get-telemetry-settings.ts`
      | Layer | Operation / Activity | Sub-Activity / Lifecycle State | Triggered Event | Required Payload Metadata |
      | :--- | :--- | :--- | :--- | :--- |
      | _Controller / Service_| Rules Setup | Update Telemetry Rules | `telemetry_settings.updated`| `actorId`, `institutionId`, `details: { ruleSensitivity, enabledFeatures }` |

### Module: `/modules/telemetry/ingestion/`

- **Core Responsibilities:** Processing and enqueuing real-time surveillance metrics.
- **Granular Traceability Mapping:**
    - **Controllers scanned:** `ingest-event.controller.ts`, `ingest-batch.controller.ts`, `flush-telemetry.controller.ts`
    - **Services scanned:** `ingestion-queue.service.ts`, `telemetry-job-processor.service.ts`, `telemetry-aggregation.service.ts`
      | Layer | Operation / Activity | Sub-Activity / Lifecycle State | Triggered Event | Required Payload Metadata |
      | :--- | :--- | :--- | :--- | :--- |
      | _Controller / Service_| Ingress stream | Ingest Client event | `telemetry.event_received` | `examSessionId`, `studentId`, `eventType`, `ruleKey`, `timestamp` |
      | _Service Layer_ | queue buffer | Enqueue Event to Worker | `telemetry.enqueued` | `jobId`, `examSessionId`, `details: { eventQueueSize }` |

### Module: `/modules/telemetry/storage/`

- **Core Responsibilities:** Resolving severity and committing flagged incidents to database layers.
- **Granular Traceability Mapping:**
    - **Controllers scanned:** `update-incident.controller.ts`
    - **Services scanned:** `incident-persistence.service.ts`, `incident-review.service.ts`, `incident-severity-resolver.service.ts`
    - **Data Layer / Models scanned:** `get-incidents.ts`
      | Layer | Operation / Activity | Sub-Activity / Lifecycle State | Triggered Event | Required Payload Metadata |
      | :--- | :--- | :--- | :--- | :--- |
      | _Service Layer_ | Persistence | Append Proctoring Incident | `telemetry.incident_appended`| `incidentId`, `attemptId`, `incidentType`, `ruleKey`, `severity` |
      | _Service Layer_ | Dynamic Scale | Deduplicate and Scale Severity| `telemetry.incident_scaled` | `incidentId`, `attemptId`, `details: { previousSeverity, currentSeverity, occurrenceCount }` |
      | _Controller / Service_| Proctor Review | Review and Dismiss Flag | `telemetry.incident_reviewed`| `incidentId`, `reviewerUserId`, `details: { status: 'RESOLVED'\|'DISMISSED', reviewNotes }` |

---

## 6. Infrastructure Services Domain (`/modules/infrastructure/`)

### Module: `/modules/infrastructure/audio/`

- **Core Responsibilities:** Authorizing proctored audio streams and handling chunk uploads.
- **Granular Traceability Mapping:**
    - **Controllers/Services scanned:** `audio-authorization.service.ts`, `audio-resolver.service.ts`
      | Layer | Operation / Activity | Sub-Activity / Lifecycle State | Triggered Event | Required Payload Metadata |
      | :--- | :--- | :--- | :--- | :--- |
      | _Controller Layer_ | Media Ingress | Request Audio Upload | `infrastructure.audio_authorized`| `attemptId`, `studentId`, `details: { fileSize, audioDuration }` |

### Module: `/modules/infrastructure/livekit/`

- **Core Responsibilities:** Dispatching LiveKit tokens.
- **Granular Traceability Mapping:**
    - **Controllers/Services scanned:** `livekit.routes.ts`, `livekit.service.ts`
      | Layer | Operation / Activity | Sub-Activity / Lifecycle State | Triggered Event | Required Payload Metadata |
      | :--- | :--- | :--- | :--- | :--- |
      | _Controller Layer_ | Realtime stream | Request LiveKit Room Access Token| `infrastructure.rtc_token_granted`| `attemptId`, `actorId`, `details: { roomName, identity }` |

### Module: `/modules/infrastructure/mediapipe/`

- **Core Responsibilities:** Running client landmarks facial evaluations.
- **Granular Traceability Mapping:**
    - **Services scanned:** `mediapipe.service.ts`
      | Layer | Operation / Activity | Sub-Activity / Lifecycle State | Triggered Event | Required Payload Metadata |
      | :--- | :--- | :--- | :--- | :--- |
      | _Service Layer_ | Landmarks parse | Analyze Landmarks Frame | `infrastructure.face_landmark_analyzed`| `attemptId`, `details: { gazeDirection, headPoseRotation, eyesClosedSecs }` |

---

## 7. External Integrations Domain (`/modules/integrations/`)

### Module: `/modules/integrations/gemini/`

- **Core Responsibilities:** Utilizing Gemini AI to perform answer analysis and grade evaluations.
- **Granular Traceability Mapping:**
    - **Controllers scanned:** `gemini.controller.ts`
    - **Services scanned:** `gemini.route.ts` (maps prompts to LLM endpoints)
      | Layer | Operation / Activity | Sub-Activity / Lifecycle State | Triggered Event | Required Payload Metadata |
      | :--- | :--- | :--- | :--- | :--- |
      | _Service Layer_ | AI Diagnostic | Execute Gemini Diagnostic scan | `integration.gemini_scan_completed`| `examSessionId`, `details: { anomalyRating, tokenUsage, responseLatencyMs }` |

---

## 8. System Security Domain (`/modules/security/`)

### Module: `/modules/security/access-control/`

- **Core Responsibilities:** scoping assignments and global settings adjustments.
- **Granular Traceability Mapping:**
    - **Controllers scanned:** `create-access-control-assignment.controller.ts`, `delete-access-control-assignment.controller.ts`, `update-access-control-examination-settings.controller.ts`
    - **Services scanned:** `access-control-assignment.service.ts`, `access-control-examination-settings.service.ts`
    - **Data Layer / Models scanned:** `upsert-examination-global-settings.ts`
      | Layer | Operation / Activity | Sub-Activity / Lifecycle State | Triggered Event | Required Payload Metadata |
      | :--- | :--- | :--- | :--- | :--- |
      | _Controller / Service_| Global Security | Update Global Exam Settings | `security.global_settings_updated`| `actorId`, `details: { blockVirtualMachines, blockDualMonitors }` |
      | _Controller / Service_| Scope Assignment | Grant User Scoping Assignment | `security.assignment_created` | `actorId` (admin), `details: { targetUserId, targetRole, scopeInstitutionId }` |
      | _Controller / Service_| Scope Assignment | Revoke User Assignment | `security.assignment_revoked` | `actorId` (admin), `details: { targetUserId, targetRole }` |

### Module: `/modules/security/permission/`

- **Core Responsibilities:** Mapping custom permission keys and actions.
- **Granular Traceability Mapping:**
    - **Controllers scanned:** `create-access-control-permission.controller.ts`, `update-access-control-permission.controller.ts`, `delete-access-control-permission.controller.ts`
    - **Services scanned:** `permission.service.ts`
      | Layer | Operation / Activity | Sub-Activity / Lifecycle State | Triggered Event | Required Payload Metadata |
      | :--- | :--- | :--- | :--- | :--- |
      | _Controller / Service_| Rights Catalog | Create Permission Node | `security.permission_created` | `permissionId`, `actorId`, `details: { nodeKey, actionKey }` |
      | _Controller / Service_| Rights Catalog | Update Permission Node | `security.permission_updated` | `permissionId`, `actorId` |

### Module: `/modules/security/roles/`

- **Core Responsibilities:** custom role assignments and rights link.
- **Granular Traceability Mapping:**
    - **Controllers scanned:** `create-access-control-role.controller.ts`, `update-access-control-role.controller.ts`, `delete-access-control-role.controller.ts`, `replace-access-control-role-permissions.controller.ts`
    - **Services scanned:** `roles.service.ts`
      | Layer | Operation / Activity | Sub-Activity / Lifecycle State | Triggered Event | Required Payload Metadata |
      | :--- | :--- | :--- | :--- | :--- |
      | _Controller / Service_| Rights Catalog | Create Access Role | `security.role_created` | `roleId`, `actorId`, `details: { roleName, scope }` |
      | _Controller / Service_| Rights Catalog | Replace Role Permissions | `security.role_permissions_replaced`| `roleId`, `actorId`, `details: { permissionsAdded: [] }` |

---

## 9. General Platform Utilities Domain (`/modules/general/`)

### Module: `/modules/general/analytics/`

- **Core Responsibilities:** Dashboard compilations and reports generations.
- **Granular Traceability Mapping:**
    - **Controllers scanned:** `generate-analytics-report.controller.ts`
    - **Services scanned:** `map-analytics-kpis.ts`
      | Layer | Operation / Activity | Sub-Activity / Lifecycle State | Triggered Event | Required Payload Metadata |
      | :--- | :--- | :--- | :--- | :--- |
      | _Controller / Service_| Data Output | Trigger Report Compilation | `report.generated` | `actorId`, `details: { reportType, scopeFilters, format }` |

### Module: `/modules/general/announcements/`

- **Core Responsibilities:** Currently serves as an empty domain placeholder.
- **Granular Traceability Mapping:**
    - **Scanned status:** Empty directory, reserved for future developments.

### Module: `/modules/general/calendar/`

- **Core Responsibilities:** Academic events calendars and date trackers.
- **Granular Traceability Mapping:**
    - **Controllers scanned:** `create-calendar-event.controller.ts`, `update-calendar-event.controller.ts`, `delete-calendar-event.controller.ts`
    - **Services scanned:** `calendar-write.service.ts`
      | Layer | Operation / Activity | Sub-Activity / Lifecycle State | Triggered Event | Required Payload Metadata |
      | :--- | :--- | :--- | :--- | :--- |
      | _Controller / Service_| Calendar schedule | Create Calendar event | `calendar.event_created` | `eventId`, `actorId`, `details: { title, type, targetDate }` |
      | _Controller / Service_| Calendar schedule | Delete Calendar event | `calendar.event_deleted` | `eventId`, `actorId` |

### Module: `/modules/general/logs/`

- **Core Responsibilities:** Logs pipeline, system logs services, and activity logs.
- **Granular Traceability Mapping:**
    - **Controllers/Services scanned:** `LogsService`, `AuthLogsService`, `ActivityLogsService`, `SystemLogsService`
      | Layer | Operation / Activity | Sub-Activity / Lifecycle State | Triggered Event | Required Payload Metadata |
      | :--- | :--- | :--- | :--- | :--- |
      | _Service Layer_ | Log dispatch | Write Log Row | `LogsService.createLog` | `userId`, `action`, `resourceType`, `resourceId`, `details`, `ipAddress` |

### Module: `/modules/general/messages/`

- **Core Responsibilities:** Chat creation and messages dispatches.
- **Granular Traceability Mapping:**
    - **Controllers scanned:** `create-direct-conversation.controller.ts`, `send-message.controller.ts`
    - **Services scanned:** `message-write.service.ts`
      | Layer | Operation / Activity | Sub-Activity / Lifecycle State | Triggered Event | Required Payload Metadata |
      | :--- | :--- | :--- | :--- | :--- |
      | _Controller / Service_| Message thread | Initiate Conversation thread | `conversation.created` | `conversationId`, `actorId`, `details: { participantIds: [] }` |
      | _Controller / Service_| Message thread | Send message details | `message.sent` | `conversationId`, `actorId`, `details: { length }` |

### Module: `/modules/general/notification/`

- **Core Responsibilities:** Alerts reads mappings and push alerts pipelines.
- **Granular Traceability Mapping:**
    - **Controllers scanned:** `mark-notification-read.controller.ts`
    - **Services scanned:** `activity-notification-base.service.ts`, `notification.service.ts`
      | Layer | Operation / Activity | Sub-Activity / Lifecycle State | Triggered Event | Required Payload Metadata |
      | :--- | :--- | :--- | :--- | :--- |
      | _Controller / Service_| Notification view | Mark Alert read | `notification.marked_read` | `notificationId`, `actorId` |

---

## 10. Database Schema Synthesis Map

To verify full compatibility for data extraction, all metadata payloads documented above map to the following relational tables:

### Table: `audit_logs` (Auth, System, and Administrative/Operational Activities)

| Column Name      | Schema Type          | Mapping / Extraction Target                                  |
| :--------------- | :------------------- | :----------------------------------------------------------- |
| `id`             | `UUID`               | Primary Key (auto-generated)                                 |
| `user_id`        | `UUID` (Nullable)    | Mapped from Hono request actor context (`actorId`)           |
| `action`         | `VARCHAR`            | Event action code (e.g., `exam.create`, `classroom.created`) |
| `resource_type`  | `VARCHAR` (Nullable) | Target domain namespace (`exam`, `classroom`, `user`, etc.)  |
| `resource_id`    | `VARCHAR` (Nullable) | Mapped entity identification UUID                            |
| `details`        | `JSONB`              | JSON payload parameters (e.g., fields changed, titles)       |
| `ip_address`     | `VARCHAR` (Nullable) | Mapped from ingress client headers                           |
| `institution_id` | `UUID` (Nullable)    | Resolved parent institution scoping                          |
| `branch_id`      | `UUID` (Nullable)    | Resolved child sub-branch scoping                            |
| `created_at`     | `TIMESTAMP`          | Auto-logged timestamp                                        |

### Table: `flagged_incidents` (Real-Time Proctoring and Vision Anomalies)

| Column Name     | Schema Type            | Mapping / Extraction Target                                             |
| :-------------- | :--------------------- | :---------------------------------------------------------------------- |
| `incident_id`   | `UUID`                 | Primary Key (auto-generated)                                            |
| `attempt_id`    | `UUID`                 | linked student examination attempt ID                                   |
| `incident_type` | `VARCHAR`              | Trigger landmarks key (e.g., `MULTIPLE_FACES`, `NO_FACE`)               |
| `platform`      | `VARCHAR`              | Mapped client platform (`WEB` \| `MOBILE`)                              |
| `source`        | `VARCHAR`              | Media telemetry channel (`audio` \| `video` \| `system`)                |
| `rule_key`      | `VARCHAR`              | config rule descriptor                                                  |
| `severity`      | `VARCHAR`              | Computed severity (`LOW` \| `MEDIUM` \| `HIGH` \| `CRITICAL`)           |
| `details`       | `JSONB`                | Frame timestamps, eye landmarks data, occurrences counter               |
| `timestamp`     | `TIMESTAMP`            | Mapped from client frame dispatches                                     |
| `status`        | `VARCHAR`              | Proctor resolution review flow (`PENDING` \| `RESOLVED` \| `DISMISSED`) |
| `reviewed_by`   | `UUID` (Nullable)      | Proctor reviewer actor context ID                                       |
| `reviewed_at`   | `TIMESTAMP` (Nullable) | Proctor review completed timestamp                                      |

---

## 11. Key Architectural Recommendations & Gaps

1. **Untracked Core Admin Actions:** Critical mutations inside `/modules/core/` (rooms setup, subject maps, classrooms creation, link institutions) bypass `LogsService.createLog` entirely. To ensure proper data preparation, these must be hooked into the audit pipeline.
2. **Missing Exam Flow Auditing:** Student transitions (lobby check-in, waiting queues admissions, session start, completions) exist only as state entries in `exam_attempts` and lack longitudinal logs trail in `audit_logs`. We recommend introducing explicit `exam_flow.started` and `exam_flow.completed` audit hooks.
3. **Relational Telemetry Throttling:** Although the client sends high-frequency landmarks telemetry which is queued in Redis, direct writes to `flagged_incidents` during peak examinations can bottleneck PostgreSQL connection pools. It is recommended to aggregate events in Redis for up to 10 seconds before executing bulk commits.
