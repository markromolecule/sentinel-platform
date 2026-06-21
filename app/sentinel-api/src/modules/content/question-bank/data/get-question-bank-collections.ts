import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';
import type { GetQuestionBankCollectionsQuery } from '../question-bank.dto';

export type GetQuestionBankCollectionsDataArgs = {
    dbClient: DbClient;
    institutionId?: string;
    filters: GetQuestionBankCollectionsQuery;
    userId: string;
};

function applyQuestionBankCollectionFilters(
    query: any,
    institutionId: string | undefined,
    filters: GetQuestionBankCollectionsQuery,
    userId: string,
) {
    let nextQuery = query;

    if (institutionId) {
        nextQuery = nextQuery.where('qbc.institution_id', '=', institutionId);
    }

    nextQuery = nextQuery.where((eb: any) =>
        eb.or([
            eb('qbc.is_public', '=', true),
            eb('qbc.created_by', '=', userId),
            eb.exists(
                eb
                    .selectFrom('question_bank_collection_shares as qcs')
                    .select('qcs.user_id')
                    .whereRef('qcs.collection_id', '=', 'qbc.collection_id')
                    .where('qcs.user_id', '=', userId),
            ),
        ]),
    );

    if (filters.search) {
        nextQuery = nextQuery.where((eb: any) =>
            eb.or([
                eb('qbc.name', 'ilike', `%${filters.search}%`),
                eb('qbc.description', 'ilike', `%${filters.search}%`),
            ]),
        );
    }

    return nextQuery;
}

/**
 * Loads question bank collections using offset pagination and visibility scoping.
 */
export async function getQuestionBankCollectionsData({
    dbClient,
    institutionId,
    filters,
    userId,
}: GetQuestionBankCollectionsDataArgs) {
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 20;
    const offset = (page - 1) * pageSize;

    const countQuery = applyQuestionBankCollectionFilters(
        dbClient.selectFrom('question_bank_collections as qbc'),
        institutionId,
        filters,
        userId,
    );

    const countResult = await countQuery
        .select(sql<number>`count(distinct qbc.collection_id)::int`.as('count'))
        .executeTakeFirst();

    const total = Number(countResult?.count ?? 0);

    const items = await applyQuestionBankCollectionFilters(
        dbClient
            .selectFrom('question_bank_collections as qbc')
            .leftJoin(
                'question_bank_collection_questions as qbcq',
                'qbcq.collection_id',
                'qbc.collection_id',
            )
            .leftJoin('user_profiles as creator', 'creator.user_id', 'qbc.created_by')
            .leftJoin('user_profiles as updater', 'updater.user_id', 'qbc.updated_by')
            .select([
                'qbc.collection_id',
                'qbc.institution_id',
                'qbc.name',
                'qbc.description',
                'qbc.tags',
                'qbc.is_public',
                'qbc.created_at',
                'qbc.updated_at',
                'qbc.created_by',
                'qbc.updated_by',
                'creator.first_name as creator_first_name',
                'creator.last_name as creator_last_name',
                'updater.first_name as updater_first_name',
                'updater.last_name as updater_last_name',
                sql<number>`count(qbcq.question_bank_question_id)::int`.as('question_count'),
            ])
            .groupBy([
                'qbc.collection_id',
                'creator.first_name',
                'creator.last_name',
                'updater.first_name',
                'updater.last_name',
            ]),
        institutionId,
        filters,
        userId,
    )
        .orderBy('qbc.updated_at', 'desc')
        .orderBy('qbc.collection_id', 'desc')
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
