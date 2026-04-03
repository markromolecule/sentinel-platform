import { type DbClient } from '@sentinel/db';
import { getExamConfigurationData } from '../../exams/data/get-exam-configuration';
import { upsertExamConfigurationData } from '../../exams/data/upsert-exam-configuration';
import { buildDefaultExamConfiguration } from './build-default-exam-configuration';
import { mapExamConfigurationState } from './map-exam-configuration-state';
import type { ExamConfigurationPayload } from './configuration.types';
import { resolveExamSettings } from './resolve-exam-settings';

export async function saveExamConfiguration(args: {
    dbClient: DbClient;
    examId: string;
    payload: ExamConfigurationPayload;
}) {
    const { dbClient, examId, payload } = args;
    const currentRecord = await getExamConfigurationData({
        dbClient,
        examId,
    });
    const currentState = mapExamConfigurationState(currentRecord);
    const settings = resolveExamSettings({
        payload,
        fallback: currentState.settings,
    });
    const defaultConfiguration = buildDefaultExamConfiguration();
    const configuration = {
        maxReconnectAttempts:
            payload.configuration?.maxReconnectAttempts ??
            currentRecord?.max_reconnect_attempts ??
            defaultConfiguration.maxReconnectAttempts,
        strictMode:
            payload.configuration?.strictMode ??
            currentRecord?.strict_mode ??
            defaultConfiguration.strictMode,
        cameraRequired:
            payload.configuration?.cameraRequired ??
            currentRecord?.camera_required ??
            defaultConfiguration.cameraRequired,
        micRequired:
            payload.configuration?.micRequired ??
            currentRecord?.mic_required ??
            defaultConfiguration.micRequired,
        screenLock:
            payload.configuration?.screenLock ??
            currentRecord?.screen_lock ??
            defaultConfiguration.screenLock,
        autoSubmitTimeoutMinutes:
            payload.configuration?.autoSubmitTimeoutMinutes ??
            currentRecord?.auto_submit_timeout_minutes ??
            defaultConfiguration.autoSubmitTimeoutMinutes,
        allowedDevices:
            payload.configuration?.allowedDevices ??
            currentRecord?.allowed_devices ??
            defaultConfiguration.allowedDevices,
        aiRules:
            payload.configuration?.aiRules ??
            (currentRecord?.ai_rules as Record<string, boolean> | null) ??
            defaultConfiguration.aiRules,
    };

    return await upsertExamConfigurationData({
        dbClient,
        examId,
        createValues: {
            exam_id: examId,
            shuffle_questions: settings.shuffleQuestions,
            show_correct_answers: settings.showCorrectAnswers,
            allow_review: settings.allowReview,
            randomize_choices: settings.randomizeChoices,
            max_reconnect_attempts: configuration.maxReconnectAttempts,
            strict_mode: configuration.strictMode,
            camera_required: configuration.cameraRequired,
            mic_required: configuration.micRequired,
            screen_lock: configuration.screenLock,
            auto_submit_timeout_minutes: configuration.autoSubmitTimeoutMinutes,
            allowed_devices: configuration.allowedDevices,
            ai_rules: configuration.aiRules,
            created_at: new Date(),
            updated_at: new Date(),
        },
        updateValues: {
            shuffle_questions: settings.shuffleQuestions,
            show_correct_answers: settings.showCorrectAnswers,
            allow_review: settings.allowReview,
            randomize_choices: settings.randomizeChoices,
            max_reconnect_attempts: configuration.maxReconnectAttempts,
            strict_mode: configuration.strictMode,
            camera_required: configuration.cameraRequired,
            mic_required: configuration.micRequired,
            screen_lock: configuration.screenLock,
            auto_submit_timeout_minutes: configuration.autoSubmitTimeoutMinutes,
            allowed_devices: configuration.allowedDevices,
            ai_rules: configuration.aiRules,
            updated_at: new Date(),
        },
    });
}
