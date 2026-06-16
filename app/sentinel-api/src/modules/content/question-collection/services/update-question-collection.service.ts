import { HTTPException } from 'hono/http-exception';
import { type DbClient } from '@sentinel/db';
import type { UpdateQuestionCollectionBody } from '../question-collection.dto';
import { updateQuestionCollectionData } from '../data/update-question-collection';
import {
    buildUpdateQuestionCollectionValues,
    resolveQuestionCollectionInstitutionId,
} from './build-question-collection-write-values.service';
import { assertCollectionAccess } from './assert-question-collection-access';
import { getQuestionCollectionDetailOrThrow } from './get-question-collection-detail.service';

/**
 * Updates a question collection after checking update permissions.
 */
export async function updateQuestionCollection(args: {
    dbClient: DbClient;
    id: string;
    body: UpdateQuestionCollectionBody;
    institutionId: string | undefined;
    userId: string;
}) {
    await assertCollectionAccess({
        dbClient: args.dbClient,
        collectionId: args.id,
        userId: args.userId,
        action: 'update',
    });

    const updated = await updateQuestionCollectionData({
        dbClient: args.dbClient,
        id: args.id,
        institutionId: args.institutionId,
        values: buildUpdateQuestionCollectionValues({
            body: args.body,
            userId: args.userId,
        }),
    });

    if (!updated) {
        throw new HTTPException(404, {
            message: 'Collection not found.',
        });
    }

    return await getQuestionCollectionDetailOrThrow({
        dbClient: args.dbClient,
        id: args.id,
        userId: args.userId,
        institutionId:
            resolveQuestionCollectionInstitutionId(args.institutionId, args.body.institutionId) ??
            undefined,
    });
}
