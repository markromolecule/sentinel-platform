# Audio Event Flagging Issue and Related Exam Flow Bugs

## Purpose

This document is context for a later LLM implementation plan. Do not treat it as a final plan yet. The future implementer should re-scan the current codebase and verify which items are still open, because related July task documents already mention partial or completed fixes around proctoring, audio anomaly detection, exam visibility, scoring, and remediation flows.

The main goal is to stabilize the student exam-taking experience and the data shown to students/instructors after an attempt:

- Audio anomaly events must be detected after the checkup flow and must appear as student/instructor-visible incidents.
- Browser security events must be counted exactly once per real occurrence.
- Normal exam submission must not create a false fullscreen-exit incident.
- Multiple-choice option labels must not be duplicated between generated content and the attempt UI.
- Result-page score summaries must match the durable attempt/history/report data, especially when essays still need grading.
- Assigned private exams must be visible to the correct students in the classroom and history/available surfaces.

## Related Existing Context

Review these before writing the implementation plan:

- `docs/context/July/issue-during-examination.md`
- `docs/context/July/reacalibrate-and-fix.md`
- `docs/context/July/exam-visibility-issue-student.md`
- `docs/task/2026-07-03/fix-001-implementation-plan-proctoring-recalibration-and-realtime-monitoring.md`
- `docs/task/2026-07-04/fix-001-implementation-plan-issues-during-examination.md`

The task docs above may already contain stronger file-level anchors and test ideas. Use them as references, but revalidate against the actual repository because this context file may be used after more changes have landed.

## Terms

- **Checkup page**: the pre-attempt student flow where microphone/camera readiness is initialized and validated.
- **Attempt page**: the actual student exam page where answers are submitted and proctoring telemetry runs.
- **Telemetry event**: raw monitored activity emitted by the web client, such as `AUDIO_ANOMALY`, `CLIPBOARD_ATTEMPT`, or `FULL_SCREEN_EXIT`.
- **Incident/flag**: persisted reviewable record created from a telemetry event, usually stored through the telemetry ingestion/storage path and surfaced in monitoring/log pages.
- **Occurrence count**: count of accepted occurrences for the same event/rule. Note that the existing code appears to use the spelling `occurrenceCount`; older notes sometimes say `occurenceCount`.
- **Student result page**: the immediate post-submit page shown to the student after turning in an exam.
- **History details page**: the student historical attempt/report page that should reflect persisted scoring state.

## Issue 1: Audio Event Not Flagging During Attempt

### Observed Behavior

- Audio is checked/initialized during the checkup flow before the student enters the attempt.
- During the attempt, making noise or shouting does not reliably produce an audio warning/incident.
- The attempt page does not show an audio warning/toast comparable to other proctoring events.
- The instructor-facing monitoring/log surfaces may also miss the audio incident.

### Expected Behavior

- If the exam requires microphone monitoring and `aiRules.audio_anomaly_detection` is enabled, the checkup audio stream/configuration should carry into the attempt page.
- A detected audio anomaly during an active attempt should emit telemetry with the expected event/rule shape:
    - event type similar to `AUDIO_ANOMALY`
    - rule key similar to `aiRules.audio_anomaly_detection`
    - metadata such as anomaly type and confidence score when available
- The backend should evaluate the event and persist a reviewable incident when the confidence/threshold criteria are met.
- The student should receive a warning/toast on the attempt page when audio is flagged, consistent with other attempt-page warnings.
- The instructor monitoring/log/report surfaces should show the audio event in the same incident stream as the other proctoring events.
- Audio monitoring must stop/suspend after submission or when monitoring is intentionally suspended, so post-submit noise does not create incidents.

### Likely Areas To Inspect

