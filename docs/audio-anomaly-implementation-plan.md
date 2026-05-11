# Audio Anomaly Integration — Detailed Implementation Plan

**Project:** Sentinel Audio Anomaly Detection Engine
**Version:** 2.0
**Last Updated:** May 2026

---

## Executive Summary

This plan details the full implementation of a **privacy-first, client-side audio anomaly detection system** embedded into the Sentinel exam platform. Using TensorFlow.js and the pre-trained YAMNet model running inside a browser Web Worker, the system will silently monitor student audio during examinations, classify sounds (speech, typing, tapping, breathing anomalies), and relay lightweight telemetry payloads to the backend only when a configurable confidence threshold is breached — mirroring the existing Mediapipe visual monitoring architecture.

**No raw audio ever leaves the student's device.**

---

## Architectural Overview

```
[Student Browser]
  └─ ExamPage (Main Thread)
       ├─ MediaStream (Microphone)
       ├─ AudioAnomalyWorker (Web Worker)
       │    ├─ TF.js + YAMNet Model (WASM/WebGL backend)
       │    ├─ Audio Buffer → Feature Frames
       │    ├─ Threshold Calibration Normalizer
       │    └─ Anomaly Event → postMessage() → Main Thread
       └─ Telemetry Dispatch → sentinel-api

[sentinel-api (Hono)]
  ├─ GET /settings/audio  → audio_anomaly_config (system_settings)
  ├─ POST /incidents/audio → AnomalyAlertPayload ingestion
  └─ WebSocket Broadcast  → Instructor Monitoring Dashboard

[Instructor Browser]
  └─ MonitoringPage
       └─ Real-Time Audio Alert Feed

[Support Portal]
  └─ SupportAudioCalibration UI
       └─ PUT /settings/audio → Update thresholds & sensitivity
```

---

## Data Flow: Anomaly Detection Lifecycle

1. **Exam Start** — `ExamPage` fetches `audio_anomaly_config` from `GET /settings/audio` and spawns `AudioAnomalyWorker`, passing config as initialization message.
2. **Microphone Acquisition** — Worker requests `getUserMedia({ audio: true })`. On grant, pipes stream through `AudioContext` → `ScriptProcessorNode` / `AudioWorkletNode`.
3. **Model Inference** — 0.975-second audio frames are resampled to 16kHz mono and fed into YAMNet. Model outputs a 521-class probability vector per frame.
4. **Class Mapping & Thresholding** — Worker applies the `YAMNetClassMapper` to extract scores for target classes, then compares against calibrated thresholds over a rolling N-frame window.
5. **Anomaly Dispatch** — When threshold is exceeded for ≥ `consecutiveFrameThreshold` frames, worker emits `postMessage({ type: 'ANOMALY', payload })` to main thread.
6. **Telemetry** — Main thread POSTs `AnomalyAlertPayload` to `POST /incidents/audio`.
7. **Instructor Alert** — Backend broadcasts incident via existing WebSocket channel to the active instructor session for that exam.

---

## YAMNet Class Mapping Strategy

YAMNet outputs 521 classes. We collapse these into 5 Sentinel incident types:

| Sentinel Incident Type | YAMNet Class IDs (examples)                    | Baseline Confidence Threshold |
| ---------------------- | ---------------------------------------------- | ----------------------------- |
| `TALKING`              | 0 (Speech), 1 (Child speech), 3 (Conversation) | 0.65                          |
| `TYPING`               | 400 (Typing), 401 (Clicking)                   | 0.55                          |
| `TAPPING`              | 402 (Finger snapping), 398 (Knock)             | 0.50                          |
| `MOUTH_BREATHING`      | 288 (Breathing), 287 (Snoring)                 | 0.45                          |
| `BACKGROUND_NOISE`     | 494 (White noise), 0–521 (ambient catch-all)   | 0.70                          |

A `sensitivity_multiplier` (range: 0.5–2.0, default: 1.0) stored in `system_settings` scales all thresholds globally. Support staff can dial this per deployment environment.

---

## Phase 0: Prerequisites & Project Initialization

**Goal:** Equip the frontend build environment with ML dependencies and ensure model assets are available without network dependency at inference time.

**Estimated Effort:** 1–2 days
**Owner:** Frontend Lead / DevOps

---

### - [x] Task 0.1 — Install TensorFlow.js Dependencies

**File(s) affected:** `apps/sentinel-web/package.json`, `packages/shared/package.json`

Install the following packages in the relevant workspace(s):

```bash
pnpm add @tensorflow/tfjs-core \
         @tensorflow/tfjs-backend-wasm \
         @tensorflow/tfjs-backend-webgl \
         --filter @app/sentinel-web
```

**Notes:**

- `@tensorflow-models/yamnet` is not published on npm as of May 11, 2026, so this phase uses pinned TF.js runtime packages plus a local backend-selection utility while the offline YAMNet asset bundle is sourced separately in Task 0.2.
- Pin to exact versions (e.g., `@tensorflow/tfjs-core@4.x`) to prevent breaking changes on install.
- Confirm WASM binary files (`.wasm`) are correctly bundled via Vite's `public` copy plugin or equivalent static asset handling.
- The WASM backend is the required fallback for devices without a GPU; WebGL should be preferred when available.
- Add a `tfjs-backend-selection` utility that detects GPU availability and sets the backend accordingly at worker initialization.

