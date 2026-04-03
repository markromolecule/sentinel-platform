import { HTTPException } from 'hono/http-exception';
import { prisma, type DbClient } from '@sentinel/db';
import {
    buildCreateExamValues,
    buildUpdateExamValues,
} from './services/build-exam-write-values';
import { mapExamDetailResponse, mapExamSummaryResponse } from './services/map-exam-response';
import { createExamData } from './data/create-exam';
import { deleteExamData } from './data/delete-exam';
import { getExamByIdData } from './data/get-exam-by-id';
import { getExamQuestionsData } from './data/get-exam-questions';
import { getExamSectionsData } from './data/get-exam-sections';
import { getExamsData } from './data/get-exams';
import { replaceExamQuestionsData } from './data/replace-exam-questions';
import { replaceExamSectionsData } from './data/replace-exam-sections';
import { updateExamData } from './data/update-exam';
import {
    mapExamStatusFromDb,
    mapExamStatusToDb,
    validateQuestionContentByType,
} from '../assessment/assessment-contracts';
import {
    getExamConfigurationState,
    hasExamConfigurationChanges,
    saveExamConfiguration,
} from '../configuration/configuration.service';
import { assertExamScheduleWindow } from './services/assert-exam-schedule-window';
import { assertExamStructureInput } from './services/assert-exam-structure-input';
import { getExamColumnSupport } from './helper/exam-schema-compat';
import type {
    CreateExamBody,
    GetExamsQuery,
    UpdateExamBody,
} from './exam.dto';

type ExamStructureQuestionInput =
    | NonNullable<CreateExamBody['questions']>[number]
    | NonNullable<UpdateExamBody['questions']>[number];

async function executeExamTransaction<T>(callback: (trx: DbClient) => Promise<T>) {
    return await prisma.$transaction(async (transactionClient) => {
        return await callback((transactionClient as typeof transactionClient & { $kysely: DbClient }).$kysely);
    });
}

function normalizeExamStructureInput(args: {
    questionSections?: CreateExamBody['questionSections'] | UpdateExamBody['questionSections'];
    questions?: CreateExamBody['questions'] | UpdateExamBody['questions'];
    examId: string;
}) {
    assertExamStructureInput({
        questionSections: args.questionSections,
        questions: args.questions,
    });

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
        const [exam, sections, questions, configurationState] = await Promise.all([
            getExamByIdData({ dbClient, id, institutionId }),
            getExamSectionsData({ dbClient, examId: id }),
            getExamQuestionsData({ dbClient, examId: id }),
            getExamConfigurationState(dbClient, id),
        ]);

        if (!exam) {
            throw new HTTPException(404, {
                message: 'Exam not found.',
            });
        }

        return mapExamDetailResponse({
            exam,
            settings: configurationState.settings,
            configuration: configurationState.configuration,
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
        assertExamScheduleWindow({
            startDateTime: body.startDateTime,
            endDateTime: body.endDateTime,
        });

        const sectionColumnSupport = await getExamColumnSupport(dbClient);

        const createdExam = await executeExamTransaction(async (trx) => {
            const exam = await createExamData({
                dbClient: trx,
                values: buildCreateExamValues({
                    body,
                    institutionId,
                    userId,
                    sectionColumnSupport,
                }),
            });

            await saveExamConfiguration({
                dbClient: trx,
                examId: exam.exam_id,
                payload: body,
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

        const sectionColumnSupport = await getExamColumnSupport(dbClient);

        assertExamScheduleWindow({
            startDateTime: body.startDateTime ?? current.scheduled_date,
            endDateTime: body.endDateTime ?? current.end_date_time,
        });

        await executeExamTransaction(async (trx) => {
            const updated = await updateExamData({
                dbClient: trx,
                id,
                institutionId,
                values: buildUpdateExamValues({
                    body,
                    institutionId,
                    userId,
                    sectionColumnSupport,
                }),
            });

            if (!updated) {
                throw new HTTPException(404, {
                    message: 'Exam not found.',
                });
            }

            if (hasExamConfigurationChanges(body)) {
                await saveExamConfiguration({
                    dbClient: trx,
                    examId: id,
                    payload: body,
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

    static async deleteExam(dbClient: DbClient, id: string, institutionId?: string) {
        const deleted = await deleteExamData({
            dbClient,
            id,
            institutionId,
        });

        if (!deleted) {
            throw new HTTPException(404, {
                message: 'Exam not found.',
            });
        }
    }
}
