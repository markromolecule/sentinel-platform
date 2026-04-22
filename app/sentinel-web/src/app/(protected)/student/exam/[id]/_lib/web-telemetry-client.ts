import {
    MEDIAPIPE_SUPPORTED_EVENT_TYPES,
    MOBILE_USER_AGENT_REGEX,
    TELEMETRY_EVENT_DEFINITIONS,
    buildMediaPipeTelemetryPayload,
    getMediaPipeClientCapabilities,
    isMediaPipeRuntimeEnabled,
    WEB_TELEMETRY_EVENT_TYPES,
    type ExamConfig,
} from '@sentinel/shared';
import {
    ingestTelemetryEvent,
    type ApiClientType,
    type IngestTelemetryEventPayload,
    type TelemetryMetadata,
    type TelemetrySessionContext,
} from '@sentinel/services';
import type { TelemetrySettings } from '@sentinel/shared';

export type WebTelemetryEventType = (typeof WEB_TELEMETRY_EVENT_TYPES)[number];
export type MediaPipeTelemetryEventType = (typeof MEDIAPIPE_SUPPORTED_EVENT_TYPES)[number];

type WebTelemetryRuleEnabledReader = (configuration: ExamConfig) => boolean;

const WEB_TELEMETRY_RULE_ENABLED_READERS: Record<
    WebTelemetryEventType,
    WebTelemetryRuleEnabledReader
> = {
    TAB_SWITCH: (configuration) => configuration.webSecurity.tab_switching_monitor,
    FULL_SCREEN_EXIT: (configuration) => configuration.webSecurity.full_screen_required,
    CLIPBOARD_ATTEMPT: (configuration) => configuration.webSecurity.clipboard_control,
    RIGHT_CLICK_ATTEMPT: (configuration) => configuration.webSecurity.right_click_disable,
    PRINT_SCREEN_ATTEMPT: (configuration) => configuration.webSecurity.print_screen_disable,
};

const MEDIAPIPE_TELEMETRY_RULE_ENABLED_READERS: Record<
    MediaPipeTelemetryEventType,
    (configuration: ExamConfig) => boolean
> = {
    GAZE_OFF_SCREEN: (configuration) => configuration.aiRules.gaze_tracking,
    NO_FACE_DETECTED: (configuration) => configuration.aiRules.face_detection,
    MULTIPLE_FACES: (configuration) => configuration.aiRules.multiple_faces_detection,
};

function detectBrowser(userAgent: string) {
    if (userAgent.includes('Edg/')) {
        return 'Edge';
    }

    if (userAgent.includes('Chrome/')) {
        return 'Chrome';
    }

    if (userAgent.includes('Firefox/')) {
        return 'Firefox';
    }

    if (userAgent.includes('Safari/')) {
        return 'Safari';
    }

    return 'Unknown';
}

function detectOperatingSystem(userAgent: string) {
    if (userAgent.includes('Windows')) {
        return 'Windows';
    }

    if (userAgent.includes('Mac OS X')) {
        return 'macOS';
    }

    if (userAgent.includes('Android')) {
        return 'Android';
    }

    if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
        return 'iOS';
    }

    if (userAgent.includes('Linux')) {
        return 'Linux';
    }

    return 'Unknown';
}

function detectDeviceType(userAgent: string): TelemetrySessionContext['deviceType'] {
    if (/iPad|Tablet|Android(?!.*Mobile)/i.test(userAgent)) {
        return 'TABLET';
    }

    if (MOBILE_USER_AGENT_REGEX.test(userAgent)) {
        return 'MOBILE';
    }

    return 'DESKTOP';
}

export function isWebTelemetryEventEnabled(
    configuration: ExamConfig | undefined,
    eventType: WebTelemetryEventType,
) {
    if (!configuration) {
        return false;
    }

    return WEB_TELEMETRY_RULE_ENABLED_READERS[eventType](configuration);
}

export function buildWebTelemetrySessionContext(): TelemetrySessionContext | undefined {
    if (typeof window === 'undefined') {
        return undefined;
    }

    const userAgent = window.navigator.userAgent;

    return {
        browser: detectBrowser(userAgent),
        os: detectOperatingSystem(userAgent),
        deviceType: detectDeviceType(userAgent),
        clientCapabilities: [
            'visibility-monitor',
            'fullscreen-monitor',
            'clipboard-monitor',
            'contextmenu-monitor',
            'print-screen-monitor',
        ],
    };
}

