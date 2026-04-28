import type { MediaPipeCalibrationProfile, MediaPipeCalibrationSample } from '../types';
import { averageNullable } from './gaze-offset';

/**
 * Default gaze-direction thresholds applied when no calibration profile is available,
 * or when a profile does not override individual values.
 */
export const DEFAULT_CALIBRATION_THRESHOLDS = {
    irisHorizontalDelta: 0.16,
    irisVerticalDeltaUp: 0.2,
    irisVerticalDeltaDown: 0.28,
    headHorizontalDelta: 0.22,
    headVerticalDeltaUp: 0.18,
    headVerticalDeltaDown: 0.24,
} as const;

/**
 * Aggregates a list of calibration samples into a reusable calibration profile.
 * Averages face bounds, gaze offsets, and confidence across all samples.
 * Returns `null` if no samples are provided.
 */
export function buildMediaPipeCalibrationProfile(args: {
    samples: MediaPipeCalibrationSample[];
    createdAt?: string;
}): MediaPipeCalibrationProfile | null {
    if (args.samples.length === 0) {
        return null;
    }

    const firstSample = args.samples[0];
    const sampleCount = args.samples.length;

    const averageFaceBoundField = (field: keyof MediaPipeCalibrationSample['faceBounds']) =>
        args.samples.reduce((sum, sample) => sum + sample.faceBounds[field], 0) / sampleCount;

    return {
        version: 1,
        createdAt: args.createdAt ?? new Date().toISOString(),
        sampleCount,
        confidenceScore: averageNullable(args.samples.map((sample) => sample.confidenceScore)),
        faceBounds: {
            minX: averageFaceBoundField('minX'),
            minY: averageFaceBoundField('minY'),
            maxX: averageFaceBoundField('maxX'),
            maxY: averageFaceBoundField('maxY'),
            width: averageFaceBoundField('width'),
            height: averageFaceBoundField('height'),
            centerX: averageFaceBoundField('centerX'),
            centerY: averageFaceBoundField('centerY'),
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
