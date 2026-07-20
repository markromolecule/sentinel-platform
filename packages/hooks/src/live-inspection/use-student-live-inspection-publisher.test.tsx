import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useStudentLiveInspectionPublisher } from './use-student-live-inspection-publisher';

const {
    mockDirective,
    mockPublisherConnection,
    mockPublisherReady,
    mockPublisherFailure,
    mockConnect,
    mockPublishTrack,
    mockUnpublishTrack,
    mockDisconnect,
} = vi.hoisted(() => ({
    mockDirective: vi.fn(),
    mockPublisherConnection: vi.fn(),
    mockPublisherReady: vi.fn(),
    mockPublisherFailure: vi.fn(),
    mockConnect: vi.fn(),
    mockPublishTrack: vi.fn(),
    mockUnpublishTrack: vi.fn(),
    mockDisconnect: vi.fn(),
}));

vi.mock('@sentinel/services', () => ({
    getStudentLiveInspectionDirective: mockDirective,
    createLiveInspectionPublisherConnection: mockPublisherConnection,
    acknowledgeLiveInspectionPublisherReady: mockPublisherReady,
    acknowledgeLiveInspectionPublisherFailure: mockPublisherFailure,
}));

vi.mock('livekit-client', () => ({
    Track: {
        Source: {
            Camera: 'camera',
        },
    },
    Room: vi.fn().mockImplementation(function Room(options) {
        return {
            options,
            connect: mockConnect,
            disconnect: mockDisconnect,
            localParticipant: {
                publishTrack: mockPublishTrack,
                unpublishTrack: mockUnpublishTrack,
            },
        };
    }),
}));

const attemptId = '22222222-2222-4222-8222-222222222222';
const leaseId = '11111111-1111-4111-8111-111111111111';

function createDirective(revision: number, state = 'REQUESTED', directiveLeaseId = leaseId) {
    return {
        leaseId: directiveLeaseId,
        revision,
        state,
        attemptId,
        topic: `exam-attempt:${attemptId}:live-inspection`,
    };
}

function createSupabase() {
    const channel = {
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnThis(),
    };
    return {
        channel,
        supabase: {
            auth: {} as never,
            channel: vi.fn(() => channel),
            removeChannel: vi.fn(),
        } as never,
    };
}

function createLiveTrack() {
    let cloneReadyState: MediaStreamTrack['readyState'] = 'live';
    const clone = {
        get readyState() {
            return cloneReadyState;
        },
        stop: vi.fn(() => {
            cloneReadyState = 'ended';
        }),
    } as unknown as MediaStreamTrack & { stop: ReturnType<typeof vi.fn> };
    const original = {
        readyState: 'live',
        clone: vi.fn(() => clone),
        stop: vi.fn(),
    } as unknown as MediaStreamTrack & {
        clone: ReturnType<typeof vi.fn>;
        stop: ReturnType<typeof vi.fn>;
    };

    return { original, clone };
}

