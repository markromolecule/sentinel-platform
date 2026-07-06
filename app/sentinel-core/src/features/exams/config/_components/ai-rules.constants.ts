import type { ExamConfigurationState } from '@sentinel/services';

export type SharedRuleName =
    | 'configuration.aiRules.gaze_tracking'
    | 'configuration.aiRules.face_detection'
    | 'configuration.aiRules.audio_anomaly_detection'
    | 'configuration.aiRules.multiple_faces_detection';

export type WebFieldName =
    | 'configuration.webSecurity.tab_switching_monitor'
    | 'configuration.webSecurity.full_screen_required'
    | 'configuration.webSecurity.clipboard_control'
    | 'configuration.webSecurity.right_click_disable'
    | 'configuration.webSecurity.print_screen_disable';

export type MobileFieldName =
    | 'configuration.mobileSecurity.app_pinning_required'
    | 'configuration.mobileSecurity.prevent_backgrounding'
    | 'configuration.mobileSecurity.notification_block'
    | 'configuration.mobileSecurity.screenshot_block'
    | 'configuration.mobileSecurity.root_jailbreak_detection';

export type RuleItem = {
    name: SharedRuleName | WebFieldName | MobileFieldName;
    label: string;
    description: string;
};

export const SHARED_RULES: RuleItem[] = [
    {
        name: 'configuration.aiRules.gaze_tracking',
        label: 'Gaze tracking',
        description: 'Monitor attention drift and off-screen viewing patterns.',
    },
    {
        name: 'configuration.aiRules.face_detection',
        label: 'Face detection',
        description: 'Require a clearly visible face throughout the attempt.',
    },
    {
        name: 'configuration.aiRules.audio_anomaly_detection',
        label: 'Audio anomaly detection',
        description: 'Flag suspicious voices, whispering, or unexpected audio.',
    },
    {
        name: 'configuration.aiRules.multiple_faces_detection',
        label: 'Multiple faces detection',
        description: 'Detect additional people entering the camera frame.',
    },
];

export const WEB_RULES: RuleItem[] = [
    {
        name: 'configuration.webSecurity.tab_switching_monitor',
        label: 'Tab switching monitor',
        description: 'Log browser tab changes or focus loss events.',
    },
    {
        name: 'configuration.webSecurity.full_screen_required',
        label: 'Full-screen required',
        description: 'Require the exam to remain in full-screen mode.',
    },
    {
        name: 'configuration.webSecurity.clipboard_control',
        label: 'Clipboard control',
        description: 'Restrict copy and paste activity during the attempt.',
    },
    {
        name: 'configuration.webSecurity.right_click_disable',
        label: 'Right-click disable',
        description: 'Limit context-menu actions that can expose browser tools.',
    },
    {
        name: 'configuration.webSecurity.print_screen_disable',
        label: 'Print screen disable',
        description: 'Block supported screen capture shortcuts where available.',
    },
];

export const MOBILE_RULES: RuleItem[] = [
    {
        name: 'configuration.mobileSecurity.app_pinning_required',
        label: 'App pinning required',
        description: 'Keep the exam app pinned in the foreground on mobile.',
    },
    {
        name: 'configuration.mobileSecurity.prevent_backgrounding',
        label: 'Prevent backgrounding',
        description: 'Flag when the exam app is sent to the background.',
    },
    {
        name: 'configuration.mobileSecurity.notification_block',
        label: 'Notification block',
        description: 'Reduce interruption risk from system notifications.',
    },
    {
        name: 'configuration.mobileSecurity.screenshot_block',
        label: 'Screenshot block',
        description: 'Block screenshots and screen recordings on supported devices.',
    },
    {
        name: 'configuration.mobileSecurity.root_jailbreak_detection',
        label: 'Root / jailbreak detection',
        description: 'Flag compromised devices that weaken exam protections.',
    },
];

/**
 * Retrieves the boolean value of a nested path from the form values.
 *
 * @param values - Current form values.
 * @param path - Nested path to read.
 * @returns Whether the nested value is true.
 */
export function getNestedBooleanValue(values: ExamConfigurationState, path: RuleItem['name']) {
    const parts = path.split('.');
    let current: unknown = values;

    for (const part of parts) {
        if (typeof current !== 'object' || current === null || !(part in current)) {
            return false;
        }

        current = (current as Record<string, unknown>)[part];
    }

    return current === true;
}

/**
 * Counts the number of enabled rules based on current form values.
 *
 * @param rules - Rules list.
 * @param values - Current form values.
 * @returns Number of rules that are enabled.
 */
export function countEnabledRules(rules: RuleItem[], values: ExamConfigurationState) {
    return rules.filter((rule) => getNestedBooleanValue(values, rule.name)).length;
}
