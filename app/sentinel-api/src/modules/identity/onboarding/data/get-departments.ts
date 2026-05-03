import { type DB, DbClient } from '@sentinel/db';
import { type Selectable } from 'kysely';
import { loadEffectiveRows } from '../../../core/inheritance/effective-row-loader';
import type { EffectiveRow } from '../../../core/inheritance/inheritance-resolver.helper';

type OnboardingDepartmentRow = Selectable<DB['departments']> & {
    [key: string]: unknown;
};

export type GetDepartmentsDataArgs = {
    dbClient: DbClient;
    institutionId?: string;
};

export async function getDepartmentsData({
    dbClient,
    institutionId,
}: GetDepartmentsDataArgs): Promise<EffectiveRow<OnboardingDepartmentRow>[]> {
    const loadRows = async (effectiveInstitutionId?: string) => {
        let query = dbClient
            .selectFrom('departments')
            .selectAll()
            .orderBy('department_name', 'asc');

        if (effectiveInstitutionId) {
            query = query.where('institution_id', '=', effectiveInstitutionId);
        }

        return query.execute() as Promise<OnboardingDepartmentRow[]>;
    };

    return await loadEffectiveRows({
        dbClient,
        institutionId,
        idKey: 'department_id',
        loadRows,
    });
}

export type GetDepartmentsDataResponse = Awaited<ReturnType<typeof getDepartmentsData>>;
