import * as z from 'zod';
import {
    examConfigurationSchema,
    examLobbyAdmissionModeSchema,
    examSettingsSchema,
} from './assessment-schema';

export const examConfigurationStateSchema = z.object({
    settings: examSettingsSchema,
    configuration: examConfigurationSchema,
});

export const examConfigurationParamsSchema = z.object({
    examId: z.string().uuid(),
});

const nullableOptionalBooleanSchema = z.boolean().nullable().optional();

export const updateExamConfigurationBodySchema = z.object({
    shuffleQuestions: nullableOptionalBooleanSchema,
    showCorrectAnswers: nullableOptionalBooleanSchema,
    allowReview: nullableOptionalBooleanSchema,
    randomizeChoices: nullableOptionalBooleanSchema,
    settings: z
        .object({
            shuffleQuestions: nullableOptionalBooleanSchema,
            showCorrectAnswers: nullableOptionalBooleanSchema,
            allowReview: nullableOptionalBooleanSchema,
            randomizeChoices: nullableOptionalBooleanSchema,
        })
        .nullable()
        .optional(),
    configuration: z
        .object({
            lobbyAdmissionMode: examLobbyAdmissionModeSchema.nullable().optional(),
            releaseScoreMode: z.enum(['AUTO_RELEASE', 'MANUAL_RELEASE']).optional(),
            maxReconnectAttempts: z.number().int().min(0).nullable().optional(),
            strictMode: nullableOptionalBooleanSchema,
            screenLock: nullableOptionalBooleanSchema,
            cameraRequired: nullableOptionalBooleanSchema,
            micRequired: nullableOptionalBooleanSchema,
            autoSubmitTimeoutMinutes: z.number().int().min(0).nullable().optional(),
            aiRules: z
                .object({
                    gaze_tracking: nullableOptionalBooleanSchema,
                    face_detection: nullableOptionalBooleanSchema,
                    audio_anomaly_detection: nullableOptionalBooleanSchema,
                    multiple_faces_detection: nullableOptionalBooleanSchema,
                })
                .nullable()
                .optional(),
            webSecurity: z
                .object({
                    tab_switching_monitor: nullableOptionalBooleanSchema,
                    full_screen_required: nullableOptionalBooleanSchema,
                    clipboard_control: nullableOptionalBooleanSchema,
                    right_click_disable: nullableOptionalBooleanSchema,
                    print_screen_disable: nullableOptionalBooleanSchema,
                })
                .nullable()
                .optional(),
            mobileSecurity: z
                .object({
                    app_pinning_required: nullableOptionalBooleanSchema,
                    prevent_backgrounding: nullableOptionalBooleanSchema,
                    notification_block: nullableOptionalBooleanSchema,
                    screenshot_block: nullableOptionalBooleanSchema,
                    root_jailbreak_detection: nullableOptionalBooleanSchema,
                })
                .nullable()
                .optional(),
            automaticClosePolicy: examConfigurationSchema.shape.automaticClosePolicy.optional(),
        })
        .nullable()
        .optional(),
});
