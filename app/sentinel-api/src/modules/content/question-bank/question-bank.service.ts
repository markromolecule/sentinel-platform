import { HTTPException } from 'hono/http-exception';
import { type DbClient, executeTransaction } from '@sentinel/db';
import { removeLinkedExamQuestionsBySourceQuestionIds } from '../../examination/exams/services/remove-linked-exam-questions';
import { archiveQuestionsData } from '../question/data/archive-questions';
import { addQuestionBankCollectionQuestionsData } from './data/add-question-bank-collection-questions';
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
        userId?: string,
    ) {
        const records = await getQuestionBankCollectionsData({
            dbClient,
            institutionId,
            filters,
            userId: userId ?? '',
        });

        return records.map((record) =>
            mapQuestionBankCollectionResponse({
                record,
                questionIds: [],
            }),
        );
    }

    static async getCollectionById(
        dbClient: DbClient,
        id: string,
        institutionId?: string,
        userId?: string,
    ) {
        return await getQuestionBankCollectionDetailOrThrow({
            dbClient,
            id,
            institutionId,
            userId: userId ?? '',
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

        const createdCollection = await executeTransaction(async (trx) => {
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
            userId,
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
            resolveQuestionBankCollectionInstitutionId(institutionId, body.institutionId) ??
                undefined,
            userId,
        );
    }

    static async addQuestionsToCollection(
        dbClient: DbClient,
        id: string,
        questionIds: string[],
        questions: CreateQuestionBankCollectionBody['questions'] | undefined,
        userId: string,
        institutionId?: string,
    ) {
        await executeTransaction(async (trx) => {
            await getQuestionBankCollectionOrThrow({
                dbClient: trx,
                id,
                institutionId,
                userId,
            });

            const existingLinks = await getQuestionBankCollectionQuestionLinksData({
                dbClient: trx,
                collectionId: id,
            });
            const existingIds = new Set(
                existingLinks.map((item) => item.question_bank_question_id),
            );
            const nextOrderIndex = existingLinks.length;
            const createdQuestionIds = await createQuestionBankQuestions({
                dbClient: trx,
                questions,
                institutionId: institutionId ?? null,
                userId,
            });
            const candidateQuestionIds = [...questionIds, ...createdQuestionIds];
            const newQuestionIds = candidateQuestionIds.filter(
                (questionId) => !existingIds.has(questionId),
            );

            await addQuestionBankCollectionQuestionsData({
                dbClient: trx,
                values: buildQuestionBankCollectionQuestionLinkValues({
                    collectionId: id,
                    questionIds: newQuestionIds,
                    startOrderIndex: nextOrderIndex,
                }),
            });
        });

        return await this.getCollectionById(dbClient, id, institutionId, userId);
    }

    static async removeQuestionsFromCollection(
        dbClient: DbClient,
        id: string,
        questionIds: string[],
        userId: string,
        institutionId?: string,
    ) {
        await getQuestionBankCollectionOrThrow({
            dbClient,
            id,
            institutionId,
            userId,
        });

        await executeTransaction(async (trx) => {
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

            await removeLinkedExamQuestionsBySourceQuestionIds({
                dbClient: trx,
                questionIds,
                sourceCollectionId: id,
            });
        });

        return await this.getCollectionById(dbClient, id, institutionId, userId);
    }

    static async deleteCollection(dbClient: DbClient, id: string, institutionId?: string) {
        const deleted = await executeTransaction(async (trx) => {
            const existingLinks = await getQuestionBankCollectionQuestionLinksData({
                dbClient: trx,
                collectionId: id,
            });

            const deletedCollection = await deleteQuestionBankCollectionData({
                dbClient: trx,
                id,
                institutionId,
            });

            if (!deletedCollection) {
                return null;
            }

            const linkedQuestionIds = existingLinks.map((link) => link.question_bank_question_id);

            if (linkedQuestionIds.length > 0) {
                await removeLinkedExamQuestionsBySourceQuestionIds({
                    dbClient: trx,
                    questionIds: linkedQuestionIds,
                    sourceCollectionId: id,
                });

                const remainingLinks = await trx
                    .selectFrom('question_bank_collection_questions')
                    .select('question_bank_question_id')
                    .where('question_bank_question_id', 'in', linkedQuestionIds)
                    .execute();

                const remainingQuestionIds = new Set(
                    remainingLinks.map((link) => link.question_bank_question_id),
                );
                const orphanQuestionIds = linkedQuestionIds.filter(
                    (questionId) => !remainingQuestionIds.has(questionId),
                );

                await archiveQuestionsData({
                    dbClient: trx,
                    ids: orphanQuestionIds,
                    institutionId,
                    archivedAt: new Date(),
                });
            }

            return deletedCollection;
        });

        if (!deleted) {
            throw new HTTPException(404, {
                message: 'Collection not found.',
            });
        }
    }
}
