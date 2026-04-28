import { calculateMediaPipeFaceBounds } from '../landmarks';
import type {
    MediaPipeCalibrationSample,
    MediaPipeFrameAnalysis,
    MediaPipeLandmark,
} from '../types';
import { calculateMediaPipeGazeOffsetSample } from './gaze-offset';

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

    const targetCenterX = args.targetCenterX ?? 0.5;
    const targetCenterY = args.targetCenterY ?? 0.45;

    return (
        Math.abs(sample.faceBounds.centerX - targetCenterX) < 0.15 &&
        Math.abs(sample.faceBounds.centerY - targetCenterY) < 0.2
    );
}
