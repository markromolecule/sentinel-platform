import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ExamConfig } from '@sentinel/shared';
import { useExamMonitoring } from './use-exam-monitoring';
import { emitWebTelemetryEvent } from '../_lib/web-telemetry-client';

const { mockApiClient, mockToastError, mockToastWarning } = vi.hoisted(() => ({
    mockApiClient: vi.fn(),
    mockToastError: vi.fn(),
    mockToastWarning: vi.fn(),
}));

vi.mock('@sentinel/hooks', () => ({
    useApi: () => mockApiClient,
    useAuth: () => ({
        user: {
            id: '123e4567-e89b-12d3-a456-426614174001',
        },
    }),
}));

vi.mock('sonner', () => ({
    toast: {
        error: mockToastError,
        warning: mockToastWarning,
    },
}));

vi.mock('../_lib/web-telemetry-client', () => ({
    emitWebTelemetryEvent: vi.fn().mockResolvedValue(true),
}));

function createExamConfiguration(overrides: Partial<ExamConfig['webSecurity']> = {}): ExamConfig {
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
            audio_anomaly_detection: true,
            multiple_faces_detection: true,
        },
        webSecurity: {
            tab_switching_monitor: true,
            full_screen_required: true,
            clipboard_control: true,
            right_click_disable: true,
            print_screen_disable: true,
            ...overrides,
        },
        mobileSecurity: {
            app_pinning_required: true,
            prevent_backgrounding: true,
            notification_block: true,
            screenshot_block: true,
            root_jailbreak_detection: true,
        },
    };
}

describe('use-exam-monitoring', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        window.sessionStorage.clear();

        Object.defineProperty(window.navigator, 'userAgent', {
            value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/123.0.0.0 Safari/537.36',
            configurable: true,
        });
        Object.defineProperty(document, 'fullscreenEnabled', {
            value: true,
            configurable: true,
        });
        Object.defineProperty(document, 'fullscreenElement', {
            value: null,
            configurable: true,
        });
        Object.defineProperty(document.documentElement, 'requestFullscreen', {
            value: vi.fn().mockResolvedValue(undefined),
            configurable: true,
        });
    });

    it('locks the exam and emits telemetry when focus is lost', async () => {
        const { result } = renderHook(() =>
            useExamMonitoring({
                configuration: createExamConfiguration(),
                examSessionId: '123e4567-e89b-12d3-a456-426614174000',
                examId: '123e4567-e89b-12d3-a456-426614174999',
            }),
        );

        act(() => {
            window.dispatchEvent(new Event('blur'));
        });

        await waitFor(() => {
            expect(result.current.securityLockReason).toBe('focus-loss');
        });

        expect(emitWebTelemetryEvent).toHaveBeenCalledWith(
            mockApiClient,
            expect.objectContaining({
                eventType: 'TAB_SWITCH',
            }),
        );
    });

    it('flags task-switching shortcuts before the focus-loss lock is raised', async () => {
        const { result } = renderHook(() =>
            useExamMonitoring({
                configuration: createExamConfiguration(),
                examSessionId: '123e4567-e89b-12d3-a456-426614174000',
                examId: '123e4567-e89b-12d3-a456-426614174999',
            }),
        );

        act(() => {
            document.dispatchEvent(
                new KeyboardEvent('keydown', {
                    key: 'Tab',
                    altKey: true,
                }),
            );
            window.dispatchEvent(new Event('blur'));
        });

        await waitFor(() => {
            expect(result.current.securityLockReason).toBe('focus-loss');
        });

        expect(mockToastWarning).toHaveBeenCalledWith(
            'Navigation away from the exam was detected.',
            expect.objectContaining({
                description: expect.stringContaining('task-switching shortcut'),
            }),
        );
    });

    it('does not lock the exam when tab-switch monitoring is disabled', async () => {
        const { result } = renderHook(() =>
            useExamMonitoring({
                configuration: createExamConfiguration({ tab_switching_monitor: false }),
                examSessionId: '123e4567-e89b-12d3-a456-426614174000',
                examId: '123e4567-e89b-12d3-a456-426614174999',
            }),
        );

        act(() => {
            window.dispatchEvent(new Event('blur'));
        });

        await waitFor(() => {
            expect(result.current.securityLockReason).toBeNull();
        });

        expect(emitWebTelemetryEvent).not.toHaveBeenCalled();
    });

    it('locks the exam when fullscreen is exited under required fullscreen mode', async () => {
        const { result } = renderHook(() =>
            useExamMonitoring({
                configuration: createExamConfiguration({ full_screen_required: true }),
                examSessionId: '123e4567-e89b-12d3-a456-426614174000',
                examId: '123e4567-e89b-12d3-a456-426614174999',
            }),
        );

        act(() => {
            document.dispatchEvent(new Event('fullscreenchange'));
        });

        await waitFor(() => {
            expect(result.current.securityLockReason).toBe('fullscreen-exit');
        });

        expect(emitWebTelemetryEvent).toHaveBeenCalledWith(
            mockApiClient,
            expect.objectContaining({
                eventType: 'FULL_SCREEN_EXIT',
            }),
        );
    });
});
