import {
    TELEMETRY_EVENT_DEFINITIONS,
    type TelemetryRuleOverrideSchemaValues,
    type TelemetryRuleKey,
    type TelemetrySource,
    type TelemetryPlatform,
    type TelemetryMediaPipeSandboxSchemaValues,
} from '../schema';
import type { ExamConfiguration } from '../types';

export const MEDIAPIPE_SUPPORTED_EVENT_TYPES = [
    'GAZE_OFF_SCREEN',
    'NO_FACE_DETECTED',
    'MULTIPLE_FACES',
] as const;

export const MEDIAPIPE_DEFAULT_THRESHOLDS = {
    confidenceThreshold: 0.8,
    frameIntervalMs: 500,
    gazeDurationMs: 3_000,
    noFaceDurationMs: 5_000,
} as const;

export const MEDIAPIPE_LANDMARK_INDEX = {
    noseTip: 1,
    browCenter: 168,
    chin: 152,
    eyeAOuter: 33,
    eyeAInner: 133,
    eyeAUpperOuter: 160,
    eyeAUpperCenter: 159,
    eyeAUpperInner: 158,
    eyeALowerOuter: 144,
    eyeALowerCenter: 145,
    eyeALowerInner: 153,
    eyeBInner: 362,
    eyeBOuter: 263,
    eyeBUpperInner: 387,
    eyeBUpperCenter: 386,
    eyeBUpperOuter: 385,
    eyeBLowerInner: 373,
    eyeBLowerCenter: 374,
    eyeBLowerOuter: 380,
} as const;

export const MEDIAPIPE_IRIS_LANDMARK_GROUPS = [
    [468, 469, 470, 471, 472],
    [473, 474, 475, 476, 477],
] as const;

export const MEDIAPIPE_CLIENT_CAPABILITIES = [
    'camera-stream',
    'mediapipe-face-landmarker',
    'face-landmark-overlay',
    'gaze-signal-analysis',
    'telemetry-preview',
] as const;

export type MediaPipeSupportedEventType = (typeof MEDIAPIPE_SUPPORTED_EVENT_TYPES)[number];
export type MediaPipeLandmark = {
    x: number;
    y: number;
    z?: number;
};

export type MediaPipeFaceBounds = {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    width: number;
    height: number;
    centerX: number;
    centerY: number;
};

export type MediaPipeGazeDirection = 'center' | 'left' | 'right' | 'up' | 'down';
export type MediaPipeEyeState = 'open' | 'closed' | 'unknown';
export type MediaPipeAnalysisStatus =
    | 'ready'
    | 'no-face'
    | 'multiple-faces'
    | 'off-screen'
    | 'low-confidence'
    | 'unsupported';

export type MediaPipeFrameAnalysis = {
    status: MediaPipeAnalysisStatus;
    signal: MediaPipeSupportedEventType | null;
    faceCount: number;
    confidenceScore: number | null;
    gazeDirection: MediaPipeGazeDirection | null;
    eyeState: MediaPipeEyeState;
    faceBounds: MediaPipeFaceBounds | null;
    reasons: string[];
};

export type MediaPipeTelemetryAggregation = {
    trigger: 'immediate' | 'duration-threshold' | 'repeat-threshold' | 'confidence-threshold';
    occurrenceCount?: number;
    windowSeconds?: number;
    threshold?: number;
};

export type MediaPipeTelemetryMetadata = {
    durationMs?: number;
    confidenceScore?: number;
    aggregation?: MediaPipeTelemetryAggregation;
};

export type MediaPipeTelemetrySessionContext = {
    browser?: string;
    os?: string;
    deviceType?: 'DESKTOP' | 'TABLET' | 'MOBILE';
    appVersion?: string;
    clientVersion?: string;
    clientCapabilities?: string[];
};

export type MediaPipeTelemetryPayload = {
    examSessionId: string;
    studentId: string;
    timestamp: string;
    eventType: MediaPipeSupportedEventType;
    platform: TelemetryPlatform;
    source: TelemetrySource;
    ruleKey: TelemetryRuleKey;
    metadata?: MediaPipeTelemetryMetadata;
    sessionContext?: MediaPipeTelemetrySessionContext;
};