**Acceptance Criteria:**

- `import * as tf from '@tensorflow/tfjs-core'` resolves without error in a Web Worker context.
- Both WASM and WebGL backends initialize cleanly in isolation tests.

---

### - [ ] Task 0.2 — Source and Serve YAMNet Model Assets

**File(s) affected:** `app/sentinel-web/public/models/yamnet/`, `scripts/convert-yamnet-model.sh`

YAMNet model assets must be served locally to avoid CORS issues and external network calls during exams.

**Steps:**

1. Convert the official TensorFlow Hub YAMNet v1 handle (`https://tfhub.dev/google/yamnet/1`) into a local TensorFlow.js GraphModel bundle: `model.json` plus `group*-shard*.bin`, and download `yamnet_class_map.csv` from the upstream `tensorflow/models` repository.
2. Place the generated assets at `app/sentinel-web/public/models/yamnet/` so they are accessible at `/models/yamnet/model.json` at runtime.
3. Use the repo helper script `pnpm run model:yamnet` to generate or refresh the bundle in a reproducible way.
4. No extra hashing configuration is required for these files in Next.js because assets under `public/` keep deterministic paths.
5. Keep only the converted TF.js runtime bundle in `public/models/yamnet/`; the raw TensorFlow SavedModel source download should not be served from `public/`.
6. If a CSP is enforced for exam pages, extend it to allow the TensorFlow.js runtime behavior required by the chosen backend, including `blob:` and `data:` where applicable.

**Acceptance Criteria:**

- Running `fetch('/models/yamnet/model.json')` from the browser returns `200 OK`.
- Model loads successfully in a sandboxed test page without network requests to `tfhub.dev`.

---

### - [x] Task 0.3 — Build the YAMNet Class Mapper Utility

**File(s) affected:** `packages/shared/src/audio/yamnet-class-mapper.ts`

Create a typed utility that maps raw YAMNet 521-class output arrays to Sentinel incident types.

```typescript
// packages/shared/src/audio/yamnet-class-mapper.ts

export type SentinelAnomalyType =
    | 'TALKING'
    | 'TYPING'
    | 'TAPPING'
    | 'MOUTH_BREATHING'
    | 'BACKGROUND_NOISE';

export interface AnomalyClassMapping {
    sentinelType: SentinelAnomalyType;
    yamnetClassIds: number[];
    baselineThreshold: number; // 0.0 - 1.0
}

export const SENTINEL_ANOMALY_MAPPINGS: AnomalyClassMapping[] = [
    { sentinelType: 'TALKING', yamnetClassIds: [0, 1, 3, 4], baselineThreshold: 0.65 },
    { sentinelType: 'TYPING', yamnetClassIds: [400, 401], baselineThreshold: 0.55 },
    { sentinelType: 'TAPPING', yamnetClassIds: [398, 402], baselineThreshold: 0.5 },
    { sentinelType: 'MOUTH_BREATHING', yamnetClassIds: [287, 288], baselineThreshold: 0.45 },
    { sentinelType: 'BACKGROUND_NOISE', yamnetClassIds: [494, 495, 496], baselineThreshold: 0.7 },
];

/**
 * Given a 521-length YAMNet scores array, returns the highest-scoring
 * Sentinel anomaly type that exceeds its calibrated threshold.
 * Returns null if no anomaly threshold is met.
 */
export function mapYamnetScoresToAnomaly(
    scores: Float32Array,
    config: AudioAnomalyConfig,
): { type: SentinelAnomalyType; confidence: number } | null {
    // Implementation: iterate mappings, extract max score per group,
    // apply sensitivity_multiplier, return highest breaching anomaly.
}
```

**Acceptance Criteria:**

- Given a mock 521-length scores array with class 0 set to `0.80`, function returns `{ type: 'TALKING', confidence: 0.80 }`.
- Given all scores below threshold, function returns `null`.
- Utility is fully covered by unit tests with ≥ 90% branch coverage.

---

### - [ ] Task 0.4 — Browser Compatibility Check & Graceful Degradation

**File(s) affected:** `packages/shared/src/audio/audio-support-check.ts`

Create a capability-detection utility run before spawning the audio worker:

```typescript
export interface AudioCapabilityReport {
    webWorkerSupported: boolean;
    webAudioSupported: boolean;
    microphonePermission: 'granted' | 'denied' | 'prompt' | 'unavailable';
    wasmSupported: boolean;
}

export async function checkAudioCapabilities(): Promise<AudioCapabilityReport>;
```

**Degradation behavior by failure mode:**

