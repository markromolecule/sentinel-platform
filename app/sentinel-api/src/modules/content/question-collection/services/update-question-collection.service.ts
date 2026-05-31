import { HTTPException } from 'hono/http-exception';
import { type DbClient } from '@sentinel/db';
import type { UpdateQuestionCollectionBody } from '../question-collection.dto';
import { updateQuestionCollectionData } from '../data/update-question-collection';
import {
    buildUpdateQuestionCollectionValues,
    resolveQuestionCollectionInstitutionId,
} from './build-question-collection-write-values.service';
import { getQuestionCollectionDetailOrThrow } from './get-question-collection-detail.service';

export async function updateQuestionCollection(args: {
    dbClient: DbClient;
    id: string;
    body: UpdateQuestionCollectionBody;
    institutionId: string | undefined;
    userId: string;
}) {
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
        institutionId:
            resolveQuestionCollectionInstitutionId(args.institutionId, args.body.institutionId) ??
            undefined,
    });
}
