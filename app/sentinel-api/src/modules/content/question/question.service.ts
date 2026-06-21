import { type DbClient } from '@sentinel/db';
import {
    type CreateQuestionBody,
    type GetQuestionsQuery,
    type UpdateQuestionBody,
} from './question.dto';
import { getQuestionsService } from './services/get-questions.service';
import { getQuestionByIdService } from './services/get-questions.service';
import { createQuestionService } from './services/create-question.service';
import { updateQuestionService } from './services/update-question.service';
import { deleteQuestionService } from './services/delete-question.service';

export class QuestionService {
    /**
     * Fetches questions with the current user's visibility context applied.
     *
     * @deprecated Use getQuestionsService directly
     */
    static async getQuestions(
        dbClient: DbClient,
        filters: GetQuestionsQuery,
        institutionId?: string,
        userId?: string,
    ) {
        return getQuestionsService({ dbClient, filters, institutionId, userId });
    }

    /**
     * @deprecated Use getQuestionByIdService directly
     */
    static async getQuestionById(dbClient: DbClient, id: string, institutionId?: string) {
        return getQuestionByIdService({ dbClient, id, institutionId });
    }

    /**
     * @deprecated Use createQuestionService directly
     */
    static async createQuestion(
        dbClient: DbClient,
        body: CreateQuestionBody,
        institutionId: string | undefined,
        userId: string,
    ) {
        return createQuestionService({ dbClient, body, institutionId, userId });
    }

    /**
     * @deprecated Use updateQuestionService directly
     */
    static async updateQuestion(
        dbClient: DbClient,
        id: string,
        body: UpdateQuestionBody,
        institutionId: string | undefined,
        userId: string,
    ) {
        return updateQuestionService({ dbClient, id, body, institutionId, userId });
    }

    /**
     * @deprecated Use deleteQuestionService directly
     */
    static async deleteQuestion(dbClient: DbClient, id: string, institutionId?: string) {
        return deleteQuestionService({ dbClient, id, institutionId });
    }
}
