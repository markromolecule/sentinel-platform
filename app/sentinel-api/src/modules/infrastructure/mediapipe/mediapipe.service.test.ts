import { describe, expect, it } from 'vitest';
import {
    buildMediaPipeCalibrationProfile,
    createMediaPipeCalibrationSample,
    DEFAULT_TELEMETRY_SETTINGS,
} from '@sentinel/shared';
import { MediaPipeService } from './mediapipe.service';

const BASE_SETTINGS = DEFAULT_TELEMETRY_SETTINGS.mediaPipeSandbox;

function buildCenteredFace() {
    const landmarks = Array.from({ length: 478 }, () => ({ x: 0.5, y: 0.5, z: 0 }));

    landmarks[1] = { x: 0.5, y: 0.48, z: 0 };
    landmarks[33] = { x: 0.4, y: 0.46, z: 0 };
    landmarks[133] = { x: 0.46, y: 0.46, z: 0 };
    landmarks[263] = { x: 0.6, y: 0.46, z: 0 };
    landmarks[362] = { x: 0.54, y: 0.46, z: 0 };
    landmarks[160] = { x: 0.41, y: 0.452, z: 0 };
    landmarks[159] = { x: 0.43, y: 0.451, z: 0 };
    landmarks[158] = { x: 0.45, y: 0.452, z: 0 };
    landmarks[144] = { x: 0.41, y: 0.468, z: 0 };
    landmarks[145] = { x: 0.43, y: 0.469, z: 0 };
    landmarks[153] = { x: 0.45, y: 0.468, z: 0 };
    landmarks[387] = { x: 0.55, y: 0.452, z: 0 };
    landmarks[386] = { x: 0.57, y: 0.451, z: 0 };
    landmarks[385] = { x: 0.59, y: 0.452, z: 0 };
    landmarks[373] = { x: 0.55, y: 0.468, z: 0 };
    landmarks[374] = { x: 0.57, y: 0.469, z: 0 };
    landmarks[380] = { x: 0.59, y: 0.468, z: 0 };
    landmarks[168] = { x: 0.5, y: 0.35, z: 0 };
    landmarks[152] = { x: 0.5, y: 0.7, z: 0 };
    [468, 469, 470, 471, 472].forEach((index) => {
        landmarks[index] = { x: 0.43, y: 0.46, z: 0 };
    });
    [473, 474, 475, 476, 477].forEach((index) => {
        landmarks[index] = { x: 0.57, y: 0.46, z: 0 };
    });

    return landmarks;
}

function buildOffscreenFace() {
    const landmarks = buildCenteredFace();
    [468, 469, 470, 471, 472].forEach((index) => {
        landmarks[index] = { x: 0.41, y: 0.46, z: 0 };
    });
    [473, 474, 475, 476, 477].forEach((index) => {
        landmarks[index] = { x: 0.55, y: 0.46, z: 0 };
    });
    return landmarks;
}

function buildRightGazeFace() {
    const landmarks = buildCenteredFace();
    [468, 469, 470, 471, 472].forEach((index) => {
        landmarks[index] = { x: 0.45, y: 0.46, z: 0 };
    });
    [473, 474, 475, 476, 477].forEach((index) => {
        landmarks[index] = { x: 0.59, y: 0.46, z: 0 };
    });
    return landmarks;
}

function buildUpGazeFace() {
    const landmarks = buildCenteredFace();
    [468, 469, 470, 471, 472].forEach((index) => {
        landmarks[index] = { x: landmarks[index].x, y: 0.454, z: 0 };
    });
    [473, 474, 475, 476, 477].forEach((index) => {
        landmarks[index] = { x: landmarks[index].x, y: 0.454, z: 0 };
    });
    return landmarks;
}

function buildDownGazeFace() {
    const landmarks = buildCenteredFace();
    [468, 469, 470, 471, 472].forEach((index) => {
        landmarks[index] = { x: landmarks[index].x, y: 0.466, z: 0 };
    });
    [473, 474, 475, 476, 477].forEach((index) => {
        landmarks[index] = { x: landmarks[index].x, y: 0.466, z: 0 };
    });
    return landmarks;
}