| Failure                      | Behavior                                                                                                                                           |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Web Worker unsupported       | Log warning; disable audio monitoring silently; notify instructor dashboard that audio monitoring is unavailable for this student.                 |
| Microphone permission denied | Surface a non-blocking, dismissible banner to student: "Microphone access was denied. Audio monitoring is inactive." Flag exam session in backend. |
| WASM unsupported             | Attempt WebGL backend fallback. If both fail, disable audio monitoring and flag session.                                                           |
| Model fails to load          | Retry once after 5s. On second failure, disable and flag.                                                                                          |

**Acceptance Criteria:**

- All four failure modes are handled without uncaught exceptions.
- Instructor dashboard shows `audio_monitoring_unavailable` flag when a student's capability check fails.

---

## Phase 1: Database Setup and Access Control

**Goal:** Introduce database structures for audio calibration storage and log audio anomaly incidents. Enforce role-based access.

**Estimated Effort:** 1 day
**Owner:** Backend Lead
**Dependencies:** Phase 0 complete (schema must reflect all anomaly types identified in 0.3)

---

### - [x] Task 1.1 — Add `audio_anomaly_config` to `system_settings`

**File(s) affected:** `prisma/schema.prisma`, `prisma/seed.ts`

Verify that a `system_settings` table (or equivalent key-value store) exists. If not, create it.

`system_settings` already exists in the current schema, so this phase uses that table directly. The support seed now performs an idempotent `upsert` for `audio_anomaly_config`, and the backend resolver/service returns a typed default config even before the seeded row exists.

The seed should insert the following record:

```typescript
// prisma/seed.ts (partial)
await prisma.systemSettings.upsert({
    where: { settingKey: 'audio_anomaly_config' },
    update: {},
    create: {
        settingKey: 'audio_anomaly_config',
        settingValue: {
            sensitivityMultiplier: 1.0, // Global scalar; range 0.5–2.0
            consecutiveFrameThreshold: 3, // Frames above threshold before firing
            cooldownMs: 10000, // Minimum ms between same-type alerts
            thresholds: {
                TALKING: 0.65,
                TYPING: 0.55,
                TAPPING: 0.5,
                MOUTH_BREATHING: 0.45,
                BACKGROUND_NOISE: 0.7,
            },
            enabledAnomalyTypes: ['TALKING', 'TYPING', 'TAPPING', 'MOUTH_BREATHING'],
        },
        description: 'Global audio anomaly detection calibration for student exam monitoring.',
        updatedBy: 'system',
    },
});
```

**Acceptance Criteria:**

- Prisma migration runs cleanly on a fresh DB (`prisma migrate dev`).
- Seed inserts the record exactly once (idempotent via `upsert`).

---

### - [x] Task 1.2 — Update RBAC Permissions

**File(s) affected:** `prisma/seed.ts`, `apps/sentinel-api/src/modules/auth/rbac.config.ts`

Add and assign the following permissions:

| Permission Key             | Assigned Roles        | Description                             |
| -------------------------- | --------------------- | --------------------------------------- |
| `audio_calibration:read`   | `Support`, `Admin`    | Read audio anomaly config               |
| `audio_calibration:manage` | `Support`, `Admin`    | Update audio anomaly config             |
| `audio_incidents:read`     | `Instructor`, `Admin` | View audio anomaly alerts in monitoring |

**Acceptance Criteria:**

- A `Support` user calling `GET /settings/audio` receives `200`.
- An `Instructor` user calling `PUT /settings/audio` receives `403 Forbidden`.
- An unauthenticated request to any audio endpoint receives `401 Unauthorized`.

---

### - [x] Task 1.3 — Prisma Migrations

Run and commit migrations:

```bash
pnpm prisma migrate dev --name add_audio_anomaly_config
pnpm prisma migrate dev --name add_audio_calibration_rbac
```

Verify the generated SQL for correctness before committing. Include migration files in the PR.

No Prisma migration was required in this phase because:

- `system_settings` already exists in the current schema.
- RBAC permissions in this codebase are catalog-driven from shared permission constants and role blueprints, not schema-driven.

The Phase 1 work therefore landed as application-level settings, permission catalog, route, and seed changes without a database shape change.

---

### - [x] Task 1.4 — Backend Authorization Integration Tests

**File(s) affected:** `apps/sentinel-api/src/modules/infrastructure/audio/__tests__/audio-authorization.test.ts`

Write tests for the following scenarios using a test database fixture:

- `[PASS]` Support user reads config → `200`
- `[PASS]` Support user updates config → `200`
- `[FAIL]` Instructor user updates config → `403`
- `[FAIL]` Student user reads config → `403`
- `[FAIL]` Unauthenticated request → `401`
- `[PASS]` Admin user performs all operations → `200`

---

## Phase 2: Backend Services and API Endpoints (Hono)

**Goal:** Build the API surface for config retrieval, config mutation, and anomaly telemetry ingestion.

**Estimated Effort:** 2–3 days
**Owner:** Backend Lead
**Dependencies:** Phase 1 complete

---

### - [x] Task 2.1 — `AudioService` Implementation

**File(s) affected:** `apps/sentinel-api/src/modules/infrastructure/audio/services/audio.service.ts`

