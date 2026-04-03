import { HTTPException } from 'hono/http-exception';
import { type DbClient } from '@sentinel/db';
import {
    buildCreateExamValues,
    buildUpdateExamValues,
} from './services/build-exam-write-values';
import { mapExamDetailResponse, mapExamSummaryResponse } from './services/map-exam-response';
import { createExamData } from './data/create-exam';
import { getExamByIdData } from './data/get-exam-by-id';
import { getExamConfigurationData } from './data/get-exam-configuration';
import { getExamQuestionsData } from './data/get-exam-questions';
import { getExamSectionsData } from './data/get-exam-sections';
import { getExamsData } from './data/get-exams';
import { replaceExamQuestionsData } from './data/replace-exam-questions';
import { replaceExamSectionsData } from './data/replace-exam-sections';
import { updateExamData } from './data/update-exam';
import { upsertExamConfigurationData } from './data/upsert-exam-configuration';
import {
    mapExamStatusFromDb,
    mapExamStatusToDb,
    validateQuestionContentByType,
} from '../_shared/assessment-contracts';
import type {
    CreateExamBody,
    GetExamsQuery,
    UpdateExamBody,
} from './exam.dto';

type ExamStructureQuestionInput =
    | NonNullable<CreateExamBody['questions']>[number]
    | NonNullable<UpdateExamBody['questions']>[number];

function buildResolvedSettings(args: {
    payload:
        | Pick<
              CreateExamBody,
              | 'shuffleQuestions'
              | 'showCorrectAnswers'
              | 'allowReview'
              | 'randomizeChoices'
              | 'settings'
          >
        | Pick<
              UpdateExamBody,
              | 'shuffleQuestions'
              | 'showCorrectAnswers'
              | 'allowReview'
              | 'randomizeChoices'
              | 'settings'
          >;
    fallback?: {
        shuffleQuestions: boolean;
        showCorrectAnswers: boolean;
        allowReview: boolean;
        randomizeChoices: boolean;
    };
}) {
    const { payload, fallback } = args;

    return {
        shuffleQuestions:
            payload.settings?.shuffleQuestions ??
            payload.shuffleQuestions ??
            fallback?.shuffleQuestions ??
            false,
        showCorrectAnswers:
            payload.settings?.showCorrectAnswers ??
            payload.showCorrectAnswers ??
            fallback?.showCorrectAnswers ??
            false,
        allowReview:
            payload.settings?.allowReview ?? payload.allowReview ?? fallback?.allowReview ?? false,
        randomizeChoices:
            payload.settings?.randomizeChoices ??
            payload.randomizeChoices ??
            fallback?.randomizeChoices ??
            false,
    };
}

