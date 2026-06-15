# Sentinel Data Flow Diagrams

This document provides Mermaid.js Data Flow Diagrams (DFDs) based on the current Sentinel system. The diagrams reflect the real platform domains found across `sentinel-web`, `sentinel-core`, `sentinel-support`, `sentinel-mobile`, `sentinel-api`, and the shared database model.

## Scope

The DFDs below focus on the main functional flows of Sentinel:

- onboarding and access control
- academic structure and classroom management
- question bank and TOS-driven assessment design
- exam authoring, publishing, and scheduling
- student exam runtime and progress synchronization
- telemetry ingestion, proctoring, and incident review
- reporting and support operations

## DFD Notation Used

- External entities are shown in square brackets, such as `[Student]`
- Processes are labeled as `P#` or `P#.#`
- Data stores are shown in double parentheses, such as `[(exams)]`
- Arrows represent logical data flow, not deployment topology

## Level 0 DFD: Sentinel System Context

```mermaid
flowchart LR
    student[Student]
    instructor[Instructor]
    admin[Admin / Superadmin]
    support[Support / Proctor]

    auth[Supabase Auth]
    ai[Gemini AI]
    livekit[LiveKit]

    sentinel([Sentinel Examination System])

    student -->|onboarding, exam access, answers, telemetry| sentinel
    instructor -->|question authoring, TOS, exams, monitoring requests| sentinel
    admin -->|institution, subject, term, room, role management| sentinel
    support -->|telemetry settings, incident review, support actions| sentinel

    sentinel -->|authentication requests| auth
    auth -->|session, identity, role context| sentinel

    sentinel -->|question generation and enrichment requests| ai
    ai -->|generated question content and metadata| sentinel

    sentinel -->|live room and token requests| livekit
    livekit -->|publisher/subscriber connection data| sentinel
```

## Level 1 DFD: End-to-End Sentinel Platform

```mermaid
flowchart TB
    student[Student]
    instructor[Instructor]
    admin[Admin / Superadmin]
    support[Support / Proctor]

    auth[Supabase Auth]
    ai[Gemini AI]
    livekit[LiveKit]
    redis[Redis / BullMQ / Cron Flush]

    p1[P1 Access, Identity, and Onboarding]
    p2[P2 Academic Structure and Classroom Management]
    p3[P3 Question Bank and TOS Management]
    p4[P4 Exam Authoring, Scheduling, and Publication]
    p5[P5 Exam Attempt Runtime and Progress Sync]
    p6[P6 Telemetry, Proctoring, and Monitoring]
    p7[P7 Reporting, Review, and Support Operations]

    d1[(users, identities, user_profiles, roles)]
    d2[(student_whitelist, enrollment_requests, instructors, students)]
    d3[(institutions, departments, courses, sections, terms, subjects)]
    d4[(subject_offerings, class_groups, enrollments, rooms)]
    d5[(question_bank_questions, question_bank_collections, exam_configurations)]
    d6[(exams, exam_questions, exam_assigned_sections, proctor_assignments)]
    d7[(exam_attempts, exam_lobby_admissions)]
    d8[(flagged_incidents, analytics_reports, audit_logs, system_settings)]

    student -->|sign in, onboarding, exam participation| p1
    instructor -->|sign in, subject request, classroom use| p1
    admin -->|account and role administration| p1
    support -->|support account access| p1
    p1 -->|auth verification| auth
    auth -->|session and identity data| p1
    p1 --> d1
    p1 --> d2

    admin -->|institution, department, course, term, room setup| p2
    instructor -->|classroom creation, roster management| p2
    p2 --> d3
    p2 --> d4

    instructor -->|question creation, collection curation, TOS review| p3
    admin -->|shared academic metadata| p3
    p3 -->|AI-assisted generation| ai
    ai -->|generated question drafts| p3
    p3 --> d5
    p3 --> d3

    instructor -->|exam draft, configuration, publish action| p4
    admin -->|room and term constraints| p4
    p4 --> d4
    p4 --> d5
    p4 --> d6

    student -->|join lobby, start exam, save progress, submit answers| p5
    p5 --> d6
    p5 --> d7

    student -->|camera, browser, mobile, and client events| p6
    instructor -->|monitoring requests| p6
    support -->|telemetry setting updates and incident review| p6
    p6 -->|room tokens and stream transport| livekit
    livekit -->|live connection state| p6
    p6 -->|buffer, queue, and flush operations| redis
    redis -->|persistable telemetry payloads| p6
    p6 --> d7
    p6 --> d8

    student -->|result viewing| p7
    instructor -->|reports, incidents, grading insights| p7
    admin -->|analytics and audit review| p7
    support -->|incident review and telemetry operations| p7
    p7 --> d6
    p7 --> d7
    p7 --> d8
```

