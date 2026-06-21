import { type DbClient } from '@sentinel/db';

export const DEPARTMENT_INHERITANCE_CONFIG = {
    table: 'departments',
    idColumn: 'department_id',
    copyColumns: ['department_name', 'department_code', 'created_by', 'updated_by'],
};

export function buildDepartmentLabel(
    name: string | null | undefined,
    code: string | null | undefined,
) {
    if (code && name) {
        return `${code} - ${name}`;
    }

    return name || code || 'Department';
}

export async function getInstitutionName(dbClient: DbClient, institutionId?: string | null) {
    if (!institutionId) {
        return null;
    }

    const institution = await dbClient
        .selectFrom('institutions')
        .select('name')
        .where('id', '=', institutionId)
        .executeTakeFirst();

    return institution?.name ?? null;
}
