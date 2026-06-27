import { type DbClient } from '@sentinel/db';
import { getExamConfigurationData } from '../../exams/data/get-exam-configuration';
import { upsertExamConfigurationData } from '../../exams/data/upsert-exam-configuration';
import { buildDefaultExamConfiguration } from './build-default-exam-configuration';
import { mapExamConfigurationState } from './map-exam-configuration-state';
import type { ExamConfigurationPayload } from './configuration.types';
import {
    normalizeExamConfigurationState,
    normalizeExamSettingsState,
} from './normalize-exam-configuration-state';
import { resolveExamSettings } from './resolve-exam-settings';
import { LogsService } from '../../../general/logs/logs.service';

export async function saveExamConfiguration(args: {
    dbClient: DbClient;
    examId: string;
    payload: ExamConfigurationPayload;
    userId?: string;
}) {
    const { dbClient, examId, payload } = args;
    const currentRecord = await getExamConfigurationData({
        dbClient,
        examId,
    });
    const currentState = mapExamConfigurationState(currentRecord);
    const settings = normalizeExamSettingsState(
        resolveExamSettings({
            payload,
            fallback: currentState.settings,
        }),
    );
    const defaultConfiguration = buildDefaultExamConfiguration();
    const configuration = normalizeExamConfigurationState({
        lobbyAdmissionMode:
            payload.configuration?.lobbyAdmissionMode ??
            currentRecord?.lobby_admission_mode ??
            defaultConfiguration.lobbyAdmissionMode,
        releaseScoreMode:
            payload.configuration?.releaseScoreMode ??
            (currentRecord?.release_score_mode as any) ??
            defaultConfiguration.releaseScoreMode,
        maxReconnectAttempts:
            payload.configuration?.maxReconnectAttempts ??
            currentRecord?.max_reconnect_attempts ??
            defaultConfiguration.maxReconnectAttempts,
        strictMode:
            payload.configuration?.strictMode ??
            currentRecord?.strict_mode ??
            defaultConfiguration.strictMode,
        screenLock:
            payload.configuration?.screenLock ??
            currentRecord?.screen_lock ??
            defaultConfiguration.screenLock,
        cameraRequired:
            payload.configuration?.cameraRequired ??
            currentRecord?.camera_required ??
            defaultConfiguration.cameraRequired,
        micRequired:
            payload.configuration?.micRequired ??
            currentRecord?.mic_required ??
            defaultConfiguration.micRequired,
        autoSubmitTimeoutMinutes:
            payload.configuration?.autoSubmitTimeoutMinutes ??
            currentRecord?.auto_submit_timeout_minutes ??
            defaultConfiguration.autoSubmitTimeoutMinutes,
        aiRules:
            payload.configuration?.aiRules ??
            (currentRecord?.ai_rules as any) ??
            defaultConfiguration.aiRules,
        webSecurity:
            payload.configuration?.webSecurity ??
            (currentRecord as any)?.web_security ??
            defaultConfiguration.webSecurity,
        mobileSecurity:
            payload.configuration?.mobileSecurity ??
            (currentRecord as any)?.mobile_security ??
            defaultConfiguration.mobileSecurity,
    });

    const result = await upsertExamConfigurationData({
        dbClient,
        examId,
        createValues: {
            exam_id: examId,
            shuffle_questions: settings.shuffleQuestions,
            show_correct_answers: settings.showCorrectAnswers,
            allow_review: settings.allowReview,
            randomize_choices: settings.randomizeChoices,
            lobby_admission_mode: configuration.lobbyAdmissionMode,
            release_score_mode: configuration.releaseScoreMode,
            max_reconnect_attempts: configuration.maxReconnectAttempts,
            strict_mode: configuration.strictMode,
            screen_lock: configuration.screenLock,
            camera_required: configuration.cameraRequired,
            mic_required: configuration.micRequired,
            auto_submit_timeout_minutes: configuration.autoSubmitTimeoutMinutes,
            ai_rules: configuration.aiRules,
            web_security: configuration.webSecurity,
            mobile_security: configuration.mobileSecurity,
            created_at: new Date(),
            updated_at: new Date(),
        } as any,
        updateValues: {
            shuffle_questions: settings.shuffleQuestions,
            show_correct_answers: settings.showCorrectAnswers,
            allow_review: settings.allowReview,
            randomize_choices: settings.randomizeChoices,
            lobby_admission_mode: configuration.lobbyAdmissionMode,
            release_score_mode: configuration.releaseScoreMode,
            max_reconnect_attempts: configuration.maxReconnectAttempts,
            strict_mode: configuration.strictMode,
            screen_lock: configuration.screenLock,
            camera_required: configuration.cameraRequired,
            mic_required: configuration.micRequired,
            auto_submit_timeout_minutes: configuration.autoSubmitTimeoutMinutes,
            ai_rules: configuration.aiRules,
            web_security: configuration.webSecurity,
            mobile_security: configuration.mobileSecurity,
            updated_at: new Date(),
        } as any,
    });

    // Telemetry logging
    try {
        const exam = await dbClient
            .selectFrom('exams')
            .select(['institution_id'])
            .where('exam_id', '=', examId)
            .executeTakeFirst();

        if (exam?.institution_id) {
            await LogsService.createLog(dbClient, {
                userId: args.userId ?? '00000000-0000-0000-0000-000000000000',
                action: 'exam.configuration_updated',
                resourceType: 'exam_configuration',
                resourceId: examId,
                activeInstitutionId: exam.institution_id,
                details: {
                    examId,
                    lobbyAdmissionMode: configuration.lobbyAdmissionMode,
                    maxReconnectAttempts: configuration.maxReconnectAttempts,
                    strictMode: configuration.strictMode,
                    screenLock: configuration.screenLock,
                },
            });
        }
    } catch (logErr) {
        console.error('Failed to log exam.configuration_updated:', logErr);
    }

    return result;
}
