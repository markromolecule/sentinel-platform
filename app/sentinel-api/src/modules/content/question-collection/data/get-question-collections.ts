import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';
import type { GetQuestionCollectionsQuery } from '../question-collection.dto';

export type GetQuestionCollectionsDataArgs = {
    dbClient: DbClient;
    institutionId?: string;
    userId: string;
    filters: GetQuestionCollectionsQuery;
};

function applyQuestionCollectionFilters(
    query: any,
    institutionId: string | undefined,
    filters: GetQuestionCollectionsQuery,
    userId: string,
) {
    let nextQuery = query;

    if (institutionId) {
        nextQuery = nextQuery.where('qc.institution_id', '=', institutionId);
    }

    nextQuery = nextQuery.where((eb: any) =>
        eb.or([
            eb('qc.is_public', '=', true),
            eb('qc.created_by', '=', userId),
            eb.exists(
                eb
                    .selectFrom('question_bank_collection_shares as qcs')
                    .select('qcs.user_id')
                    .whereRef('qcs.collection_id', '=', 'qc.collection_id')
                    .where('qcs.user_id', '=', userId),
            ),
        ]),
    );

    if (filters.search) {
        nextQuery = nextQuery.where((eb: any) =>
            eb.or([
                eb('qc.name', 'ilike', `%${filters.search}%`),
                eb('qc.description', 'ilike', `%${filters.search}%`),
            ]),
        );
    }

    return nextQuery;
}

/**
 * Loads question collections visible to the current user.
 */
export async function getQuestionCollectionsData({
    dbClient,
    institutionId,
    userId,
    filters,
}: GetQuestionCollectionsDataArgs) {
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 20;
    const offset = (page - 1) * pageSize;

    const countQuery = applyQuestionCollectionFilters(
        dbClient.selectFrom('question_bank_collections as qc'),
        institutionId,
        filters,
        userId,
    );

    const countResult = await countQuery
        .select(sql<number>`count(distinct qc.collection_id)::int`.as('count'))
        .executeTakeFirst();

    const total = Number(countResult?.count ?? 0);

    const items = await applyQuestionCollectionFilters(
        dbClient
            .selectFrom('question_bank_collections as qc')
            .leftJoin(
                'question_bank_collection_questions as qcq',
                'qcq.collection_id',
                'qc.collection_id',
            )
            .leftJoin('user_profiles as creator', 'creator.user_id', 'qc.created_by')
            .leftJoin('user_profiles as updater', 'updater.user_id', 'qc.updated_by')
            .select([
                'qc.collection_id',
                'qc.institution_id',
                'qc.name',
                'qc.description',
                'qc.tags',
                'qc.is_public',
                'qc.created_at',
                'qc.updated_at',
                'qc.created_by',
                'qc.updated_by',
                'creator.first_name as creator_first_name',
                'creator.last_name as creator_last_name',
                'updater.first_name as updater_first_name',
                'updater.last_name as updater_last_name',
                sql<number>`count(qcq.question_bank_question_id)::int`.as('question_count'),
            ])
            .groupBy([
                'qc.collection_id',
                'creator.first_name',
                'creator.last_name',
                'updater.first_name',
                'updater.last_name',
            ]),
        institutionId,
        filters,
        userId,
    )
        .orderBy('qc.updated_at', 'desc')
        .orderBy('qc.collection_id', 'desc')
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
