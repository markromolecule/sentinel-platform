import {
    Clock3,
    Cpu,
    LaptopMinimal,
    Mic,
    MonitorSmartphone,
    ShieldCheck,
    UserCheck,
    Video,
} from 'lucide-react';
import type { ExamConfiguration, ExamSettings } from '@sentinel/shared/types';

export type ExamRuleToggleOption =
    | {
          kind: 'setting';
          key: keyof ExamSettings;
          label: string;
      }
    | {
          kind: 'configuration';
          key: 'lobbyAdmissionMode';
          label: string;
      };

export const TOGGLE_OPTIONS: ExamRuleToggleOption[] = [
    { kind: 'setting', key: 'shuffleQuestions', label: 'Shuffle Questions' },
    { kind: 'setting', key: 'showCorrectAnswers', label: 'Show Correct Answers' },
    { kind: 'setting', key: 'allowReview', label: 'Allow Review' },
    { kind: 'setting', key: 'randomizeChoices', label: 'Randomize Choices' },
    { kind: 'configuration', key: 'lobbyAdmissionMode', label: 'Require Instructor Admit' },
];

export function getExamRuleToggleState(args: {
    option: ExamRuleToggleOption;
    settings: ExamSettings;
    configuration: ExamConfiguration;
}) {
    if (args.option.kind === 'configuration') {
        return args.configuration.lobbyAdmissionMode === 'INSTRUCTOR_GATED';
    }

    return args.settings[args.option.key];
}

export function applyExamRuleToggle(args: {
    option: ExamRuleToggleOption;
    checked: boolean;
    onToggleSetting: (key: keyof ExamSettings, checked: boolean) => void;
    onToggleLobbyAdmissionMode: (checked: boolean) => void;
}) {
    if (args.option.kind === 'configuration') {
        args.onToggleLobbyAdmissionMode(args.checked);
        return;
    }

    args.onToggleSetting(args.option.key, args.checked);
}

export function getExamRuleToggleKey(option: ExamRuleToggleOption) {
    return `${option.kind}-${option.key}`;
}

export function getSystemConfigurationRows(configuration?: ExamConfiguration) {
    if (!configuration) {
        return [];
    }

    const hardwareRequirements =
        [
            configuration.cameraRequired ? 'Camera required' : null,
            configuration.micRequired ? 'Mic required' : null,
        ]
            .filter(Boolean)
            .join(' • ') || 'No hardware requirements';

    return [
        {
            label: 'Lobby Gate',
            value:
                configuration.lobbyAdmissionMode === 'INSTRUCTOR_GATED'
                    ? 'Instructor admit required'
                    : 'Automatic entry',
            icon: UserCheck,
        },
        {
            label: 'Strict Mode',
            value: configuration.strictMode ? 'Enabled' : 'Disabled',
            icon: Cpu,
        },
        {
            label: 'Session Lock',
            value: configuration.screenLock ? 'Locked exam surface' : 'Monitoring only',
            icon: LaptopMinimal,
        },
        {
            label: 'Hardware',
            value: hardwareRequirements,
            icon: Video,
        },
        {
            label: 'Reconnect Limit',
            value: `${configuration.maxReconnectAttempts} attempts`,
            icon: ShieldCheck,
        },
        {
            label: 'Auto Submit',
            value: `${configuration.autoSubmitTimeoutMinutes} min timeout`,
            icon: Clock3,
        },
        {
            label: 'Web Safeguards',
            value: `${countEnabledRules(configuration.webSecurity)} enabled`,
            icon: Mic,
        },
        {
            label: 'Mobile Safeguards',
            value: `${countEnabledRules(configuration.mobileSecurity)} enabled`,
            icon: MonitorSmartphone,
        },
    ];
}

function countEnabledRules(rules: Record<string, boolean>) {
    return Object.values(rules).filter(Boolean).length;
}
