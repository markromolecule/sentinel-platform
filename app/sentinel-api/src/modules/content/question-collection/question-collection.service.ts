import { type DbClient } from '@sentinel/db';
import type {
    CreateQuestionCollectionBody,
    GetQuestionCollectionsQuery,
    UpdateQuestionCollectionBody,
} from './question-collection.dto';
import { addQuestionsToCollection } from './services/add-questions-to-collection';
import { createQuestionCollection } from './services/create-question-collection';
import { deleteQuestionCollection } from './services/delete-question-collection';
import { getQuestionCollectionDetailOrThrow } from './services/get-question-collection-detail';
import { getQuestionCollections } from './services/get-question-collections';
import { removeQuestionsFromCollection } from './services/remove-questions-from-collection';
import { updateQuestionCollection } from './services/update-question-collection';

export class QuestionCollectionService {
    static async getCollections(
        dbClient: DbClient,
        filters: GetQuestionCollectionsQuery,
        institutionId?: string,
    ) {
        return await getQuestionCollections(dbClient, filters, institutionId);
    }

    static async getCollectionById(dbClient: DbClient, id: string, institutionId?: string) {
        return await getQuestionCollectionDetailOrThrow({
            institutionId,
            dbClient,
            id,
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
        institutionId?: string,
    ) {
        return await addQuestionsToCollection({
            dbClient,
            id,
            questionIds,
            institutionId,
        });
    }

    static async removeQuestionsFromCollection(
        dbClient: DbClient,
        id: string,
        questionIds: string[],
        institutionId?: string,
    ) {
        return await removeQuestionsFromCollection({
            dbClient,
            id,
            questionIds,
            institutionId,
        });
    }

    static async deleteCollection(dbClient: DbClient, id: string, institutionId?: string) {
        await deleteQuestionCollection({
            dbClient,
            id,
            institutionId,
        });
    }
}
