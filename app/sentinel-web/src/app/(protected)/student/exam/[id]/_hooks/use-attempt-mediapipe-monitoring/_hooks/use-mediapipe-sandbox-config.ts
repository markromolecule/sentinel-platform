import { useMemo } from 'react';
import type { TelemetrySettings } from '@sentinel/shared';
import type { ResolvedMediaPipeSandbox } from '../_types';

export type UseMediapipeSandboxConfigArgs = {
    mediaPipeSandbox?: TelemetrySettings['mediaPipeSandbox'];
};

/**
 * Flattens every field of `mediaPipeSandbox` into stable primitive variables,
 * then re-assembles them into a single memoized object.
 *
 * This prevents the parent hook from re-triggering effects when a new object
 * reference is passed but the actual values are unchanged.
 *
 * Returns `undefined` when any required field is missing.
 */
export function useMediapipeSandboxConfig({
    mediaPipeSandbox,
}: UseMediapipeSandboxConfigArgs): ResolvedMediaPipeSandbox | undefined {
    const enabled = mediaPipeSandbox?.enabled;
    const captureDuringCheckup = mediaPipeSandbox?.captureDuringCheckup;
    const emitDuringExam = mediaPipeSandbox?.emitDuringExam;
    const confidenceThreshold = mediaPipeSandbox?.confidenceThreshold;
    const frameIntervalMs = mediaPipeSandbox?.frameIntervalMs;
    const offScreenDurationMs = mediaPipeSandbox?.offScreenDurationMs;
    const calibrationRequired = mediaPipeSandbox?.calibrationRequired;
    const debugOverlayEnabled = mediaPipeSandbox?.debugOverlayEnabled;

    return useMemo(() => {
        if (
            enabled === undefined ||
            captureDuringCheckup === undefined ||
            emitDuringExam === undefined ||
            confidenceThreshold === undefined ||
            frameIntervalMs === undefined ||
            offScreenDurationMs === undefined ||
            calibrationRequired === undefined ||
            debugOverlayEnabled === undefined
        ) {
            return undefined;
        }

        return {
            enabled,
            captureDuringCheckup,
            emitDuringExam,
            confidenceThreshold,
            frameIntervalMs,
            offScreenDurationMs,
            calibrationRequired,
            debugOverlayEnabled,
        };
    }, [
        enabled,
        captureDuringCheckup,
        emitDuringExam,
        confidenceThreshold,
        frameIntervalMs,
        offScreenDurationMs,
        calibrationRequired,
        debugOverlayEnabled,
    ]);
}
