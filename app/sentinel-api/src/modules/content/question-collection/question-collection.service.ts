import { type DbClient } from '@sentinel/db';
import type {
    CreateQuestionCollectionBody,
    GetQuestionCollectionsQuery,
    QuestionCollectionPageRecord,
    UpdateQuestionCollectionBody,
} from './question-collection.dto';
import { addQuestionsToCollection } from './services/add-questions-to-collection.service';
import { createQuestionCollection } from './services/create-question-collection.service';
import { deleteQuestionCollection } from './services/delete-question-collection.service';
import { getQuestionCollectionDetailOrThrow } from './services/get-question-collection-detail.service';
import { getQuestionCollections } from './services/get-question-collections.service';
import { removeQuestionsFromCollection } from './services/remove-questions-from-collection.service';
import { updateQuestionCollection } from './services/update-question-collection.service';

export class QuestionCollectionService {
    static async getCollections(
        dbClient: DbClient,
        filters: GetQuestionCollectionsQuery,
        userId: string,
        institutionId?: string,
    ): Promise<QuestionCollectionPageRecord> {
        return await getQuestionCollections(dbClient, filters, userId, institutionId);
    }

    static async getCollectionById(
        dbClient: DbClient,
        id: string,
        userId: string,
        institutionId?: string,
    ) {
        return await getQuestionCollectionDetailOrThrow({
            institutionId,
            dbClient,
            id,
            userId,
        });
    }

    static async createCollection(
        dbClient: DbClient,
        body: CreateQuestionCollectionBody,
        institutionId: string | undefined,
        userId: string,
    ) {
        return await createQuestionCollection({
            dbClient,
            body,
            institutionId,
            userId,
        });
    }

    static async updateCollection(
        dbClient: DbClient,
        id: string,
        body: UpdateQuestionCollectionBody,
        institutionId: string | undefined,
        userId: string,
    ) {
        return await updateQuestionCollection({
            dbClient,
            id,
            body,
            institutionId,
            userId,
        });
    }

    static async addQuestionsToCollection(
        dbClient: DbClient,
        id: string,
        questionIds: string[],
        userId: string,
        institutionId?: string,
    ) {
        return await addQuestionsToCollection({
            dbClient,
            id,
            questionIds,
            userId,
            institutionId,
        });
    }

    static async removeQuestionsFromCollection(
        dbClient: DbClient,
        id: string,
        questionIds: string[],
        userId: string,
        institutionId?: string,
    ) {
        return await removeQuestionsFromCollection({
            dbClient,
            id,
            questionIds,
            userId,
            institutionId,
        });
    }

    static async deleteCollection(
        dbClient: DbClient,
        id: string,
        userId: string,
        institutionId?: string,
    ) {
        await deleteQuestionCollection({
            dbClient,
            id,
            userId,
            institutionId,
        });
    }
}