export type MediaPipeThresholdResolution = {
    eventType: MediaPipeSupportedEventType;
    confidenceThreshold: number;
    durationThresholdMs: number | null;
    repeatThreshold: number | null;
};

export type MediaPipeRolloutStage = 'sandbox' | 'checkup' | 'attempt';

export type MediaPipeSignalTrackerState = {
    activeSignal: MediaPipeSupportedEventType | null;
    activeSinceMs: number | null;
    lastEmittedAtMs: number | null;
    occurrenceCount: number;
};

export type EvaluateMediaPipeSignalDispatchArgs = {
    currentSignal: MediaPipeSupportedEventType | null;
    tracker: MediaPipeSignalTrackerState;
    nowMs: number;
    thresholds: Record<MediaPipeSupportedEventType, MediaPipeThresholdResolution>;
};

export type EvaluateMediaPipeSignalDispatchResult = {
    tracker: MediaPipeSignalTrackerState;
    shouldEmit: boolean;
    durationMs?: number;
    aggregation?: MediaPipeTelemetryAggregation;
};

function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
}

function readLandmark(
    landmarks: MediaPipeLandmark[],
    index: (typeof MEDIAPIPE_LANDMARK_INDEX)[keyof typeof MEDIAPIPE_LANDMARK_INDEX],
) {
    return landmarks[index] ?? null;
}

function readLandmarkByIndex(landmarks: MediaPipeLandmark[], index: number) {
    return landmarks[index] ?? null;
}

function averageLandmark(
    landmarks: MediaPipeLandmark[],
    indices: readonly number[],
): MediaPipeLandmark | null {
    const resolved = indices
        .map((index) => readLandmarkByIndex(landmarks, index))
        .filter((landmark): landmark is MediaPipeLandmark => landmark !== null);

    if (resolved.length !== indices.length) {
        return null;
    }

    return {
        x: resolved.reduce((sum, landmark) => sum + landmark.x, 0) / resolved.length,
        y: resolved.reduce((sum, landmark) => sum + landmark.y, 0) / resolved.length,
        z: resolved.reduce((sum, landmark) => sum + (landmark.z ?? 0), 0) / resolved.length,
    } satisfies MediaPipeLandmark;
}

function calculateLandmarkDistance(a: MediaPipeLandmark, b: MediaPipeLandmark) {
    return Math.hypot(a.x - b.x, a.y - b.y);
}

export function calculateMediaPipeFaceBounds(
    landmarks: MediaPipeLandmark[],
): MediaPipeFaceBounds | null {
    if (landmarks.length === 0) {
        return null;
    }

    const xValues = landmarks.map((landmark) => landmark.x);
    const yValues = landmarks.map((landmark) => landmark.y);

    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);
    const width = Math.max(maxX - minX, 0);
    const height = Math.max(maxY - minY, 0);

    return {
        minX,
        minY,
        maxX,
        maxY,
        width,
        height,
        centerX: minX + width / 2,
        centerY: minY + height / 2,
    };
}

export function estimateMediaPipeConfidenceScore(landmarks: MediaPipeLandmark[]) {
    const faceBounds = calculateMediaPipeFaceBounds(landmarks);

    if (!faceBounds) {
        return null;
    }

    const faceAreaScore = clamp((faceBounds.width * faceBounds.height - 0.02) / 0.12, 0, 1);
    const edgeDistanceX = Math.abs(faceBounds.centerX - 0.5);
    const edgeDistanceY = Math.abs(faceBounds.centerY - 0.5);
    const centeringScore = clamp(1 - (edgeDistanceX * 1.4 + edgeDistanceY * 1.2), 0, 1);

    return clamp(faceAreaScore * 0.65 + centeringScore * 0.35, 0, 1);
}

