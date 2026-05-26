# Sentinel Use Case Diagrams

This document defines PlantUML use case diagrams for the current Sentinel system. The diagrams are based on the implemented role model and workspace/module structure across:

- `app/sentinel-web`
- `app/sentinel-core`
- `app/sentinel-support`
- `app/sentinel-api`
- `packages/shared`

These diagrams are intended to complement the [Data Flow Diagrams](data-flow-diagram.md) by showing actor behavior and system responsibilities rather than data movement.

## Scope Alignment

The use cases below were aligned against the current codebase areas:

- `student` flows in `app/sentinel-web/src/app/(protected)/student`
- `instructor` flows in `app/sentinel-web/src/app/(protected)/(instructor)`
- `admin` and `superadmin` flows in `app/sentinel-core/src/app/(protected)/(admin)` and `app/sentinel-core/src/app/(protected)/(superadmin)`
- `support` flows in `app/sentinel-support/src/app/(protected)/(support)`
- `disciplinary_officer` permissions in `packages/shared/src/constants/permissions.ts`
- platform services in `app/sentinel-api/src/modules`

## Actor Notes

- `Superadmin` inherits higher-level governance and platform oversight responsibilities.
- `Admin` is course-scoped and focuses on academic operations, whitelist management, and approvals.
- `Instructor` owns classroom, question bank, exam authoring, grading, and monitoring inside assigned teaching scope.
- `Student` participates in onboarding, classroom/exam access, exam runtime, and result review.
- `Support` manages platform-wide or institution-level operational controls, telemetry settings, access control, and support accounts.
- `Disciplinary Officer` is an oversight role centered on incidents, evidence review, and compliance reporting.
- `Proctor` remains relevant for live invigilation and flag response, even when some operational views are also accessible to support.

## Diagram 1: Sentinel System Context

```plantuml
@startuml
left to right direction
skinparam shadowing false
skinparam packageStyle rectangle
skinparam actorStyle awesome

actor Student
actor Instructor
actor Admin
actor Superadmin
actor Support
actor "Disciplinary Officer" as DisciplinaryOfficer
actor Proctor

actor "Supabase Auth" as Auth
actor "Gemini AI" as Gemini
actor LiveKit
actor "Telemetry Worker" as Worker

rectangle "Sentinel Examination System" {
    usecase "Authenticate and\nResolve Access" as UCAuth
    usecase "Manage Academic\nStructure" as UCAcademic
    usecase "Manage Question Bank\nand TOS" as UCQuestion
    usecase "Build, Publish,\nand Assign Exams" as UCExam
    usecase "Run Student Exam\nSessions" as UCRuntime
    usecase "Monitor, Flag,\nand Review Incidents" as UCMonitoring
    usecase "Review Results,\nReports, and Audit Data" as UCReporting
    usecase "Manage Platform Control,\nRoles, and Telemetry" as UCGovernance
}

Student --> UCAuth
Student --> UCRuntime
Student --> UCReporting

Instructor --> UCAuth
Instructor --> UCAcademic
Instructor --> UCQuestion
Instructor --> UCExam
Instructor --> UCMonitoring
Instructor --> UCReporting

Admin --> UCAuth
Admin --> UCAcademic
Admin --> UCExam
Admin --> UCReporting

Superadmin --> UCAuth
Superadmin --> UCAcademic
Superadmin --> UCReporting
Superadmin --> UCGovernance

Support --> UCAuth
Support --> UCAcademic
Support --> UCMonitoring
Support --> UCReporting
Support --> UCGovernance

DisciplinaryOfficer --> UCMonitoring
DisciplinaryOfficer --> UCReporting

Proctor --> UCMonitoring

UCAuth --> Auth
UCQuestion --> Gemini
UCMonitoring --> LiveKit
UCMonitoring --> Worker
UCRuntime --> Worker
@enduml
```

## Diagram 1A: End-to-End Sentinel Journey

This view shows the full platform journey across the major actors, from access and setup through exam delivery, monitoring, and post-exam review.

