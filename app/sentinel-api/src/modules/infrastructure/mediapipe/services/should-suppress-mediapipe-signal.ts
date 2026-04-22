import {
    createMediaPipeSignalTrackerState,
    evaluateMediaPipeSignalDispatch,
    type EvaluateMediaPipeSignalDispatchResult,
    type MediaPipeSignalTrackerState,
    type MediaPipeSupportedEventType,
    type MediaPipeThresholdResolution,
} from '@sentinel/shared';

export function shouldSuppressMediaPipeSignal(args: {
    currentSignal: MediaPipeSupportedEventType | null;
    tracker?: MediaPipeSignalTrackerState;
    nowMs: number;
    thresholds: Record<MediaPipeSupportedEventType, MediaPipeThresholdResolution>;
}): EvaluateMediaPipeSignalDispatchResult {
    return evaluateMediaPipeSignalDispatch({
        currentSignal: args.currentSignal,
        tracker: args.tracker ?? createMediaPipeSignalTrackerState(),
        nowMs: args.nowMs,
        thresholds: args.thresholds,
    });
}
