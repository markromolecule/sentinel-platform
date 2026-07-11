import { calculateMediaPipeFaceBounds } from '../landmarks';
import type {
    MediaPipeCalibrationSample,
    MediaPipeFrameAnalysis,
    MediaPipeLandmark,
} from '../types';
import { calculateMediaPipeGazeOffsetSample } from './gaze-offset';

/**
 * Returns whether the face bounds remain within the centered calibration window.
 *
 * @param args.faceBounds The detected face bounds for the current frame.
 * @param args.targetCenterX The expected horizontal center of the face.
 * @param args.targetCenterY The expected vertical center of the face.
 * @param args.maxHorizontalDelta The maximum horizontal drift allowed from center.
 * @param args.maxVerticalDelta The maximum vertical drift allowed from center.
 * @returns `true` when the face stays inside the calibration target bounds.
 */
export function isMediaPipeFaceCenteredForCalibration(args: {
    faceBounds: MediaPipeCalibrationSample['faceBounds'] | null;
    targetCenterX?: number;
    targetCenterY?: number;
    maxHorizontalDelta?: number;
    maxVerticalDelta?: number;
}) {
    if (!args.faceBounds) {
        return false;
    }

    const targetCenterX = args.targetCenterX ?? 0.5;
    const targetCenterY = args.targetCenterY ?? 0.45;
    const maxHorizontalDelta = args.maxHorizontalDelta ?? 0.15;
    const maxVerticalDelta = args.maxVerticalDelta ?? 0.2;

    return (
        Math.abs(args.faceBounds.centerX - targetCenterX) < maxHorizontalDelta &&
        Math.abs(args.faceBounds.centerY - targetCenterY) < maxVerticalDelta
    );
}

/**
 * Creates a single calibration sample from raw face landmarks and a confidence score.
 * Returns `null` if face bounds cannot be determined (e.g. no visible face).
 */
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

/**
 * Determines whether a given frame qualifies as a calibration candidate.
 *
 * A frame is rejected if:
 * - The analysis status is not `ready`, or the eye state is `closed`.
 * - Face bounds or head-pose offsets cannot be computed.
 * - The confidence score is below the required threshold.
 * - The face center is too far from the expected target position.
 */
export function isMediaPipeCalibrationCandidate(args: {
    analysis: MediaPipeFrameAnalysis;
    landmarks: MediaPipeLandmark[];
    confidenceThreshold: number;
    targetCenterX?: number;
    targetCenterY?: number;
}): boolean {
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

    return isMediaPipeFaceCenteredForCalibration({
        faceBounds: sample.faceBounds,
        targetCenterX: args.targetCenterX,
        targetCenterY: args.targetCenterY,
    });
}
