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
          key: 'lobbyAdmissionMode' | 'releaseScoreMode';
          label: string;
      };

export const TOGGLE_OPTIONS: ExamRuleToggleOption[] = [
    { kind: 'setting', key: 'shuffleQuestions', label: 'Shuffle Questions' },
    { kind: 'setting', key: 'showCorrectAnswers', label: 'Show Correct Answers' },
    { kind: 'setting', key: 'allowReview', label: 'Allow Review' },
    { kind: 'setting', key: 'randomizeChoices', label: 'Randomize Choices' },
    { kind: 'configuration', key: 'lobbyAdmissionMode', label: 'Require Instructor Admit' },
    { kind: 'configuration', key: 'releaseScoreMode', label: 'Auto Release Scores' },
];

export function getExamRuleToggleState(args: {
    option: ExamRuleToggleOption;
    settings: ExamSettings;
    configuration: ExamConfiguration;
}) {
    if (args.option.kind === 'configuration') {
        if (args.option.key === 'lobbyAdmissionMode') {
            return args.configuration.lobbyAdmissionMode === 'INSTRUCTOR_GATED';
        }

        return (args.configuration.releaseScoreMode ?? 'AUTO_RELEASE') === 'AUTO_RELEASE';
    }

    return args.settings[args.option.key];
}

export function applyExamRuleToggle(args: {
    option: ExamRuleToggleOption;
    checked: boolean;
    onToggleSetting: (key: keyof ExamSettings, checked: boolean) => void;
    onToggleLobbyAdmissionMode: (checked: boolean) => void;
    onToggleReleaseScoreMode: (checked: boolean) => void;
}) {
    if (args.option.kind === 'configuration') {
        if (args.option.key === 'lobbyAdmissionMode') {
            args.onToggleLobbyAdmissionMode(args.checked);
            return;
        }

        args.onToggleReleaseScoreMode(args.checked);
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
            label: 'Score Release',
            value:
                (configuration.releaseScoreMode ?? 'AUTO_RELEASE') === 'AUTO_RELEASE'
                    ? 'Immediately after submit'
                    : 'After instructor finalization',
            icon: Clock3,
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
