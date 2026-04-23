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
    readLandmark,
} from './landmarks';
import type {
    MediaPipeCalibrationProfile,
    MediaPipeCalibrationSample,
    MediaPipeEyeState,
    MediaPipeFrameAnalysis,
    MediaPipeGazeDirection,
    MediaPipeGazeOffsetSample,
    MediaPipeLandmark,
} from './types';

const DEFAULT_CALIBRATION_THRESHOLDS = {
    irisHorizontalDelta: 0.14,
    irisVerticalDeltaUp: 0.18,
    irisVerticalDeltaDown: 0.22,
    headHorizontalDelta: 0.18,
    headVerticalDeltaUp: 0.16,
    headVerticalDeltaDown: 0.2,
} as const;

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

function averageNullable(values: Array<number | null>) {
    const resolved = values.filter((value): value is number => value !== null);

    if (resolved.length === 0) {
        return null;
    }

    return resolved.reduce((sum, value) => sum + value, 0) / resolved.length;
}

function calculateHeadPoseOffsets(landmarks: MediaPipeLandmark[]) {
    const noseTip = readLandmark(landmarks, MEDIAPIPE_LANDMARK_INDEX.noseTip);
    const eyeAOuter = readLandmark(landmarks, MEDIAPIPE_LANDMARK_INDEX.eyeAOuter);
    const eyeBOuter = readLandmark(landmarks, MEDIAPIPE_LANDMARK_INDEX.eyeBOuter);
    const browCenter = readLandmark(landmarks, MEDIAPIPE_LANDMARK_INDEX.browCenter);
    const chin = readLandmark(landmarks, MEDIAPIPE_LANDMARK_INDEX.chin);

    if (!noseTip || !eyeAOuter || !eyeBOuter || !browCenter || !chin) {
        return {
            headHorizontalOffset: null,
            headVerticalOffset: null,
        };
    }

    const eyeCenterX = (eyeAOuter.x + eyeBOuter.x) / 2;
    const eyeCenterY = (eyeAOuter.y + eyeBOuter.y) / 2;
    const faceWidth = Math.max(Math.abs(eyeBOuter.x - eyeAOuter.x), 0.001);
    const faceHeight = Math.max(Math.abs(chin.y - browCenter.y), 0.001);

    return {
        headHorizontalOffset: (noseTip.x - eyeCenterX) / faceWidth,
        headVerticalOffset: (noseTip.y - eyeCenterY) / faceHeight,
    };
}

