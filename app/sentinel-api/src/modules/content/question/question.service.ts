import { HTTPException } from 'hono/http-exception';
import { type DbClient, executeTransaction } from '@sentinel/db';
import { validateQuestionContentByType } from '../../examination/assessment/assessment-contracts';
import { removeLinkedExamQuestionsBySourceQuestionIds } from '../../examination/exams/services/remove-linked-exam-questions';
import type { CreateQuestionBody, GetQuestionsQuery, UpdateQuestionBody } from './question.dto';
import { createQuestionData } from './data/create-question';
import { LogsService } from '../../general/logs/logs.service';
import { ActivityNotificationService } from '../../general/notification/services/activity-notification.service';
import { deleteQuestionData } from './data/delete-question';
import { getQuestionByIdData } from './data/get-question-by-id';
import { getQuestionsData } from './data/get-questions';
import { updateQuestionData } from './data/update-question';
import { mapQuestionResponse } from './services/map-question-response';

function buildQuestionSourceValues(args: {
    sourceOrigin?: string | null;
    sourceFileName?: string | null;
    sourcePageNumber?: number | null;
    sourceEvidence?: string | null;
    passageContent?: string | null;
    passageType?: string | null;
}) {
    const sourceOrigin = args.sourceOrigin === 'AI_PDF' ? 'AI_PDF' : 'MANUAL';

    if (sourceOrigin === 'AI_PDF') {
        return {
            source_origin: sourceOrigin,
            source_file_name: args.sourceFileName ?? null,
            source_page_number: args.sourcePageNumber ?? null,
            source_evidence: args.sourceEvidence ?? null,
            passage_content: args.passageContent ?? null,
            passage_type: args.passageType === 'html' ? 'html' : 'plain',
        };
    }

    return {
        source_origin: 'MANUAL' as const,
        source_file_name: null,
        source_page_number: null,
        source_evidence: null,
        passage_content: args.passageContent ?? null,
        passage_type: args.passageType === 'html' ? 'html' : 'plain',
    };
}

export class QuestionService {
    /**
     * Fetches questions with the current user's visibility context applied.
     */
    static async getQuestions(
        dbClient: DbClient,
        filters: GetQuestionsQuery,
        institutionId?: string,
        userId?: string,
    ) {
        const page = await getQuestionsData({
            dbClient,
            institutionId,
            filters,
            userId,
        });

        return {
            ...page,
            items: page.items.map(mapQuestionResponse),
        };
    }

    static async getQuestionById(dbClient: DbClient, id: string, institutionId?: string) {
        const record = await getQuestionByIdData({
            dbClient,
            id,
            institutionId,
        });

        if (!record) {
            throw new HTTPException(404, {
                message: 'Question not found.',
            });
        }

        return mapQuestionResponse(record);
    }

    static async createQuestion(
        dbClient: DbClient,
        body: CreateQuestionBody,
        institutionId: string | undefined,
        userId: string,
    ) {
        const content = validateQuestionContentByType(body.type, body.content);

        const created = await createQuestionData({
            dbClient,
            values: {
                subject_id: body.subjectId ?? null,
                institution_id: institutionId ?? body.institutionId ?? null,
                created_by: userId,
                updated_by: userId,
                ...buildQuestionSourceValues({
                    sourceOrigin: body.sourceOrigin,
                    sourceFileName: body.sourceFileName,
                    sourcePageNumber: body.sourcePageNumber,
                    sourceEvidence: body.sourceEvidence,
                    passageContent: body.passageContent,
                    passageType: body.passageType,
                }),
                question_type: body.type,
                difficulty: body.difficulty,
                content,
                points: body.points,
                tags: body.tags ?? [],
                created_at: new Date(),
                updated_at: new Date(),
            },
        });

        // Telemetry logging
        try {
            const instId = institutionId ?? body.institutionId;
            if (instId) {
                await LogsService.createLog(dbClient, {
                    userId,
                    action: 'question.created',
                    resourceType: 'question',
                    resourceId: created.question_bank_question_id,
                    activeInstitutionId: instId,
                    details: { type: body.type, difficulty: body.difficulty },
                });
            }
        } catch (logErr) {
            console.error('Failed to log question.created:', logErr);
        }

        return await this.getQuestionById(
            dbClient,
            created.question_bank_question_id,
            institutionId ?? body.institutionId,
        );
    }

