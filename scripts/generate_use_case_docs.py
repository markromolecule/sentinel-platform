#!/usr/bin/env python3
"""
Generates Use Case Narratives for Sentinel Capstone Manuscript:
- Table 7: Use Case Narratives of the Web Application (MWA)
- Table 8: Use Case Narratives of the Mobile Application (MAA - Student Focused)

Outputs:
1. Native Microsoft Word Documents (.docx) with APA-styled tables and shaded headers
2. Google Sheets CSV files (importable via File -> Import -> Upload)
3. TSV files (direct copy-paste into Google Sheets)
4. HTML files (1-click browser copy-paste into Google Sheets or Word)
"""

import os
import csv
import html
import zipfile

OUTPUT_DIR = "/Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/capstone/manuscript"
TEMPLATE_DOCX = os.path.join(OUTPUT_DIR, "CHAPTER-3-SENTINEL-REVISED.docx")

# ==============================================================================
# TABLE 7: WEB APPLICATION USE CASES
# ==============================================================================
WEB_USE_CASES = [
    {
        "id": "UC-01",
        "table_num": "Table 7.1",
        "name": "Authenticate User & Enforce Dynamic RBAC",
        "actors": "Student, Instructor, Admin, Superadmin, Support Personnel, Supabase Auth",
        "description": "Authenticates user credentials or OAuth session, resolves assigned role(s), queries database-backed permissions (rbac_permissions), and routes the actor to their designated portal dashboard.",
        "precondition": "The user has registered an account and is connected to the network.",
        "postcondition": "A valid JSON Web Token (JWT) session is issued, fine-grained permission scopes are injected into context, and the actor enters their role-specific workspace.",
        "main_scenario": (
            "1. User navigates to the Sentinel authentication portal (sentinel-web or sentinel-core).\n"
            "2. System displays the login interface requesting email and password or Google OAuth.\n"
            "3. User inputs their credentials and submits the login form.\n"
            "4. System submits the payload to Supabase Auth for credential validation.\n"
            "5. Supabase Auth returns a valid authentication session with encrypted access tokens.\n"
            "6. Sentinel API checks user status, fetches active roles from user_roles, and evaluates direct permission overrides from rbac_role_permissions.\n"
            "7. System constructs an active permissions set and directs the user to their authorized portal interface."
        ),
        "alt_scenario": (
            "3a. Invalid Credentials:\n"
            "  1. Supabase Auth rejects the credentials.\n"
            "  2. System logs a failed login attempt and displays an error message: 'Invalid email or password.'\n"
            "  3. Flow returns to Step 2.\n"
            "6a. Inactive or Suspended Account:\n"
            "  1. Sentinel API detects the account status is disabled or pending onboarding.\n"
            "  2. System terminates session and redirects user to the onboarding / account resolution screen."
        )
    },
    {
        "id": "UC-02",
        "table_num": "Table 7.2",
        "name": "Onboard Student via Whitelist Verification",
        "actors": "Student, Department Admin (Pre-requisite data provider), System",
        "description": "Verifies a newly registered student against the institution's official academic whitelist before granting access to classrooms, subjects, and examinations.",
        "precondition": "The student is authenticated with an un-onboarded profile; the administrator has uploaded the department student whitelist.",
        "postcondition": "The student profile is linked to an authorized institution, course, and department; whitelist record status is updated to CLAIMED.",
        "main_scenario": (
            "1. Student logs into Sentinel for the first time.\n"
            "2. System detects incomplete onboarding and renders the Student Onboarding Form.\n"
            "3. Student enters their official Student Identification Number, selects Institution, and academic department.\n"
            "4. System queries the student_whitelist table matching Student ID and Department.\n"
            "5. System confirms an active, unclaimed whitelist entry matches the submitted data.\n"
            "6. System associates the student's Supabase UID with the verified academic record.\n"
            "7. System updates the whitelist status to CLAIMED and assigns the default student role.\n"
            "8. System grants entry to the Student Workspace."
        ),
        "alt_scenario": (
            "5a. Student Number Not Found:\n"
            "  1. System finds no match in the institutional whitelist.\n"
            "  2. System denies onboarding and displays: 'Student ID not recognized. Please contact your department administrator.'\n"
            "5b. Student Number Already Claimed:\n"
            "  1. System detects the record has already been linked to another authenticated account.\n"
            "  2. System blocks onboarding, logs an audit security flag, and prompts the user to verify identity with support."
        )
    },
    {
        "id": "UC-03",
        "table_num": "Table 7.3",
        "name": "Manage Academic Structure & Course Offerings",
        "actors": "Department Admin, Superadmin, Support Personnel",
        "description": "Establishes institutional hierarchy (departments, degree programs, course offerings, academic terms, physical rooms, and class sections) for upcoming academic delivery.",
        "precondition": "Administrator or Support Personnel is authenticated with academic management permissions.",
        "postcondition": "Academic entities are registered and ready for classroom enrollment and exam scheduling.",
        "main_scenario": (
            "1. Administrator navigates to the Academic Structure module in sentinel-core.\n"
            "2. Administrator configures or selects Department and Degree Program.\n"
            "3. Administrator creates new Course Offerings linked to current Academic Term/Semester.\n"
            "4. Administrator defines Class Sections and links physical examination rooms.\n"
            "5. System validates foreign key relationships and unique course codes.\n"
            "6. System persists academic structure to PostgreSQL via Kysely.\n"
            "7. System renders updated directory of course offerings available for instructor classroom assignment."
        ),
        "alt_scenario": (
            "5a. Duplicate Course Code or Conflicting Section:\n"
            "  1. System detects an existing identical section or course code in the same term.\n"
            "  2. System rejects the submission and highlights the duplicate field with an explanatory alert."
        )
    },
    {
        "id": "UC-04",
        "table_num": "Table 7.4",
        "name": "Curate Question Bank & Balance Table of Specifications (TOS) Matrix",
        "actors": "Instructor, System",
        "description": "Allows instructors to manage question repositories, classify questions according to Bloom's Taxonomy cognitive levels, inspect empirical difficulty index (P-value), and balance assessment coverage.",
        "precondition": "Instructor is authenticated and has management access to assigned subjects.",
        "postcondition": "Questions are stored with cognitive dimensions; two-way TOS matrix is dynamically recalculated.",
        "main_scenario": (
            "1. Instructor navigates to the Question Bank module in sentinel-web.\n"
            "2. Instructor selects a subject offering and opens the TOS Distribution Matrix view.\n"
            "3. System displays the distribution grid correlating curricular topics with cognitive levels (Remembering, Understanding, Applying, Analyzing, Evaluating, Creating).\n"
            "4. Instructor clicks Add Question and enters prompt, question type (MCQ, Multi-select, Essay), rubric criteria, and target topic.\n"
            "5. Instructor assigns the intended Bloom's Taxonomy cognitive level.\n"
            "6. System validates the question schema via Zod and commits record to PostgreSQL.\n"
            "7. System updates the real-time TOS matrix showing question weight totals and percentage distribution."
        ),
        "alt_scenario": (
            "4a. Question Exposure Threshold Exceeded:\n"
            "  1. An existing question's usage count exceeds the maximum limit (default: 3 iterations).\n"
            "  2. System automatically marks the item as RETIRED to maintain test security and prompts the instructor to replace or revise the item."
        )
    },
    {
        "id": "UC-05",
        "table_num": "Table 7.5",
        "name": "Generate AI-Assisted Question Drafts",
        "actors": "Instructor, Gemini AI / Vertex AI Service, System",
        "description": "Utilizes cloud-hosted generative AI (Google Cloud Vertex AI with Google AI Studio fallback) to generate structured assessment items from uploaded syllabus documents or prompt topics.",
        "precondition": "Instructor has selected an active question collection and provided topic parameters or syllabus text.",
        "postcondition": "Candidate questions are generated, validated against schema rules, and staged for instructor review.",
        "main_scenario": (
            "1. Instructor navigates to the Question Bank and launches the AI Question Generator modal.\n"
            "2. Instructor specifies the topic, target learning competencies, quantity, difficulty tier, and Bloom's cognitive distribution.\n"
            "3. Instructor clicks Generate Questions.\n"
            "4. Backend API formats a prompt payload with strict JSON output constraints.\n"
            "5. Backend dispatches the request to Google Vertex AI using the project service account credentials.\n"
            "6. Vertex AI returns structured JSON containing question stems, distractor options, explanations, and answer keys.\n"
            "7. System parses and validates the response using @sentinel/shared schemas.\n"
            "8. System presents the generated questions in an interactive preview drawer.\n"
            "9. Instructor reviews, edits, selects, and commits accepted questions to the bank."
        ),
        "alt_scenario": (
            "5a. Vertex AI Rate Limit or Service Failure:\n"
            "  1. Vertex AI call times out or encounters quota limits.\n"
            "  2. System automatically switches to the secondary Google AI Studio Gemini API fallback.\n"
            "  3. If fallback succeeds, generation completes normally.\n"
            "  4. If both fail, system alerts instructor: 'AI generation service temporarily unavailable. Please try again or create items manually.'"
        )
    },
    {
        "id": "UC-06",
        "table_num": "Table 7.6",
        "name": "Configure, Build, and Publish Examination",
        "actors": "Instructor, Department Admin (Optional Approver), System",
        "description": "Constructs an examination by combining question items, setting proctoring parameters (MediaPipe vision, YAMNet audio, browser lockdown), assigning classroom sections, and scheduling delivery windows.",
        "precondition": "Sufficient active questions exist in the question bank; classrooms have enrolled student rosters.",
        "postcondition": "Exam is scheduled; proctoring rule sets are initialized; essay rubric definitions are finalized.",
        "main_scenario": (
            "1. Instructor opens the Exam Builder and inputs title, description, time limit, and passing percentage.\n"
            "2. Instructor sets proctoring policies: Gaze Deviation Tracking, Face Absence Tolerance, Edge Audio Anomaly Detection, Fullscreen Lockdown.\n"
            "3. Instructor attaches questions from the question bank or TOS matrix.\n"
            "4. Instructor selects target classroom sections and schedules delivery date and window.\n"
            "5. Instructor assigns proctors to the exam session.\n"
            "6. Instructor clicks Publish Examination.\n"
            "7. System validates that questions, rubrics, and schedules are complete.\n"
            "8. System updates exam status to PUBLISHED and generates exam roster entries for all eligible students."
        ),
        "alt_scenario": (
            "7a. Incomplete TOS or Question Allocation:\n"
            "  1. System detects unassigned point values or empty sections in the assessment.\n"
            "  2. System prevents publication and highlights incomplete configuration fields."
        )
    },
    {
        "id": "UC-07",
        "table_num": "Table 7.7",
        "name": "Conduct Pre-Exam Hardware & Readiness Check",
        "actors": "Student, System",
        "description": "Executes pre-flight diagnostics prior to admitting a student into an exam session, verifying webcam, microphone, network stability, and computing baseline facial gaze calibration.",
        "precondition": "Student is enrolled in the exam roster and the exam window is open.",
        "postcondition": "Student hardware permissions are granted, neutral gaze calibration profile is saved, and student is cleared for lobby admission.",
        "main_scenario": (
            "1. Student selects an upcoming scheduled exam from their dashboard.\n"
            "2. System displays examination instructions, anti-cheat policy, and privacy disclosures.\n"
            "3. Student acknowledges disclosures and clicks Start Readiness Check.\n"
            "4. System requests browser permissions for Camera and Microphone.\n"
            "5. Student grants device access permissions.\n"
            "6. System initializes MediaPipe Face Mesh on the client edge and prompts the student to align their face inside the designated viewport target.\n"
            "7. System captures 5 calibration frames to calculate the student's neutral Eye Aspect Ratio (EAR) and iris center offset.\n"
            "8. System tests microphone input level via RMS waveform analysis to confirm audio capture.\n"
            "9. System runs a network latency ping check.\n"
            "10. All checks pass; system generates a MediaPipeCalibrationProfile and unlocks the Join Lobby button."
        ),
        "alt_scenario": (
            "5a. Camera or Microphone Permission Denied:\n"
            "  1. Browser denies peripheral hardware access.\n"
            "  2. System displays troubleshooting steps and blocks advancement until access is allowed.\n"
            "6a. Multiple Faces or Obscured Face Detected:\n"
            "  1. MediaPipe detects more than one face or landmark confidence below threshold.\n"
            "  2. System displays a warning modal: 'Please ensure you are alone and in a well-lit environment.'"
        )
    },
    {
        "id": "UC-08",
        "table_num": "Table 7.8",
        "name": "Manage Exam Lobby & Admit Candidates",
        "actors": "Student, Proctor / Instructor, System",
        "description": "Holds validated candidates in a staging area until the proctor authorizes entrance or the scheduled release time arrives.",
        "precondition": "Student has completed hardware readiness checks; exam session is in LOBBY status.",
        "postcondition": "Student is granted access to the active assessment runtime; exam timer is initialized.",
        "main_scenario": (
            "1. Student joins the digital waiting room (Exam Lobby).\n"
            "2. System registers student presence on the Proctor Monitoring Console via WebSocket.\n"
            "3. Proctor reviews the candidate roster, readiness flags, and verification snapshots.\n"
            "4. Proctor clicks Admit All or admits candidates individually.\n"
            "5. System pushes an admission event via Supabase Realtime broadcast to the student client.\n"
            "6. Student client receives the signal, serializes the immutable assessment_snapshot and active rubric, and transitions into the active exam interface."
        ),
        "alt_scenario": (
            "4a. Proctor Denies Admission:\n"
            "  1. Proctor flags a candidate (e.g., unauthorized environment, unverified identity).\n"
            "  2. Proctor clicks Deny Admission with a specified reason.\n"
            "  3. System alerts student client with proctor remarks and terminates attempt entry."
        )
    },
    {
        "id": "UC-09",
        "table_num": "Table 7.9",
        "name": "Take Proctored Exam & Synchronize Answers",
        "actors": "Student, System",
        "description": "Delivers question items to the student, enables navigation and response input, performs periodic background answer auto-saving, and handles final submission.",
        "precondition": "Student has been admitted to the active exam session; attempt record is in IN_PROGRESS status.",
        "postcondition": "All student responses are saved; assessment attempt transitions to SUBMITTED.",
        "main_scenario": (
            "1. Student views exam interface containing the question pane, navigation palette, and remaining time countdown.\n"
            "2. Student selects or writes responses to question items.\n"
            "3. Every 15 seconds or upon question navigation, system dispatches an auto-save payload.\n"
            "4. Backend API upserts responses into exam_attempt_answers via Kysely.\n"
            "5. Student completes all questions and clicks Submit Exam.\n"
            "6. System prompts confirmation dialog summarizing answered vs. unanswered questions.\n"
            "7. Student confirms submission.\n"
            "8. System locks the session, records final submission timestamp, and computes scores for objective items."
        ),
        "alt_scenario": (
            "3a. Intermittent Network Disconnection:\n"
            "  1. Client encounters network failure during attempt.\n"
            "  2. System stores responses locally in browser IndexedDB or mobile AsyncStorage.\n"
            "  3. System displays offline indicator but permits student to continue typing.\n"
            "  4. When connectivity restores, client automatically flushes cached responses to the API.\n"
            "8a. Exam Timer Expiration:\n"
            "  1. Session countdown reaches 00:00:00.\n"
            "  2. System immediately freezes user input, forces auto-submission of all recorded responses, and transitions attempt to SUBMITTED."
        )
    },
    {
        "id": "UC-10",
        "table_num": "Table 7.10",
        "name": "Detect Edge AI Vision & Acoustic Anomalies",
        "actors": "MediaPipe Edge Vision, TensorFlow.js / YAMNet Worker, Telemetry Service, System",
        "description": "Executes real-time client-side computer vision (gaze tracking, face absence, multiple faces) and audio classification (talking, background speech, silence) on the user's device, dispatching telemetry alerts when safety thresholds are breached.",
        "precondition": "Exam session is active; student webcam and microphone media streams are bound to monitoring workers.",
        "postcondition": "Proctoring incidents and forensic image frames are streamed to the backend and queued for instructor review.",
        "main_scenario": (
            "1. Client initializes MediaPipe face-mesh worker processing video frames at 500 ms intervals.\n"
            "2. Client initializes YAMNet audio worker processing 15,600 audio samples (0.975s window at 16 kHz) off the UI thread.\n"
            "3. MediaPipe detects iris displacement exceeding calibrated thresholds for >= 3 consecutive seconds (GAZE_OFF_SCREEN).\n"
            "4. Audio worker identifies speech patterns with >= 0.70 probability (SPEECH_DETECTED).\n"
            "5. Telemetry controller batches events and captures a forensic WebP video frame snapshot.\n"
            "6. Client posts incident payload to Sentinel API /telemetry/ingest.\n"
            "7. API validates rules, enqueues the event into Redis/BullMQ, uploads evidence image to Supabase Storage, and writes record to exam_proctoring_incidents.\n"
            "8. System broadcasts real-time anomaly badge update to the Proctor Console."
        ),
        "alt_scenario": (
            "3a. Brief Natural Blinks or Minor Gaze Shifts:\n"
            "  1. Eye aspect ratio drops below threshold for < 800 ms.\n"
            "  2. Edge debouncer classifies event as a standard blink and suppresses telemetry generation."
        )
    },
    {
        "id": "UC-11",
        "table_num": "Table 7.11",
        "name": "Conduct On-Demand WebRTC Live Video Inspection",
        "actors": "Proctor / Instructor, Student Client, LiveKit SFU, System",
        "description": "Allows a proctor to selectively view a live video/audio stream of a candidate on demand via LiveKit WebRTC when anomaly flags are raised, conserving bandwidth during normal testing.",
        "precondition": "Student is actively taking an examination; proctor is monitoring the session console.",
        "postcondition": "Direct WebRTC media stream is established and displayed in the proctor inspection modal; stream is safely torn down upon closure.",
        "main_scenario": (
            "1. Proctor observes persistent anomaly flags on a specific student card in the Monitoring Dashboard.\n"
            "2. Proctor clicks Inspect Live Feed.\n"
            "3. System requests a LiveKit room token with subscriber rights from /examination/live-inspection/token.\n"
            "4. System dispatches a request-stream action to the student client via Supabase Realtime WebSocket broadcast channel.\n"
            "5. Student client receives the broadcast, requests a LiveKit publisher token, and attaches their webcam video track to the LiveKit room.\n"
            "6. LiveKit SFU negotiates WebRTC connection and relays the student video stream to the proctor console.\n"
            "7. Proctor observes student behavior in real time and verifies whether cheating is taking place.\n"
            "8. Proctor closes the inspection window.\n"
            "9. System broadcasts a stop-stream action; student client unpublishes track and releases SFU resources."
        ),
        "alt_scenario": (
            "6a. Student Network Blocks WebRTC UDP Ports:\n"
            "  1. Direct WebRTC peer connection fails to establish.\n"
            "  2. LiveKit automatically falls back to TURN over TCP/TLS.\n"
            "  3. Video stream connects with slight latency; proctor is alerted of restricted student network conditions."
        )
    },
    {
        "id": "UC-12",
        "table_num": "Table 7.12",
        "name": "Review Incidents, Flags, and Forensic Evidence",
        "actors": "Proctor, Disciplinary Officer, Instructor, System",
        "description": "Provides an audit dashboard for review personnel to inspect logged incidents, examine captured forensic image snapshots, adjust incident severity, and clear false positives or confirm infractions.",
        "precondition": "Proctoring incidents have been ingested and recorded during or after an exam attempt.",
        "postcondition": "Incidents are categorized as CONFIRMED, DISMISSED (false positive), or ESCALATED; student integrity score is adjusted.",
        "main_scenario": (
            "1. Reviewer opens the Incident Review Console for a completed exam.\n"
            "2. System displays candidate list sorted by anomaly frequency and severity score.\n"
            "3. Reviewer selects a student to open their comprehensive incident timeline.\n"
            "4. System displays chronological event list (e.g., Gaze Off Screen, Voice Detected, Multiple Faces) synchronized with attempt questions.\n"
            "5. Reviewer clicks on an incident to inspect the stored forensic WebP snapshot captured at the moment of violation.\n"
            "6. Reviewer assesses whether the flag represents legitimate malpractice or an innocent environment factor.\n"
            "7. Reviewer updates incident status to CONFIRMED or DISMISSED with explanatory remarks.\n"
            "8. System updates the attempt's integrity report and recalculates penalty weights."
        ),
        "alt_scenario": (
            "7a. Escalation for Disciplinary Action:\n"
            "  1. Malpractice is severe (e.g., unauthorized secondary person or device visible).\n"
            "  2. Reviewer selects ESCALATE_TO_BOARD.\n"
            "  3. System generates an encrypted forensic evidence package accessible to the institution's Disciplinary Officer."
        )
    },
    {
        "id": "UC-13",
        "table_num": "Table 7.13",
        "name": "Evaluate Essay Submissions via Rubric Snapshot",
        "actors": "Instructor, AI Evaluation Service, System",
        "description": "Grades open-ended essay questions by scoring responses against the immutable rubric snapshot captured at the start of the student's attempt, supporting instructor manual scoring and AI-assisted evaluations.",
        "precondition": "Student has submitted an exam containing essay questions; attempt snapshot contains frozen rubric criteria.",
        "postcondition": "Essay criteria scores and qualitative feedback are saved; final score is updated.",
        "main_scenario": (
            "1. Instructor navigates to the Grading Center in sentinel-web and selects an ungraded attempt.\n"
            "2. System displays student's submitted essay text alongside the rubric criteria captured in assessment_snapshot (e.g., Vocabulary, Argument Coherence, Technical Accuracy).\n"
            "3. Instructor clicks AI Grade Suggestion (Optional).\n"
            "4. System evaluates the essay against rubric levels using Gemini and presents suggested scores with justification.\n"
            "5. Instructor reviews, modifies or accepts criterion scores and writes qualitative feedback remarks.\n"
            "6. Instructor submits the completed evaluation.\n"
            "7. System aggregates objective question scores with essay scores, computes final percentage, and updates attempt status to GRADED."
        ),
        "alt_scenario": (
            "2a. Legacy Attempt Without Custom Rubric:\n"
            "  1. System detects attempt record predates custom rubric support (v1 snapshot).\n"
            "  2. System automatically loads the legacy-standard-v1 5-criteria baseline rubric so grading proceeds seamlessly without breaking legacy data."
        )
    },
    {
        "id": "UC-14",
        "table_num": "Table 7.14",
        "name": "Generate Examination Analytics & Audit Reports",
        "actors": "Instructor, Department Admin, Support Personnel, System",
        "description": "Produces comprehensive analytical summaries, item discrimination statistics, TOS achievement distribution, student grade rosters, and compliance PDF audit reports.",
        "precondition": "Exam session has concluded and all attempts are in GRADED status.",
        "postcondition": "Formatted analytics charts and exportable PDF / CSV reports are generated.",
        "main_scenario": (
            "1. Instructor or Admin opens the Reports & Analytics module for a specific exam.\n"
            "2. System compiles and renders metrics: Class Mean, Median, Score Distribution Histogram, and Pass/Fail ratio.\n"
            "3. System renders the post-exam TOS achievement matrix indicating student performance across Bloom's Taxonomy cognitive tiers.\n"
            "4. System calculates empirical Item Difficulty (P-value) for each question (P = Correct / Total) and flags items that were excessively easy or difficult.\n"
            "5. User clicks Export Official Grade Sheet (CSV) or Download Comprehensive Exam Audit Report (PDF).\n"
            "6. System generates the signed document containing roster grades, proctoring incident tallies, and instructor signatures."
        ),
        "alt_scenario": (
            "5a. Institutional Disciplinary Audit Request:\n"
            "  1. Department Admin or Disciplinary Officer requests an official integrity audit.\n"
            "  2. System generates an Incident Log Report detailing every timestamped violation, device telemetry reading, and supervisor review action."
        )
    }
]

