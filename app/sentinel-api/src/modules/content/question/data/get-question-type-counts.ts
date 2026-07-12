import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';
import { applyQuestionFilters } from './get-questions';
import type { GetQuestionsQuery } from '../question.dto';
import { type QuestionType } from '@sentinel/shared';

export type GetQuestionTypeCountsDataArgs = {
    dbClient: DbClient;
    institutionId?: string;
    filters: Omit<GetQuestionsQuery, 'type' | 'page' | 'pageSize'>;
    userId?: string;
};

/**
 * Aggregates counts of visible questions grouped by their type.
 */
export async function getQuestionTypeCountsData({
    dbClient,
    institutionId,
    filters,
    userId,
}: GetQuestionTypeCountsDataArgs) {
    const baseQuery = applyQuestionFilters(
        dbClient.selectFrom('question_bank_questions as qbq'),
        institutionId,
        filters,
        userId,
    );

    const counts = await baseQuery
        .select([
            'qbq.question_type',
            sql<number>`count(*)`.as('count')
        ])
        .groupBy('qbq.question_type')
        .execute();

    const items: {
        type: QuestionType;
        count: number
    }[] = counts.map((row: any) => ({
        type: row.question_type as QuestionType,
        count: Number(row.count),
    }));

    const total = items.reduce((sum, item) => sum + item.count, 0);

    return {
        items,
        total,
    };
}
