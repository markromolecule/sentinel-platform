import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';

type ClassroomExamColumnSupport = {
    hasClassGroupId: boolean;
    hasSectionId: boolean;
};

type ClassGroupColumnSupport = {
    hasClassName: boolean;
    hasUpdatedAt: boolean;
    hasUpdatedBy: boolean;
};

const classroomExamColumnSupportCache = new WeakMap<object, Promise<ClassroomExamColumnSupport>>();
const classGroupColumnSupportCache = new WeakMap<object, Promise<ClassGroupColumnSupport>>();

export function getClassroomExamColumnSupport(dbClient: DbClient) {
    const cacheKey = dbClient as object;
    const cached = classroomExamColumnSupportCache.get(cacheKey);

    if (cached) {
        return cached;
    }

    const pendingCheck = sql<{ column_name: string }>`
        select column_name
        from information_schema.columns
        where table_schema = 'public'
          and table_name = 'exams'
          and column_name in ('class_group_id', 'section_id')
    `
        .execute(dbClient)
        .then((result) => {
            const availableColumns = new Set(result.rows.map((row) => row.column_name));

            return {
                hasClassGroupId: availableColumns.has('class_group_id'),
                hasSectionId: availableColumns.has('section_id'),
            };
        })
        .catch(() => ({
            hasClassGroupId: false,
            hasSectionId: false,
        }));

    classroomExamColumnSupportCache.set(cacheKey, pendingCheck);
    return pendingCheck;
}

export function getClassGroupColumnSupport(dbClient: DbClient) {
    const cacheKey = dbClient as object;
    const cached = classGroupColumnSupportCache.get(cacheKey);

    if (cached) {
        return cached;
    }

    const pendingCheck = sql<{ column_name: string }>`
        select column_name
        from information_schema.columns
        where table_schema = 'public'
          and table_name = 'class_groups'
          and column_name in ('class_name', 'updated_at', 'updated_by')
    `
        .execute(dbClient)
        .then((result) => {
            const availableColumns = new Set(result.rows.map((row) => row.column_name));

            return {
                hasClassName: availableColumns.has('class_name'),
                hasUpdatedAt: availableColumns.has('updated_at'),
                hasUpdatedBy: availableColumns.has('updated_by'),
            };
        })
        .catch(() => ({
            hasClassName: false,
            hasUpdatedAt: false,
            hasUpdatedBy: false,
        }));

    classGroupColumnSupportCache.set(cacheKey, pendingCheck);
    return pendingCheck;
}
