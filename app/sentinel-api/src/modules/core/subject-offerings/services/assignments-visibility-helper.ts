import { type DbClient } from '@sentinel/db';
import { loadEffectiveRows } from '../../inheritance/effective-row-loader';
import { getCoursesData } from '../../courses/data/get-courses';
import { getDepartmentsData } from '../../departments/data/get-departments';
import { getSectionsData } from '../../sections/data/get-sections';
import { buildSubjectOfferingError } from '../helper/subject-offering-errors';

function uniqueIds(values: string[] | undefined) {
    return Array.from(new Set(values ?? [])).filter((value) => value.trim() !== '');
}

async function assertEffectiveIdsVisible(args: {
    dbClient: DbClient;
    institutionId?: string | null;
    label: string;
    ids?: string[];
    idKey: string;
    loadRows: (institutionId?: string) => Promise<any[]>;
}) {
    const ids = uniqueIds(args.ids);

    if (ids.length === 0 || !args.institutionId) {
        return;
    }

    const effectiveRows = await loadEffectiveRows<any>({
        dbClient: args.dbClient,
        institutionId: args.institutionId,
        idKey: args.idKey,
        loadRows: args.loadRows,
    });
    const visibleIds = new Set<string>();

    for (const row of effectiveRows) {
        if (row[args.idKey]) {
            visibleIds.add(String(row[args.idKey]));
        }

        if (row.sourceRecordId) {
            visibleIds.add(String(row.sourceRecordId));
        }
    }

    const missingId = ids.find((id) => !visibleIds.has(id));

    if (missingId) {
        throw buildSubjectOfferingError(
            `${args.label} does not belong to the current institution`,
            '23503',
        );
    }
}

/**
 * Asserts that the requested departments, courses, and sections are visible in the institution's scope.
 */
export async function assertSubjectOfferingAssignmentsVisible(
    dbClient: DbClient,
    institutionId: string | null | undefined,
    payload: {
        department_ids?: string[];
        course_ids?: string[];
        section_ids?: string[];
    },
) {
    await Promise.all([
        assertEffectiveIdsVisible({
            dbClient,
            institutionId,
            label: 'Department',
            ids: payload.department_ids,
            idKey: 'department_id',
            loadRows: (scopeInstitutionId) =>
                getDepartmentsData({ dbClient, institutionId: scopeInstitutionId }),
        }),
        assertEffectiveIdsVisible({
            dbClient,
            institutionId,
            label: 'Course',
            ids: payload.course_ids,
            idKey: 'course_id',
            loadRows: (scopeInstitutionId) =>
                getCoursesData({ dbClient, institutionId: scopeInstitutionId ?? '' }),
        }),
        assertEffectiveIdsVisible({
            dbClient,
            institutionId,
            label: 'Section',
            ids: payload.section_ids,
            idKey: 'section_id',
            loadRows: (scopeInstitutionId) =>
                getSectionsData({ dbClient, institutionId: scopeInstitutionId }),
        }),
    ]);
}
