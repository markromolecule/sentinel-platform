# MediaPipe AI Monitoring & Calibration

This document describes how Sentinel utilizes Google MediaPipe for student proctoring, including the gaze estimation formulas, calibration process, and detection thresholds.

---

## 1. Overview

Sentinel's monitoring system uses **MediaPipe Face Landmarker** to track student behavior in real-time. The system detects three primary anomaly signals:

- **`GAZE_OFF_SCREEN`**: Student is looking away from the assessment viewport.
- **`NO_FACE_DETECTED`**: No face landmarks are visible (student left the frame or camera is blocked).
- **`MULTIPLE_FACES`**: More than one person is visible in the frame.

---

## 2. The Calibration Process

Because every student has unique facial features and camera setups, Sentinel uses a **Calibration Phase** to establish a "Neutral Gaze" baseline.

### Workflow

1. **Sampling**: The student is asked to look directly at the center of the screen for several seconds.
2. **Neutral Baseline**: The system captures multiple `MediaPipeGazeOffsetSample` objects and averages them to create a **Calibration Profile**.
3. **Normalization**: During the exam, real-time gaze signals are "offset" by this baseline:
   $$\text{Corrected Offset} = \text{Current Offset} - \text{Neutral Offset}$$

This process ensures that a student who naturally sits slightly tilted or has a specific eye shape is not unfairly flagged.

---

## 3. Mathematical Formulas

### Eye Aspect Ratio (EAR)

Used to detect if eyes are open or closed.
$$\text{EAR} = \frac{\text{Average Vertical Distance between Eyelids}}{\text{Horizontal Distance between Eye Corners}}$$

### Gaze Offsets

Offsets are normalized to a range (conceptually $-1$ to $1$) relative to the eye's bounding box:

- **Iris Horizontal**: Position of the iris relative to the inner and outer corners of the eye.
- **Iris Vertical**: Position of the iris relative to the upper and lower eyelid centers.
- **Head Pose**: Position of the nose tip relative to the inter-eye center, normalized by face width/height.

---

## 4. Detection Thresholds

### Signal Classification (Frontend)

The system identifies "Off-Screen" behavior using these default thresholds (which can be overridden by a calibration profile):

| Metric                    | Threshold                  | Condition                                   |
| :------------------------ | :------------------------- | :------------------------------------------ |
| **Confidence**            | `0.80`                     | Minimum landmark reliability score.         |
| **Eye Closed (EAR)**      | `≤ 0.12`                   | Triggered if both eyes are closed.          |
| **Iris Horizontal Delta** | `0.16`                     | Deviation from neutral center (left/right). |
| **Iris Vertical Delta**   | `Up: 0.20 / Down: 0.28`    | Deviation from neutral center (up/down).    |
| **Head Pose Delta**       | `Horiz: 0.22 / Vert: 0.18` | Deviation based on head rotation.           |
| **Viewport Edge**         | `X: <0.12 / Y: <0.08`      | Face is too close to the camera frame edge. |

### Temporal Thresholds

To avoid flagging brief blinks or natural movements:

- **Gaze Off-Screen**: Must persist for **3,000ms** to be considered a "Signal".
- **No Face**: Must persist for **5,000ms**.

---

## 5. Backend Persistence Logic (Incidents)

When signals are sent to the API, the **Ingestion Engine** evaluates them against "Rules" to decide if an **Incident** should be recorded in the database.

| Rule               | Persistence Condition                                                       |
| :----------------- | :-------------------------------------------------------------------------- |
| **Gaze Tracking**  | **3 occurrences** within a **120s** window OR a single long-duration event. |
| **Face Detection** | **2 occurrences** within a **60s** window.                                  |
| **Multiple Faces** | **Immediate** persistence if confidence score $\geq 0.8$.                   |

---

## 6. Implementation Summary

- **Frontend**: Performs frame-by-frame analysis every **500ms** and aggregates signals.
- **Shared Package**: Contains the math logic (`EAR`, `GazeDirection`, `FaceBounds`) in `packages/shared/src/mediapipe/`.
- **Backend**: Ingests signals via `POST /telemetry/ingest` and applies repeat-threshold rules before saving as an incident.

---

_Created on: 2026-04-29_
_Related Source:_

- [`analysis.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/mediapipe/analysis.ts)
- [`gaze-direction.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/mediapipe/calibration/gaze-direction.ts)
- [`ai-rules.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/telemetry/ingestion/rules/ai-rules.ts)
