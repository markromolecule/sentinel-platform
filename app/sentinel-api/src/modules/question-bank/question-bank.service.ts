import { HTTPException } from 'hono/http-exception';
import { type DbClient } from '@sentinel/db';
import {
    addQuestionBankCollectionQuestionsData,
} from './data/add-question-bank-collection-questions';
import { clearQuestionBankCollectionQuestionsData } from './data/clear-question-bank-collection-questions';
import { createQuestionBankCollectionData } from './data/create-question-bank-collection';
import { deleteQuestionBankCollectionData } from './data/delete-question-bank-collection';
import { getQuestionBankCollectionQuestionLinksData } from './data/get-question-bank-collection-question-links';
import { getQuestionBankCollectionsData } from './data/get-question-bank-collections';
import { updateQuestionBankCollectionData } from './data/update-question-bank-collection';
import {
    buildQuestionBankCollectionQuestionLinkValues,
    buildReorderedQuestionBankCollectionQuestionLinkValues,
} from './services/build-question-bank-collection-question-link-values';
import {
    buildCreateQuestionBankCollectionValues,
    buildUpdateQuestionBankCollectionValues,
    resolveQuestionBankCollectionInstitutionId,
} from './services/build-question-bank-collection-write-values';
import { createQuestionBankQuestions } from './services/create-question-bank-questions';
import { getQuestionBankCollectionOrThrow } from './services/assert-question-bank-collection';
import { getQuestionBankCollectionDetailOrThrow } from './services/get-question-bank-collection-detail';
import { mapQuestionBankCollectionResponse } from './services/map-question-bank-collection-response';
import type {
    CreateQuestionBankCollectionBody,
    GetQuestionBankCollectionsQuery,
    UpdateQuestionBankCollectionBody,
} from './question-bank.dto';

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
        return await getQuestionBankCollectionDetailOrThrow({
            dbClient,
            id,
            institutionId,
        });
    }

    static async createCollection(
        dbClient: DbClient,
        body: CreateQuestionBankCollectionBody,
        institutionId: string | undefined,
        userId: string,
    ) {
        const scopedInstitutionId = resolveQuestionBankCollectionInstitutionId(
            institutionId,
            body.institutionId,
        );

        const createdCollection = await dbClient.transaction().execute(async (trx) => {
            const collection = await createQuestionBankCollectionData({
                dbClient: trx,
                values: buildCreateQuestionBankCollectionValues({
                    body,
                    institutionId: scopedInstitutionId,
                    userId,
                }),
            });

            const createdQuestionIds = await createQuestionBankQuestions({
                dbClient: trx,
                questions: body.questions,
                institutionId: scopedInstitutionId,
                userId,
            });
            const orderedQuestionIds = [...(body.questionIds ?? []), ...createdQuestionIds];

            if (orderedQuestionIds.length) {
                await addQuestionBankCollectionQuestionsData({
                    dbClient: trx,
                    values: buildQuestionBankCollectionQuestionLinkValues({
                        collectionId: collection.collection_id,
                        questionIds: orderedQuestionIds,
                    }),
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
            values: buildUpdateQuestionBankCollectionValues({
                body,
                userId,
            }),
        });

        if (!updated) {
            throw new HTTPException(404, {
                message: 'Collection not found.',
            });
        }

        return await this.getCollectionById(
            dbClient,
            id,
            resolveQuestionBankCollectionInstitutionId(institutionId, body.institutionId) ?? undefined,
        );
    }

    static async addQuestionsToCollection(
        dbClient: DbClient,
        id: string,
        questionIds: string[],
        institutionId?: string,
    ) {
        await getQuestionBankCollectionOrThrow({
            dbClient,
            id,
            institutionId,
        });

        const existingLinks = await getQuestionBankCollectionQuestionLinksData({
            dbClient,
            collectionId: id,
        });
        const existingIds = new Set(existingLinks.map((item) => item.question_bank_question_id));
        const nextOrderIndex = existingLinks.length;
        const newQuestionIds = questionIds.filter((questionId) => !existingIds.has(questionId));

        await addQuestionBankCollectionQuestionsData({
            dbClient,
            values: buildQuestionBankCollectionQuestionLinkValues({
                collectionId: id,
                questionIds: newQuestionIds,
                startOrderIndex: nextOrderIndex,
            }),
        });

        return await this.getCollectionById(dbClient, id, institutionId);
    }

    static async removeQuestionsFromCollection(
        dbClient: DbClient,
        id: string,
        questionIds: string[],
        institutionId?: string,
    ) {
        await getQuestionBankCollectionOrThrow({
            dbClient,
            id,
            institutionId,
        });

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
                    values: buildReorderedQuestionBankCollectionQuestionLinkValues(remainingLinks),
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