function estimateMediaPipeHeadPoseDirection(
    landmarks: MediaPipeLandmark[],
): MediaPipeGazeDirection | null {
    const noseTip = readLandmark(landmarks, MEDIAPIPE_LANDMARK_INDEX.noseTip);
    const eyeAOuter = readLandmark(landmarks, MEDIAPIPE_LANDMARK_INDEX.eyeAOuter);
    const eyeBOuter = readLandmark(landmarks, MEDIAPIPE_LANDMARK_INDEX.eyeBOuter);
    const browCenter = readLandmark(landmarks, MEDIAPIPE_LANDMARK_INDEX.browCenter);
    const chin = readLandmark(landmarks, MEDIAPIPE_LANDMARK_INDEX.chin);

    if (!noseTip || !eyeAOuter || !eyeBOuter || !browCenter || !chin) {
        return null;
    }

    const eyeCenterX = (eyeAOuter.x + eyeBOuter.x) / 2;
    const eyeCenterY = (eyeAOuter.y + eyeBOuter.y) / 2;
    const faceWidth = Math.max(Math.abs(eyeBOuter.x - eyeAOuter.x), 0.001);
    const faceHeight = Math.max(Math.abs(chin.y - browCenter.y), 0.001);

    const horizontalOffset = (noseTip.x - eyeCenterX) / faceWidth;
    const verticalOffset = (noseTip.y - eyeCenterY) / faceHeight;

    if (Math.abs(horizontalOffset) >= Math.abs(verticalOffset)) {
        if (horizontalOffset <= -0.18) {
            return 'left';
        }

        if (horizontalOffset >= 0.18) {
            return 'right';
        }
    }

    if (verticalOffset <= -0.16) {
        return 'up';
    }

    if (verticalOffset >= 0.2) {
        return 'down';
    }

    return 'center';
}

function estimateMediaPipeEyeState(landmarks: MediaPipeLandmark[]): MediaPipeEyeState {
    const eyeRatios = [
        {
            cornerA: readLandmark(landmarks, MEDIAPIPE_LANDMARK_INDEX.eyeAOuter),
            cornerB: readLandmark(landmarks, MEDIAPIPE_LANDMARK_INDEX.eyeAInner),
            upperPoints: [
                readLandmark(landmarks, MEDIAPIPE_LANDMARK_INDEX.eyeAUpperOuter),
                readLandmark(landmarks, MEDIAPIPE_LANDMARK_INDEX.eyeAUpperCenter),
                readLandmark(landmarks, MEDIAPIPE_LANDMARK_INDEX.eyeAUpperInner),
            ],
            lowerPoints: [
                readLandmark(landmarks, MEDIAPIPE_LANDMARK_INDEX.eyeALowerOuter),
                readLandmark(landmarks, MEDIAPIPE_LANDMARK_INDEX.eyeALowerCenter),
                readLandmark(landmarks, MEDIAPIPE_LANDMARK_INDEX.eyeALowerInner),
            ],
        },
        {
            cornerA: readLandmark(landmarks, MEDIAPIPE_LANDMARK_INDEX.eyeBInner),
            cornerB: readLandmark(landmarks, MEDIAPIPE_LANDMARK_INDEX.eyeBOuter),
            upperPoints: [
                readLandmark(landmarks, MEDIAPIPE_LANDMARK_INDEX.eyeBUpperInner),
                readLandmark(landmarks, MEDIAPIPE_LANDMARK_INDEX.eyeBUpperCenter),
                readLandmark(landmarks, MEDIAPIPE_LANDMARK_INDEX.eyeBUpperOuter),
            ],
            lowerPoints: [
                readLandmark(landmarks, MEDIAPIPE_LANDMARK_INDEX.eyeBLowerInner),
                readLandmark(landmarks, MEDIAPIPE_LANDMARK_INDEX.eyeBLowerCenter),
                readLandmark(landmarks, MEDIAPIPE_LANDMARK_INDEX.eyeBLowerOuter),
            ],
        },
    ]
        .map((eye) => {
            if (
                !eye.cornerA ||
                !eye.cornerB ||
                eye.upperPoints.some((point) => point === null) ||
                eye.lowerPoints.some((point) => point === null)
            ) {
                return null;
            }

            const horizontalDistance = Math.max(
                calculateLandmarkDistance(eye.cornerA, eye.cornerB),
                0.001,
            );
            const averageVerticalDistance =
                eye.upperPoints.reduce((sum, point, index) => {
                    return (
                        sum +
                        calculateLandmarkDistance(
                            point as MediaPipeLandmark,
                            eye.lowerPoints[index] as MediaPipeLandmark,
                        )
                    );
                }, 0) / eye.upperPoints.length;

            return averageVerticalDistance / horizontalDistance;
        })
        .filter((ratio): ratio is number => ratio !== null);

    if (eyeRatios.length !== 2) {
        return 'unknown';
    }

    return eyeRatios.every((ratio) => ratio <= 0.18) ? 'closed' : 'open';
}