- `app/sentinel-web/src/app/(protected)/student/exam/[id]/_components/student-exam-audio-provider.tsx`
- `app/sentinel-web/src/app/(protected)/student/exam/[id]/_components/monitoring-preloader.tsx`
- `app/sentinel-web/src/app/(protected)/student/exam/[id]/attempt/_hooks/use-student-exam-attempt/use-attempt-monitoring.ts`
- `app/sentinel-web/src/hooks/use-audio-anomaly-worker.ts`
- `app/sentinel-web/src/workers/audio-anomaly.worker.ts`
- `app/sentinel-web/src/workers/audio-anomaly-engine.ts`
- `packages/shared/src/audio/audio-anomaly.ts`
- `app/sentinel-api/src/modules/telemetry/ingestion/rules/ai-rules.ts`
- `app/sentinel-api/src/modules/telemetry/storage/services/incident-persistence.service.ts`

### Acceptance Criteria

- A mic-required/audio-enabled exam can be started after checkup and the attempt page receives an active audio stream/config.
- A mocked or real above-threshold audio anomaly creates one telemetry call and one persisted incident.
- The student attempt page shows exactly one warning/toast for one accepted audio anomaly.
- The instructor incident/log surface shows the same audio incident with occurrence count and severity metadata.
- No audio telemetry is emitted after `suspendSecurityMonitoring()` or equivalent submission teardown.

### Test Ideas

- Unit-test the audio worker hook: worker `ANOMALY_DETECTED` should call telemetry ingestion with event type, rule key, anomaly type, and confidence score.
- Unit-test the audio engine/config: a mocked YAMNet score above the configured threshold should produce `TALKING` or the relevant anomaly type.
- Backend rule test: `AUDIO_ANOMALY` with confidence above threshold should persist.
- Persistence/mapper test: persisted audio anomaly should map to the instructor-visible incident type/label used by reports/logs.
- Manual test: start a mic-required exam, pass checkup, make a loud/talking sound during attempt, verify student toast and instructor incident.

## Issue 2: First Clipboard Event Counts As Two

### Observed Behavior

- On the first `CLIPBOARD_ATTEMPT`, the system records or displays the occurrence count as `2x` instead of `1x`.
- The attempt page shows two warning/toast messages, indicating the event may be emitted twice or counted twice.
- The instructor/log view may also show a duplicated first event or an inflated occurrence count.

### Expected Behavior

- One real copy/cut/paste attempt should create one accepted clipboard event.
- The first accepted occurrence should persist/display as `occurrenceCount = 1`.
- A second separate clipboard attempt should increment to `2`, not the first one.
- Duplicate DOM/keyboard listeners for the same browser action should be deduped client-side or normalized server-side.

### Likely Areas To Inspect

- `app/sentinel-web/src/app/(protected)/student/exam/[id]/_hooks/use-exam-monitoring/use-interaction-listeners.ts`
- `app/sentinel-web/src/app/(protected)/student/exam/[id]/_hooks/use-exam-monitoring.test.ts`
- `app/sentinel-api/src/modules/telemetry/storage/services/incident-persistence.service.ts`
- `app/sentinel-api/src/modules/telemetry/storage/services/incident-persistence.service.test.ts`

### Acceptance Criteria

- First copy/cut/paste attempt creates one telemetry call or one accepted persisted event after dedupe.
- First persisted clipboard incident has `details.occurrenceCount = 1`.
- Attempt page shows one warning/toast for the first clipboard action.
- Repeating the action after the dedupe/burst window increments count predictably to `2`.

## Issue 3: Fullscreen Exit False Positive On Submit

### Observed Behavior

- When the student presses `Submit` or turns in the exam, the browser exits/minimizes fullscreen as part of the normal flow.
- The system incorrectly records this as a `FULL_SCREEN_EXIT` event.
- Instructor monitoring sees a fullscreen-exit incident even though the student did not independently leave fullscreen during the active attempt.

### Expected Behavior

- Fullscreen exit caused by the normal turn-in/submission/redirect/completion flow must not be flagged.
- Student-caused fullscreen exits during an active, unsubmitted attempt must still be detected and flagged.
- Monitoring should be suspended before route changes or fullscreen teardown caused by successful submission.
- Backend persistence should also reject or ignore `FULL_SCREEN_EXIT` for completed attempts or attempts with a completed timestamp, as a safety net.

