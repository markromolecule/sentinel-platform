import { HTTPException } from 'hono/http-exception';
import { type DbClient } from '@sentinel/db';
import { validateQuestionContentByType } from '@/modules/examination/assessment/assessment-contracts';
import type { CreateQuestionBody, GetQuestionsQuery, UpdateQuestionBody } from './question.dto';
import { createQuestionData } from './data/create-question';
import { deleteQuestionData } from './data/delete-question';
import { getQuestionByIdData } from './data/get-question-by-id';
import { getQuestionsData } from './data/get-questions';
import { updateQuestionData } from './data/update-question';
import { mapQuestionResponse } from './services/map-question-response';

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

        const updated = await updateQuestionData({
            dbClient,
            id,
            institutionId,
            values: {
                subject_id: body.subjectId === undefined ? current.subject_id : body.subjectId,
                institution_id: institutionId ?? body.institutionId ?? current.institution_id,
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
        const deleted = await deleteQuestionData({
            dbClient,
            id,
            institutionId,
            archivedAt: new Date(),
        });

        if (!deleted) {
            throw new HTTPException(404, {
                message: 'Question not found.',
            });
        }
    }
}
