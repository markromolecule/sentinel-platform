### [Implementation Plan]: Mobile Exam Fixes

---

#### Phase 1 — Exam State And Navigation Contract

**Objective:** Align mobile exam list actions with exam status so finished or expired exams route to details while active exams proceed to the attempt flow.

**Tasks:**

- [x] Define the status-to-action contract for `available`, `upcoming`, `turned_in`, `past_due`, and `completed` in `app/sentinel-mobile/components/exam/exam-card.tsx` and `app/sentinel-mobile/app/(tabs)/exam/index.tsx`.
- [x] Refactor exam press handling so `View` routes to a read-only details experience and `Open Exam` routes only to the instruction or lobby flow.
- [x] Test the card action mapping for available, upcoming, turned-in, past-due, and completed exam states.

**Outcome:** Past-due and turned-in exams show `View` and never enter the attempt start flow.

---

#### Phase 2 — Exam Details Loading And Not-Found Guard

**Objective:** Remove the temporary `No exam` state that appears before the mobile instruction page finishes loading.

**Tasks:**

- [x] Trace the loading, error, and missing-exam states through `app/sentinel-mobile/app/exam/[id]/index.tsx`, `app/sentinel-mobile/app/exam/[id]/instruction/index.tsx`, and `app/sentinel-mobile/features/exam/hooks/use-exam-details.ts`.
- [x] Render a loading state before any missing-exam fallback while the exam query or adapter is still resolving.
- [x] Test the exam detail hook or screen state transitions for loading, found exam, missing exam, and failed request cases.

**Outcome:** Tapping `Open Exam` shows loading or instructions without flashing `No exam` first.

---

#### Phase 3 — Read-Only Mobile Exam Details

**Objective:** Build the mobile `View` path using the web student history details page as the behavioral reference.

**Tasks:**

- [x] Build a read-only mobile details mode for finished exams using `app/sentinel-web/src/app/(protected)/student/history/details/page.tsx` as the content reference.
- [x] Display exam title, status, schedule, score or result summary, instructions, and security summary without start, lobby, or submit controls.
- [x] Test that read-only details cannot create or resume an exam attempt for `turned_in`, `past_due`, or `completed` exams.

**Outcome:** Finished or expired exams open a stable mobile details view with no path into the active attempt runtime.

---

#### Phase 4 — Lobby Approval Refresh

**Objective:** Make instructor approval update the mobile lobby from waiting to continue without requiring an app restart.

**Tasks:**

- [x] Trace lobby admission state through `app/sentinel-mobile/app/exam/[id]/lobby/index.tsx`, `app/sentinel-mobile/features/exam/hooks/use-exam-lobby.ts`, and the related exam service calls.
- [x] Configure polling, focus refetch, or query invalidation so `lobby_waiting` updates after instructor approval.
- [x] Test the waiting-to-approved transition and confirm the footer action changes to `Continue` within the configured refresh window.

**Outcome:** An approved student sees `Continue` on mobile after the instructor approves lobby entry.

---

#### Phase 5 — Mobile Telemetry Identity And Delivery

**Objective:** Stop mobile telemetry from being skipped by binding events to the authenticated student and active exam session.

**Tasks:**

- [x] Resolve the authenticated mobile student identity and access token from the active session instead of relying on `EXPO_PUBLIC_STUDENT_ID`.
- [x] Pass `studentId`, token, and `examSessionId` into `app/sentinel-mobile/features/exam/lib/mobile-telemetry-client.ts` for every active attempt event.
- [x] Test telemetry delivery behavior for missing identity, missing session, and valid authenticated mobile attempt payloads.

**Outcome:** Mobile attempt events are sent to the API with `studentId` and `examSessionId` instead of logging `hasStudentId: false`.

---

#### Phase 6 — Security Event Coverage And Web Monitoring

**Objective:** Ensure mobile security events appear in the sentinel-web monitoring timeline.

**Tasks:**

- [x] Audit mobile event sources for `SCREENSHOT_ATTEMPT`, `APP_BACKGROUNDING`, `APP_PINNING_VIOLATION`, and `NOTIFICATION_BLOCK_VIOLATION` in the exam session hooks and runtime.
- [x] Emit each supported event through the shared telemetry contract so API persistence and web monitoring receive consistent event names.
- [ ] Test event-to-payload mapping and manually verify the sentinel-web monitoring page updates after committing mobile events.

**Outcome:** Screenshot, backgrounding, app pinning, and notification block events from mobile appear in the instructor monitoring timeline.

---

#### Phase 7 — Regression Validation And Phase Handoff

**Objective:** Verify the completed mobile exam flow and keep each phase small enough to review before continuing.

**Tasks:**

- [x] Run targeted mobile tests and any shared telemetry or API tests touched by the implementation.
- [ ] Validate on device or simulator for `View`, `Open Exam`, lobby approval, telemetry delivery, and screenshot/security events.
- [x] Record pass/fail evidence in this plan before marking each phase complete and moving to the next phase.

**Outcome:** Each issue from `docs/exam-mobile-fix.md` has documented validation evidence before the next phase begins.

**Validation Evidence:** `pnpm --dir app/sentinel-mobile test` passed with 4 files and 20 tests. `pnpm --dir app/sentinel-mobile exec tsc --noEmit` passed. Manual simulator/device validation and live sentinel-web monitoring verification remain pending.
