import type { ExaminationGlobalSettings } from '@sentinel/shared';
import type { ExamConfigurationState } from '../configuration.dto';
import { buildDefaultExamConfiguration } from './build-default-exam-configuration';
import type { ExamConfigurationRecord } from './configuration.types';
import {
    normalizeExamConfigurationState,
    normalizeExamSettingsState,
} from './normalize-exam-configuration-state';

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
    defaults?: Partial<ExaminationGlobalSettings> | null,
): ExamConfigurationState {
    const settings = normalizeExamSettingsState(buildFallbackSettings(record));
    const defaultConfiguration = buildDefaultExamConfiguration(defaults ?? undefined);

    // Mapping and backward
    const aiRules = (record?.ai_rules as any) || defaultConfiguration.aiRules;
    const webSecurity = (record as any)?.web_security || defaultConfiguration.webSecurity;
    const mobileSecurity = (record as any)?.mobile_security || defaultConfiguration.mobileSecurity;
    const automaticClosePolicy = aiRules.automaticClosePolicy || defaultConfiguration.automaticClosePolicy;

    // Handle migration of old tab_switching from aiRules to webSecurity if it exists there and not in webSecurity
    if (
        aiRules.tab_switching !== undefined &&
        webSecurity.tab_switching_monitor === defaultConfiguration.webSecurity.tab_switching_monitor
    ) {
        webSecurity.tab_switching_monitor = aiRules.tab_switching;
    }

    return {
        settings,
        configuration: normalizeExamConfigurationState({
            lobbyAdmissionMode:
                record?.lobby_admission_mode ?? defaultConfiguration.lobbyAdmissionMode,
            releaseScoreMode:
                (record?.release_score_mode as any) ?? defaultConfiguration.releaseScoreMode,
            maxReconnectAttempts:
                record?.max_reconnect_attempts ?? defaultConfiguration.maxReconnectAttempts,
            strictMode: record?.strict_mode ?? defaultConfiguration.strictMode,
            screenLock: record?.screen_lock ?? defaultConfiguration.screenLock,
            cameraRequired: record?.camera_required ?? defaultConfiguration.cameraRequired,
            micRequired: record?.mic_required ?? defaultConfiguration.micRequired,
            autoSubmitTimeoutMinutes:
                record?.auto_submit_timeout_minutes ??
                defaultConfiguration.autoSubmitTimeoutMinutes,
            aiRules: {
                gaze_tracking: aiRules.gaze_tracking ?? defaultConfiguration.aiRules.gaze_tracking,
                face_detection:
                    aiRules.face_detection ?? defaultConfiguration.aiRules.face_detection,
                audio_anomaly_detection:
                    aiRules.audio_anomaly_detection ??
                    aiRules.audio_detection ??
                    defaultConfiguration.aiRules.audio_anomaly_detection,
                multiple_faces_detection:
                    aiRules.multiple_faces_detection ??
                    defaultConfiguration.aiRules.multiple_faces_detection,
            },
            webSecurity,
            mobileSecurity,
            automaticClosePolicy,
        }),
    };
}
