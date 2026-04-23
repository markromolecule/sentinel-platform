import { calculateMediaPipeFaceBounds, estimateMediaPipeConfidenceScore } from './landmarks';
import {
    calculateMediaPipeGazeOffsetSample,
    estimateMediaPipeEyeState,
    estimateMediaPipeGazeDirectionFromSample,
} from './calibration';
import type {
    AnalyzeMediaPipeFrameArgs,
    MediaPipeCalibrationProfile,
    MediaPipeEyeState,
    MediaPipeFrameAnalysis,
    MediaPipeGazeDirection,
    MediaPipeLandmark,
} from './types';

function createMediaPipeFrameAnalysis(analysis: MediaPipeFrameAnalysis): MediaPipeFrameAnalysis {
    return analysis;
}

function buildSingleFaceAnalysis(args: {
    landmarks: MediaPipeLandmark[];
    confidenceScore: number | null;
    confidenceThreshold: number;
    tolerateDownwardGaze?: boolean;
    calibrationProfile?: MediaPipeCalibrationProfile | null;
}): MediaPipeFrameAnalysis {
    const faceBounds = calculateMediaPipeFaceBounds(args.landmarks);
    const gazeEstimate = estimateMediaPipeGazeDirection(args.landmarks, args.calibrationProfile);
    const treatGazeAsCentered =
        args.tolerateDownwardGaze &&
        gazeEstimate.eyeState === 'open' &&
        gazeEstimate.direction === 'down';
    const faceNearViewportEdge = Boolean(
        faceBounds &&
        (faceBounds.centerX < 0.16 ||
            faceBounds.centerX > 0.84 ||
            faceBounds.centerY < 0.12 ||
            faceBounds.centerY > 0.88),
    );
    const partialFaceVisible = Boolean(
        faceBounds &&
        (faceBounds.minX < 0.1 ||
            faceBounds.maxX > 0.9 ||
            faceBounds.minY < 0.08 ||
            faceBounds.maxY > 0.92),
    );
    const eyesClosed = gazeEstimate.eyeState === 'closed';
    const isOffScreen =
        eyesClosed ||
        (gazeEstimate.direction !== null &&
            gazeEstimate.direction !== 'center' &&
            !treatGazeAsCentered);
    const shouldPromoteLowConfidenceLookingAway =
        args.confidenceScore !== null &&
        args.confidenceScore < args.confidenceThreshold &&
        partialFaceVisible &&
        (isOffScreen || faceNearViewportEdge);

    if (shouldPromoteLowConfidenceLookingAway) {
        return createMediaPipeFrameAnalysis({
            status: 'off-screen',
            signal: 'GAZE_OFF_SCREEN',
            faceCount: 1,
            confidenceScore: args.confidenceScore,
            gazeDirection: gazeEstimate.direction ?? 'center',
            eyeState: gazeEstimate.eyeState,
            faceBounds,
            reasons: [
                'Partial-face visibility and gaze estimates indicate the student is looking away from center.',
            ],
        });
    }

    if (args.confidenceScore !== null && args.confidenceScore < args.confidenceThreshold) {
        return createMediaPipeFrameAnalysis({
            status: 'low-confidence',
            signal: null,
            faceCount: 1,
            confidenceScore: args.confidenceScore,
            gazeDirection: null,
            eyeState: 'unknown',
            faceBounds,
            reasons: ['Face landmarks were detected, but the confidence score is below threshold.'],
        });
    }

    if (isOffScreen || faceNearViewportEdge) {
        return createMediaPipeFrameAnalysis({
            status: 'off-screen',
            signal: 'GAZE_OFF_SCREEN',
            faceCount: 1,
            confidenceScore: args.confidenceScore,
            gazeDirection: gazeEstimate.direction ?? 'center',
            eyeState: gazeEstimate.eyeState,
            faceBounds,
            reasons: faceNearViewportEdge
                ? ['The face moved too close to the camera viewport edge.']
                : eyesClosed
                  ? ['Both eyes appear closed in the current frame.']
                  : ['Eye tracking indicates the student is looking away from center.'],
        });
    }

    return createMediaPipeFrameAnalysis({
        status: 'ready',
        signal: null,
        faceCount: 1,
        confidenceScore: args.confidenceScore,
        gazeDirection: gazeEstimate.direction ?? 'center',
        eyeState: gazeEstimate.eyeState,
        faceBounds,
        reasons: ['Single-face tracking is stable and aligned with the active thresholds.'],
    });
}

export function estimateMediaPipeGazeDirection(
    landmarks: MediaPipeLandmark[],
    calibrationProfile?: MediaPipeCalibrationProfile | null,
): {
    direction: MediaPipeGazeDirection | null;
    eyeState: MediaPipeEyeState;
} {
    const eyeState = estimateMediaPipeEyeState(landmarks);
    const sample = calculateMediaPipeGazeOffsetSample(landmarks);

    return {
        direction: estimateMediaPipeGazeDirectionFromSample({
            sample,
            eyeState,
            calibrationProfile,
        }),
        eyeState,
    };
}

export function analyzeMediaPipeFrame(args: AnalyzeMediaPipeFrameArgs): MediaPipeFrameAnalysis {
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
        return createMediaPipeFrameAnalysis({
            status: 'no-face',
            signal: 'NO_FACE_DETECTED',
            faceCount,
            confidenceScore: maxConfidence,
            gazeDirection: null,
            eyeState: 'unknown',
            faceBounds: null,
            reasons: ['No visible face landmarks were detected in the current frame.'],
        });
    }

    if (faceCount > 1) {
        return createMediaPipeFrameAnalysis({
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
        });
    }

    return buildSingleFaceAnalysis({
        landmarks: args.landmarksByFace[0] ?? [],
        confidenceScore: maxConfidence,
        confidenceThreshold: args.confidenceThreshold,
        tolerateDownwardGaze: args.tolerateDownwardGaze,
        calibrationProfile: args.calibrationProfile,
    });
}
