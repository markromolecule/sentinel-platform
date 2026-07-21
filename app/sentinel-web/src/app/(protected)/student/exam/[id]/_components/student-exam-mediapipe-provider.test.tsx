'use client';

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    StudentExamMediaPipeProvider,
    useStudentExamMediaPipeStream,
} from './student-exam-mediapipe-provider';

function Probe() {
    const { requestDeviceAccess, getLiveVideoTrack } = useStudentExamMediaPipeStream();

    return (
        <div>
            <button
                type="button"
                onClick={() =>
                    void requestDeviceAccess({
                        cameraRequired: true,
                    } as never)
                }
            >
                request
            </button>
            <output data-testid="track-state">{getLiveVideoTrack()?.readyState ?? 'none'}</output>
        </div>
    );
}

describe('StudentExamMediaPipeProvider live track accessor', () => {
    const getUserMedia = vi.fn();

    beforeEach(() => {
        Object.defineProperty(navigator, 'mediaDevices', {
            configurable: true,
            value: { getUserMedia },
        });
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('returns the current live video track without issuing an extra capture request', async () => {
        const track = {
            readyState: 'live',
            stop: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        };
        const stream = {
            getTracks: () => [track],
            getVideoTracks: () => [track],
        };
        getUserMedia.mockResolvedValue(stream);

        render(
            <StudentExamMediaPipeProvider>
                <Probe />
            </StudentExamMediaPipeProvider>,
        );

        fireEvent.click(screen.getByRole('button', { name: /request/i }));

        await waitFor(() => expect(screen.getByTestId('track-state').textContent).toBe('live'));
        expect(getUserMedia).toHaveBeenCalledTimes(1);
    });

    it('returns null after the original track has ended', async () => {
        let endedHandler: (() => void) | null = null;
        const track = {
            readyState: 'live',
            stop: vi.fn(),
            addEventListener: vi.fn((_event: string, handler: () => void) => {
                endedHandler = handler;
            }),
            removeEventListener: vi.fn(),
        };
        const stream = {
            getTracks: () => [track],
            getVideoTracks: () => [track],
        };
        getUserMedia.mockResolvedValue(stream);

        render(
            <StudentExamMediaPipeProvider>
                <Probe />
            </StudentExamMediaPipeProvider>,
        );

        fireEvent.click(screen.getByRole('button', { name: /request/i }));
        await waitFor(() => expect(screen.getByTestId('track-state').textContent).toBe('live'));

        act(() => actTrackEnded(track, endedHandler));

        await waitFor(() => expect(screen.getByTestId('track-state').textContent).toBe('none'));
        expect(getUserMedia).toHaveBeenCalledTimes(1);
    });

    it('evaluates separate camera and landmarker readiness', async () => {
        let apiSnapshot: ReturnType<typeof useStudentExamMediaPipeStream> | null = null;

        function ReadinessProbe() {
            const api = useStudentExamMediaPipeStream();
            apiSnapshot = api;
            return null;
        }

        render(
            <StudentExamMediaPipeProvider>
                <ReadinessProbe />
            </StudentExamMediaPipeProvider>,
        );

        await waitFor(() => {
            expect(apiSnapshot?.isCameraReady).toBeDefined();
        });

        // When camera is not required, isCameraReady is true
        expect(apiSnapshot!.isCameraReady({ cameraRequired: false } as any)).toBe(true);

        // When camera is required but no stream active, isCameraReady is false
        expect(apiSnapshot!.isCameraReady({ cameraRequired: true } as any)).toBe(false);

        // When AI rules are false, isLandmarkerReady is true
        expect(
            apiSnapshot!.isLandmarkerReady({
                aiRules: {
                    gaze_tracking: false,
                    face_detection: false,
                    multiple_faces_detection: false,
                },
            } as any),
        ).toBe(true);
    });
});

function actTrackEnded(track: { readyState: string }, handler: (() => void) | null) {
    track.readyState = 'ended';
    handler?.();
}
