import { type DbClient } from '@sentinel/db';

export type ExistingSubjectOfferingRecord = {
    subject_offering_id: string;
    subject_id: string;
    subject_code: string;
    subject_title: string;
};

export type GetExistingSubjectOfferingsBySubjectsDataArgs = {
    dbClient: DbClient;
    subjectIds: string[];
    termId: string;
    institutionId?: string | null;
};

export async function getExistingSubjectOfferingsBySubjectsData({
    dbClient,
    subjectIds,
    termId,
    institutionId,
}: GetExistingSubjectOfferingsBySubjectsDataArgs): Promise<ExistingSubjectOfferingRecord[]> {
    if (subjectIds.length === 0) {
        return [];
    }

    let query = dbClient
        .selectFrom('subject_offerings as so')
        .innerJoin('subjects as sub', 'sub.subject_id', 'so.subject_id')
        .select([
            'so.subject_offering_id',
            'so.subject_id',
            'sub.subject_code',
            'sub.subject_title',
        ])
        .where('so.subject_id', 'in', subjectIds)
        .where('so.term_id', '=', termId);

    if (institutionId) {
        query = query.where('so.institution_id', '=', institutionId);
    }

    return await query.execute();
}
