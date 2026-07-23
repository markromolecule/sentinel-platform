import type { AudioAnomalyType } from './audio-anomaly';

/**
 * Evaluates whether one anomaly type should trigger for the current frame.
 *
 * The engine owns per-type streak counting and cooldown suppression. Callers
 * provide the current streak and last accepted timestamp for exactly one anomaly
 * label so different labels can evolve independently.
 *
 * @param args Current confidence, threshold, streak, and cooldown state.
 * @returns The next state plus whether the current frame produced a trigger.
 */
export function evaluateAudioAnomalyTrigger(args: {
    anomalyType: AudioAnomalyType;
    confidence: number | null;
    threshold: number;
    consecutiveFrames: number;
    requiredConsecutiveFrames: number;
    cooldownMs: number;
    lastTriggeredAtMs: number | null;
    nowMs: number;
}): {
    triggered: boolean;
    nextConsecutiveFrames: number;
    cooldownActive: boolean;
    acceptedConfidence: number | null;
} {
    const confidenceMeetsThreshold = args.confidence !== null && args.confidence >= args.threshold;

    if (!confidenceMeetsThreshold) {
        return {
            triggered: false,
            nextConsecutiveFrames: 0,
            cooldownActive: false,
            acceptedConfidence: null,
        };
    }

    const nextConsecutiveFrames = args.consecutiveFrames + 1;
    const cooldownActive =
        args.lastTriggeredAtMs !== null && args.nowMs - args.lastTriggeredAtMs <= args.cooldownMs;

    if (nextConsecutiveFrames < args.requiredConsecutiveFrames || cooldownActive) {
        return {
            triggered: false,
            nextConsecutiveFrames,
            cooldownActive,
            acceptedConfidence: args.confidence,
        };
    }

    return {
        triggered: true,
        nextConsecutiveFrames: 0,
        cooldownActive: false,
        acceptedConfidence: args.confidence,
    };
}
