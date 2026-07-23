import { calculateMediaPipeFaceBounds, isMediaPipePartialFaceVisible } from '../landmarks';
import type {
    MediaPipeCalibrationSample,
    MediaPipeFrameAnalysis,
    MediaPipeLandmark,
    MediaPipeCalibrationCandidateReason,
    MediaPipeCalibrationEvaluationResult,
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
 * Minimum normalized face area (width * height) required for calibration.
 * Represents a face that is too far from the camera.
 */
export const MEDIAPIPE_CALIBRATION_MIN_FACE_AREA = 0.05;

/**
 * Maximum normalized face area (width * height) allowed for calibration.
 * Represents a face that is too close to the camera.
 */
export const MEDIAPIPE_CALIBRATION_MAX_FACE_AREA = 0.5;

/**
 * Evaluates whether a frame qualifies as a calibration candidate and returns detailed results.
 */
export function evaluateMediaPipeCalibrationCandidate(args: {
    analysis: MediaPipeFrameAnalysis;
    landmarks: MediaPipeLandmark[];
    confidenceThreshold: number;
    targetCenterX?: number;
    targetCenterY?: number;
}): MediaPipeCalibrationEvaluationResult {
    // 1. Check eyes-closed first
    if (args.analysis.eyeState === 'closed') {
        return {
            isValid: false,
            reason: 'eyes-closed',
            details: 'Both eyes appear closed. Please keep your eyes open during calibration.',
        };
    }

    // Also check face count
    if (args.analysis.faceCount === 0) {
        return {
            isValid: false,
            reason: 'low-confidence',
            details: 'No face detected in the camera frame.',
        };
    }

    if (args.analysis.faceCount > 1) {
        return {
            isValid: false,
            reason: 'low-confidence',
            details: 'Multiple faces detected in the camera frame.',
        };
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
        return {
            isValid: false,
            reason: 'low-confidence',
            details:
                'Face landmarks or gaze position could not be computed. Please look directly at the screen.',
        };
    }

    const faceBounds = sample.faceBounds;
    const area = faceBounds.width * faceBounds.height;

    // 2. Check too-close
    if (area > MEDIAPIPE_CALIBRATION_MAX_FACE_AREA) {
        return {
            isValid: false,
            reason: 'too-close',
            details: 'Your face is too close to the camera. Please move the device farther away.',
        };
    }

    // 3. Check too-far
    if (area < MEDIAPIPE_CALIBRATION_MIN_FACE_AREA) {
        return {
            isValid: false,
            reason: 'too-far',
            details: 'Your face is too far from the camera. Please move closer to the device.',
        };
    }

    // 4. Check cropped
    if (isMediaPipePartialFaceVisible(faceBounds)) {
        return {
            isValid: false,
            reason: 'cropped',
            details:
                'Your face is partially out of frame. Please ensure your entire face is visible.',
        };
    }

    // 5. Check off-center
    const isCentered = isMediaPipeFaceCenteredForCalibration({
        faceBounds,
        targetCenterX: args.targetCenterX,
        targetCenterY: args.targetCenterY,
    });

    if (!isCentered) {
        return {
            isValid: false,
            reason: 'off-center',
            details: 'Your face is off-center. Please look directly at the center of the camera.',
        };
    }

    // 6. Check low-confidence AFTER geometry checks
    if (
        args.analysis.confidenceScore !== null &&
        args.analysis.confidenceScore < args.confidenceThreshold
    ) {
        return {
            isValid: false,
            reason: 'low-confidence',
            details:
                'Lighting or camera quality is low. Please center your face in a well-lit room.',
        };
    }

    return {
        isValid: true,
        reason: 'accepted',
        details: 'Calibration sample is valid and centered.',
    };
}

/**
 * Determines whether a given frame qualifies as a calibration candidate.
 * Keeps backward compatibility as a simple boolean wrapper.
 */
export function isMediaPipeCalibrationCandidate(args: {
    analysis: MediaPipeFrameAnalysis;
    landmarks: MediaPipeLandmark[];
    confidenceThreshold: number;
    targetCenterX?: number;
    targetCenterY?: number;
}): boolean {
    return evaluateMediaPipeCalibrationCandidate(args).isValid;
}
