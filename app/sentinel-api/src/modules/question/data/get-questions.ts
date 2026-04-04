import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';
import type { GetQuestionsQuery } from '../question.dto';

export type GetQuestionsDataArgs = {
    dbClient: DbClient;
    institutionId?: string;
    filters: GetQuestionsQuery;
};

function applyQuestionFilters(
    query: any,
    institutionId: string | undefined,
    filters: GetQuestionsQuery,
) {
    let nextQuery = query.where('qbq.archived_at', 'is', null);

    if (institutionId) {
        nextQuery = nextQuery.where('qbq.institution_id', '=', institutionId);
    }

    if (filters.subjectId) {
        nextQuery = nextQuery.where('qbq.subject_id', '=', filters.subjectId);
    }

    if (filters.type) {
        nextQuery = nextQuery.where('qbq.question_type', '=', filters.type);
    }

    if (filters.collectionId) {
        nextQuery = nextQuery.where((eb: any) =>
            eb.exists(
                eb
                    .selectFrom('question_bank_collection_questions as qbcq')
                    .select(sql`1`.as('match'))
                    .whereRef(
                        'qbcq.question_bank_question_id',
                        '=',
                        'qbq.question_bank_question_id',
                    )
                    .where('qbcq.collection_id', '=', filters.collectionId!),
            ),
        );
    }

    if (filters.search) {
        nextQuery = nextQuery.where(
            sql<boolean>`(qbq.content->>'prompt' ilike ${`%${filters.search}%`} or qbq.tags::text ilike ${`%${filters.search}%`})`,
        );
    }

    return nextQuery;
}

export async function getQuestionsData({ dbClient, institutionId, filters }: GetQuestionsDataArgs) {
    const page = filters.page;
    const pageSize = filters.pageSize;
    const offset = (page - 1) * pageSize;

    const baseQuery = applyQuestionFilters(
        dbClient.selectFrom('question_bank_questions as qbq'),
        institutionId,
        filters,
    );

    const countResult = await baseQuery
        .select(sql<number>`count(*)`.as('count'))
        .executeTakeFirst();

    const total = Number(countResult?.count ?? 0);

    const items = await applyQuestionFilters(
        dbClient
            .selectFrom('question_bank_questions as qbq')
            .leftJoin('user_profiles as creator', 'creator.user_id', 'qbq.created_by')
            .leftJoin('user_profiles as updater', 'updater.user_id', 'qbq.updated_by')
            .select([
                'qbq.question_bank_question_id',
                'qbq.subject_id',
                'qbq.institution_id',
                'qbq.question_type',
                'qbq.difficulty',
                'qbq.points',
                'qbq.tags',
                'qbq.content',
                'qbq.created_at',
                'qbq.updated_at',
                'qbq.created_by',
                'qbq.updated_by',
                'creator.first_name as creator_first_name',
                'creator.last_name as creator_last_name',
                'updater.first_name as updater_first_name',
                'updater.last_name as updater_last_name',
                sql<string | null>`qbq.content->>'prompt'`.as('prompt'),
            ]),
        institutionId,
        filters,
    )
        .orderBy('qbq.updated_at', 'desc')
        .orderBy('qbq.question_bank_question_id', 'desc')
        .limit(pageSize)
        .offset(offset)
        .execute();

    return {
        items,
        page,
        pageSize,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
        hasMore: offset + items.length < total,
    };
}
