import { useMemo } from 'react';
import { resolveMediaPipeThresholds } from '@sentinel/shared';
import type { ResolvedMediaPipeSandbox } from '../_types';

/**
 * Maximum duration threshold (ms) enforced for the attempt page, regardless
 * of what the sandbox configuration specifies.
 */
const ATTEMPT_MAX_SIGNAL_DURATION_MS = 1500;

/**
 * Fallback sandbox used when the live sandbox is not yet resolved, so
 * thresholds can still be computed with safe defaults.
 */
const FALLBACK_SANDBOX: ResolvedMediaPipeSandbox = {
    enabled: false,
    captureDuringCheckup: false,
    emitDuringExam: false,
    confidenceThreshold: 0.8,
    frameIntervalMs: 500,
    offScreenDurationMs: 1500,
    calibrationRequired: false,
    debugOverlayEnabled: false,
};

export type UseMediapipeRuntimeThresholdsArgs = {
    activeSandbox: ResolvedMediaPipeSandbox | undefined;
};

export type AttemptMediaPipeDevelopmentDiagnostics = {
    confidenceThreshold: number;
    durationThresholdMs: number | null;
    frameIntervalMs: number;
    calibrationState: 'available' | 'missing';
    downwardGazePolicy: 'tolerated' | 'strict';
};

/**
 * Builds a compact development-only diagnostics payload for attempt-page
 * MediaPipe dispatch decisions.
 */
export function buildAttemptMediaPipeDevelopmentDiagnostics(args: {
    activeSandbox: ResolvedMediaPipeSandbox | undefined;
    thresholds: ReturnType<typeof resolveMediaPipeThresholds>;
    hasCalibrationProfile: boolean;
    tolerateDownwardGaze: boolean;
}): AttemptMediaPipeDevelopmentDiagnostics {
    const sandbox = args.activeSandbox ?? FALLBACK_SANDBOX;

    return {
        confidenceThreshold: sandbox.confidenceThreshold,
        durationThresholdMs: args.thresholds.GAZE_OFF_SCREEN.durationThresholdMs,
        frameIntervalMs: sandbox.frameIntervalMs,
        calibrationState: args.hasCalibrationProfile ? 'available' : 'missing',
        downwardGazePolicy: args.tolerateDownwardGaze ? 'tolerated' : 'strict',
    };
}

/**
 * Derives the signal-dispatch thresholds from the resolved sandbox config.
 * Clamps `GAZE_OFF_SCREEN` and `NO_FACE_DETECTED` duration thresholds to
 * `ATTEMPT_MAX_SIGNAL_DURATION_MS` to enforce a consistent attempt-page baseline.
 */
export function useMediapipeRuntimeThresholds({
    activeSandbox,
}: UseMediapipeRuntimeThresholdsArgs) {
    return useMemo(() => {
        const thresholds = resolveMediaPipeThresholds({
            sandbox: activeSandbox ?? FALLBACK_SANDBOX,
        });

        thresholds.GAZE_OFF_SCREEN.durationThresholdMs = Math.min(
            thresholds.GAZE_OFF_SCREEN.durationThresholdMs ?? ATTEMPT_MAX_SIGNAL_DURATION_MS,
            ATTEMPT_MAX_SIGNAL_DURATION_MS,
        );

        thresholds.NO_FACE_DETECTED.durationThresholdMs = Math.min(
            thresholds.NO_FACE_DETECTED.durationThresholdMs ?? ATTEMPT_MAX_SIGNAL_DURATION_MS,
            ATTEMPT_MAX_SIGNAL_DURATION_MS,
        );

        return thresholds;
    }, [activeSandbox]);
}
