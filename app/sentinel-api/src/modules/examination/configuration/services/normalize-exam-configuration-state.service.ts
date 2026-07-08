import { Schema } from '@sentinel/shared';
import type { ExamConfigurationValues, ExamSettingsState } from './configuration.types';

export function normalizeExamSettingsState(settings: ExamSettingsState): ExamSettingsState {
    return Schema.examSettingsSchema.parse(settings);
}

export function normalizeExamConfigurationState(
    configuration: ExamConfigurationValues,
): ExamConfigurationValues {
    const parsedConfiguration = Schema.examConfigurationSchema.parse(configuration);

    return {
        ...parsedConfiguration,
        aiRules: {
            ...parsedConfiguration.aiRules,
            gaze_tracking: parsedConfiguration.cameraRequired
                ? parsedConfiguration.aiRules.gaze_tracking
                : false,
            face_detection: parsedConfiguration.cameraRequired
                ? parsedConfiguration.aiRules.face_detection
                : false,
            multiple_faces_detection: parsedConfiguration.cameraRequired
                ? parsedConfiguration.aiRules.multiple_faces_detection
                : false,
            audio_anomaly_detection: parsedConfiguration.micRequired
                ? parsedConfiguration.aiRules.audio_anomaly_detection
                : false,
        },
    };
}
