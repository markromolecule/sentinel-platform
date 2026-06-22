import { type DbClient } from '@sentinel/db';
import { getQuestionBankCollectionsService } from './services/get-question-bank-collections.service';
import { getQuestionBankCollectionByIdService } from './services/get-question-bank-collection-by-id.service';
import { createQuestionBankCollectionService } from './services/create-question-bank-collection.service';
import { updateQuestionBankCollectionService } from './services/update-question-bank-collection.service';
import { addQuestionsToCollectionService } from './services/add-question-bank-collection-questions.service';
import { removeQuestionsFromCollectionService } from './services/remove-question-bank-collection-questions.service';
import { deleteQuestionBankCollectionService } from './services/delete-question-bank-collection.service';
import type {
    CreateQuestionBankCollectionBody,
    GetQuestionBankCollectionsQuery,
    QuestionBankCollectionPageRecord,
    UpdateQuestionBankCollectionBody,
} from './question-bank.dto';

export class QuestionBankService {
    /**
     * @deprecated Use getQuestionBankCollectionsService directly.
     */
    static async getCollections(
        dbClient: DbClient,
        filters: GetQuestionBankCollectionsQuery,
        institutionId?: string,
        userId?: string,
    ): Promise<QuestionBankCollectionPageRecord> {
        return getQuestionBankCollectionsService({
            dbClient,
            filters,
            institutionId,
            userId,
        });
    }

    /**
     * @deprecated Use getQuestionBankCollectionByIdService directly.
     */
    static async getCollectionById(
        dbClient: DbClient,
        id: string,
        institutionId?: string,
        userId?: string,
    ) {
        return getQuestionBankCollectionByIdService({
            dbClient,
            id,
            institutionId,
            userId,
        });
    }

    /**
     * @deprecated Use createQuestionBankCollectionService directly.
     */
    static async createCollection(
        dbClient: DbClient,
        body: CreateQuestionBankCollectionBody,
        institutionId: string | undefined,
        userId: string,
    ) {
        return createQuestionBankCollectionService({
            dbClient,
            body,
            institutionId,
            userId,
        });
    }

    /**
     * @deprecated Use updateQuestionBankCollectionService directly.
     */
    static async updateCollection(
        dbClient: DbClient,
        id: string,
        body: UpdateQuestionBankCollectionBody,
        institutionId: string | undefined,
        userId: string,
    ) {
        return updateQuestionBankCollectionService({
            dbClient,
            id,
            body,
            institutionId,
            userId,
        });
    }

    /**
     * @deprecated Use addQuestionsToCollectionService directly.
     */
    static async addQuestionsToCollection(
        dbClient: DbClient,
        id: string,
        questionIds: string[],
        questions: CreateQuestionBankCollectionBody['questions'] | undefined,
        userId: string,
        institutionId?: string,
    ) {
        return addQuestionsToCollectionService({
            dbClient,
            id,
            questionIds,
            questions,
            userId,
            institutionId,
        });
    }

    /**
     * @deprecated Use removeQuestionsFromCollectionService directly.
     */
    static async removeQuestionsFromCollection(
        dbClient: DbClient,
        id: string,
        questionIds: string[],
        userId: string,
        institutionId?: string,
    ) {
        return removeQuestionsFromCollectionService({
            dbClient,
            id,
            questionIds,
            userId,
            institutionId,
        });
    }

    /**
     * @deprecated Use deleteQuestionBankCollectionService directly.
     */
    static async deleteCollection(dbClient: DbClient, id: string, institutionId?: string) {
        return deleteQuestionBankCollectionService({
            dbClient,
            id,
            institutionId,
        });
    }
}
