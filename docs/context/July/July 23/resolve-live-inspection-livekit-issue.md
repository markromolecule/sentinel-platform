# LiveKit Live Inspection Issue Investigation Context

**Date:** July 23, 2026  
**File Target:** `docs/context/July/July 23/resolve-live-inspection-livekit-issue.md`  
**Status:** Investigation Complete — Ready for Implementation Plan

---

## 1. Executive Summary

During live monitoring testing in Sentinel, initiating a LiveKit live camera inspection results in the instructor UI remaining stuck on `[waiting for students to turn on camera]` or `Live view unavailable`, despite the student being active on the exam attempt page with camera enabled via MediaPipe.

Inspection of the LiveKit Cloud Dashboard shows:
- Room creation succeeds (e.g., `sentinel-live-inspection-<uuid>`).
- **UNIQUE PARTICIPANTS = 0**
- **Publishers = No results**

Additionally, clicking **Stop** or **Retry** in the instructor monitoring UI results in HTTP `409 Conflict` errors on API requests (e.g., `POST /:examId/monitoring/live-inspections/:leaseId/stop`), while status queries return HTTP `200 OK`.

This document details the root cause analysis, single-device testing limitations, technical breakdown, and proposed remediation steps to prepare for creating an implementation plan.

---

## 2. Symptom & Evidence Summary

| Symptom | Observed Behavior | Technical Evidence |
| :--- | :--- | :--- |
| **Instructor UI** | Shows `[waiting for students to turn on camera]`, then times out to `Live view unavailable`. | `useLiveInspectionViewer` reaches 15s timeout (`pollStartTimeRef`) while waiting for `PUBLISHER_READY`. |
| **LiveKit Dashboard** | Room exists, but 0 participants joined and 0 published tracks. | Student browser never executed `room.connect()` or `publishTrack()`. |
| **Network Requests** | `POST .../stop` returns **HTTP 409 Conflict**. | Unhandled optimistic version/state mismatch in `transitionLiveInspectionLeaseState`. |
| **Student UI** | MediaPipe proctoring is active, but live inspection bridge indicator never appears. | Student subscriber hook (`useStudentLiveInspectionPublisher`) silently fails or misses signal. |

---

## 3. Deep-Dive Technical Root Cause Analysis

### Cause 1: Auth Session Collisions During Single-Device Testing (#1 Root Cause)
When testing Student and Instructor roles on the **same physical device** using the **same browser session/profile** (e.g., two tabs in normal Chrome):
1. Both tabs share browser storage (`localStorage` and cookies) for Supabase authentication.
2. Logging into the Instructor account in Tab B overwrites the Supabase JWT in shared storage.
3. Tab A (Student) background requests (such as `getStudentLiveInspectionDirective`, `createPublisherConnection`, or Supabase Realtime WebSocket topic subscriptions) now send the **Instructor's JWT token**.
4. The database & API enforce ownership security checks:
   - **Supabase Realtime RLS Policy** (`live_inspection_student_private_select`): Requires `st.user_id = auth.uid()`. Since `auth.uid()` is the Instructor's user ID, Realtime silently drops/blocks broadcast events (`LIVE_INSPECTION_CHANGED`).
   - **API Authorization** (`assertLiveInspectionStudentAccess`): Validates that `studentUserId` matches the attempt owner. When passed the Instructor's ID, it returns `404 Not Found` / `403 Forbidden`.
5. **Result:** The student tab never receives the directive, never connects to LiveKit, and never publishes media. LiveKit dashboard shows 0 participants.

### Cause 2: Unhandled 409 Conflict Errors on Stop and Retry Actions
- **Stop Action (`POST /:examId/monitoring/live-inspections/:leaseId/stop`)**:
  - `stopLiveInspection` fetches the lease from DB, then calls `transitionLiveInspectionLeaseState(..., fromState: lease.state, toState: 'STOPPING', expectedVersion: lease.version)`.
  - If the lease version or state in the database changes concurrently (e.g., version incremented from 1 to 2 by a background call or reconciler), `compareAndSetLiveInspectionLeaseState` fails.
  - `transitionLiveInspectionLeaseState` throws `HTTPException(409, { message: 'Live inspection lease changed.' })`.
  - Because `stopLiveInspectionRouteHandler` does not handle state transition race conditions idempotently, it returns an unhandled **HTTP 409 Conflict** error to the client.