# ==============================================================================
# TABLE 8: MOBILE APPLICATION USE CASES (STUDENT FOCUSED - sentinel-mobile)
# ==============================================================================
MOBILE_USE_CASES = [
    {
        "id": "MOB-01",
        "table_num": "Table 8.1",
        "name": "Authenticate Student on Mobile Application",
        "actors": "Student, Supabase Auth, SecureStorage System",
        "description": "Authenticates the student on the native Expo mobile app using email credentials or OAuth session, validates student role, and safely stores the access token in device hardware-backed secure storage (Expo SecureStore / AsyncStorage).",
        "precondition": "Student has installed the native mobile app (Android or iOS) and has an active network connection.",
        "postcondition": "Access tokens are securely persisted on the mobile device, user profile is loaded, and student is routed to the Mobile Student Dashboard.",
        "main_scenario": (
            "1. Student launches the Sentinel mobile application (sentinel-mobile).\n"
            "2. System checks local storage for existing valid session tokens.\n"
            "3. If no session exists, system renders the native Mobile Login Screen (app/(auth)/login.tsx).\n"
            "4. Student inputs registered email address and password and taps Sign In.\n"
            "5. System dispatches authentication request to Supabase Auth.\n"
            "6. Supabase Auth validates credentials and returns session tokens and user metadata.\n"
            "7. Mobile client verifies that the user possesses the student role.\n"
            "8. System persists session tokens to encrypted device storage.\n"
            "9. System routes the student to the main Mobile Tabs view (app/(tabs))."
        ),
        "alt_scenario": (
            "4a. Biometric Sign-In Available:\n"
            "  1. Student enables Face ID / Fingerprint authentication.\n"
            "  2. Device validates biometric sensor and unlocks stored session token without re-typing password.\n"
            "5a. Invalid Credentials:\n"
            "  1. Supabase Auth returns invalid credentials error.\n"
            "  2. System presents native alert dialog: 'Invalid email or password. Please try again.'\n"
            "7a. Unauthorized Role (Non-Student):\n"
            "  1. System detects the authenticated account belongs to an Instructor, Admin, or Support role.\n"
            "  2. System signs out session and alerts: 'The Sentinel Mobile App is restricted to Student access. Please use the Web Application for administrative and instructor functions.'"
        )
    },
    {
        "id": "MOB-02",
        "table_num": "Table 8.2",
        "name": "Complete Mobile Student Onboarding & Whitelist Verification",
        "actors": "Student, System",
        "description": "Guides a newly registered student through mobile onboarding by verifying their official student number against the institutional database whitelist and linking their academic department and program.",
        "precondition": "Student is authenticated on mobile but has not finalized their academic profile.",
        "postcondition": "Student record is mapped to institution, department, and course; student whitelist status is set to CLAIMED.",
        "main_scenario": (
            "1. Mobile app detects that the authenticated student has not completed onboarding.\n"
            "2. System routes student to the native Onboarding flow (app/(onboarding)).\n"
            "3. Student selects their enrolled Institution from a searchable picker.\n"
            "4. System loads the department and degree program lists for the selected institution.\n"
            "5. Student selects their Academic Department and Degree Course.\n"
            "6. Student inputs their official Student Identification Number.\n"
            "7. Student taps Verify & Complete Registration.\n"
            "8. System sends payload to POST /identity/onboarding/student.\n"
            "9. API validates student number against student_whitelist.\n"
            "10. System associates the profile, marks whitelist record as claimed, and transitions the student to the active student dashboard."
        ),
        "alt_scenario": (
            "9a. Student Number Not on Whitelist:\n"
            "  1. API returns 404 Not Found indicating student ID is not registered for that department.\n"
            "  2. Mobile app displays alert: 'Student number not found in department whitelist. Please verify with your department registrar.'\n"
            "9b. Student Number Already Claimed:\n"
            "  1. API returns 409 Conflict stating student ID was already claimed by another account.\n"
            "  2. Mobile app alerts user of conflict and directs them to institutional support."
        )
    },
    {
        "id": "MOB-03",
        "table_num": "Table 8.3",
        "name": "View Enrolled Classrooms, Subjects, & Exam Schedule",
        "actors": "Student, System",
        "description": "Allows the student to inspect their active classroom rosters, enrolled subject offerings, assigned instructor details, and upcoming examination timelines.",
        "precondition": "Student has completed onboarding and is enrolled in one or more academic classrooms.",
        "postcondition": "Roster schedules and examination cards are rendered on the mobile interface.",
        "main_scenario": (
            "1. Student selects the Classrooms tab (app/(tabs)/classroom) or Exams tab (app/(tabs)/exam).\n"
            "2. Mobile client queries Sentinel API endpoints for enrolled classrooms and published assessments.\n"
            "3. System displays cards grouped by status (Upcoming, In-Progress, Completed, Past).\n"
            "4. Student taps on an exam card to view assessment metadata: Title, Subject Code, Assigned Instructor, Duration, Allowed Attempts, and Proctoring Rules.\n"
            "5. System displays the exact scheduled start date and countdown timer formatted via exam-start-date-format.ts.\n"
            "6. Student taps the Calendar tab (app/(tabs)/calendar.tsx) to view synchronized monthly assessment milestones."
        ),
        "alt_scenario": (
            "2a. Offline or Poor Network Connectivity:\n"
            "  1. Mobile client fails to reach Sentinel API.\n"
            "  2. React Query loads cached classroom and exam records from local persistent cache and displays an offline status banner."
        )
    },
    {
        "id": "MOB-04",
        "table_num": "Table 8.4",
        "name": "Conduct Mobile Hardware Diagnostics & Gaze Baseline Calibration",
        "actors": "Student, Mobile Camera System, MediaPipe Edge Engine, System",
        "description": "Performs pre-flight hardware verification on the student's mobile device, acquiring front-camera and microphone permissions, verifying network latency, and calibrating neutral facial gaze geometry.",
        "precondition": "Student selects an upcoming scheduled exam; examination window is open.",
        "postcondition": "Hardware access is verified; neutral calibration profile (MediaPipeCalibrationProfile) is established and stored in mobile state.",
        "main_scenario": (
            "1. Student taps Take Exam on an active exam card.\n"
            "2. System displays the Mobile Privacy Notice (app/exam/[id]/privacy).\n"
            "3. Student reviews data collection consent regarding camera, microphone, and device telemetry and taps Accept & Continue.\n"
            "4. System displays Examination Instructions (app/exam/[id]/instruction) detailing mobile kiosk rules and anti-cheat policies.\n"
            "5. Student proceeds to the Hardware Checkup screen (app/exam/[id]/checkup).\n"
            "6. System requests native OS Camera and Microphone permissions via Expo.\n"
            "7. Student approves permissions.\n"
            "8. System initializes the front-facing camera preview with an oval face-mesh target overlay.\n"
            "9. Student centers their face within the target guide under normal lighting.\n"
            "10. Mobile edge engine (mobile-mediapipe-calibration.ts) captures 5 consecutive frame samples to calculate the student's baseline Eye Aspect Ratio (EAR) and neutral iris coordinate offset.\n"
            "11. System tests microphone input level and runs a network latency ping check.\n"
            "12. All diagnostics pass; system unlocks the Proceed to Lobby button."
        ),
        "alt_scenario": (
            "7a. Camera / Microphone Permission Denied:\n"
            "  1. Student denies permission in device OS dialog.\n"
            "  2. App disables progress and displays button: 'Open Device Settings to Enable Permissions.'\n"
            "10a. Face Not Centered or Multiple Faces Detected:\n"
            "  1. Calibration engine detects unstable iris coordinates or multiple faces.\n"
            "  2. System vibrates haptic feedback and displays warning: 'Please ensure only your face is visible and look directly at the front camera.'"
        )
    },
    {
        "id": "MOB-05",
        "table_num": "Table 8.5",
        "name": "Join Mobile Exam Lobby & Await Proctor Admission",
        "actors": "Student, Proctor, Supabase Realtime Service, System",
        "description": "Places the candidate in a mobile digital staging lobby, establishes a live WebSocket connection to the proctor console, and transitions into the exam when authorized.",
        "precondition": "Student has successfully passed hardware diagnostics and calibration.",
        "postcondition": "Student client joins the active exam room; assessment attempt is initialized in IN_PROGRESS status.",
        "main_scenario": (
            "1. Student taps Enter Exam Lobby (app/exam/[id]/lobby).\n"
            "2. Mobile client connects to the Supabase Realtime WebSocket broadcast channel (exam:[examId]:monitoring).\n"
            "3. System displays candidate waiting screen showing live countdown to scheduled start time, proctor announcement feed, and readiness status.\n"
            "4. Proctor reviews candidate readiness on the Proctor Console and triggers an admission broadcast.\n"
            "5. Mobile client receives the 'admit' event.\n"
            "6. System downloads the immutable assessment_snapshot (including randomized questions and rubric definition).\n"
            "7. System transitions the mobile application into the active exam session (app/exam/[id]/session)."
        ),
        "alt_scenario": (
            "4a. Proctor Denies Admission:\n"
            "  1. Proctor flags candidate due to improper environment or identity mismatch.\n"
            "  2. Mobile client receives 'deny' broadcast with custom reason note.\n"
            "  3. System removes candidate from lobby and displays notice: 'Admission denied by proctor: [Reason]. Contact your instructor.'"
        )
    },
    {
        "id": "MOB-06",
        "table_num": "Table 8.6",
        "name": "Execute Exam Session under Mobile Kiosk Lockdown",
        "actors": "Student, Native Security Controller (use-exam-session-security.ts), System",
        "description": "Delivers the active assessment within a native kiosk-locked mobile interface that blocks screen capture/recording, intercepts app switching, detects split-screen multitasking, and displays countdown timers.",
        "precondition": "Student has been admitted into the active exam session.",
        "postcondition": "Student navigates and responds to questions while hardware and OS security rules are strictly enforced.",
        "main_scenario": (
            "1. Mobile application mounts the Exam Session Screen (app/exam/[id]/session).\n"
            "2. Native security module activates expo-screen-capture to prevent OS screenshots and screen recording.\n"
            "3. Security hook (use-exam-session-security.ts) binds to native AppState change events.\n"
            "4. System renders the active question card, answer options, remaining time timer, and bottom Question Drawer button.\n"
            "5. Student answers questions by tapping radio choices, checkboxes, or typing essay paragraphs.\n"
            "6. Student uses swipe gestures or question palette drawer to jump between questions.\n"
            "7. Visual status badges in the drawer update in real-time (Unanswered, Answered, Flagged for Review)."
        ),
        "alt_scenario": (
            "3a. Student Attempts to Leave App or Switch to Another App:\n"
            "  1. Student swipes to home screen, opens recent apps tray, or receives an incoming phone call.\n"
            "  2. AppState transitions from active to background / inactive.\n"
            "  3. Security hook intercepts transition and logs APP_BACKGROUNDED violation with microsecond timestamp.\n"
            "  4. System increments the student's violation counter and queues a high-priority telemetry payload.\n"
            "  5. Upon re-entering the app, system displays a high-priority warning modal: 'Violation Detected: You navigated away from the exam. This incident has been logged and reported to the proctor.'\n"
            "3b. Hardware Screenshot Attempt:\n"
            "  1. Student presses power + volume buttons to capture screen.\n"
            "  2. OS hardware layer blanks the frame buffer (resulting in pure black image).\n"
            "  3. App captures screenshot event, logs SCREENSHOT_ATTEMPT, and emits telemetry alert."
        )
    },
    {
        "id": "MOB-07",
        "table_num": "Table 8.7",
        "name": "Buffer Offline Responses & Synchronize Answer Payloads",
        "actors": "Student, Mobile Storage Engine, Synchronization Service, System",
        "description": "Ensures continuous testing without loss of data during mobile network drops by caching answers locally in AsyncStorage and automatically synchronizing payloads upon reconnection.",
        "precondition": "Exam session is in progress on the mobile device.",
        "postcondition": "All student inputs are saved locally and synced with Sentinel API PostgreSQL database.",
        "main_scenario": (
            "1. Student selects or modifies an answer choice or types text into an essay field.\n"
            "2. System immediately writes the updated answer to local device persistent storage (mobile-exam-storage.ts).\n"
            "3. Sync manager (use-exam-session-sync.ts) checks network connectivity.\n"
            "4. Network is active; sync manager batches answers via mobile-answer-payload-adapter.ts and posts to /examination/exam-attempts/{id}/answers.\n"
            "5. Backend API returns 200 OK confirmation.\n"
            "6. Mobile interface updates question indicator to show 'Synced' state."
        ),
        "alt_scenario": (
            "4a. Mobile Network Drop / Weak Signal:\n"
            "  1. Device loses Wi-Fi / cellular data connection.\n"
            "  2. Sync manager catches network failure and queues answers in a local offline buffer.\n"
            "  3. System displays a subtle offline banner: 'Working Offline - Answers saved securely on device.'\n"
            "  4. Student continues answering questions uninterrupted.\n"
            "  5. When network is restored, reconnection manager (mobile-exam-reconnection.ts) automatically flushes the buffered queue to the backend API."
        )
    },
    {
        "id": "MOB-08",
        "table_num": "Table 8.8",
        "name": "Capture Mobile Edge Vision & Acoustic Telemetry",
        "actors": "Front Camera, MediaPipe Edge Worker, Mobile Audio Bridge, Telemetry Client, System",
        "description": "Executes on-device computer vision and acoustic classification on the mobile client, buffering anomaly violations locally and dispatching batched telemetry to the API.",
        "precondition": "Exam session is active with monitoring enabled; camera and microphone streams are active.",
        "postcondition": "Telemetry incidents and forensic snapshots are safely transmitted to Sentinel telemetry ingestion pipeline.",
        "main_scenario": (
            "1. Mobile camera component captures front-facing video frames at periodic intervals (mobile-frame-capture.ts).\n"
            "2. Edge vision runner (use-mobile-mediapipe-monitoring.ts) evaluates face presence, eye bounding ratios, and iris deviation against the baseline calibration.\n"
            "3. Headless audio bridge (mobile-audio-bridge.tsx) executes TensorFlow.js YAMNet audio classification to detect acoustic events (talking, whispered speech, background chatter).\n"
            "4. Vision runner detects pupil deviation outside viewport for >= 3 seconds (GAZE_OFF_SCREEN).\n"
            "5. Telemetry engine captures a forensic WebP frame snapshot.\n"
            "6. Client aggregates telemetry events via mobile-telemetry-client.ts and dispatches to /telemetry/ingest/batch.\n"
            "7. Backend BullMQ queue processes events, uploads evidence snapshot to Supabase storage, and updates the proctor monitoring console."
        ),
        "alt_scenario": (
            "4a. Phone Tilted or Moved During Natural Shift:\n"
            "  1. Face landmark detection confidence drops temporarily for < 1.5 seconds.\n"
            "  2. Smoothing filter dampens deviation and suppresses false-positive alert."
        )
    },
    {
        "id": "MOB-09",
        "table_num": "Table 8.9",
        "name": "Stream Front Camera for On-Demand Proctor Live Inspection",
        "actors": "Student, Proctor, LiveKit SFU Server, System",
        "description": "Enables real-time front-camera WebRTC video streaming from the student's mobile phone to the proctor console upon proctor request when serious anomalies occur.",
        "precondition": "Student is taking the exam on mobile; proctor initiates inspection on the web console.",
        "postcondition": "Live video track is published to LiveKit SFU; stream terminates immediately upon inspection close.",
        "main_scenario": (
            "1. Proctor clicks Inspect Live Feed on the web monitoring console for a flagged mobile student.\n"
            "2. System broadcasts a request-stream action via Supabase Realtime channel.\n"
            "3. Mobile inspection hook (use-mobile-live-inspection.ts) receives the broadcast action.\n"
            "4. Mobile client requests a signed LiveKit publisher token from the backend API.\n"
            "5. Mobile WebRTC bridge (mobile-live-inspection-bridge.tsx) connects to the LiveKit room.\n"
            "6. Client attaches the mobile front camera video track to the LiveKit room.\n"
            "7. LiveKit SFU relays video stream to the proctor's monitoring screen.\n"
            "8. Proctor completes visual inspection and closes the feed modal.\n"
            "9. Student client receives stop-stream action, disconnects from LiveKit, and unpublishes camera track to conserve mobile battery and bandwidth."
        ),
        "alt_scenario": (
            "5a. Student Rejects / Network Throttles Video Connection:\n"
            "  1. Mobile client detects insufficient bandwidth or connection drop.\n"
            "  2. Client falls back to sending low-resolution snapshot bursts every 5 seconds until connection recovers."
        )
    },
    {
        "id": "MOB-10",
        "table_num": "Table 8.10",
        "name": "Submit Examination, Provide Experience Feedback, & Review Results",
        "actors": "Student, System",
        "description": "Handles final assessment submission on mobile, collects student feedback and potential anomaly contestation remarks, and presents score results.",
        "precondition": "Student has completed the exam questions or timer has expired.",
        "postcondition": "Attempt status is set to SUBMITTED; feedback is recorded; objective score and integrity summary are displayed.",
        "main_scenario": (
            "1. Student taps Submit Exam button on the mobile session screen.\n"
            "2. System presents native submission confirmation modal displaying total questions, answered count, and unanswered warnings.\n"
            "3. Student confirms submission.\n"
            "4. Submission hook (use-exam-session-submission.ts) flushes all remaining cached answers and transitions attempt status to SUBMITTED.\n"
            "5. System routes student to the Feedback screen (app/exam/[id]/feedback).\n"
            "6. Student submits star rating, user experience feedback, and any remarks regarding proctoring incidents or environment interruptions.\n"
            "7. System routes student to the Result screen (app/exam/[id]/result).\n"
            "8. If results are published immediately, system displays total score, percentage, passing benchmark, time spent, and total proctoring flags logged."
        ),
        "alt_scenario": (
            "3a. Exam Timer Hits Zero:\n"
            "  1. Session countdown expires (00:00:00).\n"
            "  2. Mobile client triggers automatic haptic vibration, freezes question inputs, automatically flushes stored answers, and forces submission.\n"
            "8a. Results Delayed / Manual Essay Grading Required:\n"
            "  1. Exam contains open-ended essay questions awaiting instructor evaluation.\n"
            "  2. System displays: 'Submission Received. Objective items scored; final results will be available once essays are evaluated by your instructor.'"
        )
    },
    {
        "id": "MOB-11",
        "table_num": "Table 8.11",
        "name": "Engage in In-App Proctor Support Messaging & View Academic Schedule",
        "actors": "Student, Instructor / Proctor, Support Personnel",
        "description": "Provides communication channels for students to message proctors or instructors regarding exam inquiries, technical issues, or schedule clarifications, and view synchronized dates.",
        "precondition": "Student is authenticated on the mobile app.",
        "postcondition": "Messages are securely transmitted in real time and synced with conversation threads.",
        "main_scenario": (
            "1. Student taps the Messages tab (app/(tabs)/messages.tsx).\n"
            "2. System loads conversation threads associated with enrolled courses and active examinations.\n"
            "3. Student selects an instructor or active exam proctor thread.\n"
            "4. Student types inquiry regarding exam venue, technical requirements, or schedule clarifications and taps Send.\n"
            "5. System dispatches message via Supabase Realtime messaging channel.\n"
            "6. Instructor / proctor receives notification and responds to the student.\n"
            "7. Student navigates to the Calendar tab (app/(tabs)/calendar.tsx) to view synchronized dates and upcoming assessment deadlines."
        ),
        "alt_scenario": (
            "4a. Emergency Message During Active Exam:\n"
            "  1. Student encounters critical device issue during exam.\n"
            "  2. Student uses the floating emergency proctor contact button inside the session drawer.\n"
            "  3. A high-priority urgent alert is dispatched directly to the proctor console banner."
        )
    }
]

