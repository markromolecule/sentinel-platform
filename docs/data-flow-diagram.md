# Goal

- To create a data flow diagram for the sentinel

## Deliverables

## Diagrams syntax

- [ ] DFD Level 1 - Mermaid.js code
- [ ] DFD Level 2 - Mermaid.js code

## DFD Level 0

- This diagram should show the overall system and its main processes and data stores

## DFD Level 1: End-to-End System Architecture Overview

```mermaid
graph TB
    %% External Entities
    ST[Student]
    INS[Instructor]
    ADM[Admin/Superadmin]
    SUP[Support/Proctor]
    EXT_AUTH[Supabase Auth]
    EXT_AI[AI Engine - Gemini]
    EXT_LIVE[LiveKit Server]

    %% Processes
    subgraph P1[P1: Identity & Access Management]
        direction TB
        P1_1[Auth & Enrollment]
        P1_2[Role-Based Access]
    end

    subgraph P2[P2: Academic Infrastructure]
        direction TB
        P2_1[Institution & Hierarchy]
        P2_2[Course/Subject Mapping]
        P2_3[Room & Schedule Mgmt]
    end

    subgraph P3[P3: Content & Question Engineering]
        direction TB
        P3_1[AI Question Generation]
        P3_2[Question Bank & Versioning]
    end

    subgraph P4[P4: Examination Lifecycle]
        direction TB
        P4_1[TOS & Template Engine]
        P4_2[Exam Builder & Validation]
    end

    subgraph P5[P5: Real-time Execution & AI Proctoring]
        direction TB
        P5_1[Live Stream Orchestration]
        P5_2[AI Vision Proctoring]
        P5_3[State Synchronization]
    end

    subgraph P6[P6: Assessment & Intelligent Review]
        direction TB
        P6_1[Automated Scoring]
        P6_2[AI Feedback & Rationalization]
        P6_3[Analytics & Reporting]
    end

    subgraph P7[P7: System Intelligence & Support]
        direction TB
        P7_1[Telemetry Ingestion]
        P7_2[Audit Logging]
        P7_3[Omnichannel Messaging]
    end

    %% Data Stores
    D1[(Identity DB)]
    D2[(Academic DB)]
    D3[(Content & QBank)]
    D4[(Exam Registry)]
    D5[(Execution Logs)]
    D6[(Assessment DB)]
    D7[(Telemetry & Audit)]

    %% Flows - Identity & Access
    ST -->|Login| P1
    P1 <-->|Verify| EXT_AUTH
    P1 <-->|Sync| D1

    %% Flows - Academic & Content
    ADM -->|Manage System| P2
    P2 <-->|Store Config| D2
    INS -->|Create Content| P3
    P3 <-->|Fetch/Enrich| EXT_AI
    P3 <-->|Archive| D3

    %% Flows - Exam Lifecycle
    INS -->|Configure TOS| P4
    P4 <-->|Pull Metadata| D3
    P4 <-->|Register Exam| D4

    %% Flows - Real-time Execution
    ST -->|Connect Stream| P5
    P5 <-->|Exchange Signal| EXT_LIVE
    P5 -->|AI Signals| P5_2
    P5 <-->|Persist State| D5
    SUP -->|Live Monitor| P5_1

    %% Flows - Assessment
    P5 -->|Trigger Finalize| P6
    P6 <-->|Fetch Logic| D4
    P6 <-->|Generate Feedback| EXT_AI
    P6 -->|Write Results| D6
    ST & INS & ADM -->|View Reports| P6

    %% Flows - Support & Audit
    P1 & P2 & P3 & P4 & P5 & P6 -->|Telemetry| P7
    P7 -->|Index| D7
    SUP -->|Support Workflow| P7_3
```

## DFD Level 2: Examination Lifecycle (Decomposition of P3)

