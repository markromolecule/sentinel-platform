import { cleanup, renderHook, waitFor, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAudioAnomalyWorker } from './use-audio-anomaly-worker';
import { ingestTelemetryEvent } from '@sentinel/services';
import type { ExamConfig } from '@sentinel/shared';

const { mockApiClient, mockAuth, mockToastWarning } = vi.hoisted(() => ({
    mockApiClient: vi.fn(),
    mockAuth: { user: { id: 'student-1' } },
    mockToastWarning: vi.fn(),
}));

vi.mock('@sentinel/hooks', () => ({
    useApi: () => mockApiClient,
    useAuth: () => mockAuth,
}));

vi.mock('@sentinel/services', () => ({
    ingestTelemetryEvent: vi.fn().mockResolvedValue({}),
}));

vi.mock('sonner', () => ({
    toast: {
        warning: mockToastWarning,
        error: vi.fn(),
    },
}));

// Mock audio worker class
class MockWorker implements Partial<Worker> {
    onmessage: ((this: Worker, ev: MessageEvent) => any) | null = null;
    postMessage = vi.fn();
    addEventListener(type: string, handler: any) {
        if (type === 'message') {
            this.onmessage = handler;
        }
    }
    removeEventListener = vi.fn();
    terminate = vi.fn();
}