### Likely Areas To Inspect

- `app/sentinel-web/src/app/(protected)/student/exam/[id]/_hooks/use-exam-monitoring/use-interaction-listeners.ts`
- `app/sentinel-web/src/app/(protected)/student/exam/[id]/attempt/_hooks/use-student-exam-attempt/index.ts`
- `app/sentinel-web/src/app/(protected)/student/exam/[id]/attempt/_hooks/use-student-exam-attempt/use-attempt-submission.ts`
- `app/sentinel-api/src/modules/telemetry/storage/services/incident-persistence.service.ts`

### Acceptance Criteria

- Active manual fullscreen exit still persists one `FULL_SCREEN_EXIT` incident.
- Submit/turn-in flow emits no fullscreen telemetry and no attempt lock.
- If stale/fullscreen telemetry reaches the backend after the attempt is completed, it is ignored and not persisted.

## Issue 4: Multiple-Choice Options Include Duplicate Letters

### Observed Behavior

- Generated multiple-choice questions sometimes include option labels inside the option text, for example `A. Option text` or `B) Option text`.
- The attempt page also renders its own labels (`A`, `B`, `C`, `D`), causing duplicated labels such as `A. A. Option text`.

### Expected Behavior

- Stored/generated option text should be clean content only, without leading choice labels.
- The attempt page should own display labels for choices.
- Generation/normalization should strip leading labels for multiple-choice and multiple-response options where applicable.
- Correct-answer handling must remain accurate if the model returns a letter label (`A`, `B`, etc.) or an option string with a leading label.
- This should not break scoring, shuffling, or answer resolution.

### Likely Areas To Inspect

- `app/sentinel-api/src/lib/gemini/services/prompt-builder/definitions.ts`
- `app/sentinel-api/src/lib/gemini/services/prompt-builder/prompt-builder.service.ts`
- `app/sentinel-api/src/lib/gemini/services/question-normalizer/content-shape.ts`
- `app/sentinel-api/src/lib/gemini/services/question-normalizer/normalizer.ts`
- `packages/shared/src/schema/exams/builder/question-content-schema.ts`
- `packages/shared/src/exams/score-exam-attempt-answer-resolvers.ts`
- `packages/shared/src/exams/shuffle-exam.ts`
- Attempt-page question/choice rendering components under `app/sentinel-web/src/app/(protected)/student/exam/[id]/attempt`

### Acceptance Criteria

- Generated/stored options for multiple choice do not include leading `A.`, `B)`, `(C)`, `D -`, etc.
- Attempt UI still displays one set of labels.
- A generated correct answer of `A`, `A. Option`, or `Option` still normalizes to the correct stored option.
- Existing exams with already-labeled options should render cleanly if feasible, or at minimum new generation should be fixed.
- Scoring remains correct for string and index-based correct answers.

### Test Ideas

- Normalizer test: options `['A. Paris', 'B. Rome']` become `['Paris', 'Rome']`.
- Normalizer test: `correctAnswerText: 'A'` resolves to `Paris` after stripping.
- Attempt render test: option label appears once.
- Scoring/shuffle tests: stripping labels does not change correct-answer resolution.

## Issue 5: Result Page Score Does Not Match History Details

### Observed Behavior

- The immediate student result page shows a score of `1`.
- The student history details page shows a score of `0`.
- In the reported case, the essay has not been checked/graded yet and the multiple-choice answer is incorrect, so the expected current score is `0`.
- This suggests the result page may be showing a stale local/precomputed summary, optimistic value, or a different scoring source than the persisted attempt/history/report data.

### Expected Behavior