```plantuml
@startuml
left to right direction
skinparam shadowing false
skinparam packageStyle rectangle
skinparam actorStyle awesome

actor Student
actor Instructor
actor Admin
actor Superadmin
actor Support
actor "Disciplinary Officer" as DisciplinaryOfficer
actor Proctor
actor "Supabase Auth" as Auth
actor "Gemini AI" as Gemini
actor LiveKit
actor "Telemetry Worker" as Worker

rectangle "Sentinel End-to-End Examination Workflow" {
    usecase "Authenticate User" as E1
    usecase "Onboard Student\nThrough Whitelist" as E2
    usecase "Provision Users,\nRoles, and Permissions" as E3
    usecase "Set Up Institution,\nAcademic Structure, and Rooms" as E4
    usecase "Manage Subjects,\nOfferings, and Sections" as E5
    usecase "Create Classroom\nand Rosters" as E6
    usecase "Build Question Bank,\nCollections, and TOS" as E7
    usecase "Generate AI-Assisted\nQuestion Drafts" as E8
    usecase "Configure, Assign,\nand Publish Exam" as E9
    usecase "Admit Students\nThrough Lobby" as E10
    usecase "Run Exam Attempt\nand Sync Progress" as E11
    usecase "Capture Telemetry\nand Live Monitoring" as E12
    usecase "Review Flags,\nEvidence, and Incidents" as E13
    usecase "Grade, Release Results,\nand Review History" as E14
    usecase "Export Reports,\nAudit Logs, and Compliance Data" as E15
    usecase "Manage Telemetry,\nGovernance, and Access Control" as E16
}

Student --> E1
Student --> E2
Student --> E11
Student --> E14

Instructor --> E1
Instructor --> E6
Instructor --> E7
Instructor --> E8
Instructor --> E9
Instructor --> E10
Instructor --> E12
Instructor --> E13
Instructor --> E14

Admin --> E3
Admin --> E4
Admin --> E5
Admin --> E9

Superadmin --> E3
Superadmin --> E4
Superadmin --> E15
Superadmin --> E16

Support --> E3
Support --> E4
Support --> E5
Support --> E13
Support --> E15
Support --> E16

DisciplinaryOfficer --> E13
DisciplinaryOfficer --> E15

Proctor --> E10
Proctor --> E12
Proctor --> E13

E1 --> Auth
E8 --> Gemini
E11 --> Worker
E12 --> LiveKit
E12 --> Worker

E2 ..> E1 : <<include>>
E6 ..> E5 : <<include>>
E7 ..> E8 : <<extend>>
E9 ..> E7 : <<include>>
E10 ..> E9 : <<include>>
E11 ..> E10 : <<include>>
E12 ..> E11 : <<extend>>
E13 ..> E12 : <<include>>
E14 ..> E11 : <<include>>
E15 ..> E13 : <<include>>
E16 ..> E13 : <<extend>>
@enduml
```

## Diagram 1B: Student End-to-End Journey

This view focuses only on the learner lifecycle, starting from account access and onboarding, then moving through classroom/exam access, readiness checks, active exam participation, and post-exam review.

```plantuml
@startuml
left to right direction
skinparam shadowing false
skinparam packageStyle rectangle
skinparam actorStyle awesome

actor Student
actor Instructor
actor Proctor
actor "Supabase Auth" as Auth
actor LiveKit
actor "Telemetry Worker" as Worker

rectangle "Student End-to-End Examination Journey" {
    usecase "Create Account" as S1
    usecase "Authenticate Account" as S2
    usecase "Complete Student Onboarding" as S3
    usecase "Validate Whitelist Record" as S4
    usecase "Access Student Dashboard" as S5
    usecase "View Classroom Enrollments" as S6
    usecase "View Assigned Exams" as S7
    usecase "View Exam Details,\nInstructions, and Privacy" as S8
    usecase "Run Device / Camera Checkup" as S9
    usecase "Join Exam Lobby" as S10
    usecase "Confirm Readiness" as S11
    usecase "Admit / Deny Student Entry" as S12
    usecase "Start or Resume Attempt" as S13
    usecase "Navigate Exam Questions" as S14
    usecase "Answer and Update Responses" as S15
    usecase "Sync Answers and Progress" as S16
    usecase "Capture Runtime Telemetry" as S17
    usecase "Submit Attempt or Timeout" as S18
    usecase "View Exam Result" as S19
    usecase "View Attempt History" as S20
    usecase "Review Exam Details and Feedback" as S21
}

Student --> S1
Student --> S2
Student --> S3
Student --> S5
Student --> S6
Student --> S7
Student --> S8
Student --> S9
Student --> S10
Student --> S11
Student --> S13
Student --> S14
Student --> S15
Student --> S18
Student --> S19
Student --> S20
Student --> S21

Instructor --> S12
Proctor --> S12

S1 ..> S2 : <<include>>
S3 ..> S4 : <<include>>
S5 ..> S6 : <<include>>
S7 ..> S8 : <<include>>
S10 ..> S11 : <<include>>
S13 ..> S14 : <<include>>
S13 ..> S15 : <<include>>
S13 ..> S16 : <<include>>
S13 ..> S17 : <<include>>
S18 ..> S16 : <<include>>
S19 ..> S21 : <<extend>>

S2 --> Auth
S17 --> LiveKit
S16 --> Worker
S17 --> Worker
@enduml
```

