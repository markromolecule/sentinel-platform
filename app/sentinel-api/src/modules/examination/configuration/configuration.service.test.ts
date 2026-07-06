import { type DbClient } from '@sentinel/db';
import { describe, expect } from 'vitest';
import { DEFAULT_EXAMINATION_GLOBAL_SETTINGS } from '@sentinel/shared/constants';
import { testWithDbClient } from '../../../lib/test-with-db-client';
import { ConfigurationService } from './configuration.service';

const createExamFixture = async (dbClient: DbClient) => {
    const institution = await dbClient
        .insertInto('institutions')
        .values({
            name: `Exam Config Test Institution ${Date.now()}`,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

    const exam = await dbClient
        .insertInto('exams')
        .values({
            title: `Exam Config Test ${Date.now()}`,
            institution_id: institution.id,
            duration_minutes: 60,
            scheduled_date: new Date('2026-04-13T01:00:00.000Z'),
            end_date_time: new Date('2026-04-13T02:00:00.000Z'),
        })
        .returningAll()
        .executeTakeFirstOrThrow();

    return { institution, exam };
};

describe('ConfigurationService', () => {
    testWithDbClient(
        'returns default exam settings and configuration data for an existing exam',
        async ({ dbClient }) => {
            const { institution, exam } = await createExamFixture(dbClient);

            const result = await ConfigurationService.getExamConfiguration(
                dbClient,
                exam.exam_id,
                institution.id,
            );

            expect(result.settings).toEqual({
                shuffleQuestions: false,
                showCorrectAnswers: false,
                allowReview: false,
                randomizeChoices: false,
            });

            expect(result.configuration).toEqual({
                lobbyAdmissionMode: 'AUTOMATIC',
                releaseScoreMode: 'AUTO_RELEASE',
                maxReconnectAttempts: 3,
                strictMode: true,
                screenLock: true,
                cameraRequired: true,
                micRequired: true,
                autoSubmitTimeoutMinutes: 5,
                aiRules: {
                    gaze_tracking: true,
                    face_detection: true,
                    audio_anomaly_detection: true,
                    multiple_faces_detection: true,
                },
                webSecurity: {
                    tab_switching_monitor: true,
                    full_screen_required: true,
                    clipboard_control: true,
                    right_click_disable: true,
                    print_screen_disable: true,
                },
                mobileSecurity: {
                    app_pinning_required: true,
                    prevent_backgrounding: true,
                    notification_block: true,
                    screenshot_block: true,
                    root_jailbreak_detection: true,
                },
                automaticClosePolicy: {
                    enabled: true,
                    highIncidentThreshold: 3,
                    windowMinutes: 15,
                    useOccurrenceCount: false,
                    immediateCloseEventTypes: [],
                },
            });
        },
    );

    testWithDbClient(
        'persists updated exam settings and configuration and returns saved data',
        async ({ dbClient }) => {
            const { institution, exam } = await createExamFixture(dbClient);

            const updated = await ConfigurationService.updateExamConfiguration(
                dbClient,
                exam.exam_id,
                {
                    settings: {
                        shuffleQuestions: true,
                        showCorrectAnswers: true,
                        allowReview: true,
                        randomizeChoices: true,
                    },
                    configuration: {
                        lobbyAdmissionMode: 'INSTRUCTOR_GATED',
                        releaseScoreMode: 'MANUAL_RELEASE',
                        maxReconnectAttempts: 5,
                        strictMode: false,
                        screenLock: false,
                        cameraRequired: false,
                        micRequired: false,
                        autoSubmitTimeoutMinutes: 15,
                        aiRules: {
                            gaze_tracking: true,
                            face_detection: true,
                            audio_anomaly_detection: true,
                            multiple_faces_detection: true,
                        },
                        webSecurity: {
                            tab_switching_monitor: false,
                            full_screen_required: false,
                            clipboard_control: false,
                            right_click_disable: false,
                            print_screen_disable: false,
                        },
                        mobileSecurity: {
                            app_pinning_required: false,
                            prevent_backgrounding: false,
                            notification_block: false,
                            screenshot_block: false,
                            root_jailbreak_detection: false,
                        },
                    },
                },
                institution.id,
            );

            expect(updated.settings).toEqual({
                shuffleQuestions: true,
                showCorrectAnswers: true,
                allowReview: true,
                randomizeChoices: true,
            });

            expect(updated.configuration).toEqual({
                lobbyAdmissionMode: 'INSTRUCTOR_GATED',
                releaseScoreMode: 'MANUAL_RELEASE',
                maxReconnectAttempts: 5,
                strictMode: false,
                screenLock: false,
                cameraRequired: false,
                micRequired: false,
                autoSubmitTimeoutMinutes: 15,
                aiRules: {
                    gaze_tracking: false,
                    face_detection: false,
                    audio_anomaly_detection: false,
                    multiple_faces_detection: false,
                },
                webSecurity: {
                    tab_switching_monitor: false,
                    full_screen_required: false,
                    clipboard_control: false,
                    right_click_disable: false,
                    print_screen_disable: false,
                },
                mobileSecurity: {
                    app_pinning_required: false,
                    prevent_backgrounding: false,
                    notification_block: false,
                    screenshot_block: false,
                    root_jailbreak_detection: false,
                },
                automaticClosePolicy: {
                    enabled: true,
                    highIncidentThreshold: 3,
                    windowMinutes: 15,
                    useOccurrenceCount: false,
                    immediateCloseEventTypes: [],
                },
            });

            const fetched = await ConfigurationService.getExamConfiguration(
                dbClient,
                exam.exam_id,
                institution.id,
            );

            expect(fetched).toEqual(updated);
        },
    );

    testWithDbClient(
        'honors global institution settings for lobbyAdmissionMode when no exam record exists',
        async ({ dbClient }) => {
            const { institution, exam } = await createExamFixture(dbClient);

            // Update global settings to require INSTRUCTOR_GATED
            await dbClient
                .insertInto('system_settings')
                .values({
                    category: 'examination',
                    setting_key: 'examination.global_defaults',
                    setting_value: JSON.stringify({
                        ...DEFAULT_EXAMINATION_GLOBAL_SETTINGS,
                        defaultLobbyAdmissionMode: 'INSTRUCTOR_GATED',
                    }),
                    updated_at: new Date(),
                })
                .onConflict((oc) =>
                    oc.column('setting_key').doUpdateSet({
                        setting_value: JSON.stringify({
                            ...DEFAULT_EXAMINATION_GLOBAL_SETTINGS,
                            defaultLobbyAdmissionMode: 'INSTRUCTOR_GATED',
                        }),
                        updated_at: new Date(),
                    }),
                )
                .execute();

            const result = await ConfigurationService.getExamConfiguration(
                dbClient,
                exam.exam_id,
                institution.id,
            );

            expect(result.configuration.lobbyAdmissionMode).toBe('INSTRUCTOR_GATED');
        },
    );

    testWithDbClient(
        'inherits global defaults for general settings and runtime configuration when local fields are null',
        async ({ dbClient }) => {
            const { institution, exam } = await createExamFixture(dbClient);

            await dbClient
                .insertInto('system_settings')
                .values({
                    category: 'examination',
                    setting_key: 'examination.global_defaults',
                    setting_value: JSON.stringify({
                        ...DEFAULT_EXAMINATION_GLOBAL_SETTINGS,
                        defaultShuffleQuestions: true,
                        defaultAllowReview: true,
                        defaultLobbyAdmissionMode: 'INSTRUCTOR_GATED',
                        defaultStrictMode: false,
                        defaultWebSecurity: {
                            ...DEFAULT_EXAMINATION_GLOBAL_SETTINGS.defaultWebSecurity,
                            clipboard_control: false,
                        },
                    }),
                    updated_at: new Date(),
                })
                .onConflict((oc) =>
                    oc.column('setting_key').doUpdateSet({
                        setting_value: JSON.stringify({
                            ...DEFAULT_EXAMINATION_GLOBAL_SETTINGS,
                            defaultShuffleQuestions: true,
                            defaultAllowReview: true,
                            defaultLobbyAdmissionMode: 'INSTRUCTOR_GATED',
                            defaultStrictMode: false,
                            defaultWebSecurity: {
                                ...DEFAULT_EXAMINATION_GLOBAL_SETTINGS.defaultWebSecurity,
                                clipboard_control: false,
                            },
                        }),
                        updated_at: new Date(),
                    }),
                )
                .execute();

            const inherited = await ConfigurationService.getExamConfiguration(
                dbClient,
                exam.exam_id,
                institution.id,
            );

            expect(inherited.settings).toEqual({
                shuffleQuestions: true,
                showCorrectAnswers: false,
                allowReview: true,
                randomizeChoices: false,
            });
            expect(inherited.configuration.lobbyAdmissionMode).toBe('INSTRUCTOR_GATED');
            expect(inherited.configuration.strictMode).toBe(false);
            expect(inherited.configuration.webSecurity.clipboard_control).toBe(false);
        },
    );

    testWithDbClient(
        'reverts explicit configuration overrides back to inherited global defaults with null updates',
        async ({ dbClient }) => {
            const { institution, exam } = await createExamFixture(dbClient);

            await dbClient
                .insertInto('system_settings')
                .values({
                    category: 'examination',
                    setting_key: 'examination.global_defaults',
                    setting_value: JSON.stringify({
                        ...DEFAULT_EXAMINATION_GLOBAL_SETTINGS,
                        defaultShuffleQuestions: true,
                        defaultStrictMode: false,
                    }),
                    updated_at: new Date(),
                })
                .onConflict((oc) =>
                    oc.column('setting_key').doUpdateSet({
                        setting_value: JSON.stringify({
                            ...DEFAULT_EXAMINATION_GLOBAL_SETTINGS,
                            defaultShuffleQuestions: true,
                            defaultStrictMode: false,
                        }),
                        updated_at: new Date(),
                    }),
                )
                .execute();

            await ConfigurationService.updateExamConfiguration(
                dbClient,
                exam.exam_id,
                {
                    settings: {
                        shuffleQuestions: false,
                    },
                    configuration: {
                        strictMode: true,
                    },
                } as any,
                institution.id,
            );

            const reverted = await ConfigurationService.updateExamConfiguration(
                dbClient,
                exam.exam_id,
                {
                    settings: {
                        shuffleQuestions: null,
                    },
                    configuration: {
                        strictMode: null,
                    },
                } as any,
                institution.id,
            );

            expect(reverted.settings.shuffleQuestions).toBe(true);
            expect(reverted.configuration.strictMode).toBe(false);
        },
    );
});
