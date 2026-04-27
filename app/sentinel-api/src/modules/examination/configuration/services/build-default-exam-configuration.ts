import { DEFAULT_EXAMINATION_GLOBAL_SETTINGS } from '@sentinel/shared/constants';
import type { ExamConfigurationValues } from './configuration.types';

export function buildDefaultExamConfiguration(): ExamConfigurationValues {
    return {
        lobbyAdmissionMode: DEFAULT_EXAMINATION_GLOBAL_SETTINGS.defaultLobbyAdmissionMode,
        maxReconnectAttempts: DEFAULT_EXAMINATION_GLOBAL_SETTINGS.defaultMaxReconnectAttempts,
        strictMode: DEFAULT_EXAMINATION_GLOBAL_SETTINGS.defaultStrictMode,
        screenLock: DEFAULT_EXAMINATION_GLOBAL_SETTINGS.defaultScreenLock,
        cameraRequired: DEFAULT_EXAMINATION_GLOBAL_SETTINGS.defaultCameraRequired,
        micRequired: DEFAULT_EXAMINATION_GLOBAL_SETTINGS.defaultMicRequired,
        autoSubmitTimeoutMinutes:
            DEFAULT_EXAMINATION_GLOBAL_SETTINGS.defaultAutoSubmitTimeoutMinutes,
        aiRules: {
            ...DEFAULT_EXAMINATION_GLOBAL_SETTINGS.defaultAiRules,
        },
        webSecurity: {
            ...DEFAULT_EXAMINATION_GLOBAL_SETTINGS.defaultWebSecurity,
        },
        mobileSecurity: {
            ...DEFAULT_EXAMINATION_GLOBAL_SETTINGS.defaultMobileSecurity,
        },
    };
}