# ==============================================================================
# GENERATOR FUNCTIONS
# ==============================================================================

def export_csv(use_cases, filename):
    filepath = os.path.join(OUTPUT_DIR, filename)
    with open(filepath, mode="w", newline="", encoding="utf-8-sig") as f:
        writer = csv.writer(f)
        writer.writerow(["Table Number", "Field", "Content"])
        for uc in use_cases:
            writer.writerow([uc["table_num"], "Use Case Name", uc["name"]])
            writer.writerow([uc["table_num"], "Actor(s)", uc["actors"]])
            writer.writerow([uc["table_num"], "Description", uc["description"]])
            writer.writerow([uc["table_num"], "Pre-condition", uc["precondition"]])
            writer.writerow([uc["table_num"], "Post-condition", uc["postcondition"]])
            writer.writerow([uc["table_num"], "Main Scenario", uc["main_scenario"]])
            writer.writerow([uc["table_num"], "Alternative Scenario", uc["alt_scenario"]])
            writer.writerow([])
    print(f"Generated CSV: {filepath}")

def export_tsv(use_cases, filename):
    filepath = os.path.join(OUTPUT_DIR, filename)
    with open(filepath, mode="w", newline="", encoding="utf-8-sig") as f:
        writer = csv.writer(f, delimiter="\t")
        for uc in use_cases:
            writer.writerow([f"{uc['table_num']} Use Case Narrative: {uc['name']}", ""])
            writer.writerow(["Use Case Name", uc["name"]])
            writer.writerow(["Actor(s)", uc["actors"]])
            writer.writerow(["Description", uc["description"]])
            writer.writerow(["Pre-condition", uc["precondition"]])
            writer.writerow(["Post-condition", uc["postcondition"]])
            writer.writerow(["Main Scenario", uc["main_scenario"]])
            writer.writerow(["Alternative Scenario", uc["alt_scenario"]])
            writer.writerow(["", ""])
    print(f"Generated TSV: {filepath}")