describe('useAudioAnomalyWorker', () => {
    let mockWorker: MockWorker;
    let mockAudioContext: any;
    let mockStream: any;
    let mockTrackStop: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        cleanup();
        vi.clearAllMocks();

        mockWorker = new MockWorker();
        mockTrackStop = vi.fn();

        mockStream = {
            getTracks: () => [{ stop: mockTrackStop }],
        };

        mockAudioContext = {
            close: vi.fn().mockResolvedValue(undefined),
            createMediaStreamSource: vi.fn().mockReturnValue({
                connect: vi.fn(),
                disconnect: vi.fn(),
            }),
            createScriptProcessor: vi.fn().mockReturnValue({
                connect: vi.fn(),
                disconnect: vi.fn(),
                onaudioprocess: null,
            }),
            destination: {},
        };

        // Mock global AudioContext
        global.AudioContext = vi.fn().mockImplementation(function (this: any) {
            return mockAudioContext;
        }) as any;

        // Mock navigator mediaDevices
        Object.defineProperty(global.navigator, 'mediaDevices', {
            value: {
                getUserMedia: vi.fn().mockResolvedValue(mockStream),
            },
            writable: true,
            configurable: true,
        });
    });

    const validConfig: ExamConfig = {
        micRequired: true,
        aiRules: {
            audio_anomaly_detection: true,
        },
    } as any;

    it('initializes and triggers telemetry on ANOMALY_DETECTED', async () => {
        const { result } = renderHook(() =>
            useAudioAnomalyWorker({
                configuration: validConfig,
                examSessionId: 'session-123',
                isSuspended: false,
                worker: mockWorker as any,
            }),
        );

        // Expect phase to become initializing
        expect(result.current.isEnabled).toBe(true);

        await waitFor(() => {
            expect(mockWorker.postMessage).toHaveBeenCalledWith({
                type: 'INIT',
                payload: expect.objectContaining({
                    config: expect.any(Object),
                }),
            });
        });
        // Simulate INIT_SUCCESS from worker
        act(() => {
            if (mockWorker.onmessage) {
                mockWorker.onmessage({
                    data: { type: 'INIT_SUCCESS' },
                } as MessageEvent);
            }
        });

        await waitFor(() => {
            expect(result.current.phase).toBe('running');
        });

        // Simulate ANOMALY_DETECTED
        act(() => {
            mockWorker.onmessage!({
                data: {
                    type: 'ANOMALY_DETECTED',
                    payload: {
                        anomalies: {
                            TALKING: 0.85,
                        },
                    },
                },
            } as MessageEvent);
        });

        await waitFor(() => {
            expect(ingestTelemetryEvent).toHaveBeenCalledWith(
                expect.any(Function),
                expect.objectContaining({
                    examSessionId: 'session-123',
                    studentId: 'student-1',
                    eventType: 'AUDIO_ANOMALY',
                    metadata: expect.objectContaining({
                        anomalyType: 'TALKING',
                        confidenceScore: 0.85,
                    }),
                }),
            );
        });
    });

    it('suppresses emissions when isSuspended is true', async () => {
        const { result } = renderHook(() =>
            useAudioAnomalyWorker({
                configuration: validConfig,
                examSessionId: 'session-123',
                isSuspended: true,
                worker: mockWorker as any,
            }),
        );

        expect(result.current.isEnabled).toBe(false);
        expect(result.current.phase).toBe('idle');
        expect(mockWorker.postMessage).not.toHaveBeenCalled();
    });

    it('shows one warning and emits one telemetry event for one accepted anomaly', async () => {
        renderHook(() =>
            useAudioAnomalyWorker({
                configuration: validConfig,
                examSessionId: 'session-123',
                isSuspended: false,
                worker: mockWorker as any,
            }),
        );

        await waitFor(() => {
            expect(mockWorker.postMessage).toHaveBeenCalledWith({
                type: 'INIT',
                payload: expect.objectContaining({
                    config: expect.any(Object),
                }),
            });
        });

        act(() => {
            mockWorker.onmessage?.({
                data: { type: 'INIT_SUCCESS' },
            } as MessageEvent);
        });

        act(() => {
            mockWorker.onmessage?.({
                data: {
                    type: 'ANOMALY_DETECTED',
                    payload: {
                        anomalies: {
                            TALKING: 0.91,
                        },
                    },
                },
            } as MessageEvent);
        });

        await waitFor(() => {
            expect(ingestTelemetryEvent).toHaveBeenCalledTimes(1);
        });

        expect(mockToastWarning).toHaveBeenCalledTimes(1);
        expect(mockToastWarning).toHaveBeenCalledWith(
            'Audio Anomaly Detected',
            expect.objectContaining({
                description: expect.stringContaining('talking'),
            }),
        );
    });

    it('stops anomaly emission after the hook is rerendered into a suspended state', async () => {
        const { rerender } = renderHook(
            ({ isSuspended }) =>
                useAudioAnomalyWorker({
                    configuration: validConfig,
                    examSessionId: 'session-123',
                    isSuspended,
                    worker: mockWorker as any,
                }),
            {
                initialProps: {
                    isSuspended: false,
                },
            },
        );

        await waitFor(() => {
            expect(mockWorker.postMessage).toHaveBeenCalledWith({
                type: 'INIT',
                payload: expect.objectContaining({
                    config: expect.any(Object),
                }),
            });
        });

        act(() => {
            mockWorker.onmessage?.({
                data: { type: 'INIT_SUCCESS' },
            } as MessageEvent);
        });

        rerender({
            isSuspended: true,
        });

        act(() => {
            mockWorker.onmessage?.({
                data: {
                    type: 'ANOMALY_DETECTED',
                    payload: {
                        anomalies: {
                            TALKING: 0.72,
                        },
                    },
                },
            } as MessageEvent);
        });

        await waitFor(() => {
            expect(ingestTelemetryEvent).not.toHaveBeenCalled();
        });

        expect(mockToastWarning).not.toHaveBeenCalled();
    });

    it('does not stop a provided checkup audio stream during cleanup', async () => {
        const { unmount } = renderHook(() =>
            useAudioAnomalyWorker({
                configuration: validConfig,
                examSessionId: 'session-123',
                isSuspended: false,
                audioStream: mockStream as MediaStream,
                worker: mockWorker as any,
            }),
        );

        await waitFor(() => {
            expect(mockWorker.postMessage).toHaveBeenCalledWith({
                type: 'INIT',
                payload: expect.objectContaining({
                    config: expect.any(Object),
                }),
            });
        });

        unmount();

        expect(mockTrackStop).not.toHaveBeenCalled();
    });

    it('stops a microphone stream opened by the hook during cleanup', async () => {
        const { unmount } = renderHook(() =>
            useAudioAnomalyWorker({
                configuration: validConfig,
                examSessionId: 'session-123',
                isSuspended: false,
                worker: mockWorker as any,
            }),
        );

        await waitFor(() => {
            expect(mockWorker.postMessage).toHaveBeenCalledWith({
                type: 'INIT',
                payload: expect.objectContaining({
                    config: expect.any(Object),
                }),
            });
        });

        unmount();

        expect(mockTrackStop).toHaveBeenCalledTimes(1);
    });
});