export function buildMediaPipeTelemetrySessionContext(): TelemetrySessionContext | undefined {
    const sessionContext = buildWebTelemetrySessionContext();

    if (!sessionContext) {
        return undefined;
    }

    return {
        ...sessionContext,
        clientCapabilities: Array.from(
            new Set([...(sessionContext.clientCapabilities ?? []), ...getMediaPipeClientCapabilities()]),
        ),
    };
}

type BuildWebTelemetryPayloadArgs = {
    examSessionId: string;
    studentId: string;
    eventType: WebTelemetryEventType;
    timestamp?: string;
    metadata?: TelemetryMetadata;
    sessionContext?: TelemetrySessionContext;
};

export function buildWebTelemetryPayload({
    examSessionId,
    studentId,
    eventType,
    timestamp = new Date().toISOString(),
    metadata,
    sessionContext = buildWebTelemetrySessionContext(),
}: BuildWebTelemetryPayloadArgs): IngestTelemetryEventPayload {
    const eventDefinition = TELEMETRY_EVENT_DEFINITIONS[eventType];

    return {
        examSessionId,
        studentId,
        timestamp,
        eventType,
        platform: 'WEB',
        source: eventDefinition.source,
        ruleKey: eventDefinition.ruleKey,
        metadata,
        sessionContext,
    };
}

type EmitWebTelemetryEventArgs = BuildWebTelemetryPayloadArgs & {
    configuration?: ExamConfig;
};

export async function emitWebTelemetryEvent(
    apiClient: ApiClientType,
    { configuration, ...payloadArgs }: EmitWebTelemetryEventArgs,
) {
    if (!isWebTelemetryEventEnabled(configuration, payloadArgs.eventType)) {
        return false;
    }

    await ingestTelemetryEvent(apiClient, buildWebTelemetryPayload(payloadArgs));
    return true;
}

export function isMediaPipeTelemetryEventEnabled(
    configuration: ExamConfig | undefined,
    eventType: MediaPipeTelemetryEventType,
) {
    if (!configuration) {
        return false;
    }

    return MEDIAPIPE_TELEMETRY_RULE_ENABLED_READERS[eventType](configuration);
}

type BuildMediaPipeTelemetryPayloadArgs = {
    examSessionId: string;
    studentId: string;
    eventType: MediaPipeTelemetryEventType;
    timestamp?: string;
    metadata?: TelemetryMetadata;
    sessionContext?: TelemetrySessionContext;
};

export function buildAttemptMediaPipeTelemetryPayload({
    examSessionId,
    studentId,
    eventType,
    timestamp = new Date().toISOString(),
    metadata,
    sessionContext = buildMediaPipeTelemetrySessionContext(),
}: BuildMediaPipeTelemetryPayloadArgs): IngestTelemetryEventPayload {
    return buildMediaPipeTelemetryPayload({
        examSessionId,
        studentId,
        eventType,
        timestamp,
        metadata,
        sessionContext,
    });
}

type EmitMediaPipeTelemetryEventArgs = BuildMediaPipeTelemetryPayloadArgs & {
    configuration?: ExamConfig;
    mediaPipeSandbox?: TelemetrySettings['mediaPipeSandbox'];
};

export async function emitMediaPipeTelemetryEvent(
    apiClient: ApiClientType,
    { configuration, mediaPipeSandbox, ...payloadArgs }: EmitMediaPipeTelemetryEventArgs,
) {
    const runtimeEnabled = isMediaPipeRuntimeEnabled({
        sandbox: mediaPipeSandbox,
        configuration,
        stage: 'attempt',
    });
    const eventEnabled = isMediaPipeTelemetryEventEnabled(configuration, payloadArgs.eventType);

    if (!runtimeEnabled || !eventEnabled) {
        console.warn('[MediaPipeTelemetry] Event not emitted', {
            eventType: payloadArgs.eventType,
            examSessionId: payloadArgs.examSessionId,
            runtimeEnabled,
            eventEnabled,
        });
        return false;
    }

    await ingestTelemetryEvent(apiClient, buildAttemptMediaPipeTelemetryPayload(payloadArgs));
    return true;
}