function buildPartialFaceLookingAwayFace() {
    const landmarks = buildOffscreenFace();

    return landmarks.map((landmark) => ({
        x: landmark.x - 0.38,
        y: landmark.y,
        z: landmark.z,
    }));
}

function buildClosedEyeFace() {
    const landmarks = buildCenteredFace();
    landmarks[160] = { x: 0.41, y: 0.459, z: 0 };
    landmarks[159] = { x: 0.43, y: 0.459, z: 0 };
    landmarks[158] = { x: 0.45, y: 0.459, z: 0 };
    landmarks[144] = { x: 0.41, y: 0.462, z: 0 };
    landmarks[145] = { x: 0.43, y: 0.462, z: 0 };
    landmarks[153] = { x: 0.45, y: 0.462, z: 0 };
    landmarks[387] = { x: 0.55, y: 0.459, z: 0 };
    landmarks[386] = { x: 0.57, y: 0.459, z: 0 };
    landmarks[385] = { x: 0.59, y: 0.459, z: 0 };
    landmarks[373] = { x: 0.55, y: 0.462, z: 0 };
    landmarks[374] = { x: 0.57, y: 0.462, z: 0 };
    landmarks[380] = { x: 0.59, y: 0.462, z: 0 };
    return landmarks;
}

function buildNarrowEyeFace() {
    const landmarks = buildCenteredFace();
    landmarks[160] = { x: 0.41, y: 0.456, z: 0 };
    landmarks[159] = { x: 0.43, y: 0.456, z: 0 };
    landmarks[158] = { x: 0.45, y: 0.456, z: 0 };
    landmarks[144] = { x: 0.41, y: 0.465, z: 0 };
    landmarks[145] = { x: 0.43, y: 0.465, z: 0 };
    landmarks[153] = { x: 0.45, y: 0.465, z: 0 };
    landmarks[387] = { x: 0.55, y: 0.456, z: 0 };
    landmarks[386] = { x: 0.57, y: 0.456, z: 0 };
    landmarks[385] = { x: 0.59, y: 0.456, z: 0 };
    landmarks[373] = { x: 0.55, y: 0.465, z: 0 };
    landmarks[374] = { x: 0.57, y: 0.465, z: 0 };
    landmarks[380] = { x: 0.59, y: 0.465, z: 0 };
    return landmarks;
}

function buildNarrowEyeOffsetFace() {
    const landmarks = buildNarrowEyeFace();
    [468, 469, 470, 471, 472].forEach((index) => {
        landmarks[index] = { x: landmarks[index].x, y: 0.462, z: 0 };
    });
    [473, 474, 475, 476, 477].forEach((index) => {
        landmarks[index] = { x: landmarks[index].x, y: 0.462, z: 0 };
    });
    return landmarks;
}

function buildFurtherLeftGazeFace() {
    const landmarks = buildOffscreenFace();
    [468, 469, 470, 471, 472].forEach((index) => {
        landmarks[index] = { x: 0.4, y: 0.46, z: 0 };
    });
    [473, 474, 475, 476, 477].forEach((index) => {
        landmarks[index] = { x: 0.54, y: 0.46, z: 0 };
    });
    return landmarks;
}

