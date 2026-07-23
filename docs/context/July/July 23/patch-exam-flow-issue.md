# Exam Flow & Live Monitoring Issues Context

## Overview
This document outlines the context, root causes, technical analysis, and resolution plan for three issues reported during the exam flow and live monitoring lifecycle:

1. Student automatically approved instead of appearing on the waiting list in the Instructor Exam Lobby.
2. Live inspection UI stuck on `[waiting for student camera]` despite API returning `200 OK`.
3. Aesthetic update for the Exam Flow loading state UI (`StudentExamLoadingState`).

---

## 1. Student Not Listed on Waiting List (Auto-Approved Issue)

### Issue Description
When a student checks into an exam lobby, they bypass the `WAITING` status and are automatically set to `APPROVED`, even when instructor lobby admission approval is expected.

### Technical Analysis
- **Service Location**: `checkInLobby` in [`check-in-lobby.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/lobby/services/check-in-lobby.ts).
- **Behavior**:
  - The check-in service fetches `lobby_admission_mode` from the exam configuration (`exam_configurations`).
  - `const mode = exam.lobby_admission_mode ?? 'AUTOMATIC';`
  - If `lobby_admission_mode` is `AUTOMATIC` (or null fallback), the service inserts/updates `exam_lobby_admissions` directly with status `'APPROVED'` and sets `decided_at = NOW()`.
- **Root Causes**:
  - **Exam Configuration Default**: If `lobby_admission_mode` is not explicitly set to `'MANUAL'` when creating/editing the exam or saving exam configuration, the default behavior in the backend falls back to `'AUTOMATIC'`.
  - **UI Configuration Setting**: The exam creation/configuration form in `sentinel-web` may not be persisting `lobby_admission_mode: 'MANUAL'` when "Require Instructor Approval" rule is checked.

### Resolution & Action Items
- Check exam configuration schema & defaults to ensure `lobby_admission_mode` is saved as `'MANUAL'` when manual approval is required.
- Verify `checkInLobby` logic correctly resolves `'MANUAL'` mode so students remain in `'WAITING'` status until the instructor explicitly grants admission.

---

## 2. Live Inspection Stuck on `[waiting for student camera]`

### Issue Description
When initiating live inspection from the monitoring dashboard, the API request returns HTTP `200 OK` (lease created in `REQUESTED` state), but the video container displays `[waiting for student camera]` indefinitely.

### Technical Analysis
- **Service & Hook Locations**:
  - Viewer Hook: [`use-live-inspection-viewer.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/hooks/src/live-inspection/use-live-inspection-viewer.ts)
  - Live Feed Component: [`live-feed-monitor.tsx`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/monitoring/_components/live-feed-monitor.tsx)
- **Lifecycle & Flow**:
  1. Instructor clicks inspect -> Backend creates inspection lease with status `REQUESTED` (Returns `200 OK`).
  2. `useLiveInspectionViewer` transitions state to `waiting_for_student` and polls `/api/exams/:id/live-inspection/:leaseId` every 2 seconds waiting for `PUBLISHER_READY`.
  3. Student browser must receive the signal, initialize `useLiveInspectionPublisher`, connect camera track to LiveKit, and transition lease to `PUBLISHER_READY`.
  4. Once `PUBLISHER_READY`, viewer fetches token via `createLiveInspectionViewerConnection` and connects to LiveKit stream (`live`).

### Why this happens when using the Same Device / Single Browser:
- **Tab Background Throttling**: Browsers aggressively throttle JavaScript timers (`setTimeout`/`setInterval`), WebSockets, and WebRTC peer connections in unfocused/background tabs (e.g. when switching between student tab and instructor tab).
- **Hardware Camera Locking**: Webcams generally support only one active capture stream per process or device lock in certain operating systems/browsers. If the student tab holds media hardware or loses focus, camera publishing can fail or delay.
- **Signal Handshake Latency**: If the student tab is not active, the publisher hook does not poll/process the pending live inspection request, keeping the status in `REQUESTED` mode indefinitely.

### Resolution & Action Items
- **Testing Recommendation**: Test live inspection using **two distinct browser instances** (e.g., Chrome Normal Window + Chrome Incognito Window, or two side-by-side windows) so both tabs remain active and can access camera hardware.
- Ensure `useLiveInspectionPublisher` in the student attempt page actively listens for pending inspection requests without UI blocking.

---

## 3. Exam Flow Loading UI Enhancement

### Issue Description
The loading view during exam flow preparation (`StudentExamLoadingState`) feels plain/boring and needs an updated visual design with a standalone, engaging spinner (no heavy outer card wrappers).

### Component Location
- [`student-exam-loading-state.tsx`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/exam/[id]/_components/student-exam-loading-state.tsx)

### Design & Implementation Plan
- Remove heavy outer wrapper components while keeping layout centered and fluid.
- Add an modern, dynamic spinner featuring multi-layer ring animation, gradient glow, or pulsing central focal ring using Tailwind CSS.
- Elevate typography with smooth state feedback text ("Loading exam flow...", "Preparing the current exam state.").