## Level 2 DFD: P1 Access, Identity, and Onboarding

```mermaid
flowchart TB
    student[Student]
    instructor[Instructor]
    admin[Admin / Superadmin]
    auth[Supabase Auth]

    p11[P1.1 Authenticate User]
    p12[P1.2 Resolve Role and Profile]
    p13[P1.3 Validate Student Whitelist]
    p14[P1.4 Submit Onboarding]
    p15[P1.5 Manage Enrollment Request]

    d1[(users, identities, user_profiles, user_roles)]
    d2[(student_whitelist)]
    d3[(students, instructors, enrollment_requests)]
    d4[(institutions, departments, courses)]

    student -->|login or registration| p11
    instructor -->|login or registration| p11
    admin -->|login| p11
    p11 -->|OAuth / session request| auth
    auth -->|validated identity| p11
    p11 --> d1

    p11 --> p12
    p12 --> d1

    student -->|institution, department, course selection| p13
    p13 --> d2
    p13 --> d4
    p13 -->|whitelist result| p14

    p14 -->|create student profile| d3
    p14 -->|update user profile| d1

    instructor -->|request teaching assignment| p15
    admin -->|approve or update request| p15
    p15 --> d3
    p15 --> d4
```

## Level 2 DFD: P2 Academic Structure and Classroom Management

```mermaid
flowchart TB
    admin[Admin / Superadmin]
    instructor[Instructor]

    p21[P2.1 Maintain Institution Hierarchy]
    p22[P2.2 Maintain Terms, Subjects, and Subject Offerings]
    p23[P2.3 Configure Rooms]
    p24[P2.4 Create Classrooms and Rosters]

    d1[(institutions, departments, courses, sections)]
    d2[(terms, subjects, subject_classifications, subject_offerings)]
    d3[(rooms)]
    d4[(class_groups, enrollments, students)]

    admin -->|create or update institutions, departments, courses, sections| p21
    p21 --> d1

    admin -->|create terms, subjects, classifications, offerings| p22
    p22 --> d1
    p22 --> d2

    admin -->|create room inventory and availability| p23
    p23 --> d3

    instructor -->|create class from approved subject offering| p24
    p24 --> d2
    p24 --> d1
    p24 --> d4
```

## Level 2 DFD: P3 Question Bank and TOS Management

```mermaid
flowchart TB
    instructor[Instructor]
    ai[Gemini AI]

    p31[P3.1 Create or Import Questions]
    p32[P3.2 Generate AI-Assisted Question Drafts]
    p33[P3.3 Classify by Topic, Bloom Level, and Difficulty]
    p34[P3.4 Curate Collections and TOS Matrix]
    p35[P3.5 Calibrate and Retire Questions]

    d1[(question_bank_questions)]
    d2[(question_bank_collections)]
    d3[(subjects, subject_classifications)]
    d4[(exam_questions, exam_attempts)]

    instructor -->|manual question entry or import| p31
    p31 --> d1

    instructor -->|source content and generation prompt| p32
    p32 --> ai
    ai -->|question drafts and metadata| p32
    p32 --> p33

    p33 --> d1
    p33 --> d3

    instructor -->|review matrix and build collections| p34
    p34 --> d1
    p34 --> d2
    p34 --> d3

    p35 -->|usage and performance input| d4
    p35 --> d1
```

## Level 2 DFD: P4 Exam Authoring, Scheduling, and Publication

