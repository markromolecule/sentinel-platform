import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';

const INSTRUCTOR_COURSE_TABLE = 'instructor_courses';
const instructorCourseTableSupportCache = new WeakMap<object, Promise<boolean>>();

export function supportsInstructorCourseTable(dbClient: DbClient) {
    const cacheKey = dbClient as object;
    const cached = instructorCourseTableSupportCache.get(cacheKey);

    if (cached) {
        return cached;
    }

    const pendingCheck = sql<{ table_count: number }>`
        select count(*)::int as table_count
        from information_schema.tables
        where table_schema = 'public'
          and table_name = ${INSTRUCTOR_COURSE_TABLE}
    `
        .execute(dbClient)
        .then((result) => {
            const tableSupported = (result.rows[0]?.table_count ?? 0) === 1;

            if (!tableSupported) {
                instructorCourseTableSupportCache.delete(cacheKey);
            }

            return tableSupported;
        })
        .catch(() => {
            instructorCourseTableSupportCache.delete(cacheKey);
            return false;
        });

    instructorCourseTableSupportCache.set(cacheKey, pendingCheck);
    return pendingCheck;
}
