import type { ExamConfigurationValues } from './configuration.types';

export function buildDefaultExamConfiguration(): ExamConfigurationValues {
    return {
        maxReconnectAttempts: 3,
        strictMode: true,
        cameraRequired: true,
        micRequired: true,
        screenLock: true,
        autoSubmitTimeoutMinutes: 5,
        allowedDevices: [],
        aiRules: {
            gaze_tracking: true,
            tab_switching: true,
            face_detection: true,
            audio_detection: true,
        },
    };
}