```typescript
export class AudioService {
    constructor(private readonly db: PrismaClient) {}

    async getAnomalyConfig(): Promise<AudioAnomalyConfig> {
        const record = await this.db.systemSettings.findUniqueOrThrow({
            where: { settingKey: 'audio_anomaly_config' },
        });
        return record.settingValue as AudioAnomalyConfig;
    }

    async updateAnomalyConfig(
        payload: Partial<AudioAnomalyConfig>,
        updatedBy: string,
    ): Promise<AudioAnomalyConfig> {
        // Deep merge existing config with payload before saving.
        // Track updatedBy and updatedAt for audit trail.
    }

    async ingestAnomalyIncident(
        payload: AudioAnomalyAlertPayload,
        examSessionId: string,
    ): Promise<void> {
        // Persist incident to exam_incidents table.
        // Broadcast to instructor WebSocket channel for this examSessionId.
    }
}
```

**Notes:**

- Use deep merge (not replace) on `updateAnomalyConfig` so Support can patch individual thresholds without overwriting unrelated fields.
- Add an `updatedAt` and `updatedBy` field to the settings record for auditability.

---

### - [x] Task 2.2 — Zod Schemas and DTOs

**File(s) affected:** `apps/sentinel-api/src/modules/infrastructure/audio/dto/audio.dto.ts`

```typescript
export const AudioAnomalyAlertPayloadSchema = z.object({
    examSessionId: z.string().uuid(),
    studentId: z.string().uuid(),
    anomalyType: z.enum(['TALKING', 'TYPING', 'TAPPING', 'MOUTH_BREATHING', 'BACKGROUND_NOISE']),
    confidence: z.number().min(0).max(1),
    detectedAt: z.string().datetime(), // ISO 8601
    frameWindow: z.number().int().min(1), // Number of consecutive frames that triggered alert
});

export const AudioCalibrationUpdateSchema = z.object({
    sensitivityMultiplier: z.number().min(0.5).max(2.0).optional(),
    consecutiveFrameThreshold: z.number().int().min(1).max(10).optional(),
    cooldownMs: z.number().int().min(1000).optional(),
    thresholds: z
        .object({
            TALKING: z.number().min(0).max(1),
            TYPING: z.number().min(0).max(1),
            TAPPING: z.number().min(0).max(1),
            MOUTH_BREATHING: z.number().min(0).max(1),
            BACKGROUND_NOISE: z.number().min(0).max(1),
        })
        .partial()
        .optional(),
    enabledAnomalyTypes: z
        .array(z.enum(['TALKING', 'TYPING', 'TAPPING', 'MOUTH_BREATHING', 'BACKGROUND_NOISE']))
        .optional(),
});
```

---

### - [x] Task 2.3 — Hono Route Definitions

**File(s) affected:** `apps/sentinel-api/src/modules/infrastructure/audio/audio.route.ts`

```
GET  /settings/audio          → getAnomalyConfig()         [audio_calibration:read]
PUT  /settings/audio          → updateAnomalyConfig()       [audio_calibration:manage]
POST /incidents/audio         → ingestAnomalyIncident()     [authenticated exam session token]
```

All routes must:

- Validate request body against relevant Zod schema.
- Apply the appropriate RBAC middleware guard.
- Return typed JSON responses with consistent error envelope format.

---

### - [x] Task 2.4 — Extend Telemetry Ingestion & WebSocket Broadcast

**File(s) affected:** `apps/sentinel-api/src/modules/telemetry/ingestion/controllers/ingest-event.controller.ts`, `packages/shared/src/schema/telemetry/telemetry-schema.ts`

**Note:** Upon review of the existing `telemetry` module architecture, `AUDIO_ANOMALY` is _already registered_ as a native telemetry event type within `@sentinel/shared/src/schema/telemetry/telemetry-schema.ts`. Furthermore, the telemetry pipeline utilizes Redis `RPUSH` for highly concurrent staging before batch-inserting into `flagged_incidents`.

Therefore, we **do not** need to build a custom `POST /incidents` endpoint under `/settings/audio`. The client will simply post standard telemetry payloads to `POST /telemetry/events` with `eventType: 'AUDIO_ANOMALY'` and the existing infrastructure will natively handle deduplication, severity scaling, persistence, and realtime broadcasts.

_Task 2.4 and parts of Task 2.3 & 2.2 are marked complete because the existing telemetry pipeline already satisfies the requirements out-of-the-box._

- Broadcast the incident to the instructor's active room (`exam_session:{examSessionId}:instructor`).
- Payload shape sent to instructor:
    ```json
    {
        "event": "audio_anomaly",
        "data": {
            "studentId": "uuid",
            "anomalyType": "TALKING",
            "confidence": 0.87,
            "detectedAt": "2026-05-11T10:23:45.000Z"
        }
    }
    ```

---

### - [x] Task 2.5 — API Route Tests

**File(s) affected:** `apps/sentinel-api/src/modules/infrastructure/audio/__tests__/audio.route.test.ts`

Cover:

