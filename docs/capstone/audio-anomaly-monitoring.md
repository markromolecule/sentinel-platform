> [!NOTE]
> **Canonical location:** [.agents/docs/research/audio-anomaly-monitoring.md](../../.agents/docs/research/audio-anomaly-monitoring.md)

# Audio Anomaly AI Monitoring

This document describes how Sentinel utilizes the **YAMNet** deep learning model for real-time audio proctoring, including signal processing, class mapping, and persistence rules.

---

## 1. Overview

Sentinel's audio monitoring system is a privacy-first, client-side implementation designed to detect suspicious auditory events during examinations without recording or transmitting raw audio data.

The system utilizes **TensorFlow.js** and the **YAMNet** (Yet Another Mobile Network) model running inside a **Web Worker**. It detects six primary anomaly types:

- **`TALKING`**: Sustained speech or conversation.
- **`TYPING`**: Excessive or rhythmic keyboard activity.
- **`TAPPING`**: Repetitive knocking or finger snapping.
- **`MOUTH_BREATHING`**: Heavy breathing close to the microphone.
- **`BACKGROUND_NOISE`**: Loud, sustained interference (e.g., fans, traffic).
- **`SILENCE_DETECTED`**: Significant drop in audio input (potential microphone blocking).

---

## 2. Signal Processing Pipeline

To maintain high accuracy across different hardware, the system follows a strict preprocessing workflow:

1. **Capture**: Audio is captured via `getUserMedia` at the hardware's native sample rate.
2. **Resampling**: The stream is resampled to **16,000 Hz (Mono)** to match YAMNet's requirements.
3. **Buffering**: Samples are accumulated into a **0.975-second frame** (exactly 15,600 samples).
4. **Inference**: Every 0.975s, the Web Worker executes the YAMNet model on the buffered frame.
5. **Class Mapping**: The 521 raw probability scores from YAMNet are mapped to Sentinel's simplified incident types.

---

## 3. Detection Logic & Thresholds

### YAMNet Class Mapping

The system collapses specific YAMNet classes into actionable Sentinel incident types:

| Anomaly Type           | YAMNet Class IDs (AudioSet) | Examples                     |
| :--------------------- | :-------------------------- | :--------------------------- |
| **`TALKING`**          | 0, 1, 2, 3, 4               | Speech, Conversation, Babble |
| **`TYPING`**           | 400, 401                    | Typing, Computer keyboard    |
| **`TAPPING`**          | 398, 402                    | Knock, Finger snapping       |
| **`MOUTH_BREATHING`**  | 287, 288                    | Breathing, Snoring           |
| **`BACKGROUND_NOISE`** | 494, 495, 496               | White noise, Static, Hum     |

### Frontend Detection Rules

To minimize false positives, a "Signal" is only emitted if the detection exceeds a confidence threshold over a rolling window:

| Metric                 | Confidence Threshold | Consecutive Frames | Cooldown |
| :--------------------- | :------------------- | :----------------- | :------- |
| **`TALKING`**          | `0.65`               | 3 (~3s)            | 10s      |
| **`TYPING`**           | `0.55`               | 4 (~4s)            | 10s      |
| **`TAPPING`**          | `0.50`               | 2 (~2s)            | 10s      |
| **`MOUTH_BREATHING`**  | `0.45`               | 5 (~5s)            | 10s      |
| **`BACKGROUND_NOISE`** | `0.70`               | 5 (~5s)            | 60s      |
| **`SILENCE_DETECTED`** | `RMS < config`       | 5 (~5s)            | 180s     |

---

## 4. Silence Detection (RMS)

While YAMNet handles complex classification, **Silence Detection** uses a standard **Root Mean Square (RMS)** calculation of the audio waveform.

$$\text{RMS} = \sqrt{\frac{1}{n} \sum_{i=1}^{n} x_i^2}$$

If the RMS value falls below the calibrated baseline for **5 consecutive seconds**, a `SILENCE_DETECTED` signal is generated. This is critical for detecting if a student has covered the microphone or unplugged their headset.

---

## 5. Backend Persistence Logic (Incidents)

When signals reach the API, the **Ingestion Engine** evaluates them using the `AudioAnomalyRule`. An **Incident** is persisted to the database if:

1. **High Confidence**: The signal has a confidence score $\geq 0.40$ (Immediate Persistence).
2. **Repeat Threshold**: **3 occurrences** of the same anomaly type are detected within a **120-second** window.

This dual-trigger approach ensures that both loud, obvious violations and subtle, repetitive suspicious behaviors are captured.

---

## 6. Implementation Summary

- **Web Worker**: TensorFlow.js runs in a background thread to prevent UI stuttering during the 150ms-200ms inference cycle.
- **Shared Package**: `yamnet-class-mapper.ts` handles the heavy lifting of translating model outputs.
- **Backend**: `audio-anomaly.rule.ts` (inside `ai-rules.ts`) manages the persistence state.

---

_Created on: 2026-05-12_
_Related Source:_

- [`audio-anomaly-engine.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/workers/audio-anomaly-engine.ts)
- [`yamnet-class-mapper.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/audio/yamnet-class-mapper.ts)
- [`ai-rules.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/telemetry/ingestion/rules/ai-rules.ts)
