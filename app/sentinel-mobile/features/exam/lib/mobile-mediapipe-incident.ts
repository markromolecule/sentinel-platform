import type { MediaPipeFrameAnalysis } from '@sentinel/shared';
import type { MobileTelemetryMetadata } from './mobile-telemetry-client';

export type MediaPipeIncidentSignal = 'GAZE_OFF_SCREEN' | 'MULTIPLE_FACES' | 'NO_FACE_DETECTED';

export type MediaPipeWarningStatus =
    | 'Face not detected'
    | 'Multiple faces detected'
    | 'Looking away from screen'
    | null;

export interface ResolvedMediaPipeIncident {
    activeSignal: MediaPipeIncidentSignal | null;
    activeWarning: MediaPipeWarningStatus;
}

/**
 * Maps raw MediaPipe frame analysis status to user-facing warning and telemetry incident signal.
 */
export function resolveMediaPipeIncident(
    status: MediaPipeFrameAnalysis['status'] | string | undefined,
): ResolvedMediaPipeIncident {
    switch (status) {
        case 'no-face':
            return {
                activeSignal: 'NO_FACE_DETECTED',
                activeWarning: 'Face not detected',
            };
        case 'multiple-faces':
            return {
                activeSignal: 'MULTIPLE_FACES',
                activeWarning: 'Multiple faces detected',
            };
        case 'off-screen':
            return {
                activeSignal: 'GAZE_OFF_SCREEN',
                activeWarning: 'Looking away from screen',
            };
        case 'ready':
        default:
            return {
                activeSignal: null,
                activeWarning: null,
            };
    }
}

/**
 * Determines whether two MediaPipe frame analyses are functionally identical to prevent redundant state re-renders.
 */
export function isSameMediaPipeAnalysis(
    prev: MediaPipeFrameAnalysis | null,
    next: MediaPipeFrameAnalysis | null,
): boolean {
    if (prev === next) return true;
    if (!prev || !next) return false;

    return (
        prev.status === next.status &&
        prev.signal === next.signal &&
        prev.faceCount === next.faceCount &&
        prev.confidenceScore === next.confidenceScore &&
        prev.gazeDirection === next.gazeDirection &&
        prev.eyeState === next.eyeState
    );
}

/**
 * Calculates incident duration in milliseconds based on consecutive frame count and frame interval.
 * Enforces a minimum duration floor (default 4000ms).
 */
export function calculateIncidentDuration(
    framesCount: number,
    frameIntervalMs = 1000,
    minDurationMs = 4000,
): number {
    return Math.max(framesCount * frameIntervalMs, minDurationMs);
}

/**
 * Constructs the typed telemetry metadata payload for MediaPipe incident events.
 */
export function buildMediaPipeTelemetryMetadata(args: {
    signal: MediaPipeIncidentSignal;
    confidenceScore?: number | null;
    durationMs?: number;
}): MobileTelemetryMetadata {
    const { signal, confidenceScore, durationMs } = args;

    if (signal === 'GAZE_OFF_SCREEN' || signal === 'NO_FACE_DETECTED') {
        return {
            durationMs,
            confidenceScore: confidenceScore ?? undefined,
        };
    }

    return {
        confidenceScore: confidenceScore ?? undefined,
    };
}

export interface EvaluateIncidentTriggerArgs {
    currentConsecutiveFrames: number;
    consecutiveThreshold: number;
    lastTriggeredAt: number;
    now: number;
    cooldownMs: number;
}

export interface IncidentTriggerEvaluation {
    isThresholdMet: boolean;
    isOnCooldown: boolean;
    shouldTrigger: boolean;
}

/**
 * Evaluates whether an incident signal has satisfied consecutive frame thresholds
 * and is clear of the debounce cooldown period.
 */
export function evaluateIncidentTrigger({
    currentConsecutiveFrames,
    consecutiveThreshold,
    lastTriggeredAt,
    now,
    cooldownMs,
}: EvaluateIncidentTriggerArgs): IncidentTriggerEvaluation {
    const isThresholdMet = currentConsecutiveFrames >= consecutiveThreshold;
    const isOnCooldown = now - lastTriggeredAt < cooldownMs;
    const shouldTrigger = isThresholdMet && !isOnCooldown;

    return {
        isThresholdMet,
        isOnCooldown,
        shouldTrigger,
    };
}
