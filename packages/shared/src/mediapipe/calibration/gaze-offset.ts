import { MEDIAPIPE_IRIS_LANDMARK_GROUPS, MEDIAPIPE_LANDMARK_INDEX } from '../constants';
import { averageLandmark, readLandmark } from '../landmarks';
import type { MediaPipeGazeOffsetSample, MediaPipeLandmark } from '../types';
import { calculateEyeAspectRatio, getEyeSamples } from './eye-state';
import type { MediaPipeGazeWindow } from './types';

/**
 * Averages an array of nullable numbers, ignoring `null` values.
 * Returns `null` if no valid values are present.
 */
export function averageNullable(values: Array<number | null>): number | null {
    const resolved = values.filter((value): value is number => value !== null);

    if (resolved.length === 0) {
        return null;
    }

    return resolved.reduce((sum, value) => sum + value, 0) / resolved.length;
}

/**
 * Builds axis-aligned eye windows (bounding boxes + eyelid centers) for each eye.
 * Windows are sorted left-to-right by horizontal center.
 * Returns an empty array if required landmarks are missing for an eye.
 */
export function buildGazeWindows(landmarks: MediaPipeLandmark[]): MediaPipeGazeWindow[] {
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

/**
 * Computes normalised horizontal and vertical head-pose offsets
 * using the nose tip relative to the inter-eye axis and face bounding box.
 */
export function calculateHeadPoseOffsets(landmarks: MediaPipeLandmark[]): {
    headHorizontalOffset: number | null;
    headVerticalOffset: number | null;
} {
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

/**
 * Computes a full gaze offset sample from raw face landmarks.
 * Includes iris position, head pose, and eye aspect ratio.
 * Returns `null` offsets for fields that cannot be determined.
 */
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