describe('useStudentLiveInspectionPublisher', () => {
    beforeEach(() => {
        mockDirective.mockReset();
        mockPublisherConnection.mockReset();
        mockPublisherReady.mockReset();
        mockPublisherFailure.mockReset();
        mockConnect.mockReset();
        mockPublishTrack.mockReset();
        mockUnpublishTrack.mockReset();
        mockDisconnect.mockReset();
        mockPublisherReady.mockResolvedValue({ leaseId, revision: 2, state: 'PUBLISHER_READY' });
        mockPublisherFailure.mockResolvedValue({ leaseId, revision: 1, state: 'FAILED' });
        mockConnect.mockResolvedValue(undefined);
        mockPublishTrack.mockResolvedValue(undefined);
        mockPublisherConnection.mockResolvedValue({
            leaseId,
            revision: 2,
            roomName: 'room-1',
            token: 'token',
            liveKitUrl: 'wss://sentinel-test.livekit.cloud',
            participantIdentity: 'publisher-1',
            expiresAt: '2026-07-20T00:00:00.000Z',
        });
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it('subscribes to the private canonical attempt topic and reconciles through the API', async () => {
        const { supabase, channel } = createSupabase();
        const { original } = createLiveTrack();
        mockDirective.mockResolvedValue(createDirective(1));

        renderHook(() =>
            useStudentLiveInspectionPublisher({
                supabase,
                apiClient: vi.fn() as never,
                sessionId: 'session-1',
                attemptId,
                enabled: true,
                getLiveVideoTrack: () => original,
            }),
        );

        await waitFor(() =>
            expect(mockDirective).toHaveBeenCalledWith(expect.anything(), {
                sessionId: 'session-1',
            }),
        );

        expect((supabase as any).channel).toHaveBeenCalledWith(
            `exam-attempt:${attemptId}:live-inspection`,
            { config: { private: true } },
        );
        expect(channel.on).toHaveBeenCalledWith(
            'broadcast',
            { event: 'LIVE_INSPECTION_CHANGED' },
            expect.any(Function),
        );
    });

    it('publishes a cloned camera track without microphone or browser capture calls', async () => {
        const { supabase } = createSupabase();
        const { original, clone } = createLiveTrack();
        mockDirective.mockResolvedValue(createDirective(1));

        const { result } = renderHook(() =>
            useStudentLiveInspectionPublisher({
                supabase,
                apiClient: vi.fn() as never,
                sessionId: 'session-1',
                attemptId,
                enabled: true,
                getLiveVideoTrack: () => original,
            }),
        );

        await waitFor(() => expect(result.current.isLive).toBe(true));

        expect(original.clone).toHaveBeenCalledTimes(1);
        expect(original.stop).not.toHaveBeenCalled();
        expect(mockConnect).toHaveBeenCalledWith('wss://sentinel-test.livekit.cloud', 'token', {
            autoSubscribe: false,
        });
        expect(mockPublishTrack).toHaveBeenCalledWith(
            clone,
            expect.objectContaining({
                source: 'camera',
                stopLocalTrackOnUnpublish: false,
            }),
        );
        expect(String(useStudentLiveInspectionPublisher)).not.toContain('getUserMedia');
        expect(String(useStudentLiveInspectionPublisher)).not.toContain('setMicrophoneEnabled');
        expect(String(useStudentLiveInspectionPublisher)).not.toContain(
            'enableCameraAndMicrophone',
        );
        expect(String(useStudentLiveInspectionPublisher)).not.toContain('createLocalTracks');
    });

    it('registers missed-event recovery while the attempt page is mounted', async () => {
        const { supabase } = createSupabase();
        const { original } = createLiveTrack();
        let intervalCallback: (() => void) | null = null;
        const setIntervalSpy = vi
            .spyOn(window, 'setInterval')
            .mockImplementation((callback: TimerHandler) => {
                intervalCallback = callback as () => void;
                return 1;
            });
        vi.spyOn(window, 'clearInterval').mockImplementation(() => undefined);
        Object.defineProperty(document, 'visibilityState', {
            configurable: true,
            value: 'visible',
        });
        mockDirective
            .mockResolvedValueOnce(
                createDirective(1, 'ENDED', '33333333-3333-4333-8333-333333333333'),
            )
            .mockResolvedValue(createDirective(2));

        renderHook(() =>
            useStudentLiveInspectionPublisher({
                supabase,
                apiClient: vi.fn() as never,
                sessionId: 'session-1',
                attemptId,
                enabled: true,
                getLiveVideoTrack: () => original,
            }),
        );

        await waitFor(() => expect(mockDirective).toHaveBeenCalledTimes(1));
        await waitFor(() => expect(setIntervalSpy).toHaveBeenCalled());
        expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 10_000);
        expect(intervalCallback).toEqual(expect.any(Function));
    });

    it('keeps missed-event recovery active when the attempt page is hidden', async () => {
        const { supabase } = createSupabase();
        const { original } = createLiveTrack();
        vi.useFakeTimers();
        Object.defineProperty(document, 'visibilityState', {
            configurable: true,
            value: 'hidden',
        });
        mockDirective
            .mockRejectedValueOnce(new Error('missed'))
            .mockResolvedValue(createDirective(1));

        renderHook(() =>
            useStudentLiveInspectionPublisher({
                supabase,
                apiClient: vi.fn() as never,
                sessionId: 'session-1',
                attemptId,
                enabled: true,
                getLiveVideoTrack: () => original,
            }),
        );

        await act(async () => {
            await Promise.resolve();
        });
        expect(mockDirective).toHaveBeenCalledTimes(1);

        await act(async () => {
            await vi.advanceTimersByTimeAsync(10_000);
        });

        expect(mockDirective.mock.calls.length).toBeGreaterThan(1);
    });

    it('cleans up only the clone when unmounted', async () => {
        const { supabase } = createSupabase();
        const { original, clone } = createLiveTrack();
        mockDirective.mockResolvedValue(createDirective(1));

        const { unmount, result } = renderHook(() =>
            useStudentLiveInspectionPublisher({
                supabase,
                apiClient: vi.fn() as never,
                sessionId: 'session-1',
                attemptId,
                enabled: true,
                getLiveVideoTrack: () => original,
            }),
        );

        await waitFor(() => expect(result.current.isLive).toBe(true));
        unmount();

        expect(mockUnpublishTrack).toHaveBeenCalledWith(clone, false);
        expect(mockDisconnect).toHaveBeenCalled();
        expect(clone.stop).toHaveBeenCalledTimes(1);
        expect(original.stop).not.toHaveBeenCalled();
        expect((supabase as any).removeChannel).toHaveBeenCalled();
    });
});