```mermaid
flowchart TB
    instructor[Instructor]
    admin[Admin / Superadmin]

    p41[P4.1 Select Classroom and Coverage Scope]
    p42[P4.2 Build Exam and Attach Questions]
    p43[P4.3 Define Runtime Configuration]
    p44[P4.4 Assign Rooms, Proctors, and Schedule]
    p45[P4.5 Publish Exam]

    d1[(class_groups, enrollments, subject_offerings, rooms)]
    d2[(question_bank_questions, question_bank_collections)]
    d3[(exams, exam_questions, exam_configurations)]
    d4[(exam_assigned_sections, proctor_assignments)]

    instructor -->|select classroom and target students| p41
    p41 --> d1

    instructor -->|draft exam metadata and choose questions| p42
    p42 --> d2
    p42 --> d3

    instructor -->|set review, shuffle, security, and AI rules| p43
    p43 --> d3

    admin -->|room and proctor constraints| p44
    instructor -->|schedule request| p44
    p44 --> d1
    p44 --> d4
    p44 --> d3

    instructor -->|publish exam| p45
    p45 --> d3
    p45 --> d4
```

## Level 2 DFD: P5 Exam Attempt Runtime and Progress Sync

```mermaid
flowchart TB
    student[Student]
    instructor[Instructor]

    p51[P5.1 Validate Exam Access]
    p52[P5.2 Admit Student Through Lobby]
    p53[P5.3 Start or Resume Attempt]
    p54[P5.4 Sync Answers and Runtime State]
    p55[P5.5 Complete Attempt]

    d1[(exams, exam_configurations)]
    d2[(exam_lobby_admissions)]
    d3[(exam_attempts)]
    d4[(exam_questions)]

    student -->|exam entry request| p51
    p51 --> d1

    student -->|wait for admission| p52
    instructor -->|admit or deny student| p52
    p52 --> d2

    student -->|start or resume session| p53
    p53 --> d1
    p53 --> d3
    p53 --> d4

    student -->|answer updates, reconnect state, timer sync| p54
    p54 --> d3

    student -->|submit or timeout| p55
    p55 --> d3
```

## Level 2 DFD: P6 Telemetry, Proctoring, and Monitoring

```mermaid
flowchart TB
    student[Student]
    instructor[Instructor]
    support[Support / Proctor]
    livekit[LiveKit]
    redis[Redis / BullMQ / Cron Flush]

    p61[P6.1 Capture Web, Mobile, and AI Signals]
    p62[P6.2 Evaluate Telemetry Policy Rules]
    p63[P6.3 Queue or Buffer Important Events]
    p64[P6.4 Persist Flagged Incidents]
    p65[P6.5 Provide Live Monitoring Context]

    d1[(exam_attempts, exam_configurations)]
    d2[(system_settings)]
    d3[(flagged_incidents)]
    d4[(audit_logs)]

    student -->|tab, fullscreen, clipboard, gaze, face, mobile events| p61
    p61 --> p62

    p62 --> d1
    p62 --> d2
    p62 -->|persist-worthy events| p63

    p63 --> redis
    redis -->|flushed event batch| p64

    p64 --> d3
    p64 --> d4

    student -->|publish live video when enabled| p65
    p65 --> livekit
    livekit -->|stream and token state| p65
    instructor -->|monitor student session| p65
    support -->|review telemetry operations| p65
    p65 --> d1
    p65 --> d3
```

## Level 2 DFD: P7 Reporting, Review, and Support Operations

```mermaid
flowchart TB
    student[Student]
    instructor[Instructor]
    admin[Admin / Superadmin]
    support[Support / Proctor]

    p71[P7.1 Compute Scores and Attempt Outcome]
    p72[P7.2 Build Exam Monitoring and Report Views]
    p73[P7.3 Review Incidents and Take Action]
    p74[P7.4 Maintain Telemetry Settings and Audit Trail]

    d1[(exam_attempts, exam_questions, exams)]
    d2[(analytics_reports)]
    d3[(flagged_incidents)]
    d4[(system_settings, audit_logs)]

    p71 --> d1
    p71 --> d2

    student -->|view result| p72
    instructor -->|view report and monitoring detail| p72
    admin -->|view summary analytics| p72
    p72 --> d1
    p72 --> d2
    p72 --> d3

    instructor -->|review or mark incident| p73
    support -->|review incident workflow| p73
    p73 --> d3
    p73 --> d4

    support -->|update telemetry settings| p74
    admin -->|audit operational history| p74
    p74 --> d4
```

## Notes

- These DFDs are based on the current Sentinel modules, service APIs, and Prisma data model.
- `Supabase Auth`, `Gemini AI`, `LiveKit`, and `Redis / BullMQ / Cron Flush` are shown as external supporting systems because Sentinel exchanges data with them but does not own their internal processing.
- The diagrams intentionally use logical process names instead of page-level UI names so they stay stable as the frontend evolves.
