import {
    MOBILE_USER_AGENT_REGEX,
    TELEMETRY_EVENT_DEFINITIONS,
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

export type WebTelemetryEventType = (typeof WEB_TELEMETRY_EVENT_TYPES)[number];

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