## Diagram 1C: Institution Creation and Core Setup Journey

This view focuses on the administrative setup of Sentinel from institution creation through core academic data, users, whitelist preparation, and operational readiness for classroom and exam delivery.

```plantuml
@startuml
left to right direction
skinparam shadowing false
skinparam packageStyle rectangle
skinparam actorStyle awesome

actor Support
actor Superadmin
actor Admin

rectangle "Institution Creation and Core Setup Journey" {
    usecase "Create Institution" as I1
    usecase "Configure Institution Profile" as I2
    usecase "Create Departments" as I3
    usecase "Create Courses" as I4
    usecase "Create Sections" as I5
    usecase "Create Semesters / Terms" as I6
    usecase "Create Rooms" as I7
    usecase "Create Subject Catalog" as I8
    usecase "Create Subject Classifications" as I9
    usecase "Create Subject Offerings" as I10
    usecase "Approve Subject Offerings / Requests" as I11
    usecase "Create Admin,\nSupport, and Staff Accounts" as I12
    usecase "Manage Roles and Permissions" as I13
    usecase "Prepare Student Whitelist" as I14
    usecase "Import / Maintain Whitelist Data" as I15
    usecase "Configure Examination Governance" as I16
    usecase "Configure Telemetry Rules and Health" as I17
    usecase "Prepare Classrooms for Delivery" as I18
    usecase "Prepare Institution for Exam Operations" as I19
}

Support --> I1
Superadmin --> I1

Support --> I2
Superadmin --> I2

Support --> I3
Superadmin --> I3

Support --> I4
Superadmin --> I4

Support --> I5
Admin --> I5

Support --> I6
Superadmin --> I6
Admin --> I6

Support --> I7
Admin --> I7

Support --> I8
Admin --> I8

Support --> I9
Admin --> I9

Support --> I10
Admin --> I10

Support --> I11
Admin --> I11

Support --> I12
Superadmin --> I12
Admin --> I12

Support --> I13
Superadmin --> I13

Support --> I14
Superadmin --> I14
Admin --> I14

I14 ..> I15 : <<include>>

Support --> I16
Superadmin --> I16

Support --> I17

Admin --> I18
Support --> I18

I1 ..> I2 : <<include>>
I3 ..> I4 : <<extend>>
I4 ..> I5 : <<extend>>
I8 ..> I9 : <<extend>>
I8 ..> I10 : <<include>>
I10 ..> I11 : <<extend>>
I18 ..> I10 : <<include>>
I19 ..> I6 : <<include>>
I19 ..> I7 : <<include>>
I19 ..> I12 : <<include>>
I19 ..> I14 : <<include>>
I19 ..> I16 : <<include>>
I19 ..> I17 : <<include>>
I19 ..> I18 : <<include>>
@enduml
```

## Diagram 1D: Instructor Exam Setup and Delivery Journey

This view focuses on how an instructor prepares, configures, delivers, and reviews an examination from the teaching side.

