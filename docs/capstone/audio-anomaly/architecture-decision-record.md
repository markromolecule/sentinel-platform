# Architecture Decision Record: Client-Side Audio Processing

## Context

The Sentinel platform requires a mechanism to detect audio anomalies (talking, typing, tapping, etc.) during online examinations to flag potential academic dishonesty.

## Options Considered

### Option 1: Server-Side Streaming

- Stream raw audio via WebRTC or WebSocket to a backend server.
- Process audio server-side using YAMNet or similar ML models.
- **Pros**: Offloads compute from the student's device.
- **Cons**: Massive bandwidth and infrastructure scaling requirements. High privacy concerns (streaming raw audio).

### Option 2: Client-Side Processing (Chosen)

- Run a TensorFlow.js Web Worker locally in the student's browser.
- Use a pre-trained YAMNet model to evaluate audio frames directly on the device.
- Send only lightweight telemetry (confidence scores, timestamps) to the backend.
- **Pros**: **Privacy-first** (no raw audio leaves the device). Infinitely scalable (uses client compute). Low bandwidth.
- **Cons**: Requires local processing power (mitigated via WebGL/WASM fallbacks).

### Option 3: Hybrid Approach

- Extract audio features (e.g., MFCCs) client-side.
- Send features to the backend for final classification.
- **Pros**: Less client compute than Option 2. More privacy than Option 1.
- **Cons**: High engineering complexity to align client extraction with server model expectations. Still requires continuous network streaming.

## Decision

We chose **Option 2: Client-Side Processing**. The privacy benefits of keeping raw audio on the device are paramount. By leveraging TensorFlow.js and Web Workers, we can achieve real-time inference without blocking the main UI thread. The telemetry payload is extremely lightweight, fitting perfectly into our existing high-throughput event ingestion pipeline.

## Status

Accepted and Implemented (May 2026).