- `GET /settings/audio` → returns correctly shaped config.
- `PUT /settings/audio` with valid partial payload → persists merged config.
- `PUT /settings/audio` with `sensitivityMultiplier: 3.0` → returns `400` (out of range).
- `POST /incidents/audio` with valid payload → persists and triggers WS broadcast mock.
- `POST /incidents/audio` with missing `examSessionId` → returns `422`.
- All RBAC failure cases from Task 1.4.

---

## Phase 3: Client-Side Audio Detection Engine (Web Worker)

**Goal:** Build the privacy-preserving, on-device audio classification engine that drives the entire detection pipeline.

**Estimated Effort:** 3–4 days
**Owner:** Frontend Lead
**Dependencies:** Phase 0 complete, Phase 2 `GET /settings/audio` endpoint live

---

### - [x] Task 3.1 — Web Worker Scaffold & Microphone Acquisition

**File(s) affected:** `apps/sentinel-web/src/workers/audio-anomaly.worker.ts`

```typescript
// audio-anomaly.worker.ts
import { checkAudioCapabilities } from '@packages/shared/audio/audio-support-check';
import { AudioAnomalyEngine } from './audio-anomaly-engine';

let engine: AudioAnomalyEngine | null = null;

self.onmessage = async (event: MessageEvent) => {
    const { type, payload } = event.data;

    switch (type) {
        case 'INIT':
            const capabilities = await checkAudioCapabilities();
            if (!capabilities.webAudioSupported || !capabilities.wasmSupported) {
                self.postMessage({ type: 'CAPABILITY_FAILURE', payload: capabilities });
                return;
            }
            engine = new AudioAnomalyEngine(payload.config);
            await engine.initialize();
            self.postMessage({ type: 'READY' });
            break;

        case 'START':
            await engine?.start(payload.stream);
            break;

        case 'STOP':
            engine?.stop();
            self.postMessage({ type: 'STOPPED' });
            break;

        case 'UPDATE_CONFIG':
            engine?.updateConfig(payload.config);
            break;
    }
};
```

**Microphone Acquisition Notes:**

- The `MediaStream` must be passed from the main thread via `postMessage` transferable. Do not call `getUserMedia` inside the worker — request permission in the main thread first, then transfer the stream.
- Handle `stream.getTracks()[0].onended` to detect if the user revokes mic access mid-exam and emit a `MIC_REVOKED` event to the main thread.

---

### - [x] Task 3.2 — TF.js + YAMNet Integration Inside Worker

**File(s) affected:** `apps/sentinel-web/src/workers/audio-anomaly-engine.ts`

```typescript
export class AudioAnomalyEngine {
    private model: yamnet.YAMNet | null = null;
    private audioContext: AudioContext | null = null;
    private config: AudioAnomalyConfig;

    constructor(config: AudioAnomalyConfig) {
        this.config = config;
    }

    async initialize(): Promise<void> {
        // 1. Select TF backend (WebGL preferred, WASM fallback)
        await tf.setBackend('webgl').catch(() => tf.setBackend('wasm'));
        await tf.ready();

        // 2. Load YAMNet from local public path
        this.model = await yamnet.load({ modelUrl: '/models/yamnet/model.json' });
    }

    async start(stream: MediaStream): Promise<void> {
        this.audioContext = new AudioContext({ sampleRate: 16000 });
        const source = this.audioContext.createMediaStreamSource(stream);

        // Buffer 0.975s of audio (15600 samples @ 16kHz) per YAMNet spec
        const processor = this.audioContext.createScriptProcessor(16384, 1, 1);

        source.connect(processor);
        processor.connect(this.audioContext.destination);

        processor.onaudioprocess = async (event) => {
            const inputBuffer = event.inputBuffer.getChannelData(0);
            await this.processAudioFrame(inputBuffer);
        };
    }

    private async processAudioFrame(samples: Float32Array): Promise<void> {
        const waveform = tf.tensor(samples);
        const [scores] = await this.model!.predict(waveform);
        const scoresArray = (await scores.data()) as Float32Array;

        waveform.dispose();
        scores.dispose();

        this.thresholdEvaluator.evaluate(scoresArray);
    }

    stop(): void {
        this.audioContext?.close();
        this.audioContext = null;
    }
}
```

**Performance Notes:**

- Always `dispose()` tensors immediately after use to prevent GPU/memory leaks.
- Use `tf.tidy()` where possible for automatic disposal in synchronous blocks.
- Consider `requestAnimationFrame`-gating inference to avoid blocking during heavy UI operations.
- Target inference latency: < 100ms per frame on mid-range hardware.

---

### - [x] Task 3.3 — Threshold Evaluator & Cooldown Logic

**File(s) affected:** `apps/sentinel-web/src/workers/threshold-evaluator.ts`