```plantuml
@startuml
left to right direction
skinparam shadowing false
skinparam packageStyle rectangle
skinparam actorStyle awesome

actor Instructor
actor Admin
actor Proctor
actor "Gemini AI" as Gemini
actor LiveKit
actor "Telemetry Worker" as Worker

rectangle "Instructor Exam Setup and Delivery Journey" {
    usecase "Access Instructor Dashboard" as T1
    usecase "Review Assigned Subjects\nand Offerings" as T2
    usecase "Create / Manage Classrooms" as T3
    usecase "Manage Classroom Rosters" as T4
    usecase "Create Question Bank Items" as T5
    usecase "Import Questions from Files" as T6
    usecase "Generate AI Question Drafts" as T7
    usecase "Curate Question Collections" as T8
    usecase "Review TOS Matrix" as T9
    usecase "Open Exam Builder" as T10
    usecase "Select Questions and\nBuild Exam Content" as T11
    usecase "Configure Exam Rules\nand Security Settings" as T12
    usecase "Assign Exam to Classrooms" as T13
    usecase "Schedule and Publish Exam" as T14
    usecase "Coordinate Proctor Assignment" as T15
    usecase "Monitor Lobby and\nActive Exam Sessions" as T16
    usecase "Review Reports and\nFlagged Incidents" as T17
    usecase "Grade Responses and\nExport Grades" as T18
    usecase "Review Exam Results\nand History" as T19
}

Instructor --> T1
Instructor --> T2
Instructor --> T3
Instructor --> T4
Instructor --> T5
Instructor --> T6
Instructor --> T7
Instructor --> T8
Instructor --> T9
Instructor --> T10
Instructor --> T11
Instructor --> T12
Instructor --> T13
Instructor --> T14
Instructor --> T16
Instructor --> T17
Instructor --> T18
Instructor --> T19

Admin --> T15
Proctor --> T15
Proctor --> T16

T3 ..> T4 : <<include>>
T5 ..> T8 : <<extend>>
T6 ..> T5 : <<extend>>
T7 ..> Gemini : <<include>>
T10 ..> T11 : <<include>>
T10 ..> T12 : <<include>>
T10 ..> T9 : <<include>>
T14 ..> T13 : <<include>>
T14 ..> T15 : <<extend>>
T16 ..> LiveKit : <<include>>
T16 ..> Worker : <<include>>
T17 ..> T16 : <<include>>
T19 ..> T18 : <<extend>>
@enduml
```

## Diagram 2: Identity, Onboarding, and Access Control

This view covers authentication, whitelist-backed onboarding, user provisioning, role governance, and permission assignment.

```plantuml
@startuml
left to right direction
skinparam shadowing false
skinparam packageStyle rectangle
skinparam actorStyle awesome

actor User
actor Student
actor Instructor
actor Admin
actor Superadmin
actor Support
actor "Supabase Auth" as Auth

Student --|> User
Instructor --|> User
Admin --|> User
Superadmin --|> Admin
Support --|> User

rectangle "Identity and Access Management" {
    usecase "Sign In / Sign Out" as UC1
    usecase "Update Profile" as UC2
    usecase "Complete Student Onboarding" as UC3
    usecase "Validate Student Whitelist Record" as UC4
    usecase "Request Subject / Teaching Enrollment" as UC5
    usecase "Review Enrollment Requests" as UC6
    usecase "Create and Manage Users" as UC7
    usecase "Invite Superadmin / Support Accounts" as UC8
    usecase "Manage Roles" as UC9
    usecase "Manage Permissions" as UC10
    usecase "Manage Role Assignments" as UC11
    usecase "Manage Student Whitelist" as UC12
    usecase "Import / Purge Whitelist" as UC13
}

User --> UC1
User --> UC2
UC1 ..> Auth : <<include>>

Student --> UC3
UC3 ..> UC4 : <<include>>

Instructor --> UC5
Admin --> UC6
Support --> UC6

Admin --> UC7
Support --> UC7
Superadmin --> UC8
Support --> UC8

Superadmin --> UC9
Support --> UC9
Superadmin --> UC10
Support --> UC10
Superadmin --> UC11
Support --> UC11

Admin --> UC12
Superadmin --> UC12
Support --> UC12
UC12 ..> UC13 : <<extend>>
@enduml
```

## Diagram 3: Academic Setup, Classroom Operations, and Assessment Authoring

This view reflects the modules used by `admin`, `superadmin`, `support`, and `instructor` for academic setup, classroom delivery, question bank work, TOS, and exam construction.