export function estimateMediaPipeGazeDirection(landmarks: MediaPipeLandmark[]): {
    direction: MediaPipeGazeDirection | null;
    eyeState: MediaPipeEyeState;
} {
    const eyeState = estimateMediaPipeEyeState(landmarks);

    if (eyeState === 'closed') {
        return {
            direction: 'center',
            eyeState,
        };
    }

    const eyeSamples = [
        {
            cornerA: readLandmark(landmarks, MEDIAPIPE_LANDMARK_INDEX.eyeAOuter),
            cornerB: readLandmark(landmarks, MEDIAPIPE_LANDMARK_INDEX.eyeAInner),
            upperIndices: [
                MEDIAPIPE_LANDMARK_INDEX.eyeAUpperOuter,
                MEDIAPIPE_LANDMARK_INDEX.eyeAUpperCenter,
                MEDIAPIPE_LANDMARK_INDEX.eyeAUpperInner,
            ],
            lowerIndices: [
                MEDIAPIPE_LANDMARK_INDEX.eyeALowerOuter,
                MEDIAPIPE_LANDMARK_INDEX.eyeALowerCenter,
                MEDIAPIPE_LANDMARK_INDEX.eyeALowerInner,
            ],
        },
        {
            cornerA: readLandmark(landmarks, MEDIAPIPE_LANDMARK_INDEX.eyeBInner),
            cornerB: readLandmark(landmarks, MEDIAPIPE_LANDMARK_INDEX.eyeBOuter),
            upperIndices: [
                MEDIAPIPE_LANDMARK_INDEX.eyeBUpperInner,
                MEDIAPIPE_LANDMARK_INDEX.eyeBUpperCenter,
                MEDIAPIPE_LANDMARK_INDEX.eyeBUpperOuter,
            ],
            lowerIndices: [
                MEDIAPIPE_LANDMARK_INDEX.eyeBLowerInner,
                MEDIAPIPE_LANDMARK_INDEX.eyeBLowerCenter,
                MEDIAPIPE_LANDMARK_INDEX.eyeBLowerOuter,
            ],
        },
    ]
        .map((eye) => {
            if (!eye.cornerA || !eye.cornerB) {
                return null;
            }

            const minX = Math.min(eye.cornerA.x, eye.cornerB.x);
            const maxX = Math.max(eye.cornerA.x, eye.cornerB.x);
            const upperCenter = averageLandmark(landmarks, eye.upperIndices);
            const lowerCenter = averageLandmark(landmarks, eye.lowerIndices);

            if (!upperCenter || !lowerCenter) {
                return null;
            }

            return {
                minX,
                maxX,
                upperCenter,
                lowerCenter,
                centerX: (eye.cornerA.x + eye.cornerB.x) / 2,
            };
        })
        .filter(
            (
                eye,
            ): eye is {
                minX: number;
                maxX: number;
                upperCenter: MediaPipeLandmark;
                lowerCenter: MediaPipeLandmark;
                centerX: number;
            } => eye !== null,
        )
        .sort((a, b) => a.centerX - b.centerX);

    const irisCenters = MEDIAPIPE_IRIS_LANDMARK_GROUPS.map((indices) =>
        averageLandmark(landmarks, indices),
    )
        .filter((iris): iris is MediaPipeLandmark => iris !== null)
        .sort((a, b) => a.x - b.x);

    if (eyeSamples.length !== 2 || irisCenters.length !== 2) {
        return {
            direction: estimateMediaPipeHeadPoseDirection(landmarks),
            eyeState,
        };
    }

    const horizontalOffsets = eyeSamples.map((eye, index) => {
        const span = Math.max(eye.maxX - eye.minX, 0.001);
        return ((irisCenters[index].x - eye.minX) / span - 0.5) * 2;
    });
    const verticalOffsets = eyeSamples.map((eye, index) => {
        const span = Math.max(eye.lowerCenter.y - eye.upperCenter.y, 0.001);
        return ((irisCenters[index].y - eye.upperCenter.y) / span - 0.5) * 2;
    });
    const horizontalOffset =
        horizontalOffsets.reduce((sum, offset) => sum + offset, 0) / horizontalOffsets.length;
    const verticalOffset =
        verticalOffsets.reduce((sum, offset) => sum + offset, 0) / verticalOffsets.length;
    const fallbackDirection = estimateMediaPipeHeadPoseDirection(landmarks);

    if (
        Math.abs(horizontalOffset) >= 0.14 &&
        Math.abs(horizontalOffset) >= Math.abs(verticalOffset) * 0.8
    ) {
        return {
            direction: horizontalOffset < 0 ? 'left' : 'right',
            eyeState,
        };
    }

    if (verticalOffset <= -0.18) {
        return {
            direction: 'up',
            eyeState,
        };
    }

    if (verticalOffset >= 0.22) {
        return {
            direction: 'down',
            eyeState,
        };
    }

    return {
        direction:
            fallbackDirection && fallbackDirection !== 'center' ? fallbackDirection : 'center',
        eyeState,
    };
}