def export_html(use_cases, title, filename):
    filepath = os.path.join(OUTPUT_DIR, filename)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write("<!DOCTYPE html>\n<html>\n<head>\n<meta charset='utf-8'>\n")
        f.write(f"<title>{html.escape(title)}</title>\n")
        f.write("""<style>
            body { font-family: 'Times New Roman', Times, serif; margin: 40px; color: #111; line-height: 1.5; }
            h1 { font-size: 18pt; margin-bottom: 6px; }
            h2 { font-size: 13pt; margin-top: 30px; margin-bottom: 8px; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 25px; page-break-inside: avoid; }
            th, td { border: 1px solid #333; padding: 8px 12px; vertical-align: top; font-size: 11pt; }
            td.label { width: 22%; background-color: #d9d9d9; font-weight: bold; }
            td.content { width: 78%; }
            p.info { font-style: italic; color: #444; margin-bottom: 20px; }
        </style>\n</head>\n<body>\n""")
        
        f.write(f"<h1>{html.escape(title)}</h1>\n")
        f.write("<p class='info'>Instructions: Open this file in your browser, press <strong>Ctrl+A</strong> (or <strong>Cmd+A</strong>) and <strong>Ctrl+C</strong> (or <strong>Cmd+C</strong>), then paste directly into Microsoft Word or Google Sheets.</p><hr><br>\n")
        
        for uc in use_cases:
            f.write(f"<h2>{html.escape(uc['table_num'])} Use Case Narrative: {html.escape(uc['name'])}</h2>\n")
            f.write("<table>\n")
            
            rows = [
                ("Use Case Name", uc["name"]),
                ("Actor(s)", uc["actors"]),
                ("Description", uc["description"]),
                ("Pre-condition", uc["precondition"]),
                ("Post-condition", uc["postcondition"]),
                ("Main Scenario", uc["main_scenario"]),
                ("Alternative Scenario", uc["alt_scenario"]),
            ]
            
            for label, val in rows:
                formatted_val = html.escape(val).replace("\n", "<br>")
                f.write(f"  <tr>\n    <td class='label'>{html.escape(label)}</td>\n    <td class='content'>{formatted_val}</td>\n  </tr>\n")
            
            f.write("</table>\n<br>\n")
            
        f.write("</body>\n</html>\n")
    print(f"Generated HTML: {filepath}")

