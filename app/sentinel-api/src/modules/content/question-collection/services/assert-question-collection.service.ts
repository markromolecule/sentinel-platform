import { HTTPException } from 'hono/http-exception';
import { type DbClient } from '@sentinel/db';
import { getQuestionCollectionByIdData } from '../data/get-question-collection-by-id';

export type QuestionCollectionRecord = NonNullable<
    Awaited<ReturnType<typeof getQuestionCollectionByIdData>>
>;

export async function getQuestionCollectionOrThrow(args: {
    dbClient: DbClient;
    id: string;
    institutionId?: string;
}): Promise<QuestionCollectionRecord> {
    const record = await getQuestionCollectionByIdData(args);

    if (!record) {
        throw new HTTPException(404, {
            message: 'Collection not found.',
        });
    }

    return record;
}
