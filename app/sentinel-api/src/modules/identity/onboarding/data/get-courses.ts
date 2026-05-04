import { type DB, DbClient } from '@sentinel/db';
import { type Selectable } from 'kysely';
import { loadEffectiveRows } from '../../../core/inheritance/effective-row-loader';
import type { EffectiveRow } from '../../../core/inheritance/inheritance-resolver.helper';

type OnboardingCourseRow = Selectable<DB['courses']> & {
    [key: string]: unknown;
};

export type GetCoursesDataArgs = {
    dbClient: DbClient;
    departmentId?: string;
    institutionId?: string;
};

export async function getCoursesData({
    dbClient,
    departmentId,
    institutionId,
}: GetCoursesDataArgs): Promise<EffectiveRow<OnboardingCourseRow>[]> {
    const loadRows = async (effectiveInstitutionId?: string) => {
        let query = dbClient.selectFrom('courses').selectAll().orderBy('title', 'asc');

        if (departmentId) {
            query = query.where('department_id', '=', departmentId);
        }

        if (effectiveInstitutionId) {
            query = query.where('institution_id', '=', effectiveInstitutionId);
        }

        return query.execute() as Promise<OnboardingCourseRow[]>;
    };

    return await loadEffectiveRows({
        dbClient,
        institutionId,
        idKey: 'course_id',
        loadRows,
    });
}

export type GetCoursesDataResponse = Awaited<ReturnType<typeof getCoursesData>>;
