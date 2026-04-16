import { Badge, Separator } from '@sentinel/ui';
import type { ExamConfigurationState } from '@sentinel/services';
import { useFormContext } from 'react-hook-form';
import { ConfigToggleRow } from './config-toggle-row';

type SharedRuleName =
    | 'configuration.aiRules.gaze_tracking'
    | 'configuration.aiRules.face_detection'
    | 'configuration.aiRules.audio_anomaly_detection'
    | 'configuration.aiRules.multiple_faces_detection';

type WebFieldName =
    | 'configuration.webSecurity.tab_switching_monitor'
    | 'configuration.webSecurity.full_screen_required'
    | 'configuration.webSecurity.clipboard_control'
    | 'configuration.webSecurity.right_click_disable'
    | 'configuration.webSecurity.print_screen_disable';

type MobileFieldName =
    | 'configuration.mobileSecurity.app_pinning_required'
    | 'configuration.mobileSecurity.prevent_backgrounding'
    | 'configuration.mobileSecurity.notification_block'
    | 'configuration.mobileSecurity.screenshot_block'
    | 'configuration.mobileSecurity.root_jailbreak_detection';

type RuleItem = {
    name: SharedRuleName | WebFieldName | MobileFieldName;
    label: string;
    description: string;
};

const SHARED_RULES: RuleItem[] = [
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

const WEB_RULES: RuleItem[] = [
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

const MOBILE_RULES: RuleItem[] = [
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

function getNestedBooleanValue(values: ExamConfigurationState, path: RuleItem['name']) {
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

function countEnabledRules(rules: RuleItem[], values: ExamConfigurationState) {
    return rules.filter((rule) => getNestedBooleanValue(values, rule.name)).length;
}

function RuleToggleGrid({ rules }: { rules: RuleItem[] }) {
    return (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {rules.map((rule) => (
                <ConfigToggleRow
                    key={rule.name}
                    name={rule.name}
                    label={rule.label}
                    description={rule.description}
                />
            ))}
        </div>
    );
}

function MonitoringGroup({
    title,
    description,
    badge,
    rules,
}: {
    title: string;
    description: string;
    badge: string;
    rules: RuleItem[];
}) {
    return (
        <section className="space-y-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div className="space-y-1">
                    <h3 className="text-base font-semibold tracking-tight">{title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
                </div>
                <Badge
                    variant="secondary"
                    className="w-fit rounded-md px-2 py-0 text-[10px] font-medium"
                >
                    {badge}
                </Badge>
            </div>
            <RuleToggleGrid rules={rules} />
        </section>
    );
}

export function AiRulesSection() {
    const form = useFormContext<ExamConfigurationState>();
    const values = form.watch();
    const sharedEnabledCount = countEnabledRules(SHARED_RULES, values);
    const webEnabledCount = countEnabledRules(WEB_RULES, values);
    const mobileEnabledCount = countEnabledRules(MOBILE_RULES, values);

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h3 className="text-base font-semibold tracking-tight">Monitoring rules</h3>
                <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
                    Review the shared checks first, then adjust the platform-specific safeguards for
                    web and mobile sessions.
                </p>
            </div>

            <MonitoringGroup
                title="Shared monitoring"
                description="Signals applied across both platforms during identity and behavior checks."
                badge={`${sharedEnabledCount} enabled`}
                rules={SHARED_RULES}
            />

            <Separator />

            <MonitoringGroup
                title="Web browser safeguards"
                description="Browser-specific controls for focus tracking, fullscreen, and copy-protection behavior."
                badge={`${webEnabledCount} enabled`}
                rules={WEB_RULES}
            />

            <Separator />

            <MonitoringGroup
                title="Mobile safeguards"
                description="Foreground, screenshot, and device-integrity protections enforced on mobile sessions."
                badge={`${mobileEnabledCount} enabled`}
                rules={MOBILE_RULES}
            />
        </div>
    );
}
