import { HTTPException } from 'hono/http-exception';
import { type DbClient } from '@sentinel/db';
import { validateQuestionContentByType } from '../_shared/assessment-contracts';
import {
    addQuestionBankCollectionQuestionsData,
} from './data/add-question-bank-collection-questions';
import { clearQuestionBankCollectionQuestionsData } from './data/clear-question-bank-collection-questions';
import { createQuestionBankCollectionData } from './data/create-question-bank-collection';
import { deleteQuestionBankCollectionData } from './data/delete-question-bank-collection';
import { getQuestionBankCollectionByIdData } from './data/get-question-bank-collection-by-id';
import { getQuestionBankCollectionQuestionLinksData } from './data/get-question-bank-collection-question-links';
import { getQuestionBankCollectionQuestionsData } from './data/get-question-bank-collection-questions';
import { getQuestionBankCollectionsData } from './data/get-question-bank-collections';
import { updateQuestionBankCollectionData } from './data/update-question-bank-collection';
import { mapQuestionBankCollectionDetailResponse, mapQuestionBankCollectionResponse } from './services/map-question-bank-collection-response';
import type {
    CreateQuestionBankCollectionBody,
    GetQuestionBankCollectionsQuery,
    UpdateQuestionBankCollectionBody,
} from './question-bank.dto';
import { createQuestionData } from '../question/data/create-question';
import { mapQuestionResponse } from '../question/services/map-question-response';

export class QuestionBankService {
    static async getCollections(
        dbClient: DbClient,
        filters: GetQuestionBankCollectionsQuery,
        institutionId?: string,
    ) {
        const records = await getQuestionBankCollectionsData({
            dbClient,
            institutionId,
            filters,
        });

        return records.map((record) =>
            mapQuestionBankCollectionResponse({
                record,
                questionIds: [],
            }),
        );
    }

    static async getCollectionById(dbClient: DbClient, id: string, institutionId?: string) {
        const record = await getQuestionBankCollectionByIdData({
            dbClient,
            id,
            institutionId,
        });

        if (!record) {
            throw new HTTPException(404, {
                message: 'Collection not found.',
            });
        }

        const [questionLinks, questionRecords] = await Promise.all([
            getQuestionBankCollectionQuestionLinksData({
                dbClient,
                collectionId: id,
            }),
            getQuestionBankCollectionQuestionsData({
                dbClient,
                collectionId: id,
            }),
        ]);

        return mapQuestionBankCollectionDetailResponse({
            record,
            questionIds: questionLinks.map((item) => item.question_bank_question_id),
            questions: questionRecords.map(mapQuestionResponse),
        });
    }

