import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';

type ExamColumnSupport = {
    hasSectionId: boolean;
    hasSectionName: boolean;
};

type ExamQuestionColumnSupport = {
    hasSourceCollectionId: boolean;
};

const examColumnSupportCache = new WeakMap<object, Promise<ExamColumnSupport>>();
const examQuestionColumnSupportCache = new WeakMap<object, Promise<ExamQuestionColumnSupport>>();

export function getExamColumnSupport(dbClient: DbClient) {
    const cacheKey = dbClient as object;
    const cached = examColumnSupportCache.get(cacheKey);

    if (cached) {
        return cached;
    }

    const pendingCheck = sql<{ column_name: string }>`
        select column_name
        from information_schema.columns
        where table_schema = 'public'
          and table_name = 'exams'
          and column_name in ('section_id', 'section_name')
    `
        .execute(dbClient)
        .then((result) => {
            const availableColumns = new Set(result.rows.map((row) => row.column_name));

            return {
                hasSectionId: availableColumns.has('section_id'),
                hasSectionName: availableColumns.has('section_name'),
            };
        })
        .catch(() => ({
            hasSectionId: false,
            hasSectionName: false,
        }));

    examColumnSupportCache.set(cacheKey, pendingCheck);
    return pendingCheck;
}

export function getExamQuestionColumnSupport(dbClient: DbClient) {
    const cacheKey = dbClient as object;
    const cached = examQuestionColumnSupportCache.get(cacheKey);

    if (cached) {
        return cached;
    }

    const pendingCheck = sql<{ column_name: string }>`
        select column_name
        from information_schema.columns
        where table_schema = 'public'
          and table_name = 'exam_questions'
          and column_name in ('source_collection_id')
    `
        .execute(dbClient)
        .then((result) => ({
            hasSourceCollectionId: result.rows.some(
                (row) => row.column_name === 'source_collection_id',
            ),
        }))
        .catch(() => ({
            hasSourceCollectionId: false,
        }));

    examQuestionColumnSupportCache.set(cacheKey, pendingCheck);
    return pendingCheck;
}
