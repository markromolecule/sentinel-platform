import { type DbClient } from '@sentinel/db';
import type { CreateFeedbackSchemaValues, GetFeedbacksQuery } from '@sentinel/shared/schema';
import { createFeedback } from './services/create-feedback.service';
import { getFeedback } from './services/get-feedback.service';
import { getFeedbacks } from './services/get-feedbacks.service';

export class FeedbackService {
    /**
     * Creates one feedback record for a student's completed exam attempt.
     */
    static async createFeedback(
        dbClient: DbClient,
        args: { userId: string; payload: CreateFeedbackSchemaValues },
    ) {
        return await createFeedback(dbClient, args);
    }

    /**
     * Returns a single feedback record under the caller's institution scope.
     */
    static async getFeedback(
        dbClient: DbClient,
        args: {
            feedbackId: string;
            institutionId?: string;
            canViewAllInstitutions?: boolean;
        },
    ) {
        return await getFeedback(dbClient, args);
    }

    /**
     * Returns paginated feedback records under the caller's scope.
     */
    static async getFeedbacks(
        dbClient: DbClient,
        args: GetFeedbacksQuery & {
            institutionId?: string;
            canViewAllInstitutions?: boolean;
        },
    ) {
        return await getFeedbacks(dbClient, args);
    }
}
