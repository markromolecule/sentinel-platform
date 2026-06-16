import { type SelectQueryBuilder } from 'kysely';

type VisibilityQuery = SelectQueryBuilder<any, any, any>;

/**
 * Applies viewer-scoped visibility rules for question bank questions.
 *
 * A question remains visible when it is uncollected, public, owned by the viewer,
 * shared with the viewer, or self-created by the viewer.
 */
export function applyQuestionVisibility(query: VisibilityQuery, userId: string): VisibilityQuery {
    return query.where((eb) =>
        eb.or([
            eb('qbq.created_by', '=', userId),
            eb.not(
                eb.exists(
                    eb
                        .selectFrom('question_bank_collection_questions as qbcq')
                        .select('qbcq.question_bank_question_id')
                        .whereRef(
                            'qbcq.question_bank_question_id',
                            '=',
                            'qbq.question_bank_question_id',
                        ),
                ),
            ),
            eb.exists(
                eb
                    .selectFrom('question_bank_collection_questions as qbcq')
                    .innerJoin(
                        'question_bank_collections as qbc',
                        'qbc.collection_id',
                        'qbcq.collection_id',
                    )
                    .select('qbcq.question_bank_question_id')
                    .whereRef('qbcq.question_bank_question_id', '=', 'qbq.question_bank_question_id')
                    .where((collectionEb) =>
                        collectionEb.or([
                            collectionEb('qbc.is_public', '=', true),
                            collectionEb('qbc.created_by', '=', userId),
                            collectionEb.exists(
                                collectionEb
                                    .selectFrom('question_bank_collection_shares as qcs')
                                    .select('qcs.user_id')
                                    .whereRef('qcs.collection_id', '=', 'qbc.collection_id')
                                    .where('qcs.user_id', '=', userId),
                            ),
                        ]),
                    ),
            ),
        ]),
    );
}
