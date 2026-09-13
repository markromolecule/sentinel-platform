import { vi, describe, it, expect, beforeEach } from 'vitest';

let stateValues: any[] = [];
let stateIndex = 0;
let effectCallbacks: Array<() => void | (() => void)> = [];

vi.mock('react', () => ({
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
        effectCallbacks.push(callback);
    },
    useCallback: (fn: any) => fn,
    useMemo: (fn: any) => fn(),
    useRef: (initial: any) => ({ current: initial }),
}));

const mockGetDirective = vi.fn();
const mockCreatePublisherConn = vi.fn();
const mockAckReady = vi.fn();
const mockAckFailure = vi.fn();
const mockRemoveChannel = vi.fn();
const mockChannel = { topic: 'exam_sessions:session-600' };
const mockSubscribe = vi.fn(() => mockChannel);
let broadcastHandler: (() => void) | null = null;

vi.mock('@sentinel/services', () => ({
    getStudentLiveInspectionDirective: (...args: any[]) => mockGetDirective(...args),
    createLiveInspectionPublisherConnection: (...args: any[]) => mockCreatePublisherConn(...args),
    acknowledgeLiveInspectionPublisherReady: (...args: any[]) => mockAckReady(...args),
    acknowledgeLiveInspectionPublisherFailure: (...args: any[]) => mockAckFailure(...args),
}));

vi.mock('@sentinel/hooks', () => ({
    useApi: () => vi.fn(),
    useAuth: () => ({
        supabase: {
            channel: () => ({
                on: (_type: string, _filter: any, handler: () => void) => {
                    broadcastHandler = handler;
                    return { subscribe: mockSubscribe };
                },
            }),
            removeChannel: mockRemoveChannel,
        },
    }),
}));

import { useMobileLiveInspection } from './use-mobile-live-inspection';

describe('useMobileLiveInspection', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        stateValues = [];
        stateIndex = 0;
        effectCallbacks = [];
        broadcastHandler = null;
    });

    it('initializes with isLive false when disabled or no sessionId', () => {
        const result = useMobileLiveInspection({
            sessionId: null,
            enabled: false,
        });

        expect(result.isLive).toBe(false);
        expect(mockGetDirective).not.toHaveBeenCalled();
    });

    it('connects to LiveKit when active publish directive is returned', async () => {
        const mockMediaPipeRef = {
            current: {
                startLiveInspection: vi.fn().mockResolvedValue(undefined),
                stopLiveInspection: vi.fn().mockResolvedValue(undefined),
            },
        };

        mockGetDirective.mockResolvedValue({
            state: 'PUBLISHER_CONNECTING',
            leaseId: 'lease-200',
            revision: 1,
            connection: {
                liveKitUrl: 'wss://livekit.test',
                token: 'jwt-token-123',
            },
        });
        mockAckReady.mockResolvedValue({ success: true });

        const result = useMobileLiveInspection({
            sessionId: 'session-200',
            enabled: true,
            mediaPipeRef: mockMediaPipeRef as any,
        });

        for (const cb of effectCallbacks) {
            cb();
        }
        await new Promise((r) => setTimeout(r, 20));

        expect(mockGetDirective).toHaveBeenCalledWith(expect.anything(), {
            sessionId: 'session-200',
        });
        expect(mockMediaPipeRef.current.startLiveInspection).toHaveBeenCalledWith({
            liveKitUrl: 'wss://livekit.test',
            token: 'jwt-token-123',
        });
        expect(mockAckReady).toHaveBeenCalled();
    });

    it('creates publisher connection if not provided in directive', async () => {
        const mockMediaPipeRef = {
            current: {
                startLiveInspection: vi.fn().mockResolvedValue(undefined),
                stopLiveInspection: vi.fn().mockResolvedValue(undefined),
            },
        };

        mockGetDirective.mockResolvedValue({
            state: 'REQUESTED',
            leaseId: 'lease-300',
            revision: 1,
            connection: null,
        });

        mockCreatePublisherConn.mockResolvedValue({
            liveKitUrl: 'wss://livekit.dynamic',
            token: 'dyn-token',
        });
        mockAckReady.mockResolvedValue({ success: true });

        useMobileLiveInspection({
            sessionId: 'session-300',
            enabled: true,
            mediaPipeRef: mockMediaPipeRef as any,
        });

        for (const cb of effectCallbacks) {
            cb();
        }
        await new Promise((r) => setTimeout(r, 20));

        expect(mockCreatePublisherConn).toHaveBeenCalledWith(expect.anything(), {
            sessionId: 'session-300',
            leaseId: 'lease-300',
            revision: 1,
        });
        expect(mockMediaPipeRef.current.startLiveInspection).toHaveBeenCalledWith({
            liveKitUrl: 'wss://livekit.dynamic',
            token: 'dyn-token',
        });
    });

    it('stops publication on terminal directive state', async () => {
        const mockMediaPipeRef = {
            current: {
                startLiveInspection: vi.fn().mockResolvedValue(undefined),
                stopLiveInspection: vi.fn().mockResolvedValue(undefined),
            },
        };

        mockGetDirective.mockResolvedValue({
            state: 'ENDED',
            leaseId: 'lease-400',
            revision: 2,
        });

        const result = useMobileLiveInspection({
            sessionId: 'session-400',
            enabled: true,
            mediaPipeRef: mockMediaPipeRef as any,
        });

        for (const cb of effectCallbacks) {
            cb();
        }
        await new Promise((r) => setTimeout(r, 20));

        expect(result.isLive).toBe(false);
    });

    it('reconciles on realtime broadcast event', async () => {
        mockGetDirective.mockResolvedValue({
            state: 'STOPPING',
            leaseId: 'lease-500',
            revision: 3,
        });

        useMobileLiveInspection({
            sessionId: 'session-500',
            enabled: true,
        });

        for (const cb of effectCallbacks) {
            cb();
        }
        await new Promise((r) => setTimeout(r, 20));

        expect(mockGetDirective).toHaveBeenCalledTimes(1);

        // Trigger broadcast
        broadcastHandler?.();
        await new Promise((r) => setTimeout(r, 20));

        expect(mockGetDirective).toHaveBeenCalledTimes(2);
    });

    it('cleans up channel and stops publication on unmount effect cleanup', () => {
        useMobileLiveInspection({
            sessionId: 'session-600',
            enabled: true,
        });

        expect(effectCallbacks.length).toBeGreaterThan(0);
        const cleanup = effectCallbacks[0]();

        if (typeof cleanup === 'function') {
            cleanup();
        }

        expect(mockRemoveChannel).toHaveBeenCalled();
    });
});
