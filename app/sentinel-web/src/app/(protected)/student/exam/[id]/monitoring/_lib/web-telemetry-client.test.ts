import { TELEMETRY_EVENT_DEFINITIONS, type ExamConfig } from '@sentinel/shared';
import type { ApiClientType } from '@sentinel/services';
import { describe, expect, it, vi } from 'vitest';
import {
    buildWebTelemetryPayload,
    emitWebTelemetryEvent,
    isWebTelemetryEventEnabled,
} from './web-telemetry-client';

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

describe('web-telemetry-client', () => {
    it('gates web telemetry by the active configuration rule', () => {
        expect(
            isWebTelemetryEventEnabled(
                createExamConfiguration({ clipboard_control: false }),
                'CLIPBOARD_ATTEMPT',
            ),
        ).toBe(false);

        expect(
            isWebTelemetryEventEnabled(
                createExamConfiguration({ clipboard_control: true }),
                'CLIPBOARD_ATTEMPT',
            ),
        ).toBe(true);
    });

    it('builds shared-contract payloads for web telemetry', () => {
        const payload = buildWebTelemetryPayload({
            examSessionId: '123e4567-e89b-12d3-a456-426614174000',
            studentId: '123e4567-e89b-12d3-a456-426614174001',
            eventType: 'RIGHT_CLICK_ATTEMPT',
            timestamp: '2026-04-14T00:00:00.000Z',
            sessionContext: {
                browser: 'Chrome',
                os: 'macOS',
                deviceType: 'DESKTOP',
                clientCapabilities: ['contextmenu-monitor'],
            },
        });

        expect(payload).toEqual({
            examSessionId: '123e4567-e89b-12d3-a456-426614174000',
            studentId: '123e4567-e89b-12d3-a456-426614174001',
            timestamp: '2026-04-14T00:00:00.000Z',
            eventType: 'RIGHT_CLICK_ATTEMPT',
            platform: 'WEB',
            source: TELEMETRY_EVENT_DEFINITIONS.RIGHT_CLICK_ATTEMPT.source,
            ruleKey: TELEMETRY_EVENT_DEFINITIONS.RIGHT_CLICK_ATTEMPT.ruleKey,
            metadata: undefined,
            sessionContext: {
                browser: 'Chrome',
                os: 'macOS',
                deviceType: 'DESKTOP',
                clientCapabilities: ['contextmenu-monitor'],
            },
        });
    });

    it('skips disabled events and posts enabled ones', async () => {
        const apiClient = vi.fn().mockResolvedValue(undefined) as unknown as ApiClientType;

        const disabledResult = await emitWebTelemetryEvent(apiClient, {
            configuration: createExamConfiguration({ print_screen_disable: false }),
            examSessionId: '123e4567-e89b-12d3-a456-426614174000',
            studentId: '123e4567-e89b-12d3-a456-426614174001',
            eventType: 'PRINT_SCREEN_ATTEMPT',
            timestamp: '2026-04-14T00:00:00.000Z',
            sessionContext: {
                browser: 'Chrome',
                os: 'Windows',
                deviceType: 'DESKTOP',
                clientCapabilities: ['print-screen-monitor'],
            },
        });

        expect(disabledResult).toBe(false);
        expect(apiClient).not.toHaveBeenCalled();

        const enabledResult = await emitWebTelemetryEvent(apiClient, {
            configuration: createExamConfiguration({ print_screen_disable: true }),
            examSessionId: '123e4567-e89b-12d3-a456-426614174000',
            studentId: '123e4567-e89b-12d3-a456-426614174001',
            eventType: 'PRINT_SCREEN_ATTEMPT',
            timestamp: '2026-04-14T00:00:00.000Z',
            sessionContext: {
                browser: 'Chrome',
                os: 'Windows',
                deviceType: 'DESKTOP',
                clientCapabilities: ['print-screen-monitor'],
            },
        });

        expect(enabledResult).toBe(true);
        expect(apiClient).toHaveBeenCalledTimes(1);
        expect(apiClient).toHaveBeenCalledWith(
            '/telemetry/events',
            expect.objectContaining({
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            }),
        );

        expect(JSON.parse(apiClient.mock.calls[0][1].body)).toMatchObject({
            eventType: 'PRINT_SCREEN_ATTEMPT',
            platform: 'WEB',
            source: TELEMETRY_EVENT_DEFINITIONS.PRINT_SCREEN_ATTEMPT.source,
            ruleKey: TELEMETRY_EVENT_DEFINITIONS.PRINT_SCREEN_ATTEMPT.ruleKey,
        });
    });
});
