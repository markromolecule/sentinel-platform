import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';

export type QuestionCollectionAction =
    | 'view'
    | 'use'
    | 'edit'
    | 'update'
    | 'delete'
    | 'share';

/**
 * Enforces collection access rules for creator, shared, and public users.
 */
export async function assertCollectionAccess(args: {
    dbClient: DbClient;
    collectionId: string;
    userId: string;
    action: QuestionCollectionAction;
}) {
    const collection = await args.dbClient
        .selectFrom('question_bank_collections')
        .select(['created_by', 'is_public'])
        .where('collection_id', '=', args.collectionId)
        .executeTakeFirst();

    if (!collection) {
        throw new HTTPException(404, { message: 'Collection not found.' });
    }

    if (collection.created_by === args.userId) {
        return;
    }

    if (args.action === 'delete' || args.action === 'share') {
        throw new HTTPException(403, {
            message: 'Forbidden. Only the creator can perform this action.',
        });
    }

    const isShared = await args.dbClient
        .selectFrom('question_bank_collection_shares')
        .select('user_id')
        .where('collection_id', '=', args.collectionId)
        .where('user_id', '=', args.userId)
        .executeTakeFirst();

    if (isShared) {
        return;
    }

    if (collection.is_public && (args.action === 'view' || args.action === 'use')) {
        return;
    }

    throw new HTTPException(403, {
        message: 'Forbidden. You do not have access to this collection.',
    });
}
