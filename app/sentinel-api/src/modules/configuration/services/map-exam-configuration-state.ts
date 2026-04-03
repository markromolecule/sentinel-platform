import type { ExamConfigurationState } from '../configuration.dto';
import { buildDefaultExamConfiguration } from './build-default-exam-configuration';
import type { ExamConfigurationRecord } from './configuration.types';

function buildFallbackSettings(record?: ExamConfigurationRecord | null) {
    return {
        shuffleQuestions: record?.shuffle_questions ?? false,
        showCorrectAnswers: record?.show_correct_answers ?? false,
        allowReview: record?.allow_review ?? false,
        randomizeChoices: record?.randomize_choices ?? false,
    };
}

export function mapExamConfigurationState(
    record?: ExamConfigurationRecord | null,
): ExamConfigurationState {
    const settings = buildFallbackSettings(record);
    const defaultConfiguration = buildDefaultExamConfiguration();

    return {
        settings,
        configuration: {
            maxReconnectAttempts:
                record?.max_reconnect_attempts ?? defaultConfiguration.maxReconnectAttempts,
            strictMode: record?.strict_mode ?? defaultConfiguration.strictMode,
            cameraRequired: record?.camera_required ?? defaultConfiguration.cameraRequired,
            micRequired: record?.mic_required ?? defaultConfiguration.micRequired,
            screenLock: record?.screen_lock ?? defaultConfiguration.screenLock,
            autoSubmitTimeoutMinutes:
                record?.auto_submit_timeout_minutes ??
                defaultConfiguration.autoSubmitTimeoutMinutes,
            allowedDevices: record?.allowed_devices ?? defaultConfiguration.allowedDevices,
            aiRules:
                (record?.ai_rules as Record<string, boolean> | null) ??
                defaultConfiguration.aiRules,
        },
    };
}
