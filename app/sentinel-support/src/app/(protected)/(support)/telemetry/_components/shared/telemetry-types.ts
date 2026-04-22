import {
    SHARED_TELEMETRY_RULE_KEYS,
    WEB_TELEMETRY_RULE_KEYS,
    MOBILE_TELEMETRY_RULE_KEYS,
} from '@sentinel/shared';
import type {
    TelemetryRuleKey,
    TelemetryIncidentSeverity,
    TelemetrySettings,
    TelemetryRuleOverride,
} from '@sentinel/shared';
import type { TelemetrySettingsRecord } from '@sentinel/shared/types';
import type { TelemetryHealthSnapshot } from '@sentinel/services';

export type RuleGroup = 'ai' | 'web' | 'mobile';

export type RuleDefinition = {
    key: TelemetryRuleKey;
    group: RuleGroup;
    label: string;
    description: string;
    supportsConfidence?: boolean;
    supportsDuration?: boolean;
    supportsRepeat?: boolean;
};

export type WarningDefinition = {
    title: string;
    description: string;
};

export type UpdateSettingsCallback = (
    updater: (settings: TelemetrySettings) => TelemetrySettings,
) => void;

export type TelemetrySettingsFormProps = {
    record?: TelemetrySettingsRecord;
    health?: TelemetryHealthSnapshot;
    isHealthLoading?: boolean;
    healthError?: Error;
    isPending?: boolean;
    onSubmit: (payload: TelemetrySettings) => void;
};

export type ViewProps = {
    currentDraft: TelemetrySettings;
    updateSettingsAction: UpdateSettingsCallback;
    isPending?: boolean;
};

export const RULE_DEFINITIONS: RuleDefinition[] = [
    {
        key: 'aiRules.gaze_tracking',
        group: 'ai',
        label: 'Gaze tracking',
        description: 'Track off-screen attention drift and suspicious focus changes.',
        supportsDuration: true,
        supportsRepeat: true,
    },
    {
        key: 'aiRules.face_detection',
        group: 'ai',
        label: 'Face detection',
        description: 'Require visible face before escalating face-loss incidents.',
        supportsDuration: true,
        supportsRepeat: true,
    },
    {
        key: 'aiRules.audio_anomaly_detection',
        group: 'ai',
        label: 'Audio anomaly detection',
        description: 'Escalate suspicious voices once confidence or repeat thresholds are met.',
        supportsConfidence: true,
        supportsRepeat: true,
    },
    {
        key: 'aiRules.multiple_faces_detection',
        group: 'ai',
        label: 'Multiple faces detection',
        description: 'Flag other people entering the camera frame based on confidence.',
        supportsConfidence: true,
    },
    {
        key: 'webSecurity.tab_switching_monitor',
        group: 'web',
        label: 'Tab switching monitor',
        description:
            'Persist browser focus changes and escalate repeated switches within the rule window.',
    },
    {
        key: 'webSecurity.full_screen_required',
        group: 'web',
        label: 'Full-screen required',
        description:
            'Persist web full-screen exits and escalate repeated exits inside the matching window.',
    },
    {
        key: 'webSecurity.clipboard_control',
        group: 'web',
        label: 'Clipboard control',
        description: 'Persist copy and paste attempts on supported clients.',
    },
    {
        key: 'webSecurity.right_click_disable',
        group: 'web',
        label: 'Right-click disable',
        description:
            'Persist right-click attempts and treat one-off noise less aggressively than repeated behavior.',
    },
    {
        key: 'webSecurity.print_screen_disable',
        group: 'web',
        label: 'Print screen disable',
        description: 'Persist print-screen attempts when the client reports them.',
    },
    {
        key: 'mobileSecurity.app_pinning_required',
        group: 'mobile',
        label: 'App pinning required',
        description: 'Persist app pinning violations on mobile sessions.',
    },
    {
        key: 'mobileSecurity.prevent_backgrounding',
        group: 'mobile',
        label: 'Prevent backgrounding',
        description: 'Persist attempts to leave the mobile exam app and escalate repeated exits.',
    },
    {
        key: 'mobileSecurity.notification_block',
        group: 'mobile',
        label: 'Notification block',
        description:
            'Persist notification-related violations and use a lighter first-occurrence severity before escalation.',
    },
    {
        key: 'mobileSecurity.screenshot_block',
        group: 'mobile',
        label: 'Screenshot block',
        description: 'Persist screenshot attempts on supported mobile devices.',
    },
    {
        key: 'mobileSecurity.root_jailbreak_detection',
        group: 'mobile',
        label: 'Root / jailbreak detection',
        description: 'Persist compromised-device signals when detected.',
    },
];

export const RULE_GROUPS: Array<{
    id: RuleGroup;
    label: string;
    description: string;
    keys: readonly TelemetryRuleKey[];
}> = [
    {
        id: 'ai',
        label: 'AI rules',
        description: 'Threshold-aware camera and audio rules.',
        keys: SHARED_TELEMETRY_RULE_KEYS,
    },
    {
        id: 'web',
        label: 'Web rules',
        description: 'Immediate-persist browser safeguards.',
        keys: WEB_TELEMETRY_RULE_KEYS,
    },
    {
        id: 'mobile',
        label: 'Mobile rules',
        description: 'Immediate-persist mobile safeguards.',
        keys: MOBILE_TELEMETRY_RULE_KEYS,
    },
];
