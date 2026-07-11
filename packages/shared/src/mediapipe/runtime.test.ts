import { describe, expect, it } from 'vitest';
import {
    createMediaPipeSignalTrackerState,
    evaluateMediaPipeSignalDispatch,
    resolveMediaPipeThresholds,
} from './runtime';

const thresholds = resolveMediaPipeThresholds({
    sandbox: {
        enabled: true,
        captureDuringCheckup: true,
        emitDuringExam: true,
        confidenceThreshold: 0.6,
        frameIntervalMs: 500,
        offScreenDurationMs: 1000,
        calibrationRequired: false,
        debugOverlayEnabled: false,
    },
});

describe('evaluateMediaPipeSignalDispatch', () => {
    it('emits once the active signal reaches the duration threshold', () => {
        let tracker = createMediaPipeSignalTrackerState();

        tracker = evaluateMediaPipeSignalDispatch({
            currentSignal: 'GAZE_OFF_SCREEN',
            tracker,
            nowMs: 500,
            thresholds,
            signalGapGraceMs: 500,
        }).tracker;

        const dispatch = evaluateMediaPipeSignalDispatch({
            currentSignal: 'GAZE_OFF_SCREEN',
            tracker,
            nowMs: 1500,
            thresholds,
            signalGapGraceMs: 500,
        });

        expect(dispatch.shouldEmit).toBe(true);
        expect(dispatch.durationMs).toBe(1000);
        expect(dispatch.aggregation).toMatchObject({
            trigger: 'duration-threshold',
            threshold: 1000,
        });
    });

    it('preserves a sustained signal across a one-frame interruption inside the grace window', () => {
        let tracker = evaluateMediaPipeSignalDispatch({
            currentSignal: 'GAZE_OFF_SCREEN',
            tracker: createMediaPipeSignalTrackerState(),
            nowMs: 500,
            thresholds,
            signalGapGraceMs: 500,
        }).tracker;

        tracker = evaluateMediaPipeSignalDispatch({
            currentSignal: null,
            tracker,
            nowMs: 1000,
            thresholds,
            signalGapGraceMs: 500,
        }).tracker;

        const dispatch = evaluateMediaPipeSignalDispatch({
            currentSignal: 'GAZE_OFF_SCREEN',
            tracker,
            nowMs: 1500,
            thresholds,
            signalGapGraceMs: 500,
        });

        expect(dispatch.shouldEmit).toBe(true);
        expect(dispatch.durationMs).toBe(1000);
        expect(dispatch.tracker.activeSinceMs).toBe(500);
    });

    it('resets the tracker after the interruption exceeds the bounded grace window', () => {
        let tracker = evaluateMediaPipeSignalDispatch({
            currentSignal: 'GAZE_OFF_SCREEN',
            tracker: createMediaPipeSignalTrackerState(),
            nowMs: 500,
            thresholds,
            signalGapGraceMs: 500,
        }).tracker;

        tracker = evaluateMediaPipeSignalDispatch({
            currentSignal: null,
            tracker,
            nowMs: 1501,
            thresholds,
            signalGapGraceMs: 500,
        }).tracker;

        expect(tracker).toEqual(createMediaPipeSignalTrackerState());
    });

    it('keeps repeated frames suppressed after the first emission until the signal clears', () => {
        let tracker = evaluateMediaPipeSignalDispatch({
            currentSignal: 'GAZE_OFF_SCREEN',
            tracker: createMediaPipeSignalTrackerState(),
            nowMs: 500,
            thresholds,
            signalGapGraceMs: 500,
        }).tracker;

        tracker = evaluateMediaPipeSignalDispatch({
            currentSignal: 'GAZE_OFF_SCREEN',
            tracker,
            nowMs: 1500,
            thresholds,
            signalGapGraceMs: 500,
        }).tracker;

        const dispatch = evaluateMediaPipeSignalDispatch({
            currentSignal: 'GAZE_OFF_SCREEN',
            tracker,
            nowMs: 2000,
            thresholds,
            signalGapGraceMs: 500,
        });

        expect(dispatch.shouldEmit).toBe(false);
        expect(dispatch.tracker.lastEmittedAtMs).toBe(1500);
    });
});
