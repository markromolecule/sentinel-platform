import type { ExaminationGlobalSettings } from '@sentinel/shared';
import { DEFAULT_EXAMINATION_GLOBAL_SETTINGS } from '@sentinel/shared/constants';
import type { ExamConfigurationValues } from './configuration.types';

type ExamConfigurationDefaults = ExaminationGlobalSettings;

export function buildDefaultExamConfiguration(
    overrides?: Partial<ExamConfigurationDefaults>,
): ExamConfigurationValues {
    const defaults = {
        ...(DEFAULT_EXAMINATION_GLOBAL_SETTINGS as ExamConfigurationDefaults),
        ...overrides,
    };
    ``;
    return {
        lobbyAdmissionMode: defaults.defaultLobbyAdmissionMode,
        maxReconnectAttempts: defaults.defaultMaxReconnectAttempts,
        strictMode: defaults.defaultStrictMode,
        screenLock: defaults.defaultScreenLock,
        cameraRequired: defaults.defaultCameraRequired,
        micRequired: defaults.defaultMicRequired,
        autoSubmitTimeoutMinutes: defaults.defaultAutoSubmitTimeoutMinutes,
        aiRules: {
            ...defaults.defaultAiRules,
        },
        webSecurity: {
            ...defaults.defaultWebSecurity,
        },
        mobileSecurity: {
            ...defaults.defaultMobileSecurity,
        },
    };
}
