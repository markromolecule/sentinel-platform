import { type DbClient } from '@sentinel/db';
import {
    buildClassificationError,
    INVALID_SUBJECT_CLASSIFICATION_PAYLOAD,
} from '../helper/subject-classification-errors';

export async function assertSubjectsInScopeData(
    dbClient: DbClient,
    subjectIds: string[],
    institutionId?: string | null,
) {
    if (subjectIds.length === 0) {
        return;
    }

    let query = dbClient
        .selectFrom('subjects')
        .select('subject_id')
        .where('subject_id', 'in', subjectIds);

    if (institutionId) {
        query = query.where((eb) =>
            eb.or([eb('institution_id', '=', institutionId), eb('institution_id', 'is', null)]),
        );
    }

    const existingSubjects = await query.execute();

    if (existingSubjects.length !== subjectIds.length) {
        throw buildClassificationError(
            'One or more selected subjects are invalid for this institution',
            INVALID_SUBJECT_CLASSIFICATION_PAYLOAD,
        );
    }
}