- Student result page and history details must use the same scoring truth.
- Objective questions can be scored immediately.
- Essay/manual-review questions should not add points until evaluated/finalized.
- If the attempt requires manual review, the UI should clearly present the score as provisional or grading-in-progress, and should not overstate essay points.
- After instructor grading/finalization, history/report/result surfaces should converge on the finalized score/state.

### Likely Areas To Inspect

- `app/sentinel-web/src/app/(protected)/student/exam/[id]/result/page.tsx`
- `app/sentinel-web/src/app/(protected)/student/exam/[id]/attempt/_hooks/use-student-exam-attempt/use-attempt-submission.ts`
- `app/sentinel-web/src/app/(protected)/student/exam/[id]/_lib/exam-turn-in-storage.ts`
- `app/sentinel-api/src/modules/examination/flow/services/complete-session.service.ts`
- `packages/shared/src/exams/score-exam-attempt-core.ts`
- `packages/shared/src/exams/score-exam-attempt-reports.ts`
- `app/sentinel-api/src/modules/examination/history/services/get-student-exam-history-detail.ts`
- `app/sentinel-api/src/modules/examination/reporting/services/get-attempt-report.ts`
- `app/sentinel-api/src/modules/examination/grading/services/update-grading-attempt.ts`

### Acceptance Criteria

- For an attempt with one incorrect multiple-choice answer and one ungraded essay, result page shows score `0` or an explicitly provisional `0` depending on existing UX.
- History details and result page agree on score, total score, percentage, and score state.
- Attempts with essays expose `requiresManualReview`/`manualReviewQuestionCount` accurately.
- Finalized graded essays update score consistently across result/history/report surfaces.

### Test Ideas

- Shared scorer test: incorrect objective answer plus ungraded essay yields score `0`, requires manual review.
- Result page test: when complete-session response says score `0` and requires manual review, UI does not display stale local score `1`.
- API complete-session test: persisted score/score state matches summary returned to the client.
- History detail test: manual-review attempts do not expose finalized-looking scores before grading.

## Issue 6: Assigned Private Exams Not Showing To Students

### Observed Behavior

- On the student classroom page and the student history/available tab, an exam does not show even though it is published and assigned to the student's classroom.
- Changing the exam visibility from private to public makes it visible.
- This points to student visibility logic treating `is_public = false` as hidden even when the exam has a valid classroom/section assignment.

### Expected Visibility Matrix

| Exam State / Assignment                        | Student Should See It? | Notes                                                                                                          |
| ---------------------------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------- |
| Published, not assigned to student's classroom | No                     | Publishing alone is not enough for student access.                                                             |
| Published, assigned to student's classroom     | Yes                    | Applies whether public or private.                                                                             |
| Draft                                          | No                     | Draft exams should not appear to students.                                                                     |
| Unpublished                                    | No                     | Unpublished exams should not appear to students.                                                               |
| Deleted/archived                               | No                     | Deleted/archived exams should not appear to students.                                                          |
| Public, assigned to student's classroom        | Yes                    | Public does not remove assignment requirement for student views unless product rules explicitly say otherwise. |
| Private, assigned to student's classroom       | Yes                    | This is the currently broken case.                                                                             |
| Private, not assigned to student's classroom   | No                     | Private and unassigned should remain hidden.                                                                   |

### Important Product Rule To Confirm

For student-facing pages, classroom/section assignment should be the primary visibility gate. `isPublic` should not be required when an exam is assigned to the student's classroom. `isPublic` may still matter for instructor/admin discovery or sharing semantics, but should not hide an assigned published exam from an enrolled student.

### Likely Areas To Inspect

