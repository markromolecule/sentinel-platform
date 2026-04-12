import { MOCK_EXAM_CONFIG } from '@sentinel/shared/mock-data';
import { Cpu, LaptopMinimal, Video, ShieldCheck, Clock3, Mic } from 'lucide-react';
import type { ExamSettings } from '@sentinel/shared/types';

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

export const HARDWARE_REQUIREMENTS =
    [
        MOCK_EXAM_CONFIG.cameraRequired ? 'Camera required' : null,
        MOCK_EXAM_CONFIG.micRequired ? 'Mic required' : null,
    ]
        .filter(Boolean)
        .join(' • ') || 'No hardware requirements';

export const SYSTEM_CONFIGURATION_ROWS = [
    {
        label: 'Strict Mode',
        value: MOCK_EXAM_CONFIG.strictMode ? 'Enabled' : 'Disabled',
        icon: Cpu,
    },
    {
        label: 'Session Lock',
        value: MOCK_EXAM_CONFIG.screenLock ? 'Locked exam surface' : 'Monitoring only',
        icon: LaptopMinimal,
    },
    {
        label: 'Hardware',
        value: HARDWARE_REQUIREMENTS,
        icon: Video,
    },
    {
        label: 'Reconnect Limit',
        value: `${MOCK_EXAM_CONFIG.maxReconnectAttempts} attempts`,
        icon: ShieldCheck,
    },
    {
        label: 'Auto Submit',
        value: `${MOCK_EXAM_CONFIG.autoSubmitTimeoutMinutes} min timeout`,
        icon: Clock3,
    },
    {
        label: 'Web Safeguards',
        value: `${countEnabledRules(MOCK_EXAM_CONFIG.webSecurity)} enabled`,
        icon: Mic,
    },
    {
        label: 'Mobile Safeguards',
        value: `${countEnabledRules(MOCK_EXAM_CONFIG.mobileSecurity)} enabled`,
        icon: Mic,
    },
];

function countEnabledRules(rules: Record<string, boolean>) {
    return Object.values(rules).filter(Boolean).length;
}