export function analyzeMediaPipeFrame(args: {
    landmarksByFace: MediaPipeLandmark[][];
    confidenceScores?: number[];
    confidenceThreshold: number;
}): MediaPipeFrameAnalysis {
    const faceCount = args.landmarksByFace.length;
    const inferredConfidenceScores =
        args.confidenceScores?.length === faceCount
            ? args.confidenceScores
            : args.landmarksByFace.map(
                  (landmarks) => estimateMediaPipeConfidenceScore(landmarks) ?? 0,
              );
    const maxConfidence = inferredConfidenceScores.length
        ? Math.max(...inferredConfidenceScores)
        : null;

    if (faceCount === 0) {
        return {
            status: 'no-face',
            signal: 'NO_FACE_DETECTED',
            faceCount,
            confidenceScore: maxConfidence,
            gazeDirection: null,
            eyeState: 'unknown',
            faceBounds: null,
            reasons: ['No visible face landmarks were detected in the current frame.'],
        };
    }

    if (faceCount > 1) {
        return {
            status: 'multiple-faces',
            signal:
                maxConfidence !== null && maxConfidence >= args.confidenceThreshold
                    ? 'MULTIPLE_FACES'
                    : null,
            faceCount,
            confidenceScore: maxConfidence,
            gazeDirection: null,
            eyeState: 'unknown',
            faceBounds: calculateMediaPipeFaceBounds(args.landmarksByFace[0] ?? []),
            reasons: ['More than one face was detected in the active camera frame.'],
        };
    }

    const primaryLandmarks = args.landmarksByFace[0] ?? [];
    const faceBounds = calculateMediaPipeFaceBounds(primaryLandmarks);

    if (maxConfidence !== null && maxConfidence < args.confidenceThreshold) {
        return {
            status: 'low-confidence',
            signal: null,
            faceCount,
            confidenceScore: maxConfidence,
            gazeDirection: null,
            eyeState: 'unknown',
            faceBounds,
            reasons: ['Face landmarks were detected, but the confidence score is below threshold.'],
        };
    }

    const gazeEstimate = estimateMediaPipeGazeDirection(primaryLandmarks);
    const gazeDirection = gazeEstimate.direction;
    const faceNearViewportEdge = Boolean(
        faceBounds &&
        (faceBounds.centerX < 0.16 ||
            faceBounds.centerX > 0.84 ||
            faceBounds.centerY < 0.12 ||
            faceBounds.centerY > 0.88),
    );
    const eyesClosed = gazeEstimate.eyeState === 'closed';
    const isOffScreen = eyesClosed || (gazeDirection !== null && gazeDirection !== 'center');

    if (isOffScreen || faceNearViewportEdge) {
        return {
            status: 'off-screen',
            signal: 'GAZE_OFF_SCREEN',
            faceCount,
            confidenceScore: maxConfidence,
            gazeDirection: gazeDirection ?? 'center',
            eyeState: gazeEstimate.eyeState,
            faceBounds,
            reasons: faceNearViewportEdge
                ? ['The face moved too close to the camera viewport edge.']
                : eyesClosed
                  ? ['Both eyes appear closed in the current frame.']
                  : ['Eye tracking indicates the student is looking away from center.'],
        };
    }

    return {
        status: 'ready',
        signal: null,
        faceCount,
        confidenceScore: maxConfidence,
        gazeDirection: gazeDirection ?? 'center',
        eyeState: gazeEstimate.eyeState,
        faceBounds,
        reasons: ['Single-face tracking is stable and aligned with the active thresholds.'],
    };
}