```mermaid
graph TB
    %% Entities & Stores
    INS[Instructor]
    D3[(Question Bank)]
    D4[(Exam DB)]
    D2[(Academic DB)]

    %% Detailed Processes
    P3_1[P3.1: Question Bank Mgmt]
    P3_2[P3.2: TOS Configurator]
    P3_3[P3.3: Exam Template Builder]
    P3_4[P3.4: Scheduler & Enroller]

    %% Flows
    INS -->|Create/Edit Qs| P3_1
    P3_1 -->|Tag by Subject/Diff| D3

    INS -->|Define TOS Rules| P3_2
    P3_2 -->|Fetch Metadata| D3
    P3_2 -->|Generate Schema| P3_3

    P3_3 -->|Select Questions| D3
    P3_3 -->|Save Draft/Final| D4

    P3_4 -->|Assign Classes| D2
    P3_4 -->|Set Date/Time| D4
    P3_4 -->|Notify Students| ST[Student]
```

## DFD Level 2: Assessment & Grading (Decomposition of P5)

```mermaid
graph TB
    %% Entities & Stores
    ST[Student]
    D4[(Exam DB)]
    D5[(Results DB)]
    D1[(User DB)]

    %% Detailed Processes
    P5_1[P5.1: Real-time Scoring]
    P5_2[P5.2: Feedback Generator]
    P5_3[P5.3: Analytics Engine]
    P5_4[P5.4: Report Service]

    %% Flows
    ST -->|Submit Responses| P5_1
    P5_1 -->|Fetch Answers| D4
    P5_1 -->|Calculate Score| D5

    P5_1 -->|Trigger| P5_2
    P5_2 -->|Apply Rationalization| ST

    D5 -->|Raw Data| P5_3
    D1 -->|User Metadata| P5_3
    P5_3 -->|Aggregated Metrics| P5_4

    P5_4 -->|PDF/Web Reports| ADM[Admin]
    P5_4 -->|Student Transcript| ST
```

## DFD Level 2: Real-time Execution & AI Proctoring (Decomposition of P5)

```mermaid
graph TB
    %% Entities & Stores
    ST[Student]
    SUP[Proctor]
    EXT_LIVE[LiveKit Server]
    D5[(Execution Logs)]

    %% Detailed Processes
    P5_1[P5.1: Session Initialization]
    P5_2[P5.2: AI Signal Processor]
    P5_3[P5.3: Violation Detector]
    P5_4[P5.4: Live Monitor Sync]

    %% Flows
    ST -->|Join Session| P5_1
    P5_1 <-->|Provision JWT| EXT_LIVE
    ST -->|Media Stream| EXT_LIVE

    ST -->|Vision Signals| P5_2
    P5_2 -->|Proximity/Gaze/Voice| P5_3
    P5_3 -->|Flag Violation| D5

    P5_3 -->|Update Status| P5_4
    P5_4 <-->|Subscribe Stream| EXT_LIVE
    P5_4 -->|Alert| SUP
```

## DFD Level 2: Academic Structure (Decomposition of P2)

```mermaid
graph TB
    %% Entities & Stores
    ADM[Superadmin]
    D2[(Academic DB)]
    D1[(Identity DB)]

    %% Detailed Processes
    P2_1[P2.1: Org Structure Mgmt]
    P2_2[P2.2: Course/Subject Linking]
    P2_3[P2.3: Room Allocation]
    P2_4[P2.4: Semester Config]

    %% Flows
    ADM -->|Define Institution/Dept| P2_1
    P2_1 -->|Structure| D2

    ADM -->|Map Courses to Dept| P2_2
    P2_2 -->|Curriculum| D2

    ADM -->|Assign Room Capacity| P2_3
    P2_3 -->|Facility Map| D2

    ADM -->|Set Term Dates| P2_4
    P2_4 -->|Calendar| D2
```

## Guidelines

- Use the correct syntax for mermaid.js
- Use the correct syntax for data flow diagrams
- Ensure to follow the golden standard for data flow diagrams
