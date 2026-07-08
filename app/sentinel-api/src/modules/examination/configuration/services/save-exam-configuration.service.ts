import { type DbClient } from '@sentinel/db';
import { getExamConfigurationData } from '../../exams/data/get-exam-configuration';
import { upsertExamConfigurationData } from '../../exams/data/upsert-exam-configuration';
import { buildDefaultExamConfiguration } from './build-default-exam-configuration.service';
import { mapExamConfigurationState } from './map-exam-configuration-state.service';
import type { ExamConfigurationPayload } from './configuration.types';
import { normalizeExamConfigurationState } from './normalize-exam-configuration-state.service';
import { resolveExamSettings } from './resolve-exam-settings.service';
import { LogsService } from '../../../general/logs/logs.service';
import { resolveExaminationGlobalSettings } from './resolve-examination-global-settings.service';

function hasOwnProperty<Value extends object, Key extends PropertyKey>(
    value: Value | null | undefined,
    key: Key,
): value is Value & Record<Key, unknown> {
    return value != null && Object.prototype.hasOwnProperty.call(value, key);
}

function isJsonEqual(left: unknown, right: unknown) {
    return JSON.stringify(left) === JSON.stringify(right);
}

function resolveInheritedScalar<Value>(args: {
    explicitValue: Value | null | undefined;
    fallbackValue: Value;
    defaultValue: Value;
}) {
    const { explicitValue, fallbackValue, defaultValue } = args;
    const desiredValue =
        explicitValue === undefined
            ? fallbackValue
            : explicitValue === null
              ? defaultValue
              : explicitValue;

    return desiredValue === defaultValue ? null : desiredValue;
}

function resolveInheritedObject<
    Shape extends Record<string, any>,
    Key extends keyof Shape & string,
>(args: {
    explicitValue: Partial<Record<Key, Shape[Key] | null>> | null | undefined;
    fallbackValue: Shape;
    defaultValue: Shape;
}) {
    const { explicitValue, fallbackValue, defaultValue } = args;

    let desiredValue: Shape;

    if (explicitValue === undefined) {
        desiredValue = { ...fallbackValue };
    } else if (explicitValue === null) {
        desiredValue = { ...defaultValue };
    } else {
        desiredValue = { ...fallbackValue };
        for (const key of Object.keys(explicitValue) as Key[]) {
            const nextValue = explicitValue[key];
            desiredValue[key] = (nextValue === null ? defaultValue[key] : nextValue) as Shape[Key];
        }
    }

    return isJsonEqual(desiredValue, defaultValue) ? null : desiredValue;
}