    static async createCollection(
        dbClient: DbClient,
        body: CreateQuestionBankCollectionBody,
        institutionId: string | undefined,
        userId: string,
    ) {
        const scopedInstitutionId = institutionId ?? body.institutionId ?? null;

        const createdCollection = await dbClient.transaction().execute(async (trx) => {
            const collection = await createQuestionBankCollectionData({
                dbClient: trx,
                values: {
                    institution_id: scopedInstitutionId,
                    name: body.name,
                    description: body.description ?? null,
                    tags: body.tags ?? [],
                    is_public: body.isPublic ?? false,
                    created_by: userId,
                    updated_by: userId,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            });

            const createdQuestionIds: string[] = [];

            if (body.questions?.length) {
                for (const item of body.questions) {
                    const validatedContent = validateQuestionContentByType(item.type, item.content);
                    const question = await createQuestionData({
                        dbClient: trx,
                        values: {
                            institution_id: scopedInstitutionId,
                            subject_id: item.subjectId ?? null,
                            created_by: userId,
                            updated_by: userId,
                            question_type: item.type,
                            content: validatedContent,
                            points: item.points,
                            tags: item.tags ?? [],
                            created_at: new Date(),
                            updated_at: new Date(),
                        },
                    });

                    createdQuestionIds.push(question.question_bank_question_id);
                }
            }

            const orderedQuestionIds = [...(body.questionIds ?? []), ...createdQuestionIds];

            if (orderedQuestionIds.length) {
                await addQuestionBankCollectionQuestionsData({
                    dbClient: trx,
                    values: orderedQuestionIds.map((questionId, index) => ({
                        collection_id: collection.collection_id,
                        question_bank_question_id: questionId,
                        order_index: index,
                        added_at: new Date(),
                    })),
                });
            }

            return collection;
        });

        return await this.getCollectionById(
            dbClient,
            createdCollection.collection_id,
            scopedInstitutionId ?? undefined,
        );
    }

    static async updateCollection(
        dbClient: DbClient,
        id: string,
        body: UpdateQuestionBankCollectionBody,
        institutionId: string | undefined,
        userId: string,
    ) {
        const updated = await updateQuestionBankCollectionData({
            dbClient,
            id,
            institutionId,
            values: {
                name: body.name,
                description: body.description === undefined ? undefined : body.description,
                tags: body.tags,
                is_public: body.isPublic,
                updated_by: userId,
                updated_at: new Date(),
            },
        });

        if (!updated) {
            throw new HTTPException(404, {
                message: 'Collection not found.',
            });
        }

        return await this.getCollectionById(
            dbClient,
            id,
            institutionId ?? body.institutionId ?? undefined,
        );
    }

    static async addQuestionsToCollection(
        dbClient: DbClient,
        id: string,
        questionIds: string[],
        institutionId?: string,
    ) {
        const collection = await getQuestionBankCollectionByIdData({
            dbClient,
            id,
            institutionId,
        });

        if (!collection) {
            throw new HTTPException(404, {
                message: 'Collection not found.',
            });
        }

        const existingLinks = await getQuestionBankCollectionQuestionLinksData({
            dbClient,
            collectionId: id,
        });
        const existingIds = new Set(existingLinks.map((item) => item.question_bank_question_id));
        const nextOrderIndex = existingLinks.length;
        const newQuestionIds = questionIds.filter((questionId) => !existingIds.has(questionId));

        await addQuestionBankCollectionQuestionsData({
            dbClient,
            values: newQuestionIds.map((questionId, index) => ({
                collection_id: id,
                question_bank_question_id: questionId,
                order_index: nextOrderIndex + index,
                added_at: new Date(),
            })),
        });

        return await this.getCollectionById(dbClient, id, institutionId);
    }

    static async removeQuestionsFromCollection(
        dbClient: DbClient,
        id: string,
        questionIds: string[],
        institutionId?: string,
    ) {
        const collection = await getQuestionBankCollectionByIdData({
            dbClient,
            id,
            institutionId,
        });

        if (!collection) {
            throw new HTTPException(404, {
                message: 'Collection not found.',
            });
        }

        await dbClient.transaction().execute(async (trx) => {
            const existingLinks = await getQuestionBankCollectionQuestionLinksData({
                dbClient: trx,
                collectionId: id,
            });

            const questionIdSet = new Set(questionIds);
            const remainingLinks = existingLinks.filter(
                (item) => !questionIdSet.has(item.question_bank_question_id),
            );

            await clearQuestionBankCollectionQuestionsData({
                dbClient: trx,
                collectionId: id,
            });

            if (remainingLinks.length > 0) {
                await addQuestionBankCollectionQuestionsData({
                    dbClient: trx,
                    values: remainingLinks.map((item, index) => ({
                        collection_id: item.collection_id,
                        question_bank_question_id: item.question_bank_question_id,
                        order_index: index,
                        added_at: item.added_at ?? new Date(),
                    })),
                });
            }
        });

        return await this.getCollectionById(dbClient, id, institutionId);
    }

    static async deleteCollection(dbClient: DbClient, id: string, institutionId?: string) {
        const deleted = await deleteQuestionBankCollectionData({
            dbClient,
            id,
            institutionId,
        });

        if (!deleted) {
            throw new HTTPException(404, {
                message: 'Collection not found.',
            });
        }
    }
}
