import { cleanup, renderHook, waitFor } from '@testing-library/react';
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
        lobbyAdmissionMode: 'AUTOMATIC',
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
        cleanup();
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

    it('suppresses locks and telemetry after monitoring is suspended for intentional redirect', async () => {
        const { result } = renderHook(() =>
            useExamMonitoring({
                configuration: createExamConfiguration({ full_screen_required: true }),
                examSessionId: '123e4567-e89b-12d3-a456-426614174000',
                examId: '123e4567-e89b-12d3-a456-426614174999',
            }),
        );

        act(() => {
            result.current.suspendSecurityMonitoring();
            document.dispatchEvent(new Event('fullscreenchange'));
        });

        await waitFor(() => {
            expect(result.current.securityLockReason).toBeNull();
        });

        expect(emitWebTelemetryEvent).not.toHaveBeenCalled();
        expect(mockToastWarning).not.toHaveBeenCalled();
    });

    it('blocks clipboard shortcuts and shows the attempt warning immediately', async () => {
        renderHook(() =>
            useExamMonitoring({
                configuration: createExamConfiguration({ clipboard_control: true }),
                examSessionId: '123e4567-e89b-12d3-a456-426614174000',
                examId: '123e4567-e89b-12d3-a456-426614174999',
            }),
        );

        act(() => {
            document.dispatchEvent(
                new KeyboardEvent('keydown', {
                    key: 'c',
                    ctrlKey: true,
                    bubbles: true,
                    cancelable: true,
                }),
            );
        });

        await waitFor(() => {
            expect(emitWebTelemetryEvent).toHaveBeenCalledWith(
                mockApiClient,
                expect.objectContaining({
                    eventType: 'CLIPBOARD_ATTEMPT',
                }),
            );
        });

        expect(mockToastWarning).toHaveBeenCalledWith(
            'Clipboard actions are disabled for this exam.',
        );
    });

    it('deduplicates clipboard shortcut and DOM clipboard events for the same action burst', async () => {
        renderHook(() =>
            useExamMonitoring({
                configuration: createExamConfiguration({ clipboard_control: true }),
                examSessionId: '123e4567-e89b-12d3-a456-426614174000',
                examId: '123e4567-e89b-12d3-a456-426614174999',
            }),
        );

        act(() => {
            document.dispatchEvent(
                new KeyboardEvent('keydown', {
                    key: 'v',
                    ctrlKey: true,
                    bubbles: true,
                    cancelable: true,
                }),
            );
            document.dispatchEvent(
                new Event('paste', {
                    bubbles: true,
                    cancelable: true,
                }),
            );
        });

        await waitFor(() => {
            expect(emitWebTelemetryEvent).toHaveBeenCalledTimes(1);
        });

        expect(mockToastWarning).toHaveBeenCalledTimes(1);
    });

    it('blocks right-click attempts and raises the shared security alert', async () => {
        const { result } = renderHook(() =>
            useExamMonitoring({
                configuration: createExamConfiguration({ right_click_disable: true }),
                examSessionId: '123e4567-e89b-12d3-a456-426614174000',
                examId: '123e4567-e89b-12d3-a456-426614174999',
            }),
        );

        act(() => {
            document.dispatchEvent(
                new MouseEvent('contextmenu', {
                    bubbles: true,
                    cancelable: true,
                }),
            );
        });

        await waitFor(() => {
            expect(result.current.securityLockReason).toBe('right-click');
        });

        expect(emitWebTelemetryEvent).toHaveBeenCalledWith(
            mockApiClient,
            expect.objectContaining({
                eventType: 'RIGHT_CLICK_ATTEMPT',
            }),
        );
    });

    it('does not emit right-click telemetry when right-click blocking is disabled', async () => {
        const { result } = renderHook(() =>
            useExamMonitoring({
                configuration: createExamConfiguration({ right_click_disable: false }),
                examSessionId: '123e4567-e89b-12d3-a456-426614174000',
                examId: '123e4567-e89b-12d3-a456-426614174999',
            }),
        );

        act(() => {
            document.dispatchEvent(
                new MouseEvent('contextmenu', {
                    bubbles: true,
                    cancelable: true,
                }),
            );
        });

        await waitFor(() => {
            expect(result.current.securityLockReason).toBeNull();
        });

        expect(emitWebTelemetryEvent).not.toHaveBeenCalled();
    });

    it('deduplicates repeated right-click attempts in the same burst', async () => {
        renderHook(() =>
            useExamMonitoring({
                configuration: createExamConfiguration({ right_click_disable: true }),
                examSessionId: '123e4567-e89b-12d3-a456-426614174000',
                examId: '123e4567-e89b-12d3-a456-426614174999',
            }),
        );

        act(() => {
            document.dispatchEvent(
                new MouseEvent('contextmenu', {
                    bubbles: true,
                    cancelable: true,
                }),
            );
            document.dispatchEvent(
                new MouseEvent('contextmenu', {
                    bubbles: true,
                    cancelable: true,
                }),
            );
        });

        await waitFor(() => {
            expect(emitWebTelemetryEvent).toHaveBeenCalledTimes(1);
        });
    });

    it('locks the exam and emits telemetry for the PrintScreen key', async () => {
        const { result } = renderHook(() =>
            useExamMonitoring({
                configuration: createExamConfiguration({ print_screen_disable: true }),
                examSessionId: '123e4567-e89b-12d3-a456-426614174000',
                examId: '123e4567-e89b-12d3-a456-426614174999',
            }),
        );

        act(() => {
            document.dispatchEvent(
                new KeyboardEvent('keydown', {
                    key: 'PrintScreen',
                    code: 'PrintScreen',
                    bubbles: true,
                    cancelable: true,
                }),
            );
        });

        await waitFor(() => {
            expect(result.current.securityLockReason).toBe('screen-capture');
        });

        expect(emitWebTelemetryEvent).toHaveBeenCalledWith(
            mockApiClient,
            expect.objectContaining({
                eventType: 'PRINT_SCREEN_ATTEMPT',
            }),
        );
        expect(mockToastWarning).toHaveBeenCalledWith(
            'Screen capture shortcuts are blocked or monitored for this exam.',
            expect.objectContaining({
                description: expect.stringContaining('screen capture tools'),
            }),
        );
    });

    it('locks the exam and emits telemetry for the macOS capture shortcut', async () => {
        const { result } = renderHook(() =>
            useExamMonitoring({
                configuration: createExamConfiguration({ print_screen_disable: true }),
                examSessionId: '123e4567-e89b-12d3-a456-426614174000',
                examId: '123e4567-e89b-12d3-a456-426614174999',
            }),
        );

        act(() => {
            document.dispatchEvent(
                new KeyboardEvent('keydown', {
                    key: '3',
                    metaKey: true,
                    shiftKey: true,
                    bubbles: true,
                    cancelable: true,
                }),
            );
        });

        await waitFor(() => {
            expect(result.current.securityLockReason).toBe('screen-capture');
        });

        expect(emitWebTelemetryEvent).toHaveBeenCalledWith(
            mockApiClient,
            expect.objectContaining({
                eventType: 'PRINT_SCREEN_ATTEMPT',
            }),
        );
    });

    it('locks the exam and emits telemetry for the Windows snipping shortcut', async () => {
        const { result } = renderHook(() =>
            useExamMonitoring({
                configuration: createExamConfiguration({ print_screen_disable: true }),
                examSessionId: '123e4567-e89b-12d3-a456-426614174000',
                examId: '123e4567-e89b-12d3-a456-426614174999',
            }),
        );

        act(() => {
            document.dispatchEvent(
                new KeyboardEvent('keydown', {
                    key: 's',
                    metaKey: true,
                    shiftKey: true,
                    bubbles: true,
                    cancelable: true,
                }),
            );
        });

        await waitFor(() => {
            expect(result.current.securityLockReason).toBe('screen-capture');
        });

        expect(emitWebTelemetryEvent).toHaveBeenCalledWith(
            mockApiClient,
            expect.objectContaining({
                eventType: 'PRINT_SCREEN_ATTEMPT',
            }),
        );
    });

    it('does not emit print-screen telemetry when print-screen blocking is disabled', async () => {
        const { result } = renderHook(() =>
            useExamMonitoring({
                configuration: createExamConfiguration({ print_screen_disable: false }),
                examSessionId: '123e4567-e89b-12d3-a456-426614174000',
                examId: '123e4567-e89b-12d3-a456-426614174999',
            }),
        );

        act(() => {
            document.dispatchEvent(
                new KeyboardEvent('keydown', {
                    key: 'PrintScreen',
                    code: 'PrintScreen',
                    bubbles: true,
                    cancelable: true,
                }),
            );
        });

        await waitFor(() => {
            expect(result.current.securityLockReason).toBeNull();
        });

        expect(emitWebTelemetryEvent).not.toHaveBeenCalled();
    });

    it('deduplicates repeated print-screen events in the same burst', async () => {
        renderHook(() =>
            useExamMonitoring({
                configuration: createExamConfiguration({ print_screen_disable: true }),
                examSessionId: '123e4567-e89b-12d3-a456-426614174000',
                examId: '123e4567-e89b-12d3-a456-426614174999',
            }),
        );

        act(() => {
            document.dispatchEvent(
                new KeyboardEvent('keydown', {
                    key: 'PrintScreen',
                    code: 'PrintScreen',
                    bubbles: true,
                    cancelable: true,
                }),
            );
            document.dispatchEvent(
                new KeyboardEvent('keydown', {
                    key: 'PrintScreen',
                    code: 'PrintScreen',
                    bubbles: true,
                    cancelable: true,
                }),
            );
        });

        await waitFor(() => {
            expect(emitWebTelemetryEvent).toHaveBeenCalledTimes(1);
        });
        expect(mockToastWarning).toHaveBeenCalledTimes(1);
    });

    it('does not emit desktop right-click or print-screen telemetry on mobile', async () => {
        Object.defineProperty(window.navigator, 'userAgent', {
            value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
            configurable: true,
        });

        const { result } = renderHook(() =>
            useExamMonitoring({
                configuration: createExamConfiguration({
                    right_click_disable: true,
                    print_screen_disable: true,
                }),
                examSessionId: '123e4567-e89b-12d3-a456-426614174000',
                examId: '123e4567-e89b-12d3-a456-426614174999',
            }),
        );

        act(() => {
            document.dispatchEvent(
                new MouseEvent('contextmenu', {
                    bubbles: true,
                    cancelable: true,
                }),
            );
            document.dispatchEvent(
                new KeyboardEvent('keydown', {
                    key: 'PrintScreen',
                    code: 'PrintScreen',
                    bubbles: true,
                    cancelable: true,
                }),
            );
        });

        await waitFor(() => {
            expect(result.current.securityLockReason).toBeNull();
        });

        expect(emitWebTelemetryEvent).not.toHaveBeenCalled();
    });

    it('clears the security lock and allows interaction after the student resumes the secured exam', async () => {
        const { result } = renderHook(() =>
            useExamMonitoring({
                configuration: createExamConfiguration({ tab_switching_monitor: true }),
                examSessionId: '123e4567-e89b-12d3-a456-426614174000',
                examId: '123e4567-e89b-12d3-a456-426614174999',
            }),
        );

        // Crucial: resumeSecuredExam returns early if the ref is null.
        // We simulate the element being mounted.
        result.current.fullScreenContainerRef.current = document.createElement('div');

        // Mock requestFullscreen to avoid "not implemented" errors
        result.current.fullScreenContainerRef.current.requestFullscreen = vi
            .fn()
            .mockResolvedValue(undefined);

        act(() => {
            window.dispatchEvent(new Event('blur'));
        });

        await waitFor(() => {
            expect(result.current.securityLockReason).toBe('focus-loss');
        });

        await act(async () => {
            await result.current.resumeSecuredExam();
        });

        await waitFor(() => {
            expect(result.current.securityLockReason).toBeNull();
        });

        expect(result.current.isResumingExam).toBe(false);
    });

    it('does not lock on fullscreen exit when full-screen monitoring is disabled', async () => {
        const { result } = renderHook(() =>
            useExamMonitoring({
                configuration: createExamConfiguration({ full_screen_required: false }),
                examSessionId: '123e4567-e89b-12d3-a456-426614174000',
                examId: '123e4567-e89b-12d3-a456-426614174999',
            }),
        );

        act(() => {
            document.dispatchEvent(new Event('fullscreenchange'));
        });

        await waitFor(() => {
            expect(result.current.securityLockReason).toBeNull();
        });

        expect(emitWebTelemetryEvent).not.toHaveBeenCalled();
    });
});
