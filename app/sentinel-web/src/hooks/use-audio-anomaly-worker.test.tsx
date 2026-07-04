import { cleanup, renderHook, waitFor, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAudioAnomalyWorker } from './use-audio-anomaly-worker';
import { ingestTelemetryEvent } from '@sentinel/services';
import type { ExamConfig } from '@sentinel/shared';

const { mockApiClient, mockAuth } = vi.hoisted(() => ({
    mockApiClient: vi.fn(),
    mockAuth: { user: { id: 'student-1' } },
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
        warning: vi.fn(),
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

    beforeEach(() => {
        cleanup();
        vi.clearAllMocks();

        mockWorker = new MockWorker();

        mockStream = {
            getTracks: () => [{ stop: vi.fn() }],
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

        console.log('MOCKWORKER ONMESSAGE:', mockWorker.onmessage);
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
});
