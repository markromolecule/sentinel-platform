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

type ToggleOption = {
    key: keyof ExamSettings;
    label: string;
};

export const TOGGLE_OPTIONS: ToggleOption[] = [
    { key: 'shuffleQuestions', label: 'Shuffle Questions' },
    { key: 'showCorrectAnswers', label: 'Show Correct Answers' },
    { key: 'allowReview', label: 'Allow Review' },
    { key: 'randomizeChoices', label: 'Randomize Choices' },
];

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
