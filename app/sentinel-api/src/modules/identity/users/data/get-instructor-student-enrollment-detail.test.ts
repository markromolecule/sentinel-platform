import { describe, expect, it, vi } from 'vitest';
import { getInstructorStudentEnrollmentDetailData } from './get-instructor-student-enrollment-detail';
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
            createIntrospector: (innerDb) => new PostgresIntrospector(innerDb),
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

describe('getInstructorStudentEnrollmentDetailData', () => {
    it('should exclude archived classrooms from the instructor-scoped detail query', async () => {
        const { db, executeSpy } = createMockDb([]);

        await getInstructorStudentEnrollmentDetailData({
            dbClient: db as any,
            requesterUserId: 'instructor-123',
            targetUserId: 'student-user-123',
        });

        expect(executeSpy).toHaveBeenCalledTimes(1);
        const compiledQuery = executeSpy.mock.calls[0][0];

        expect(compiledQuery.sql).toContain('"cg"."archived_at" is null');
        expect(compiledQuery.sql).toContain('"cr"."user_id" = $2');
        expect(compiledQuery.sql).toContain('"role_scope"."role_name" = $3');
    });
});