```plantuml
@startuml
left to right direction
skinparam shadowing false
skinparam packageStyle rectangle
skinparam actorStyle awesome

actor Instructor
actor Admin
actor Superadmin
actor Support
actor "Gemini AI" as Gemini

rectangle "Academic and Assessment Authoring" {
    usecase "Manage Institutions" as UC20
    usecase "Manage Departments" as UC21
    usecase "Manage Courses" as UC22
    usecase "Manage Sections" as UC23
    usecase "Manage Semesters" as UC24
    usecase "Manage Rooms" as UC25
    usecase "Manage Subjects and\nClassifications" as UC26
    usecase "Manage Subject Offerings" as UC27
    usecase "Approve / Reject\nSubject Requests" as UC28
    usecase "Create Classrooms" as UC29
    usecase "Manage Classroom Rosters" as UC30
    usecase "Enroll / Unenroll Students" as UC31
    usecase "Create Question Bank Items" as UC32
    usecase "Import Questions from Files" as UC33
    usecase "Generate AI Question Drafts" as UC34
    usecase "Curate Question Collections" as UC35
    usecase "Review TOS Matrix" as UC36
    usecase "Configure Exam Rules" as UC37
    usecase "Build Exam" as UC38
    usecase "Assign Exam to Classes" as UC39
    usecase "Schedule / Publish Exam" as UC40
    usecase "Assign Proctors" as UC41
}

Support --> UC20
Superadmin --> UC20

Support --> UC21
Superadmin --> UC21

Support --> UC22
Superadmin --> UC22

Support --> UC23
Admin --> UC23

Support --> UC24
Superadmin --> UC24
Admin --> UC24

Support --> UC25
Admin --> UC25

Support --> UC26
Admin --> UC26
Instructor --> UC26

Support --> UC27
Admin --> UC27
Instructor --> UC27

Admin --> UC28
Support --> UC28

Instructor --> UC29
Admin --> UC29

Instructor --> UC30
UC30 ..> UC31 : <<include>>

Instructor --> UC32
Instructor --> UC33
Instructor --> UC34
UC34 ..> Gemini : <<include>>
Instructor --> UC35
Instructor --> UC36

Instructor --> UC37
Instructor --> UC38
Instructor --> UC39
Instructor --> UC40
Admin --> UC41
Support --> UC41

UC38 ..> UC32 : <<include>>
UC38 ..> UC35 : <<include>>
UC38 ..> UC37 : <<include>>
UC40 ..> UC39 : <<include>>
@enduml
```

## Diagram 4: Student Exam Participation Lifecycle

This view focuses on the student journey from exam discovery to result review, including readiness checks, lobby admission, runtime monitoring, answer sync, and submission.

```plantuml
@startuml
left to right direction
skinparam shadowing false
skinparam packageStyle rectangle
skinparam actorStyle awesome

actor Student
actor Instructor
actor Proctor
actor LiveKit
actor "Telemetry Worker" as Worker

rectangle "Student Exam Participation" {
    usecase "View Assigned Exams" as UC50
    usecase "View Exam Details,\nInstructions, and Privacy" as UC51
    usecase "Run Device / Camera Checkup" as UC52
    usecase "Join Exam Lobby" as UC53
    usecase "Confirm Readiness" as UC54
    usecase "Admit / Deny Student Entry" as UC55
    usecase "Start or Resume Attempt" as UC56
    usecase "Answer Questions" as UC57
    usecase "Navigate Exam Session" as UC58
    usecase "Sync Answers and Progress" as UC59
    usecase "Capture Runtime Telemetry" as UC60
    usecase "Submit Attempt or Timeout" as UC61
    usecase "View Exam Result" as UC62
    usecase "View Attempt History" as UC63
}

Student --> UC50
Student --> UC51
Student --> UC52
Student --> UC53
Student --> UC54
Student --> UC56
Student --> UC57
Student --> UC58
Student --> UC61
Student --> UC62
Student --> UC63

Instructor --> UC55
Proctor --> UC55

UC53 ..> UC54 : <<include>>
UC56 ..> UC57 : <<include>>
UC56 ..> UC58 : <<include>>
UC56 ..> UC59 : <<include>>
UC56 ..> UC60 : <<include>>
UC60 --> LiveKit
UC59 --> Worker
UC60 --> Worker
UC61 ..> UC59 : <<include>>
@enduml
```

