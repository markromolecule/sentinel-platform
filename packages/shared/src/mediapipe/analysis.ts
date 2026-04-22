import {
    MEDIAPIPE_EYE_CLOSED_RATIO_THRESHOLD,
    MEDIAPIPE_EYE_NARROW_RATIO_THRESHOLD,
    MEDIAPIPE_IRIS_LANDMARK_GROUPS,
    MEDIAPIPE_LANDMARK_INDEX,
} from './constants';
import {
    averageLandmark,
    calculateLandmarkDistance,
    calculateMediaPipeFaceBounds,
    estimateMediaPipeConfidenceScore,
    readLandmark,
} from './landmarks';
import type {
    AnalyzeMediaPipeFrameArgs,
    MediaPipeEyeState,
    MediaPipeFrameAnalysis,
    MediaPipeGazeDirection,
    MediaPipeLandmark,
} from './types';

type MediaPipeEyeSample = {
    cornerA: MediaPipeLandmark | null;
    cornerB: MediaPipeLandmark | null;
    upperPoints: Array<MediaPipeLandmark | null>;
    lowerPoints: Array<MediaPipeLandmark | null>;
};

type MediaPipeGazeWindow = {
    minX: number;
    maxX: number;
    upperCenter: MediaPipeLandmark;
    lowerCenter: MediaPipeLandmark;
    centerX: number;
};

function createMediaPipeFrameAnalysis(
    analysis: MediaPipeFrameAnalysis,
): MediaPipeFrameAnalysis {
    return analysis;
}

function getEyeSamples(landmarks: MediaPipeLandmark[]): MediaPipeEyeSample[] {
    return [
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
    ];
}

function calculateEyeAspectRatio(eye: MediaPipeEyeSample) {
    if (
        !eye.cornerA ||
        !eye.cornerB ||
        eye.upperPoints.some((point) => point === null) ||
        eye.lowerPoints.some((point) => point === null)
    ) {
        return null;
    }

    const horizontalDistance = Math.max(calculateLandmarkDistance(eye.cornerA, eye.cornerB), 0.001);
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
}

function buildGazeWindows(landmarks: MediaPipeLandmark[]): MediaPipeGazeWindow[] {
    return getEyeSamples(landmarks)
        .map((eye, index) => {
            if (!eye.cornerA || !eye.cornerB) {
                return null;
            }

            const minX = Math.min(eye.cornerA.x, eye.cornerB.x);
            const maxX = Math.max(eye.cornerA.x, eye.cornerB.x);
            const upperCenter = averageLandmark(
                landmarks,
                index === 0
                    ? [
                          MEDIAPIPE_LANDMARK_INDEX.eyeAUpperOuter,
                          MEDIAPIPE_LANDMARK_INDEX.eyeAUpperCenter,
                          MEDIAPIPE_LANDMARK_INDEX.eyeAUpperInner,
                      ]
                    : [
                          MEDIAPIPE_LANDMARK_INDEX.eyeBUpperInner,
                          MEDIAPIPE_LANDMARK_INDEX.eyeBUpperCenter,
                          MEDIAPIPE_LANDMARK_INDEX.eyeBUpperOuter,
                      ],
            );
            const lowerCenter = averageLandmark(
                landmarks,
                index === 0
                    ? [
                          MEDIAPIPE_LANDMARK_INDEX.eyeALowerOuter,
                          MEDIAPIPE_LANDMARK_INDEX.eyeALowerCenter,
                          MEDIAPIPE_LANDMARK_INDEX.eyeALowerInner,
                      ]
                    : [
                          MEDIAPIPE_LANDMARK_INDEX.eyeBLowerInner,
                          MEDIAPIPE_LANDMARK_INDEX.eyeBLowerCenter,
                          MEDIAPIPE_LANDMARK_INDEX.eyeBLowerOuter,
                      ],
            );

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
        .filter((eye): eye is MediaPipeGazeWindow => eye !== null)
        .sort((a, b) => a.centerX - b.centerX);
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
    const eyeRatios = getEyeSamples(landmarks)
        .map(calculateEyeAspectRatio)
        .filter((ratio): ratio is number => ratio !== null);

    if (eyeRatios.length !== 2) {
        return 'unknown';
    }

    if (eyeRatios.every((ratio) => ratio <= MEDIAPIPE_EYE_CLOSED_RATIO_THRESHOLD)) {
        return 'closed';
    }

    if (eyeRatios.every((ratio) => ratio <= MEDIAPIPE_EYE_NARROW_RATIO_THRESHOLD)) {
        return 'unknown';
    }

    return 'open';
}

function buildSingleFaceAnalysis(args: {
    landmarks: MediaPipeLandmark[];
    confidenceScore: number | null;
    confidenceThreshold: number;
    tolerateDownwardGaze?: boolean;
}): MediaPipeFrameAnalysis {
    const faceBounds = calculateMediaPipeFaceBounds(args.landmarks);
    const gazeEstimate = estimateMediaPipeGazeDirection(args.landmarks);
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

export function estimateMediaPipeGazeDirection(landmarks: MediaPipeLandmark[]): {
    direction: MediaPipeGazeDirection | null;
    eyeState: MediaPipeEyeState;
} {
    const eyeState = estimateMediaPipeEyeState(landmarks);
    const fallbackDirection = estimateMediaPipeHeadPoseDirection(landmarks);

    if (eyeState === 'closed') {
        return {
            direction: 'center',
            eyeState,
        };
    }

    const eyeWindows = buildGazeWindows(landmarks);
    const irisCenters = MEDIAPIPE_IRIS_LANDMARK_GROUPS.map((indices) =>
        averageLandmark(landmarks, indices),
    )
        .filter((iris): iris is MediaPipeLandmark => iris !== null)
        .sort((a, b) => a.x - b.x);

    if (eyeWindows.length !== 2 || irisCenters.length !== 2 || eyeState === 'unknown') {
        return {
            direction: fallbackDirection,
            eyeState,
        };
    }

    const horizontalOffsets = eyeWindows.map((eye, index) => {
        const span = Math.max(eye.maxX - eye.minX, 0.001);
        return ((irisCenters[index].x - eye.minX) / span - 0.5) * 2;
    });
    const verticalOffsets = eyeWindows.map((eye, index) => {
        const span = Math.max(eye.lowerCenter.y - eye.upperCenter.y, 0.001);
        return ((irisCenters[index].y - eye.upperCenter.y) / span - 0.5) * 2;
    });
    const horizontalOffset =
        horizontalOffsets.reduce((sum, offset) => sum + offset, 0) / horizontalOffsets.length;
    const verticalOffset =
        verticalOffsets.reduce((sum, offset) => sum + offset, 0) / verticalOffsets.length;

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
    });
}
