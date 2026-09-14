import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as React from 'react';

// Mock react
let stateValues: any[] = [];
let stateIndex = 0;
let effectCleanups: Array<() => void> = [];

vi.mock('react', () => {
    return {
        useState: (initialValue: any) => {
            const currentIndex = stateIndex;
            if (stateValues[currentIndex] === undefined) {
                stateValues[currentIndex] = initialValue;
            }
            const value = stateValues[currentIndex];
            const setValue = (newValue: any) => {
                if (typeof newValue === 'function') {
                    stateValues[currentIndex] = newValue(stateValues[currentIndex]);
                } else {
                    stateValues[currentIndex] = newValue;
                }
            };
            stateIndex++;
            return [value, setValue];
        },
        useEffect: (callback: () => void | (() => void)) => {
            const cleanup = callback();
            if (typeof cleanup === 'function') {
                effectCleanups.push(cleanup);
            }
        },
        useCallback: (fn: any) => fn,
        useMemo: (fn: any) => fn(),
        useRef: (initial: any) => ({ current: initial }),
    };
});

import {
    useMobileProctoringNotice,
    AUDIO_ANOMALY_STUDENT_MESSAGES,
    MEDIAPIPE_STUDENT_MESSAGES,
} from './use-mobile-proctoring-notice';

describe('useMobileProctoringNotice', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        stateValues = [];
        stateIndex = 0;
        effectCleanups = [];
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('initializes with null active notice', () => {
        const { activeNotice } = useMobileProctoringNotice();
        expect(activeNotice).toBeNull();
    });

    it('shows and formats audio anomaly notices correctly', () => {
        const result = useMobileProctoringNotice();

        result.showAudioAnomalyNotice('TALKING');
        expect(stateValues[0]).toEqual(
            expect.objectContaining({
                category: 'audio',
                message: AUDIO_ANOMALY_STUDENT_MESSAGES.TALKING,
            }),
        );

        result.showAudioAnomalyNotice('BACKGROUND_NOISE');
        expect(stateValues[0]).toEqual(
            expect.objectContaining({
                category: 'audio',
                message: AUDIO_ANOMALY_STUDENT_MESSAGES.BACKGROUND_NOISE,
            }),
        );
    });

    it('shows and formats MediaPipe notices correctly', () => {
        const result = useMobileProctoringNotice();

        result.showMediaPipeNotice('GAZE_OFF_SCREEN');
        expect(stateValues[0]).toEqual(
            expect.objectContaining({
                category: 'video',
                message: MEDIAPIPE_STUDENT_MESSAGES.GAZE_OFF_SCREEN,
            }),
        );

        result.showMediaPipeNotice('Multiple faces detected');
        expect(stateValues[0]).toEqual(
            expect.objectContaining({
                category: 'video',
                message: MEDIAPIPE_STUDENT_MESSAGES.MULTIPLE_FACES,
            }),
        );

        result.showMediaPipeNotice('Face not detected');
        expect(stateValues[0]).toEqual(
            expect.objectContaining({
                category: 'video',
                message: MEDIAPIPE_STUDENT_MESSAGES.NO_FACE_DETECTED,
            }),
        );
    });

    it('auto-dismisses active notice after autoDismissMs', () => {
        const result = useMobileProctoringNotice({ autoDismissMs: 5000 });

        result.showAudioAnomalyNotice('TALKING');
        expect(stateValues[0]).not.toBeNull();

        vi.advanceTimersByTime(4999);
        expect(stateValues[0]).not.toBeNull();

        vi.advanceTimersByTime(1);
        expect(stateValues[0]).toBeNull();
    });

    it('dismisses notice immediately when dismissNotice is called', () => {
        const result = useMobileProctoringNotice();

        result.showAudioAnomalyNotice('TALKING');
        expect(stateValues[0]).not.toBeNull();

        result.dismissNotice();
        expect(stateValues[0]).toBeNull();
    });

    it('cleans up dismiss timer on unmount', () => {
        const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
        useMobileProctoringNotice();

        effectCleanups.forEach((cleanup) => cleanup());
        clearTimeoutSpy.mockRestore();
    });
});