export async function saveExamConfiguration(args: {
    dbClient: DbClient;
    examId: string;
    payload: ExamConfigurationPayload;
    userId?: string;
}) {
    const { dbClient, examId, payload } = args;
    const [currentRecord, globalSettings] = await Promise.all([
        getExamConfigurationData({
            dbClient,
            examId,
        }),
        resolveExaminationGlobalSettings(dbClient),
    ]);
    const currentState = mapExamConfigurationState(currentRecord, globalSettings);
    const settings = resolveExamSettings({
        payload,
        globalSettings,
        fallback: currentState.settings,
    });
    const defaultConfiguration = buildDefaultExamConfiguration(globalSettings);
    const payloadConfiguration = payload.configuration;
    const releaseScoreModeExplicit = hasOwnProperty(payloadConfiguration, 'releaseScoreMode')
        ? payloadConfiguration.releaseScoreMode
        : undefined;
    const automaticClosePolicyExplicit = hasOwnProperty(
        payloadConfiguration,
        'automaticClosePolicy',
    )
        ? payloadConfiguration.automaticClosePolicy
        : undefined;
    const configuration = normalizeExamConfigurationState({
        lobbyAdmissionMode:
            resolveInheritedScalar({
                explicitValue: hasOwnProperty(payloadConfiguration, 'lobbyAdmissionMode')
                    ? payloadConfiguration.lobbyAdmissionMode
                    : undefined,
                fallbackValue: currentState.configuration.lobbyAdmissionMode,
                defaultValue: defaultConfiguration.lobbyAdmissionMode,
            }) ?? defaultConfiguration.lobbyAdmissionMode,
        releaseScoreMode:
            releaseScoreModeExplicit ??
            currentState.configuration.releaseScoreMode ??
            defaultConfiguration.releaseScoreMode,
        maxReconnectAttempts:
            resolveInheritedScalar({
                explicitValue: hasOwnProperty(payloadConfiguration, 'maxReconnectAttempts')
                    ? payloadConfiguration.maxReconnectAttempts
                    : undefined,
                fallbackValue: currentState.configuration.maxReconnectAttempts,
                defaultValue: defaultConfiguration.maxReconnectAttempts,
            }) ?? defaultConfiguration.maxReconnectAttempts,
        strictMode:
            resolveInheritedScalar({
                explicitValue: hasOwnProperty(payloadConfiguration, 'strictMode')
                    ? payloadConfiguration.strictMode
                    : undefined,
                fallbackValue: currentState.configuration.strictMode,
                defaultValue: defaultConfiguration.strictMode,
            }) ?? defaultConfiguration.strictMode,
        screenLock:
            resolveInheritedScalar({
                explicitValue: hasOwnProperty(payloadConfiguration, 'screenLock')
                    ? payloadConfiguration.screenLock
                    : undefined,
                fallbackValue: currentState.configuration.screenLock,
                defaultValue: defaultConfiguration.screenLock,
            }) ?? defaultConfiguration.screenLock,
        cameraRequired:
            resolveInheritedScalar({
                explicitValue: hasOwnProperty(payloadConfiguration, 'cameraRequired')
                    ? payloadConfiguration.cameraRequired
                    : undefined,
                fallbackValue: currentState.configuration.cameraRequired,
                defaultValue: defaultConfiguration.cameraRequired,
            }) ?? defaultConfiguration.cameraRequired,
        micRequired:
            resolveInheritedScalar({
                explicitValue: hasOwnProperty(payloadConfiguration, 'micRequired')
                    ? payloadConfiguration.micRequired
                    : undefined,
                fallbackValue: currentState.configuration.micRequired,
                defaultValue: defaultConfiguration.micRequired,
            }) ?? defaultConfiguration.micRequired,
        autoSubmitTimeoutMinutes:
            resolveInheritedScalar({
                explicitValue: hasOwnProperty(payloadConfiguration, 'autoSubmitTimeoutMinutes')
                    ? payloadConfiguration.autoSubmitTimeoutMinutes
                    : undefined,
                fallbackValue: currentState.configuration.autoSubmitTimeoutMinutes,
                defaultValue: defaultConfiguration.autoSubmitTimeoutMinutes,
            }) ?? defaultConfiguration.autoSubmitTimeoutMinutes,
        aiRules:
            resolveInheritedObject({
                explicitValue: hasOwnProperty(payloadConfiguration, 'aiRules')
                    ? payloadConfiguration.aiRules
                    : undefined,
                fallbackValue: currentState.configuration.aiRules,
                defaultValue: defaultConfiguration.aiRules,
            }) ?? defaultConfiguration.aiRules,
        webSecurity:
            resolveInheritedObject({
                explicitValue: hasOwnProperty(payloadConfiguration, 'webSecurity')
                    ? payloadConfiguration.webSecurity
                    : undefined,
                fallbackValue: currentState.configuration.webSecurity,
                defaultValue: defaultConfiguration.webSecurity,
            }) ?? defaultConfiguration.webSecurity,
        mobileSecurity:
            resolveInheritedObject({
                explicitValue: hasOwnProperty(payloadConfiguration, 'mobileSecurity')
                    ? payloadConfiguration.mobileSecurity
                    : undefined,
                fallbackValue: currentState.configuration.mobileSecurity,
                defaultValue: defaultConfiguration.mobileSecurity,
            }) ?? defaultConfiguration.mobileSecurity,
        automaticClosePolicy:
            automaticClosePolicyExplicit ??
            currentState.configuration.automaticClosePolicy ??
            defaultConfiguration.automaticClosePolicy,
    });

    const aiRulesForDb =
        resolveInheritedObject({
            explicitValue: hasOwnProperty(payloadConfiguration, 'aiRules')
                ? payloadConfiguration.aiRules
                : undefined,
            fallbackValue: currentState.configuration.aiRules,
            defaultValue: defaultConfiguration.aiRules,
        }) ?? null;

    const persistedAiRules = {
        ...(aiRulesForDb ?? {}),
        automaticClosePolicy: configuration.automaticClosePolicy,
    };

    const persistedConfiguration = {
        lobbyAdmissionMode: resolveInheritedScalar({
            explicitValue: hasOwnProperty(payloadConfiguration, 'lobbyAdmissionMode')
                ? payloadConfiguration.lobbyAdmissionMode
                : undefined,
            fallbackValue: currentState.configuration.lobbyAdmissionMode,
            defaultValue: defaultConfiguration.lobbyAdmissionMode,
        }),
        maxReconnectAttempts: resolveInheritedScalar({
            explicitValue: hasOwnProperty(payloadConfiguration, 'maxReconnectAttempts')
                ? payloadConfiguration.maxReconnectAttempts
                : undefined,
            fallbackValue: currentState.configuration.maxReconnectAttempts,
            defaultValue: defaultConfiguration.maxReconnectAttempts,
        }),
        strictMode: resolveInheritedScalar({
            explicitValue: hasOwnProperty(payloadConfiguration, 'strictMode')
                ? payloadConfiguration.strictMode
                : undefined,
            fallbackValue: currentState.configuration.strictMode,
            defaultValue: defaultConfiguration.strictMode,
        }),
        screenLock: resolveInheritedScalar({
            explicitValue: hasOwnProperty(payloadConfiguration, 'screenLock')
                ? payloadConfiguration.screenLock
                : undefined,
            fallbackValue: currentState.configuration.screenLock,
            defaultValue: defaultConfiguration.screenLock,
        }),
        cameraRequired: resolveInheritedScalar({
            explicitValue: hasOwnProperty(payloadConfiguration, 'cameraRequired')
                ? payloadConfiguration.cameraRequired
                : undefined,
            fallbackValue: currentState.configuration.cameraRequired,
            defaultValue: defaultConfiguration.cameraRequired,
        }),
        micRequired: resolveInheritedScalar({
            explicitValue: hasOwnProperty(payloadConfiguration, 'micRequired')
                ? payloadConfiguration.micRequired
                : undefined,
            fallbackValue: currentState.configuration.micRequired,
            defaultValue: defaultConfiguration.micRequired,
        }),
        autoSubmitTimeoutMinutes: resolveInheritedScalar({
            explicitValue: hasOwnProperty(payloadConfiguration, 'autoSubmitTimeoutMinutes')
                ? payloadConfiguration.autoSubmitTimeoutMinutes
                : undefined,
            fallbackValue: currentState.configuration.autoSubmitTimeoutMinutes,
            defaultValue: defaultConfiguration.autoSubmitTimeoutMinutes,
        }),
        webSecurity: resolveInheritedObject({
            explicitValue: hasOwnProperty(payloadConfiguration, 'webSecurity')
                ? payloadConfiguration.webSecurity
                : undefined,
            fallbackValue: currentState.configuration.webSecurity,
            defaultValue: defaultConfiguration.webSecurity,
        }),
        mobileSecurity: resolveInheritedObject({
            explicitValue: hasOwnProperty(payloadConfiguration, 'mobileSecurity')
                ? payloadConfiguration.mobileSecurity
                : undefined,
            fallbackValue: currentState.configuration.mobileSecurity,
            defaultValue: defaultConfiguration.mobileSecurity,
        }),
    };

    const result = await upsertExamConfigurationData({
        dbClient,
        examId,
        createValues: {
            exam_id: examId,
            shuffle_questions: settings.shuffleQuestions,
            show_correct_answers: settings.showCorrectAnswers,
            allow_review: settings.allowReview,
            randomize_choices: settings.randomizeChoices,
            lobby_admission_mode: persistedConfiguration.lobbyAdmissionMode,
            release_score_mode:
                releaseScoreModeExplicit === undefined ? undefined : configuration.releaseScoreMode,
            max_reconnect_attempts: persistedConfiguration.maxReconnectAttempts,
            strict_mode: persistedConfiguration.strictMode,
            screen_lock: persistedConfiguration.screenLock,
            camera_required: persistedConfiguration.cameraRequired,
            mic_required: persistedConfiguration.micRequired,
            auto_submit_timeout_minutes: persistedConfiguration.autoSubmitTimeoutMinutes,
            ai_rules: persistedAiRules,
            web_security: persistedConfiguration.webSecurity,
            mobile_security: persistedConfiguration.mobileSecurity,
            created_at: new Date(),
            updated_at: new Date(),
        } as any,
        updateValues: {
            shuffle_questions: settings.shuffleQuestions,
            show_correct_answers: settings.showCorrectAnswers,
            allow_review: settings.allowReview,
            randomize_choices: settings.randomizeChoices,
            lobby_admission_mode: persistedConfiguration.lobbyAdmissionMode,
            release_score_mode:
                releaseScoreModeExplicit === undefined ? undefined : configuration.releaseScoreMode,
            max_reconnect_attempts: persistedConfiguration.maxReconnectAttempts,
            strict_mode: persistedConfiguration.strictMode,
            screen_lock: persistedConfiguration.screenLock,
            camera_required: persistedConfiguration.cameraRequired,
            mic_required: persistedConfiguration.micRequired,
            auto_submit_timeout_minutes: persistedConfiguration.autoSubmitTimeoutMinutes,
            ai_rules: persistedAiRules,
            web_security: persistedConfiguration.webSecurity,
            mobile_security: persistedConfiguration.mobileSecurity,
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
