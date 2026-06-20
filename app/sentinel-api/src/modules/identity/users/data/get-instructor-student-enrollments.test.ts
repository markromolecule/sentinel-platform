import { describe, expect, it, vi } from 'vitest';
import { getInstructorStudentEnrollmentsData } from './get-instructor-student-enrollments';
import {
    Kysely,
    DummyDriver,
    PostgresAdapter,
    PostgresIntrospector,
    PostgresQueryCompiler,
} from 'kysely';

function createMockDb(dataRows: any[]) {
    const db = new Kysely<any>({
        dialect: {
            createAdapter: () => new PostgresAdapter(),
            createDriver: () => new DummyDriver(),
            createIntrospector: (db) => new PostgresIntrospector(db),
            createQueryCompiler: () => new PostgresQueryCompiler(),
        },
    });

    const executeSpy = vi.spyOn(db.getExecutor(), 'executeQuery');

    executeSpy.mockResolvedValueOnce({
        rows: dataRows,
        insertId: undefined,
        numAffectedRows: undefined,
    } as any);

    return { db, executeSpy };
}

describe('getInstructorStudentEnrollmentsData', () => {
    it('should build query with GROUP BY and STRING_AGG', async () => {
        const { db, executeSpy } = createMockDb([]);

        await getInstructorStudentEnrollmentsData({
            dbClient: db as any,
            requesterUserId: 'instructor-123',
        });

        expect(executeSpy).toHaveBeenCalledTimes(1);
        const compiledQuery = executeSpy.mock.calls[0][0];

        // Should group by student profile fields
        expect(compiledQuery.sql).toContain('group by "up"."user_id"');
        // Should aggregate enrollment IDs
        expect(compiledQuery.sql).toContain('STRING_AGG(DISTINCT e.enrollment_id::text, \', \')');
        // Should aggregate subjects
        expect(compiledQuery.sql).toContain('STRING_AGG(DISTINCT sub.subject_title, \', \')');
        // Should filter by instructor user ID
        expect(compiledQuery.sql).toContain('"cr"."user_id" = $1');
    });
});