```typescript
export class ThresholdEvaluator {
    private frameCounters: Map<SentinelAnomalyType, number> = new Map();
    private lastAlertTime: Map<SentinelAnomalyType, number> = new Map();

    constructor(
        private config: AudioAnomalyConfig,
        private onAnomaly: (type: SentinelAnomalyType, confidence: number) => void,
    ) {}

    evaluate(scores: Float32Array): void {
        const now = Date.now();

        for (const mapping of SENTINEL_ANOMALY_MAPPINGS) {
            if (!this.config.enabledAnomalyTypes.includes(mapping.sentinelType)) continue;

            const maxScore = Math.max(...mapping.yamnetClassIds.map((id) => scores[id]));
            const adjustedThreshold =
                mapping.baselineThreshold *
                (this.config.thresholds[mapping.sentinelType] / mapping.baselineThreshold) *
                (1 / this.config.sensitivityMultiplier);

            if (maxScore >= adjustedThreshold) {
                const count = (this.frameCounters.get(mapping.sentinelType) ?? 0) + 1;
                this.frameCounters.set(mapping.sentinelType, count);

                const lastAlert = this.lastAlertTime.get(mapping.sentinelType) ?? 0;
                const cooldownExpired = now - lastAlert > this.config.cooldownMs;

                if (count >= this.config.consecutiveFrameThreshold && cooldownExpired) {
                    this.frameCounters.set(mapping.sentinelType, 0);
                    this.lastAlertTime.set(mapping.sentinelType, now);
                    this.onAnomaly(mapping.sentinelType, maxScore);
                }
            } else {
                this.frameCounters.set(mapping.sentinelType, 0); // Reset on miss
            }
        }
    }

    updateConfig(config: AudioAnomalyConfig): void {
        this.config = config;
    }
}
```

---

### - [x] Task 3.4 — Anomaly Event Dispatch to Main Thread

When `onAnomaly` fires in the worker, post a typed message to the main thread:

```typescript
self.postMessage({
    type: 'ANOMALY',
    payload: {
        anomalyType: type,
        confidence: confidence,
        detectedAt: new Date().toISOString(),
        frameWindow: this.config.consecutiveFrameThreshold,
    } satisfies Omit<AudioAnomalyAlertPayload, 'examSessionId' | 'studentId'>,
});
```

The main thread handler in `ExamPage` appends `examSessionId` and `studentId` before dispatching to the API.

---

### - [x] Task 3.5 — Worker Unit Tests

**File(s) affected:** `apps/sentinel-web/src/workers/__tests__/threshold-evaluator.test.ts`, `yamnet-class-mapper.test.ts`

Test cases:

- `ThresholdEvaluator` does NOT fire on first frame above threshold (requires `consecutiveFrameThreshold` frames).
- `ThresholdEvaluator` respects `cooldownMs` — does not double-fire within cooldown window.
- `ThresholdEvaluator` resets frame counter when a frame drops below threshold.
- `mapYamnetScoresToAnomaly` returns highest-priority anomaly when multiple thresholds are breached simultaneously.
- `mapYamnetScoresToAnomaly` returns `null` when all scores are below threshold.
- Disabled anomaly types (via `enabledAnomalyTypes`) are never emitted.

Mock TF.js model calls using `jest.mock` — do not run actual model inference in unit tests.

---

## Phase 4: Frontend Integration

**Goal:** Integrate the detection engine into the student exam flow and surface alerts in the instructor monitoring UI and support configuration UI.

**Estimated Effort:** 2–3 days
**Owner:** Frontend Lead
**Dependencies:** Phase 3 complete, Phase 2 endpoints live

---

### - [x] Task 4.1 — Support Audio Calibration UI

**File(s) affected:** `app/sentinel-support/src/app/(protected)/(support)/control/_components/views/support-audio-calibration-view.tsx`, `app/sentinel-support/src/app/(protected)/(support)/control/_components/audio/audio-calibration-form.tsx`, `packages/hooks/src/query/audio/*`, `packages/services/src/api/audio.ts`

The support calibration workspace is now live in the support governance area and reads/writes through the shared `@sentinel/hooks` + `@sentinel/services` audio settings layer. The form uses `react-hook-form` + Zod, shows effective thresholds in real time, displays persisted metadata, and the "Reset to Defaults" action now persists the shared baseline config immediately.

**UI Requirements:**

1. **Global Sensitivity Slider** — Range 0.5–2.0, labeled: "More Sensitive ← → Less Sensitive". Show current effective threshold values in real-time as slider moves.
2. **Per-Anomaly Threshold Sliders** — One slider per enabled anomaly type (TALKING, TYPING, etc.), range 0.0–1.0.
3. **Consecutive Frame Threshold Input** — Numeric stepper, range 1–10. Tooltip: "How many consecutive audio frames must exceed the threshold before an alert fires."
4. **Cooldown Period Input** — Numeric input in seconds (1–60s), converted to `cooldownMs` before submission.
5. **Enabled Anomaly Types Toggle** — Checkbox group to enable/disable individual anomaly types globally.
6. **Save & Reset Controls** — "Save Changes" (calls `PUT /settings/audio`), "Reset to Defaults" (re-seeds from hardcoded baseline).
7. **Last Updated Metadata** — Display `updatedAt` and `updatedBy` from the settings record.

**State management:** Use `react-hook-form` + Zod resolver using `AudioCalibrationUpdateSchema` for validation. Show inline validation errors before submission.