- **Retry Action (`POST /:examId/monitoring/live-inspections`)**:
  - `startLiveInspection` checks for existing active leases via `getActiveLiveInspectionLeaseForAttempt`.
  - If an existing lease created by the same viewer is still in a non-terminal state (`REQUESTED`, `PUBLISHER_CONNECTING`, etc.), `startLiveInspection` returns the **same existing lease** without resetting or re-issuing a fresh lease.
  - If the student client missed or failed the initial directive for that lease, retrying simply re-polls the stuck lease until it eventually expires, producing a repeated failure cycle.

### Cause 3: Realtime Latency & Polling Timeout Race Condition
- Browser tab background throttling aggressively slows down JavaScript timers (`setInterval` / `setTimeout`), WebSockets, and WebRTC in unfocused tabs.
- The student hook (`useStudentLiveInspectionPublisher`) uses a **10-second** fallback polling interval (`RECONCILE_INTERVAL_MS = 10_000`).
- The instructor viewer hook (`useLiveInspectionViewer`) uses a **15-second** hardcoded timeout (`pollStartTimeRef.current > 15_000`).
- If the Supabase Realtime broadcast message is delayed or dropped due to background tab throttling, student polling + track cloning + LiveKit connection + `acknowledgePublisherReady` easily exceeds 15 seconds.
- When the instructor hits the 15-second timeout, `useLiveInspectionViewer` sets state to `failed` (`TIMEOUT`), displaying `Live view unavailable`, even if the student connects a few seconds later.

### Cause 4: MediaPipe Stream Track Availability
- `useStudentExamMediaPipeStream` exposes `getLiveVideoTrack()`, which finds an active video track in `streamRef.current` with `readyState === 'live'`.
- `useStudentLiveInspectionPublisher` clones this track using `cloneCameraTrackForLiveInspection(track)`.
- If `getLiveVideoTrack()` returns `null` (e.g., MediaPipe initialization incomplete or track state transition pending), `acknowledgeFailure` is triggered with error code `NO_LIVE_CAMERA_TRACK`, causing the lease to fail early.

---

## 4. Single-Device Testing Mandate & Guidelines

To reliably test LiveKit live inspection on a **single physical machine**, strict environment isolation is required:

> [!IMPORTANT]
> **Single-Device Isolation Rule:**  
> Always run the **Student** session and **Instructor** session in **two completely separate browser contexts**:
> - **Window 1 (Student):** Standard Chrome window logged in as Student.
> - **Window 2 (Instructor):** Chrome Incognito window or Firefox/Edge logged in as Instructor.
> 
> Running both roles in two tabs of the same browser window will overwrite Supabase local auth tokens and cause API / Realtime authorization failures.

---

## 5. Architectural & Implementation Recommendations

To resolve the issue permanently and prepare for the upcoming implementation plan:

### 1. Idempotent Stop & Robust Lease Reset
- **Graceful Stop:** Update `stopLiveInspection` in `stop-live-inspection.service.ts` to handle version/state changes gracefully. If a lease is already in `STOPPING`, `ENDED`, or `FAILED`, return current lease status instead of throwing a `409` error.
- **Force Reset on Retry:** Allow `startLiveInspection` or an explicit restart flag to invalidate/terminalize stale `REQUESTED` / `PUBLISHER_CONNECTING` leases when an instructor explicitly requests a retry.

### 2. Polling & Timeout Alignment
- Increase instructor viewer status timeout from **15 seconds to 25–30 seconds** (or provide progress feedback like "Waiting for student device (10s)...").
- Increase student publisher fallback polling frequency during active attempts (e.g., from 10s to **3–5s**) to reduce latency when Realtime broadcast is delayed.

### 3. Clear Failure & State Diagnostics
- Surface explicit reason codes in the instructor UI when student camera track cloning fails (`NO_LIVE_CAMERA_TRACK`) or when auth/token issues occur.
- Add error logging in `useStudentLiveInspectionPublisher` when API directive calls return 403/404 to aid local debugging.

---

## 6. Next Steps

1. Review this context document with the team.
2. Validate single-device execution using distinct browser profiles (Chrome Normal + Chrome Incognito).
3. Create the technical **Implementation Plan** for hardening `stopLiveInspection`, `startLiveInspection`, and `useStudentLiveInspectionPublisher`.