export function resolveMediaPipeThresholds(args: {
    sandbox: TelemetryMediaPipeSandboxSchemaValues;
    ruleOverrides?: Partial<
        Record<MediaPipeSupportedEventType, TelemetryRuleOverrideSchemaValues | undefined>
    >;
}): Record<MediaPipeSupportedEventType, MediaPipeThresholdResolution> {
    return {
        GAZE_OFF_SCREEN: {
            eventType: 'GAZE_OFF_SCREEN',
            confidenceThreshold:
                args.ruleOverrides?.GAZE_OFF_SCREEN?.confidenceThreshold ??
                args.sandbox.confidenceThreshold,
            durationThresholdMs:
                args.ruleOverrides?.GAZE_OFF_SCREEN?.durationThresholdMs ??
                args.sandbox.offScreenDurationMs,
            repeatThreshold: args.ruleOverrides?.GAZE_OFF_SCREEN?.repeatThreshold ?? null,
        },
        NO_FACE_DETECTED: {
            eventType: 'NO_FACE_DETECTED',
            confidenceThreshold:
                args.ruleOverrides?.NO_FACE_DETECTED?.confidenceThreshold ??
                args.sandbox.confidenceThreshold,
            durationThresholdMs:
                args.ruleOverrides?.NO_FACE_DETECTED?.durationThresholdMs ??
                MEDIAPIPE_DEFAULT_THRESHOLDS.noFaceDurationMs,
            repeatThreshold: args.ruleOverrides?.NO_FACE_DETECTED?.repeatThreshold ?? null,
        },
        MULTIPLE_FACES: {
            eventType: 'MULTIPLE_FACES',
            confidenceThreshold:
                args.ruleOverrides?.MULTIPLE_FACES?.confidenceThreshold ??
                args.sandbox.confidenceThreshold,
            durationThresholdMs: null,
            repeatThreshold: args.ruleOverrides?.MULTIPLE_FACES?.repeatThreshold ?? null,
        },
    };
}

export function createMediaPipeSignalTrackerState(): MediaPipeSignalTrackerState {
    return {
        activeSignal: null,
        activeSinceMs: null,
        lastEmittedAtMs: null,
        occurrenceCount: 0,
    };
}

