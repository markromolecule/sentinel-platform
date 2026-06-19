import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { executeTransaction } from '@sentinel/db';
import { assertCollectionAccess } from '../services/assert-question-collection-access';
import {
    getQuestionCollectionSharesSchema,
    shareQuestionCollectionSchema,
} from '../question-collection.dto';
import { QuestionBankCollectionNotificationService } from '../../../general/notification/services/question-bank-collection-notification.service';

/**
 * Returns the users currently shared with a collection.
 */
export const getQuestionCollectionSharesRoute = createRoute({
    method: 'get',
    path: '/collections/:id/shares',
    tags: ['Question Collection'],
    summary: 'List shared users for a collection',
    request: {
        params: getQuestionCollectionSharesSchema.params,
    },
    responses: {
        200: {
            description: 'Shared users fetched successfully',
            content: {
                'application/json': {
                    schema: getQuestionCollectionSharesSchema.response,
                },
            },
        },
    },
});

/**
 * Returns the currently shared users for the collection.
 */
export const getQuestionCollectionSharesRouteHandler: AppRouteHandler<
    typeof getQuestionCollectionSharesRoute
> = async (c) => {
    const { id } = c.req.valid('param');
    const dbClient = c.get('dbClient');
    const user = c.get('user');

    await assertCollectionAccess({
        dbClient,
        collectionId: id,
        userId: user.id,
        action: 'view',
    });

    const sharedUsers = await dbClient
        .selectFrom('question_bank_collection_shares as qcs')
        .innerJoin('user_profiles as up', 'up.user_id', 'qcs.user_id')
        .innerJoin('auth.users as u', 'u.id', 'qcs.user_id')
        .select(['qcs.user_id', 'up.first_name', 'up.last_name', 'u.email'])
        .where('qcs.collection_id', '=', id)
        .orderBy('up.last_name', 'asc')
        .orderBy('up.first_name', 'asc')
        .execute();

    return c.json({
        message: 'Shared users fetched successfully',
        data: sharedUsers,
    });
};

/**
 * Replaces the collection share list with the provided user IDs.
 */
export const shareQuestionCollectionRoute = createRoute({
    method: 'post',
    path: '/collections/:id/shares',
    tags: ['Question Collection'],
    summary: 'Share a collection with users',
    request: {
        params: shareQuestionCollectionSchema.params,
        body: {
            content: {
                'application/json': {
                    schema: shareQuestionCollectionSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Collection shared successfully',
            content: {
                'application/json': {
                    schema: shareQuestionCollectionSchema.response,
                },
            },
        },
    },
});

/**
 * Updates the share list for a collection, restricted to the creator.
 */
export const shareQuestionCollectionRouteHandler: AppRouteHandler<
    typeof shareQuestionCollectionRoute
> = async (c) => {
    const { id } = c.req.valid('param');
    const { userIds } = c.req.valid('json');
    const dbClient = c.get('dbClient');
    const user = c.get('user');
    const institutionId = c.get('institutionId') || null;

    await assertCollectionAccess({
        dbClient,
        collectionId: id,
        userId: user.id,
        action: 'share',
    });

    const uniqueUserIds = [...new Set(userIds)];
    const collection = await dbClient
        .selectFrom('question_bank_collections')
        .select(['collection_id', 'name'])
        .where('collection_id', '=', id)
        .executeTakeFirstOrThrow();

    const existingShares = await dbClient
        .selectFrom('question_bank_collection_shares as qcs')
        .select('qcs.user_id')
        .where('qcs.collection_id', '=', id)
        .execute();

    const filteredUserIds =
        uniqueUserIds.length === 0
            ? []
            : institutionId === null
              ? uniqueUserIds
              : (
                    await dbClient
                        .selectFrom('user_profiles')
                        .select('user_id')
                        .where('institution_id', '=', institutionId)
                        .where('user_id', 'in', uniqueUserIds)
                        .execute()
                ).map((record) => record.user_id);

    const previousShareSet = new Set(existingShares.map((share) => share.user_id));
    const addedUserIds = filteredUserIds.filter((userId) => !previousShareSet.has(userId));

    await executeTransaction(async (trx) => {
        await trx
            .deleteFrom('question_bank_collection_shares')
            .where('collection_id', '=', id)
            .execute();

        if (filteredUserIds.length > 0) {
            await trx
                .insertInto('question_bank_collection_shares')
                .values(
                    filteredUserIds.map((userId) => ({
                        collection_id: id,
                        user_id: userId,
                    })),
                )
                .execute();
        }
    });

    const sharedUsers = await dbClient
        .selectFrom('question_bank_collection_shares as qcs')
        .innerJoin('user_profiles as up', 'up.user_id', 'qcs.user_id')
        .innerJoin('auth.users as u', 'u.id', 'qcs.user_id')
        .select(['qcs.user_id', 'up.first_name', 'up.last_name', 'u.email'])
        .where('qcs.collection_id', '=', id)
        .orderBy('up.last_name', 'asc')
        .orderBy('up.first_name', 'asc')
        .execute();

    const assignerName =
        [user.user_profiles?.first_name, user.user_profiles?.last_name].filter(Boolean).join(' ') ||
        'Someone';

    for (const recipientUserId of addedUserIds) {
        await QuestionBankCollectionNotificationService.notifyQuestionBankCollectionAssigned({
            dbClient,
            recipientUserId,
            actorUserId: user.id,
            institutionId,
            collectionId: collection.collection_id,
            collectionLabel: collection.name,
            assignerName,
        });
    }

    return c.json({
        message: 'Collection shared successfully',
        data: sharedUsers,
    });
};