## Diagram 5: Monitoring, Incident Review, and Discipline Operations

This view captures live invigilation, telemetry operations, incident review, evidence handling, compliance reporting, and support-managed governance settings.

```plantuml
@startuml
left to right direction
skinparam shadowing false
skinparam packageStyle rectangle
skinparam actorStyle awesome

actor Instructor
actor Proctor
actor Support
actor "Disciplinary Officer" as DisciplinaryOfficer
actor Admin
actor LiveKit
actor "Telemetry Worker" as Worker

rectangle "Monitoring and Operations" {
    usecase "Monitor Live Exam Sessions" as UC70
    usecase "View Session Lobby Status" as UC71
    usecase "Respond to Proctoring Flags" as UC72
    usecase "Review Flagged Incidents" as UC73
    usecase "Review Evidence and\nTelemetry Details" as UC74
    usecase "Update Incident Status" as UC75
    usecase "Export Incident /\nCompliance Reports" as UC76
    usecase "View Result and\nMonitoring Reports" as UC77
    usecase "Audit Logs and\nOperational History" as UC78
    usecase "Manage Telemetry Rules" as UC79
    usecase "Manage Telemetry Health\nand Sandbox" as UC80
    usecase "Manage Examination Governance" as UC81
    usecase "Manage Access Control\nRegistry and Assignments" as UC82
}

Instructor --> UC70
Instructor --> UC71
Instructor --> UC73
Instructor --> UC74
Instructor --> UC77

Proctor --> UC70
Proctor --> UC71
Proctor --> UC72
Proctor --> UC73

Support --> UC73
Support --> UC74
Support --> UC75
Support --> UC76
Support --> UC78
Support --> UC79
Support --> UC80
Support --> UC81
Support --> UC82

DisciplinaryOfficer --> UC73
DisciplinaryOfficer --> UC74
DisciplinaryOfficer --> UC75
DisciplinaryOfficer --> UC76

Admin --> UC77
Admin --> UC78

UC70 --> LiveKit
UC70 --> Worker
UC73 ..> UC74 : <<include>>
UC73 ..> UC75 : <<extend>>
UC76 ..> UC73 : <<include>>
@enduml
```

## Relationship Guide

| Relationship     | Meaning in Sentinel                                                     |
| :--------------- | :---------------------------------------------------------------------- |
| `Association`    | A role directly performs or initiates a system behavior.                |
| `<<include>>`    | A required sub-behavior always happens as part of a larger use case.    |
| `<<extend>>`     | An optional or conditional behavior is triggered from a base use case.  |
| `Generalization` | A specialized actor inherits the broader capabilities of another actor. |

## Modeling Notes

- The diagrams intentionally separate authoring, runtime, and operations so each figure stays documentation-friendly.
- `Support` is modeled as a strong governance actor because the current support portal includes control, telemetry, user, subject, room, and platform governance areas.
- `Disciplinary Officer` is modeled in the monitoring and reporting domain because the current permission blueprint gives this role incident and report responsibilities, even if the dedicated UI surface is still evolving.
- `Proctor` is retained as a distinct actor because the permission model still defines real-time monitoring and flag-response behavior separately from broader support operations.
- `Gemini AI`, `LiveKit`, `Supabase Auth`, and background telemetry workers are shown as external supporting actors because Sentinel coordinates with them but does not own their internal logic.

## Recommended Documentation Usage

- Use **Diagram 1** when introducing the whole platform.
- Use **Diagram 1A** when you need one end-to-end view of the full examination lifecycle.
- Use **Diagram 1B** when documenting the full student journey from account creation to exam completion.
- Use **Diagram 1C** when documenting institution creation, academic setup, and operational readiness.
- Use **Diagram 1D** when documenting how instructors prepare, configure, publish, monitor, and review exams.
- Use **Diagram 2** for identity, onboarding, and governance chapters.
- Use **Diagram 3** for admin and instructor academic workflows.
- Use **Diagram 4** for the student examination journey.
- Use **Diagram 5** for proctoring, telemetry, incident review, support, and disciplinary workflows.
