import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';

const SUBJECT_OFFERING_TABLES = [
    'subject_offerings',
    'subject_offering_departments',
    'subject_offering_courses',
    'subject_offering_sections',
    'subject_offering_year_levels',
] as const;
const SUBJECT_OFFERING_TABLE_COUNT = SUBJECT_OFFERING_TABLES.length;
const subjectOfferingTableSupportCache = new WeakMap<object, Promise<boolean>>();

function collectErrorMessages(error: unknown): string[] {
    if (!error || typeof error !== 'object') {
        return typeof error === 'string' ? [error] : [];
    }

    const candidate = error as {
        message?: unknown;
        cause?: unknown;
        meta?: { driverAdapterError?: unknown };
    };

    return [
        typeof candidate.message === 'string' ? candidate.message : null,
        ...collectErrorMessages(candidate.cause),
        ...collectErrorMessages(candidate.meta?.driverAdapterError),
    ].filter((value): value is string => Boolean(value));
}

export function isMissingSubjectOfferingTableError(error: unknown) {
    const normalizedMessages = collectErrorMessages(error).map((message) => message.toLowerCase());

    return normalizedMessages.some(
        (message) =>
            message.includes('does not exist') &&
            SUBJECT_OFFERING_TABLES.some((table) => message.includes(table)),
    );
}

export function supportsSubjectOfferingTables(dbClient: DbClient) {
    const cacheKey = dbClient as object;
    const cached = subjectOfferingTableSupportCache.get(cacheKey);

    if (cached) {
        return cached;
    }

    const pendingCheck = sql<{ table_count: number }>`
        select count(*)::int as table_count
        from information_schema.tables
        where table_schema = 'public'
          and table_name in (
            'subject_offerings',
            'subject_offering_departments',
            'subject_offering_courses',
            'subject_offering_sections',
            'subject_offering_year_levels'
          )
    `
        .execute(dbClient)
        .then((result) => {
            const tablesSupported =
                (result.rows[0]?.table_count ?? 0) === SUBJECT_OFFERING_TABLE_COUNT;

            if (!tablesSupported) {
                subjectOfferingTableSupportCache.delete(cacheKey);
            }

            return tablesSupported;
        })
        .catch(() => {
            subjectOfferingTableSupportCache.delete(cacheKey);
            return false;
        });

    subjectOfferingTableSupportCache.set(cacheKey, pendingCheck);
    return pendingCheck;
}