- `app/sentinel-api/src/modules/examination/exams/data/build-student-exam-scope-predicates.ts`
- `app/sentinel-api/src/modules/examination/exams/data/get-exams.ts`
- `app/sentinel-api/src/modules/examination/exams/data/get-exam-by-id.ts`
- `app/sentinel-api/src/modules/examination/exams/services/get-exams.service.ts`
- `app/sentinel-api/src/modules/examination/access/services/evaluate-student-exam-eligibility.service.ts`
- `app/sentinel-api/src/modules/examination/access/services/validate-basic-eligibility.ts`
- `app/sentinel-web/src/app/(protected)/student/classroom/[id]/page.tsx`
- `app/sentinel-web/src/app/(protected)/student/history/_hooks/use-student-history/index.ts`
- `app/sentinel-web/src/app/(protected)/student/_lib/normalize-student-exam.ts`
- `packages/shared/src/exams/resolve-exam-status.ts`

### Acceptance Criteria

- Published private exam assigned to the student's classroom appears on the student classroom page.
- Published private exam assigned to the student's classroom appears in the appropriate student history/available/upcoming feed based on schedule.
- Published private exam not assigned to the student's classroom stays hidden.
- Draft/unpublished/deleted exams stay hidden regardless of assignment.
- Student access/eligibility endpoint agrees with list visibility; no list item should lead to an avoidable forbidden state for a valid assigned exam.

### Test Ideas

- API query predicate test: private assigned exam is included for a matching student enrollment/classroom.
- API query predicate test: private unassigned exam is excluded.
- API query predicate test: public assigned exam remains included.
- Student classroom page test: stale/past-due exams stay hidden if that is current UX, while valid assigned private exams show.
- Student history hook test: assigned private exam is normalized into the correct tab/status.

## Cross-Cutting Planning Notes

- Prioritize correctness before UI polish: event count/persistence, submission suppression, scoring truth, and visibility predicates should be fixed before adjusting display copy.
- Prefer central fixes over page-specific patches. For example, if scoring truth diverges, fix the source of summary/result data rather than masking only the result page.
- Keep generated-question cleanup near generation/normalization so future stored content is clean; add defensive rendering only if existing bad data needs to be handled.
- Make telemetry idempotent where possible. A single browser action can fire multiple DOM events, so use a small dedupe/burst window or server-side incident merge rules to prevent duplicated first occurrences.
- Reuse existing warning/toast patterns for attempt-page events instead of inventing a separate audio-only UI.
- Reuse existing incident/log/report mappers so audio, clipboard, and fullscreen incidents are represented consistently.

## Suggested Implementation Planning Order

1. Re-scan related task docs and current code to determine which reported items are already fixed and which are still failing.
2. Add failing tests first for each still-open defect:
    - audio anomaly active attempt persistence
    - first clipboard occurrence count
    - fullscreen submit suppression
    - option-label normalization/rendering
    - provisional/manual-review scoring consistency
    - assigned-private exam visibility
3. Fix backend source-of-truth logic where needed:
    - telemetry persistence/counting
    - audio rule evaluation
    - score persistence/score state
    - student exam scope predicates
4. Fix frontend integration points:
    - attempt warning/toast behavior
    - result-page source data
    - option display
    - student classroom/history listing behavior
5. Run focused Vitest suites for touched packages/apps, then run broader `pnpm test`, `pnpm lint`, and `pnpm format:check` if the local environment supports them.

## Manual QA Checklist

- Start a mic-required exam, pass checkup, make noise during attempt, and verify one student warning plus one instructor incident.
- Trigger one clipboard action and verify exactly one toast and `occurrenceCount = 1`.
- Trigger a second clipboard action after the dedupe window and verify `occurrenceCount = 2`.
- Submit a fullscreen-required exam and verify no post-submit `FULL_SCREEN_EXIT` incident.
- Trigger a real fullscreen exit during an active attempt and verify it still flags.
- Generate/import multiple-choice questions with `A.`, `B)`, or `(C)` labels and verify the attempt page shows only one visible label per option.
- Submit an exam with an incorrect objective answer and an ungraded essay and verify result/history score consistency.
- Publish a private exam, assign it to a classroom, log in as a student in that classroom, and verify it appears in classroom/history/available or upcoming as appropriate.
- Verify private unassigned, draft, unpublished, and deleted exams remain hidden from students.