export function evaluateMediaPipeSignalDispatch({
    currentSignal,
    tracker,
    nowMs,
    thresholds,
}: EvaluateMediaPipeSignalDispatchArgs): EvaluateMediaPipeSignalDispatchResult {
    if (!currentSignal) {
        return {
            tracker: createMediaPipeSignalTrackerState(),
            shouldEmit: false,
        };
    }

    const activeSinceMs =
        tracker.activeSignal === currentSignal && tracker.activeSinceMs !== null
            ? tracker.activeSinceMs
            : nowMs;
    const occurrenceCount =
        tracker.activeSignal === currentSignal ? tracker.occurrenceCount + 1 : 1;
    const durationMs = Math.max(0, nowMs - activeSinceMs);
    const threshold = thresholds[currentSignal];
    const durationThresholdMs = threshold.durationThresholdMs;

    if (durationThresholdMs !== null && durationMs < durationThresholdMs) {
        return {
            tracker: {
                activeSignal: currentSignal,
                activeSinceMs,
                lastEmittedAtMs: tracker.lastEmittedAtMs,
                occurrenceCount,
            },
            shouldEmit: false,
        };
    }

    if (
        tracker.lastEmittedAtMs !== null &&
        durationThresholdMs !== null &&
        nowMs - tracker.lastEmittedAtMs < durationThresholdMs
    ) {
        return {
            tracker: {
                activeSignal: currentSignal,
                activeSinceMs,
                lastEmittedAtMs: tracker.lastEmittedAtMs,
                occurrenceCount,
            },
            shouldEmit: false,
        };
    }

    return {
        tracker: {
            activeSignal: currentSignal,
            activeSinceMs,
            lastEmittedAtMs: nowMs,
            occurrenceCount,
        },
        shouldEmit: true,
        durationMs: durationThresholdMs === null ? undefined : durationMs,
        aggregation: {
            trigger: durationThresholdMs === null ? 'immediate' : 'duration-threshold',
            occurrenceCount,
            windowSeconds:
                durationThresholdMs === null ? undefined : Math.round(durationThresholdMs / 1000),
            threshold: durationThresholdMs ?? undefined,
        },
    };
}

export function buildMediaPipeTelemetryPayload(args: {
    examSessionId: string;
    studentId: string;
    eventType: MediaPipeSupportedEventType;
    timestamp?: string;
    metadata?: MediaPipeTelemetryMetadata;
    sessionContext?: MediaPipeTelemetrySessionContext;
    platform?: TelemetryPlatform;
}): MediaPipeTelemetryPayload {
    const eventDefinition = TELEMETRY_EVENT_DEFINITIONS[args.eventType];

    return {
        examSessionId: args.examSessionId,
        studentId: args.studentId,
        timestamp: args.timestamp ?? new Date().toISOString(),
        eventType: args.eventType,
        platform: args.platform ?? 'WEB',
        source: eventDefinition.source,
        ruleKey: eventDefinition.ruleKey,
        metadata: args.metadata,
        sessionContext: args.sessionContext,
    };
}

export function createMediaPipePreviewPayload(args: {
    eventType: MediaPipeSupportedEventType;
    metadata?: MediaPipeTelemetryMetadata;
    sessionContext?: MediaPipeTelemetrySessionContext;
}) {
    return buildMediaPipeTelemetryPayload({
        examSessionId: '00000000-0000-4000-8000-000000000001',
        studentId: '00000000-0000-4000-8000-000000000002',
        eventType: args.eventType,
        metadata: args.metadata,
        sessionContext: args.sessionContext,
    });
}

export function isMediaPipeRuntimeEnabled(args: {
    sandbox: TelemetryMediaPipeSandboxSchemaValues | null | undefined;
    configuration: ExamConfiguration | null | undefined;
    stage: MediaPipeRolloutStage;
    hasCameraStream?: boolean;
    runtimeAccessAllowed?: boolean;
}) {
    const sandbox = args.sandbox;
    const configuration = args.configuration;

    if (!sandbox?.enabled || !configuration) {
        return false;
    }

    if (
        !configuration.aiRules.gaze_tracking &&
        !configuration.aiRules.face_detection &&
        !configuration.aiRules.multiple_faces_detection
    ) {
        return false;
    }

    if (args.stage === 'checkup' && !sandbox.captureDuringCheckup) {
        return false;
    }

    if (args.stage === 'attempt' && !sandbox.emitDuringExam) {
        return false;
    }

    if (args.stage === 'attempt' && args.runtimeAccessAllowed === false) {
        return false;
    }

    if (args.hasCameraStream === false) {
        return false;
    }

    return true;
}

export function getMediaPipeClientCapabilities() {
    return [...MEDIAPIPE_CLIENT_CAPABILITIES];
}

export function normalizeMediaPipeConfidenceScore(score?: number | null) {
    if (score === null || score === undefined || Number.isNaN(score)) {
        return null;
    }

    return clamp(score, 0, 1);
}
