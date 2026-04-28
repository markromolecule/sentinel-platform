import {
    MEDIAPIPE_EYE_CLOSED_RATIO_THRESHOLD,
    MEDIAPIPE_EYE_NARROW_RATIO_THRESHOLD,
    MEDIAPIPE_LANDMARK_INDEX,
} from '../constants';
import { calculateLandmarkDistance, readLandmark } from '../landmarks';
import type { MediaPipeEyeState, MediaPipeLandmark } from '../types';
import type { MediaPipeEyeSample } from './types';

/**
 * Extracts raw landmark data for both eyes from a face landmark array.
 * Eye A is the left eye (from the subject's perspective) and Eye B is the right.
 */
export function getEyeSamples(landmarks: MediaPipeLandmark[]): MediaPipeEyeSample[] {
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

/**
 * Computes the Eye Aspect Ratio (EAR) for a single eye sample.
 * Returns `null` if any required landmark is missing.
 *
 * EAR = average vertical distance / horizontal distance
 */
export function calculateEyeAspectRatio(eye: MediaPipeEyeSample): number | null {
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

/**
 * Classifies the current eye state as `open`, `closed`, or `unknown`
 * based on the Eye Aspect Ratio of both eyes.
 */
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