def export_docx(groups, filename):
    """
    groups: list of tuples (group_title, use_cases_list)
    """
    docx_path = os.path.join(OUTPUT_DIR, filename)
    ns = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
    
    body_xml_parts = []
    
    for group_title, use_cases in groups:
        # Group Heading
        body_xml_parts.append(
            f'<w:p xmlns:w="{ns}"><w:pPr><w:spacing w:before="360" w:after="180"/></w:pPr>'
            f'<w:r><w:rPr><w:b/><w:sz w:val="30"/><w:color w:val="1E3A8A"/></w:rPr><w:t>{html.escape(group_title)}</w:t></w:r></w:p>'
        )
        
        for uc in use_cases:
            # Table Title / Caption
            body_xml_parts.append(
                f'<w:p xmlns:w="{ns}"><w:pPr><w:spacing w:before="240" w:after="100"/></w:pPr>'
                f'<w:r><w:rPr><w:b/><w:sz w:val="23"/></w:rPr><w:t>{html.escape(uc["table_num"])} Use Case Narrative: {html.escape(uc["name"])}</w:t></w:r></w:p>'
            )
            
            # Table XML
            tbl = []
            tbl.append(f'<w:tbl xmlns:w="{ns}">')
            tbl.append('<w:tblPr>')
            tbl.append('<w:tblStyle w:val="TableGrid"/>')
            tbl.append('<w:tblW w:w="5000" w:type="pct"/>')
            tbl.append('<w:tblBorders>')
            tbl.append('<w:top w:val="single" w:sz="6" w:space="0" w:color="666666"/>')
            tbl.append('<w:left w:val="single" w:sz="6" w:space="0" w:color="666666"/>')
            tbl.append('<w:bottom w:val="single" w:sz="6" w:space="0" w:color="666666"/>')
            tbl.append('<w:right w:val="single" w:sz="6" w:space="0" w:color="666666"/>')
            tbl.append('<w:insideH w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>')
            tbl.append('<w:insideV w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>')
            tbl.append('</w:tblBorders>')
            tbl.append('</w:tblPr>')
            tbl.append('<w:tblGrid><w:gridCol w:w="2200"/><w:gridCol w:w="7400"/></w:tblGrid>')
            
            rows = [
                ("Use Case Name", uc["name"]),
                ("Actor(s)", uc["actors"]),
                ("Description", uc["description"]),
                ("Pre-condition", uc["precondition"]),
                ("Post-condition", uc["postcondition"]),
                ("Main Scenario", uc["main_scenario"]),
                ("Alternative Scenario", uc["alt_scenario"]),
            ]
            
            for label, val in rows:
                tbl.append('<w:tr>')
                # Col 1: Label with gray shading (#D9D9D9)
                tbl.append('<w:tc>')
                tbl.append('<w:tcPr>')
                tbl.append('<w:tcW w:w="2200" w:type="dxa"/>')
                tbl.append('<w:shd w:val="clear" w:color="auto" w:fill="D9D9D9"/>')
                tbl.append('</w:tcPr>')
                tbl.append(f'<w:p><w:r><w:rPr><w:b/><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="21"/></w:rPr><w:t>{html.escape(label)}</w:t></w:r></w:p>')
                tbl.append('</w:tc>')
                
                # Col 2: Content (handles newlines)
                tbl.append('<w:tc>')
                tbl.append('<w:tcPr><w:tcW w:w="7400" w:type="dxa"/></w:tcPr>')
                for line in val.split("\n"):
                    tbl.append(f'<w:p><w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="21"/></w:rPr><w:t xml:space="preserve">{html.escape(line)}</w:t></w:r></w:p>')
                tbl.append('</w:tc>')
                tbl.append('</w:tr>')
                
            tbl.append('</w:tbl>')
            body_xml_parts.append(''.join(tbl))
            
            # Spacer paragraph
            body_xml_parts.append(f'<w:p xmlns:w="{ns}"><w:pPr><w:spacing w:after="200"/></w:pPr></w:p>')
            
    doc_xml_str = (
        f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
        f'<w:document xmlns:w="{ns}">\n'
        f'<w:body>\n'
        + '\n'.join(body_xml_parts) +
        f'\n<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr>\n'
        f'</w:body>\n</w:document>'
    )
    
    with zipfile.ZipFile(TEMPLATE_DOCX, 'r') as zin:
        with zipfile.ZipFile(docx_path, 'w', compression=zipfile.ZIP_DEFLATED) as zout:
            for item in zin.infolist():
                if item.filename == 'word/document.xml':
                    zout.writestr(item, doc_xml_str.encode('utf-8'))
                elif not item.filename.startswith('word/media/'):
                    zout.writestr(item, zin.read(item.filename))
                    
    print(f"Generated DOCX: {docx_path}")

