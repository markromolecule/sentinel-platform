import { describe, expect, it } from 'vitest';
import { buildMediaPipeCalibrationProfile, createMediaPipeCalibrationSample } from './calibration';
import {
    analyzeMediaPipeFrame,
    estimateMediaPipeGazeDirection,
    isMediaPipeFaceNearViewportEdge,
    isMediaPipePartialFaceVisible,
} from './analysis';
import {
    buildCenteredMediaPipeLandmarks,
    buildClosedEyesMediaPipeLandmarks,
    buildDownwardLookingMediaPipeLandmarks,
    buildLeftLookingMediaPipeLandmarks,
    buildLowConfidenceMediaPipeLandmarks,
    buildPartialFaceLookingAwayMediaPipeLandmarks,
    buildRightLookingMediaPipeLandmarks,
    buildUpwardLookingMediaPipeLandmarks,
    buildViewportEdgeMediaPipeLandmarks,
} from './tests/fixtures/landmarks';

describe('analyzeMediaPipeFrame', () => {
    it('classifies a centered face as ready', () => {
        const analysis = analyzeMediaPipeFrame({
            landmarksByFace: [buildCenteredMediaPipeLandmarks()],
            confidenceThreshold: 0.6,
        });

        expect(analysis).toMatchObject({
            status: 'ready',
            signal: null,
            gazeDirection: 'center',
            eyeState: 'open',
        });
    });

    it.each([
        ['left', buildLeftLookingMediaPipeLandmarks()],
        ['right', buildRightLookingMediaPipeLandmarks()],
        ['up', buildUpwardLookingMediaPipeLandmarks()],
    ] as const)('classifies %s gaze as off-screen', (direction, landmarks) => {
        const analysis = analyzeMediaPipeFrame({
            landmarksByFace: [landmarks],
            confidenceThreshold: 0.6,
        });

        expect(analysis).toMatchObject({
            status: 'off-screen',
            signal: 'GAZE_OFF_SCREEN',
            gazeDirection: direction,
        });
    });

    it('tolerates downward gaze when the policy is enabled', () => {
        const analysis = analyzeMediaPipeFrame({
            landmarksByFace: [buildDownwardLookingMediaPipeLandmarks()],
            confidenceThreshold: 0.6,
            tolerateDownwardGaze: true,
        });

        expect(analysis).toMatchObject({
            status: 'ready',
            signal: null,
            gazeDirection: 'down',
        });
    });

    it('treats downward gaze as off-screen when the policy is disabled', () => {
        const analysis = analyzeMediaPipeFrame({
            landmarksByFace: [buildDownwardLookingMediaPipeLandmarks()],
            confidenceThreshold: 0.6,
            tolerateDownwardGaze: false,
        });

        expect(analysis).toMatchObject({
            status: 'off-screen',
            signal: 'GAZE_OFF_SCREEN',
            gazeDirection: 'down',
        });
    });

    it('treats closed eyes as off-screen', () => {
        const analysis = analyzeMediaPipeFrame({
            landmarksByFace: [buildClosedEyesMediaPipeLandmarks()],
            confidenceThreshold: 0.6,
        });

        expect(analysis).toMatchObject({
            status: 'off-screen',
            signal: 'GAZE_OFF_SCREEN',
            eyeState: 'closed',
        });
    });

    it('promotes a partial low-confidence face looking away to an off-screen signal', () => {
        const analysis = analyzeMediaPipeFrame({
            landmarksByFace: [buildPartialFaceLookingAwayMediaPipeLandmarks()],
            confidenceThreshold: 0.6,
        });

        expect(analysis).toMatchObject({
            status: 'off-screen',
            signal: 'GAZE_OFF_SCREEN',
            gazeDirection: 'left',
        });
    });

    it('keeps a low-confidence centered face as low-confidence', () => {
        const analysis = analyzeMediaPipeFrame({
            landmarksByFace: [buildLowConfidenceMediaPipeLandmarks()],
            confidenceThreshold: 0.6,
        });

        expect(analysis).toMatchObject({
            status: 'low-confidence',
            signal: null,
        });
    });

    it('treats a face near the viewport edge as off-screen', () => {
        const analysis = analyzeMediaPipeFrame({
            landmarksByFace: [buildViewportEdgeMediaPipeLandmarks()],
            confidenceThreshold: 0.6,
        });

        expect(analysis).toMatchObject({
            status: 'off-screen',
            signal: 'GAZE_OFF_SCREEN',
        });
    });

    it('uses the calibration profile to keep the calibrated gaze centered', () => {
        const sample = createMediaPipeCalibrationSample({
            landmarks: buildLeftLookingMediaPipeLandmarks(),
            confidenceScore: 0.92,
        });
        const profile = buildMediaPipeCalibrationProfile({
            samples: sample ? [sample] : [],
            createdAt: '2026-07-11T00:00:00.000Z',
        });

        const analysis = analyzeMediaPipeFrame({
            landmarksByFace: [buildLeftLookingMediaPipeLandmarks()],
            confidenceThreshold: 0.6,
            calibrationProfile: profile,
        });

        expect(analysis).toMatchObject({
            status: 'ready',
            signal: null,
            gazeDirection: 'center',
        });
    });
});

describe('analysis helpers', () => {
    it('detects viewport-edge and partial-face bounds consistently', () => {
        const viewportEdgeAnalysis = analyzeMediaPipeFrame({
            landmarksByFace: [buildViewportEdgeMediaPipeLandmarks()],
            confidenceThreshold: 0.6,
        });
        const partialFaceAnalysis = analyzeMediaPipeFrame({
            landmarksByFace: [buildPartialFaceLookingAwayMediaPipeLandmarks()],
            confidenceThreshold: 0.6,
        });

        expect(isMediaPipeFaceNearViewportEdge(viewportEdgeAnalysis.faceBounds)).toBe(true);
        expect(isMediaPipePartialFaceVisible(viewportEdgeAnalysis.faceBounds)).toBe(true);
        expect(isMediaPipePartialFaceVisible(partialFaceAnalysis.faceBounds)).toBe(true);
    });

    it('exposes the gaze estimate from fixtures', () => {
        expect(
            estimateMediaPipeGazeDirection(buildRightLookingMediaPipeLandmarks()).direction,
        ).toBe('right');
        expect(
            estimateMediaPipeGazeDirection(buildUpwardLookingMediaPipeLandmarks()).direction,
        ).toBe('up');
    });

    it('relaxes viewport-edge and partial-face bounds under close mobile framing (face area > 0.35)', () => {
        // Face area is width * height = 0.8 * 0.9 = 0.72 (close framing)
        const closeFaceBounds = {
            minX: 0.02,
            maxX: 0.98,
            minY: 0.02,
            maxY: 0.98,
            width: 0.8,
            height: 0.9,
            centerX: 0.5,
            centerY: 0.5,
        };

        // For close framing, minX=0.02 and maxX=0.98 are within the relaxed edgeLimitX of 0.01.
        // centerX = 0.08 is within the relaxed centerLimitX of 0.05.
        expect(isMediaPipePartialFaceVisible(closeFaceBounds)).toBe(false);
        expect(isMediaPipeFaceNearViewportEdge(closeFaceBounds)).toBe(false);

        // However, if it moves past the relaxed bounds (e.g. minX = 0.005), it is still flagged.
        const offscreenCloseFaceBounds = { ...closeFaceBounds, minX: 0.005 };
        expect(isMediaPipePartialFaceVisible(offscreenCloseFaceBounds)).toBe(true);
    });
});
