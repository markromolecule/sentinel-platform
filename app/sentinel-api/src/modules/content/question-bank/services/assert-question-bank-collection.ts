import { HTTPException } from 'hono/http-exception';
import { type DbClient } from '@sentinel/db';
import { getQuestionBankCollectionByIdData } from '../data/get-question-bank-collection-by-id';

export type QuestionBankCollectionRecord = NonNullable<
    Awaited<ReturnType<typeof getQuestionBankCollectionByIdData>>
>;

export async function getQuestionBankCollectionOrThrow(args: {
    dbClient: DbClient;
    id: string;
    institutionId?: string;
    userId: string;
}): Promise<QuestionBankCollectionRecord> {
    const record = await getQuestionBankCollectionByIdData(args);

    if (!record) {
        throw new HTTPException(404, {
            message: 'Collection not found.',
        });
    }

    return record;
}