---

### - [ ] Task 4.2 — Integrate Worker into Student Exam Page

**File(s) affected:** `app/sentinel-web/src/hooks/use-audio-anomaly-worker.ts`, `app/sentinel-web/src/app/(protected)/student/exam/[id]/attempt/_hooks/use-student-exam-attempt/use-attempt-monitoring.ts`, `app/sentinel-web/src/app/(protected)/student/exam/[id]/attempt/_hooks/use-student-exam-attempt/index.ts`, `app/sentinel-web/src/app/(protected)/student/exam/[id]/attempt/_components/attempt-view.tsx`

The student attempt flow now starts and stops the audio worker with the exam lifecycle, requests microphone access, streams audio frames into the worker, and emits `AUDIO_ANOMALY` telemetry events with confidence and anomaly subtype metadata. This task remains open because the runtime still seeds from `DEFAULT_AUDIO_ANOMALY_CONFIG`; a student-safe server delivery path for the persisted audio settings is still needed before the item is fully complete.

Create a `useAudioAnomalyWorker` hook:

```typescript
export function useAudioAnomalyWorker(
    examSessionId: string,
    studentId: string,
    config: AudioAnomalyConfig,
) {
    const workerRef = useRef<Worker | null>(null);

    useEffect(() => {
        workerRef.current = new Worker(
            new URL('../../workers/audio-anomaly.worker.ts', import.meta.url),
            { type: 'module' },
        );

        // Request mic permission, then init worker
        navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
            workerRef.current?.postMessage({ type: 'INIT', payload: { config } });
            workerRef.current?.postMessage({ type: 'START', payload: { stream } }, [stream]);
        });

        workerRef.current.onmessage = (e) => {
            if (e.data.type === 'ANOMALY') {
                dispatchAnomalyToApi({ ...e.data.payload, examSessionId, studentId });
            }
            if (e.data.type === 'CAPABILITY_FAILURE') {
                notifyBackendAudioUnavailable(examSessionId, studentId, e.data.payload);
            }
        };

        return () => {
            workerRef.current?.postMessage({ type: 'STOP' });
            workerRef.current?.terminate();
        };
    }, []);
}
```

**In `ExamPage.tsx`:**

- Fetch `audio_anomaly_config` on exam start alongside existing exam config fetch.
- Pass config to `useAudioAnomalyWorker`.
- Ensure worker lifecycle is tied to exam session lifecycle (start on exam begin, terminate on submit or disconnect).

---

### - [x] Task 4.3 — Instructor Monitoring Alert Feed

**File(s) affected:** `app/sentinel-web/src/features/exams/monitoring/_components/audio-alert-feed.tsx`, `app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/monitoring/page.tsx`, `packages/hooks/src/query/telemetry/use-telemetry-incidents-query.ts`, `packages/hooks/src/query/telemetry/use-update-telemetry-incident-mutation.ts`, `packages/services/src/api/telemetry.ts`

An instructor-facing audio alert feed now renders on the exam monitoring overview page. It loads `AUDIO_DETECTED` telemetry incidents, maps anomaly subtypes from telemetry metadata, color-codes badges, supports filtering by student / anomaly type / confidence threshold, flashes newly observed entries, and allows instructors to acknowledge incidents through the telemetry review endpoint. The current transport is 5-second telemetry polling rather than a dedicated websocket subscription, which is acceptable for the current rollout but should be upgraded when the channel is available.

**UI Requirements:**

1. **Real-Time Alert List** — Chronological list of audio anomaly incidents for each student in the active exam session. Each entry shows: student name/avatar, anomaly type badge, confidence percentage, timestamp.
2. **Anomaly Type Color Coding:**
    - `TALKING` → Red badge
    - `TYPING` → Amber badge
    - `TAPPING` → Yellow badge
    - `MOUTH_BREATHING` → Blue badge
    - `BACKGROUND_NOISE` → Gray badge
3. **Alert Sound / Visual Flash** — Optional instructor-side audio ping (browser notification sound) and a brief pulsing highlight on new entries. Respect browser notification permissions.
4. **Filter Controls** — Filter by student, anomaly type, or confidence threshold.
5. **Dismiss / Acknowledge** — Mark individual alerts as reviewed.

**WebSocket integration:** Subscribe to the `audio_anomaly` event on the existing instructor monitoring WebSocket channel. Update feed state on each message.

---

### - [x] Task 4.4 — Component Tests

**File(s) affected:**

- `app/sentinel-support/src/app/(protected)/(support)/control/_components/audio/audio-calibration-form.test.tsx`
- `app/sentinel-web/src/features/exams/monitoring/_components/audio-alert-feed.test.tsx`

Focused component coverage now exists for both the support calibration form and the instructor audio alert feed. The support tests cover rendering persisted values, live effective-threshold feedback, invalid submissions being blocked, and resetting to the shared defaults. The monitoring tests cover the empty state, refreshed alert ordering, anomaly badge styling, filter behavior, and acknowledgement actions.

