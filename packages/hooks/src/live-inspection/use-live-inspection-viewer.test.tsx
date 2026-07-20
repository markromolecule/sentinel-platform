import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiProvider, useLiveInspectionViewer } from '..';

const {
    mockStart,
    mockStatus,
    mockCredentials,
    mockStop,
    mockConnect,
    mockDisconnect,
    mockOn,
    mockAttach,
    mockDetach,
} = vi.hoisted(() => ({
    mockStart: vi.fn(),
    mockStatus: vi.fn(),
    mockCredentials: vi.fn(),
    mockStop: vi.fn(),
    mockConnect: vi.fn(),
    mockDisconnect: vi.fn(),
    mockOn: vi.fn(),
    mockAttach: vi.fn(),
    mockDetach: vi.fn(),
}));

vi.mock('@sentinel/services', () => ({
    startLiveInspection: mockStart,
    getLiveInspectionStatus: mockStatus,
    createLiveInspectionViewerConnection: mockCredentials,
    stopLiveInspection: mockStop,
}));

vi.mock('livekit-client', () => ({
    Track: {
        Source: {
            Camera: 'camera',
            ScreenShare: 'screen_share',
            ScreenShareAudio: 'screen_share_audio',
        },
    },
    RoomEvent: {
        TrackSubscribed: 'trackSubscribed',
        Reconnecting: 'reconnecting',
        Reconnected: 'reconnected',
        ConnectionQualityChanged: 'connectionQualityChanged',
    },
    Room: vi.fn().mockImplementation(function Room(options) {
        return {
            options,
            on: mockOn,
            connect: mockConnect,
            disconnect: mockDisconnect,
        };
    }),
}));

const lease = {
    leaseId: '11111111-1111-4111-8111-111111111111',
    attemptId: '22222222-2222-4222-8222-222222222222',
    studentUserId: '33333333-3333-4333-8333-333333333333',
    viewerUserId: '44444444-4444-4444-8444-444444444444',
    state: 'REQUESTED',
    revision: 1,
    requestedAt: '2026-07-20T00:00:00.000Z',
    expiresAt: '2026-07-20T00:05:00.000Z',
    startedAt: null,
    endedAt: null,
    endReason: null,
    lastErrorCode: null,
};

function wrapper({ children }: { children: ReactNode }) {
    return <ApiProvider apiClient={vi.fn() as never}>{children}</ApiProvider>;
}

describe('useLiveInspectionViewer', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockConnect.mockResolvedValue(undefined);
        mockStop.mockResolvedValue(undefined);
        mockStart.mockResolvedValue(lease);
        mockStatus.mockResolvedValue({ ...lease, state: 'PUBLISHER_READY', revision: 2 });
        mockCredentials.mockResolvedValue({
            leaseId: lease.leaseId,
            revision: 2,
            roomName: 'room-1',
            token: 'viewer-token',
            liveKitUrl: 'wss://sentinel-test.livekit.cloud',
            participantIdentity: 'viewer-1',
            expiresAt: '2026-07-20T00:05:00.000Z',
        });
        mockOn.mockReturnThis();
    });

    afterEach(() => {
        cleanup();
    });

    it('starts explicitly, waits for publisher readiness, and connects without exposing tokens', async () => {
        const { result } = renderHook(
            () =>
                useLiveInspectionViewer({
                    examId: 'exam-1',
                    studentId: 'student-1',
                    attemptId: lease.attemptId,
                    enabled: true,
                }),
            { wrapper },
        );

        await act(async () => {
            await result.current.start();
        });

        await waitFor(() => expect(mockCredentials).toHaveBeenCalled());
        expect(mockStart).toHaveBeenCalledWith(expect.anything(), {
            examId: 'exam-1',
            attemptId: lease.attemptId,
        });
        expect(mockConnect).toHaveBeenCalledWith(
            'wss://sentinel-test.livekit.cloud',
            'viewer-token',
            {
                autoSubscribe: false,
            },
        );
        expect(JSON.stringify(result.current).toLowerCase()).not.toContain('viewer-token');
    });

    it('does not enter live until the expected camera track is attached and playable', async () => {
        const video = document.createElement('video');
        const { result } = renderHook(
            () =>
                useLiveInspectionViewer({
                    examId: 'exam-1',
                    studentId: 'student-1',
                    attemptId: lease.attemptId,
                    enabled: true,
                }),
            { wrapper },
        );

        act(() => result.current.setVideoRef(video));
        await act(async () => {
            await result.current.start();
        });

        expect(result.current.state).toBe('connecting');
        const subscribedHandler = mockOn.mock.calls.find(
            ([event]) => event === 'trackSubscribed',
        )?.[1];
        act(() => {
            subscribedHandler?.(
                { kind: 'video', attach: mockAttach, detach: mockDetach },
                { source: 'camera', kind: 'video' },
                { identity: 'publisher-1' },
            );
        });

        expect(mockAttach).toHaveBeenCalledWith(video);
        expect(result.current.state).toBe('connecting');

        act(() => {
            video.dispatchEvent(new Event('playing'));
        });

        expect(result.current.state).toBe('live');
    });

    it('rejects audio/screen-share tracks and never shows false LIVE', async () => {
        const video = document.createElement('video');
        const { result } = renderHook(
            () =>
                useLiveInspectionViewer({
                    examId: 'exam-1',
                    studentId: 'student-1',
                    attemptId: lease.attemptId,
                    enabled: true,
                }),
            { wrapper },
        );

        act(() => result.current.setVideoRef(video));
        await act(async () => {
            await result.current.start();
        });

        const subscribedHandler = mockOn.mock.calls.find(
            ([event]) => event === 'trackSubscribed',
        )?.[1];
        act(() => {
            subscribedHandler?.(
                { kind: 'audio', attach: mockAttach, detach: mockDetach },
                { source: 'microphone', kind: 'audio' },
                { identity: 'publisher-1' },
            );
        });

        expect(result.current.state).not.toBe('live');
        expect(result.current.reason).toBe('UNEXPECTED_TRACK');
        expect(mockAttach).not.toHaveBeenCalled();
    });

    it('stops idempotently and disconnects on unmount', async () => {
        const { result, unmount } = renderHook(
            () =>
                useLiveInspectionViewer({
                    examId: 'exam-1',
                    studentId: 'student-1',
                    attemptId: lease.attemptId,
                    enabled: true,
                }),
            { wrapper },
        );

        await act(async () => {
            await result.current.start();
            await result.current.stop();
            await result.current.stop();
        });

        expect(mockStop).toHaveBeenCalledWith(expect.anything(), {
            examId: 'exam-1',
            leaseId: lease.leaseId,
        });
        expect(mockDisconnect).toHaveBeenCalled();

        unmount();
        expect(mockDisconnect).toHaveBeenCalled();
    });

    it('maps conflicts to a safe bounded reason', async () => {
        mockStart.mockRejectedValueOnce(new Error('409 already active'));
        const { result } = renderHook(
            () =>
                useLiveInspectionViewer({
                    examId: 'exam-1',
                    studentId: 'student-1',
                    attemptId: lease.attemptId,
                    enabled: true,
                }),
            { wrapper },
        );

        await act(async () => {
            await result.current.start();
        });

        expect(result.current.state).toBe('failed');
        expect(result.current.reason).toBe('CONFLICT');
        expect(JSON.stringify(result.current).toLowerCase()).not.toContain('token');
    });
});
