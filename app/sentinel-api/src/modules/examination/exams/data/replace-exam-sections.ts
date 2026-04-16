import { type DbClient, type DB } from '@sentinel/db';
import { type Insertable } from 'kysely';

export type ReplaceExamSectionsDataArgs = {
    dbClient: DbClient;
    examId: string;
    sections: Insertable<DB['exam_sections']>[];
};

export async function replaceExamSectionsData({
    dbClient,
    examId,
    sections,
}: ReplaceExamSectionsDataArgs) {
    await dbClient.deleteFrom('exam_sections').where('exam_id', '=', examId).execute();

    if (sections.length === 0) {
        return [];
    }

    return await dbClient.insertInto('exam_sections').values(sections).returningAll().execute();
}