if __name__ == "__main__":
    # 1. Web Application Exports
    export_csv(WEB_USE_CASES, "sentinel-use-case-narratives.csv")
    export_tsv(WEB_USE_CASES, "sentinel-use-case-narratives.tsv")
    export_html(WEB_USE_CASES, "Sentinel Platform - Web Use Case Narratives", "sentinel-use-case-narratives.html")
    export_docx([("Table 7 Use Case Narratives of the Web Application", WEB_USE_CASES)], "SENTINEL-USE-CASE-NARRATIVES.docx")
    
    # 2. Mobile Application Exports (Student Focused)
    export_csv(MOBILE_USE_CASES, "sentinel-mobile-use-case-narratives.csv")
    export_tsv(MOBILE_USE_CASES, "sentinel-mobile-use-case-narratives.tsv")
    export_html(MOBILE_USE_CASES, "Sentinel Platform - Mobile Use Case Narratives (Student)", "sentinel-mobile-use-case-narratives.html")
    export_docx([("Table 8 Use Case Narratives of the Mobile Application", MOBILE_USE_CASES)], "SENTINEL-MOBILE-USE-CASE-NARRATIVES.docx")
    
    # 3. Master Combined Document (Both Web & Mobile for Full Manuscript)
    export_docx([
        ("Table 7 Use Case Narratives of the Web Application", WEB_USE_CASES),
        ("Table 8 Use Case Narratives of the Mobile Application", MOBILE_USE_CASES)
    ], "SENTINEL-COMPLETE-USE-CASE-NARRATIVES.docx")
