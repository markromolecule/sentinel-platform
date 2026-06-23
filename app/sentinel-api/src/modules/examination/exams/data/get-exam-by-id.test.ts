import { DummyDriver, Kysely, PostgresAdapter, PostgresIntrospector, PostgresQueryCompiler } from 'kysely';
import { describe, expect, it, vi } from 'vitest';
import { getExamByIdData } from './get-exam-by-id';

function createMockDb(metadataRows: any[], dataRows: any[]) {
    const db = new Kysely<any>({
        dialect: {
            createAdapter: () => new PostgresAdapter(),
            createDriver: () => new DummyDriver(),
            createIntrospector: (database) => new PostgresIntrospector(database),
            createQueryCompiler: () => new PostgresQueryCompiler(),
        },
    });

    const executeSpy = vi.spyOn(db.getExecutor(), 'executeQuery');

    executeSpy.mockResolvedValueOnce({
        rows: metadataRows,
        insertId: undefined,
        numAffectedRows: undefined,
    } as any);

    executeSpy.mockResolvedValueOnce({
        rows: dataRows,
        insertId: undefined,
        numAffectedRows: undefined,
    } as any);

    return { db, executeSpy };
}

describe('getExamByIdData', () => {
    it('includes both legacy and decoupled section assignments in the student visibility query', async () => {
        const { db, executeSpy } = createMockDb(
            [
                { column_name: 'section_id' },
                { column_name: 'section_name' },
                { column_name: 'room_id' },
            ],
            [],
        );

        await getExamByIdData({
            dbClient: db as any,
            id: 'exam-1',
            institutionId: 'institution-1',
            studentUserId: 'student-1',
        });

        const compiledQuery = executeSpy.mock.calls[1][0];

        expect(compiledQuery.sql).toContain('"e"."published_at" is not null');
        expect(compiledQuery.sql).toContain('from "exam_assigned_sections"');
        expect(compiledQuery.sql).toContain('from "exam_section_assignments"');
        expect(compiledQuery.sql).toContain('"student_cg"."section_id"');

        void db.destroy();
    });
});
