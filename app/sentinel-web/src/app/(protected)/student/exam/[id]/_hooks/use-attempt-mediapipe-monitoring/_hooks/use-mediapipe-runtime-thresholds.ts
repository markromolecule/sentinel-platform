import { useMemo } from 'react';
import { resolveMediaPipeThresholds } from '@sentinel/shared';
import type { ResolvedMediaPipeSandbox } from '../_types';

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
        return resolveMediaPipeThresholds({
            sandbox: activeSandbox ?? FALLBACK_SANDBOX,
        });
    }, [activeSandbox]);
}