    static async updateQuestion(
        dbClient: DbClient,
        id: string,
        body: UpdateQuestionBody,
        institutionId: string | undefined,
        userId: string,
    ) {
        const current = await getQuestionByIdData({
            dbClient,
            id,
            institutionId,
        });

        if (!current) {
            throw new HTTPException(404, {
                message: 'Question not found.',
            });
        }

        const nextType = body.type ?? current.question_type;
        const nextContent = body.content ?? current.content;
        const validatedContent = validateQuestionContentByType(nextType, nextContent);
        const nextSourceOrigin = body.sourceOrigin ?? current.source_origin;
        const nextSourceValues = buildQuestionSourceValues({
            sourceOrigin: nextSourceOrigin,
            sourceFileName:
                body.sourceFileName === undefined ? current.source_file_name : body.sourceFileName,
            sourcePageNumber:
                body.sourcePageNumber === undefined
                    ? current.source_page_number
                    : body.sourcePageNumber,
            sourceEvidence:
                body.sourceEvidence === undefined ? current.source_evidence : body.sourceEvidence,
            passageContent:
                body.passageContent === undefined ? current.passage_content : body.passageContent,
            passageType:
                body.passageType === undefined ? current.passage_type : body.passageType,
        });

        const updated = await updateQuestionData({
            dbClient,
            id,
            institutionId,
            values: {
                subject_id: body.subjectId === undefined ? current.subject_id : body.subjectId,
                institution_id: institutionId ?? body.institutionId ?? current.institution_id,
                ...nextSourceValues,
                question_type: nextType,
                difficulty: body.difficulty ?? current.difficulty,
                content: validatedContent,
                points: body.points ?? current.points,
                tags: body.tags ?? current.tags,
                status: body.status ?? current.status,
                updated_by: userId,
                updated_at: new Date(),
            },
        });

        if (!updated) {
            throw new HTTPException(404, {
                message: 'Question not found.',
            });
        }

        // Telemetry logging and notifications
        try {
            const instId = institutionId ?? body.institutionId ?? current.institution_id;
            if (instId) {
                await LogsService.createLog(dbClient, {
                    userId,
                    action: 'question.updated',
                    resourceType: 'question',
                    resourceId: id,
                    activeInstitutionId: instId,
                    details: { updatedFields: Object.keys(body) },
                });

                await ActivityNotificationService.notifyInstitutionActivityUpdated({
                    dbClient,
                    actorUserId: userId,
                    institutionId: instId,
                    targetType: 'QUESTION',
                    targetId: id,
                    targetLabel: current.question_type || 'Question',
                    title: 'Question updated',
                    message: `A question of type "${current.question_type}" was updated.`,
                    sourceModule: 'questions',
                    sourceAction: 'update',
                    metadata: {
                        questionId: id,
                    },
                });
            }
        } catch (logErr) {
            console.error('Failed to log or notify question.updated:', logErr);
        }

        return await this.getQuestionById(
            dbClient,
            id,
            institutionId ?? body.institutionId ?? current.institution_id ?? undefined,
        );
    }

    static async deleteQuestion(dbClient: DbClient, id: string, institutionId?: string) {
        const deleted = await executeTransaction(async (trx) => {
            const archivedQuestion = await deleteQuestionData({
                dbClient: trx,
                id,
                institutionId,
                archivedAt: new Date(),
            });

            if (!archivedQuestion) {
                return null;
            }

            await removeLinkedExamQuestionsBySourceQuestionIds({
                dbClient: trx,
                questionIds: [id],
            });

            return archivedQuestion;
        });

        if (!deleted) {
            throw new HTTPException(404, {
                message: 'Question not found.',
            });
        }

        // Telemetry logging and notifications
        try {
            const instId = institutionId || (deleted as any).institution_id;
            if (instId) {
                await LogsService.createLog(dbClient, {
                    userId: '00000000-0000-0000-0000-000000000000',
                    action: 'question.deleted',
                    resourceType: 'question',
                    resourceId: id,
                    activeInstitutionId: instId,
                    details: { id },
                });

                await ActivityNotificationService.notifyInstitutionActivityDeleted({
                    dbClient,
                    actorUserId: '00000000-0000-0000-0000-000000000000',
                    institutionId: instId,
                    targetType: 'QUESTION',
                    targetId: id,
                    targetLabel: (deleted as any).question_type || 'Question',
                    title: 'Question deleted',
                    message: `A question of type "${(deleted as any).question_type || 'Question'}" has been archived.`,
                    sourceModule: 'questions',
                    sourceAction: 'delete',
                    metadata: {
                        questionId: id,
                    },
                });
            }
        } catch (logErr) {
            console.error('Failed to log or notify question.deleted:', logErr);
        }
    }
}
