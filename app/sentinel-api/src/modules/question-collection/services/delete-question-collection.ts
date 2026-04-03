import { HTTPException } from 'hono/http-exception';
import { type DbClient } from '@sentinel/db';
import { deleteQuestionCollectionData } from '../data/delete-question-collection';

export async function deleteQuestionCollection(args: {
    dbClient: DbClient;
    id: string;
    institutionId?: string;
}) {
    const deleted = await deleteQuestionCollectionData({
        dbClient: args.dbClient,
        id: args.id,
        institutionId: args.institutionId,
    });

    if (!deleted) {
        throw new HTTPException(404, {
            message: 'Collection not found.',
        });
    }
}