function buildDefaultConfiguration(settings: ReturnType<typeof buildResolvedSettings>) {
    return {
        ...settings,
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

function normalizeExamStructureInput(args: {
    questionSections?: CreateExamBody['questionSections'] | UpdateExamBody['questionSections'];
    questions?: CreateExamBody['questions'] | UpdateExamBody['questions'];
    examId: string;
}) {
    const questionSections = args.questionSections ?? [];
    const questions = args.questions ?? [];

    const normalizedSections = questionSections.map((section, index) => ({
        exam_section_id: section.id ?? crypto.randomUUID(),
        exam_id: args.examId,
        title: section.title,
        order_index: section.orderIndex ?? index,
        created_at: new Date(),
        updated_at: new Date(),
    }));

    const validSectionIds = new Set(normalizedSections.map((section) => section.exam_section_id));

    const normalizedQuestions = questions.map((question, index) => {
        if (question.sectionId && !validSectionIds.has(question.sectionId)) {
            throw new HTTPException(400, {
                message: `Question section ${question.sectionId} does not exist in the submitted exam structure.`,
            });
        }

        return {
            question_id: question.id ?? crypto.randomUUID(),
            exam_id: args.examId,
            exam_section_id: question.sectionId ?? null,
            source_question_bank_question_id: question.sourceQuestionBankQuestionId ?? null,
            question_type: question.type,
            content: validateQuestionContentByType(question.type, question.content),
            points: question.points,
            order_index: question.orderIndex ?? index,
            created_at: new Date(),
            updated_at: new Date(),
        };
    });

    return {
        normalizedSections,
        normalizedQuestions,
    };
}

export class ExamService {
    static async getExams(
        dbClient: DbClient,
        filters: GetExamsQuery,
        institutionId?: string,
    ) {
        const records = await getExamsData({
            dbClient,
            institutionId,
            filters,
        });

        return records.map(mapExamSummaryResponse);
    }

    static async getExamById(dbClient: DbClient, id: string, institutionId?: string) {
        const [exam, sections, questions, configuration] = await Promise.all([
            getExamByIdData({ dbClient, id, institutionId }),
            getExamSectionsData({ dbClient, examId: id }),
            getExamQuestionsData({ dbClient, examId: id }),
            getExamConfigurationData({ dbClient, examId: id }),
        ]);

        if (!exam) {
            throw new HTTPException(404, {
                message: 'Exam not found.',
            });
        }

        const settings = {
            shuffleQuestions: configuration?.shuffle_questions ?? false,
            showCorrectAnswers: configuration?.show_correct_answers ?? false,
            allowReview: configuration?.allow_review ?? false,
            randomizeChoices: configuration?.randomize_choices ?? false,
        };

        const mappedConfiguration = {
            maxReconnectAttempts: configuration?.max_reconnect_attempts ?? 3,
            strictMode: configuration?.strict_mode ?? true,
            cameraRequired: configuration?.camera_required ?? true,
            micRequired: configuration?.mic_required ?? true,
            screenLock: configuration?.screen_lock ?? true,
            autoSubmitTimeoutMinutes: configuration?.auto_submit_timeout_minutes ?? 5,
            allowedDevices: configuration?.allowed_devices ?? [],
            aiRules: (configuration?.ai_rules as Record<string, boolean> | null) ?? buildDefaultConfiguration(settings).aiRules,
        };

        return mapExamDetailResponse({
            exam,
            settings,
            configuration: mappedConfiguration,
            questionSections: sections.map((section) => ({
                id: section.exam_section_id,
                title: section.title,
                orderIndex: section.order_index,
            })),
            questions: questions.map((question) => ({
                id: question.question_id,
                examId: question.exam_id,
                sectionId: question.exam_section_id,
                sourceQuestionBankQuestionId: question.source_question_bank_question_id,
                type: question.question_type as any,
                points: question.points,
                orderIndex: question.order_index,
                content: question.content as any,
            })),
        });
    }

    static async createExam(
        dbClient: DbClient,
        body: CreateExamBody,
        institutionId: string | undefined,
        userId: string,
    ) {
        const createdExam = await dbClient.transaction().execute(async (trx) => {
            const exam = await createExamData({
                dbClient: trx,
                values: buildCreateExamValues({
                    body,
                    institutionId,
                    userId,
                }),
            });

            const settings = buildResolvedSettings({
                payload: body,
            });
            const configuration = {
                ...buildDefaultConfiguration(settings),
                ...(body.configuration ?? {}),
            };

            await upsertExamConfigurationData({
                dbClient: trx,
                examId: exam.exam_id,
                createValues: {
                    exam_id: exam.exam_id,
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

            const structure = normalizeExamStructureInput({
                examId: exam.exam_id,
                questionSections: body.questionSections,
                questions: body.questions,
            });

            await replaceExamSectionsData({
                dbClient: trx,
                examId: exam.exam_id,
                sections: structure.normalizedSections,
            });

            await replaceExamQuestionsData({
                dbClient: trx,
                examId: exam.exam_id,
                questions: structure.normalizedQuestions,
            });

            await updateExamData({
                dbClient: trx,
                id: exam.exam_id,
                institutionId: institutionId ?? body.institutionId ?? undefined,
                values: {
                    question_count: structure.normalizedQuestions.length,
                    updated_at: new Date(),
                    updated_by: userId,
                },
            });

            return exam;
        });

        return await this.getExamById(
            dbClient,
            createdExam.exam_id,
            institutionId ?? body.institutionId ?? undefined,
        );
    }

    static async updateExam(
        dbClient: DbClient,
        id: string,
        body: UpdateExamBody,
        institutionId: string | undefined,
        userId: string,
    ) {
        const current = await getExamByIdData({
            dbClient,
            id,
            institutionId,
        });

        if (!current) {
            throw new HTTPException(404, {
                message: 'Exam not found.',
            });
        }

        await dbClient.transaction().execute(async (trx) => {
            const updated = await updateExamData({
                dbClient: trx,
                id,
                institutionId,
                values: buildUpdateExamValues({
                    body,
                    institutionId,
                    userId,
                }),
            });

            if (!updated) {
                throw new HTTPException(404, {
                    message: 'Exam not found.',
                });
            }

            if (
                body.settings ||
                body.configuration ||
                body.shuffleQuestions !== undefined ||
                body.showCorrectAnswers !== undefined ||
                body.allowReview !== undefined ||
                body.randomizeChoices !== undefined
            ) {
                const currentConfiguration = await getExamConfigurationData({
                    dbClient: trx,
                    examId: id,
                });
                const settings = buildResolvedSettings({
                    payload: body,
                    fallback: {
                        shuffleQuestions: currentConfiguration?.shuffle_questions ?? false,
                        showCorrectAnswers: currentConfiguration?.show_correct_answers ?? false,
                        allowReview: currentConfiguration?.allow_review ?? false,
                        randomizeChoices: currentConfiguration?.randomize_choices ?? false,
                    },
                });
                const defaultConfiguration = buildDefaultConfiguration(settings);

                await upsertExamConfigurationData({
                    dbClient: trx,
                    examId: id,
                    createValues: {
                        exam_id: id,
                        shuffle_questions: settings.shuffleQuestions,
                        show_correct_answers: settings.showCorrectAnswers,
                        allow_review: settings.allowReview,
                        randomize_choices: settings.randomizeChoices,
                        max_reconnect_attempts:
                            body.configuration?.maxReconnectAttempts ??
                            currentConfiguration?.max_reconnect_attempts ??
                            defaultConfiguration.maxReconnectAttempts,
                        strict_mode:
                            body.configuration?.strictMode ??
                            currentConfiguration?.strict_mode ??
                            defaultConfiguration.strictMode,
                        camera_required:
                            body.configuration?.cameraRequired ??
                            currentConfiguration?.camera_required ??
                            defaultConfiguration.cameraRequired,
                        mic_required:
                            body.configuration?.micRequired ??
                            currentConfiguration?.mic_required ??
                            defaultConfiguration.micRequired,
                        screen_lock:
                            body.configuration?.screenLock ??
                            currentConfiguration?.screen_lock ??
                            defaultConfiguration.screenLock,
                        auto_submit_timeout_minutes:
                            body.configuration?.autoSubmitTimeoutMinutes ??
                            currentConfiguration?.auto_submit_timeout_minutes ??
                            defaultConfiguration.autoSubmitTimeoutMinutes,
                        allowed_devices:
                            body.configuration?.allowedDevices ??
                            currentConfiguration?.allowed_devices ??
                            defaultConfiguration.allowedDevices,
                        ai_rules:
                            body.configuration?.aiRules ??
                            (currentConfiguration?.ai_rules as Record<string, boolean> | null) ??
                            defaultConfiguration.aiRules,
                        created_at: new Date(),
                        updated_at: new Date(),
                    },
                    updateValues: {
                        shuffle_questions: settings.shuffleQuestions,
                        show_correct_answers: settings.showCorrectAnswers,
                        allow_review: settings.allowReview,
                        randomize_choices: settings.randomizeChoices,
                        max_reconnect_attempts:
                            body.configuration?.maxReconnectAttempts ??
                            currentConfiguration?.max_reconnect_attempts,
                        strict_mode:
                            body.configuration?.strictMode ??
                            currentConfiguration?.strict_mode,
                        camera_required:
                            body.configuration?.cameraRequired ??
                            currentConfiguration?.camera_required,
                        mic_required:
                            body.configuration?.micRequired ??
                            currentConfiguration?.mic_required,
                        screen_lock:
                            body.configuration?.screenLock ??
                            currentConfiguration?.screen_lock,
                        auto_submit_timeout_minutes:
                            body.configuration?.autoSubmitTimeoutMinutes ??
                            currentConfiguration?.auto_submit_timeout_minutes,
                        allowed_devices:
                            body.configuration?.allowedDevices ??
                            currentConfiguration?.allowed_devices,
                        ai_rules:
                            body.configuration?.aiRules ??
                            currentConfiguration?.ai_rules,
                        updated_at: new Date(),
                    },
                });
            }

            if (body.questionSections || body.questions) {
                const currentSections = body.questionSections
                    ? []
                    : await getExamSectionsData({
                          dbClient: trx,
                          examId: id,
                      });
                const currentQuestions = body.questions
                    ? []
                    : await getExamQuestionsData({
                          dbClient: trx,
                          examId: id,
                      });
                const structure = normalizeExamStructureInput({
                    examId: id,
                    questionSections:
                        body.questionSections ??
                        currentSections.map((section) => ({
                            id: section.exam_section_id,
                            title: section.title,
                            orderIndex: section.order_index,
                        })),
                    questions:
                        body.questions ??
                        currentQuestions.map((question) => ({
                            id: question.question_id,
                            sectionId: question.exam_section_id,
                            sourceQuestionBankQuestionId:
                                question.source_question_bank_question_id,
                            type: question.question_type as ExamStructureQuestionInput['type'],
                            points: question.points,
                            orderIndex: question.order_index,
                            content: question.content as ExamStructureQuestionInput['content'],
                        })),
                });

                await replaceExamSectionsData({
                    dbClient: trx,
                    examId: id,
                    sections: structure.normalizedSections,
                });

                await replaceExamQuestionsData({
                    dbClient: trx,
                    examId: id,
                    questions: structure.normalizedQuestions,
                });

                await updateExamData({
                    dbClient: trx,
                    id,
                    institutionId,
                    values: {
                        question_count: structure.normalizedQuestions.length,
                        updated_at: new Date(),
                        updated_by: userId,
                    },
                });
            }
        });

        return await this.getExamById(
            dbClient,
            id,
            institutionId ?? body.institutionId ?? undefined,
        );
    }

    static async updateExamStatus(
        dbClient: DbClient,
        id: string,
        status: string,
        institutionId: string | undefined,
        userId: string,
    ) {
        const updated = await updateExamData({
            dbClient,
            id,
            institutionId,
            values: {
                status: mapExamStatusToDb(status as any) as any,
                published_at: status === 'published' ? new Date() : undefined,
                updated_at: new Date(),
                updated_by: userId,
            },
        });

        if (!updated) {
            throw new HTTPException(404, {
                message: 'Exam not found.',
            });
        }

        return await this.getExamById(dbClient, id, institutionId);
    }
}
