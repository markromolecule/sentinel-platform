import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ExamConfig } from '@sentinel/shared';
import { useAttemptMediaPipeMonitoring } from './use-attempt-mediapipe-monitoring';

const {
    mockApiClient,
    mockEmitMediaPipeTelemetryEvent,
    mockTrackStop,
    mockFaceLandmarkerClose,
    mockDetectForVideo,
    mockCreateFromOptions,
    mockForVisionTasks,
} = vi.hoisted(() => ({
    mockApiClient: vi.fn(),
    mockEmitMediaPipeTelemetryEvent: vi.fn().mockResolvedValue(true),
    mockTrackStop: vi.fn(),
    mockFaceLandmarkerClose: vi.fn(),
    mockDetectForVideo: vi.fn(() => ({
        faceLandmarks: [],
    })),
    mockCreateFromOptions: vi.fn(),
    mockForVisionTasks: vi.fn(),
}));

vi.mock('@sentinel/hooks', () => ({
    useApi: () => mockApiClient,
    useAuth: () => ({
        user: {
            id: '123e4567-e89b-12d3-a456-426614174001',
        },
    }),
}));

vi.mock('../_lib/web-telemetry-client', () => ({
    emitMediaPipeTelemetryEvent: mockEmitMediaPipeTelemetryEvent,
}));

vi.mock('@mediapipe/tasks-vision', () => ({
    FilesetResolver: {
        forVisionTasks: mockForVisionTasks,
    },
    FaceLandmarker: {
        createFromOptions: mockCreateFromOptions,
    },
}));

function createExamConfiguration(): ExamConfig {
    return {
        maxReconnectAttempts: 3,
        strictMode: true,
        screenLock: true,
        cameraRequired: true,
        micRequired: true,
        autoSubmitTimeoutMinutes: 5,
        aiRules: {
            gaze_tracking: true,
            face_detection: true,
            audio_anomaly_detection: false,
            multiple_faces_detection: true,
        },
        webSecurity: {
            tab_switching_monitor: true,
            full_screen_required: true,
            clipboard_control: true,
            right_click_disable: true,
            print_screen_disable: true,
        },
        mobileSecurity: {
            app_pinning_required: true,
            prevent_backgrounding: true,
            notification_block: true,
            screenshot_block: true,
            root_jailbreak_detection: false,
        },
    };
}

describe('use-attempt-mediapipe-monitoring', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockForVisionTasks.mockResolvedValue({});
        mockCreateFromOptions.mockResolvedValue({
            detectForVideo: mockDetectForVideo,
            close: mockFaceLandmarkerClose,
        });

        Object.defineProperty(window.navigator, 'mediaDevices', {
            value: {
                getUserMedia: vi.fn().mockResolvedValue({
                    getTracks: () => [
                        {
                            stop: mockTrackStop,
                        },
                    ],
                }),
            },
            configurable: true,
        });

        Object.defineProperty(HTMLMediaElement.prototype, 'play', {
            value: vi.fn().mockResolvedValue(undefined),
            configurable: true,
        });

        vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 1);
        vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => undefined);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('starts when attempt MediaPipe is enabled and cleans up the camera runtime on unmount', async () => {
        const { result, unmount } = renderHook(() =>
            useAttemptMediaPipeMonitoring({
                configuration: createExamConfiguration(),
                mediaPipeSandbox: {
                    enabled: true,
                    captureDuringCheckup: true,
                    emitDuringExam: true,
                    confidenceThreshold: 0.8,
                    frameIntervalMs: 500,
                    offScreenDurationMs: 3000,
                    calibrationRequired: false,
                    debugOverlayEnabled: false,
                },
                examSessionId: '123e4567-e89b-12d3-a456-426614174000',
                runtimeAccess: {
                    canStart: true,
                    canResume: false,
                    hasActiveAttempt: true,
                    state: 'active',
                    reasonCode: 'ACTIVE_ATTEMPT',
                    message: 'Attempt active.',
                },
            }),
        );

        await waitFor(() => {
            expect(result.current.phase).toBe('running');
        });

        expect(result.current.isEnabled).toBe(true);
        expect(mockCreateFromOptions).toHaveBeenCalled();

        unmount();

        expect(mockFaceLandmarkerClose).toHaveBeenCalled();
        expect(mockTrackStop).toHaveBeenCalled();
    });

    it('stays idle and avoids camera startup when attempt emission is disabled', async () => {
        const getUserMedia = vi.fn();
        Object.defineProperty(window.navigator, 'mediaDevices', {
            value: {
                getUserMedia,
            },
            configurable: true,
        });

        const { result } = renderHook(() =>
            useAttemptMediaPipeMonitoring({
                configuration: createExamConfiguration(),
                mediaPipeSandbox: {
                    enabled: true,
                    captureDuringCheckup: true,
                    emitDuringExam: false,
                    confidenceThreshold: 0.8,
                    frameIntervalMs: 500,
                    offScreenDurationMs: 3000,
                    calibrationRequired: false,
                    debugOverlayEnabled: false,
                },
                examSessionId: '123e4567-e89b-12d3-a456-426614174000',
                runtimeAccess: {
                    canStart: true,
                    canResume: false,
                    hasActiveAttempt: true,
                    state: 'active',
                    reasonCode: 'ACTIVE_ATTEMPT',
                    message: 'Attempt active.',
                },
            }),
        );

        await waitFor(() => {
            expect(result.current.phase).toBe('idle');
        });

        expect(result.current.isEnabled).toBe(false);
        expect(getUserMedia).not.toHaveBeenCalled();
        expect(mockEmitMediaPipeTelemetryEvent).not.toHaveBeenCalled();
    });
});
