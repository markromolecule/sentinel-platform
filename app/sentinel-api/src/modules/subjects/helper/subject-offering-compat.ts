import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';

const SUBJECT_OFFERING_COLUMNS = [
    'term_id',
    'is_opened',
    'offering_start_date',
    'offering_end_date',
] as const;
const SUBJECT_OFFERING_COLUMN_COUNT = SUBJECT_OFFERING_COLUMNS.length;
const subjectOfferingSupportCache = new WeakMap<object, Promise<boolean>>();

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

export function isMissingSubjectOfferingColumnError(error: unknown) {
    const normalizedMessages = collectErrorMessages(error).map((message) => message.toLowerCase());

    return normalizedMessages.some(
        (message) =>
            message.includes('does not exist') &&
            SUBJECT_OFFERING_COLUMNS.some((column) => message.includes(column)),
    );
}

export function supportsSubjectOfferingFields(dbClient: DbClient) {
    const cacheKey = dbClient as object;
    const cached = subjectOfferingSupportCache.get(cacheKey);

    if (cached) {
        return cached;
    }

    const pendingCheck = sql<{ column_count: number }>`
        select count(*)::int as column_count
        from information_schema.columns
        where table_schema = 'public'
          and table_name = 'subjects'
          and column_name in (
            'term_id',
            'is_opened',
            'offering_start_date',
            'offering_end_date'
          )
    `
        .execute(dbClient)
        .then((result) => (result.rows[0]?.column_count ?? 0) === SUBJECT_OFFERING_COLUMN_COUNT)
        .catch(() => false);

    subjectOfferingSupportCache.set(cacheKey, pendingCheck);
    return pendingCheck;
}

export function omitSubjectOfferingFields<T extends Record<string, unknown>>(values: T) {
    const {
        term_id: _termId,
        is_opened: _isOpened,
        offering_start_date: _offeringStartDate,
        offering_end_date: _offeringEndDate,
        ...legacyValues
    } = values;

    return legacyValues;
}
