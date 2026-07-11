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
});
