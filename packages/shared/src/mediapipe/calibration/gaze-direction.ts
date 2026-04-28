import type {
    MediaPipeCalibrationProfile,
    MediaPipeEyeState,
    MediaPipeGazeDirection,
    MediaPipeGazeOffsetSample,
} from '../types';
import { DEFAULT_CALIBRATION_THRESHOLDS } from './calibration-profile';

/**
 * Estimates the gaze direction for a single frame given:
 * - A pre-computed gaze offset sample (iris & head pose).
 * - The current eye state.
 * - An optional calibration profile for neutral-gaze correction.
 *
 * Priority order:
 * 1. If eyes are closed → `center` (blink, not a deliberate gaze).
 * 2. Iris-based direction (only when eye state is `open`).
 * 3. Head-pose-based direction as fallback.
 * 4. `center` if no threshold is exceeded.
 */
export function estimateMediaPipeGazeDirectionFromSample(args: {
    sample: MediaPipeGazeOffsetSample;
    eyeState: MediaPipeEyeState;
    calibrationProfile?: MediaPipeCalibrationProfile | null;
}): MediaPipeGazeDirection | null {
    if (args.eyeState === 'closed') {
        return 'center';
    }

    const neutral = args.calibrationProfile?.neutralGaze;
    const thresholds = args.calibrationProfile?.thresholds ?? DEFAULT_CALIBRATION_THRESHOLDS;

    // Apply neutral-gaze correction when a calibration profile is available.
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

    // --- Iris-based classification (preferred, skipped when eye state is uncertain) ---
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

    // --- Head-pose fallback ---
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
