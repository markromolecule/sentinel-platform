import Constants from 'expo-constants';
import { Platform } from 'react-native';
import {
    MOBILE_TELEMETRY_EVENT_TYPES,
    TELEMETRY_EVENT_DEFINITIONS,
    type TelemetryEventType,
} from '@sentinel/shared/schema/telemetry/telemetry-schema';
import type { ExamConfiguration } from '@sentinel/shared/types';

export type MobileTelemetryEventType = (typeof MOBILE_TELEMETRY_EVENT_TYPES)[number];

type MobileTelemetrySessionContext = {
    os?: string;
    deviceType?: 'DESKTOP' | 'TABLET' | 'MOBILE';
    appVersion?: string;
    clientVersion?: string;
    clientCapabilities?: string[];
};

type MobileTelemetryPayload = {
    examSessionId: string;
    studentId: string;
    timestamp: string;
    platform: 'MOBILE';
    source: (typeof TELEMETRY_EVENT_DEFINITIONS)[TelemetryEventType]['source'];
    ruleKey: (typeof TELEMETRY_EVENT_DEFINITIONS)[TelemetryEventType]['ruleKey'];
    eventType: MobileTelemetryEventType;
    sessionContext?: MobileTelemetrySessionContext;
};

type EmitMobileTelemetryEventArgs = {
    configuration?: ExamConfiguration;
    examSessionId: string;
    eventType: MobileTelemetryEventType;
    studentId?: string;
};

type MobileTelemetryRuleEnabledReader = (configuration: ExamConfiguration) => boolean;

const MOBILE_TELEMETRY_RULE_ENABLED_READERS: Record<
    MobileTelemetryEventType,
    MobileTelemetryRuleEnabledReader
> = {
    APP_BACKGROUNDING: (configuration) => configuration.mobileSecurity.prevent_backgrounding,
    SCREENSHOT_ATTEMPT: (configuration) => configuration.mobileSecurity.screenshot_block,
    ROOT_JAILBREAK_DETECTED: (configuration) =>
        configuration.mobileSecurity.root_jailbreak_detection,
    APP_PINNING_VIOLATION: (configuration) => configuration.mobileSecurity.app_pinning_required,
    NOTIFICATION_BLOCK_VIOLATION: (configuration) =>
        configuration.mobileSecurity.notification_block,
};

export function isMobileTelemetryEventEnabled(
    configuration: ExamConfiguration | undefined,
    eventType: MobileTelemetryEventType,
) {
    if (!configuration) {
        return false;
    }

    return MOBILE_TELEMETRY_RULE_ENABLED_READERS[eventType](configuration);
}

export function buildMobileTelemetrySessionContext(
    extraCapabilities: string[] = [],
): MobileTelemetrySessionContext {
    const appVersion =
        Constants.expoConfig?.version ??
        (typeof Constants.nativeAppVersion === 'string' ? Constants.nativeAppVersion : undefined);

    return {
        os: `${Platform.OS} ${String(Platform.Version)}`,
        deviceType: 'MOBILE',
        appVersion,
        clientVersion: appVersion,
        clientCapabilities: ['appstate-monitor', 'notification-blur-monitor', ...extraCapabilities],
    };
}

export function buildMobileTelemetryPayload({
    examSessionId,
    eventType,
    studentId,
}: {
    examSessionId: string;
    eventType: MobileTelemetryEventType;
    studentId: string;
}): MobileTelemetryPayload {
    const eventDefinition = TELEMETRY_EVENT_DEFINITIONS[eventType];

    return {
        examSessionId,
        studentId,
        timestamp: new Date().toISOString(),
        platform: 'MOBILE',
        source: eventDefinition.source,
        ruleKey: eventDefinition.ruleKey,
        eventType,
        sessionContext: buildMobileTelemetrySessionContext(),
    };
}

export async function emitMobileTelemetryEvent({
    configuration,
    examSessionId,
    eventType,
    studentId = process.env.EXPO_PUBLIC_STUDENT_ID?.trim(),
}: EmitMobileTelemetryEventArgs) {
    if (!isMobileTelemetryEventEnabled(configuration, eventType)) {
        return false;
    }

    const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
    const bearerToken = process.env.EXPO_PUBLIC_API_BEARER_TOKEN?.trim();

    if (!apiBaseUrl || !studentId) {
        console.info(
            'Skipping mobile telemetry delivery because the mobile API identity is not configured.',
            {
                eventType,
                hasApiBaseUrl: Boolean(apiBaseUrl),
                hasStudentId: Boolean(studentId),
            },
        );
        return false;
    }

    const payload = buildMobileTelemetryPayload({
        examSessionId,
        eventType,
        studentId,
    });

    const response = await fetch(`${apiBaseUrl}/telemetry/events`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error(`Failed to deliver mobile telemetry event: ${response.status}`);
    }

    return true;
}
