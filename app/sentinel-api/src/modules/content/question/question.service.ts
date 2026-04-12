import { HTTPException } from 'hono/http-exception';
import { type DbClient, executeTransaction } from '@sentinel/db';
import { validateQuestionContentByType } from '../../examination/assessment/assessment-contracts';
import { removeLinkedExamQuestionsBySourceQuestionIds } from '../../examination/exams/services/remove-linked-exam-questions';
import type { CreateQuestionBody, GetQuestionsQuery, UpdateQuestionBody } from './question.dto';
import { createQuestionData } from './data/create-question';
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
}) {
    const sourceOrigin = args.sourceOrigin === 'AI_PDF' ? 'AI_PDF' : 'MANUAL';

    if (sourceOrigin === 'AI_PDF') {
        return {
            source_origin: sourceOrigin,
            source_file_name: args.sourceFileName ?? null,
            source_page_number: args.sourcePageNumber ?? null,
            source_evidence: args.sourceEvidence ?? null,
        };
    }

    return {
        source_origin: 'MANUAL' as const,
        source_file_name: null,
        source_page_number: null,
        source_evidence: null,
    };
}

export class QuestionService {
    static async getQuestions(
        dbClient: DbClient,
        filters: GetQuestionsQuery,
        institutionId?: string,
    ) {
        const page = await getQuestionsData({
            dbClient,
            institutionId,
            filters,
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
                updated_by: userId,
                updated_at: new Date(),
            },
        });

        if (!updated) {
            throw new HTTPException(404, {
                message: 'Question not found.',
            });
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
    }
}