describe('MediaPipeService', () => {
    it('classifies a single low-confidence face without emitting a signal', () => {
        const analysis = MediaPipeService.classifyObservation({
            landmarksByFace: [buildCenteredFace()],
            confidenceScores: [0.4],
            confidenceThreshold: 0.8,
        });

        expect(analysis.status).toBe('low-confidence');
        expect(analysis.signal).toBeNull();
    });

    it('classifies missing-face, multiple-face, and gaze-off-screen states', () => {
        const noFace = MediaPipeService.classifyObservation({
            landmarksByFace: [],
            confidenceThreshold: 0.8,
        });

        const multipleFaces = MediaPipeService.classifyObservation({
            landmarksByFace: [buildCenteredFace(), buildCenteredFace()],
            confidenceScores: [0.95, 0.94],
            confidenceThreshold: 0.8,
        });

        const offscreen = MediaPipeService.classifyObservation({
            landmarksByFace: [buildOffscreenFace()],
            confidenceScores: [0.92],
            confidenceThreshold: 0.8,
        });

        expect(noFace.signal).toBe('NO_FACE_DETECTED');
        expect(multipleFaces.signal).toBe('MULTIPLE_FACES');
        expect(offscreen.signal).toBe('GAZE_OFF_SCREEN');
        expect(offscreen.gazeDirection).toBe('left');
        expect(offscreen.eyeState).toBe('open');
    });

    it('detects sustained closed eyes as an off-screen calibration issue', () => {
        const analysis = MediaPipeService.classifyObservation({
            landmarksByFace: [buildClosedEyeFace()],
            confidenceScores: [0.92],
            confidenceThreshold: 0.8,
        });

        expect(analysis.status).toBe('off-screen');
        expect(analysis.signal).toBe('GAZE_OFF_SCREEN');
        expect(analysis.eyeState).toBe('closed');
        expect(analysis.reasons[0]).toMatch(/closed/i);
    });

    it('promotes a low-confidence partial face near the viewport edge into looking-away detection', () => {
        const analysis = MediaPipeService.classifyObservation({
            landmarksByFace: [buildPartialFaceLookingAwayFace()],
            confidenceScores: [0.41],
            confidenceThreshold: 0.8,
        });

        expect(analysis.status).toBe('off-screen');
        expect(analysis.signal).toBe('GAZE_OFF_SCREEN');
        expect(analysis.gazeDirection).toBe('left');
        expect(analysis.reasons[0]).toMatch(/partial-face/i);
    });

    it('does not treat naturally narrow open eyes as closed', () => {
        const analysis = MediaPipeService.classifyObservation({
            landmarksByFace: [buildNarrowEyeFace()],
            confidenceScores: [0.92],
            confidenceThreshold: 0.8,
        });

        expect(analysis.status).toBe('ready');
        expect(analysis.signal).toBeNull();
        expect(analysis.eyeState).toBe('unknown');
    });

    it('falls back to head pose when narrow eyes make iris gaze unreliable', () => {
        const analysis = MediaPipeService.classifyObservation({
            landmarksByFace: [buildNarrowEyeOffsetFace()],
            confidenceScores: [0.92],
            confidenceThreshold: 0.8,
        });

        expect(analysis.status).toBe('ready');
        expect(analysis.signal).toBeNull();
        expect(analysis.eyeState).toBe('unknown');
        expect(analysis.gazeDirection).toBe('center');
    });

    it('uses a calibration profile to evaluate gaze relative to the student baseline', () => {
        const neutralSample = createMediaPipeCalibrationSample({
            landmarks: buildOffscreenFace(),
            confidenceScore: 0.92,
        });
        const calibrationProfile = buildMediaPipeCalibrationProfile({
            samples: neutralSample ? [neutralSample] : [],
            createdAt: '2026-04-23T00:00:00.000Z',
        });

        const neutralAnalysis = MediaPipeService.classifyObservation({
            landmarksByFace: [buildOffscreenFace()],
            confidenceScores: [0.92],
            confidenceThreshold: 0.8,
            calibrationProfile,
        });
        const lookingLeftAnalysis = MediaPipeService.classifyObservation({
            landmarksByFace: [buildFurtherLeftGazeFace()],
            confidenceScores: [0.92],
            confidenceThreshold: 0.8,
            calibrationProfile,
        });

        expect(calibrationProfile).not.toBeNull();
        expect(neutralAnalysis.status).toBe('ready');
        expect(neutralAnalysis.gazeDirection).toBe('center');
        expect(lookingLeftAnalysis.status).toBe('off-screen');
        expect(lookingLeftAnalysis.gazeDirection).toBe('left');
    });

    it('classifies calibrated gaze directions for right, up, and down', () => {
        const neutralSample = createMediaPipeCalibrationSample({
            landmarks: buildCenteredFace(),
            confidenceScore: 0.92,
        });
        const calibrationProfile = buildMediaPipeCalibrationProfile({
            samples: neutralSample ? [neutralSample] : [],
            createdAt: '2026-04-23T00:00:00.000Z',
        });

        const right = MediaPipeService.classifyObservation({
            landmarksByFace: [buildRightGazeFace()],
            confidenceScores: [0.92],
            confidenceThreshold: 0.8,
            calibrationProfile,
        });
        const up = MediaPipeService.classifyObservation({
            landmarksByFace: [buildUpGazeFace()],
            confidenceScores: [0.92],
            confidenceThreshold: 0.8,
            calibrationProfile,
        });
        const down = MediaPipeService.classifyObservation({
            landmarksByFace: [buildDownGazeFace()],
            confidenceScores: [0.92],
            confidenceThreshold: 0.8,
            calibrationProfile,
        });

        expect(right).toMatchObject({ status: 'off-screen', gazeDirection: 'right' });
        expect(up).toMatchObject({ status: 'off-screen', gazeDirection: 'up' });
        expect(down).toMatchObject({ status: 'off-screen', gazeDirection: 'down' });
    });

    it('resolves thresholds from the sandbox contract and runtime overrides', () => {
        const thresholds = MediaPipeService.resolveThresholds({
            sandbox: {
                ...BASE_SETTINGS,
                confidenceThreshold: 0.74,
                offScreenDurationMs: 4200,
            },
            ruleOverrides: {
                GAZE_OFF_SCREEN: {
                    durationThresholdMs: 6100,
                },
            },
        });

        expect(thresholds.GAZE_OFF_SCREEN.confidenceThreshold).toBe(0.74);
        expect(thresholds.GAZE_OFF_SCREEN.durationThresholdMs).toBe(6100);
        expect(thresholds.NO_FACE_DETECTED.durationThresholdMs).toBe(5000);
    });

    it('debounces duration-driven signals until the threshold is met', () => {
        const thresholds = MediaPipeService.resolveThresholds({
            sandbox: BASE_SETTINGS,
        });

        const firstPass = MediaPipeService.evaluateDispatch({
            currentSignal: 'GAZE_OFF_SCREEN',
            nowMs: 1000,
            thresholds,
        });

        const secondPass = MediaPipeService.evaluateDispatch({
            currentSignal: 'GAZE_OFF_SCREEN',
            tracker: firstPass.tracker,
            nowMs: 2500,
            thresholds,
        });

        const thirdPass = MediaPipeService.evaluateDispatch({
            currentSignal: 'GAZE_OFF_SCREEN',
            tracker: secondPass.tracker,
            nowMs: 4500,
            thresholds,
        });

        expect(firstPass.shouldEmit).toBe(false);
        expect(secondPass.shouldEmit).toBe(false);
        expect(thirdPass.shouldEmit).toBe(true);
        expect(thirdPass.aggregation?.trigger).toBe('duration-threshold');
        expect(thirdPass.durationMs).toBe(3500);
    });

    it('suppresses unsupported dispatches when there is no active MediaPipe signal', () => {
        const thresholds = MediaPipeService.resolveThresholds({
            sandbox: BASE_SETTINGS,
        });

        const dispatch = MediaPipeService.evaluateDispatch({
            currentSignal: null,
            nowMs: 1000,
            thresholds,
        });

        expect(dispatch.shouldEmit).toBe(false);
        expect(dispatch.tracker.activeSignal).toBeNull();
    });

    it('emits immediate multiple-face signals once per active run and allows them again after reset', () => {
        const thresholds = MediaPipeService.resolveThresholds({
            sandbox: BASE_SETTINGS,
        });

        const firstPass = MediaPipeService.evaluateDispatch({
            currentSignal: 'MULTIPLE_FACES',
            nowMs: 1000,
            thresholds,
        });

        const secondPass = MediaPipeService.evaluateDispatch({
            currentSignal: 'MULTIPLE_FACES',
            tracker: firstPass.tracker,
            nowMs: 1500,
            thresholds,
        });

        const resetPass = MediaPipeService.evaluateDispatch({
            currentSignal: null,
            tracker: secondPass.tracker,
            nowMs: 2000,
            thresholds,
        });

        const thirdPass = MediaPipeService.evaluateDispatch({
            currentSignal: 'MULTIPLE_FACES',
            tracker: resetPass.tracker,
            nowMs: 2500,
            thresholds,
        });

        expect(firstPass.shouldEmit).toBe(true);
        expect(firstPass.aggregation?.trigger).toBe('immediate');
        expect(secondPass.shouldEmit).toBe(false);
        expect(resetPass.tracker.activeSignal).toBeNull();
        expect(thirdPass.shouldEmit).toBe(true);
        expect(thirdPass.aggregation?.trigger).toBe('immediate');
    });

    it('supports repeat-threshold dispatches for repeat-sensitive signals', () => {
        const thresholds = MediaPipeService.resolveThresholds({
            sandbox: BASE_SETTINGS,
            ruleOverrides: {
                MULTIPLE_FACES: {
                    repeatThreshold: 3,
                },
            },
        });

        const firstPass = MediaPipeService.evaluateDispatch({
            currentSignal: 'MULTIPLE_FACES',
            nowMs: 1000,
            thresholds,
        });

        const secondPass = MediaPipeService.evaluateDispatch({
            currentSignal: 'MULTIPLE_FACES',
            tracker: firstPass.tracker,
            nowMs: 1500,
            thresholds,
        });

        const thirdPass = MediaPipeService.evaluateDispatch({
            currentSignal: 'MULTIPLE_FACES',
            tracker: secondPass.tracker,
            nowMs: 2000,
            thresholds,
        });

        const fourthPass = MediaPipeService.evaluateDispatch({
            currentSignal: 'MULTIPLE_FACES',
            tracker: thirdPass.tracker,
            nowMs: 2500,
            thresholds,
        });

        expect(firstPass.shouldEmit).toBe(false);
        expect(secondPass.shouldEmit).toBe(false);
        expect(thirdPass.shouldEmit).toBe(true);
        expect(thirdPass.aggregation).toEqual({
            trigger: 'repeat-threshold',
            occurrenceCount: 3,
            threshold: 3,
        });
        expect(fourthPass.shouldEmit).toBe(false);
    });

    it('maps MediaPipe signals into the shared telemetry contract for preview and runtime use', () => {
        const payload = MediaPipeService.mapEvent({
            examSessionId: '123e4567-e89b-12d3-a456-426614174000',
            studentId: '123e4567-e89b-12d3-a456-426614174001',
            eventType: 'NO_FACE_DETECTED',
            timestamp: '2026-04-22T00:00:00.000Z',
            metadata: {
                durationMs: 5300,
                confidenceScore: 0.91,
            },
            sessionContext: {
                browser: 'Chrome',
                os: 'macOS',
                deviceType: 'DESKTOP',
                clientCapabilities: ['camera-stream', 'mediapipe-face-landmarker'],
            },
        });

        const preview = MediaPipeService.shapePreviewPayload({
            eventType: 'MULTIPLE_FACES',
        });

        expect(payload).toMatchObject({
            eventType: 'NO_FACE_DETECTED',
            platform: 'WEB',
            source: 'AI',
            ruleKey: 'aiRules.face_detection',
            metadata: {
                durationMs: 5300,
                confidenceScore: 0.91,
            },
        });

        expect(preview.examSessionId).toBe('00000000-0000-4000-8000-000000000001');
        expect(preview.studentId).toBe('00000000-0000-4000-8000-000000000002');
        expect(preview.eventType).toBe('MULTIPLE_FACES');
    });
});