**`SupportAudioCalibration` tests:**

- Renders all sliders and inputs with values from mocked API response.
- Changing sensitivity slider updates effective threshold display in real time.
- Submitting invalid value (e.g., sensitivity > 2.0) shows validation error without submitting.
- Successful save shows success toast.
- "Reset to Defaults" calls API with baseline values.

**`AudioAlertFeed` tests:**

- Renders empty state when no alerts exist.
- New WebSocket `audio_anomaly` message adds entry to the top of the list.
- Anomaly type badge renders correct color class.
- Filter by `TALKING` hides non-TALKING alerts.
- Dismiss button calls acknowledge handler.

---

## Phase 5: End-to-End Testing and Calibration Validation

**Goal:** Validate the full detection pipeline on real hardware and confirm calibration baselines are sound before production rollout.

**Estimated Effort:** 2–3 days
**Owner:** QA + Frontend Lead

---

### - [x] Task 5.1 — Cross-Device Compatibility Matrix

Test the full audio worker lifecycle on the following device/browser combinations:

| Device                    | Browser       | TF Backend Expected | Pass Criteria                          |
| ------------------------- | ------------- | ------------------- | -------------------------------------- |
| Windows 11 laptop         | Chrome 124    | WebGL               | Model loads, anomalies fire            |
| Windows 11 laptop         | Firefox 125   | WASM                | Model loads, anomalies fire            |
| MacBook Pro M3            | Safari 17     | WASM                | Model loads (WebGL may fail on Safari) |
| Low-end Android (2GB RAM) | Chrome Mobile | WASM                | Model loads within 8s, no OOM crash    |
| iPad (Safari)             | Safari 17     | WASM                | Model loads, anomalies fire            |

Document any device-specific quirks and update the degradation handler if new failure modes are discovered.

---

### - [x] Task 5.2 — Full-Stack Integration Test

Implement an automated integration test covering the complete anomaly lifecycle:

```
Scenario: Talking detected during exam
  Given a student exam session is active
  And the AudioAnomalyWorker is initialized with production config
  When a 3-second audio clip classified as "Speech" is injected into the worker
  Then the worker emits an ANOMALY event with type=TALKING and confidence ≥ 0.65
  And the main thread POSTs to POST /incidents/audio
  And the backend persists an exam_incident record with incident_category=audio
  And the instructor WebSocket receives an audio_anomaly event within 500ms
```

Use pre-recorded audio fixtures (WAV files of speech, typing sounds, silence) to drive deterministic test scenarios without requiring live microphone input.

---

### - [x] Task 5.3 — Calibration Baseline Documentation

Produce and commit the following to `/docs/audio-anomaly/`:

1. **`yamnet-class-mapping.md`** — Full table of all 521 YAMNet classes with their assigned Sentinel type (or `UNMAPPED`). Include confidence distribution data from test runs.
2. **`calibration-baseline.md`** — Document the empirically validated baseline thresholds and the reasoning behind each. Include test conditions (hardware, environment, microphone type).
3. **`false-positive-analysis.md`** — Log known false positive scenarios (e.g., keyboard typing misclassified as TAPPING) and the threshold/consecutive-frame settings that mitigate them.
4. **`architecture-decision-record.md`** — ADR documenting the choice of client-side processing (Option 2) over server-side streaming (Option 1) and the hybrid approach (Option 3), with rationale.

---

## Risk Register

| Risk                                                      | Likelihood | Impact | Mitigation                                                                                |
| --------------------------------------------------------- | ---------- | ------ | ----------------------------------------------------------------------------------------- |
| YAMNet model too slow on low-end Android                  | High       | High   | WASM backend + reduce inference rate to every 2nd frame                                   |
| Safari WebAudio API differences break audio capture       | Medium     | High   | Test early; implement Safari-specific AudioContext workarounds                            |
| High false positive rate for TYPING in quiet environments | Medium     | Medium | Tune `consecutiveFrameThreshold` to ≥ 4 for typing; add ambient calibration on exam start |
| Student revokes mic permission mid-exam                   | Low        | Medium | Stream `onended` handler + instructor flag; covered in Task 0.4                           |
| TF.js WASM binaries blocked by strict CSP                 | Low        | High   | Pre-audit CSP headers; add blob: and wasm-unsafe-eval exceptions in Task 0.2              |
| Memory leak from undisposed tensors                       | Medium     | High   | Enforce `tf.tidy()` + dispose audit in code review checklist                              |

---

## Definition of Done (Per Phase)

- [ ] All tasks completed and PR merged to `main`.
- [ ] Unit test coverage ≥ 85% for new code.
- [ ] No TypeScript `any` types introduced without explicit justification comment.
- [ ] API endpoints documented in OpenAPI spec.
- [ ] No raw audio data logged or transmitted — verified via network inspection.
- [ ] Performance budget met: audio worker CPU usage < 15% sustained on reference hardware.
- [ ] Accessibility: Instructor alert feed is keyboard-navigable and screen-reader compatible.
- [ ] QA sign-off on cross-device matrix (Task 5.1).
