import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';

type ExamColumnSupport = {
    hasSectionId: boolean;
    hasSectionName: boolean;
    hasRoomId: boolean;
};

type ExamQuestionColumnSupport = {
    hasSourceCollectionId: boolean;
};

type ProctorAssignmentColumnSupport = {
    assigneeColumn: 'instructor_id' | 'user_id' | null;
};

const examColumnSupportCache = new WeakMap<object, Promise<ExamColumnSupport>>();
const examQuestionColumnSupportCache = new WeakMap<object, Promise<ExamQuestionColumnSupport>>();
const proctorAssignmentColumnSupportCache = new WeakMap<
    object,
    Promise<ProctorAssignmentColumnSupport>
>();

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
          and column_name in ('section_id', 'section_name', 'room_id')
    `
        .execute(dbClient)
        .then((result) => {
            const availableColumns = new Set(result.rows.map((row) => row.column_name));

            return {
                hasSectionId: availableColumns.has('section_id'),
                hasSectionName: availableColumns.has('section_name'),
                hasRoomId: availableColumns.has('room_id'),
            };
        })
        .catch(() => ({
            hasSectionId: false,
            hasSectionName: false,
            hasRoomId: false,
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

export function getProctorAssignmentColumnSupport(dbClient: DbClient) {
    const cacheKey = dbClient as object;
    const cached = proctorAssignmentColumnSupportCache.get(cacheKey);

    if (cached) {
        return cached;
    }

    const pendingCheck = sql<{ column_name: string }>`
        select column_name
        from information_schema.columns
        where table_schema = 'public'
          and table_name = 'proctor_assignments'
          and column_name in ('instructor_id', 'user_id')
    `
        .execute(dbClient)
        .then((result) => {
            const availableColumns = new Set(result.rows.map((row) => row.column_name));

            if (availableColumns.has('instructor_id')) {
                return { assigneeColumn: 'instructor_id' as const };
            }

            if (availableColumns.has('user_id')) {
                return { assigneeColumn: 'user_id' as const };
            }

            return { assigneeColumn: null };
        })
        .catch(() => ({
            assigneeColumn: null,
        }));

    proctorAssignmentColumnSupportCache.set(cacheKey, pendingCheck);
    return pendingCheck;
}