export function estimateMediaPipeEyeState(landmarks: MediaPipeLandmark[]): MediaPipeEyeState {
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

export function calculateMediaPipeGazeOffsetSample(
    landmarks: MediaPipeLandmark[],
): MediaPipeGazeOffsetSample {
    const eyeWindows = buildGazeWindows(landmarks);
    const irisCenters = MEDIAPIPE_IRIS_LANDMARK_GROUPS.map((indices) =>
        averageLandmark(landmarks, indices),
    )
        .filter((iris): iris is MediaPipeLandmark => iris !== null)
        .sort((a, b) => a.x - b.x);
    const eyeAspectRatio = averageNullable(getEyeSamples(landmarks).map(calculateEyeAspectRatio));
    const { headHorizontalOffset, headVerticalOffset } = calculateHeadPoseOffsets(landmarks);

    if (eyeWindows.length !== 2 || irisCenters.length !== 2) {
        return {
            irisHorizontalOffset: null,
            irisVerticalOffset: null,
            headHorizontalOffset,
            headVerticalOffset,
            eyeAspectRatio,
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

    return {
        irisHorizontalOffset:
            horizontalOffsets.reduce((sum, offset) => sum + offset, 0) / horizontalOffsets.length,
        irisVerticalOffset:
            verticalOffsets.reduce((sum, offset) => sum + offset, 0) / verticalOffsets.length,
        headHorizontalOffset,
        headVerticalOffset,
        eyeAspectRatio,
    };
}

export function createMediaPipeCalibrationSample(args: {
    landmarks: MediaPipeLandmark[];
    confidenceScore: number | null;
}): MediaPipeCalibrationSample | null {
    const faceBounds = calculateMediaPipeFaceBounds(args.landmarks);

    if (!faceBounds) {
        return null;
    }

    return {
        landmarks: args.landmarks,
        confidenceScore: args.confidenceScore,
        faceBounds,
        gaze: calculateMediaPipeGazeOffsetSample(args.landmarks),
    };
}

export function isMediaPipeCalibrationCandidate(args: {
    analysis: MediaPipeFrameAnalysis;
    landmarks: MediaPipeLandmark[];
    confidenceThreshold: number;
    targetCenterX?: number;
    targetCenterY?: number;
}) {
    if (args.analysis.status !== 'ready' || args.analysis.eyeState === 'closed') {
        return false;
    }

    const sample = createMediaPipeCalibrationSample({
        landmarks: args.landmarks,
        confidenceScore: args.analysis.confidenceScore,
    });

    if (
        !sample ||
        sample.gaze.headHorizontalOffset === null ||
        sample.gaze.headVerticalOffset === null
    ) {
        return false;
    }

    if (
        args.analysis.confidenceScore !== null &&
        args.analysis.confidenceScore < args.confidenceThreshold
    ) {
        return false;
    }

    const targetCenterX = args.targetCenterX ?? 0.5;
    const targetCenterY = args.targetCenterY ?? 0.45;

    return (
        Math.abs(sample.faceBounds.centerX - targetCenterX) < 0.15 &&
        Math.abs(sample.faceBounds.centerY - targetCenterY) < 0.2
    );
}

export function buildMediaPipeCalibrationProfile(args: {
    samples: MediaPipeCalibrationSample[];
    createdAt?: string;
}): MediaPipeCalibrationProfile | null {
    if (args.samples.length === 0) {
        return null;
    }

    const firstSample = args.samples[0];
    const sampleCount = args.samples.length;

    return {
        version: 1,
        createdAt: args.createdAt ?? new Date().toISOString(),
        sampleCount,
        confidenceScore: averageNullable(args.samples.map((sample) => sample.confidenceScore)),
        faceBounds: {
            minX:
                args.samples.reduce((sum, sample) => sum + sample.faceBounds.minX, 0) / sampleCount,
            minY:
                args.samples.reduce((sum, sample) => sum + sample.faceBounds.minY, 0) / sampleCount,
            maxX:
                args.samples.reduce((sum, sample) => sum + sample.faceBounds.maxX, 0) / sampleCount,
            maxY:
                args.samples.reduce((sum, sample) => sum + sample.faceBounds.maxY, 0) / sampleCount,
            width:
                args.samples.reduce((sum, sample) => sum + sample.faceBounds.width, 0) /
                sampleCount,
            height:
                args.samples.reduce((sum, sample) => sum + sample.faceBounds.height, 0) /
                sampleCount,
            centerX:
                args.samples.reduce((sum, sample) => sum + sample.faceBounds.centerX, 0) /
                sampleCount,
            centerY:
                args.samples.reduce((sum, sample) => sum + sample.faceBounds.centerY, 0) /
                sampleCount,
        },
        neutralGaze: {
            irisHorizontalOffset:
                averageNullable(args.samples.map((sample) => sample.gaze.irisHorizontalOffset)) ??
                firstSample.gaze.irisHorizontalOffset,
            irisVerticalOffset:
                averageNullable(args.samples.map((sample) => sample.gaze.irisVerticalOffset)) ??
                firstSample.gaze.irisVerticalOffset,
            headHorizontalOffset:
                averageNullable(args.samples.map((sample) => sample.gaze.headHorizontalOffset)) ??
                firstSample.gaze.headHorizontalOffset,
            headVerticalOffset:
                averageNullable(args.samples.map((sample) => sample.gaze.headVerticalOffset)) ??
                firstSample.gaze.headVerticalOffset,
            eyeAspectRatio:
                averageNullable(args.samples.map((sample) => sample.gaze.eyeAspectRatio)) ??
                firstSample.gaze.eyeAspectRatio,
        },
        thresholds: {
            ...DEFAULT_CALIBRATION_THRESHOLDS,
        },
    };
}

export function estimateMediaPipeGazeDirectionFromSample(args: {
    sample: MediaPipeGazeOffsetSample;
    eyeState: MediaPipeEyeState;
    calibrationProfile?: MediaPipeCalibrationProfile | null;
}): MediaPipeGazeDirection | null {
    if (args.eyeState === 'closed') {
        return 'center';
    }

    const profile = args.calibrationProfile;
    const neutral = profile?.neutralGaze;
    const thresholds = profile?.thresholds ?? DEFAULT_CALIBRATION_THRESHOLDS;
    const irisHorizontalOffset =
        args.sample.irisHorizontalOffset !== null
            ? args.sample.irisHorizontalOffset - (neutral?.irisHorizontalOffset ?? 0)
            : null;
    const irisVerticalOffset =
        args.sample.irisVerticalOffset !== null
            ? args.sample.irisVerticalOffset - (neutral?.irisVerticalOffset ?? 0)
            : null;
    const headHorizontalOffset =
        args.sample.headHorizontalOffset !== null
            ? args.sample.headHorizontalOffset - (neutral?.headHorizontalOffset ?? 0)
            : null;
    const headVerticalOffset =
        args.sample.headVerticalOffset !== null
            ? args.sample.headVerticalOffset - (neutral?.headVerticalOffset ?? 0)
            : null;

    if (
        args.eyeState !== 'unknown' &&
        irisHorizontalOffset !== null &&
        irisVerticalOffset !== null
    ) {
        if (
            Math.abs(irisHorizontalOffset) >= thresholds.irisHorizontalDelta &&
            Math.abs(irisHorizontalOffset) >= Math.abs(irisVerticalOffset) * 0.8
        ) {
            return irisHorizontalOffset < 0 ? 'left' : 'right';
        }

        if (irisVerticalOffset <= -thresholds.irisVerticalDeltaUp) {
            return 'up';
        }

        if (irisVerticalOffset >= thresholds.irisVerticalDeltaDown) {
            return 'down';
        }
    }

    if (headHorizontalOffset !== null && headVerticalOffset !== null) {
        if (Math.abs(headHorizontalOffset) >= Math.abs(headVerticalOffset)) {
            if (headHorizontalOffset <= -thresholds.headHorizontalDelta) {
                return 'left';
            }

            if (headHorizontalOffset >= thresholds.headHorizontalDelta) {
                return 'right';
            }
        }

        if (headVerticalOffset <= -thresholds.headVerticalDeltaUp) {
            return 'up';
        }

        if (headVerticalOffset >= thresholds.headVerticalDeltaDown) {
            return 'down';
        }
    }

    return 'center';
}
